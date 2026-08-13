import { reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { createLowcodeAsset, updateLowcodeAsset } from '../../../../api/lowcodeAsset'
import {
  LOWCODE_ASSET_TYPE_OPTIONS,
  type LowcodeAssetListItem,
  type LowcodeAssetType,
} from '../../../../types/lowcodeAsset'

type FormModel = {
  id?: string
  name: string
  code: string
  type: LowcodeAssetType
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
  const typeOptions = LOWCODE_ASSET_TYPE_OPTIONS
  const formModel = reactive<FormModel>({
    name: '',
    code: '',
    type: 'page',
    description: '',
  })

  const formRules = {
    type: [{ required: true, message: '请选择类型', trigger: 'change' }],
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

  function resetFormModel(type: LowcodeAssetType = 'page') {
    formModel.id = undefined
    formModel.name = ''
    formModel.code = ''
    formModel.type = type
    formModel.description = ''
  }

  function openCreate() {
    formMode.value = 'create'
    resetFormModel('page')
    formVisible.value = true
  }

  function openEdit(row: LowcodeAssetListItem) {
    formMode.value = 'edit'
    formModel.id = row.id
    formModel.name = row.name
    formModel.code = row.code
    formModel.type = row.type
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
        await createLowcodeAsset({
          name: formModel.name.trim(),
          code: formModel.code.trim(),
          type: formModel.type,
          description: formModel.description.trim(),
        })
        message.success('创建成功')
      } else if (formModel.id) {
        await updateLowcodeAsset(formModel.id, {
          name: formModel.name.trim(),
          type: formModel.type,
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
    typeOptions,
    openCreate,
    openEdit,
    submitForm,
  }
}
