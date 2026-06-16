import { computed, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { phoneLogin } from '#/api/login'
import { useLoginSuccess } from '#/pages/Login/use/useLoginSuccess'

const PHONE_PATTERN =
  /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/

export function usePhoneLogin(emit: (event: 'back', type: string) => void) {
  const { t } = useI18n()
  const message = useMsg()
  const { loginSuccess } = useLoginSuccess()
  const loginLoading = ref(false)
  const formRef = ref()
  const formData = reactive({
    phoneNumber: '13800138000',
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
    verificationCode: [
      {
        required: true,
        message: t('layout.login.word.verificationCode'),
        trigger: ['blur', 'change'],
      },
    ],
  }))

  async function onPhoneLogin() {
    loginLoading.value = true
    try {
      await driverRef(formRef)?.validate()
      const result = await phoneLogin(formData)
      loginSuccess(result)
    } catch (error) {
      message.error?.(error instanceof Error ? error.message : String(error))
    } finally {
      loginLoading.value = false
    }
  }

  function onBackClick() {
    emit('back', 'login')
  }

  return {
    formRef,
    formData,
    rules,
    loginLoading,
    onPhoneLogin,
    onBackClick,
  }
}
