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
