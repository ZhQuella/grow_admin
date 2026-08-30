import { computed, reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import {
  fetchSystemMenuColumnImpact,
  fetchSystemMenuColumns,
  fetchSystemMenuTableDeleteImpact,
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
  originalCode: string
  tableCode: string
  title: string
  code: string
  columnType: ColumnType
  enabled: boolean
  columnPermission: boolean
  formFill: boolean
  queryFilter: boolean
  sort: number
  description: string
}

type TableFormModel = {
  originalCode: string
  title: string
  code: string
  description: string
  sort: number
}

function emptyForm(): FormModel {
  return {
    id: '',
    originalCode: '',
    tableCode: '',
    title: '',
    code: '',
    columnType: 'string',
    enabled: true,
    columnPermission: true,
    formFill: true,
    queryFilter: true,
    sort: 10,
    description: '',
  }
}

function emptyTableForm(): TableFormModel {
  return {
    originalCode: '',
    title: '',
    code: '',
    description: '',
    sort: 10,
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
  const message = useMsg() as any
  const dialog = useDialog() as any

  const listVisible = ref(false)
  const listSaving = ref(false)
  const list = ref<SystemMenuColumn[]>([])
  const tables = ref<SystemMenuTable[]>([])
  const menu = ref<SystemMenuNode | null>(null)
  const persistedColumnIds = ref<Set<string>>(new Set())
  const persistedTableCodeByCurrent = ref<Map<string, string>>(new Map())

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const tableFormVisible = ref(false)
  const tableFormMode = ref<'create' | 'edit'>('create')
  const tableFormRef = ref()
  const tableFormModel = reactive<TableFormModel>(emptyTableForm())

  const groupedTables = computed(() => [...tables.value]
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
    .map((table) => ({
      ...table,
      items: list.value
        .filter((item) => item.tableCode === table.code)
        .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN')),
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
      persistedTableCodeByCurrent.value = new Map(
        tables.value.map((item) => [item.code, item.code]),
      )
      persistedColumnIds.value = new Set(list.value.map((item) => item.id))
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
    const maxSort = tables.value.reduce((max, item) => Math.max(max, Number(item.sort ?? 0)), 0)
    tableFormMode.value = 'create'
    Object.assign(tableFormModel, { ...emptyTableForm(), sort: maxSort + 10 })
    tableFormVisible.value = true
  }

  function openEditTable(row: SystemMenuTable) {
    tableFormMode.value = 'edit'
    Object.assign(tableFormModel, {
      originalCode: row.code,
      title: row.title,
      code: row.code,
      description: row.description || '',
      sort: Number(row.sort ?? 10),
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
      description: tableFormModel.description.trim(),
      sort: Number(tableFormModel.sort ?? 0),
    }
    if (!payload.title || !payload.code) return

    if (tableFormMode.value === 'create') {
      tables.value = [...tables.value, payload]
    } else {
      const from = tableFormModel.originalCode
      const persistedCode = persistedTableCodeByCurrent.value.get(from)
      tables.value = tables.value.map((item) => (
        item.code === from ? payload : item
      ))
      if (from !== payload.code) {
        persistedTableCodeByCurrent.value.delete(from)
        if (persistedCode) persistedTableCodeByCurrent.value.set(payload.code, persistedCode)
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
    const menuName = menu.value?.name
    if (!menuName) return
    let impact = {
      fieldCount: list.value.filter((item) => item.tableCode === row.code).length,
      columnPermissionCount: 0,
      formConfigCount: 0,
      queryConditionCount: 0,
    }
    const persistedCode = persistedTableCodeByCurrent.value.get(row.code)
    if (persistedCode) {
      try {
        impact = await fetchSystemMenuTableDeleteImpact(menuName, persistedCode)
      } catch (error) {
        message.error(toMessage(error, '加载影响范围失败'))
        return
      }
    }
    const ok = await confirmWarning(dialog, {
      title: '删除确认',
      content: `确认删除表「${row.title}」？将同时删除字段 ${impact.fieldCount} 个，并清理列权限 ${impact.columnPermissionCount} 项、表单配置 ${impact.formConfigCount} 项、查询条件 ${impact.queryConditionCount} 项。`,
      confirmText: '删除',
    })
    if (!ok) return
    persistedTableCodeByCurrent.value.delete(row.code)
    tables.value = tables.value.filter((item) => item.code !== row.code)
    list.value = list.value.filter((item) => item.tableCode !== row.code)
  }

  function openCreate(tableCode: string) {
    const maxSort = list.value
      .filter((item) => item.tableCode === tableCode)
      .reduce((max, item) => Math.max(max, Number(item.sort ?? 0)), 0)
    formMode.value = 'create'
    Object.assign(formModel, {
      ...emptyForm(),
      tableCode,
      sort: maxSort + 10,
    })
    formVisible.value = true
  }

  function openEdit(row: SystemMenuColumn) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      id: row.id,
      originalCode: row.code,
      tableCode: row.tableCode,
      title: row.title,
      code: row.code,
      columnType: isColumnType(row.columnType) ? row.columnType : 'string',
      enabled: row.enabled !== false,
      columnPermission: row.columnPermission !== false,
      formFill: row.formFill !== false,
      queryFilter: row.queryFilter !== false,
      sort: Number(row.sort ?? 10),
      description: row.description || '',
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
      enabled: formModel.enabled,
      columnPermission: formModel.columnPermission,
      formFill: formModel.formFill,
      queryFilter: formModel.queryFilter,
      sort: Number(formModel.sort ?? 0),
      description: formModel.description.trim(),
    }
    if (!payload.title || !payload.code) return

    if (formMode.value === 'create') {
      list.value = [
        ...list.value,
        {
          id: nextDraftId(),
          menuName,
          ...payload,
        },
      ]
    } else {
      if (payload.code !== formModel.originalCode && persistedColumnIds.value.has(formModel.id)) {
        let impact
        try {
          impact = await fetchSystemMenuColumnImpact(formModel.id)
        } catch (error) {
          message.error(toMessage(error, '加载影响范围失败'))
          return
        }
        const total = impact.columnPermissionCount + impact.formConfigCount + impact.queryConditionCount
        if (total > 0) {
          const ok = await confirmWarning(dialog, {
            title: '修改标识确认',
            content: `字段标识将由「${formModel.originalCode}」改为「${payload.code}」。受影响：列权限 ${impact.columnPermissionCount} 项、表单配置 ${impact.formConfigCount} 项、查询条件 ${impact.queryConditionCount} 项；确认后保留现有配置。`,
            confirmText: '确认修改',
          })
          if (!ok) return
        }
      }
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

  function onDelete(row: SystemMenuColumn) {
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
          description: item.description,
          sort: item.sort,
        })),
        items: list.value.map((item) => ({
          id: item.id,
          tableCode: item.tableCode,
          title: item.title,
          code: item.code,
          columnType: item.columnType,
          enabled: item.enabled,
          columnPermission: item.columnPermission,
          formFill: item.formFill,
          queryFilter: item.queryFilter,
          sort: item.sort,
          description: item.description,
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
