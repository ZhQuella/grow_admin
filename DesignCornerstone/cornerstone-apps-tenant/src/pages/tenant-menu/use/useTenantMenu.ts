import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
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

type AssemblyFormModel = {
  menuType: MenuTypeEnum
  functionName: string
  title: string
  name: string
  icon: string
  parentName: string
  sort: number
  enabled: boolean
  isVisible: boolean
  isKeepAlive: boolean
  affix: boolean
  defaultShow: boolean
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
  const editingName = ref('')
  const formModel = reactive<AssemblyFormModel>({
    menuType: MenuTypeEnum.MENU,
    functionName: '',
    title: '',
    name: '',
    icon: '',
    parentName: '',
    sort: 10,
    enabled: true,
    isVisible: true,
    isKeepAlive: true,
    affix: false,
    defaultShow: false,
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

  const usedMenuNames = computed(() => {
    const result = new Set<string>()
    const collect = (nodes: TenantMenuNode[]) => {
      nodes.forEach((node) => {
        result.add(node.name)
        if (node.children?.length) collect(node.children)
      })
    }
    collect(sourceTree.value)
    return result
  })

  const functionCandidates = computed(() => {
    const items = [...availableFunctions.value]
    if (formMode.value === 'edit' && editingName.value && !items.some((item) => item.name === editingName.value)) {
      const current = findMenuNode(sourceTree.value, editingName.value)
      if (current?.menuType === MenuTypeEnum.MENU) items.push(current)
    }
    return items.filter((item) => (
      item.menuType === MenuTypeEnum.MENU
      && !item.isExternalPage
      && !item.pageType
      && item.openMode !== PageOpenModeEnum.IFRAME
      && item.openMode !== PageOpenModeEnum.BROWSER
      && (item.enabled !== false || item.name === editingName.value)
      && (item.name === editingName.value || !usedMenuNames.value.has(item.name))
    ))
  })

  const functionOptions = computed(() => functionCandidates.value
    .map((item) => ({
      label: `${item.title}（${item.name}）`,
      value: item.name,
    })))

  const functionPlaceholder = computed(() => (
    functionOptions.value.length ? '请选择已授权功能' : '当前没有可用应用功能'
  ))

  const parentTreeData = computed(() => {
    const editing = formMode.value === 'edit'
      ? findMenuNode(sourceTree.value, editingName.value)
      : undefined
    const excluded = editing ? new Set(collectMenuNames(editing)) : new Set<string>()
    return toDirectoryOptions(sourceTree.value, excluded)
  })

  const formTitle = computed(() => {
    return formMode.value === 'create' ? '新增' : '编辑'
  })

  const menuTypeOptions = [
    { label: '目录', value: MenuTypeEnum.DIRECTORY },
    { label: '菜单', value: MenuTypeEnum.MENU },
  ]

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
      menuType: MenuTypeEnum.MENU,
      functionName: '',
      title: '',
      name: '',
      icon: '',
      parentName: '',
      sort: 10,
      enabled: true,
      isVisible: true,
      isKeepAlive: true,
      affix: false,
      defaultShow: false,
    })
  }

  function openCreate() {
    if (!selectedTenantId.value) return
    formMode.value = 'create'
    editingName.value = ''
    resetAssemblyForm()
    formVisible.value = true
  }

  function openEditItem(row: TenantMenuNode) {
    formMode.value = 'edit'
    editingName.value = row.name
    Object.assign(formModel, {
      menuType: row.menuType,
      functionName: row.menuType === MenuTypeEnum.MENU ? row.name : '',
      title: row.title,
      name: row.name,
      icon: row.icon || '',
      parentName: findMenuParentName(sourceTree.value, row.name),
      sort: Number(row.sort ?? 0),
      enabled: row.enabled !== false,
      isVisible: row.isVisible !== false,
      isKeepAlive: Boolean(row.isKeepAlive),
      affix: Boolean(row.affix),
      defaultShow: Boolean(row.defaultShow),
    })
    formVisible.value = true
  }

  function onFunctionChange(name: string) {
    const item = functionCandidates.value.find((option) => option.name === name)
    if (!item) return
    Object.assign(formModel, {
      functionName: item.name,
      title: item.title,
      name: item.name,
      icon: item.icon || '',
      sort: Number(item.sort ?? 10),
      enabled: item.enabled !== false,
      isVisible: item.isVisible !== false,
      isKeepAlive: item.isKeepAlive !== false,
      affix: Boolean(item.affix),
      defaultShow: Boolean(item.defaultShow),
    })
  }

  function submitAssemblyItem() {
    const title = formModel.title.trim()
    if (!title) {
      message.warning(formModel.menuType === MenuTypeEnum.DIRECTORY ? '请填写标题' : '请填写菜单名称')
      return
    }

    const currentNode = formMode.value === 'edit'
      ? findMenuNode(sourceTree.value, editingName.value)
      : undefined
    if (
      formModel.menuType === MenuTypeEnum.MENU
      && currentNode?.menuType === MenuTypeEnum.DIRECTORY
      && currentNode.children?.length
    ) {
      message.warning('包含子菜单的目录不能改为菜单')
      return
    }

    if (formModel.menuType === MenuTypeEnum.DIRECTORY) {
      const name = formModel.name.trim()
      if (!name) {
        message.warning('请填写标识')
        return
      }
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        message.warning('标识需以字母开头，仅含字母、数字和下划线')
        return
      }
      const duplicate = findMenuNode(sourceTree.value, name)
      if (duplicate && duplicate.name !== editingName.value) {
        message.warning('标识已存在')
        return
      }
    } else if (!formModel.functionName) {
      message.warning('请选择应用功能')
      return
    }

    const tree = cloneMenuTree(sourceTree.value)
    const current = formMode.value === 'edit'
      ? detachMenuNode(tree, editingName.value)
      : undefined
    let node: TenantMenuNode

    if (formModel.menuType === MenuTypeEnum.DIRECTORY) {
      const originalTitle = current?.originTitle || current?.title || title
      node = {
        ...(current || {
          source: 'tenant' as const,
          children: [],
        }),
        source: current?.menuType === MenuTypeEnum.DIRECTORY ? current.source : 'tenant',
        name: formModel.name.trim(),
        title,
        originTitle: title === originalTitle ? undefined : originalTitle,
        path: current?.menuType === MenuTypeEnum.DIRECTORY ? current.path : '',
        icon: formModel.icon.trim() || undefined,
        menuType: MenuTypeEnum.DIRECTORY,
        enabled: formModel.enabled,
        isVisible: formModel.isVisible,
        isKeepAlive: formModel.isKeepAlive,
        affix: formModel.affix,
        defaultShow: formModel.defaultShow,
        sort: Number(formModel.sort ?? 0),
        isExternalPage: false,
        openMode: undefined,
        link: undefined,
        pageDataId: undefined,
        pageType: undefined,
      }
    } else {
      const available = functionCandidates.value.find((item) => item.name === formModel.functionName)
      if (!available) {
        message.warning('请选择应用功能')
        return
      }
      const originalTitle = available.originTitle || available.title
      node = {
        ...cloneMenuTree([available])[0],
        title,
        originTitle: title === originalTitle ? undefined : originalTitle,
        icon: formModel.icon.trim() || undefined,
        enabled: formModel.enabled,
        isVisible: formModel.isVisible,
        isKeepAlive: formModel.isKeepAlive,
        affix: formModel.affix,
        defaultShow: formModel.defaultShow,
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
    formModel,
    formTitle,
    menuTypeOptions,
    functionOptions,
    functionPlaceholder,
    parentTreeData,
    selectTenant,
    openCreate,
    openEditItem,
    onFunctionChange,
    submitAssemblyItem,
    deleteItem,
    saveAssembly,
    onSearch,
    onColumnsConfirm,
  }
}
