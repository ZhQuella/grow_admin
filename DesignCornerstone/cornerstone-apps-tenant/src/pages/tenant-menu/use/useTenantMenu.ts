import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { fetchSystemTenantOptions } from '../../../api/systemTenant'
import { fetchTenantMenuTree } from '../../../api/systemTenantMenu'
import type { SystemTenantOption } from '../../../types/systemTenant'
import type { TenantMenuNode } from '../../../types/systemTenantMenu'
import { filterMenuTree, toMessage } from './helpers'

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

export function useTenantMenu() {
  const message = useMsg() as any

  const tenantKeyword = ref('')
  const tenants = ref<SystemTenantOption[]>([])
  const selectedTenantId = ref('')
  const treeLoading = ref(false)
  const sourceTree = ref<TenantMenuNode[]>([])
  const tableKey = ref(0)
  const query = ref<Recordable<any>>({})

  const searchList = reactive<SearchBarField[]>([
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
      labelText: '来源',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'source',
      label: 'label',
      value: 'value',
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '平台下发', value: 'platform' },
        { label: '租户自建', value: 'tenant' },
      ],
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
    {
      labelText: '状态',
      elType: 'GrowSelect',
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
  ])

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '标题', field: 'title', visible: true, width: 280 },
    { title: '来源', field: 'source', visible: true, minWidth: 100 },
    { title: '标识', field: 'name', visible: true, minWidth: 140 },
    { title: '类型', field: 'menuType', visible: true, minWidth: 90 },
    { title: '访问路径', field: 'path', visible: true, minWidth: 140 },
    { title: '组件标识', field: 'componentKey', visible: true, minWidth: 140 },
    { title: '图标', field: 'icon', visible: true, minWidth: 180 },
    { title: '排序', field: 'sort', visible: true, minWidth: 80 },
    { title: '状态', field: 'enabled', visible: true, minWidth: 90 },
    { title: '显示', field: 'isVisible', visible: true, minWidth: 80 },
    { title: '缓存', field: 'isKeepAlive', visible: false, minWidth: 80 },
    { title: '固定标签', field: 'affix', visible: false, minWidth: 90 },
    { title: '默认打开', field: 'defaultShow', visible: false, minWidth: 90 },
    { title: '外链', field: 'isExternalPage', visible: false, minWidth: 80 },
    { title: '打开方式', field: 'openMode', visible: false, minWidth: 100 },
    { title: '链接', field: 'link', visible: false, minWidth: 160 },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  const filteredTenants = computed(() => {
    const keyword = tenantKeyword.value.trim().toLowerCase()
    if (!keyword) return tenants.value
    return tenants.value.filter((item) => {
      const haystack = `${item.tenantName} ${item.tenantCode}`.toLowerCase()
      return haystack.includes(keyword)
    })
  })

  const selectedTenant = computed(() => (
    tenants.value.find((item) => item.id === selectedTenantId.value) || null
  ))

  const tableData = computed(() => filterMenuTree(sourceTree.value, query.value || {}))

  async function loadTenants() {
    try {
      tenants.value = (await fetchSystemTenantOptions()) || []
      if (!selectedTenantId.value && tenants.value.length) {
        selectedTenantId.value = tenants.value[0].id
      }
    } catch (error) {
      message.error(toMessage(error, '加载租户失败'))
    }
  }

  async function loadTree(tenantId: string) {
    if (!tenantId) {
      sourceTree.value = []
      return
    }
    treeLoading.value = true
    try {
      const data = await fetchTenantMenuTree(tenantId)
      sourceTree.value = Array.isArray(data?.tree) ? data.tree : []
      tableKey.value += 1
    } catch (error) {
      sourceTree.value = []
      message.error(toMessage(error, '加载菜单失败'))
    } finally {
      treeLoading.value = false
    }
  }

  function selectTenant(id: string) {
    selectedTenantId.value = id
  }

  function onSearch(data: Recordable<any>) {
    query.value = data || {}
  }

  function onColumnsConfirm(columns: ColumnBarItem[]) {
    tableColumns.value = columns as ManageTableColumn[]
  }

  watch(selectedTenantId, (id) => {
    query.value = {}
    void loadTree(id)
  })

  onMounted(() => {
    void loadTenants()
  })

  return {
    tenantKeyword,
    tenants,
    filteredTenants,
    selectedTenantId,
    selectedTenant,
    treeLoading,
    tableData,
    tableKey,
    searchList,
    tableColumns,
    leafColumns,
    selectTenant,
    onSearch,
    onColumnsConfirm,
  }
}
