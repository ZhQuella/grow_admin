import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import {
  activateSystemTenant,
  clearSystemTenantData,
  deleteSystemTenant,
  disableSystemTenant,
  fetchSystemTenantApplicationFunctions,
  fetchSystemTenantClearImpact,
  fetchSystemTenantGrantDetail,
  fetchSystemTenantGrantColumns,
  saveSystemTenantGrant,
  trialSystemTenant,
  updateSystemTenantCode,
} from '../../../api/systemTenant'
import type {
  SystemTenantClearImpact,
  SystemTenantGrantColumn,
  SystemTenantGrantDetail,
  SystemTenantGrantMenu,
  SystemTenantListItem,
} from '../../../types/systemTenant'
import { availableTenantActions, todayDate, toMessage, validateGrowForm } from './helpers'

type UseTenantActionsOptions = {
  onSuccess: () => void | Promise<void>
}

function flattenGrantMenus(nodes: SystemTenantGrantMenu[]): SystemTenantGrantMenu[] {
  return nodes.flatMap((node) => [node, ...flattenGrantMenus(node.children || [])])
}

export function useTenantActions(options: UseTenantActionsOptions) {
  const message = useMsg() as any

  const periodVisible = ref(false)
  const periodMode = ref<'trial' | 'activate'>('trial')
  const periodSubmitting = ref(false)
  const periodTarget = ref<SystemTenantListItem | null>(null)
  const periodFormRef = ref()
  const periodForm = reactive({
    expiredOn: '',
    graceDays: 0,
    remark: '',
  })
  const periodRules = {
    expiredOn: [
      { required: true, message: '请选择结束日期', trigger: 'change' },
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          if (value && value < todayDate()) {
            callback(new Error('结束日期不能早于开始日期'))
            return
          }
          callback()
        },
        trigger: 'change',
      },
    ],
    graceDays: [
      { required: true, type: 'number', min: 0, message: '宽限天数不能小于 0', trigger: 'change' },
    ],
  }

  const disableVisible = ref(false)
  const disableSubmitting = ref(false)
  const disableTarget = ref<SystemTenantListItem | null>(null)
  const disableFormRef = ref()
  const disableForm = reactive({ remark: '' })

  const codeVisible = ref(false)
  const codeSubmitting = ref(false)
  const codeTarget = ref<SystemTenantListItem | null>(null)
  const codeFormRef = ref()
  const codeForm = reactive({
    newTenantCode: '',
    confirmTenantCode: '',
    remark: '',
  })
  const codeRules = {
    newTenantCode: [
      { required: true, message: '请填写新编码', trigger: 'blur' },
      { min: 5, max: 12, message: '租户编码为 5～12 个字符', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含大小写字母、数字和下划线', trigger: 'blur' },
    ],
    confirmTenantCode: [
      { required: true, message: '请再次输入新编码', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          if (String(value || '').trim() !== codeForm.newTenantCode.trim()) {
            callback(new Error('确认文本必须等于新编码'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  const deleteVisible = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemTenantListItem | null>(null)
  const deleteFormRef = ref()
  const deleteForm = reactive({
    confirmTenantCode: '',
    remark: '',
  })
  const deleteRules = {
    confirmTenantCode: [
      { required: true, message: '请输入租户编码确认', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          if (String(value || '').trim() !== deleteTarget.value?.tenantCode) {
            callback(new Error('确认编码必须与当前租户编码一致'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  const clearVisible = ref(false)
  const clearLoading = ref(false)
  const clearSubmitting = ref(false)
  const clearTarget = ref<SystemTenantListItem | null>(null)
  const clearImpact = ref<SystemTenantClearImpact | null>(null)
  const clearFormRef = ref()
  const clearForm = reactive({
    confirmTenantCode: '',
    remark: '',
  })
  const clearRules = {
    confirmTenantCode: [
      { required: true, message: '请输入租户编码确认', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          if (String(value || '').trim() !== clearTarget.value?.tenantCode) {
            callback(new Error('确认编码必须与当前租户编码一致'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  const grantVisible = ref(false)
  const grantLoading = ref(false)
  const grantSubmitting = ref(false)
  const grantTarget = ref<SystemTenantListItem | null>(null)
  const grantDetail = ref<SystemTenantGrantDetail | null>(null)
  const grantApplications = ref<SystemTenantGrantMenu[]>([])
  const grantColumns = ref<SystemTenantGrantColumn[]>([])
  const grantMenuIds = ref<string[]>([])
  const grantFunctionIds = ref<string[]>([])
  const grantColumnIds = ref<string[]>([])
  const grantActiveMenuId = ref('')
  const grantPermissionTab = ref<'functions' | 'columns'>('functions')
  const grantFunctionsWithMenu = ref(true)

  const grantActiveMenu = computed(() => {
    if (!grantActiveMenuId.value) return null
    return grantApplications.value.find((item) => item.id === grantActiveMenuId.value) || null
  })
  const grantActiveFunctions = computed(() => grantActiveMenu.value?.functions || [])
  const grantActiveColumns = computed(() => grantColumns.value.filter(
    (item) => item.menuName === grantActiveMenuId.value,
  ))
  const grantActiveColumnGroups = computed(() => {
    const groups = new Map<string, { code: string; title: string; items: SystemTenantGrantColumn[] }>()
    grantActiveColumns.value.forEach((item) => {
      const group = groups.get(item.tableCode) || {
        code: item.tableCode,
        title: item.tableTitle || item.tableCode,
        items: [],
      }
      group.items.push(item)
      groups.set(item.tableCode, group)
    })
    return [...groups.values()]
  })
  const grantAllActiveFunctionsChecked = computed(() => {
    return grantActiveFunctions.value.length > 0
      && grantActiveFunctions.value.every((item) => grantFunctionIds.value.includes(item.id))
  })
  const grantSomeActiveFunctionsChecked = computed(() => {
    return !grantAllActiveFunctionsChecked.value
      && grantActiveFunctions.value.some((item) => grantFunctionIds.value.includes(item.id))
  })
  const grantToggleableActiveColumns = computed(() => grantActiveColumns.value.filter((item) => item.enabled))
  const grantAllActiveColumnsChecked = computed(() => {
    return grantToggleableActiveColumns.value.length > 0
      && grantToggleableActiveColumns.value.every((item) => grantColumnIds.value.includes(item.id))
  })
  const grantSomeActiveColumnsChecked = computed(() => {
    return !grantAllActiveColumnsChecked.value
      && grantToggleableActiveColumns.value.some((item) => grantColumnIds.value.includes(item.id))
  })

  function functionIdsForMenus(menuIds: string[]) {
    const ids = new Set<string>()
    menuIds.forEach((menuId) => {
      const menu = grantApplications.value.find((item) => item.id === menuId)
      if (!menu) return
      menu.functions.forEach((fn) => ids.add(fn.id))
    })
    return [...ids]
  }

  function openPeriod(row: SystemTenantListItem, mode: 'trial' | 'activate') {
    periodMode.value = mode
    periodTarget.value = row
    periodForm.expiredOn = ''
    periodForm.graceDays = row.graceDays || 0
    periodForm.remark = ''
    periodVisible.value = true
  }

  function disablePastPeriodDate(date: Date) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return date.getTime() < start.getTime()
  }

  async function submitPeriod() {
    const target = periodTarget.value
    if (!target) return
    try {
      await validateGrowForm(periodFormRef)
    } catch {
      return
    }
    periodSubmitting.value = true
    try {
      const payload = {
        tenantId: Number(target.id),
        expiredOn: periodForm.expiredOn,
        graceDays: periodForm.graceDays,
        remark: periodForm.remark.trim(),
      }
      if (periodMode.value === 'trial') {
        await trialSystemTenant(payload)
        message.success('已设为试用中')
      } else {
        await activateSystemTenant(payload)
        message.success('已开通')
      }
      periodVisible.value = false
      await options.onSuccess()
    } catch {
      // 错误消息由请求拦截器统一展示。
    } finally {
      periodSubmitting.value = false
    }
  }

  function openDisable(row: SystemTenantListItem) {
    disableTarget.value = row
    disableForm.remark = ''
    disableVisible.value = true
  }

  async function submitDisable() {
    const target = disableTarget.value
    if (!target) return
    try {
      await validateGrowForm(disableFormRef)
    } catch {
      return
    }
    disableSubmitting.value = true
    try {
      await disableSystemTenant({ tenantId: target.id, remark: disableForm.remark.trim() })
      message.success('已停用')
      disableVisible.value = false
      await options.onSuccess()
    } catch {
      return
    } finally {
      disableSubmitting.value = false
    }
  }

  function openCode(row: SystemTenantListItem) {
    codeTarget.value = row
    codeForm.newTenantCode = ''
    codeForm.confirmTenantCode = ''
    codeForm.remark = ''
    codeVisible.value = true
  }

  async function submitCode() {
    const target = codeTarget.value
    if (!target) return
    try {
      await validateGrowForm(codeFormRef)
    } catch {
      return
    }
    codeSubmitting.value = true
    try {
      await updateSystemTenantCode({
        tenantId: target.id,
        newTenantCode: codeForm.newTenantCode.trim(),
        confirmTenantCode: codeForm.confirmTenantCode.trim(),
        remark: codeForm.remark.trim(),
      })
      message.success('编码已修改')
      codeVisible.value = false
      await options.onSuccess()
    } catch {
      return
    } finally {
      codeSubmitting.value = false
    }
  }

  function openDelete(row: SystemTenantListItem) {
    if (!availableTenantActions(row).includes('delete')) return
    deleteTarget.value = row
    deleteForm.confirmTenantCode = ''
    deleteForm.remark = ''
    deleteVisible.value = true
  }

  async function submitDelete() {
    const target = deleteTarget.value
    if (!target) return
    try {
      await validateGrowForm(deleteFormRef)
    } catch {
      return
    }
    if (!availableTenantActions(target).includes('delete')) {
      message.warning('仅未开通或已停用的非内置租户可以删除')
      return
    }
    deleteSubmitting.value = true
    try {
      await deleteSystemTenant({
        tenantId: target.id,
        confirmTenantCode: deleteForm.confirmTenantCode.trim(),
        remark: deleteForm.remark.trim(),
      })
      message.success('已删除')
      deleteVisible.value = false
      await options.onSuccess()
    } catch {
      return
    } finally {
      deleteSubmitting.value = false
    }
  }

  async function openClear(row: SystemTenantListItem) {
    if (!availableTenantActions(row).includes('clear')) return
    clearTarget.value = row
    clearImpact.value = null
    clearForm.confirmTenantCode = ''
    clearForm.remark = ''
    clearVisible.value = true
    clearLoading.value = true
    try {
      clearImpact.value = await fetchSystemTenantClearImpact(row.id)
    } catch (error) {
      message.error(toMessage(error, '加载影响范围失败'))
      clearVisible.value = false
    } finally {
      clearLoading.value = false
    }
  }

  async function submitClear() {
    const target = clearTarget.value
    if (!target) return
    try {
      await validateGrowForm(clearFormRef)
    } catch {
      return
    }
    if (!availableTenantActions(target).includes('clear')) {
      message.warning('仅未开通或已停用的非内置租户可以清空')
      return
    }
    clearSubmitting.value = true
    try {
      await clearSystemTenantData({
        tenantId: target.id,
        confirmTenantCode: clearForm.confirmTenantCode.trim(),
        remark: clearForm.remark.trim(),
      })
      message.success('已清空租户数据')
      clearVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '清空失败'))
    } finally {
      clearSubmitting.value = false
    }
  }

  async function openGrant(row: SystemTenantListItem) {
    grantTarget.value = row
    grantDetail.value = null
    grantApplications.value = []
    grantColumns.value = []
    grantMenuIds.value = []
    grantFunctionIds.value = []
    grantColumnIds.value = []
    grantActiveMenuId.value = ''
    grantPermissionTab.value = 'functions'
    grantFunctionsWithMenu.value = true
    grantVisible.value = true
    grantLoading.value = true
    try {
      const [detail, applicationFunctions, allColumns] = await Promise.all([
        fetchSystemTenantGrantDetail(row.id),
        fetchSystemTenantApplicationFunctions(),
        fetchSystemTenantGrantColumns(),
      ])
      const detailMenus = flattenGrantMenus(detail.tree)
      const applications = (Array.isArray(applicationFunctions) ? applicationFunctions : []).map((item) => {
        const grantMenu = detailMenus.find((menu) => menu.id === item.name)
        return {
          id: item.name,
          title: item.title,
          directory: false,
          functions: grantMenu?.functions || [],
        }
      })
      const applicationIds = new Set(applications.map((item) => item.id))
      const detailColumnIds = new Set(detail.columnIds || [])
      const columns = (Array.isArray(allColumns) ? allColumns : []).filter((item) => (
        applicationIds.has(item.menuName)
        && item.columnPermission
        && (item.enabled || detailColumnIds.has(item.id))
      ))
      const columnIds = new Set(columns.map((item) => item.id))
      grantDetail.value = detail
      grantApplications.value = applications
      grantColumns.value = columns
      grantMenuIds.value = detail.menuIds.filter((id) => applicationIds.has(id))
      grantFunctionIds.value = [...detail.functionIds]
      grantColumnIds.value = [...detailColumnIds].filter((id) => columnIds.has(id))
      grantActiveMenuId.value = applications[0]?.id || ''
    } catch (error) {
      message.error(toMessage(error, '加载授权失败'))
      grantVisible.value = false
    } finally {
      grantLoading.value = false
    }
  }

  function toggleGrantApplication(menuId: string, checked: boolean) {
    grantActiveMenuId.value = menuId
    const nextMenuIds = new Set(grantMenuIds.value)
    if (checked) nextMenuIds.add(menuId)
    else nextMenuIds.delete(menuId)
    grantMenuIds.value = [...nextMenuIds]

    const nextFunctionIds = new Set(grantFunctionIds.value)
    const functionIds = functionIdsForMenus([menuId])
    if (checked && grantFunctionsWithMenu.value) {
      functionIds.forEach((id) => nextFunctionIds.add(id))
    } else if (!checked) {
      functionIds.forEach((id) => nextFunctionIds.delete(id))
    }
    grantFunctionIds.value = [...nextFunctionIds]

    if (checked && grantFunctionsWithMenu.value) {
      const nextColumnIds = new Set(grantColumnIds.value)
      grantColumns.value
        .filter((item) => item.menuName === menuId && item.enabled)
        .forEach((item) => nextColumnIds.add(item.id))
      grantColumnIds.value = [...nextColumnIds]
    } else if (!checked) {
      const activeColumnIds = grantColumns.value
        .filter((item) => item.menuName === menuId)
        .map((item) => item.id)
      grantColumnIds.value = grantColumnIds.value.filter((id) => !activeColumnIds.includes(id))
    }
  }

  function onGrantApplicationClick(data: SystemTenantGrantMenu) {
    grantActiveMenuId.value = data.id
  }

  function toggleGrantFunction(functionId: string, checked: boolean) {
    const set = new Set(grantFunctionIds.value)
    if (checked) set.add(functionId)
    else set.delete(functionId)
    grantFunctionIds.value = [...set]
  }

  function toggleGrantFunctionsWithMenu(checked: boolean) {
    grantFunctionsWithMenu.value = checked
    if (!checked) return
    const set = new Set(grantFunctionIds.value)
    functionIdsForMenus(grantMenuIds.value).forEach((id) => set.add(id))
    grantFunctionIds.value = [...set]
    const columnIds = new Set(grantColumnIds.value)
    grantColumns.value
      .filter((item) => grantMenuIds.value.includes(item.menuName) && item.enabled)
      .forEach((item) => columnIds.add(item.id))
    grantColumnIds.value = [...columnIds]
  }

  function toggleAllGrantActiveFunctions(checked: boolean) {
    const set = new Set(grantFunctionIds.value)
    grantActiveFunctions.value.forEach((item) => {
      if (checked) set.add(item.id)
      else set.delete(item.id)
    })
    grantFunctionIds.value = [...set]
  }

  function toggleGrantColumn(columnId: string, checked: boolean) {
    const set = new Set(grantColumnIds.value)
    if (checked) set.add(columnId)
    else set.delete(columnId)
    grantColumnIds.value = [...set]
  }

  function toggleAllGrantActiveColumns(checked: boolean) {
    const set = new Set(grantColumnIds.value)
    grantToggleableActiveColumns.value.forEach((item) => {
      if (checked) set.add(item.id)
      else set.delete(item.id)
    })
    grantColumnIds.value = [...set]
  }

  async function submitGrant() {
    const target = grantTarget.value
    if (!target) return
    grantSubmitting.value = true
    try {
      await saveSystemTenantGrant({
        tenantId: target.id,
        menuIds: grantMenuIds.value,
        functionIds: grantFunctionIds.value,
        columnIds: grantColumnIds.value,
      })
      message.success('授权已保存')
      grantVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '保存授权失败'))
    } finally {
      grantSubmitting.value = false
    }
  }

  return {
    todayDate,
    periodVisible,
    periodMode,
    periodSubmitting,
    periodTarget,
    periodFormRef,
    periodForm,
    periodRules,
    disablePastPeriodDate,
    openPeriod,
    submitPeriod,
    disableVisible,
    disableSubmitting,
    disableTarget,
    disableFormRef,
    disableForm,
    openDisable,
    submitDisable,
    codeVisible,
    codeSubmitting,
    codeTarget,
    codeFormRef,
    codeForm,
    codeRules,
    openCode,
    submitCode,
    deleteVisible,
    deleteSubmitting,
    deleteTarget,
    deleteFormRef,
    deleteForm,
    deleteRules,
    openDelete,
    submitDelete,
    clearVisible,
    clearLoading,
    clearSubmitting,
    clearTarget,
    clearImpact,
    clearFormRef,
    clearForm,
    clearRules,
    openClear,
    submitClear,
    grantVisible,
    grantLoading,
    grantSubmitting,
    grantTarget,
    grantDetail,
    grantApplications,
    grantColumns,
    grantMenuIds,
    grantFunctionIds,
    grantColumnIds,
    grantActiveMenuId,
    grantActiveMenu,
    grantActiveFunctions,
    grantActiveColumns,
    grantToggleableActiveColumns,
    grantActiveColumnGroups,
    grantPermissionTab,
    grantFunctionsWithMenu,
    grantAllActiveFunctionsChecked,
    grantSomeActiveFunctionsChecked,
    grantAllActiveColumnsChecked,
    grantSomeActiveColumnsChecked,
    openGrant,
    toggleGrantApplication,
    onGrantApplicationClick,
    toggleGrantFunction,
    toggleGrantFunctionsWithMenu,
    toggleAllGrantActiveFunctions,
    toggleGrantColumn,
    toggleAllGrantActiveColumns,
    submitGrant,
  }
}
