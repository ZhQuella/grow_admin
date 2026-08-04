import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import type {
  DesignerComputedPropFormModel,
  DesignerComputedPropItem,
  DesignerDataSourceItem,
} from '../types'

const createEmptyForm = (): DesignerComputedPropFormModel => ({
  name: '',
  description: '',
  code: '',
})

const buildPayload = (
  formData: DesignerComputedPropFormModel,
  editingId: string,
): DesignerComputedPropItem => ({
  id: editingId || nanoid(),
  name: formData.name.trim(),
  description: formData.description.trim(),
  code: formData.code,
})

const ensureList = (data: Ref<Record<string, any>>) => {
  if (!Array.isArray(data.value.computedProps)) data.value.computedProps = []
  return data.value.computedProps as DesignerComputedPropItem[]
}

type FormCtx = {
  data: Ref<Record<string, any>>
  formRef: Ref<{ validate?: () => Promise<void> } | null>
  formData: DesignerComputedPropFormModel
  editingId: Ref<string>
  drawerVisible: Ref<boolean>
  message: ReturnType<typeof useMsg>
}

const isComputedNameDuplicated = (
  data: Ref<Record<string, any>>,
  name: string,
  excludeId?: string,
) => {
  const computedList = (data.value.computedProps ||
    []) as DesignerComputedPropItem[]
  const sources = (data.value.dataSource || []) as DesignerDataSourceItem[]
  return (
    computedList.some((item) => item.name === name && item.id !== excludeId) ||
    sources.some((item) => item.name === name)
  )
}

const saveComputedPropForm = async (ctx: FormCtx, onClose: () => void) => {
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
  if (isComputedNameDuplicated(ctx.data, name, ctx.editingId.value || undefined)) {
    ctx.message.warning('名称与数据源或其它计算属性重复')
    return
  }
  const list = ensureList(ctx.data)
  const payload = buildPayload(ctx.formData, ctx.editingId.value)
  const index = list.findIndex((item) => item.id === payload.id)
  const next = list.slice()
  if (index >= 0) next[index] = payload
  else next.push(payload)
  ctx.data.value.computedProps = next
  ctx.message.success(ctx.editingId.value ? '修改成功' : '添加成功')
  onClose()
}

const createComputedPropActions = (ctx: FormCtx) => {
  const onClose = () => {
    ctx.drawerVisible.value = false
    ctx.editingId.value = ''
  }
  const onCreate = () => {
    Object.assign(ctx.formData, createEmptyForm())
    ctx.editingId.value = ''
    ctx.drawerVisible.value = true
  }
  const onEdit = (item: DesignerComputedPropItem) => {
    ctx.editingId.value = item.id
    ctx.formData.name = item.name
    ctx.formData.description = item.description || ''
    ctx.formData.code = item.code ?? ''
    ctx.drawerVisible.value = true
  }
  const onRemove = (id: string) => {
    ctx.data.value.computedProps = ensureList(ctx.data).filter(
      (item) => item.id !== id,
    )
    if (ctx.editingId.value === id) onClose()
    ctx.message.success('已删除')
  }
  return {
    onCreate,
    onEdit,
    onClose,
    onSave: () => saveComputedPropForm(ctx, onClose),
    onRemove,
  }
}

export const useComputedProps = (data: Ref<Record<string, any>>) => {
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive(createEmptyForm())
  const actions = createComputedPropActions({
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
    sortableList: computed({
      get: () => ensureList(data),
      set: (list: DesignerComputedPropItem[]) => {
        data.value.computedProps = list
      },
    }),
    ...actions,
  }
}
