
import ConText, { type FilterFunction, type EvalNoApplyFiltersResult } from '../con-text/ConText.js'

export interface TemplateCmd {
  type: 'closure' | 'expression'
  cmd: string
  expression: string
  alts?: Record<string, TemplateCmd[]>
  children?: TemplateAST
}

type TemplateAST = (TemplateCmd | string)[]

export const parseCmd = (token: string): TemplateCmd => {
  const [, type, cmd, expression] = token.match(/^([:$])(\w*){(.*)}$/s) || []

  return {
    type: type === ':' ? 'closure' : 'expression',
    cmd: cmd as string,
    expression: expression as string,
  } as TemplateCmd
}

export const splitTokens = (template: string, { regex = /([:$]\w*{|{|})/g } = {}): TemplateAST => {
  const parts = template.split(regex)
  const result = []

  let last: string[] = []
  let diff = null

  result.push(last)

  for (const [i, value] of parts.entries()) {
    if (!(i%2)) {
      last.push(value)
    } else if (value === '}') {
      last.push(value)
      if (diff !== null) {
        diff -= 1
        if (diff === 0) {
          diff = null
          last = []
          result.push(last)
        }
      }
    } else if (value === '{' || diff) {
      last.push(value)
      if (diff !== null) diff += 1
    } else {
      last = [value]
      result.push(last)
      diff = 1
    }
  }

  return result
    .map((parts, i) => {
      const str = parts.join('')
      
      return i % 2 === 0
        ? str as string
        : parseCmd(str) as TemplateCmd
    })
    .filter(part => part)
}

export const raiseAST = (ast: TemplateAST, tt: TriskelTemplate): TemplateAST => {
  const raisedAST: TemplateAST = []
  let currentNode: TemplateCmd | null = null
  let currentNodeAlt : TemplateCmd | null = null
  const previousNodes: TemplateCmd[] = []

  ast.forEach(node => {
    if (typeof node === 'string') {
      const _cNode = currentNodeAlt || currentNode
      if (_cNode) {
        _cNode.children ||= []
        _cNode.children.push(node)
        return
      }
      raisedAST.push(node)
      return
    }

    const cmdEnd = node.expression === 'end' || node.expression === '/'
      ? node.cmd
      : (
        node.cmd === 'end'
          ? node.expression.trim() || null
          : null
      )

    if (cmdEnd) {
      if (!currentNode || (currentNode?.cmd !== cmdEnd)) {
        throw new Error(`Unexpected closing tag for command "${cmdEnd}"`)
      }
      currentNode = previousNodes.pop() || null
      currentNodeAlt = null
      return
    }

    const cmdDef = tt.cmds[node.cmd]

    if (!cmdDef) {
      throw new Error(`Command "${node.cmd}" is not defined`)
    }

    if (cmdDef.type !== node.type) {
      throw new Error(`Command "${node.cmd}" is not a ${node.type} command`)
    }

    if (node.type === 'expression') {
      const _cNode = currentNodeAlt || currentNode
      if (_cNode) {
        _cNode.children ||= []
        _cNode.children.push({ ...node })
        return
      }
      raisedAST.push({ ...node })
      return
    }

    if (currentNode && tt.cmds[currentNode.cmd]?.altCmds?.includes(node.cmd)) {
      currentNode.alts ||= {}
      currentNode.alts[node.cmd] ||= []

      currentNodeAlt = {
        type: node.type,
        cmd: node.cmd,
        expression: node.expression,
        children: [],
      }
      currentNode.alts[node.cmd]?.push(currentNodeAlt)
      return
    }

    if (currentNode) previousNodes.push(currentNode)
    currentNode = { ...node }
    raisedAST.push(currentNode)
  })

  return raisedAST
}

interface CmdFunctionOptions {
  evalExpression: (_expr: string) => unknown | Promise<unknown>
  evalExpressionNoApplyFilters: (_expr: string) => EvalNoApplyFiltersResult | Promise<EvalNoApplyFiltersResult>
  getContent: (_data: Record<string, unknown>) => string | Promise<string>
  getAlt: (_name: string) => string | Promise<string>
  next: () => string | Promise<string>
}

export interface CmdFunction {
  (_expression: string, _options: CmdFunctionOptions): unknown
}

export const evalASTsync = (ast: TemplateAST, context: ConText, tt: TriskelTemplate, alts: TemplateCmd[] | null = null): string => {
  const runCmd = (node: TemplateCmd) => {
    const cmdDef = tt.cmds[node.cmd]

    if (!cmdDef) {
      throw new Error(`Command "${node.cmd}" is not defined`)
    }

    if (cmdDef.type !== node.type) {
      throw new Error(`Command "${node.cmd}" is not a ${node.type} command`)
    }

    return cmdDef.func(node.expression, {
      evalExpression: expression => context.eval(expression),
      evalExpressionNoApplyFilters: expression => context.evalNoApplyFilters(expression),
      getContent: (data) => {
        if (cmdDef.type === 'expression') return ''

        const subContext = context.extend(data)
        return evalASTsync(node.children || [], subContext, tt)
      },
      getAlt: (name: string) => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...node.alts?.[name] || []]

        return altNode
          ? evalASTsync(altNode.children || [], context, tt, restAlts)
          : ''
      },
      next: () => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...alts || []]

        return altNode
          ? evalASTsync(altNode.children || [], context, tt, restAlts)
          : ''
      },
    })
  }

  return ast.map(node => {
    if (typeof node === 'string') return node
    return runCmd(node)
  }).join('')
}

