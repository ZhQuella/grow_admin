import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemPositionPage } from '../../../api/systemPosition'
import type { SystemPositionListItem } from '../../../types/systemPosition'
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

export function usePositionTable() {
  const message = useMsg() as any

  const loading = ref(false)
  const tableData = ref<SystemPositionListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '名称',
      placeholder: '职级名称',
      elType: 'GrowInput',
      isDefault: true,
      model: 'name',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '编码',
      placeholder: '唯一编码',
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
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '名称', field: 'name', visible: true, minWidth: 140 },
    { title: '编码', field: 'code', visible: true, minWidth: 140 },
    { title: '层级', field: 'level', visible: true, minWidth: 80 },
    { title: '排序号', field: 'sort', visible: true, minWidth: 80 },
    { title: '状态', field: 'enabled', visible: true, minWidth: 90 },
    { title: '任职人数', field: 'assignmentCount', visible: true, minWidth: 90 },
    { title: '操作', field: 'actions', visible: true, minWidth: 120, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemPositionPage({
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
