/** 分页 layout 可选项（Element Plus） */

export type PaginationLayoutPart = {
  value: string
  label: string
  describe?: string
}

export const PAGINATION_LAYOUT_OPTIONS: PaginationLayoutPart[] = [
  { value: 'total', label: '总数', describe: '显示总条目数' },
  { value: 'sizes', label: '每页条数', describe: '每页显示个数选择器' },
  { value: 'prev', label: '上一页', describe: '上一页按钮' },
  { value: 'pager', label: '页码', describe: '页码列表' },
  { value: 'next', label: '下一页', describe: '下一页按钮' },
  { value: 'jumper', label: '跳转', describe: '前往某页输入框' },
  { value: '->', label: '右对齐', describe: '其后的内容右对齐' },
]

export const DEFAULT_PAGINATION_LAYOUT =
  'total, sizes, prev, pager, next, jumper'

export type PaginationLayoutItem = PaginationLayoutPart & {
  enabled: boolean
}

/** layout 字符串 → 勾选列表（含未启用项，便于勾选） */
export const parsePaginationLayout = (
  layout?: string | null,
): PaginationLayoutItem[] => {
  const known = new Map(
    PAGINATION_LAYOUT_OPTIONS.map((item) => [item.value, item]),
  )
  const tokens = String(layout ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const seen = new Set<string>()
  const ordered: PaginationLayoutItem[] = []

  for (const token of tokens) {
    const meta = known.get(token)
    if (!meta || seen.has(token)) continue
    seen.add(token)
    ordered.push({ ...meta, enabled: true })
  }

  for (const meta of PAGINATION_LAYOUT_OPTIONS) {
    if (seen.has(meta.value)) continue
    ordered.push({ ...meta, enabled: false })
  }

  return ordered
}

/** 勾选列表 → layout 字符串（仅启用项，按当前顺序） */
export const stringifyPaginationLayout = (
  list: Array<Pick<PaginationLayoutItem, 'value' | 'enabled'>>,
): string =>
  list
    .filter((item) => item.enabled)
    .map((item) => item.value)
    .join(', ')
