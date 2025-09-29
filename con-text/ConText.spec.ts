
import ConText from './ConText.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('ConText', () => {
  let context: ConText

  beforeEach(() => {
    context = new ConText()
  })

  it('should create an instance', () => {
    expect(context).toBeInstanceOf(ConText)
  })

  it('should evaluate a simple expression', () => {
    context.data = { person: { firstName: 'John', lastName: 'Doe' } }
    const result = context.eval('person.firstName')
    expect(result).toBe('John')
  })

  it('should apply a filter', () => {
    context.data = { person: { firstName: 'John', lastName: 'Doe' } }
    context.defineFilter('upper', (str) => (typeof str === 'string' ? str.toUpperCase() : str))
    const result = context.eval('person.firstName | upper')
    expect(result).toBe('JOHN')
  })

  it('should apply multiple filters', () => {
    context.data = { person: { firstName: '  John  ', lastName: 'Doe' } }
    context.defineFilter('upper', (str) => (typeof str === 'string' ? str.toUpperCase() : str))
    context.defineFilter('trim', (str) => (typeof str === 'string' ? str.trim() : str))
    const result = context.eval('person.firstName | trim | upper')
    expect(result).toBe('JOHN')
  })

  it('should throw an error for undefined filter', () => {
    context.data = { person: { firstName: 'John', lastName: 'Doe' } }
    expect(() => context.eval('person.firstName | unknownFilter')).toThrow('Filter "unknownFilter" is not defined')
  })
})

describe('ConText extend', () => {
  it('should extend context with new data', () => {
    const baseContext = new ConText({ a: 1, b: 2 })
    const extendedContext = baseContext.extend({ b: 3, c: 4 })

    expect(extendedContext.data).toEqual({ b: 3, c: 4 })
    expect(extendedContext.toPlainObject()).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should retain filters in extended context', () => {
    const baseContext = new ConText({ a: 1 }, {
      filters: {
        double: (x) => (typeof x === 'number' ? x * 2 : x),
      },
    })
    const extendedContext = baseContext.extend({ b: 2 })

    const result = extendedContext.eval('b | double')
    expect(result).toBe(4)
  })

  it('should create a new instance when extending', () => {
    const baseContext = new ConText({ a: 1 })
    const extendedContext = baseContext.extend({ b: 2 })

    expect(extendedContext).toBeInstanceOf(ConText)
    expect(extendedContext).not.toBe(baseContext)
  })

  it('should handle multiple levels of extension', () => {
    const baseContext = new ConText({ a: 1 })
    const extendedContext1 = baseContext.extend({ b: 2 })
    const extendedContext2 = extendedContext1.extend({ c: 3 })

    expect(extendedContext2.toPlainObject()).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should not modify the original context when extending', () => {
    const baseContext = new ConText({ a: 1, b: 2 })
    const extendedContext = baseContext.extend({ b: 3, c: 4 })

    expect(baseContext.data).toEqual({ a: 1, b: 2 })
    expect(extendedContext.data).toEqual({ b: 3, c: 4 })
  })

  // it('should work with nested data structures', () => {
  //   const baseContext = new ConText({ user: { name: 'Alice', age: 30 } })
  //   const extendedContext = baseContext.extend({ user: { age: 31, city: 'Wonderland' } })

  //   expect(extendedContext.toPlainObject()).toEqual({
  //     user: { name: 'Alice', age: 31, city: 'Wonderland' },
  //   })
  // })
})

