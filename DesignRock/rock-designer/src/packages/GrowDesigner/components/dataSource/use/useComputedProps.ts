import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import type {
  DesignerComputedPropFormModel,
  DesignerComputedPropItem,
  DesignerDataSourceItem,
} from '../types'

export const useComputedProps = (data: Ref<Record<string, any>>) => {
  const message = useMsg()
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive<DesignerComputedPropFormModel>({
    name: '',
    description: '',
    code: '',
  })

  const formRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  }

  const computedList = computed(() => {
    return (data.value.computedProps || []) as DesignerComputedPropItem[]
  })

  const dataSourceList = computed(() => {
    return (data.value.dataSource || []) as DesignerDataSourceItem[]
  })

  const ensureList = () => {
    if (!Array.isArray(data.value.computedProps)) {
      data.value.computedProps = []
    }
    return data.value.computedProps as DesignerComputedPropItem[]
  }

  const sortableList = computed({
    get: () => ensureList(),
    set: (list: DesignerComputedPropItem[]) => {
      data.value.computedProps = list
    },
  })

  const resetForm = () => {
    formData.name = ''
    formData.description = ''
    formData.code = ''
    editingId.value = ''
  }

  const onCreate = () => {
    resetForm()
    drawerVisible.value = true
  }

  const onEdit = (item: DesignerComputedPropItem) => {
    editingId.value = item.id
    formData.name = item.name
    formData.description = item.description || ''
    formData.code = item.code ?? ''
    drawerVisible.value = true
  }

  const onClose = () => {
    drawerVisible.value = false
    editingId.value = ''
  }

  const isNameDuplicated = (name: string, excludeId?: string) => {
    const inComputed = computedList.value.some(
      (item) => item.name === name && item.id !== excludeId,
    )
    const inDataSource = dataSourceList.value.some((item) => item.name === name)
    return inComputed || inDataSource
  }

  const onSave = async () => {
    try {
      await formRef.value?.validate?.()
    } catch {
      return
    }

    const name = formData.name.trim()
    if (!name) {
      message.warning('请输入名称')
      return
    }
    if (isNameDuplicated(name, editingId.value || undefined)) {
      message.warning('名称与数据源或其它计算属性重复')
      return
    }

    const list = ensureList()
    const payload: DesignerComputedPropItem = {
      id: editingId.value || nanoid(),
      name,
      description: formData.description.trim(),
      code: formData.code,
    }

    const index = list.findIndex((item) => item.id === payload.id)
    const next = list.slice()
    if (index >= 0) {
      next[index] = payload
    } else {
      next.push(payload)
    }
    data.value.computedProps = next

    message.success(editingId.value ? '修改成功' : '添加成功')
    onClose()
  }

  const onRemove = (id: string) => {
    const list = ensureList()
    data.value.computedProps = list.filter((item) => item.id !== id)
    if (editingId.value === id) {
      onClose()
    }
    message.success('已删除')
  }

  return {
    formRef,
    formData,
    formRules,
    drawerVisible,
    editingId,
    sortableList,
    onCreate,
    onEdit,
    onClose,
    onSave,
    onRemove,
  }
}
