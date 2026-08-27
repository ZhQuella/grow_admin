import { computed, onMounted, reactive, ref } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import { createSystemAccount, updateSystemAccount } from '../../../api/systemAccount'
import { fetchSystemRoleOptions } from '../../../api/systemRole'
import {
  ACCOUNT_USERNAME_MESSAGE,
  ACCOUNT_USERNAME_PATTERN,
  type SystemAccountListItem,
} from '../../../types/systemAccount'
import { isSystemAdmin, toMessage } from './helpers'

type FormModel = {
  accountId?: string
  username: string
  password: string
  roleIds: string[]
  remark: string
}

function emptyForm(): FormModel {
  return {
    accountId: undefined,
    username: '',
    password: '',
    roleIds: [],
    remark: '',
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

type UseAccountFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function useAccountForm(options: UseAccountFormOptions) {
  const message = useMsg()

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())
  const roleOptions = ref<Array<{ label: string; value: string }>>([])

  const usernameLocked = computed(() =>
    formMode.value === 'edit' && isSystemAdmin({
      accountId: formModel.accountId || '',
      username: formModel.username,
    }),
  )

  const formRules = computed(() => ({
    username: [
      { required: true, message: '请填写登录名', trigger: 'blur' },
      { pattern: ACCOUNT_USERNAME_PATTERN, message: ACCOUNT_USERNAME_MESSAGE, trigger: 'blur' },
    ],
    password: formMode.value === 'create'
      ? [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { min: 6, message: '密码至少 6 位', trigger: 'blur' },
        ]
      : [],
  }))

  async function loadRoleOptions() {
    try {
      const data = await fetchSystemRoleOptions()
      roleOptions.value = (Array.isArray(data) ? data : []).map((item) => ({
        label: item.name,
        value: item.id,
      }))
    } catch (error) {
      message.error(toMessage(error, '角色加载失败'))
    }
  }

  function openCreate() {
    formMode.value = 'create'
    Object.assign(formModel, emptyForm())
    formVisible.value = true
  }

  function openEdit(row: SystemAccountListItem) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      accountId: row.accountId,
      username: row.username,
      password: '',
      roleIds: Array.isArray(row.roleIds) ? [...row.roleIds] : [],
      remark: row.remark || '',
    })
    formVisible.value = true
  }

  async function submitForm() {
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      if (formMode.value === 'create') {
        await createSystemAccount({
          username: formModel.username.trim(),
          password: formModel.password,
          roleIds: [...formModel.roleIds],
          remark: formModel.remark.trim(),
        })
        message.success('新增成功')
      } else if (formModel.accountId) {
        await updateSystemAccount(formModel.accountId, {
          username: formModel.username.trim(),
          roleIds: [...formModel.roleIds],
          remark: formModel.remark.trim(),
        })
        message.success('保存成功')
      }
      formVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(toMessage(error, '保存失败'))
    } finally {
      formSubmitting.value = false
    }
  }

  onMounted(() => {
    void loadRoleOptions()
  })

  return {
    formVisible,
    formMode,
    formSubmitting,
    formRef,
    formModel,
    formRules,
    roleOptions,
    usernameLocked,
    openCreate,
    openEdit,
    submitForm,
  }
}
