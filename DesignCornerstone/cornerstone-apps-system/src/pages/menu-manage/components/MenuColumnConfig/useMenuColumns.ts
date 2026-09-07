import { computed, ref } from 'vue'
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
  type SystemMenuColumn,
  type SystemMenuTable,
} from '../../../../types/systemMenuColumn'

export type EditableTable = SystemMenuTable & { uid: string }
export type EditableColumn = SystemMenuColumn & { tableUid: string }

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

function nextDraftId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
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
  const list = ref<EditableColumn[]>([])
  const tables = ref<EditableTable[]>([])
  const menu = ref<SystemMenuNode | null>(null)
  const persistedColumnIds = ref<Set<string>>(new Set())
  const persistedColumnCodeById = ref<Map<string, string>>(new Map())
  const persistedTableCodeByUid = ref<Map<string, string>>(new Map())
  const formRef = ref()
  const formModel = computed(() => ({ tables: tables.value, items: list.value }))

  const groupedTables = computed(() => tables.value.map((table) => ({
    ...table,
    items: list.value.filter((item) => item.tableUid === table.uid),
  })))

  const titleRules = [{ required: true, message: '请填写名称', trigger: 'blur' }]
  const columnTypeRules = [{ required: true, message: '请选择类型', trigger: 'change' }]

  function tableCodeRules(uid: string) {
    return [{
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
        const duplicated = tables.value.some((item) => item.uid !== uid && item.code.trim() === code)
        if (duplicated) {
          callback(new Error('表标识在当前菜单下已存在'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }]
  }

  function columnCodeRules(id: string, tableUid: string) {
    return [{
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
          (item) => item.id !== id && item.tableUid === tableUid && item.code.trim() === code,
        )
        if (duplicated) {
          callback(new Error('标识在当前表下已存在'))
          return
        }
        callback()
      },
      trigger: 'blur',
    }]
  }

  function itemIndex(id: string) {
    return list.value.findIndex((item) => item.id === id)
  }

  async function loadList() {
    const menuName = menu.value?.name
    if (!menuName) return

    try {
      const data = await fetchSystemMenuColumns(menuName)
      const nextTables = (Array.isArray(data?.tables) ? data.tables : [])
        .slice()
        .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
        .map((item) => ({ ...item, uid: nextDraftId('mt') }))
      const uidByCode = new Map(nextTables.map((item) => [item.code, item.uid]))
      tables.value = nextTables
      list.value = (Array.isArray(data?.items) ? data.items : [])
        .slice()
        .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
        .map((item) => ({
          ...item,
          columnType: isColumnType(item.columnType) ? item.columnType : 'string',
          tableUid: uidByCode.get(item.tableCode) || '',
        }))
      persistedTableCodeByUid.value = new Map(nextTables.map((item) => [item.uid, item.code]))
      persistedColumnIds.value = new Set(list.value.map((item) => item.id))
      persistedColumnCodeById.value = new Map(list.value.map((item) => [item.id, item.code]))
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

  function addTable() {
    tables.value = [
      ...tables.value,
      {
        uid: nextDraftId('mt'),
        title: '',
        code: '',
        description: '',
        sort: (tables.value.length + 1) * 10,
      },
    ]
  }

  function addColumn(table: EditableTable) {
    const menuName = menu.value?.name
    if (!menuName) return
    list.value = [
      ...list.value,
      {
        id: nextDraftId('mc'),
        menuName,
        tableUid: table.uid,
        tableCode: table.code,
        tableTitle: table.title,
        title: '',
        code: '',
        columnType: 'string',
        enabled: true,
        columnPermission: true,
        formFill: true,
        queryFilter: true,
        sort: list.value.filter((item) => item.tableUid === table.uid).length * 10 + 10,
        description: '',
      },
    ]
  }

  async function onDeleteTable(row: EditableTable) {
    const menuName = menu.value?.name
    if (!menuName) return
    const fieldCount = list.value.filter((item) => item.tableUid === row.uid).length
    if (!persistedTableCodeByUid.value.has(row.uid) && !row.title.trim() && !row.code.trim() && !fieldCount) {
      tables.value = tables.value.filter((item) => item.uid !== row.uid)
      return
    }

    let impact = {
      fieldCount,
      columnPermissionCount: 0,
      formConfigCount: 0,
      queryConditionCount: 0,
    }
    const persistedCode = persistedTableCodeByUid.value.get(row.uid)
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
      content: `确认删除表「${row.title || row.code || '未命名'}」？将同时删除字段 ${impact.fieldCount} 个，并清理列权限 ${impact.columnPermissionCount} 项、表单配置 ${impact.formConfigCount} 项、查询条件 ${impact.queryConditionCount} 项。`,
      confirmText: '删除',
    })
    if (!ok) return
    persistedTableCodeByUid.value.delete(row.uid)
    tables.value = tables.value.filter((item) => item.uid !== row.uid)
    list.value = list.value.filter((item) => item.tableUid !== row.uid)
  }

  async function onToggleEnabled(row: EditableColumn, enabled: boolean) {
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用列「${row.title || row.code || '未命名'}」？停用后该列将不可分配。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    row.enabled = enabled
  }

  function onDelete(row: EditableColumn) {
    if (!persistedColumnIds.value.has(row.id) && !row.title.trim() && !row.code.trim()) {
      list.value = list.value.filter((item) => item.id !== row.id)
      return
    }
    list.value = list.value.filter((item) => item.id !== row.id)
  }

  async function confirmChangedCodes() {
    const changed = list.value.filter((item) => {
      const original = persistedColumnCodeById.value.get(item.id)
      return Boolean(original && original !== item.code.trim())
    })
    for (const item of changed) {
      let impact
      try {
        impact = await fetchSystemMenuColumnImpact(item.id)
      } catch (error) {
        message.error(toMessage(error, '加载影响范围失败'))
        return false
      }
      const total = impact.columnPermissionCount + impact.formConfigCount + impact.queryConditionCount
      if (total <= 0) continue
      const original = persistedColumnCodeById.value.get(item.id) || ''
      const ok = await confirmWarning(dialog, {
        title: '修改标识确认',
        content: `字段标识将由「${original}」改为「${item.code.trim()}」。受影响：列权限 ${impact.columnPermissionCount} 项、表单配置 ${impact.formConfigCount} 项、查询条件 ${impact.queryConditionCount} 项；确认后保留现有配置。`,
        confirmText: '确认修改',
      })
      if (!ok) return false
    }
    return true
  }

  async function saveList() {
    const menuName = menu.value?.name
    if (!menuName) return

    if (tables.value.length) {
      try {
        await validateGrowForm(formRef)
      } catch {
        return
      }
    }

    if (!(await confirmChangedCodes())) return

    listSaving.value = true
    try {
      await saveSystemMenuColumns({
        menuName,
        tables: tables.value.map((item, index) => ({
          code: item.code.trim(),
          title: item.title.trim(),
          description: item.description.trim(),
          sort: (index + 1) * 10,
        })),
        items: tables.value.flatMap((table, tableIndex) => (
          list.value
            .filter((item) => item.tableUid === table.uid)
            .map((item, index) => ({
              id: item.id,
              tableCode: table.code.trim(),
              title: item.title.trim(),
              code: item.code.trim(),
              columnType: item.columnType,
              enabled: item.enabled,
              columnPermission: item.columnPermission,
              formFill: item.formFill,
              queryFilter: item.queryFilter,
              sort: tableIndex * 1000 + (index + 1) * 10,
              description: item.description.trim(),
            }))
        )),
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
    list,
    groupedTables,
    listVisible,
    listSaving,
    formRef,
    formModel,
    titleRules,
    columnTypeRules,
    tableCodeRules,
    columnCodeRules,
    itemIndex,
    open,
    closeList,
    addTable,
    addColumn,
    onDeleteTable,
    onToggleEnabled,
    saveList,
    onDelete,
  }
}
