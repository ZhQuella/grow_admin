import { computed, onMounted, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { createSystemAccount, fetchSystemAccountPersonOptions, updateSystemAccount } from '../../../api/systemAccount'
import { fetchSystemRoleOptions } from '../../../api/systemRole'
import {
  ACCOUNT_USERNAME_MESSAGE,
  ACCOUNT_USERNAME_PATTERN,
  type AccountRoleRef,
  type SystemAccountListItem,
  type SystemAccountPersonOption,
} from '../../../types/systemAccount'
import { accountPersonStatusLabel, createTemporaryPassword, isRiskPersonStatus, toMessage } from './helpers'

export type AccountFormModel = {
  accountId?: string
  username: string
  nickname: string
  mobile: string
  email: string
  passwordMode: 'manual' | 'generated'
  password: string
  personId: string
  disableAccount: boolean
  roleIds: string[]
  remark: string
}

export type AccountSelectOption = {
  label: string
  value: string
  disabled?: boolean
  status?: string
  accountId?: string
}

function emptyForm(): AccountFormModel {
  return {
    accountId: undefined,
    username: '',
    nickname: '',
    mobile: '',
    email: '',
    passwordMode: 'manual',
    password: '',
    personId: '',
    disableAccount: false,
    roleIds: [],
    remark: '',
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
  const formRef = ref<{ validate?: () => Promise<unknown> } | null>(null)
  const formModel = reactive<AccountFormModel>(emptyForm())
  const allRoles = ref<Array<AccountRoleRef & { enabled?: boolean; builtIn?: boolean }>>([])
  const people = ref<SystemAccountPersonOption[]>([])
  const protectedRoles = ref<AccountRoleRef[]>([])

  const roleOptions = computed<AccountSelectOption[]>(() => allRoles.value
    .filter((item) => !item.builtIn)
    .map((item) => ({ label: item.name, value: item.id })))

  const personOptions = computed<AccountSelectOption[]>(() => people.value
    .filter((item) => !item.accountId)
    .map((item) => ({
      label: `${item.name} · ${accountPersonStatusLabel(item.employeeStatus)}`,
      value: item.personId,
      status: item.employeeStatus,
      accountId: item.accountId,
    })))

  const usernameLocked = computed(() => formMode.value === 'edit' && protectedRoles.value.length > 0)

  const formRules = computed(() => ({
    username: [
      { required: true, message: '请填写账号名称', trigger: 'blur' },
      { pattern: ACCOUNT_USERNAME_PATTERN, message: ACCOUNT_USERNAME_MESSAGE, trigger: 'blur' },
    ],
    password: formMode.value === 'create'
      ? [{ required: true, message: '请填写或生成密码', trigger: 'blur' }]
      : [],
    mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请填写正确的 11 位手机号', trigger: 'blur' }],
    email: [{ type: 'email', message: '请填写正确的邮箱地址', trigger: 'blur' }],
  }))

  async function loadOptions() {
    try {
      const [roles, persons] = await Promise.all([
        fetchSystemRoleOptions(),
        fetchSystemAccountPersonOptions(),
      ])
      allRoles.value = Array.isArray(roles) ? roles : []
      people.value = Array.isArray(persons) ? persons : []
    } catch (error) {
      message.error(toMessage(error, '表单选项加载失败'))
    }
  }

  function openCreate() {
    formMode.value = 'create'
    Object.assign(formModel, emptyForm())
    protectedRoles.value = []
    formVisible.value = true
    void loadOptions()
  }

  function openEdit(row: SystemAccountListItem) {
    formMode.value = 'edit'
    protectedRoles.value = row.roles.filter((item) => item.builtIn)
    Object.assign(formModel, {
      ...emptyForm(),
      accountId: row.accountId,
      username: row.username,
      nickname: row.nickname || '',
      mobile: row.mobile || '',
      email: row.email || '',
      roleIds: row.roles.filter((item) => !item.builtIn).map((item) => item.id),
      remark: row.remark || '',
    })
    formVisible.value = true
    void loadOptions()
  }

  async function submitForm() {
    try {
      const result = await formRef.value?.validate?.()
      if (result === false) return
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      const roleIds = [...protectedRoles.value.map((item) => item.id), ...formModel.roleIds]
      if (formMode.value === 'create') {
        const selectedPerson = people.value.find((item) => item.personId === formModel.personId)
        await createSystemAccount({
          username: formModel.username.trim(),
          nickname: formModel.nickname.trim(),
          mobile: formModel.mobile.trim(),
          email: formModel.email.trim(),
          password: formModel.password,
          personId: formModel.personId,
          disableAccount: Boolean(selectedPerson && isRiskPersonStatus(selectedPerson.employeeStatus) && formModel.disableAccount),
          roleIds,
          remark: formModel.remark.trim(),
        })
        message.success('新增成功')
      } else if (formModel.accountId) {
        await updateSystemAccount(formModel.accountId, {
          username: formModel.username.trim(),
          nickname: formModel.nickname.trim(),
          mobile: formModel.mobile.trim(),
          email: formModel.email.trim(),
          roleIds,
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

  function generatePassword() {
    formModel.passwordMode = 'generated'
    formModel.password = createTemporaryPassword()
  }

  onMounted(() => {
    void loadOptions()
  })

  return {
    formVisible,
    formMode,
    formSubmitting,
    formRef,
    formModel,
    formRules,
    roleOptions,
    personOptions,
    protectedRoles,
    usernameLocked,
    openCreate,
    openEdit,
    submitForm,
    generatePassword,
  }
}
