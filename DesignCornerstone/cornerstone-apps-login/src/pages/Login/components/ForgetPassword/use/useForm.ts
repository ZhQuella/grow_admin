import { computed, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { testVerificationCode } from '#/api/login'

const PHONE_PATTERN =
  /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/

export function useForgetPasswordForm(emit: (event: 'success' | 'back', ...args: any[]) => void) {
  const { t } = useI18n()
  const message = useMsg()
  const forgetFormRef = ref()
  const forgetForm = reactive({
    phoneNumber: '13800138000',
    account: 'admin',
    verificationCode: '',
  })

  const rules = computed(() => ({
    phoneNumber: [
      {
        required: true,
        message: t('layout.login.word.mobilePhone'),
        trigger: ['blur', 'change'],
      },
      {
        pattern: PHONE_PATTERN,
        message: t('layout.login.word.phoneNumError'),
      },
    ],
    account: [
      {
        required: true,
        message: t('layout.login.word.accessMsg'),
        trigger: ['blur', 'change'],
      },
    ],
    verificationCode: [
      {
        required: true,
        message: t('layout.login.word.verificationCode'),
        trigger: ['blur', 'change'],
      },
    ],
  }))

  async function onForgetPassword() {
    try {
      await driverRef(forgetFormRef)?.validate()
      const result = await testVerificationCode(forgetForm)
      emit('success', result?.identifying ?? result)
    } catch (error) {
      message.error?.(error instanceof Error ? error.message : String(error))
    }
  }

  function onBackClick() {
    emit('back', 'login')
  }

  return {
    forgetFormRef,
    forgetForm,
    rules,
    onForgetPassword,
    onBackClick,
  }
}
