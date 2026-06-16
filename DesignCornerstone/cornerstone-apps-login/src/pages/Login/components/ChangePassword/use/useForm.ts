import { computed, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { modifyPassword } from '#/api/login'

export function useChangePasswordForm(
  tagCode: string,
  emit: (event: 'success' | 'back') => void,
) {
  const { t } = useI18n()
  const message = useMsg()
  const formRef = ref()
  const formData = reactive({
    password: '',
    newPassword: '',
  })

  function validatePasswordSame(_rule: unknown, _value: string, callback: (error?: Error) => void) {
    if (!formData.password || !formData.newPassword) {
      callback()
      return
    }
    if (formData.password !== formData.newPassword) {
      callback(new Error(t('layout.login.word.oldNewDifferent')))
      return
    }
    callback()
  }

  const rules = computed(() => ({
    password: [
      { required: true, message: t('layout.login.word.newPasswordContext') },
      { min: 6, max: 20, message: t('layout.login.word.passwordLenContext') },
      { validator: validatePasswordSame, message: t('layout.login.word.oldNewDifferent') },
    ],
    newPassword: [
      { required: true, message: t('layout.login.word.enterPasswordContext') },
      { min: 6, max: 20, message: t('layout.login.word.passwordLenContext') },
      { validator: validatePasswordSame, message: t('layout.login.word.oldNewDifferent') },
    ],
  }))

  async function onModifyPassword() {
    try {
      await driverRef(formRef)?.validate()
      await modifyPassword({
        ...formData,
        tagCode,
      })
      emit('success')
    } catch (error) {
      message.error?.(error instanceof Error ? error.message : String(error))
    }
  }

  function onBack() {
    emit('back')
  }

  return {
    formRef,
    formData,
    rules,
    onModifyPassword,
    onBack,
  }
}
