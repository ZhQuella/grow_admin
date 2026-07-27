/** 分页 props 规范化（规避 Element Plus 受控页码不渲染问题） */

const toNumber = (raw: unknown, fallback: number) => {
  if (raw == null || raw === '') return fallback
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const num = Number(String(raw).trim())
  return Number.isFinite(num) ? num : fallback
}

/** 从逗号分隔文本提取正整数，如 "10,20,50" / "[10, 20, 50]" */
const parseCommaNumberList = (text: string): number[] | undefined => {
  const matched = text.match(/\d+/g)
  if (!matched?.length) return undefined
  const nums = matched
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0)
  return nums.length ? nums : undefined
}

/**
 * page-sizes 解析：
 * - 数组直接用
 * - PropVariableBind 会把 [10,20] 存成 "10,20"（Array.toString），不能用 Function 求值（逗号运算符）
 */
export const parsePageSizes = (raw: unknown): number[] | undefined => {
  if (Array.isArray(raw)) {
    const nums = raw
      .map((item) => toNumber(item, NaN))
      .filter((item) => Number.isFinite(item) && item > 0)
    return nums.length ? nums : undefined
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return [raw]
  }
  if (typeof raw !== 'string') return undefined

  const text = raw.trim()
  if (!text) return undefined

  // JSON 数组
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) return parsePageSizes(parsed)
    } catch {
      // 继续尝试
    }
  }

  // "10,20,50" / "10，20，50" / 带空格（Array.toString 常见形态）
  const fromComma = parseCommaNumberList(text.replace(/，/g, ','))
  if (fromComma?.length) return fromComma

  // 仅当表达式求值结果是数组时才采用（避免 return (10,20) → 20）
  try {
    // eslint-disable-next-line no-new-func
    const evaluated = new Function(`"use strict"; return (${text});`)()
    if (Array.isArray(evaluated)) return parsePageSizes(evaluated)
  } catch {
    // ignore
  }

  return undefined
}

/**
 * 规范化分页 props（数字化 + 统一字段名）。
 * Element Plus：传入受控 current-page / page-size 时必须配套 update 监听，
 * 否则组件不渲染；default-* 仅挂载生效，设计态改配置不会刷新，故默认走受控。
 */
export const normalizePaginationBindProps = (
  raw: Record<string, any>,
  options?: { uncontrolled?: boolean },
): Record<string, any> => {
  const info = { ...raw }
  Reflect.deleteProperty(info, 'model')
  Reflect.deleteProperty(info, 'visible')
  Reflect.deleteProperty(info, 'render')

  const current = info['current-page'] ?? info.currentPage
  const size = info['page-size'] ?? info.pageSize

  if (options?.uncontrolled) {
    if (current != null && current !== '') {
      info['default-current-page'] = toNumber(current, 1)
      Reflect.deleteProperty(info, 'current-page')
      Reflect.deleteProperty(info, 'currentPage')
    }
    if (size != null && size !== '') {
      info['default-page-size'] = toNumber(size, 10)
      Reflect.deleteProperty(info, 'page-size')
      Reflect.deleteProperty(info, 'pageSize')
    }
  } else {
    if (current != null && current !== '') {
      info['current-page'] = toNumber(current, 1)
      Reflect.deleteProperty(info, 'currentPage')
    }
    if (size != null && size !== '') {
      info['page-size'] = toNumber(size, 10)
      Reflect.deleteProperty(info, 'pageSize')
    }
  }

  if (info.total != null && info.total !== '') {
    info.total = toNumber(info.total, 0)
  }

  const pageCount = info['page-count'] ?? info.pageCount
  Reflect.deleteProperty(info, 'pageCount')
  if (pageCount != null && pageCount !== '') {
    info['page-count'] = toNumber(pageCount, 1)
  }

  if (info['pager-count'] != null && info['pager-count'] !== '') {
    info['pager-count'] = toNumber(info['pager-count'], 7)
  } else if (info.pagerCount != null && info.pagerCount !== '') {
    info['pager-count'] = toNumber(info.pagerCount, 7)
    Reflect.deleteProperty(info, 'pagerCount')
  }

  const defaultCurrent = info['default-current-page'] ?? info.defaultCurrentPage
  Reflect.deleteProperty(info, 'defaultCurrentPage')
  if (defaultCurrent != null && defaultCurrent !== '') {
    info['default-current-page'] = toNumber(defaultCurrent, 1)
  }

  const defaultSize = info['default-page-size'] ?? info.defaultPageSize
  Reflect.deleteProperty(info, 'defaultPageSize')
  if (defaultSize != null && defaultSize !== '') {
    info['default-page-size'] = toNumber(defaultSize, 10)
  }

  const sizesRaw = info['page-sizes'] ?? info.pageSizes
  Reflect.deleteProperty(info, 'pageSizes')
  const sizes = parsePageSizes(sizesRaw)
  if (sizes?.length) {
    info['page-sizes'] = sizes
  } else {
    // 解析失败时去掉非法字符串，避免 EP 按字符拆成「5条/页、0条/页、,条/页…」
    Reflect.deleteProperty(info, 'page-sizes')
  }

  return info
}
