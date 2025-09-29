
export interface ExpressionFilter {
  name: string
  expression: string
}

export interface ParsedExpression {
  expression: string
  filters: ExpressionFilter[]
}

export const parseExpression = (fullExpression: string): ParsedExpression => {
  const parts = fullExpression
    .split(/ +[|] +/)
    .map(part => part.trim())
    .filter(part => part)

  if (parts.length === 0) {
    throw new Error('Invalid expression')
  }

  return {
    expression: parts[0] as string,
    filters: parts.slice(1).map(part => {
      const [name, expression = ''] = part.split(/:(.*)/s).map(p => p.trim())
      return { name: name as string, expression: expression as string }
    }),
  }
}

export const evalExpression = (expression: string, context: Record<string, unknown>): unknown => {
  try {
    // Create a function that takes the context keys as parameters and evaluates the expression
    const func = new Function(...Object.keys(context), `return (${expression});`)
    return func(...Object.values(context))
  } catch (error) {
    throw new Error(`Error evaluating expression "${expression}": ${(error as Error).message}`)
  }
}
