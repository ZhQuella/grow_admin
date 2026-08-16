import { reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { createSchemaAsset, updateSchemaAsset } from '../../../../api/schemaAsset'
import type { SchemaAssetListItem } from '../../../../types/schemaAsset'

type FormModel = {
  id?: string
  name: string
  code: string
  description: string
}

type UseAssetFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function useAssetForm(options: UseAssetFormOptions) {
  const message = useMsg()

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref<{ validate?: () => Promise<boolean> } | null>(null)
  const formModel = reactive<FormModel>({
    name: '',
    code: '',
    description: '',
  })

  const formRules = {
    name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [
      { required: true, message: '请填写编码', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '编码需以字母开头，仅含字母数字下划线',
        trigger: 'blur',
      },
    ],
  }

  function resetFormModel() {
    formModel.id = undefined
    formModel.name = ''
    formModel.code = ''
    formModel.description = ''
  }

  function openCreate() {
    formMode.value = 'create'
    resetFormModel()
    formVisible.value = true
  }

  function openEdit(row: SchemaAssetListItem) {
    formMode.value = 'edit'
    formModel.id = row.id
    formModel.name = row.name
    formModel.code = row.code
    formModel.description = row.description || ''
    formVisible.value = true
  }

  async function submitForm() {
    try {
      await formRef.value?.validate?.()
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      if (formMode.value === 'create') {
        await createSchemaAsset({
          name: formModel.name.trim(),
          code: formModel.code.trim(),
          description: formModel.description.trim(),
        })
        message.success('创建成功')
      } else if (formModel.id) {
        await updateSchemaAsset(formModel.id, {
          name: formModel.name.trim(),
          description: formModel.description.trim(),
        })
        message.success('保存成功')
      }
      formVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
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
    openCreate,
    openEdit,
    submitForm,
  }
}
