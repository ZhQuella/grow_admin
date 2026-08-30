import { reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import {
  fetchSystemMenuFunctionDeleteImpact,
  fetchSystemMenuFunctions,
  saveSystemMenuFunctions,
} from '../../../../api/systemMenuFunction'
import type { SystemMenuNode } from '../../../../types/systemMenu'
import {
  MENU_FUNCTION_CODE_MESSAGE,
  MENU_FUNCTION_CODE_PATTERN,
  type SystemMenuFunction,
} from '../../../../types/systemMenuFunction'

type FormModel = {
  id: string
  title: string
  code: string
  group: string
  description: string
  sort: number
  enabled: boolean
}

function emptyForm(): FormModel {
  return {
    id: '',
    title: '',
    code: '',
    group: '',
    description: '',
    sort: 10,
    enabled: true,
  }
}

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
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

function nextDraftId() {
  return `mf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function sortFunctions(items: SystemMenuFunction[]) {
  return [...items].sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
}

function confirmWarning(dialog: any, options: {
  title: string
  content: string
  confirmText: string
}): Promise<boolean> {
  const { title, content, confirmText } = options

  if (dialog && typeof dialog.warning === 'function' && dialog.warning.length <= 1) {
    return new Promise((resolve) => {
      dialog.warning({
        title,
        content,
        positiveText: confirmText,
        negativeText: '取消',
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  }

  if (dialog && typeof dialog.confirm === 'function') {
    const result = dialog.confirm(content, title, {
      type: 'warning',
      confirmButtonText: confirmText,
      cancelButtonText: '取消',
    })
    if (result && typeof result.then === 'function') {
      return result.then(() => true).catch(() => false)
    }
  }

  return Promise.resolve(window.confirm(content))
}

export function useMenuFunctions() {
  const message = useMsg() as any
  const dialog = useDialog() as any

  const listVisible = ref(false)
  const listSaving = ref(false)
  const list = ref<SystemMenuFunction[]>([])
  const persistedIds = ref<Set<string>>(new Set())
  const menu = ref<SystemMenuNode | null>(null)

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const formRules = {
    title: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [{
      required: true,
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        const code = String(value || '').trim()
        if (!code) {
          callback(new Error('请填写标识'))
          return
        }
        if (!MENU_FUNCTION_CODE_PATTERN.test(code)) {
          callback(new Error(MENU_FUNCTION_CODE_MESSAGE))
          return
        }
        const duplicated = list.value.some(
          (item) => item.code === code && item.id !== formModel.id,
        )
        if (duplicated) {
          callback(new Error('标识在当前菜单下已存在'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
  }

  async function loadList() {
    const menuName = menu.value?.name
    if (!menuName) return

    try {
      const data = await fetchSystemMenuFunctions(menuName)
      list.value = sortFunctions(Array.isArray(data) ? data.map((item) => ({ ...item })) : [])
      persistedIds.value = new Set(list.value.map((item) => item.id))
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    }
  }

  function open(row: SystemMenuNode) {
    menu.value = row
    list.value = []
    listVisible.value = true
    void loadList()
  }

  function closeList() {
    listVisible.value = false
  }

  function openCreate() {
    const maxSort = list.value.reduce((max, item) => Math.max(max, Number(item.sort ?? 0)), 0)
    formMode.value = 'create'
    Object.assign(formModel, {
      ...emptyForm(),
      sort: maxSort + 10,
    })
    formVisible.value = true
  }

  function openEdit(row: SystemMenuFunction) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      id: row.id,
      title: row.title,
      code: row.code,
      group: row.group || '',
      description: row.description || '',
      sort: Number(row.sort ?? 10),
      enabled: row.enabled !== false,
    })
    formVisible.value = true
  }

  async function submitForm() {
    const menuName = menu.value?.name
    if (!menuName) return

    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    const payload = {
      title: formModel.title.trim(),
      code: formModel.code.trim(),
      group: formModel.group.trim(),
      description: formModel.description.trim(),
      sort: Number(formModel.sort ?? 0),
    }
    if (!payload.title || !payload.code) return

    if (formMode.value === 'create') {
      list.value = sortFunctions([
        ...list.value,
        {
          id: nextDraftId(),
          menuName,
          enabled: true,
          ...payload,
        },
      ])
    } else {
      list.value = sortFunctions(list.value.map((item) => (
        item.id === formModel.id ? { ...item, ...payload } : item
      )))
    }

    formVisible.value = false
  }

  async function onToggleEnabled(row: SystemMenuFunction, enabled: boolean) {
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用功能「${row.title}」？停用后该功能将不可用。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    row.enabled = enabled
  }

  async function onDelete(row: SystemMenuFunction) {
    let roleGrantCount = 0
    if (persistedIds.value.has(row.id)) {
      try {
        const impact = await fetchSystemMenuFunctionDeleteImpact(row.id)
        roleGrantCount = impact.roleGrantCount
      } catch (error) {
        message.error(toMessage(error, '加载影响范围失败'))
        return
      }
    }
    const ok = await confirmWarning(dialog, {
      title: '删除确认',
      content: `确认移除功能「${row.title}」？将同步清理角色功能授权 ${roleGrantCount} 项。`,
      confirmText: '删除',
    })
    if (!ok) return
    list.value = list.value.filter((item) => item.id !== row.id)
  }

  async function saveList() {
    const menuName = menu.value?.name
    if (!menuName) return

    listSaving.value = true
    try {
      await saveSystemMenuFunctions({
        menuName,
        items: list.value.map((item) => ({
          id: item.id,
          title: item.title,
          code: item.code,
          group: item.group,
          description: item.description,
          sort: item.sort,
          enabled: item.enabled,
        })),
      })
      message.success('保存成功')
      listVisible.value = false
    } catch (error) {
      message.error(toMessage(error, '保存失败'))
    } finally {
      listSaving.value = false
    }
  }

  return {
    menu,
    list,
    listVisible,
    listSaving,
    formVisible,
    formMode,
    formRef,
    formModel,
    formRules,
    open,
    closeList,
    openCreate,
    openEdit,
    onToggleEnabled,
    submitForm,
    saveList,
    onDelete,
  }
}
