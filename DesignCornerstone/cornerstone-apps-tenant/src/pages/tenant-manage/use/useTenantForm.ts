import { reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import {
  createSystemTenant,
  getSystemTenantDetail,
  updateSystemTenant,
} from '../../../api/systemTenant'
import {
  TENANT_TYPE_OPTIONS,
  type SystemTenantDetail,
  type SystemTenantListItem,
  type TenantType,
} from '../../../types/systemTenant'
import { toMessage, validateGrowForm } from './helpers'

export type TenantFormMode = 'create' | 'edit' | 'view'

export type TenantFormModel = {
  id?: string
  tenantCode: string
  tenantName: string
  shortName: string
  tenantType: TenantType
  contactName: string
  contactMobile: string
  contactEmail: string
  creditCode: string
  industry: string
  regionCode: string
  address: string
  remark: string
}

function emptyForm(): TenantFormModel {
  return {
    id: undefined,
    tenantCode: '',
    tenantName: '',
    shortName: '',
    tenantType: 'company',
    contactName: '',
    contactMobile: '',
    contactEmail: '',
    creditCode: '',
    industry: '',
    regionCode: '',
    address: '',
    remark: '',
  }
}

const TENANT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type UseTenantFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function useTenantForm(options: UseTenantFormOptions) {
  const message = useMsg() as any

  const formVisible = ref(false)
  const formMode = ref<TenantFormMode>('create')
  const formSubmitting = ref(false)
  const formLoading = ref(false)
  const formRef = ref()
  const formModel = reactive<TenantFormModel>(emptyForm())
  const formDetail = ref<SystemTenantDetail | null>(null)

  const formRules = {
    tenantCode: [
      { required: true, message: '请填写租户编码', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          const text = String(value || '').trim()
          if (formMode.value !== 'create') {
            callback()
            return
          }
          if (text.length < 2 || text.length > 64) {
            callback(new Error('租户编码为 2-64 位'))
            return
          }
          if (!TENANT_CODE_PATTERN.test(text)) {
            callback(new Error('只能包含字母、数字、下划线和短横线'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
    tenantName: [
      { required: true, message: '请填写租户名称', trigger: 'blur' },
      {
        min: 2,
        max: 128,
        message: '租户名称为 2-128 位',
        trigger: 'blur',
      },
    ],
    contactEmail: [
      {
        validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
          const text = String(value || '').trim()
          if (text && !EMAIL_PATTERN.test(text)) {
            callback(new Error('邮箱格式不正确'))
            return
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  function assignForm(detail: Partial<SystemTenantDetail> & Partial<TenantFormModel>) {
    Object.assign(formModel, {
      id: detail.id,
      tenantCode: detail.tenantCode || '',
      tenantName: detail.tenantName || '',
      shortName: detail.shortName || '',
      tenantType: (detail.tenantType || 'company') as TenantType,
      contactName: detail.contactName || '',
      contactMobile: detail.contactMobile || '',
      contactEmail: detail.contactEmail || '',
      creditCode: detail.creditCode || '',
      industry: detail.industry || '',
      regionCode: detail.regionCode || '',
      address: detail.address || '',
      remark: detail.remark || '',
    })
  }

  function openCreate() {
    formMode.value = 'create'
    formDetail.value = null
    Object.assign(formModel, emptyForm())
    formVisible.value = true
  }

  async function openForm(row: SystemTenantListItem, mode: 'edit' | 'view') {
    formMode.value = mode
    formDetail.value = null
    assignForm(row)
    formVisible.value = true
    formLoading.value = true
    try {
      const detail = await getSystemTenantDetail(row.id)
      formDetail.value = detail
      assignForm(detail)
    } catch (error) {
      message.error(toMessage(error, '加载详情失败'))
      formVisible.value = false
    } finally {
      formLoading.value = false
    }
  }

  function openEdit(row: SystemTenantListItem) {
    return openForm(row, 'edit')
  }

  function openView(row: SystemTenantListItem) {
    return openForm(row, 'view')
  }

  async function submitForm() {
    if (formMode.value === 'view') {
      formVisible.value = false
      return
    }
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      const payload = {
        tenantName: formModel.tenantName.trim(),
        shortName: formModel.shortName.trim(),
        tenantType: formModel.tenantType,
        contactName: formModel.contactName.trim(),
        contactMobile: formModel.contactMobile.trim(),
        contactEmail: formModel.contactEmail.trim(),
        creditCode: formModel.creditCode.trim(),
        industry: formModel.industry.trim(),
        regionCode: formModel.regionCode.trim(),
        address: formModel.address.trim(),
        remark: formModel.remark.trim(),
      }
      if (formMode.value === 'create') {
        await createSystemTenant({
          ...payload,
          tenantCode: formModel.tenantCode.trim(),
        })
        message.success('创建成功')
      } else if (formModel.id) {
        await updateSystemTenant(formModel.id, payload)
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
    formLoading,
    formRef,
    formModel,
    formDetail,
    formRules,
    openCreate,
    openEdit,
    openView,
    submitForm,
    typeOptions: TENANT_TYPE_OPTIONS,
  }
}
