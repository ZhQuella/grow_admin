import { computed, onMounted, reactive, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemAccountPage, fetchSystemAccountPersonOptions } from '../../../api/systemAccount'
import { fetchSystemRoleOptions } from '../../../api/systemRole'
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

  const searchList = reactive<SearchBarField[]>([
    {
      labelText: '账号名称',
      placeholder: '请输入账号名称',
      elType: 'GrowInput',
      isDefault: true,
      model: 'username',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '昵称',
      placeholder: '请输入昵称',
      elType: 'GrowInput',
      isDefault: true,
      model: 'nickname',
      clearable: true,
    },
    {
      labelText: '绑定人员',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'personId',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      filterable: true,
      options: [],
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
      labelText: '角色',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'roleId',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      filterable: true,
      options: [],
    },
  ])

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '账号名称', field: 'username', visible: true, minWidth: 140 },
    { title: '昵称', field: 'nickname', visible: true, minWidth: 120 },
    { title: '绑定人员', field: 'personName', visible: true, minWidth: 120 },
    { title: '人员主部门', field: 'deptName', visible: true, minWidth: 140 },
    { title: '状态', field: 'enabled', visible: true, minWidth: 90 },
    { title: '角色数量', field: 'roleCount', visible: true, minWidth: 100 },
    { title: '最后登录时间', field: 'lastLoginAt', visible: true, minWidth: 160 },
    { title: '手机号', field: 'mobile', visible: false, minWidth: 130 },
    { title: '邮箱', field: 'email', visible: false, minWidth: 170 },
    { title: '备注', field: 'remark', visible: false, minWidth: 160 },
    { title: '操作', field: 'actions', visible: true, minWidth: 250, fixed: 'right' },
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

  async function loadFilterOptions() {
    try {
      const [people, roles] = await Promise.all([
        fetchSystemAccountPersonOptions(),
        fetchSystemRoleOptions(),
      ])
      const personField = searchList.find((item) => item.model === 'personId')
      const roleField = searchList.find((item) => item.model === 'roleId')
      if (personField) personField.options = (people || []).map((item) => ({
        label: item.name,
        value: item.personId,
      }))
      if (roleField) roleField.options = (roles || []).map((item) => ({
        label: item.name,
        value: item.id,
      }))
    } catch (error) {
      message.error(toMessage(error, '筛选项加载失败'))
    }
  }

  onMounted(() => {
    void loadFilterOptions()
  })

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
