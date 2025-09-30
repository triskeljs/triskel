
import { describe, it, expect } from 'vitest'
import TriskelTemplate, { splitTokens, raiseAST, evalAST, TemplateCmd } from './TriskelTemplate.js'
import { EvalNoApplyFiltersResult } from '../con-text/ConText.js'

describe('splitTokens', () => {
  it('splits template into tokens and commands', () => {
    const template = 'Hello $name{user}!'
    const ast = splitTokens(template)
    expect(ast).toEqual([
      'Hello ',
      {
        type: 'expression',
        cmd: 'name',
        expression: 'user',
      },
      '!',
    ])
  })

  it('handles multiple commands', () => {
    const template = 'A:if{cond}B$val{foo}C'
    const ast = splitTokens(template)
    expect(ast).toEqual([
      'A',
      {
        type: 'closure',
        cmd: 'if',
        expression: 'cond',
      },
      'B',
      {
        type: 'expression',
        cmd: 'val',
        expression: 'foo',
      },
      'C',
    ])
  })

  it('handles nested braces', () => {
    const template = 'Start $cmd{a {nested} value} End'
    const ast = splitTokens(template)
    expect(ast).toEqual([
      'Start ',
      {
        type: 'expression',
        cmd: 'cmd',
        expression: 'a {nested} value',
      },
      ' End',
    ])
  })

  it('handles no commands', () => {
    const template = 'Just a plain string.'
    const ast = splitTokens(template)
    expect(ast).toEqual(['Just a plain string.'])
  })

  it('handles empty template', () => {
    const template = ''
    const ast = splitTokens(template)
    expect(ast).toEqual([])
  })

  it('handles adjacent commands', () => {
    const template = '$cmd1{val1}$cmd2{val2}'
    const ast = splitTokens(template)
    expect(ast).toEqual([
      {
        type: 'expression',
        cmd: 'cmd1',
        expression: 'val1',
      },
      {
        type: 'expression',
        cmd: 'cmd2',
        expression: 'val2',
      },
    ])
  })

  // it('ignores js string literals', () => {
  //   const template = '$cmd{ "string with } brace" } and more text'
  //   const ast = splitTokens(template)
  //   expect(ast).toEqual([
  //     {
  //       type: 'expression',
  //       cmd: 'cmd',
  //       expression: ` 'string with } brace' `,
  //     },
  //     ' and more text',
  //   ])
  // })

  // it('ignores js string expressions', () => {
  //   const template = '$cmd{ `template with ${value} and } brace` } and more text'
  //   const ast = splitTokens(template)
  //   expect(ast).toEqual([
  //     {
  //       type: 'expression',
  //       cmd: 'cmd',
  //       expression: ' `template with ${value} and } brace` ',
  //     },
  //     ' and more text',
  //   ])
  // })
})

describe('raiseAST', () => {
  it('raises AST and nests closures', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: () => '',
    })
    const ast = splitTokens(':if{cond}Hello:end{if}')
    
    expect(() => raiseAST(ast, tpl)).not.toThrow()

    const raised = raiseAST(ast, tpl)
    expect(raised).toEqual([
      {
        type: 'closure',
        cmd: 'if',
        expression: 'cond',
        children: ['Hello'],
      },
    ])
  })

  it('throws error for unexpected closing tag', () => {
    const tpl = new TriskelTemplate()
    const ast = splitTokens(':end{foo}')
    expect(() => raiseAST(ast, tpl)).toThrow(/Unexpected closing tag/)
  })

  it('raises AST and nests closures with alternative ending "/"', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: () => '',
      altCmds: ['else'],
    })
    tpl.defineCmd('else', {
      type: 'closure',
      func: () => '',
    })
    const ast = splitTokens(':if{cond}Yes :if{/} lalala')
    
    expect(() => raiseAST(ast, tpl)).not.toThrow()

    const raised = raiseAST(ast, tpl)
    expect(raised).toEqual([
      {
        type: 'closure',
        cmd: 'if',
        expression: 'cond',
        children: [
          'Yes ',
        ],
      },
      ' lalala'
    ])
  })

  it('raises AST and nests closures with alternative ending {end}', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: () => '',
      altCmds: ['else'],
    })
    tpl.defineCmd('else', {
      type: 'closure',
      func: () => '',
    })
    const ast = splitTokens(':if{cond}Yes :else{elseCond} No :if{end} lalala')
    
    expect(() => raiseAST(ast, tpl)).not.toThrow()

    const raised = raiseAST(ast, tpl)
    expect(raised).toEqual([
      {
        type: 'closure',
        cmd: 'if',
        expression: 'cond',
        children: [
          'Yes ',
        ],
        alts: {
          else: [
            {
              type: 'closure',
              cmd: 'else',
              expression: 'elseCond',
              children: [
                ' No ',
              ],
            },
          ],
        },
      },
      ' lalala'
    ])
  })
})

