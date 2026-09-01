import { computed, reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import {
  assignSystemAccount,
  deleteSystemAccount,
  fetchSystemAccountDeleteImpact,
  fetchSystemAccountPersonOptions,
  resetSystemAccountPassword,
  setSystemAccountEnabled,
  unassignSystemAccount,
} from '../../../api/systemAccount'
import type {
  SystemAccountDeleteImpact,
  SystemAccountListItem,
  SystemAccountPersonOption,
} from '../../../types/systemAccount'
import { confirmWarning } from './confirmWarning'
import {
  createTemporaryPassword,
  accountPersonStatusLabel,
  isRiskPersonStatus,
  isSystemAdmin,
  pickPersonId,
  toMessage,
} from './helpers'

async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) throw new Error('表单未就绪')
  const result = await form.validate()
  if (result === false) throw new Error('校验未通过')
}

type UseAccountActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useAccountActions(options: UseAccountActionsOptions) {
  const message = useMsg()
  const dialog = useDialog()

  const assignVisible = ref(false)
  const assignMode = ref<'bind' | 'reassign'>('bind')
  const assignSubmitting = ref(false)
  const assignTarget = ref<SystemAccountListItem | null>(null)
  const assignPersonId = ref<string | string[] | ''>('')
  const assignDisableAccount = ref(false)
  const assignPeople = ref<SystemAccountPersonOption[]>([])
  const assignPersonOptions = computed(() => assignPeople.value
    .filter((item) => !item.accountId || item.accountId === assignTarget.value?.accountId)
    .filter((item) => assignMode.value !== 'reassign' || item.personId !== assignTarget.value?.personId)
    .map((item) => ({
      label: `${item.name} · ${accountPersonStatusLabel(item.employeeStatus)}`,
      value: item.personId,
    })))
  const assignPerson = computed(() => assignPeople.value.find(
    (item) => item.personId === pickPersonId(assignPersonId.value),
  ))
  const assignRisk = computed(() => isRiskPersonStatus(assignPerson.value?.employeeStatus))

  const unassignVisible = ref(false)
  const unassignSubmitting = ref(false)
  const unassignTarget = ref<SystemAccountListItem | null>(null)

  const resetVisible = ref(false)
  const resetSubmitting = ref(false)
  const resetTarget = ref<SystemAccountListItem | null>(null)
  const resetFormRef = ref()
  const resetForm = reactive({ passwordMode: 'manual' as 'manual' | 'generated', password: '' })
  const resetRules = {
    password: [{ required: true, message: '请填写或生成新密码', trigger: 'blur' }],
  }

  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<SystemAccountListItem | null>(null)
  const deleteImpact = ref<SystemAccountDeleteImpact | null>(null)

  async function openAssign(row: SystemAccountListItem, mode: 'bind' | 'reassign') {
    assignMode.value = mode
    assignTarget.value = row
    assignPersonId.value = ''
    assignDisableAccount.value = false
    assignVisible.value = true
    try {
      const people = await fetchSystemAccountPersonOptions()
      assignPeople.value = Array.isArray(people) ? people : []
    } catch (error) {
      message.error(toMessage(error, '人员加载失败'))
    }
  }

  function openBind(row: SystemAccountListItem) {
    void openAssign(row, 'bind')
  }

  function openReassign(row: SystemAccountListItem) {
    void openAssign(row, 'reassign')
  }

  async function submitAssign() {
    const target = assignTarget.value
    if (!target) return
    const personId = pickPersonId(assignPersonId.value)
    if (!personId) {
      message.warning(assignMode.value === 'reassign' ? '请选择新的使用人' : '请选择人员')
      return
    }
    assignSubmitting.value = true
    try {
      await assignSystemAccount({
        accountId: target.accountId,
        personId,
        disableAccount: Boolean(assignRisk.value && assignDisableAccount.value),
      })
      message.success(assignMode.value === 'reassign' ? '换绑成功' : '绑定成功')
      assignVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    } finally {
      assignSubmitting.value = false
    }
  }

  function openUnassign(row: SystemAccountListItem) {
    unassignTarget.value = row
    unassignVisible.value = true
  }

  async function submitUnassign() {
    const target = unassignTarget.value
    if (!target) return
    unassignSubmitting.value = true
    try {
      await unassignSystemAccount(target.accountId)
      message.success('解绑成功')
      unassignVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '解绑失败'))
    } finally {
      unassignSubmitting.value = false
    }
  }

  function openReset(row: SystemAccountListItem) {
    resetTarget.value = row
    resetForm.passwordMode = 'manual'
    resetForm.password = ''
    resetVisible.value = true
  }

  function generateResetPassword() {
    resetForm.passwordMode = 'generated'
    resetForm.password = createTemporaryPassword()
  }

  async function submitReset() {
    try {
      await validateGrowForm(resetFormRef)
    } catch {
      return
    }
    const target = resetTarget.value
    if (!target) return
    resetSubmitting.value = true
    try {
      await resetSystemAccountPassword({ accountId: target.accountId, password: resetForm.password })
      message.success('密码已重置，请妥善保存或通知账号使用人')
      resetVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '重置失败'))
    } finally {
      resetSubmitting.value = false
    }
  }

  async function onToggleEnabled(row: SystemAccountListItem, enabled: boolean) {
    if (isSystemAdmin(row) && !enabled) {
      message.warning('超级管理员不能停用')
      return
    }
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `账号：${row.username}\n绑定人员：${row.personName || '未绑定'}\n当前角色：${row.roleCount} 个\n停用后该账号将无法登录，角色绑定保留。`,
        confirmText: '停用',
      })
      if (!ok) return
    }
    if (enabled && isRiskPersonStatus(row.personStatus)) {
      const ok = await confirmWarning(dialog, {
        title: '启用风险提示',
        content: `该账号绑定的人员当前为${accountPersonStatusLabel(row.personStatus)}状态，启用后仍可登录。是否继续？`,
        confirmText: '仍然启用',
      })
      if (!ok) return
    }
    try {
      await setSystemAccountEnabled(row.accountId, enabled)
      message.success(enabled ? '已启用' : '已停用')
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    }
  }

  async function openDelete(row: SystemAccountListItem) {
    if (row.superAdmin || row.personId || row.enabled) return
    deleteTarget.value = row
    deleteImpact.value = null
    deleteVisible.value = true
    deleteLoading.value = true
    try {
      deleteImpact.value = await fetchSystemAccountDeleteImpact(row.accountId)
    } catch (error) {
      message.error(toMessage(error, '删除影响加载失败'))
      deleteVisible.value = false
    } finally {
      deleteLoading.value = false
    }
  }

  async function confirmDelete() {
    const target = deleteTarget.value
    if (!target || !deleteImpact.value) return
    const ok = await confirmWarning(dialog, {
      title: '二次确认',
      content: `确认永久删除账号「${target.username}」？该操作不可恢复。`,
      confirmText: '确认删除',
    })
    if (!ok) return
    deleteSubmitting.value = true
    try {
      await deleteSystemAccount(target.accountId)
      message.success('删除成功')
      deleteVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '删除失败'))
    } finally {
      deleteSubmitting.value = false
    }
  }

  return {
    assignVisible,
    assignMode,
    assignSubmitting,
    assignTarget,
    assignPersonId,
    assignPersonOptions,
    assignRisk,
    assignDisableAccount,
    openBind,
    openReassign,
    submitAssign,
    unassignVisible,
    unassignSubmitting,
    unassignTarget,
    openUnassign,
    submitUnassign,
    resetVisible,
    resetSubmitting,
    resetTarget,
    resetFormRef,
    resetForm,
    resetRules,
    openReset,
    generateResetPassword,
    submitReset,
    onToggleEnabled,
    deleteVisible,
    deleteLoading,
    deleteSubmitting,
    deleteTarget,
    deleteImpact,
    openDelete,
    confirmDelete,
  }
}
