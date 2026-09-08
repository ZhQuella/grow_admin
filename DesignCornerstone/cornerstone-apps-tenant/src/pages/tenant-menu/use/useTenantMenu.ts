import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { fetchSystemTenantOptions } from '../../../api/systemTenant'
import {
  fetchTenantMenuAssembly,
  saveTenantMenuAssembly,
} from '../../../api/systemTenantMenu'
import type { SystemTenantOption } from '../../../types/systemTenant'
import type { TenantMenuNode } from '../../../types/systemTenantMenu'
import {
  cloneMenuTree,
  collectMenuNames,
  countMenuDescendants,
  detachMenuNode,
  filterMenuTree,
  findMenuNode,
  findMenuParentName,
  insertMenuNode,
  sortMenuTree,
  toDirectoryOptions,
  toMessage,
} from './helpers'

export type ManageTableColumn = ColumnBarItem & {
  width?: number
  minWidth?: number
  fixed?: string | boolean
}

type AssemblyItemKind = 'directory' | 'function'

type AssemblyFormModel = {
  functionName: string
  title: string
  parentName: string
  sort: number
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
  const saveLoading = ref(false)
  const sourceTree = ref<TenantMenuNode[]>([])
  const availableFunctions = ref<TenantMenuNode[]>([])
  const tableKey = ref(0)
  const query = ref<Recordable<any>>({})
  const dirty = ref(false)
  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formKind = ref<AssemblyItemKind>('directory')
  const editingName = ref('')
  const formModel = reactive<AssemblyFormModel>({
    functionName: '',
    title: '',
    parentName: '',
    sort: 10,
  })

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
    { title: '操作', field: 'actions', visible: true, width: 80, fixed: 'right' },
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

  const usedFunctionNames = computed(() => {
    const result = new Set<string>()
    const collect = (nodes: TenantMenuNode[]) => {
      nodes.forEach((node) => {
        if (node.menuType === MenuTypeEnum.MENU) result.add(node.name)
        if (node.children?.length) collect(node.children)
      })
    }
    collect(sourceTree.value)
    return result
  })

  const functionOptions = computed(() => availableFunctions.value
    .filter((item) => item.name === editingName.value || !usedFunctionNames.value.has(item.name))
    .map((item) => ({
      label: `${item.title}（${item.name}）`,
      value: item.name,
    })))

  const parentTreeData = computed(() => {
    const editing = formMode.value === 'edit' && formKind.value === 'directory'
      ? findMenuNode(sourceTree.value, editingName.value)
      : undefined
    const excluded = editing ? new Set(collectMenuNames(editing)) : new Set<string>()
    return toDirectoryOptions(sourceTree.value, excluded)
  })

  const formTitle = computed(() => {
    const action = formMode.value === 'create' ? '新增' : '编辑'
    return `${action}${formKind.value === 'directory' ? '目录' : '应用功能'}`
  })

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
      availableFunctions.value = []
      return
    }
    treeLoading.value = true
    try {
      const data = await fetchTenantMenuAssembly(tenantId)
      sourceTree.value = sortMenuTree(Array.isArray(data?.tree) ? data.tree : [])
      availableFunctions.value = Array.isArray(data?.availableFunctions) ? data.availableFunctions : []
      dirty.value = false
      tableKey.value += 1
    } catch (error) {
      sourceTree.value = []
      availableFunctions.value = []
      message.error(toMessage(error, '加载菜单失败'))
    } finally {
      treeLoading.value = false
    }
  }

  function selectTenant(id: string) {
    if (id === selectedTenantId.value) return
    if (dirty.value && !window.confirm('当前租户的菜单修改尚未保存，确认放弃修改并切换租户？')) return
    selectedTenantId.value = id
  }

  function resetAssemblyForm() {
    Object.assign(formModel, {
      functionName: '',
      title: '',
      parentName: '',
      sort: 10,
    })
  }

  function openCreateDirectory() {
    if (!selectedTenantId.value) return
    formMode.value = 'create'
    formKind.value = 'directory'
    editingName.value = ''
    resetAssemblyForm()
    formVisible.value = true
  }

  function openAddFunction() {
    if (!selectedTenantId.value) return
    formMode.value = 'create'
    formKind.value = 'function'
    editingName.value = ''
    resetAssemblyForm()
    if (!functionOptions.value.length) {
      message.warning('没有可添加的已授权应用功能')
      return
    }
    formVisible.value = true
  }

  function openEditItem(row: TenantMenuNode) {
    formMode.value = 'edit'
    formKind.value = row.menuType === MenuTypeEnum.DIRECTORY ? 'directory' : 'function'
    editingName.value = row.name
    Object.assign(formModel, {
      functionName: row.menuType === MenuTypeEnum.MENU ? row.name : '',
      title: row.title,
      parentName: findMenuParentName(sourceTree.value, row.name),
      sort: Number(row.sort ?? 0),
    })
    formVisible.value = true
  }

  function onFunctionChange(name: string) {
    const item = availableFunctions.value.find((option) => option.name === name)
    if (!item) return
    formModel.title = item.title
    formModel.sort = Number(item.sort ?? 10)
  }

  function submitAssemblyItem() {
    const title = formModel.title.trim()
    if (!title) {
      message.warning('请填写显示名称')
      return
    }

    const tree = cloneMenuTree(sourceTree.value)
    const current = formMode.value === 'edit'
      ? detachMenuNode(tree, editingName.value)
      : undefined
    let node: TenantMenuNode

    if (formKind.value === 'directory') {
      const originalTitle = current?.originTitle || current?.title || title
      const timestamp = Date.now()
      node = {
        ...(current || {
          name: `TenantDirectory_${timestamp}`,
          path: `tenant-directory-${timestamp}`,
          icon: 'ant-design:folder-outlined',
          source: 'tenant' as const,
          menuType: MenuTypeEnum.DIRECTORY,
          enabled: true,
          isVisible: true,
          isKeepAlive: false,
          children: [],
        }),
        title,
        originTitle: title === originalTitle ? undefined : originalTitle,
        sort: Number(formModel.sort ?? 0),
      }
    } else {
      const available = availableFunctions.value.find((item) => item.name === formModel.functionName)
      if (!available) {
        message.warning('请选择应用功能')
        return
      }
      const originalTitle = available.originTitle || available.title
      node = {
        ...cloneMenuTree([available])[0],
        title,
        originTitle: title === originalTitle ? undefined : originalTitle,
        sort: Number(formModel.sort ?? 0),
        children: undefined,
      }
    }

    if (!insertMenuNode(tree, node, formModel.parentName)) {
      message.warning('挂载目录不存在，请重新选择')
      return
    }
    sourceTree.value = sortMenuTree(tree)
    dirty.value = true
    formVisible.value = false
    tableKey.value += 1
  }

  function deleteItem(row: TenantMenuNode) {
    const descendantCount = countMenuDescendants(row)
    const suffix = descendantCount ? `，并一并移除其下 ${descendantCount} 项内容` : ''
    if (!window.confirm(`确认移除「${row.title}」${suffix}？`)) return
    const tree = cloneMenuTree(sourceTree.value)
    detachMenuNode(tree, row.name)
    sourceTree.value = tree
    dirty.value = true
    tableKey.value += 1
  }

  async function saveAssembly() {
    if (!selectedTenantId.value || saveLoading.value) return
    saveLoading.value = true
    try {
      const data = await saveTenantMenuAssembly({
        tenantId: selectedTenantId.value,
        tree: cloneMenuTree(sourceTree.value),
      })
      sourceTree.value = sortMenuTree(Array.isArray(data?.tree) ? data.tree : [])
      availableFunctions.value = Array.isArray(data?.availableFunctions) ? data.availableFunctions : []
      dirty.value = false
      tableKey.value += 1
      message.success('菜单配置已保存')
    } catch (error) {
      message.error(toMessage(error, '保存菜单失败'))
    } finally {
      saveLoading.value = false
    }
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
    saveLoading,
    dirty,
    tableData,
    tableKey,
    searchList,
    tableColumns,
    leafColumns,
    formVisible,
    formMode,
    formKind,
    formModel,
    formTitle,
    functionOptions,
    parentTreeData,
    selectTenant,
    openCreateDirectory,
    openAddFunction,
    openEditItem,
    onFunctionChange,
    submitAssemblyItem,
    deleteItem,
    saveAssembly,
    onSearch,
    onColumnsConfirm,
  }
}