describe('TriskelTemplate', () => {
  it('defines and evaluates simple expression command', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('firstName', {
      type: 'expression',
      func: (expr, { evalExpression }) => (evalExpression(expr) as { firstName: string })['firstName'] || '',
    })
    const result = tpl.evalSync('Hi $firstName{person}', { person: { firstName: 'Alice' } })
    expect(result).toBe('Hi Alice')
  })

  it('defines and evaluates simple closure command', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: (expr, { evalExpression, getContent }) => evalExpression(expr) ? getContent({}) : '',
    })
    const result = tpl.evalSync(':if{true}Hello:end{if}')
    expect(result).toBe('Hello')
  })

  it('handles nested closures', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: (expr, { evalExpression, getContent }) => evalExpression(expr) ? getContent({}) : '',
    })
    const result = tpl.evalSync(':if{true}Yes :if{false}No:end{if} End:end{if}')
    expect(result).toBe('Yes  End')
  })

  it('evaluates expression with filters', () => {
    const tpl = new TriskelTemplate({
      filters: {
        upper: (str: unknown) => String(str).toUpperCase(),
      },
    })
    tpl.defineCmd('greet', {
      type: 'expression',
      func: (expr, { evalExpression }) => `Hello ${evalExpression(expr) || ''}!`,
    })
    
    expect(
      tpl.evalSync('$greet{name | upper}', { name: 'world' })
    ).toBe('Hello WORLD!')
  })

  it('evaluates expression with post-filters', () => {
    const tpl = new TriskelTemplate({
      filters: {
        upper: (str: unknown) => String(str).toUpperCase(),
      },
    })
    tpl.defineCmd('greet', {
      type: 'expression',
      func: (expr, { evalExpressionNoApplyFilters }) => {
        const { result, applyFilters } = evalExpressionNoApplyFilters(expr) as EvalNoApplyFiltersResult

        return applyFilters(`Hello ${result}!`)
      },
    })
    
    expect(
      tpl.evalSync('$greet{name | upper}', { name: 'world' })
    ).toBe('HELLO WORLD!')
  })

  it('throws error for undefined command', () => {
    const tpl = new TriskelTemplate()
    expect(() => tpl.evalSync('$unknown{expr}')).toThrow('Command "unknown" is not defined')
  })

  it('throws error for mismatched closure tags', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: () => '',
    })
    expect(() => tpl.evalSync(':if{true}Hello:end{wrong}')).toThrow('Unexpected closing tag for command "wrong"')
  })

  it('handles empty template', () => {
    const tpl = new TriskelTemplate()
    const result = tpl.evalSync('')
    expect(result).toBe('')
  })

  it('handles template with no commands', () => {
    const tpl = new TriskelTemplate()
    const result = tpl.evalSync('Just a plain string.')
    expect(result).toBe('Just a plain string.')
  })

  it('handles adjacent commands', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('cmd1', {
      type: 'expression',
      func: (expr) => `C1:${expr}`,
    })
    tpl.defineCmd('cmd2', {
      type: 'expression',
      func: (expr) => `C2:${expr}`,
    })
    const result = tpl.evalSync('$cmd1{val1}$cmd2{val2}')
    expect(result).toBe('C1:val1C2:val2')
  })
  
  it('handles complex nested template', () => {
    const tpl = new TriskelTemplate({
      filters: {
        upper: (str: unknown) => String(str).toUpperCase(),
      },
    })
    tpl.defineCmd('if', {
      type: 'closure',
      func: (expr, { evalExpression, getContent }) => evalExpression(expr) ? getContent({}) : '',
    })
    tpl.defineCmd('greet', {
      type: 'expression',
      func: (expr, { evalExpression }) => `Hello ${String(evalExpression(expr) || '')}!`,
    })

    const template = ':if{showGreeting}$greet{name | upper}:end{if} Have a nice day.'
    const result = tpl.evalSync(template, { showGreeting: true, name: 'alice' })
    expect(result).toBe('Hello ALICE! Have a nice day.')
  })

  it('throws error for invalid command type', () => {
    const tpl = new TriskelTemplate()
    // @ts-expect-error Testing invalid command type
    tpl.defineCmd('badCmd', { type: 'invalid', func: () => '' })
    const ast = splitTokens('$badCmd{expr}')
    expect(() => raiseAST(ast, tpl)).toThrow('Command "badCmd" is not a expression command')
  })

  it('throws error for command function throwing error', () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('errorCmd', {
      type: 'expression',
      func: () => { throw new Error('Command error') },
    })
    expect(() => tpl.evalSync('$errorCmd{expr}')).toThrow('Command error')
  })

  it('resolves async command', async () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('asyncCmd', {
      type: 'expression',
      func: async (expr) => `Async:${expr}`,
    })
    const result = await tpl.eval('$asyncCmd{test}')
    expect(result).toBe('Async:test')
  })

  it('resolves async closure command', async () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('asyncIf', {
      type: 'closure',
      func: async (expr, { evalExpression, getContent }) => await evalExpression(expr) ? await getContent({}) : '',
    })
    const result = await tpl.eval(':asyncIf{true}Hello Async:end{asyncIf}')
    expect(result).toBe('Hello Async')
  })

  it('resolves async nested commands', async () => {
    const tpl = new TriskelTemplate()
    tpl.defineCmd('if', {
      type: 'closure',
      func: async (expr, { evalExpression, getContent }) => await evalExpression(expr) ? await getContent({}) : '',
    })
    tpl.defineCmd('asyncGreet', {
      type: 'expression',
      func: async (expr, { evalExpression }) => `Hello ${String(await evalExpression(expr) || '')}!`,
    })
    const template = ':if{showGreeting}$asyncGreet{name}:end{if} Welcome!'
    const result = await tpl.eval(template, { showGreeting: true, name: 'Bob' })
    expect(result).toBe('Hello Bob! Welcome!')
  })
})
