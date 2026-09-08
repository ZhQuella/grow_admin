import { computed, onMounted, reactive, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemTenantOptions } from '../../../api/systemTenant'
import { fetchTenantAccountPage } from '../../../api/systemTenantAccount'
import type { TenantAccountListItem } from '../../../types/systemTenantAccount'
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

export function useTenantAccountTable() {
  const message = useMsg() as any

  const loading = ref(false)
  const tableData = ref<TenantAccountListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList = reactive<SearchBarField[]>([
    {
      labelText: '所属租户',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'tenantId',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      filterable: true,
      noDelete: true,
      options: [],
    },
    {
      labelText: '登录名',
      placeholder: '请输入登录名',
      elType: 'GrowInput',
      isDefault: true,
      model: 'username',
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
      labelText: '状态',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'enabled',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: [
        { label: '启用', value: 'true' },
        { label: '停用', value: 'false' },
      ],
    },
    {
      labelText: '租户管理员',
      elType: 'GrowSelect',
      model: 'tenantAdmin',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
    },
  ])

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '所属租户', field: 'tenantName', visible: true, minWidth: 160 },
    { title: '登录名', field: 'username', visible: true, minWidth: 140 },
    { title: '昵称', field: 'nickname', visible: true, minWidth: 120 },
    { title: '状态', field: 'enabled', visible: true, minWidth: 90 },
    { title: '租户管理员', field: 'tenantAdmin', visible: true, minWidth: 110 },
    { title: '最后登录时间', field: 'lastLoginAt', visible: true, minWidth: 170 },
    { title: '手机号', field: 'mobile', visible: false, minWidth: 130 },
    { title: '邮箱', field: 'email', visible: false, minWidth: 170 },
    { title: '备注', field: 'remark', visible: false, minWidth: 160 },
    { title: '操作', field: 'actions', visible: true, minWidth: 140, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchTenantAccountPage({
        tenantId: query.value.tenantId,
        username: query.value.username,
        nickname: query.value.nickname,
        enabled: query.value.enabled,
        tenantAdmin: query.value.tenantAdmin,
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

  async function loadTenantOptions() {
    try {
      const options = await fetchSystemTenantOptions()
      const field = searchList.find((item) => item.model === 'tenantId')
      if (field) {
        field.options = (options || []).map((item) => ({
          label: `${item.tenantName}（${item.tenantCode}）`,
          value: item.id,
        }))
      }
    } catch (error) {
      message.error(toMessage(error, '租户选项加载失败'))
    }
  }

  onMounted(() => {
    void loadTenantOptions()
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
