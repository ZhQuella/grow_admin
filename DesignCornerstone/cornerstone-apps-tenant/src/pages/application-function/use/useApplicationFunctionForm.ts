import { computed, reactive, ref } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import {
  createApplicationFunction,
  updateApplicationFunction,
} from '../../../api/applicationFunction'
import type { ApplicationFunctionNode } from '../../../types/applicationFunction'

export type MenuKind = 'app' | 'automation' | 'external'
export type AutomationType = 'sandbox' | 'lowcode' | 'report'

type FormModel = {
  title: string
  path: string
  icon: string
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
  sourceList: { value: ApplicationFunctionNode[] }
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

function emptyForm(): FormModel {
  return {
    title: '',
    path: '',
    icon: '',
    menuKind: 'app',
    automationType: 'lowcode',
    automationPage: '',
    enabled: true,
    description: '',
    isVisible: true,
    isKeepAlive: true,
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

function resolveMenuKind(row: ApplicationFunctionNode): MenuKind {
  if (row.isExternalPage || row.openMode === PageOpenModeEnum.IFRAME || row.openMode === PageOpenModeEnum.BROWSER || row.link) {
    return 'external'
  }
  if (row.pageType) {
    return 'automation'
  }
  return 'app'
}

function collectUsedAutomationPages(
  nodes: ApplicationFunctionNode[],
  excludedName = '',
  result = new Set<string>(),
) {
  nodes.forEach((node) => {
    if (node.name !== excludedName && node.pageDataId) {
      result.add(node.pageDataId)
    }
    if (node.children?.length) {
      collectUsedAutomationPages(node.children, excludedName, result)
    }
  })
  return result
}

function normalizeRoutePath(value: string) {
  return value.trim().split('/').filter(Boolean).join('/')
}

function resolveAutomationBasePath(path: string, pageId: string) {
  const normalizedPath = normalizeRoutePath(path)
  const suffix = `/${pageId}`
  return normalizedPath.endsWith(suffix)
    ? normalizedPath.slice(0, -suffix.length)
    : normalizedPath
}

export function useApplicationFunctionForm(options: UseMenuFormOptions) {
  const message = useMsg() as any

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const originalName = ref('')
  const formModel = reactive<FormModel>(emptyForm())
  const isAutomationMenu = computed(() => formModel.menuKind === 'automation')
  const isExternalMenu = computed(() => formModel.menuKind === 'external')
  const showPath = computed(() => !isExternalMenu.value)
  const usedAutomationPages = computed(() => collectUsedAutomationPages(
    options.sourceList.value,
    formMode.value === 'edit' ? originalName.value : '',
  ))

  const menuKindOptions = [
    { label: '应用页面', value: 'app' },
    { label: '自动化页面', value: 'automation' },
    { label: '外部页面', value: 'external' },
  ]

  const automationTypeOptions = [
    { label: '沙箱页面', value: 'sandbox' },
    { label: '低代码页面', value: 'lowcode' },
    { label: '报表页面', value: 'report' },
  ]

  const automationPageOptions = computed(() => {
    const options = formModel.automationType === 'lowcode'
      ? LOWCODE_PAGE_OPTIONS
      : formModel.automationType === 'report'
        ? REPORT_PAGE_OPTIONS
        : SANDBOX_PAGE_OPTIONS
    return options.filter((item) => (
      item.value === formModel.automationPage
      || !usedAutomationPages.value.has(item.value)
    ))
  })

  const automationPagePlaceholder = computed(() => (
    automationPageOptions.value.length ? '请选择页面' : '当前类型没有可用页面'
  ))

  const openModeOptions = [
    { label: '内嵌 iframe', value: PageOpenModeEnum.IFRAME },
    { label: '浏览器新标签', value: PageOpenModeEnum.BROWSER },
  ]

  const formRules = {
    menuKind: [{
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请选择功能类型'))
          return
        }
        callback()
      },
      trigger: 'change',
    }],
    title: [{ required: true, message: '请填写功能名称', trigger: 'blur' }],
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
        if (usedAutomationPages.value.has(String(value))) {
          callback(new Error('该页面已被使用'))
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
    if (kind === 'app') {
      formModel.isExternalPage = false
      formModel.openMode = PageOpenModeEnum.ROUTE
      formModel.link = ''
      return
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

  function onAutomationTypeChange() {
    formModel.automationPage = ''
  }

  function openCreate() {
    formMode.value = 'create'
    originalName.value = ''
    applyForm(emptyForm())
    formVisible.value = true
  }

  function openEdit(row: ApplicationFunctionNode) {
    formMode.value = 'edit'
    originalName.value = row.name
    const menuKind = resolveMenuKind(row)
    const automationPage = menuKind === 'automation' ? row.pageDataId || '' : ''
    applyForm({
      title: row.title,
      path: menuKind === 'automation'
        ? resolveAutomationBasePath(row.path, automationPage)
        : row.path,
      icon: row.icon || '',
      menuKind,
      automationType: row.pageType || 'lowcode',
      automationPage,
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
    if (isAutomationMenu.value && formModel.automationPage) {
      return formModel.automationPage
    }
    if (formMode.value === 'edit' && originalName.value) return originalName.value
    if (isExternalMenu.value) return `ExternalPage_${Date.now()}`
    const fromPath = toMenuName(formModel.path)
    if (fromPath) return fromPath
    return `Menu_${Date.now()}`
  }

  function buildPayload() {
    const name = resolveName()
    const basePath = normalizeRoutePath(formModel.path)
    const path = isAutomationMenu.value && formModel.automationPage
      ? `${basePath}/${formModel.automationPage}`
      : basePath || (isExternalMenu.value ? name : '')
    return {
      parentName: undefined,
      name,
      title: formModel.title.trim(),
      path,
      icon: formModel.icon.trim() || undefined,
      menuType: MenuTypeEnum.MENU,
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
      pageDataId: isAutomationMenu.value ? formModel.automationPage : undefined,
      pageType: isAutomationMenu.value ? formModel.automationType : undefined,
    }
  }

  async function submitForm() {
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      const payload = buildPayload()
      if (formMode.value === 'create') {
        await createApplicationFunction(payload)
        message.success('创建成功')
      } else {
        await updateApplicationFunction(originalName.value, payload)
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
    isAutomationMenu,
    isExternalMenu,
    showPath,
    menuKindOptions,
    automationTypeOptions,
    automationPageOptions,
    automationPagePlaceholder,
    openModeOptions,
    onMenuKindChange,
    onAutomationTypeChange,
    openCreate,
    openEdit,
    submitForm,
  }
}
