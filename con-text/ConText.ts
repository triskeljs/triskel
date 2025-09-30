

import {
  parseExpression,
  evalExpression,
  type ExpressionFilter,
} from './expression.js'

export interface FilterFunction {
  (_: unknown, _context?: unknown): unknown
}

export function getPlainObject (obj: Record<string, unknown>): Record<string, unknown> {
  const proto = Object.getPrototypeOf(obj)

  return proto
    ? { ...getPlainObject(proto), ...obj }
    : { ...obj }
}

export type EvalNoApplyFiltersResult = {
  result: unknown,
  applyFilters: (_value: unknown) => unknown
}

export class ConText {
  data: Record<string, unknown>
  filters: Record<string, FilterFunction> = {}
  parent?: ConText | undefined = undefined

  constructor(data = {}, {
    filters = {},
    parent = undefined,
  }: {
    filters?: Record<string, FilterFunction>
    parent?: ConText
  } = {}) {
    this.data = data
    this.filters = filters
    this.parent = parent
  }

  extend (data: Record<string, unknown>) {
    return new ConText(
      Object.assign(Object.create(this.data), data),
      {
        filters: Object.create(this.filters),
        parent: this,
      },
    )
  }

  toPlainObject () {
    return getPlainObject(this.data)
  }

  getKeys () {
    return Object.keys(this.toPlainObject())
  }

  defineFilter (name: string, func: FilterFunction) {
    this.filters[name] = func
  }

  applyFilters (value: unknown, filters: ExpressionFilter[]): unknown {
    return filters.reduce((acc, filter) => {
      const filterFunc = this.filters[filter.name] || this.toPlainObject()[filter.name] as FilterFunction
      if (!filterFunc) {
        throw new Error(`Filter "${filter.name}" is not defined`)
      }
      const filterData = filter.expression ? evalExpression(filter.expression, this.toPlainObject()) : undefined
      return filterFunc(acc, filterData as Record<string, unknown>)
    }, value)
  }

  eval (fullExpression: string): unknown {
    const { expression, filters } = parseExpression(fullExpression)
    const plainData = this.toPlainObject()
    const result = evalExpression(expression, plainData)

    return this.applyFilters(result, filters)
  }

  evalNoApplyFilters (fullExpression: string): EvalNoApplyFiltersResult {
    const { expression, filters } = parseExpression(fullExpression)
    const plainData = this.toPlainObject()
    const result = evalExpression(expression, plainData)

    return {
      result,
      applyFilters: (value: unknown) => this.applyFilters(value, filters),
    }
  }
}

export default ConText
