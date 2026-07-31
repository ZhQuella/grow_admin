import { computed, reactive, ref, type Ref } from 'vue'
import { nanoid } from 'nanoid'
import { useMsg } from '@grow-admin-rock/components'
import { createDefaultApiForm } from '../constants'
import type { DesignerApiFormModel, DesignerApiOutlinedItem } from '../types'

export const useApiOutlined = (data: Ref<Record<string, any>>) => {
  const message = useMsg()
  const formRef = ref<{ validate?: () => Promise<void> } | null>(null)
  const drawerVisible = ref(false)
  const editingId = ref('')
  const formData = reactive<DesignerApiFormModel>(createDefaultApiForm())

  const formRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  }

  const apiList = computed(() => {
    return (data.value.apiOutlined || []) as DesignerApiOutlinedItem[]
  })

  const ensureApiList = () => {
    if (!Array.isArray(data.value.apiOutlined)) {
      data.value.apiOutlined = []
    }
    return data.value.apiOutlined as DesignerApiOutlinedItem[]
  }

  const sortableList = computed({
    get: () => ensureApiList(),
    set: (list: DesignerApiOutlinedItem[]) => {
      data.value.apiOutlined = list
    },
  })

  const mapParamRows = (rows?: DesignerApiOutlinedItem['params']) =>
    (rows || []).map((row) => ({
      key: row.key || '',
      value: row.value || '',
      bindMode: row.bindMode || 'text',
    }))

  const assignForm = (item?: DesignerApiOutlinedItem) => {
    const source = item
      ? {
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
      : createDefaultApiForm()

    Object.assign(formData, source)
  }

  const resetForm = () => {
    editingId.value = ''
    assignForm()
  }

  const onCreate = () => {
    resetForm()
    drawerVisible.value = true
  }

  const onEdit = (item: DesignerApiOutlinedItem) => {
    editingId.value = item.id
    assignForm(item)
    drawerVisible.value = true
  }

  const onClose = () => {
    drawerVisible.value = false
    editingId.value = ''
  }

  const isNameDuplicated = (name: string, excludeId?: string) => {
    return apiList.value.some((item) => item.name === name && item.id !== excludeId)
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
      message.warning('数据请求名称已存在')
      return
    }

    const list = ensureApiList()
    const mapSaveParams = (rows: DesignerApiOutlinedItem['params']) =>
      (rows || []).map((row) => ({
        key: row.key,
        value: row.value,
        bindMode: row.bindMode || 'text',
      }))

    const payload: DesignerApiOutlinedItem = {
      id: editingId.value || nanoid(),
      name,
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
    }

    const index = list.findIndex((item) => item.id === payload.id)
    if (index >= 0) {
      list[index] = payload
    } else {
      list.push(payload)
    }

    message.success(editingId.value ? '修改成功' : '添加成功')
    onClose()
  }

  const onRemove = (id: string) => {
    const list = ensureApiList()
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return
    list.splice(index, 1)
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
    apiList,
    sortableList,
    onCreate,
    onEdit,
    onClose,
    onSave,
    onRemove,
  }
}
