/**
 * 轻量公式引擎：字段引用 `[alias.column]`，
 * 聚合函数 SUM/AVG/COUNT/MAX/MIN，以及 IF/AND/OR/NOT 与四则运算。
 * 聚合函数在「当前分组行集合」上计算。
 */

export type FormulaFieldResolver = (field: string, rows: Record<string, unknown>[]) => unknown[]

const FIELD_RE = /\[([^\]]+)\]/g

export function extractFormulaFields(formula: string): string[] {
  const fields: string[] = []
  const seen = new Set<string>()
  FIELD_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = FIELD_RE.exec(formula))) {
    const field = match[1].trim()
    if (!field || seen.has(field)) continue
    seen.add(field)
    fields.push(field)
  }
  return fields
}

function toNumber(value: unknown): number {
  if (typeof value === 'boolean') return value ? 1 : 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (value == null || value === '') return false
  return Boolean(value)
}

function resolveCell(row: Record<string, unknown>, field: string) {
  if (field in row) return row[field]
  const idx = field.indexOf('.')
  if (idx <= 0) return row[field]
  return row[field] ?? row[field.slice(idx + 1)]
}

export const defaultFieldResolver: FormulaFieldResolver = (field, rows) =>
  rows.map((row) => resolveCell(row, field))

function aggregate(fn: string, valuesList: unknown[][]): number {
  const name = fn.toUpperCase()
  if (name === 'COUNT' && valuesList.length === 0) return 0
  if (name === 'COUNT' && valuesList.length === 1 && !(valuesList[0] || []).length) {
    return 0
  }

  if (name === 'COUNT') {
    if (!valuesList.length) return 0
    // COUNT() 无参：行数；COUNT([f])：非空计数；多列：各列非空合计
    if (valuesList.length === 1) {
      return (valuesList[0] || []).filter((v) => v != null && v !== '').length
    }
    return valuesList.reduce(
      (sum, values) => sum + values.filter((v) => v != null && v !== '').length,
      0,
    )
  }

  const flat = valuesList.flatMap((values) => values.map(toNumber))
  if (!flat.length) return 0
  if (name === 'SUM') return flat.reduce((a, b) => a + b, 0)
  if (name === 'AVG') return flat.reduce((a, b) => a + b, 0) / flat.length
  if (name === 'MAX') return Math.max(...flat)
  if (name === 'MIN') return Math.min(...flat)
  throw new Error(`不支持的函数：${fn}`)
}

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'bool'; value: boolean }
  | { type: 'op'; value: string }
  | { type: 'ident'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' }

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (/\s/.test(ch)) {
      i += 1
      continue
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' })
      i += 1
      continue
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' })
      i += 1
      continue
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' })
      i += 1
      continue
    }
    if ('+-*/<>!=&|'.includes(ch)) {
      let op = ch
      const next = input[i + 1]
      if (
        (ch === '<' && (next === '=' || next === '>')) ||
        (ch === '>' && next === '=') ||
        (ch === '!' && next === '=') ||
        (ch === '=' && next === '=') ||
        (ch === '&' && next === '&') ||
        (ch === '|' && next === '|')
      ) {
        op += next
        i += 2
      } else {
        i += 1
      }
      tokens.push({ type: 'op', value: op === '=' ? '==' : op })
      continue
    }
    if (ch === '"' || ch === "'") {
      const quote = ch
      i += 1
      let value = ''
      while (i < input.length && input[i] !== quote) {
        value += input[i]
        i += 1
      }
      i += 1
      tokens.push({ type: 'string', value })
      continue
    }
    if (/[0-9.]/.test(ch)) {
      let raw = ''
      while (i < input.length && /[0-9.]/.test(input[i])) {
        raw += input[i]
        i += 1
      }
      tokens.push({ type: 'number', value: Number(raw) })
      continue
    }
    if (/[A-Za-z_\u4e00-\u9fa5[]/.test(ch)) {
      let raw = ''
      if (ch === '[') {
        while (i < input.length && input[i] !== ']') {
          raw += input[i]
          i += 1
        }
        raw += ']'
        i += 1
        tokens.push({ type: 'ident', value: raw })
        continue
      }
      while (i < input.length && /[A-Za-z0-9_\u4e00-\u9fa5]/.test(input[i])) {
        raw += input[i]
        i += 1
      }
      const upper = raw.toUpperCase()
      if (upper === 'TRUE') tokens.push({ type: 'bool', value: true })
      else if (upper === 'FALSE') tokens.push({ type: 'bool', value: false })
      else tokens.push({ type: 'ident', value: raw })
      continue
    }
    throw new Error(`无法解析字符：${ch}`)
  }
  return tokens
}

