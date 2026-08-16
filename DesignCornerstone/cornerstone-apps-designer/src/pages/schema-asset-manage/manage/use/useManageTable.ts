import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSchemaAssetPage } from '../../../../api/schemaAsset'
import type { SchemaAssetListItem } from '../../../../types/schemaAsset'

export type ManageTableColumn = ColumnBarItem & {
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

export function useManageTable() {
  const message = useMsg()

  const loading = ref(false)
  const tableData = ref<SchemaAssetListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '名称',
      placeholder: '请输入名称',
      elType: 'GrowInput',
      isDefault: true,
      model: 'name',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '编码',
      placeholder: '请输入编码',
      elType: 'GrowInput',
      isDefault: true,
      model: 'code',
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
      labelText: '发布状态',
      elType: 'GrowSelect',
      model: 'publishStatus',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已发布', value: 'published' },
      ],
    },
    {
      labelText: '更新时间',
      elType: 'GrowDatePicker',
      isDefault: true,
      model: 'updatedAt',
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      valueFormat: 'YYYY-MM-DD',
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '名称', field: 'name', visible: true, minWidth: 140 },
    { title: '编码', field: 'code', visible: true, minWidth: 140 },
    { title: '当前版本', field: 'currentVersion', visible: true, minWidth: 100 },
    { title: '发布状态', field: 'publishStatus', visible: true, minWidth: 100 },
    { title: '启用状态', field: 'enabled', visible: true, minWidth: 100 },
    { title: '描述', field: 'description', visible: false, minWidth: 160 },
    { title: '最近更新人', field: 'updatedBy', visible: true, minWidth: 110 },
    { title: '更新时间', field: 'updatedAt', visible: true, minWidth: 160 },
    { title: '发布时间', field: 'publishedAt', visible: true, minWidth: 160 },
    { title: '发布人', field: 'publishedBy', visible: true, minWidth: 110 },
    { title: '操作', field: 'actions', visible: true, minWidth: 280, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const q = query.value || {}
      const updatedAt = q.updatedAt
      const data = await fetchSchemaAssetPage({
        page: page.value,
        pageSize: pageSize.value,
        name: q.name || undefined,
        code: q.code || undefined,
        enabled: q.enabled === '' || q.enabled == null ? undefined : q.enabled,
        publishStatus: q.publishStatus || undefined,
        updatedAtStart: Array.isArray(updatedAt) ? updatedAt[0] : undefined,
        updatedAtEnd: Array.isArray(updatedAt) ? updatedAt[1] : undefined,
      })
      tableData.value = data?.items || []
      total.value = data?.total || 0
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败')
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
