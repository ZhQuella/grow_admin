import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { createSystemMenu, updateSystemMenu } from '../../../api/systemMenu'
import type { SystemMenuNode } from '../../../types/systemMenu'
import { toParentTreeData, findParentName, findNodeByName, collectNodeNames } from './helpers'

export type MenuKind = 'app' | 'automation' | 'external'
export type AutomationType = 'sandbox' | 'lowcode' | 'report'

type FormModel = {
  parentName?: string
  name: string
  title: string
  path: string
  componentKey: string
  icon: string
  menuType: MenuTypeEnum
  menuKind: MenuKind
  automationType: AutomationType
  automationPage: string
  isVisible: boolean
  isKeepAlive: boolean
  affix: boolean
  defaultShow: boolean
  sort: number
  isExternalPage: boolean
  openMode: PageOpenModeEnum
  link: string
}

type UseMenuFormOptions = {
  sourceTree: { value: SystemMenuNode[] }
  onSuccess: () => void | Promise<void>
}

const LOWCODE_PAGE_OPTIONS = [
  { label: '示例表单', value: 'lowcode-form-demo' },
  { label: '示例页面', value: 'lowcode-page-demo' },
]

const REPORT_PAGE_OPTIONS = [
  { label: '销售报表', value: 'report-sales' },
  { label: '分析报表', value: 'report-analysis' },
]

const SANDBOX_PAGE_OPTIONS: Array<{ label: string, value: string }> = []

function emptyForm(menuType: MenuTypeEnum): FormModel {
  return {
    parentName: undefined,
    name: '',
    title: '',
    path: '',
    componentKey: '',
    icon: '',
    menuType,
    menuKind: 'app',
    automationType: 'lowcode',
    automationPage: '',
    isVisible: true,
    isKeepAlive: menuType === MenuTypeEnum.MENU,
    affix: false,
    defaultShow: false,
    sort: 10,
    isExternalPage: false,
    openMode: PageOpenModeEnum.ROUTE,
    link: '',
  }
}

function resolveMenuKind(row: SystemMenuNode): MenuKind {
  if (row.isExternalPage || row.openMode === PageOpenModeEnum.IFRAME || row.openMode === PageOpenModeEnum.BROWSER || row.link) {
    return 'external'
  }
  return 'app'
}