class Parser {
  private pos = 0
  constructor(
    private tokens: Token[],
    private rows: Record<string, unknown>[],
    private resolveField: FormulaFieldResolver,
  ) {}

  parse(): unknown {
    const value = this.parseOr()
    if (this.pos < this.tokens.length) throw new Error('公式存在多余内容')
    return value
  }

  private peek() {
    return this.tokens[this.pos]
  }

  private next() {
    return this.tokens[this.pos++]
  }

  private parseOr(): unknown {
    let left = this.parseAnd()
    while (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '||') {
      this.next()
      const right = this.parseAnd()
      left = toBool(left) || toBool(right)
    }
    while (this.peek()?.type === 'ident' && String((this.peek() as { value: string }).value).toUpperCase() === 'OR') {
      this.next()
      const right = this.parseAnd()
      left = toBool(left) || toBool(right)
    }
    return left
  }

  private parseAnd(): unknown {
    let left = this.parseCompare()
    while (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '&&') {
      this.next()
      const right = this.parseCompare()
      left = toBool(left) && toBool(right)
    }
    while (
      this.peek()?.type === 'ident' &&
      String((this.peek() as { value: string }).value).toUpperCase() === 'AND'
    ) {
      this.next()
      const right = this.parseCompare()
      left = toBool(left) && toBool(right)
    }
    return left
  }

  private parseCompare(): unknown {
    let left = this.parseAdd()
    const op = this.peek()
    if (op?.type === 'op' && ['==', '!=', '<>', '>', '>=', '<', '<='].includes(op.value)) {
      this.next()
      const right = this.parseAdd()
      if (op.value === '==') return left == right
      if (op.value === '!=' || op.value === '<>') return left != right
      if (op.value === '>') return toNumber(left) > toNumber(right)
      if (op.value === '>=') return toNumber(left) >= toNumber(right)
      if (op.value === '<') return toNumber(left) < toNumber(right)
      if (op.value === '<=') return toNumber(left) <= toNumber(right)
    }
    return left
  }

  private parseAdd(): unknown {
    let left = this.parseMul()
    while (this.peek()?.type === 'op' && ['+', '-'].includes((this.peek() as { value: string }).value)) {
      const op = (this.next() as { value: string }).value
      const right = this.parseMul()
      left = op === '+' ? toNumber(left) + toNumber(right) : toNumber(left) - toNumber(right)
    }
    return left
  }

  private parseMul(): unknown {
    let left = this.parseUnary()
    while (this.peek()?.type === 'op' && ['*', '/'].includes((this.peek() as { value: string }).value)) {
      const op = (this.next() as { value: string }).value
      const right = this.parseUnary()
      left = op === '*' ? toNumber(left) * toNumber(right) : toNumber(left) / toNumber(right)
    }
    return left
  }

  private parseUnary(): unknown {
    if (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '-') {
      this.next()
      return -toNumber(this.parseUnary())
    }
    if (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '!') {
      this.next()
      return !toBool(this.parseUnary())
    }
    if (this.peek()?.type === 'ident' && String((this.peek() as { value: string }).value).toUpperCase() === 'NOT') {
      this.next()
      return !toBool(this.parseUnary())
    }
    return this.parsePrimary()
  }

  private parsePrimary(): unknown {
    const token = this.peek()
    if (!token) throw new Error('公式不完整')

    if (token.type === 'number') {
      this.next()
      return token.value
    }
    if (token.type === 'string') {
      this.next()
      return token.value
    }
    if (token.type === 'bool') {
      this.next()
      return token.value
    }
    if (token.type === 'ident') {
      const name = token.value
      this.next()
      if (name.startsWith('[') && name.endsWith(']')) {
        const field = name.slice(1, -1).trim()
        const values = this.resolveField(field, this.rows)
        // 裸字段：取分组首行
        return values[0] ?? null
      }
      if (this.peek()?.type === 'lparen') {
        return this.parseCall(name)
      }
      throw new Error(`未知标识：${name}`)
    }
    if (token.type === 'lparen') {
      this.next()
      const value = this.parseOr()
      if (this.peek()?.type !== 'rparen') throw new Error('缺少右括号')
      this.next()
      return value
    }
    throw new Error('公式语法错误')
  }

