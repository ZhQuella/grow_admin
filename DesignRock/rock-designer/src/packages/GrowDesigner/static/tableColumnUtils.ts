import { nanoid } from 'nanoid'
import {
  isSpecialTableColumn,
  type DesignerTableColumn,
  type TableColumnSpecialType,
} from './tableColumns'

/** 创建一列（可带默认标题） */
export const createTableColumn = (
  partial?: Partial<DesignerTableColumn>,
): DesignerTableColumn => {
  const id = partial?.id || nanoid()
  return {
    title: '列',
    field: '',
    visible: true,
    ...partial,
    id,
  }
}

/** 勾选列（根级，整表最多一列） */
export const createSelectionColumn = (): DesignerTableColumn =>
  createTableColumn({
    type: 'selection',
    title: '',
    field: '',
    width: 55,
    align: 'center',
    headerAlign: 'center',
  })

/** 序号列（根级，整表最多一列；序号从 1 起） */
export const createIndexColumn = (): DesignerTableColumn =>
  createTableColumn({
    type: 'index',
    title: '序号',
    field: '',
    width: 55,
    align: 'center',
    headerAlign: 'center',
  })

/** 默认示例列：默认带序号列 */
export const createDefaultTableColumns = (): DesignerTableColumn[] => [
  createIndexColumn(),
  createTableColumn({ title: '姓名', field: 'name', minWidth: 120 }),
  createTableColumn({
    title: '状态信息',
    field: 'statusGroup',
    align: 'center',
    children: [
      createTableColumn({ title: '状态', field: 'status', minWidth: 100 }),
      createTableColumn({ title: '日期', field: 'date', minWidth: 120 }),
    ],
  }),
  createTableColumn({ title: '地址', field: 'address', minWidth: 160 }),
]

/** 在树中查找指定特殊列类型（任意深度） */
export const findSpecialColumn = (
  list: DesignerTableColumn[] = [],
  type: TableColumnSpecialType,
): DesignerTableColumn | undefined => {
  for (const col of list) {
    if (col?.type === type) return col
    if (col.children?.length) {
      const nested = findSpecialColumn(col.children, type)
      if (nested) return nested
    }
  }
  return undefined
}

export const hasSpecialColumn = (
  list: DesignerTableColumn[] = [],
  type: TableColumnSpecialType,
) => Boolean(findSpecialColumn(list, type))

/**
 * 规范化特殊列：
 * - 从分组下提升到根级
 * - 同类型只保留最先遇到的一列
 * - 保留根级已有特殊列的相对顺序
 * - 特殊列去掉 children / field
 */
export const normalizeSpecialColumns = (
  list: DesignerTableColumn[] = [],
): DesignerTableColumn[] => {
  const lifted: DesignerTableColumn[] = []
  const seen = new Set<TableColumnSpecialType>()

  const takeSpecial = (col: DesignerTableColumn) => {
    if (!isSpecialTableColumn(col)) return null
    if (seen.has(col.type)) return null
    seen.add(col.type)
    return {
      ...col,
      field: '',
      children: undefined,
      sortable: '' as const,
    }
  }

  const cleanNested = (cols: DesignerTableColumn[]): DesignerTableColumn[] => {
    const next: DesignerTableColumn[] = []
    for (const col of cols) {
      if (!col) continue
      if (isSpecialTableColumn(col)) {
        const taken = takeSpecial(col)
        if (taken) lifted.push(taken)
        continue
      }
      next.push(
        col.children?.length
          ? { ...col, children: cleanNested(col.children) }
          : col,
      )
    }
    return next
  }

  const rootNext: DesignerTableColumn[] = []
  for (const col of list) {
    if (!col) continue
    if (isSpecialTableColumn(col)) {
      const taken = takeSpecial(col)
      if (taken) rootNext.push(taken)
      continue
    }
    rootNext.push(
      col.children?.length
        ? { ...col, children: cleanNested(col.children) }
        : col,
    )
  }

  return lifted.length ? [...lifted, ...rootNext] : rootNext
}

/** 插入特殊列到根级（已存在则原样返回；勾选靠前，序号紧随勾选） */
export const insertSpecialColumn = (
  list: DesignerTableColumn[],
  column: DesignerTableColumn,
): DesignerTableColumn[] => {
  if (!isSpecialTableColumn(column)) return [...list, column]
  if (hasSpecialColumn(list, column.type)) return list
  const cleaned = normalizeSpecialColumns(list)
  const nextCol = {
    ...column,
    field: '',
    children: undefined,
    sortable: '' as const,
  }
  if (column.type === 'selection') {
    return [nextCol, ...cleaned]
  }
  const selIdx = cleaned.findIndex((c) => c.type === 'selection')
  if (selIdx >= 0) {
    const next = [...cleaned]
    next.splice(selIdx + 1, 0, nextCol)
    return next
  }
  return [nextCol, ...cleaned]
}

