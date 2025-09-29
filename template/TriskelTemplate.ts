
import ConText, { type FilterFunction } from '../con-text/ConText.js'

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
  const previousNodes: TemplateCmd[] = []

  ast.forEach(node => {
    if (typeof node === 'string') {
      if (currentNode) {
        currentNode.children ||= []
        currentNode.children.push(node)
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
      if (currentNode) {
        currentNode.children ||= []
        currentNode.children.push({ ...node })
        return
      }
      raisedAST.push({ ...node })
      return
    }

    if (currentNode && tt.cmds[currentNode.cmd]?.altCmds?.includes(node.cmd)) {
      currentNode.alts ||= {}
      currentNode.alts[node.cmd] ||= []
      currentNode.alts[node.cmd]?.push({
        type: node.type,
        cmd: node.cmd,
        expression: node.expression,
        children: [],
      } as TemplateCmd)

      return
    }

    if (currentNode) previousNodes.push(currentNode)
    currentNode = { ...node }
    raisedAST.push(currentNode)
  })

  return raisedAST
}

interface CmdFunctionOptions {
  evalExpression: (_expr: string) => unknown
  getContent: (_data: Record<string, unknown>) => string
  getAlt: (_name: string) => string
  next: () => string
}

export interface CmdFunction {
  (_expression: string, _options: CmdFunctionOptions): unknown
}

export const evalAST = (ast: TemplateAST, context: ConText, tt: TriskelTemplate, alts: TemplateCmd[] | null = null): string => {
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
      getContent: (data) => {
        if (cmdDef.type === 'expression') return ''

        const subContext = context.extend(data)
        return evalAST(node.children || [], subContext, tt)
      },
      getAlt: (name: string) => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...node.alts?.[name] || []]

        return altNode
          ? evalAST(altNode.children || [], context, tt, restAlts)
          : ''
      },
      next: () => {
        if (cmdDef.type === 'expression') return ''

        const [altNode, ...restAlts] = [...alts || []]

        return altNode
          ? evalAST(altNode.children || [], context, tt, restAlts)
          : ''
      },
    })
  }

  return ast.map(node => {
    if (typeof node === 'string') return node
    return runCmd(node)
  }).join('')
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

  eval (expression: string, context: ConText | Record<string, unknown> = {}): string {
    const ast = raiseAST(splitTokens(expression), this)
    const _context = context instanceof ConText ? context : new ConText(context)

    return evalAST(
      ast,
      _context,
      this,
    )
  }
}

export default TriskelTemplate