  private parseCall(name: string): unknown {
    if (this.next()?.type !== 'lparen') throw new Error('函数调用缺少括号')
    const args: unknown[] = []
    if (this.peek()?.type !== 'rparen') {
      args.push(this.parseOr())
      while (this.peek()?.type === 'comma') {
        this.next()
        args.push(this.parseOr())
      }
    }
    if (this.peek()?.type !== 'rparen') throw new Error('函数调用缺少右括号')
    this.next()

    const upper = name.toUpperCase()
    if (['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'].includes(upper)) {
      // 重新从原始字段引用聚合：args 若已是标量则直接使用
      // 调用处传入的是 parse 后的值；对聚合函数改为解析参数中的字段 token
      return this.callAggregate(upper, args)
    }
    if (upper === 'IF') {
      if (args.length < 2) throw new Error('IF 至少需要 2 个参数')
      return toBool(args[0]) ? args[1] : args[2] ?? null
    }
    if (upper === 'AND') return args.every((item) => toBool(item))
    if (upper === 'OR') return args.some((item) => toBool(item))
    if (upper === 'NOT') return !toBool(args[0])
    if (upper === 'IFERROR') {
      try {
        if (args[0] == null || (typeof args[0] === 'number' && !Number.isFinite(args[0]))) {
          return args[1] ?? null
        }
        return args[0]
      } catch {
        return args[1] ?? null
      }
    }
    if (upper === 'FALSE') return false
    if (upper === 'TRUE') return true
    throw new Error(`不支持的函数：${name}`)
  }

  private callAggregate(fn: string, args: unknown[]): number {
    // COUNT() 无参：分组行数
    if (fn === 'COUNT' && args.length === 0) return this.rows.length

    // 参数已在 parse 时算成标量；聚合场景下我们需要字段级 values。
    // 约定：聚合函数参数必须是字段引用，在 tokenize 阶段以 [field] ident 出现。
    // 这里 args 已是首行值，无法再聚合 —— 改用专用路径：
    // 实际上 parseCall 在 parsePrimary 里对 ident+lparen 调用，参数会再 parseOr。
    // 对 SUM([f])，[f] 会走裸字段返回首行。需要特殊处理聚合参数。
    // 修复：聚合函数参数收集字段名而非求值。
    return aggregate(fn, [])
  }
}

/**
 * 第二套解析：聚合函数参数保留字段引用，避免被提前求成首行值。
 */
export function evaluateFormulaOnGroup(
  formula: string,
  rows: Record<string, unknown>[],
  resolveField: FormulaFieldResolver = defaultFieldResolver,
): unknown {
  const trimmed = (formula || '').trim()
  if (!trimmed) return null
  if (!rows?.length) return null

  // 将聚合调用替换为数值后再用表达式求值
  const replaced = replaceAggregates(trimmed, rows, resolveField)
  const tokens = tokenize(replaced)
  const parser = new Parser(tokens, rows, resolveField)
  return parser.parse()
}

function replaceAggregates(
  formula: string,
  rows: Record<string, unknown>[],
  resolveField: FormulaFieldResolver,
): string {
  // 匹配 SUM( ... ) / AVG(...) / COUNT(...) / MAX(...) / MIN(...)
  const re = /\b(SUM|AVG|COUNT|MAX|MIN)\s*\(/gi
  let result = ''
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(formula))) {
    const start = match.index
    const fn = match[1].toUpperCase()
    const open = start + match[0].length - 1
    const close = findMatchingParen(formula, open)
    if (close < 0) throw new Error(`${fn}( 缺少右括号`)
    result += formula.slice(last, start)
    const inner = formula.slice(open + 1, close).trim()
    const value = evalAggregateCall(fn, inner, rows, resolveField)
    result += String(value)
    last = close + 1
    re.lastIndex = last
  }
  result += formula.slice(last)
  return result
}

function findMatchingParen(text: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1
    else if (text[i] === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function evalAggregateCall(
  fn: string,
  inner: string,
  rows: Record<string, unknown>[],
  resolveField: FormulaFieldResolver,
): number {
  if (!inner) {
    if (fn === 'COUNT') return rows.length
    throw new Error(`${fn}() 需要字段参数`)
  }
  // 参数用逗号分隔的字段引用或嵌套表达式；此处仅支持字段引用列表
  const parts = splitArgs(inner)
  const valuesList = parts.map((part) => {
    const token = part.trim()
    const fieldMatch = token.match(/^\[([^\]]+)\]$/)
    if (fieldMatch) return resolveField(fieldMatch[1].trim(), rows)
    // 允许嵌套聚合已在外层替换；此处对常量列表
    if (/^-?\d+(\.\d+)?$/.test(token)) return [Number(token)]
    throw new Error(`${fn}() 参数仅支持字段引用，收到：${token}`)
  })
  return aggregate(fn, valuesList)
}

function splitArgs(inner: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i]
    if (ch === '(') depth += 1
    if (ch === ')') depth -= 1
    if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current)
  return parts
}