/** 仅保留可见列（递归） */
export const filterVisibleTableColumns = (
  columns: DesignerTableColumn[] = [],
): DesignerTableColumn[] =>
  columns
    .filter((col) => col && col.visible !== false)
    .map((col) =>
      col.children?.length
        ? { ...col, children: filterVisibleTableColumns(col.children) }
        : col,
    )

const omitEmpty = (value: unknown) =>
  value === '' || value === undefined || value === null

/**
 * Element Plus 固定列只认一级表头，子列 fixed 会被父级覆盖。
 * 渲染时把子孙上的 fixed 提升到当前列。
 */
export const resolveColumnFixed = (
  col: DesignerTableColumn,
): 'left' | 'right' | true | '' => {
  if (col.fixed === true || col.fixed === 'left' || col.fixed === 'right') {
    return col.fixed
  }
  for (const child of col.children || []) {
    const nested = resolveColumnFixed(child)
    if (nested) return nested
  }
  return ''
}

/** 清空自身及子孙的 fixed */
export const clearFixedDeep = (col: DesignerTableColumn): DesignerTableColumn => ({
  ...col,
  fixed: '',
  children: col.children?.map(clearFixedDeep),
})

/** 映射为 GrowTableColumn / el-table-column 可绑定 props */
export const toTableColumnBindProps = (col: DesignerTableColumn): Record<string, any> => {
  const props: Record<string, any> = {}
  const special = isSpecialTableColumn(col)

  if (special) {
    props.type = col.type
  } else {
    props.label = col.title || ''
    if (col.field && !col.children?.length) props.prop = col.field
  }

  // 序号列可显示表头文案；勾选列通常无标题
  if (col.type === 'index' && col.title) props.label = col.title

  if (!omitEmpty(col.width)) props.width = col.width
  if (!omitEmpty(col.minWidth)) props.minWidth = col.minWidth
  if (col.align) props.align = col.align
  // 未设 headerAlign 时 EP 会回退用 align；强制拆开以免联动表头
  if (col.headerAlign) props.headerAlign = col.headerAlign
  else if (col.align) props.headerAlign = special ? col.align : 'left'
  const fixed = resolveColumnFixed(col)
  if (fixed) props.fixed = fixed

  if (!special) {
    if (col.sortable === true || col.sortable === 'custom') {
      props.sortable = col.sortable === true ? true : 'custom'
    }
    if (col.resizable != null) props.resizable = col.resizable
    if (col.showOverflowTooltip != null) {
      props.showOverflowTooltip = col.showOverflowTooltip
    }
  }

  if (col.className) props.className = col.className
  if (col.labelClassName) props.labelClassName = col.labelClassName
  if (col.columnKey) props.columnKey = col.columnKey
  return props
}

/** 列配置签名：用于强制重建 ElTableColumn */
export const tableColumnRenderKey = (col: DesignerTableColumn) =>
  `${col.id || col.type || col.field || col.title}:${JSON.stringify(toTableColumnBindProps(col))}`

/** 整表 columns 签名（设计器 / 预览重建用） */
export const tableColumnsSignature = (columns: unknown) => {
  try {
    return JSON.stringify(columns || [])
  } catch {
    return String(Date.now())
  }
}

/**
 * 将绑定变量求值结果（EP columns 或设计器列）归一为 DesignerTableColumn[]。
 * 支持 label/prop（EP）与 title/field（设计器）两种形态。
 */
export const coerceToDesignerTableColumns = (
  raw: unknown,
): DesignerTableColumn[] => {
  if (!Array.isArray(raw)) return []
  const result: DesignerTableColumn[] = []
  raw.forEach((item, index) => {
    const col = coerceToDesignerTableColumn(item, index)
    if (col) result.push(col)
  })
  return result
}

const coerceToDesignerTableColumn = (
  raw: unknown,
  index: number,
): DesignerTableColumn | null => {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, any>
  const type =
    item.type === 'selection' || item.type === 'index' ? item.type : undefined

  const childRaw = Array.isArray(item.children) ? item.children : []
  const children = childRaw
    .map((child: unknown, childIndex: number) =>
      coerceToDesignerTableColumn(child, childIndex),
    )
    .filter(Boolean) as DesignerTableColumn[]

  const title = String(item.title ?? item.label ?? '')
  const field = type ? '' : String(item.field ?? item.prop ?? '')
  const id =
    item.id != null && String(item.id)
      ? String(item.id)
      : `bound_${type || field || title || 'col'}_${index}`

  const sortableRaw = item.sortable
  let sortable: DesignerTableColumn['sortable'] = ''
  if (sortableRaw === true || sortableRaw === 'custom') sortable = sortableRaw
  else if (sortableRaw === 'true') sortable = true

  const minWidth = item.minWidth ?? item['min-width']
  const headerAlign = item.headerAlign ?? item['header-align']
  const showOverflowTooltip =
    item.showOverflowTooltip ?? item['show-overflow-tooltip']
  const className = item.className ?? item['class-name']
  const labelClassName = item.labelClassName ?? item['label-class-name']
  const columnKey = item.columnKey ?? item['column-key']

  return {
    id,
    ...(type ? { type } : {}),
    title,
    field,
    ...(item.width != null && item.width !== '' ? { width: item.width } : {}),
    ...(minWidth != null && minWidth !== '' ? { minWidth } : {}),
    ...(item.align ? { align: item.align } : {}),
    ...(headerAlign ? { headerAlign } : {}),
    ...(item.fixed === true || item.fixed === 'left' || item.fixed === 'right'
      ? { fixed: item.fixed }
      : {}),
    ...(sortable !== '' ? { sortable } : {}),
    ...(typeof item.resizable === 'boolean' ? { resizable: item.resizable } : {}),
    ...(typeof showOverflowTooltip === 'boolean'
      ? { showOverflowTooltip }
      : {}),
    ...(className ? { className: String(className) } : {}),
    ...(labelClassName ? { labelClassName: String(labelClassName) } : {}),
    ...(columnKey ? { columnKey: String(columnKey) } : {}),
    visible: item.visible !== false,
    ...(children.length ? { children } : {}),
  }
}

