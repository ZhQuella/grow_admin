import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { getVerificationCode } from '#/api/login'

interface VerificationForm {
  phoneNumber: string
  account?: string
  verificationCode?: string
}

export function useVerificationCode(forgetForm: VerificationForm) {
  const { t } = useI18n()
  const message = useMsg()
  const isCooling = ref(false)
  const secNum = ref(0)
  const timer = ref<ReturnType<typeof setInterval>>()

  const isGetCodeDisabled = computed(() => {
    return !forgetForm.phoneNumber && !forgetForm.account
  })

  const codeContext = computed(() => {
    if (isCooling.value) {
      return `${secNum.value}s`
    }
    return t('layout.login.word.getCode')
  })

  function countSecond() {
    clearInterval(timer.value)
    timer.value = setInterval(() => {
      secNum.value -= 1
      if (secNum.value < 0) {
        isCooling.value = false
        clearInterval(timer.value)
      }
    }, 1000)
  }

  async function onGetVerificationCode() {
    if (isCooling.value) return
    secNum.value = 60
    isCooling.value = true
    countSecond()

    try {
      const result = await getVerificationCode({
        phoneNumber: forgetForm.phoneNumber,
        account: forgetForm.account,
      })
      if (result?.verificationCode) {
        forgetForm.verificationCode = result.verificationCode
      }
    } catch (error) {
      message.error?.(error instanceof Error ? error.message : String(error))
    }
  }

  onUnmounted(() => {
    clearInterval(timer.value)
  })

  return {
    codeContext,
    isCooling,
    isGetCodeDisabled,
    onGetVerificationCode,
  }
}
