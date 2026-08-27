import { computed, reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import {
  fetchSystemMenuColumns,
  saveSystemMenuColumns,
} from '../../../../api/systemMenuColumn'
import type { SystemMenuNode } from '../../../../types/systemMenu'
import {
  MENU_COLUMN_CODE_MESSAGE,
  MENU_COLUMN_CODE_PATTERN,
  isColumnType,
  type ColumnType,
  type SystemMenuColumn,
  type SystemMenuTable,
} from '../../../../types/systemMenuColumn'

type FormModel = {
  id: string
  tableCode: string
  title: string
  code: string
  columnType: ColumnType
  enabled: boolean
}

type TableFormModel = {
  originalCode: string
  title: string
  code: string
}

function emptyForm(): FormModel {
  return {
    id: '',
    tableCode: '',
    title: '',
    code: '',
    columnType: 'string',
    enabled: true,
  }
}

function emptyTableForm(): TableFormModel {
  return {
    originalCode: '',
    title: '',
    code: '',
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
  return `mc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
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

export function useMenuColumns() {
  const message = useMsg()
  const dialog = useDialog()

  const listVisible = ref(false)
  const listSaving = ref(false)
  const list = ref<SystemMenuColumn[]>([])
  const tables = ref<SystemMenuTable[]>([])
  const menu = ref<SystemMenuNode | null>(null)

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const tableFormVisible = ref(false)
  const tableFormMode = ref<'create' | 'edit'>('create')
  const tableFormRef = ref()
  const tableFormModel = reactive<TableFormModel>(emptyTableForm())

  const groupedTables = computed(() => tables.value.map((table) => ({
    ...table,
    items: list.value.filter((item) => item.tableCode === table.code),
  })))

  const currentTableTitle = computed(() => (
    tables.value.find((item) => item.code === formModel.tableCode)?.title || formModel.tableCode
  ))

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
        if (!MENU_COLUMN_CODE_PATTERN.test(code)) {
          callback(new Error(MENU_COLUMN_CODE_MESSAGE))
          return
        }
        const duplicated = list.value.some(
          (item) => item.tableCode === formModel.tableCode && item.code === code && item.id !== formModel.id,
        )
        if (duplicated) {
          callback(new Error('标识在当前表下已存在'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }],
    columnType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  }

  const tableFormRules = {
    title: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [{
      required: true,
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        const code = String(value || '').trim()
        if (!code) {
          callback(new Error('请填写标识'))
          return
        }
        if (!MENU_COLUMN_CODE_PATTERN.test(code)) {
          callback(new Error(MENU_COLUMN_CODE_MESSAGE))
          return
        }
        const duplicated = tables.value.some(
          (item) => item.code === code && item.code !== tableFormModel.originalCode,
        )
        if (duplicated) {
          callback(new Error('表标识在当前菜单下已存在'))
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
      const data = await fetchSystemMenuColumns(menuName)
      tables.value = Array.isArray(data?.tables) ? data.tables.map((item) => ({ ...item })) : []
      list.value = Array.isArray(data?.items) ? data.items.map((item) => ({
        ...item,
        columnType: isColumnType(item.columnType) ? item.columnType : 'string',
      })) : []
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    }
  }

  function open(row: SystemMenuNode) {
    menu.value = row
    list.value = []
    tables.value = []
    listVisible.value = true
    void loadList()
  }

  function closeList() {
    listVisible.value = false
  }

  function openCreateTable() {
    tableFormMode.value = 'create'
    Object.assign(tableFormModel, emptyTableForm())
    tableFormVisible.value = true
  }

  function openEditTable(row: SystemMenuTable) {
    tableFormMode.value = 'edit'
    Object.assign(tableFormModel, {
      originalCode: row.code,
      title: row.title,
      code: row.code,
    })
    tableFormVisible.value = true
  }

  async function submitTableForm() {
    try {
      await validateGrowForm(tableFormRef)
    } catch {
      return
    }

    const payload = {
      title: tableFormModel.title.trim(),
      code: tableFormModel.code.trim(),
    }
    if (!payload.title || !payload.code) return

    if (tableFormMode.value === 'create') {
      tables.value = [...tables.value, payload]
    } else {
      const from = tableFormModel.originalCode
      tables.value = tables.value.map((item) => (
        item.code === from ? payload : item
      ))
      if (from !== payload.code) {
        list.value = list.value.map((item) => (
          item.tableCode === from
            ? { ...item, tableCode: payload.code, tableTitle: payload.title }
            : item
        ))
      } else {
        list.value = list.value.map((item) => (
          item.tableCode === payload.code ? { ...item, tableTitle: payload.title } : item
        ))
      }
    }

    tableFormVisible.value = false
  }

  async function onDeleteTable(row: SystemMenuTable) {
    const count = list.value.filter((item) => item.tableCode === row.code).length
    const ok = await confirmWarning(dialog, {
      title: '删除确认',
      content: count
        ? `确认删除表「${row.title}」及其 ${count} 个列？`
        : `确认删除表「${row.title}」？`,
      confirmText: '删除',
    })
    if (!ok) return
    tables.value = tables.value.filter((item) => item.code !== row.code)
    list.value = list.value.filter((item) => item.tableCode !== row.code)
  }

  function openCreate(tableCode: string) {
    formMode.value = 'create'
    Object.assign(formModel, {
      ...emptyForm(),
      tableCode,
    })
    formVisible.value = true
  }

  function openEdit(row: SystemMenuColumn) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      id: row.id,
      tableCode: row.tableCode,
      title: row.title,
      code: row.code,
      columnType: isColumnType(row.columnType) ? row.columnType : 'string',
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

    const table = tables.value.find((item) => item.code === formModel.tableCode)
    const payload = {
      title: formModel.title.trim(),
      code: formModel.code.trim(),
      columnType: formModel.columnType,
      tableCode: formModel.tableCode,
      tableTitle: table?.title || formModel.tableCode,
    }
    if (!payload.title || !payload.code) return

    if (formMode.value === 'create') {
      list.value = [
        ...list.value,
        {
          id: nextDraftId(),
          menuName,
          enabled: true,
          ...payload,
        },
      ]
    } else {
      list.value = list.value.map((item) => (
        item.id === formModel.id ? { ...item, ...payload } : item
      ))
    }

    formVisible.value = false
  }

  async function onToggleEnabled(row: SystemMenuColumn, enabled: boolean) {
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用列「${row.title}」？停用后该列将不可分配。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    row.enabled = enabled
  }

  async function onDelete(row: SystemMenuColumn) {
    const ok = await confirmWarning(dialog, {
      title: '删除确认',
      content: `确认移除列「${row.title}」？`,
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
      await saveSystemMenuColumns({
        menuName,
        tables: tables.value.map((item) => ({
          code: item.code,
          title: item.title,
        })),
        items: list.value.map((item) => ({
          id: item.id,
          tableCode: item.tableCode,
          title: item.title,
          code: item.code,
          columnType: item.columnType,
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
    tables,
    groupedTables,
    listVisible,
    listSaving,
    formVisible,
    formMode,
    formRef,
    formModel,
    formRules,
    currentTableTitle,
    tableFormVisible,
    tableFormMode,
    tableFormRef,
    tableFormModel,
    tableFormRules,
    open,
    closeList,
    openCreateTable,
    openEditTable,
    submitTableForm,
    onDeleteTable,
    openCreate,
    openEdit,
    onToggleEnabled,
    submitForm,
    saveList,
    onDelete,
  }
}
