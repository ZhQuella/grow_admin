import { computed, reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import {
  createSystemMenu,
  fetchSystemMenuCodeImpact,
  updateSystemMenu,
} from '../../../api/systemMenu'
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
  customComponentKey: boolean
  icon: string
  menuType: MenuTypeEnum
  menuKind: MenuKind
  automationType: AutomationType
  automationPage: string
  enabled: boolean
  description: string
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

const SANDBOX_PAGE_OPTIONS = [
  { label: '示例欢迎页', value: 'demo_welcome' },
  { label: '示例工作台', value: 'demo_workbench' },
]

function emptyForm(menuType: MenuTypeEnum): FormModel {
  return {
    parentName: undefined,
    name: '',
    title: '',
    path: '',
    componentKey: '',
    customComponentKey: false,
    icon: '',
    menuType,
    menuKind: 'app',
    automationType: 'lowcode',
    automationPage: '',
    enabled: true,
    description: '',
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

async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) {
    throw new Error('表单未就绪')
  }
  const result = await form.validate()
  if (result === false) {
    throw new Error('校验未通过')
  }
}

function resolveMenuKind(row: SystemMenuNode): MenuKind {
  if (row.isExternalPage || row.openMode === PageOpenModeEnum.IFRAME || row.openMode === PageOpenModeEnum.BROWSER || row.link) {
    return 'external'
  }
  return 'app'
}

export function useMenuForm(options: UseMenuFormOptions) {
  const message = useMsg() as any
  const dialog = useDialog() as any

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const originalName = ref('')
  const formModel = reactive<FormModel>(emptyForm(MenuTypeEnum.MENU))

  const parentTreeData = computed(() => {
    const disabledNames = new Set<string>()
    if (formMode.value === 'edit' && originalName.value) {
      const current = findNodeByName(options.sourceTree.value, originalName.value)
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
  const showComponentKey = computed(() => isAppMenu.value || isAutomationMenu.value)

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

  const automationPagePlaceholder = computed(() => '请选择页面')

  const openModeOptions = [
    { label: '内嵌 iframe', value: PageOpenModeEnum.IFRAME },
    { label: '浏览器新标签', value: PageOpenModeEnum.BROWSER },
  ]

  const formRules = {
    name: [{
      required: true,
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        const name = String(value || '').trim()
        if (!name) {
          callback(new Error('请填写标识'))
          return
        }
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
          callback(new Error('标识需以字母开头，仅含字母、数字和下划线'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
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
    title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
    path: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!showPath.value) {
          callback()
          return
        }
        if (!String(value || '').trim()) {
          callback(new Error('请填写访问路径'))
          return
        }
        if (!/^[A-Za-z0-9_\-/:]+$/.test(String(value))) {
          callback(new Error('访问路径仅含字母数字、中划线、下划线、斜杠或冒号'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
    automationType: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!isAutomationMenu.value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请选择页面类型'))
          return
        }
        callback()
      },
      trigger: 'change',
    }],
    automationPage: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!isAutomationMenu.value) {
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
    formModel.customComponentKey = kind === 'automation'
    if (!formModel.customComponentKey) {
      formModel.componentKey = ''
    }
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

  function onCustomComponentKeyChange(value: boolean) {
    if (isAutomationMenu.value) {
      formModel.customComponentKey = true
      return
    }
    formModel.customComponentKey = value
    if (!value) {
      formModel.componentKey = ''
    }
  }

  function onAutomationTypeChange() {
    formModel.automationPage = ''
  }

  function openCreate(menuType: MenuTypeEnum = MenuTypeEnum.MENU, parentName?: string) {
    formMode.value = 'create'
    originalName.value = ''
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
    originalName.value = row.name
    const menuKind = row.menuType === MenuTypeEnum.MENU ? resolveMenuKind(row) : 'app'
    const storedKey = row.componentKey || ''
    const customComponentKey = menuKind === 'automation'
      || (menuKind === 'app' && Boolean(storedKey && storedKey !== row.name))
    applyForm({
      parentName: findParentName(options.sourceTree.value, row.name),
      name: row.name,
      title: row.title,
      path: row.path,
      componentKey: customComponentKey ? storedKey : '',
      customComponentKey,
      icon: row.icon || '',
      menuType: row.menuType,
      menuKind,
      automationType: 'lowcode',
      automationPage: '',
      enabled: row.enabled !== false,
      description: row.description || '',
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

  function toMenuName(value: string) {
    const slug = value.trim().replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+|_+$/g, '')
    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(slug)) return slug
    if (slug && /^[0-9]/.test(slug)) return `M_${slug}`
    return ''
  }

  function resolveName() {
    if (formModel.name.trim()) return formModel.name.trim()
    const fromKey = formModel.customComponentKey ? toMenuName(formModel.componentKey) : ''
    if (fromKey) return fromKey
    const fromPath = toMenuName(formModel.path)
    if (fromPath) return fromPath
    return `Menu_${Date.now()}`
  }

  function resolveComponentKey() {
    if (!isAppMenu.value && !isAutomationMenu.value) {
      return formModel.componentKey.trim() || undefined
    }
    if (formModel.customComponentKey) {
      const key = formModel.componentKey.trim()
      if (key) return key
    }
    return resolveName() || undefined
  }

  function buildPayload() {
    return {
      parentName: formModel.parentName || undefined,
      name: resolveName(),
      title: formModel.title.trim(),
      path: formModel.path.trim() || (isExternalMenu.value ? resolveName() : ''),
      componentKey: resolveComponentKey(),
      icon: formModel.icon.trim() || undefined,
      menuType: formModel.menuType,
      enabled: formModel.enabled,
      description: formModel.description.trim() || undefined,
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
    return !isAutomationMenu.value
  }

  function confirmCodeChange(content: string): Promise<boolean> {
    if (dialog && typeof (dialog as any).warning === 'function' && (dialog as any).warning.length <= 1) {
      return new Promise((resolve) => {
        ;(dialog as any).warning({
          title: '修改标识确认',
          content,
          positiveText: '确认修改',
          negativeText: '取消',
          onPositiveClick: () => resolve(true),
          onNegativeClick: () => resolve(false),
          onClose: () => resolve(false),
        })
      })
    }
    if (dialog && typeof (dialog as any).confirm === 'function') {
      const result = (dialog as any).confirm(content, '修改标识确认', {
        type: 'warning',
        confirmButtonText: '确认修改',
        cancelButtonText: '取消',
      })
      if (result && typeof result.then === 'function') {
        return result.then(() => true).catch(() => false)
      }
    }
    return Promise.resolve(window.confirm(content))
  }

  async function submitForm() {
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    if (!shouldPersist()) {
      formVisible.value = false
      return
    }

    formSubmitting.value = true
    try {
      const payload = buildPayload()
      if (formMode.value === 'create') {
        await createSystemMenu(payload)
        message.success('创建成功')
      } else {
        if (payload.name !== originalName.value) {
          const impact = await fetchSystemMenuCodeImpact(originalName.value)
          const ok = await confirmCodeChange(
            `菜单标识将由「${originalName.value}」改为「${payload.name}」。受影响：角色菜单授权 ${impact.roleMenuGrantCount} 项、功能 ${impact.functionCount} 项、数据表 ${impact.tableCount} 张、数据权限 ${impact.dataPermissionCount} 项；确认后将同步更新引用。`,
          )
          if (!ok) return
        }
        await updateSystemMenu(originalName.value, payload)
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
    showComponentKey,
    onCustomComponentKeyChange,
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
