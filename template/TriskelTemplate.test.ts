
import { describe, it, expect } from 'vitest'
import TriskelTemplate, { splitTokens, raiseAST, evalAST, TemplateCmd } from './TriskelTemplate.js'

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
      func: (expr, { evalExpression }) => `Hello ${String(evalExpression(expr) || '')}!`,
    })
    
    expect(
      tpl.evalSync('$greet{name | upper}', { name: 'world' })
    ).toBe('Hello WORLD!')
  })
})
