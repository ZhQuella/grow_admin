import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemTenantOptions } from '../../../api/systemTenant'
import {
  createTenantAccount,
  getTenantAccountDetail,
  updateTenantAccount,
} from '../../../api/systemTenantAccount'
import type { SystemTenantOption } from '../../../types/systemTenant'
import {
  ACCOUNT_USERNAME_MESSAGE,
  ACCOUNT_USERNAME_PATTERN,
  type TenantAccountListItem,
} from '../../../types/systemTenantAccount'
import { createTemporaryPassword, toMessage, validateGrowForm } from './helpers'

export type TenantAccountFormMode = 'create' | 'edit' | 'view'

export type TenantAccountFormModel = {
  accountId?: string
  tenantId: string
  username: string
  nickname: string
  mobile: string
  email: string
  password: string
  tenantAdmin: boolean
  enabled: boolean
  remark: string
}

function emptyForm(): TenantAccountFormModel {
  return {
    accountId: undefined,
    tenantId: '',
    username: '',
    nickname: '',
    mobile: '',
    email: '',
    password: '',
    tenantAdmin: false,
    enabled: true,
    remark: '',
  }
}

type UseTenantAccountFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function useTenantAccountForm(options: UseTenantAccountFormOptions) {
  const message = useMsg() as any

  const formVisible = ref(false)
  const formMode = ref<TenantAccountFormMode>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const formModel = reactive<TenantAccountFormModel>(emptyForm())
  const tenantOptions = ref<SystemTenantOption[]>([])

  const formRules = computed(() => ({
    tenantId: [{ required: true, message: '请选择所属租户', trigger: 'change' }],
    username: [
      { required: true, message: '请填写登录名', trigger: 'blur' },
      { pattern: ACCOUNT_USERNAME_PATTERN, message: ACCOUNT_USERNAME_MESSAGE, trigger: 'blur' },
    ],
    password: formMode.value === 'create'
      ? [{ required: true, message: '请填写或生成密码', trigger: 'blur' }]
      : [],
    mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '请填写正确的 11 位手机号', trigger: 'blur' }],
    email: [{ type: 'email', message: '请填写正确的邮箱地址', trigger: 'blur' }],
  }))

  const tenantSelectOptions = computed(() => tenantOptions.value.map((item) => ({
    label: `${item.tenantName}（${item.tenantCode}）`,
    value: item.id,
  })))

  const readonly = computed(() => formMode.value === 'view')

  async function loadTenantOptions() {
    try {
      tenantOptions.value = (await fetchSystemTenantOptions()) || []
    } catch (error) {
      message.error(toMessage(error, '租户选项加载失败'))
    }
  }

  function generatePassword() {
    formModel.password = createTemporaryPassword()
  }

  function openCreate() {
    formMode.value = 'create'
    Object.assign(formModel, emptyForm())
    formVisible.value = true
    void loadTenantOptions()
  }

  function openEdit(row: TenantAccountListItem) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      ...emptyForm(),
      accountId: row.accountId,
      tenantId: row.tenantId,
      username: row.username,
      nickname: row.nickname,
      mobile: row.mobile,
      email: row.email,
      tenantAdmin: row.tenantAdmin,
      enabled: row.enabled,
      remark: row.remark,
    })
    formVisible.value = true
    void loadTenantOptions()
  }

  async function openView(row: TenantAccountListItem) {
    formMode.value = 'view'
    Object.assign(formModel, emptyForm(), {
      accountId: row.accountId,
      tenantId: row.tenantId,
      username: row.username,
      nickname: row.nickname,
      mobile: row.mobile,
      email: row.email,
      tenantAdmin: row.tenantAdmin,
      enabled: row.enabled,
      remark: row.remark,
    })
    formVisible.value = true
    void loadTenantOptions()
    try {
      const detail = await getTenantAccountDetail(row.accountId)
      Object.assign(formModel, {
        nickname: detail.nickname,
        mobile: detail.mobile,
        email: detail.email,
        tenantAdmin: detail.tenantAdmin,
        enabled: detail.enabled,
        remark: detail.remark,
      })
    } catch (error) {
      message.error(toMessage(error, '加载详情失败'))
    }
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
        await createTenantAccount({
          tenantId: formModel.tenantId,
          username: formModel.username.trim(),
          nickname: formModel.nickname.trim(),
          mobile: formModel.mobile.trim(),
          email: formModel.email.trim(),
          password: formModel.password,
          tenantAdmin: formModel.tenantAdmin,
          remark: formModel.remark.trim(),
        })
        message.success('新增成功')
      } else if (formModel.accountId) {
        await updateTenantAccount(formModel.accountId, {
          nickname: formModel.nickname.trim(),
          mobile: formModel.mobile.trim(),
          email: formModel.email.trim(),
          remark: formModel.remark.trim(),
          enabled: formModel.enabled,
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

  return {
    formVisible,
    formMode,
    formSubmitting,
    formRef,
    formModel,
    formRules,
    tenantSelectOptions,
    readonly,
    openCreate,
    openEdit,
    openView,
    generatePassword,
    submitForm,
  }
}
