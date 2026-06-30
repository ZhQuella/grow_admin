import { computed, onMounted, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { accountLogin } from '#/api/login'
import { useLoginSuccess } from '#/pages/Login/use/useLoginSuccess'
import { useLoginRememberStore, useLockStore } from '@grow-admin-rock/state'

export function useLoginForm() {
  const { t } = useI18n()
  const message = useMsg()
  const { loginSuccess } = useLoginSuccess()
  const loginRememberStore = useLoginRememberStore()
  const lockStore = useLockStore()
  const loginFormRef = ref()
  const loading = ref(false)
  const loginFormData = reactive({
    account: 'admin',
    password: '1237894560',
    isRemember: false,
  })

  const formRules = computed(() => ({
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
  }))

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
    try {
      await driverRef(loginFormRef)?.validate()
      const result = await accountLogin({
        username: loginFormData.account,
        password: loginFormData.password,
      })
      saveFormInfo()
      await lockStore.setUnlockSecret(loginFormData.password)
      loginSuccess(result)
    } catch (error) {
      message.error?.(error instanceof Error ? error.message : String(error))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    resetLoginForm()
  })

  return {
    loginFormRef,
    loginFormData,
    formRules,
    loading,
    onLogin,
  }
}
