import { reactive, ref } from 'vue'
import { driverRef, useDialog, useMsg } from '@grow-admin-rock/components'
import {
  assignSystemAccount,
  resetSystemAccountPassword,
  setSystemAccountEnabled,
} from '../../../api/systemAccount'
import type { SystemAccountListItem } from '../../../types/systemAccount'
import { confirmWarning } from './confirmWarning'
import { isSystemAdmin, pickPersonId, toMessage } from './helpers'

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

type UseAccountActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useAccountActions(options: UseAccountActionsOptions) {
  const message = useMsg()
  const dialog = useDialog()

  const assignVisible = ref(false)
  const assignSubmitting = ref(false)
  const assignTarget = ref<SystemAccountListItem | null>(null)
  const assignPersonId = ref<string | string[] | ''>('')

  const resetVisible = ref(false)
  const resetSubmitting = ref(false)
  const resetTarget = ref<SystemAccountListItem | null>(null)
  const resetFormRef = ref()
  const resetForm = reactive({ password: '' })
  const resetRules = {
    password: [
      { required: true, message: '请填写新密码', trigger: 'blur' },
      { min: 6, message: '密码至少 6 位', trigger: 'blur' },
    ],
  }

  function openAssign(row: SystemAccountListItem) {
    assignTarget.value = row
    assignPersonId.value = row.personId || ''
    assignVisible.value = true
  }

  async function submitAssign() {
    const target = assignTarget.value
    if (!target) return
    assignSubmitting.value = true
    try {
      await assignSystemAccount({
        accountId: target.accountId,
        personId: pickPersonId(assignPersonId.value),
      })
      message.success(pickPersonId(assignPersonId.value) ? '分配成功' : '已解绑')
      assignVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '操作失败'))
    } finally {
      assignSubmitting.value = false
    }
  }

  function openReset(row: SystemAccountListItem) {
    resetTarget.value = row
    resetForm.password = ''
    resetVisible.value = true
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
      await resetSystemAccountPassword({
        accountId: target.accountId,
        password: resetForm.password,
      })
      message.success('密码已重置')
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
      message.warning('系统管理员不能停用')
      return
    }
    if (row.enabled === enabled) return
    if (!enabled) {
      const ok = await confirmWarning(dialog, {
        title: '停用确认',
        content: `确认停用账号「${row.username}」？停用后将无法登录。`,
        confirmText: '停用',
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

  return {
    assignVisible,
    assignSubmitting,
    assignTarget,
    assignPersonId,
    openAssign,
    submitAssign,
    resetVisible,
    resetSubmitting,
    resetTarget,
    resetFormRef,
    resetForm,
    resetRules,
    openReset,
    submitReset,
    onToggleEnabled,
  }
}
