import { reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { createSystemPosition, updateSystemPosition } from '../../../api/systemPosition'
import type { SystemPositionListItem } from '../../../types/systemPosition'
import { toMessage, validateGrowForm } from './helpers'

type FormModel = {
  id?: string
  name: string
  code: string
  level: number
  sort: number
  description: string
}

function emptyForm(): FormModel {
  return {
    id: undefined,
    name: '',
    code: '',
    level: 1,
    sort: 10,
    description: '',
  }
}

type UsePositionFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function usePositionForm(options: UsePositionFormOptions) {
  const message = useMsg() as any

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const formRules = {
    name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [{ required: true, message: '请填写编码', trigger: 'blur' }],
    level: [{ required: true, message: '请填写层级', trigger: 'blur' }],
  }

  function openCreate() {
    formMode.value = 'create'
    Object.assign(formModel, emptyForm())
    formVisible.value = true
  }

  function openEdit(row: SystemPositionListItem) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      id: row.id,
      name: row.name,
      code: row.code,
      level: Number(row.level ?? 1),
      sort: Number(row.sort ?? 10),
      description: row.description || '',
    })
    formVisible.value = true
  }

  async function submitForm() {
    try {
      await validateGrowForm(formRef)
    } catch {
      return
    }

    formSubmitting.value = true
    try {
      const payload = {
        name: formModel.name.trim(),
        code: formModel.code.trim(),
        level: Number(formModel.level ?? 1),
        sort: Number(formModel.sort ?? 0),
        description: formModel.description.trim(),
      }
      if (formMode.value === 'create') {
        await createSystemPosition(payload)
        message.success('创建成功')
      } else if (formModel.id) {
        await updateSystemPosition(formModel.id, payload)
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
    formRef,
    formModel,
    formRules,
    openCreate,
    openEdit,
    submitForm,
  }
}
