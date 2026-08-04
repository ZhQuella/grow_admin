import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import { createDefaultApiForm } from '../constants'
import type { DesignerApiFormModel, DesignerApiOutlinedItem } from '../types'

const mapParamRows = (rows?: DesignerApiOutlinedItem['params']) =>
  (rows || []).map((row) => ({
    key: row.key || '',
    value: row.value || '',
    bindMode: row.bindMode || 'text',
  }))

const mapSaveParams = (rows: DesignerApiOutlinedItem['params']) =>
  (rows || []).map((row) => ({
    key: row.key,
    value: row.value,
    bindMode: row.bindMode || 'text',
  }))

const toFormModel = (item?: DesignerApiOutlinedItem): DesignerApiFormModel => {
  if (!item) return createDefaultApiForm()
  return {
    name: item.name,
    description: item.description || '',
    autoLoad: item.autoLoad ?? true,
    loadType: item.loadType || 'parallel',
    url: item.url || '',
    method: item.method || 'GET',
    params: mapParamRows(item.params),
    body: mapParamRows(item.body),
    pathParams: mapParamRows(item.pathParams),
    shouldFetch: item.shouldFetch ?? true,
    processors: (item.processors || []).map((row) => ({
      id: row.id,
      type: row.type,
      code: row.code,
    })),
    defaultData: item.defaultData ?? '',
  }
}

const buildApiPayload = (
  formData: DesignerApiFormModel,
  editingId: string,
): DesignerApiOutlinedItem => ({
  id: editingId || nanoid(),
  name: formData.name.trim(),
  description: formData.description.trim(),
  autoLoad: formData.autoLoad,
  loadType: formData.loadType,
  url: formData.url,
  method: formData.method,
  params: mapSaveParams(formData.params),
  body: mapSaveParams(formData.body),
  pathParams: mapSaveParams(formData.pathParams),
  shouldFetch: formData.shouldFetch,
  processors: formData.processors.map((row) => ({
    id: row.id,
    type: row.type,
    code: row.code,
  })),
  defaultData: formData.defaultData,
})

type ApiFormCtx = {
  data: Ref<Record<string, any>>
  formRef: Ref<{ validate?: () => Promise<void> } | null>
  formData: DesignerApiFormModel
  editingId: Ref<string>
  drawerVisible: Ref<boolean>
  message: ReturnType<typeof useMsg>
}

const ensureApiList = (data: Ref<Record<string, any>>) => {
  if (!Array.isArray(data.value.apiOutlined)) data.value.apiOutlined = []
  return data.value.apiOutlined as DesignerApiOutlinedItem[]
}

const validateApiFormName = (
  ctx: ApiFormCtx,
): string | null => {
  const name = ctx.formData.name.trim()
  if (!name) {
    ctx.message.warning('请输入名称')
    return null
  }
  const list = (ctx.data.value.apiOutlined || []) as DesignerApiOutlinedItem[]
  const duplicated = list.some(
    (item) => item.name === name && item.id !== (ctx.editingId.value || undefined),
  )
  if (duplicated) {
    ctx.message.warning('数据请求名称已存在')
    return null
  }
  return name
}

const saveApiForm = async (ctx: ApiFormCtx, onClose: () => void) => {
  try {
    await ctx.formRef.value?.validate?.()
  } catch {
    return
  }
  if (!validateApiFormName(ctx)) return
  const list = ensureApiList(ctx.data)
  const payload = buildApiPayload(ctx.formData, ctx.editingId.value)
  const index = list.findIndex((item) => item.id === payload.id)
  if (index >= 0) list[index] = payload
  else list.push(payload)
  ctx.message.success(ctx.editingId.value ? '修改成功' : '添加成功')
  onClose()
}

const createApiFormActions = (ctx: ApiFormCtx) => {
  const assignForm = (item?: DesignerApiOutlinedItem) => {
    Object.assign(ctx.formData, toFormModel(item))
  }
  const onClose = () => {
    ctx.drawerVisible.value = false
    ctx.editingId.value = ''
  }
  const onCreate = () => {
    ctx.editingId.value = ''
    assignForm()
    ctx.drawerVisible.value = true
  }
  const onEdit = (item: DesignerApiOutlinedItem) => {
    ctx.editingId.value = item.id
    assignForm(item)
    ctx.drawerVisible.value = true
  }
  const onRemove = (id: string) => {
    const list = ensureApiList(ctx.data)
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return
    list.splice(index, 1)
    if (ctx.editingId.value === id) onClose()
    ctx.message.success('已删除')
  }
  return {
    onCreate,
    onEdit,
    onClose,
    onSave: () => saveApiForm(ctx, onClose),
    onRemove,
  }
}

export const useApiOutlined = (data: Ref<Record<string, any>>) => {
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive<DesignerApiFormModel>(createDefaultApiForm())
  const actions = createApiFormActions({
    data,
    formRef,
    formData,
    editingId,
    drawerVisible,
    message: useMsg(),
  })

  return {
    formRef,
    formData,
    formRules: {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    },
    drawerVisible,
    editingId,
    apiList: computed(
      () => (data.value.apiOutlined || []) as DesignerApiOutlinedItem[],
    ),
    sortableList: computed({
      get: () => ensureApiList(data),
      set: (list: DesignerApiOutlinedItem[]) => {
        data.value.apiOutlined = list
      },
    }),
    ...actions,
  }
}
