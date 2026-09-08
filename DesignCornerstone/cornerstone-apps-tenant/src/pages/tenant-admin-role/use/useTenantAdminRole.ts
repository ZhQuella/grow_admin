import { computed, onMounted, reactive, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import type { ColumnBarItem } from '@grow-admin-rock/components/column-bar'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import { fetchSystemTenantOptions } from '../../../api/systemTenant'
import {
  createTenantAdminRole,
  fetchTenantAdminRolePage,
  getTenantAdminRoleDetail,
} from '../../../api/systemTenantAdminRole'
import {
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VALUES,
  type SystemTenantOption,
  type TenantStatus,
} from '../../../types/systemTenant'
import {
  ROLE_CODE_MESSAGE,
  ROLE_CODE_PATTERN,
  type TenantAdminRoleDetail,
  type TenantAdminRoleListItem,
} from '../../../types/systemTenantAdminRole'

export type ManageTableColumn = ColumnBarItem & {
  width?: number
  minWidth?: number
  fixed?: string | boolean
}

function collectLeafColumns(list: ManageTableColumn[]): ManageTableColumn[] {
  const result: ManageTableColumn[] = []
  list.forEach((item) => {
    if (item.visible === false) return
    if (item.children?.length) {
      result.push(...collectLeafColumns(item.children as ManageTableColumn[]))
    } else if (item.field) {
      result.push(item)
    }
  })
  return result
}

export function formatTime(value?: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function tenantStatusLabel(status: TenantStatus) {
  return TENANT_STATUS_LABELS[status] || status
}

export function tenantStatusTagType(status: TenantStatus) {
  if (status === 'active') return 'success'
  if (status === 'trial') return 'warning'
  if (status === 'expired' || status === 'disabled') return 'danger'
  return 'info'
}

type FormModel = {
  tenantId: string
  name: string
  code: string
  sort: number
  remark: string
}

function emptyForm(): FormModel {
  return {
    tenantId: '',
    name: '',
    code: '',
    sort: 10,
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

export function useTenantAdminRole() {
  const message = useMsg() as any

  const loading = ref(false)
  const tableData = ref<TenantAdminRoleListItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Recordable<any>>({})
  const tenantOptions = ref<SystemTenantOption[]>([])

  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const detail = ref<TenantAdminRoleDetail | null>(null)

  const formVisible = ref(false)
  const formSubmitting = ref(false)
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const searchList = reactive<SearchBarField[]>([
    {
      labelText: '关键词',
      placeholder: '租户 / 角色名称 / 编码',
      elType: 'GrowInput',
      isDefault: true,
      model: 'keyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '所属租户',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'tenantId',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      filterable: true,
      options: [],
    },
    {
      labelText: '角色类型',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'builtIn',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: [
        { label: '内置', value: 'true' },
        { label: '普通', value: 'false' },
      ],
    },
    {
      labelText: '租户状态',
      elType: 'GrowSelect',
      model: 'tenantStatus',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: TENANT_STATUS_VALUES.filter((value) => value !== 'deleted').map((value) => ({
        label: TENANT_STATUS_LABELS[value],
        value,
      })),
    },
  ])

  const tableColumns = ref<ManageTableColumn[]>([
    { title: '租户编码', field: 'tenantCode', visible: true, minWidth: 120 },
    { title: '租户名称', field: 'tenantName', visible: true, minWidth: 160 },
    { title: '租户状态', field: 'tenantStatus', visible: true, minWidth: 100 },
    { title: '角色名称', field: 'name', visible: true, minWidth: 140 },
    { title: '角色编码', field: 'code', visible: true, minWidth: 140 },
    { title: '成员数', field: 'memberCount', visible: true, minWidth: 90 },
    { title: '授权菜单', field: 'menuCount', visible: true, minWidth: 90 },
    { title: '最近授权', field: 'grantedAt', visible: true, minWidth: 170 },
    { title: '操作', field: 'actions', visible: true, minWidth: 60, fixed: 'right' },
  ])

  const leafColumns = computed(() => collectLeafColumns(tableColumns.value))

  const tenantSelectOptions = computed(() => tenantOptions.value.map((item) => ({
    label: `${item.tenantName}（${item.tenantCode}）`,
    value: item.id,
  })))

  const formRules = {
    tenantId: [{ required: true, message: '请选择所属租户', trigger: 'change' }],
    name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [
      { required: true, message: '请填写编码', trigger: 'blur' },
      { pattern: ROLE_CODE_PATTERN, message: ROLE_CODE_MESSAGE, trigger: 'blur' },
    ],
  }

  async function loadTenantOptions() {
    try {
      tenantOptions.value = (await fetchSystemTenantOptions()) || []
      const field = searchList.find((item) => item.model === 'tenantId')
      if (field) field.options = tenantSelectOptions.value
    } catch (error) {
      message.error(toMessage(error, '租户选项加载失败'))
    }
  }

  async function loadList() {
    loading.value = true
    try {
      const data = await fetchTenantAdminRolePage({
        keyword: query.value.keyword,
        tenantId: query.value.tenantId,
        tenantStatus: query.value.tenantStatus,
        builtIn: query.value.builtIn,
        page: page.value,
        pageSize: pageSize.value,
      })
      tableData.value = Array.isArray(data?.items) ? data.items : []
      total.value = Number(data?.total || 0)
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onSearch(data: Recordable<any>) {
    query.value = data || {}
    page.value = 1
    void loadList()
  }

  function onColumnsConfirm(columns: ColumnBarItem[]) {
    tableColumns.value = columns as ManageTableColumn[]
  }

  function onSizeChange() {
    page.value = 1
    void loadList()
  }

  function openCreate() {
    Object.assign(formModel, emptyForm())
    formVisible.value = true
    void loadTenantOptions()
  }

  async function submitForm() {
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }
    formSubmitting.value = true
    try {
      await createTenantAdminRole({
        tenantId: formModel.tenantId,
        name: formModel.name.trim(),
        code: formModel.code.trim(),
        sort: Number(formModel.sort ?? 10),
        remark: formModel.remark.trim(),
      })
      message.success('创建成功')
      formVisible.value = false
      await loadList()
    } catch (error) {
      message.error(toMessage(error, '创建失败'))
    } finally {
      formSubmitting.value = false
    }
  }

  async function openView(row: TenantAdminRoleListItem) {
    detailVisible.value = true
    detailLoading.value = true
    detail.value = null
    try {
      detail.value = await getTenantAdminRoleDetail(row.id)
    } catch (error) {
      message.error(toMessage(error, '加载详情失败'))
      detailVisible.value = false
    } finally {
      detailLoading.value = false
    }
  }

  onMounted(() => {
    void loadTenantOptions()
    void loadList()
  })

  return {
    loading,
    tableData,
    total,
    page,
    pageSize,
    searchList,
    tableColumns,
    leafColumns,
    loadList,
    onSearch,
    onColumnsConfirm,
    onSizeChange,
    detailVisible,
    detailLoading,
    detail,
    openView,
    formVisible,
    formSubmitting,
    formRef,
    formModel,
    formRules,
    tenantSelectOptions,
    openCreate,
    submitForm,
    formatTime,
    tenantStatusLabel,
    tenantStatusTagType,
  }
}
