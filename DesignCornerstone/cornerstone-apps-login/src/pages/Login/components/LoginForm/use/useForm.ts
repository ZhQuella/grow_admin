import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { accountLogin, getCaptcha } from '#/api/login'
import { useLoginSuccess } from '#/pages/Login/use/useLoginSuccess'
import { useLoginRememberStore, useLockStore } from '@grow-admin-rock/state'

export function useLoginForm() {
  const { t } = useI18n()
  const { loginSuccess } = useLoginSuccess()
  const loginRememberStore = useLoginRememberStore()
  const lockStore = useLockStore()
  const loginFormRef = ref()
  const loading = ref(false)
  const captchaLoading = ref(false)
  const captchaId = ref('')
  const captchaImage = ref('')
  const loginFormData = reactive({
    tenantCode: 'platform',
    account: 'admin',
    password: '1237894560',
    captchaCode: '',
    isRemember: false,
  })

  const formRules = computed(() => ({
    tenantCode: [
      {
        required: true,
        message: t('layout.login.word.tenantCodeMsg'),
        trigger: ['blur', 'change'],
      },
    ],
    account: [
      {
        required: true,
        message: t('layout.login.word.accessMsg'),
        trigger: ['blur', 'change'],
      },
    ],
    password: [
      {
        required: true,
        message: t('layout.login.word.passwordMsg'),
        trigger: ['blur', 'change'],
      },
    ],
    captchaCode: [
      {
        required: true,
        message: t('layout.login.word.verificationCode'),
        trigger: ['blur', 'change'],
      },
    ],
  }))

  function formatCaptchaImage(imageBase64: string) {
    if (!imageBase64 || imageBase64.startsWith('data:')) return imageBase64
    return `data:image/png;base64,${imageBase64}`
  }

  async function refreshCaptcha() {
    if (captchaLoading.value) return
    captchaLoading.value = true
    try {
      const result = await getCaptcha()
      captchaId.value = result.captchaId
      captchaImage.value = formatCaptchaImage(result.imageBase64)
      loginFormData.captchaCode = ''
      await nextTick()
      driverRef(loginFormRef)?.clearValidate?.('captchaCode')
    } catch {
      captchaId.value = ''
      captchaImage.value = ''
    } finally {
      captchaLoading.value = false
    }
  }

  function saveFormInfo() {
    const { account, isRemember } = loginFormData
    loginRememberStore.saveAccount(account, isRemember)
  }

  function resetLoginForm() {
    loginFormData.password = '1237894560'
    if (loginRememberStore.account) {
      loginFormData.account = loginRememberStore.account
      loginFormData.isRemember = loginRememberStore.isRemember
    }
  }

  async function onLogin() {
    loading.value = true
    let loginRequested = false
    try {
      await driverRef(loginFormRef)?.validate()
      if (!captchaId.value) {
        throw new Error(t('layout.login.word.captchaLoadFailed'))
      }
      loginRequested = true
      const result = await accountLogin({
        tenantCode: loginFormData.tenantCode,
        account: loginFormData.account,
        password: loginFormData.password,
        captchaId: captchaId.value,
        captchaCode: loginFormData.captchaCode,
      })
      saveFormInfo()
      await lockStore.setUnlockSecret(loginFormData.password)
      loginSuccess(result)
    } catch {
      if (loginRequested) await refreshCaptcha()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    resetLoginForm()
    refreshCaptcha()
  })

  return {
    loginFormRef,
    loginFormData,
    formRules,
    loading,
    captchaLoading,
    captchaImage,
    refreshCaptcha,
    onLogin,
  }
}