/** 在树中按 id 更新节点 */
export const updateTableColumnById = (
  list: DesignerTableColumn[],
  id: string,
  patch: Partial<DesignerTableColumn>,
): DesignerTableColumn[] =>
  list.map((col) => {
    if (col.id === id) return { ...col, ...patch, id: col.id }
    if (!col.children?.length) return col
    return { ...col, children: updateTableColumnById(col.children, id, patch) }
  })

/** 在树中删除节点 */
export const removeTableColumnById = (
  list: DesignerTableColumn[],
  id: string,
): DesignerTableColumn[] =>
  list
    .filter((col) => col.id !== id)
    .map((col) =>
      col.children?.length
        ? { ...col, children: removeTableColumnById(col.children, id) }
        : col,
    )

/** 替换指定父节点的 children */
export const replaceChildrenById = (
  list: DesignerTableColumn[],
  parentId: string,
  children: DesignerTableColumn[],
): DesignerTableColumn[] =>
  list.map((col) => {
    if (col.id === parentId) return { ...col, children }
    if (!col.children?.length) return col
    return { ...col, children: replaceChildrenById(col.children, parentId, children) }
  })

/** 在指定父节点下追加子列；parentId 为空则追加到根 */
export const appendTableColumn = (
  list: DesignerTableColumn[],
  parentId: string | null,
  column: DesignerTableColumn,
): DesignerTableColumn[] => {
  if (!parentId) return [...list, column]
  return list.map((col) => {
    if (col.id === parentId) {
      return { ...col, children: [...(col.children || []), column] }
    }
    if (!col.children?.length) return col
    return { ...col, children: appendTableColumn(col.children, parentId, column) }
  })
}

/** 表格表头 → ColumnBar 列树（过滤勾选/序号列） */
export type ColumnBarItemLike = {
  title?: string
  field?: string
  visible?: boolean
  disabled?: boolean
  children?: ColumnBarItemLike[]
  [key: string]: unknown
}

export const toColumnBarItems = (
  cols: DesignerTableColumn[] | undefined | null,
): ColumnBarItemLike[] => {
  if (!Array.isArray(cols) || !cols.length) return []
  return cols
    .filter((col) => !isSpecialTableColumn(col))
    .map((col) => {
      const children = col.children?.length
        ? toColumnBarItems(col.children)
        : undefined
      return {
        title: col.title,
        field: col.field || col.id,
        visible: col.visible !== false,
        ...(children?.length ? { children } : {}),
      }
    })
}

/** 将 ColumnBar 确认后的 visible 写回表格表头树（按 field / id 匹配） */
export const applyColumnBarVisibleToTableColumns = (
  tableColumns: DesignerTableColumn[] | undefined | null,
  barItems: ColumnBarItemLike[] | undefined | null,
  nodeKey = 'field',
): DesignerTableColumn[] => {
  const list = Array.isArray(tableColumns) ? tableColumns : []
  if (!list.length) return []

  const visibility = new Map<string, boolean>()
  const walkBar = (items: ColumnBarItemLike[]) => {
    for (const item of items || []) {
      const key = item?.[nodeKey] ?? item?.field
      if (key != null && key !== '') {
        visibility.set(String(key), item.visible !== false)
      }
      if (item?.children?.length) walkBar(item.children)
    }
  }
  walkBar(Array.isArray(barItems) ? barItems : [])

  const walkTable = (cols: DesignerTableColumn[]): DesignerTableColumn[] =>
    cols.map((col) => {
      const next: DesignerTableColumn = { ...col }
      if (!isSpecialTableColumn(col)) {
        const key = col.field || col.id
        if (key != null && key !== '' && visibility.has(String(key))) {
          next.visible = visibility.get(String(key))
        }
      }
      if (col.children?.length) {
        next.children = walkTable(col.children)
      }
      return next
    })

  return walkTable(list)
}

/** ColumnBar 默认示例列 */
export const createDefaultColumnBarColumns = (): ColumnBarItemLike[] => [
  { title: '姓名', field: 'name', visible: true },
  { title: '状态', field: 'status', visible: true },
  { title: '地址', field: 'address', visible: true },
]
