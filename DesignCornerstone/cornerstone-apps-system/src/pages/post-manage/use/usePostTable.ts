import { computed, reactive, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemDeptTree } from '../../../api/systemDept'
import { fetchSystemPostPage } from '../../../api/systemPost'
import type { SystemDeptNode } from '../../../types/systemDept'
import type { SystemPostListItem } from '../../../types/systemPost'
import { toMessage } from './helpers'

export type PostTableRow = {
  rowKey: string
  deptId: string
  deptName: string
  deptCode: string
  parentDeptName: string
  deptEnabled: boolean
  deptLevel: number
  directPostCount: number
  post: SystemPostListItem | null
  span: number
  spanIndex: number
}

export type ManageTableColumn = ColumnBarItem & {
  width?: number
  minWidth?: number
  fixed?: string | boolean
}

const DEPT_SPAN_PROPS = new Set([
  'deptName',
  'deptCode',
  'parentDeptName',
  'directPostCount',
  'deptStatus',
  'deptActions',
])

function collectLeafColumns(list: ManageTableColumn[]): ManageTableColumn[] {
  const result: ManageTableColumn[] = []
  list.forEach((item) => {
    if (item.visible === false) return
    if (item.children?.length) {
      result.push(...collectLeafColumns(item.children as ManageTableColumn[]))
    } else if (item.field) {
      result.push(item)
    }
  })
  return result
}

function findDeptNode(nodes: SystemDeptNode[], id: string): SystemDeptNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = node.children?.length ? findDeptNode(node.children, id) : undefined
    if (found) return found
  }
}

function flattenDeptOptions(nodes: SystemDeptNode[], prefix = ''): Array<{ label: string; value: string }> {
  return nodes.flatMap((node) => {
    const label = prefix ? `${prefix} / ${node.name}` : node.name
    return [
      { label, value: node.id },
      ...flattenDeptOptions(node.children || [], label),
    ]
  })
}

function hasPostFilter(query: Recordable<any>) {
  return Boolean(
    query?.name
    || query?.code
    || query?.enabled === true
    || query?.enabled === false
    || query?.enabled === 'true'
    || query?.enabled === 'false'
    || query?.overstaffed === true
    || query?.overstaffed === false
    || query?.overstaffed === 'true'
    || query?.overstaffed === 'false',
  )
}

function postsOfDept(posts: SystemPostListItem[], deptId: string) {
  return posts
    .filter((item) => item.deptId === deptId)
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'))
}

function buildPostRows(
  roots: SystemDeptNode[],
  posts: SystemPostListItem[],
  skipEmpty: boolean,
  level = 0,
): PostTableRow[] {
  const rows: PostTableRow[] = []
  roots.forEach((dept) => {
    const list = postsOfDept(posts, dept.id)
    if (list.length || !skipEmpty) {
      const group = list.length ? list : [null]
      group.forEach((post, index) => {
        rows.push({
          rowKey: post ? post.id : `empty-${dept.id}`,
          deptId: dept.id,
          deptName: dept.name,
          deptCode: dept.code,
          parentDeptName: dept.parentName || '-',
          deptEnabled: dept.status === 'enabled',
          deptLevel: level,
          directPostCount: dept.directPostCount,
          post,
          span: group.length,
          spanIndex: index,
        })
      })
    }
    if (dept.children?.length) {
      rows.push(...buildPostRows(dept.children, posts, skipEmpty, level + 1))
    }
  })
  return rows
}

