import { reactive, ref } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import { createSystemRole, updateSystemRole } from '../../../api/systemRole'
import {
  ROLE_CODE_MESSAGE,
  ROLE_CODE_PATTERN,
  type SystemRoleListItem,
} from '../../../types/systemRole'
import { toMessage } from './helpers'

type FormModel = {
  id?: string
  name: string
  code: string
  sort: number
  remark: string
}

function emptyForm(): FormModel {
  return {
    id: undefined,
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

type UseRoleFormOptions = {
  onSuccess: () => void | Promise<void>
}

export function useRoleForm(options: UseRoleFormOptions) {
  const message = useMsg()

  const formVisible = ref(false)
  const formMode = ref<'create' | 'edit'>('create')
  const formSubmitting = ref(false)
  const formRef = ref()
  const formModel = reactive<FormModel>(emptyForm())

  const formRules = {
    name: [{ required: true, message: '请填写名称', trigger: 'blur' }],
    code: [
      { required: true, message: '请填写编码', trigger: 'blur' },
      {
        pattern: ROLE_CODE_PATTERN,
        message: ROLE_CODE_MESSAGE,
        trigger: 'blur',
      },
    ],
  }

  function openCreate() {
    formMode.value = 'create'
    Object.assign(formModel, emptyForm())
    formVisible.value = true
  }

  function openEdit(row: SystemRoleListItem) {
    formMode.value = 'edit'
    Object.assign(formModel, {
      id: row.id,
      name: row.name,
      code: row.code,
      sort: Number(row.sort ?? 10),
      remark: row.remark || '',
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
      if (formMode.value === 'create') {
        await createSystemRole({
          name: formModel.name.trim(),
          code: formModel.code.trim(),
          sort: Number(formModel.sort ?? 0),
          remark: formModel.remark.trim(),
        })
        message.success('创建成功')
      } else if (formModel.id) {
        await updateSystemRole(formModel.id, {
          name: formModel.name.trim(),
          sort: Number(formModel.sort ?? 0),
          remark: formModel.remark.trim(),
        })
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