export const evalAST = async (ast: TemplateAST, context: ConText, tt: TriskelTemplate, alts: TemplateCmd[] | null = null): Promise<string> => {
  const runCmd = async (node: TemplateCmd) => {
    const cmdDef = tt.cmds[node.cmd]

    if (!cmdDef) {
      throw new Error(`Command "${node.cmd}" is not defined`)
    }

    if (cmdDef.type !== node.type) {
      throw new Error(`Command "${node.cmd}" is not a ${node.type} command`)
    }

    return await cmdDef.func(node.expression, {
      evalExpression: async expression => await context.eval(expression),
      evalExpressionNoApplyFilters: async expression => await context.evalNoApplyFilters(expression),
      getContent: async (data) => {
        if (cmdDef.type === 'expression') return ''

        const subContext = context.extend(data)
        return await evalAST(node.children || [], subContext, tt)
      },
      getAlt: async (name: string) => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...node.alts?.[name] || []]

        return altNode
          ? await evalAST(altNode.children || [], context, tt, restAlts)
          : ''
      },
      next: async () => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...alts || []]

        return altNode
          ? await evalAST(altNode.children || [], context, tt, restAlts)
          : ''
      },
    })
  }

  const results = await Promise.all(ast.map(async node => {
    if (typeof node === 'string') return node
    return await runCmd(node)
  }))

  return results.join('')
}

export interface TriskelCmdOptions {
  type: 'closure' | 'expression'
  altCmds?: string[]
  func: CmdFunction
}

export class TriskelTemplate {
  context: ConText = new ConText()
  cmds: {
    [cmd: string]: TriskelCmdOptions
  } = {
      '' : {
        type: 'expression',
        func: (expr, { evalExpression }) => {
          return String(evalExpression(expr) || '')
        },
      },
    }

  constructor({
    cmds = {},
    filters = {},
  }: {
    cmds?: { [cmd: string]: TriskelCmdOptions | CmdFunction }
    filters?: Record<string, FilterFunction>
  } = {}) {
    Object.entries(cmds).forEach(([cmd, options]) => this.defineCmd(cmd, options))
    Object.entries(filters).forEach(([name, func]) => this.context.defineFilter(name, func))
  }

  defineCmd (cmd: string, options: TriskelCmdOptions | CmdFunction) {
    const { type = 'expression', altCmds = [], func } = typeof options === 'function'
      ? { altCmds: [], func: options }
      : options
    this.cmds[cmd] = { type, altCmds, func }
    return this
  }

  async eval (expression: string, data = {}): Promise<string> {
    const ast = raiseAST(splitTokens(expression), this)

    return await evalAST(ast, this.context.extend(data), this)
  }

  evalSync (expression: string, data = {}): string {
    const ast = raiseAST(splitTokens(expression), this)
    
    return evalASTsync(
      ast,
      this.context.extend(data),
      this,
    )
  }
}

export default TriskelTemplate
