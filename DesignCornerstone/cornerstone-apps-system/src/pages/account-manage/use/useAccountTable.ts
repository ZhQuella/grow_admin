import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemAccountPage } from '../../../api/systemAccount'
import type { SystemAccountListItem } from '../../../types/systemAccount'
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

export function useAccountTable() {
  const message = useMsg()

  const loading = ref(false)
  const tableData = ref<SystemAccountListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '关键字',
      placeholder: '登录名 / 人员 / 部门',
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
      labelText: '绑定人员',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'unbound',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '未绑定', value: 'true' },
        { label: '已绑定', value: 'false' },
      ],
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '登录名', field: 'username', visible: true, minWidth: 140 },
    { title: '绑定人员', field: 'personName', visible: true, minWidth: 120 },
    { title: '部门', field: 'deptName', visible: true, minWidth: 140 },
    { title: '角色', field: 'roles', visible: true, minWidth: 160 },
    { title: '启用', field: 'enabled', visible: true, minWidth: 90 },
    { title: '最近登录', field: 'lastLoginAt', visible: true, minWidth: 160 },
    { title: '备注', field: 'remark', visible: false, minWidth: 160 },
    { title: '操作', field: 'actions', visible: true, minWidth: 220, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemAccountPage({
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
