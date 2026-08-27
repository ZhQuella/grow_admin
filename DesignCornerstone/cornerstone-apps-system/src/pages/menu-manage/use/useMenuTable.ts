import { computed, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import type { SystemMenuNode } from '../../../types/systemMenu'
import { filterMenuTree, sortMenuTree } from './helpers'

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

export function useMenuTable() {
  const message = useMsg()

  const loading = ref(false)
  const sourceTree = ref<SystemMenuNode[]>([])
  const tableKey = ref(0)
  const query = ref<Recordable<any>>({})

  const searchList: SearchBarField[] = [
    {
      labelText: '关键字',
      placeholder: '标题 / 标识 / 访问路径',
      elType: 'GrowInput',
      isDefault: true,
      model: 'keyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '类型',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'menuType',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '目录', value: MenuTypeEnum.DIRECTORY },
        { label: '菜单', value: MenuTypeEnum.MENU },
      ],
    },
    {
      labelText: '显示',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'isVisible',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '显示', value: 'true' },
        { label: '隐藏', value: 'false' },
      ],
    },
  ]

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '标题', field: 'title', visible: true, width: 280 },
    { title: '标识', field: 'name', visible: true, minWidth: 140 },
    { title: '类型', field: 'menuType', visible: true, minWidth: 90 },
    { title: '访问路径', field: 'path', visible: true, minWidth: 140 },
    { title: '组件标识', field: 'componentKey', visible: true, minWidth: 140 },
    { title: '图标', field: 'icon', visible: true, minWidth: 180 },
    { title: '排序', field: 'sort', visible: true, minWidth: 80 },
    { title: '显示', field: 'isVisible', visible: true, minWidth: 80 },
    { title: '缓存', field: 'isKeepAlive', visible: false, minWidth: 80 },
    { title: '固定标签', field: 'affix', visible: false, minWidth: 90 },
    { title: '默认打开', field: 'defaultShow', visible: false, minWidth: 90 },
    { title: '外链', field: 'isExternalPage', visible: false, minWidth: 80 },
    { title: '打开方式', field: 'openMode', visible: false, minWidth: 100 },
    { title: '链接', field: 'link', visible: false, minWidth: 160 },
    { title: '操作', field: 'actions', visible: true, minWidth: 200, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  const tableData = computed(() => filterMenuTree(sourceTree.value, query.value || {}))

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchSystemMenuTree()
      sourceTree.value = sortMenuTree(Array.isArray(data) ? data : [])
      tableKey.value += 1
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      loading.value = false
    }
  }

  function onSearch(data: Recordable<any>) {
    query.value = data || {}
  }

  function onColumnsConfirm(columns: ColumnBarItem[]) {
    tableColumns.value = columns as ManageTableColumn[]
  }

  return {
    loading,
    sourceTree,
    tableKey,
    tableData,
    searchList,
    tableColumns,
    leafColumns,
    loadList,
    onSearch,
    onColumnsConfirm,
  }
}