describe('ConText filters', () => {
  it('should apply filters correctly', () => {
    const context = new ConText({ name: 'Alice', age: 30 })

    context.defineFilter('upper', (str) => (typeof str === 'string' ? str.toUpperCase() : str))
    context.defineFilter('double', (num) => (typeof num === 'number' ? num * 2 : num))

    const result1 = context.eval('name | upper')
    const result2 = context.eval('age | double')

    expect(result1).toBe('ALICE')
    expect(result2).toBe(60)
  })


  it('should throw an error for undefined filters', () => {
    const context = new ConText({ name: 'Alice' })

    expect(() => context.eval('name | unknownFilter')).toThrow('Filter "unknownFilter" is not defined')
  })

  it('should handle multiple filters in sequence', () => {
    const context = new ConText({ name: '  Alice  ' })

    context.defineFilter('trim', (str) => (typeof str === 'string' ? str.trim() : str))
    context.defineFilter('removeAli', (str => (typeof str === 'string' ? str.replace(/^Ali/, '') : str)))
    context.defineFilter('upper', (str) => (typeof str === 'string' ? str.toUpperCase() : str))

    expect(
      context.eval('name | trim | upper'),
    ).toBe('ALICE')

    expect(
      context.eval('name | trim | removeAli | upper'),
    ).toBe('CE')

    expect(
      context.eval('name | trim | upper | removeAli'),
    ).toBe('ALICE')
  })

  it('should work with filters that return non-string/number types', () => {
    const context = new ConText({ items: [1, 2, 3] })

    context.defineFilter('first', (arr) => (Array.isArray(arr) ? arr[0] : arr))
    context.defineFilter('toString', (val) => (val !== null && val !== undefined ? String(val) : val))

    expect(
      context.eval('items | first | toString'),
    ).toBe('1')
  })

  it('should pass the context data to filters if needed', () => {
    const context = new ConText({ value: 5, multiplier: 3 })

    context.defineFilter('multiply', (value, num) => Number(value) * Number(num))

    expect(
      context.eval('value | multiply: 5'),
    ).toBe(25)

    expect(
      context.eval('value | multiply: multiplier'),
    ).toBe(15)
  })

  it('should handle filters nested filters that dont override the parent context', () => {
    const context = new ConText({ value: 5, multiplier: 3 })

    context.defineFilter('multiply', (value, num) => Number(value) * Number(num))

    const nestedContext = context.extend({ multiplier: 4 })

    expect(
      nestedContext.eval('value | multiply: 5'),
    ).toBe(25)

    expect(
      nestedContext.eval('value | multiply: multiplier'),
    ).toBe(20)

    expect(
      context.eval('value | multiply: multiplier'),
    ).toBe(15)
  })

  it('should handle filters with complex expressions', () => {
    const context = new ConText({ a: 10, b: 20 })

    context.defineFilter('add', (value, num) => Number(value) + Number(num))
    context.defineFilter('multiply', (value, num) => Number(value) * Number(num))

    expect(
      context.eval('a | add: b | multiply: 2'),
    ).toBe(60) // (10 + 20) * 2 = 60

    expect(
      context.eval('a | multiply: 2 | add: b'),
    ).toBe(40) // (10 * 2) + 20 = 40
  })

  it('should handle errors in filter functions gracefully', () => {
    const context = new ConText({ value: 5 })

    context.defineFilter('errorFilter', () => {
      throw new Error('Intentional error in filter')
    })

    expect(() => context.eval('value | errorFilter')).toThrow('Intentional error in filter')
  })

  it('should define filters in nested contexts without affecting the parent context', () => {
    const parentContext = new ConText({ value: 10 })
    parentContext.defineFilter('add', (val, num) => Number(val) + Number(num))
    parentContext.defineFilter('foo', (val) => `bar:${val}`)

    const childContext = parentContext.extend({})
    childContext.defineFilter('foo', (val) => `baz:${val}`)
    childContext.defineFilter('multiply', (val, num) => Number(val) * Number(num))

    expect(childContext.eval('value | add: 5')).toBe(15) // From parent context
    expect(childContext.eval('value | multiply: 3')).toBe(30) // From child context
    expect(() => parentContext.eval('value | multiply: 3')).toThrow('Filter "multiply" is not defined') // multiply not in parent

    expect(parentContext.eval('value | foo')).toBe('bar:10') // foo from parent context
    expect(childContext.eval('value | foo')).toBe('baz:10') // foo from child context
  })
})