export function usePostTable() {
  const message = useMsg() as any

  const loading = ref(false)
  const postList = ref<SystemPostListItem[]>([])
  const deptTree = ref<SystemDeptNode[]>([])
  const query = ref<Recordable<any>>({})
  const deptOptions = reactive<Array<{ label: string; value: string }>>([])

  const searchList: SearchBarField[] = [
    {
      labelText: '所属部门',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'deptId',
      label: 'label',
      value: 'value',
      placeholder: '请选择部门',
      clearable: true,
      filterable: true,
      options: deptOptions,
    },
    {
      labelText: '岗位名称',
      placeholder: '岗位名称',
      elType: 'GrowInput',
      isDefault: true,
      model: 'name',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '岗位编码',
      placeholder: '岗位编码',
      elType: 'GrowInput',
      isDefault: true,
      model: 'code',
      clearable: true,
    },
    {
      labelText: '状态',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'enabled',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '启用', value: 'true' },
        { label: '停用', value: 'false' },
      ],
    },
    {
      labelText: '是否超编',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'overstaffed',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '超编', value: 'true' },
        { label: '未超编', value: 'false' },
      ],
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '部门', field: 'deptName', visible: true, minWidth: 180 },
    { title: '部门编码', field: 'deptCode', visible: true, minWidth: 120 },
    { title: '上级部门', field: 'parentDeptName', visible: true, minWidth: 120 },
    {
      title: '岗位',
      field: 'postGroup',
      visible: true,
      children: [
        { title: '名称', field: 'postName', visible: true, minWidth: 140 },
        { title: '编码', field: 'postCode', visible: true, minWidth: 120 },
        { title: '全部', field: 'occupied', visible: true, width: 88 },
        { title: '全职', field: 'formalHeadcount', visible: true, width: 88 },
        { title: '兼职', field: 'partTimeHeadcount', visible: true, width: 88 },
        { title: '实习', field: 'internHeadcount', visible: true, width: 88 },
        { title: '外包', field: 'contractorHeadcount', visible: true, width: 88 },
        { title: '超编', field: 'overstaffed', visible: true, width: 88 },
        { title: '岗位状态', field: 'postEnabled', visible: true, width: 96 },
        { title: '操作', field: 'postActions', visible: true, width: 128 },
      ],
    },
    { title: '直属岗位数', field: 'directPostCount', visible: true, width: 110 },
    { title: '部门状态', field: 'deptStatus', visible: true, width: 96 },
    { title: '操作', field: 'deptActions', visible: true, width: 80, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))
  const visibleFields = computed(() => new Set(leafColumns.value.map((item) => String(item.field))))
  const postGroupVisible = computed(() => {
    const group = tableColumns.value.find((item) => item.field === 'postGroup')
    if (!group || group.visible === false) return false
    return (group.children || []).some((item) => item.visible !== false)
  })

  function isColumnVisible(field: string) {
    return visibleFields.value.has(field)
  }

  const tableData = computed(() => {
    const deptId = String(query.value.deptId || '')
    const selected = deptId ? findDeptNode(deptTree.value, deptId) : undefined
    const roots = deptId ? (selected ? [selected] : []) : deptTree.value
    return buildPostRows(roots, postList.value, hasPostFilter(query.value))
  })

  async function loadDeptTree() {
    try {
      const tree = await fetchSystemDeptTree(true)
      deptTree.value = Array.isArray(tree) ? tree : []
      deptOptions.splice(0, deptOptions.length, ...flattenDeptOptions(deptTree.value))
    } catch (error) {
      message.error(toMessage(error, '部门加载失败'))
    }
  }

  async function loadList() {
    loading.value = true
    try {
      const { deptId: _deptId, ...filters } = query.value || {}
      const data = await fetchSystemPostPage({
        ...filters,
        page: 1,
        pageSize: 10000,
      })
      postList.value = Array.isArray(data?.items) ? data.items : []
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onSearch(data: Recordable<any>) {
    query.value = data || {}
    void loadList()
  }

  function onColumnsConfirm(columns: ColumnBarItem[]) {
    tableColumns.value = columns as ManageTableColumn[]
  }

  function spanMethod({ row, column }: { row: PostTableRow; column: { property?: string } }) {
    if (!DEPT_SPAN_PROPS.has(column.property || '')) {
      return { rowspan: 1, colspan: 1 }
    }
    if (row.spanIndex === 0) return { rowspan: row.span, colspan: 1 }
    return { rowspan: 0, colspan: 0 }
  }

  function rowClassName({ row }: { row: PostTableRow }) {
    return row.deptEnabled ? '' : 'post-manage__row--disabled'
  }

  return {
    loading,
    tableData,
    searchList,
    tableColumns,
    leafColumns,
    postGroupVisible,
    isColumnVisible,
    loadDeptTree,
    loadList,
    onSearch,
    onColumnsConfirm,
    spanMethod,
    rowClassName,
  }
}
