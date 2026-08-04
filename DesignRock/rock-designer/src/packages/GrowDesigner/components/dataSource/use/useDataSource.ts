import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import type { DesignerDataSourceFormModel, DesignerDataSourceItem } from '../types'

const createEmptyForm = (): DesignerDataSourceFormModel => ({
  name: '',
  description: '',
  data: '',
})

const buildPayload = (
  formData: DesignerDataSourceFormModel,
  editingId: string,
): DesignerDataSourceItem => ({
  id: editingId || nanoid(),
  name: formData.name.trim(),
  description: formData.description.trim(),
  data: formData.data,
})

const ensureList = (data: Ref<Record<string, any>>) => {
  if (!Array.isArray(data.value.dataSource)) data.value.dataSource = []
  return data.value.dataSource as DesignerDataSourceItem[]
}

type FormCtx = {
  data: Ref<Record<string, any>>
  formRef: Ref<{ validate?: () => Promise<void> } | null>
  formData: DesignerDataSourceFormModel
  editingId: Ref<string>
  drawerVisible: Ref<boolean>
  message: ReturnType<typeof useMsg>
}

const isDataSourceNameDuplicated = (
  data: Ref<Record<string, any>>,
  name: string,
  excludeId?: string,
) => {
  const sources = (data.value.dataSource || []) as DesignerDataSourceItem[]
  const computedList = (data.value.computedProps || []) as { name?: string }[]
  return (
    sources.some((item) => item.name === name && item.id !== excludeId) ||
    computedList.some((item) => item.name === name)
  )
}

const saveDataSourceForm = async (ctx: FormCtx, onClose: () => void) => {
  try {
    await ctx.formRef.value?.validate?.()
  } catch {
    return
  }
  const name = ctx.formData.name.trim()
  if (!name) {
    ctx.message.warning('请输入名称')
    return
  }
  if (isDataSourceNameDuplicated(ctx.data, name, ctx.editingId.value || undefined)) {
    ctx.message.warning('名称与计算属性或其它数据源重复')
    return
  }
  const list = ensureList(ctx.data)
  const payload = buildPayload(ctx.formData, ctx.editingId.value)
  const index = list.findIndex((item) => item.id === payload.id)
  const next = list.slice()
  if (index >= 0) next[index] = payload
  else next.push(payload)
  ctx.data.value.dataSource = next
  ctx.message.success(ctx.editingId.value ? '修改成功' : '添加成功')
  onClose()
}

const createDataSourceActions = (ctx: FormCtx) => {
  const onClose = () => {
    ctx.drawerVisible.value = false
    ctx.editingId.value = ''
  }
  const onCreate = () => {
    Object.assign(ctx.formData, createEmptyForm())
    ctx.editingId.value = ''
    ctx.drawerVisible.value = true
  }
  const onEdit = (item: DesignerDataSourceItem) => {
    ctx.editingId.value = item.id
    ctx.formData.name = item.name
    ctx.formData.description = item.description || ''
    ctx.formData.data = item.data ?? ''
    ctx.drawerVisible.value = true
  }
  const onRemove = (id: string) => {
    ctx.data.value.dataSource = ensureList(ctx.data).filter((item) => item.id !== id)
    if (ctx.editingId.value === id) onClose()
    ctx.message.success('已删除')
  }
  return {
    onCreate,
    onEdit,
    onClose,
    onSave: () => saveDataSourceForm(ctx, onClose),
    onRemove,
  }
}

export const useDataSource = (data: Ref<Record<string, any>>) => {
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive(createEmptyForm())
  const actions = createDataSourceActions({
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
    sourceList: computed(
      () => (data.value.dataSource || []) as DesignerDataSourceItem[],
    ),
    sortableList: computed({
      get: () => ensureList(data),
      set: (list: DesignerDataSourceItem[]) => {
        data.value.dataSource = list
      },
    }),
    ...actions,
  }
}
