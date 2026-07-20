import { nanoid } from 'nanoid'
import type { DesignerTableColumn } from './tableColumns'

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

/** 默认示例列（含一级分组） */
export const createDefaultTableColumns = (): DesignerTableColumn[] => [
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
  const props: Record<string, any> = { label: col.title || '' }
  if (col.field && !col.children?.length) props.prop = col.field
  if (!omitEmpty(col.width)) props.width = col.width
  if (!omitEmpty(col.minWidth)) props.minWidth = col.minWidth
  if (col.align) props.align = col.align
  // 未设 headerAlign 时 EP 会回退用 align；强制拆开以免联动表头
  if (col.headerAlign) props.headerAlign = col.headerAlign
  else if (col.align) props.headerAlign = 'left'
  const fixed = resolveColumnFixed(col)
  if (fixed) props.fixed = fixed
  if (col.sortable === true || col.sortable === 'custom') {
    props.sortable = col.sortable === true ? true : 'custom'
  }
  if (col.resizable != null) props.resizable = col.resizable
  if (col.showOverflowTooltip != null) props.showOverflowTooltip = col.showOverflowTooltip
  if (col.className) props.className = col.className
  if (col.labelClassName) props.labelClassName = col.labelClassName
  if (col.columnKey) props.columnKey = col.columnKey
  return props
}

/** 列配置签名：用于强制重建 ElTableColumn */
export const tableColumnRenderKey = (col: DesignerTableColumn) =>
  `${col.id || col.field || col.title}:${JSON.stringify(toTableColumnBindProps(col))}`

/** 整表 columns 签名（设计器 / 预览重建用） */
export const tableColumnsSignature = (columns: unknown) => {
  try {
    return JSON.stringify(columns || [])
  } catch {
    return String(Date.now())
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