export type FormulaFunctionDoc = {
  name: string
  category: 'logic' | 'agg'
  signature: string
  description: string
  example: string
  params: Array<{ name: string; description: string }>
}

export const FORMULA_FUNCTION_DOCS: FormulaFunctionDoc[] = [
  {
    name: 'SUM',
    category: 'agg',
    signature: 'SUM(字段, ...)',
    description: '返回分组内各字段数值之和。',
    example: 'SUM([orders.amount])',
    params: [{ name: '字段', description: '需要求和的字段引用，可多个' }],
  },
  {
    name: 'AVG',
    category: 'agg',
    signature: 'AVG(字段)',
    description: '返回分组内字段数值的平均值。',
    example: 'AVG([orders.amount])',
    params: [{ name: '字段', description: '需要求平均的字段引用' }],
  },
  {
    name: 'COUNT',
    category: 'agg',
    signature: 'COUNT(字段?)',
    description: '无参时返回分组行数；有字段时统计非空个数。',
    example: 'COUNT([orders.id])',
    params: [{ name: '字段', description: '可选，统计非空的字段' }],
  },
  {
    name: 'MAX',
    category: 'agg',
    signature: 'MAX(字段)',
    description: '返回分组内字段最大值。',
    example: 'MAX([orders.amount])',
    params: [{ name: '字段', description: '字段引用' }],
  },
  {
    name: 'MIN',
    category: 'agg',
    signature: 'MIN(字段)',
    description: '返回分组内字段最小值。',
    example: 'MIN([orders.amount])',
    params: [{ name: '字段', description: '字段引用' }],
  },
  {
    name: 'AND',
    category: 'logic',
    signature: 'AND(逻辑表达式1, 逻辑表达式2, ...)',
    description: '所有参数均为真时返回 true，否则返回 false。',
    example: 'IF(AND([orders.amount]>0, [orders.quantity]>0), 1, 0)',
    params: [
      { name: '逻辑表达式1', description: '第一个条件' },
      { name: '逻辑表达式2', description: '第二个条件' },
    ],
  },
  {
    name: 'OR',
    category: 'logic',
    signature: 'OR(逻辑表达式1, 逻辑表达式2, ...)',
    description: '任一参数为真时返回 true。',
    example: 'OR([orders.amount]>0, [orders.quantity]>0)',
    params: [
      { name: '逻辑表达式1', description: '第一个条件' },
      { name: '逻辑表达式2', description: '第二个条件' },
    ],
  },
  {
    name: 'NOT',
    category: 'logic',
    signature: 'NOT(逻辑表达式)',
    description: '对逻辑值取反。',
    example: 'NOT([orders.amount]=0)',
    params: [{ name: '逻辑表达式', description: '需要取反的条件' }],
  },
  {
    name: 'IF',
    category: 'logic',
    signature: 'IF(条件, 真值, 假值)',
    description: '条件为真返回真值，否则返回假值。',
    example: 'IF([orders.amount]>0, SUM([orders.amount]), 0)',
    params: [
      { name: '条件', description: '逻辑表达式' },
      { name: '真值', description: '条件成立时的结果' },
      { name: '假值', description: '条件不成立时的结果' },
    ],
  },
  {
    name: 'IFERROR',
    category: 'logic',
    signature: 'IFERROR(值, 错误时返回)',
    description: '值为空或非有限数字时返回备用值。',
    example: 'IFERROR(SUM([orders.amount])/SUM([orders.quantity]), 0)',
    params: [
      { name: '值', description: '主表达式' },
      { name: '错误时返回', description: '出错时的回退值' },
    ],
  },
  {
    name: 'FALSE',
    category: 'logic',
    signature: 'FALSE()',
    description: '返回逻辑假。',
    example: 'FALSE()',
    params: [],
  },
  {
    name: 'TRUE',
    category: 'logic',
    signature: 'TRUE()',
    description: '返回逻辑真。',
    example: 'TRUE()',
    params: [],
  },
]
