import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import type { DesignerDataSourceFormModel, DesignerDataSourceItem } from '../types'

export const useDataSource = (data: Ref<Record<string, any>>) => {
  const message = useMsg()
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive<DesignerDataSourceFormModel>({
    name: '',
    description: '',
    data: '',
  })

  const formRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  }

  const sourceList = computed(() => {
    return (data.value.dataSource || []) as DesignerDataSourceItem[]
  })

  const ensureDataSourceList = () => {
    if (!Array.isArray(data.value.dataSource)) {
      data.value.dataSource = []
    }
    return data.value.dataSource as DesignerDataSourceItem[]
  }

  const sortableList = computed({
    get: () => ensureDataSourceList(),
    set: (list: DesignerDataSourceItem[]) => {
      data.value.dataSource = list
    },
  })

  const resetForm = () => {
    formData.name = ''
    formData.description = ''
    formData.data = ''
    editingId.value = ''
  }

  const onCreate = () => {
    resetForm()
    drawerVisible.value = true
  }

  const onEdit = (item: DesignerDataSourceItem) => {
    editingId.value = item.id
    formData.name = item.name
    formData.description = item.description || ''
    formData.data = item.data ?? ''
    drawerVisible.value = true
  }

  const onClose = () => {
    drawerVisible.value = false
    editingId.value = ''
  }

  const isNameDuplicated = (name: string, excludeId?: string) => {
    return sourceList.value.some((item) => item.name === name && item.id !== excludeId)
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
      message.warning('数据源名称已存在')
      return
    }

    const list = ensureDataSourceList()
    const payload: DesignerDataSourceItem = {
      id: editingId.value || nanoid(),
      name,
      description: formData.description.trim(),
      data: formData.data,
    }

    const index = list.findIndex((item) => item.id === payload.id)
    const next = list.slice()
    if (index >= 0) {
      next[index] = payload
    } else {
      next.push(payload)
    }
    // 替换数组引用，确保绑定组件 / 预览跟随更新
    data.value.dataSource = next

    message.success(editingId.value ? '修改成功' : '添加成功')
    onClose()
  }

  const onRemove = (id: string) => {
    const list = ensureDataSourceList()
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return
    data.value.dataSource = list.filter((item) => item.id !== id)
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
    sourceList,
    sortableList,
    onCreate,
    onEdit,
    onClose,
    onSave,
    onRemove,
  }
}
