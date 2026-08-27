import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemPersonPage } from '../../../api/systemPerson'
import {
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  type SystemPersonListItem,
} from '../../../types/systemPerson'
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

export function usePersonTable() {
  const message = useMsg()

  const loading = ref(false)
  const tableData = ref<SystemPersonListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const deptId = ref('')
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '关键字',
      placeholder: '姓名 / 工号 / 手机 / 邮箱',
      elType: 'GrowInput',
      isDefault: true,
      model: 'keyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '员工状态',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'employeeStatus',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: EMPLOYEE_STATUS_OPTIONS.map(({ label, value }) => ({ label, value })),
    },
    {
      labelText: '员工类型',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'employeeType',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: EMPLOYEE_TYPE_OPTIONS.map(({ label, value }) => ({ label, value })),
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '姓名', field: 'name', visible: true, minWidth: 120 },
    { title: '工号', field: 'employeeNo', visible: true, minWidth: 100 },
    { title: '部门', field: 'deptName', visible: true, minWidth: 140 },
    { title: '岗位', field: 'post', visible: true, minWidth: 120 },
    { title: '员工类型', field: 'employeeType', visible: true, minWidth: 90 },
    { title: '员工状态', field: 'employeeStatus', visible: true, minWidth: 90 },
    { title: '手机号', field: 'mobile', visible: true, minWidth: 130 },
    { title: '入职时间', field: 'entryDate', visible: true, minWidth: 110 },
    { title: '角色', field: 'roles', visible: true, minWidth: 140 },
    { title: '最近变动', field: 'lastEventTitle', visible: true, minWidth: 120 },
    { title: '操作', field: 'actions', visible: true, minWidth: 220, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemPersonPage({
        ...query.value,
        deptId: deptId.value || undefined,
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

  function onDeptChange(id: string) {
    deptId.value = id
    page.value = 1
    void loadList()
  }

  return {
    loading,
    tableData,
    total,
    page,
    pageSize,
    deptId,
    searchList,
    tableColumns,
    leafColumns,
    loadList,
    onSearch,
    onColumnsConfirm,
    onSizeChange,
    onDeptChange,
  }
}
