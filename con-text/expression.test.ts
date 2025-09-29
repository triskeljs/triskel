
import {
  parseExpression,
  evalExpression,
} from './expression.js'
import { describe, test, expect } from 'vitest'

describe('parseExpression', () => {
  const result = parseExpression(" person.firstName | upper | trim: ' ' ")

  test('should parse expression correctly', () => {
    expect(result.expression).toBe('person.firstName')

    expect(result.filters).toEqual([
      { name: 'upper', expression: '' },
      { name: 'trim', expression: "' '" },
    ])
  })

  test.each([
    [' person.firstName | upper | trim: \' \' ', {
      expression: 'person.firstName',
      filters: [
        { name: 'upper', expression: '' },
        { name: 'trim', expression: "' '" },
      ],
    }],
    ['   ', new Error('Invalid expression')],
    ['', new Error('Invalid expression')],
    ['foo', { expression: 'foo', filters: [] }],
    ['foo | bar', { expression: 'foo', filters: [{ name: 'bar', expression: '' }] }],
    ['foo | bar: baz', { expression: 'foo', filters: [{ name: 'bar', expression: 'baz' }] }],
    ['foo | bar: baz | qux: quux', {
      expression: 'foo', filters: [
        { name: 'bar', expression: 'baz' },
        { name: 'qux', expression: 'quux' },
      ],
    }],
    ['  foo  |  bar  :  baz  ', { expression: 'foo', filters: [{ name: 'bar', expression: 'baz' }] }],
    ['foo | bar: baz with spaces', { expression: 'foo', filters: [{ name: 'bar', expression: 'baz with spaces' }] }],
    ['foo | bar: "baz with spaces and : colons"', { expression: 'foo', filters: [{ name: 'bar', expression: '"baz with spaces and : colons"' }] }],
    ['foo | bar: \'baz with spaces and : colons\'', { expression: 'foo', filters: [{ name: 'bar', expression: '\'baz with spaces and : colons\'' }] }],
    ['foo | bar: `baz with spaces and : colons`', { expression: 'foo', filters: [{ name: 'bar', expression: '`baz with spaces and : colons`' }] }],
  ])('parsing expression "%s"', (input, expected) => {
    if (expected instanceof Error) {
      expect(() => parseExpression(input)).toThrow(expected.message)
      return
    }

    expect(
      parseExpression(input),
    ).toEqual(expected)
  })
})

describe('evalExpression', () => {
  const context = {
    person: {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    },
    numbers: [1, 2, 3, 4, 5],
    isActive: true,
    nested: {
      value: 42,
    },
  }

  test.each([
    ['person.firstName', 'John'],
    ['person.lastName', 'Doe'],
    ['person.age', 30],
    ['numbers.length', 5],
    ['numbers[0]', 1],
    ['numbers[numbers.length - 1]', 5],
    ['isActive', true],
    ['nested.value', 42],
    ['person.firstName + " " + person.lastName', 'John Doe'],
    ['numbers.reduce((a, b) => a + b, 0)', 15],
    ['person.age > 18', true],
    ['!isActive', false], // negation
    ['numbers.map(n => n * 2)', [2, 4, 6, 8, 10]], // array map
    ['numbers.filter(n => n % 2 === 0)', [2, 4]], // array filter
    ['numbers.find(n => n > 3)', 4], // array find
    ['(function() { return person.firstName; })()', 'John'], // IIFE
    ['(function(name) { return "Hello, " + name; })(person.firstName)', 'Hello, John'], // IIFE with argument
  ])('evaluating expression "%s"', (expression, expected) => {
    if (expected instanceof Error) {
      expect(() => evalExpression(expression, context)).toThrow(expected.message)
      return
    }

    expect(
      evalExpression(expression, context),
    ).toEqual(expected)
  })

  test('should throw error for invalid expression', () => {
    expect(() => evalExpression('person..firstName', context)).toThrow('Error evaluating expression "person..firstName": Unexpected token \'.\'')
  })

  test('should throw error for undefined variable', () => {
    expect(() => evalExpression('undefinedVar + 1', context)).toThrow('Error evaluating expression "undefinedVar + 1": undefinedVar is not defined')
  })
})