export function useMenuForm(options: UseMenuFormOptions) {
  const message = useMsg()

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref<{ validate?: () => Promise<boolean> } | null>(null)
  const formModel = reactive<FormModel>(emptyForm(MenuTypeEnum.MENU))

  const parentTreeData = computed(() => {
    const disabledNames = new Set<string>()
    if (formMode.value === 'edit' && formModel.name) {
      const current = findNodeByName(options.sourceTree.value, formModel.name)
      if (current) {
        collectNodeNames(current).forEach((name) => disabledNames.add(name))
      }
    }
    return toParentTreeData(options.sourceTree.value, disabledNames)
  })
  const isMenu = computed(() => formModel.menuType === MenuTypeEnum.MENU)
  const isAppMenu = computed(() => isMenu.value && formModel.menuKind === 'app')
  const isAutomationMenu = computed(() => isMenu.value && formModel.menuKind === 'automation')
  const isExternalMenu = computed(() => isMenu.value && formModel.menuKind === 'external')
  const showPath = computed(() => !isExternalMenu.value)

  const menuTypeOptions = [
    { label: '目录', value: MenuTypeEnum.DIRECTORY },
    { label: '菜单', value: MenuTypeEnum.MENU },
  ]

  const menuKindOptions = [
    { label: '系统内应用', value: 'app' },
    { label: '自动化菜单', value: 'automation' },
    { label: '外部页面', value: 'external' },
  ]

  const automationTypeOptions = [
    { label: '沙箱页面', value: 'sandbox' },
    { label: '低代码页面', value: 'lowcode' },
    { label: '报表页面', value: 'report' },
  ]

  const automationPageOptions = computed(() => {
    if (formModel.automationType === 'lowcode') return LOWCODE_PAGE_OPTIONS
    if (formModel.automationType === 'report') return REPORT_PAGE_OPTIONS
    return SANDBOX_PAGE_OPTIONS
  })

  const automationPagePlaceholder = computed(() => {
    if (formModel.automationType === 'sandbox') return '沙箱管理尚未接入'
    return '请选择页面'
  })

  const openModeOptions = [
    { label: '内嵌 iframe', value: PageOpenModeEnum.IFRAME },
    { label: '浏览器新标签', value: PageOpenModeEnum.BROWSER },
  ]

  const formRules = {
    menuType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    menuKind: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (isMenu.value && !value) {
          callback(new Error('请选择菜单类型'))
          return
        }
        callback()
      },
      trigger: 'change',
    }],
    name: [
      { required: true, message: '请填写标识', trigger: 'blur' },
      {
        pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
        message: '标识需以字母开头，仅含字母数字下划线',
        trigger: 'blur',
      },
    ],
    title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
    path: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!showPath.value) {
          callback()
          return
        }
        if (!String(value || '').trim()) {
          callback(new Error('请填写路径'))
          return
        }
        if (!/^[A-Za-z0-9_\-/:]+$/.test(String(value))) {
          callback(new Error('路径仅含字母数字、中划线、下划线、斜杠或冒号'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
    componentKey: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (isAppMenu.value && !String(value || '').trim()) {
          callback(new Error('请填写组件标识'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
    automationPage: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!isAutomationMenu.value || formModel.automationType === 'sandbox') {
          callback()
          return
        }
        if (!String(value || '').trim()) {
          callback(new Error('请选择页面'))
          return
        }
        callback()
      },
      trigger: 'change',
    }],
    openMode: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (isExternalMenu.value && !value) {
          callback(new Error('请选择打开方式'))
          return
        }
        callback()
      },
      trigger: 'change',
    }],
    link: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (isExternalMenu.value && !String(value || '').trim()) {
          callback(new Error('请填写链接'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
  }

  function applyForm(model: FormModel) {
    Object.assign(formModel, model)
  }

  function onMenuKindChange(kind: MenuKind) {
    formModel.menuKind = kind
    formModel.automationPage = ''
    if (kind === 'external') {
      formModel.isExternalPage = true
      if (formModel.openMode === PageOpenModeEnum.ROUTE) {
        formModel.openMode = PageOpenModeEnum.IFRAME
      }
      return
    }
    formModel.isExternalPage = false
    formModel.openMode = PageOpenModeEnum.ROUTE
    formModel.link = ''
  }

  function onAutomationTypeChange() {
    formModel.automationPage = ''
  }

  function openCreate(menuType: MenuTypeEnum = MenuTypeEnum.MENU, parentName?: string) {
    formMode.value = 'create'
    applyForm({
      ...emptyForm(menuType),
      parentName,
    })
    formVisible.value = true
  }

  function openCreateChild(row: SystemMenuNode, menuType: MenuTypeEnum = MenuTypeEnum.MENU) {
    openCreate(menuType, row.name)
  }

  function openEdit(row: SystemMenuNode) {
    formMode.value = 'edit'
    const menuKind = row.menuType === MenuTypeEnum.MENU ? resolveMenuKind(row) : 'app'
    applyForm({
      parentName: findParentName(options.sourceTree.value, row.name),
      name: row.name,
      title: row.title,
      path: row.path,
      componentKey: row.componentKey || (row.menuType === MenuTypeEnum.MENU ? row.name : ''),
      icon: row.icon || '',
      menuType: row.menuType,
      menuKind,
      automationType: 'lowcode',
      automationPage: '',
      isVisible: row.isVisible !== false,
      isKeepAlive: Boolean(row.isKeepAlive),
      affix: Boolean(row.affix),
      defaultShow: Boolean(row.defaultShow),
      sort: Number(row.sort ?? 10),
      isExternalPage: menuKind === 'external',
      openMode: menuKind === 'external'
        ? (row.openMode === PageOpenModeEnum.BROWSER ? PageOpenModeEnum.BROWSER : PageOpenModeEnum.IFRAME)
        : PageOpenModeEnum.ROUTE,
      link: row.link || '',
    })
    formVisible.value = true
  }

  function buildPayload() {
    return {
      parentName: formModel.parentName || undefined,
      name: formModel.name.trim(),
      title: formModel.title.trim(),
      path: formModel.path.trim(),
      componentKey: isAppMenu.value
        ? formModel.componentKey.trim()
        : (formModel.componentKey.trim() || undefined),
      icon: formModel.icon.trim() || undefined,
      menuType: formModel.menuType,
      isVisible: formModel.isVisible,
      isKeepAlive: formModel.isKeepAlive,
      affix: formModel.affix,
      defaultShow: formModel.defaultShow,
      sort: Number(formModel.sort ?? 0),
      isExternalPage: isExternalMenu.value,
      openMode: isExternalMenu.value ? formModel.openMode : PageOpenModeEnum.ROUTE,
      link: isExternalMenu.value ? formModel.link.trim() : undefined,
    }
  }

  function shouldPersist() {
    return !isMenu.value || isAppMenu.value
  }

  async function submitForm() {
    try {
      await formRef.value?.validate?.()
    } catch {
      return
    }

    if (!shouldPersist()) {
      formVisible.value = false
      return
    }

    formSubmitting.value = true
    try {
      if (formMode.value === 'create') {
        await createSystemMenu(buildPayload())
        message.success('创建成功')
      } else {
        const { name, ...rest } = buildPayload()
        await updateSystemMenu(name, rest)
        message.success('保存成功')
      }
      formVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      formSubmitting.value = false
    }
  }

  return {
    formVisible,
    formMode,
    formSubmitting,
    formRef,
    formModel,
    formRules,
    parentTreeData,
    isAppMenu,
    isAutomationMenu,
    isExternalMenu,
    showPath,
    menuTypeOptions,
    menuKindOptions,
    automationTypeOptions,
    automationPageOptions,
    automationPagePlaceholder,
    openModeOptions,
    onMenuKindChange,
    onAutomationTypeChange,
    openCreate,
    openCreateChild,
    openEdit,
    submitForm,
  }
}
