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
  saveSystemTenantGrant,
  trialSystemTenant,
  updateSystemTenantCode,
} from '../../../api/systemTenant'
import type {
  SystemTenantClearImpact,
  SystemTenantGrantDetail,
  SystemTenantGrantMenu,
  SystemTenantListItem,
} from '../../../types/systemTenant'
import { todayDate, toMessage, validateGrowForm } from './helpers'

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
    reason: '',
  })
  const periodRules = {
    expiredOn: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
    reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
  }

  const disableVisible = ref(false)
  const disableSubmitting = ref(false)
  const disableTarget = ref<SystemTenantListItem | null>(null)
  const disableFormRef = ref()
  const disableForm = reactive({ reason: '' })
  const disableRules = {
    reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
  }

  const codeVisible = ref(false)
  const codeSubmitting = ref(false)
  const codeTarget = ref<SystemTenantListItem | null>(null)
  const codeFormRef = ref()
  const codeForm = reactive({
    newTenantCode: '',
    confirmTenantCode: '',
    reason: '',
  })
  const codeRules = {
    newTenantCode: [
      { required: true, message: '请填写新编码', trigger: 'blur' },
      { min: 2, max: 64, message: '编码为 2-64 位', trigger: 'blur' },
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
    reason: [{ required: true, message: '请填写修改原因', trigger: 'blur' }],
  }

  const deleteVisible = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemTenantListItem | null>(null)
  const deleteFormRef = ref()
  const deleteForm = reactive({
    confirmTenantCode: '',
    reason: '',
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
    reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
  }

  const clearVisible = ref(false)
  const clearLoading = ref(false)
  const clearSubmitting = ref(false)
  const clearTarget = ref<SystemTenantListItem | null>(null)
  const clearImpact = ref<SystemTenantClearImpact | null>(null)
  const clearFormRef = ref()
  const clearForm = reactive({
    confirmTenantCode: '',
    reason: '',
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
    reason: [{ required: true, message: '请填写原因', trigger: 'blur' }],
  }

  const grantVisible = ref(false)
  const grantLoading = ref(false)
  const grantSubmitting = ref(false)
  const grantTarget = ref<SystemTenantListItem | null>(null)
  const grantDetail = ref<SystemTenantGrantDetail | null>(null)
  const grantApplications = ref<SystemTenantGrantMenu[]>([])
  const grantMenuIds = ref<string[]>([])
  const grantFunctionIds = ref<string[]>([])
  const grantActiveMenuId = ref('')
  const grantFunctionsWithMenu = ref(true)

  const grantActiveMenu = computed(() => {
    if (!grantActiveMenuId.value) return null
    return grantApplications.value.find((item) => item.id === grantActiveMenuId.value) || null
  })
  const grantActiveFunctions = computed(() => grantActiveMenu.value?.functions || [])
  const grantAllActiveFunctionsChecked = computed(() => {
    return grantActiveFunctions.value.length > 0
      && grantActiveFunctions.value.every((item) => grantFunctionIds.value.includes(item.id))
  })
  const grantSomeActiveFunctionsChecked = computed(() => {
    return !grantAllActiveFunctionsChecked.value
      && grantActiveFunctions.value.some((item) => grantFunctionIds.value.includes(item.id))
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
    periodForm.reason = ''
    periodVisible.value = true
  }

  async function submitPeriod() {
    const target = periodTarget.value
    if (!target) return
    try {
      await validateGrowForm(periodFormRef)
    } catch {
      return
    }
    if (periodForm.expiredOn < todayDate()) {
      message.warning('结束日期不能早于今天')
      return
    }
    periodSubmitting.value = true
    try {
      const payload = {
        tenantId: target.id,
        expiredOn: periodForm.expiredOn,
        reason: periodForm.reason.trim(),
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
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    } finally {
      periodSubmitting.value = false
    }
  }

  function openDisable(row: SystemTenantListItem) {
    disableTarget.value = row
    disableForm.reason = ''
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
      await disableSystemTenant({ tenantId: target.id, reason: disableForm.reason.trim() })
      message.success('已停用')
      disableVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '停用失败'))
    } finally {
      disableSubmitting.value = false
    }
  }

  function openCode(row: SystemTenantListItem) {
    codeTarget.value = row
    codeForm.newTenantCode = ''
    codeForm.confirmTenantCode = ''
    codeForm.reason = ''
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
        reason: codeForm.reason.trim(),
      })
      message.success('编码已修改')
      codeVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '修改编码失败'))
    } finally {
      codeSubmitting.value = false
    }
  }

  function openDelete(row: SystemTenantListItem) {
    deleteTarget.value = row
    deleteForm.confirmTenantCode = ''
    deleteForm.reason = ''
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
    deleteSubmitting.value = true
    try {
      await deleteSystemTenant({
        tenantId: target.id,
        confirmTenantCode: deleteForm.confirmTenantCode.trim(),
        reason: deleteForm.reason.trim(),
      })
      message.success('已删除')
      deleteVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '删除失败'))
    } finally {
      deleteSubmitting.value = false
    }
  }

  async function openClear(row: SystemTenantListItem) {
    clearTarget.value = row
    clearImpact.value = null
    clearForm.confirmTenantCode = ''
    clearForm.reason = ''
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
    clearSubmitting.value = true
    try {
      await clearSystemTenantData({
        tenantId: target.id,
        confirmTenantCode: clearForm.confirmTenantCode.trim(),
        reason: clearForm.reason.trim(),
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
    grantMenuIds.value = []
    grantFunctionIds.value = []
    grantActiveMenuId.value = ''
    grantFunctionsWithMenu.value = true
    grantVisible.value = true
    grantLoading.value = true
    try {
      const [detail, applicationFunctions] = await Promise.all([
        fetchSystemTenantGrantDetail(row.id),
        fetchSystemTenantApplicationFunctions(),
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
      grantDetail.value = detail
      grantApplications.value = applications
      grantMenuIds.value = detail.menuIds.filter((id) => applicationIds.has(id))
      grantFunctionIds.value = [...detail.functionIds]
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
  }

  function toggleAllGrantActiveFunctions(checked: boolean) {
    const set = new Set(grantFunctionIds.value)
    grantActiveFunctions.value.forEach((item) => {
      if (checked) set.add(item.id)
      else set.delete(item.id)
    })
    grantFunctionIds.value = [...set]
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
    openPeriod,
    submitPeriod,
    disableVisible,
    disableSubmitting,
    disableTarget,
    disableFormRef,
    disableForm,
    disableRules,
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
    grantMenuIds,
    grantFunctionIds,
    grantActiveMenuId,
    grantActiveMenu,
    grantActiveFunctions,
    grantFunctionsWithMenu,
    grantAllActiveFunctionsChecked,
    grantSomeActiveFunctionsChecked,
    openGrant,
    toggleGrantApplication,
    onGrantApplicationClick,
    toggleGrantFunction,
    toggleGrantFunctionsWithMenu,
    toggleAllGrantActiveFunctions,
    submitGrant,
  }
}
