import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemRolePage } from '../../../api/systemRole'
import { EDIT_SCOPE_OPTIONS, type SystemRoleListItem } from '../../../types/systemRole'
import { toMessage } from './helpers'

export type ManageTableColumn = ColumnBarItem & {
  width?: number
  minWidth?: number
  fixed?: string | boolean
}

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

export function useRoleTable() {
  const message = useMsg()

  const loading = ref(false)
  const tableData = ref<SystemRoleListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '关键字',
      placeholder: '名称 / 编码',
      elType: 'GrowInput',
      isDefault: true,
      model: 'keyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '启用状态',
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
      labelText: '行权限',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'editScope',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: EDIT_SCOPE_OPTIONS.map(({ label, value }) => ({ label, value })),
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '名称', field: 'name', visible: true, minWidth: 140 },
    { title: '编码', field: 'code', visible: true, minWidth: 140 },
    { title: '数据权限', field: 'dataPermCount', visible: true, minWidth: 110 },
    { title: '人员', field: 'memberCount', visible: true, minWidth: 80 },
    { title: '菜单', field: 'menuCount', visible: true, minWidth: 80 },
    { title: '功能', field: 'functionCount', visible: true, minWidth: 80 },
    { title: '排序', field: 'sort', visible: true, minWidth: 80 },
    { title: '启用', field: 'enabled', visible: true, minWidth: 90 },
    { title: '更新时间', field: 'updatedAt', visible: true, minWidth: 160 },
    { title: '备注', field: 'remark', visible: false, minWidth: 160 },
    { title: '操作', field: 'actions', visible: true, minWidth: 232, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemRolePage({
        ...query.value,
        page: page.value,
        pageSize: pageSize.value,
      })
      tableData.value = Array.isArray(data?.items) ? data.items : []
      total.value = Number(data?.total || 0)
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onSearch(data: Recordable<any>) {
    query.value = data || {}
    page.value = 1
    void loadList()
  }

  function onColumnsConfirm(columns: ColumnBarItem[]) {
    tableColumns.value = columns as ManageTableColumn[]
  }

  function onSizeChange() {
    page.value = 1
    void loadList()
  }

  return {
    loading,
    tableData,
    total,
    page,
    pageSize,
    searchList,
    tableColumns,
    leafColumns,
    loadList,
    onSearch,
    onColumnsConfirm,
    onSizeChange,
  }
}
