import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemTenantPage } from '../../../api/systemTenant'
import type { SystemTenantListItem, TenantStatus } from '../../../types/systemTenant'
import { TENANT_STATUS_LABELS, TENANT_STATUS_VALUES } from '../../../types/systemTenant'
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

function firstDate(value: unknown) {
  if (Array.isArray(value) && value[0]) return String(value[0])
  return undefined
}

function lastDate(value: unknown) {
  if (Array.isArray(value) && value[1]) return String(value[1])
  return undefined
}

export function useTenantTable() {
  const message = useMsg() as any

  const loading = ref(false)
  const tableData = ref<SystemTenantListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '关键词',
      placeholder: '编码 / 名称 / 简称 / 联系人',
      elType: 'GrowInput',
      isDefault: true,
      model: 'keyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '租户状态',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'status',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: TENANT_STATUS_VALUES.map((value) => ({
        label: TENANT_STATUS_LABELS[value],
        value,
      })),
    },
    {
      labelText: '创建时间',
      elType: 'GrowDatePicker',
      isDefault: true,
      model: 'createdAt',
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: 'YYYY-MM-DD',
    },
    {
      labelText: '到期时间',
      elType: 'GrowDatePicker',
      model: 'expiredAt',
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: 'YYYY-MM-DD',
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '租户编码', field: 'tenantCode', visible: true, minWidth: 120 },
    { title: '租户名称', field: 'tenantName', visible: true, minWidth: 160 },
    { title: '租户简称', field: 'shortName', visible: true, minWidth: 100 },
    { title: '状态', field: 'status', visible: true, minWidth: 100 },
    { title: '联系人', field: 'contactName', visible: true, minWidth: 100 },
    { title: '联系人手机', field: 'contactMobile', visible: true, minWidth: 120 },
    { title: '账号数', field: 'accountCount', visible: true, minWidth: 80 },
    { title: '人员数', field: 'personCount', visible: true, minWidth: 80 },
    { title: '服务期限', field: 'servicePeriod', visible: true, minWidth: 200 },
    { title: '最后登录时间', field: 'lastLoginAt', visible: true, minWidth: 170 },
    { title: '创建时间', field: 'createdAt', visible: true, minWidth: 170 },
    { title: '操作', field: 'actions', visible: true, minWidth: 260, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemTenantPage({
        keyword: query.value.keyword,
        status: query.value.status as TenantStatus | '',
        createdStartAt: firstDate(query.value.createdAt),
        createdEndAt: lastDate(query.value.createdAt),
        expiredStartAt: firstDate(query.value.expiredAt),
        expiredEndAt: lastDate(query.value.expiredAt),
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
