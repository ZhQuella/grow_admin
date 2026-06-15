import { computed, onMounted, reactive, ref } from 'vue'
import { ACCOUNT_INFO } from '@grow-admin-rock/constants'
import { driverRef } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { useMsg } from '@grow-admin-rock/components'
import { accountLogin } from '#/api/login'
import { useLoginSuccess } from '#/composables/useLoginSuccess'

const accountStorage = {
  get(key: string) {
    return localStorage.getItem(key)
  },
  set(key: string, value: string) {
    localStorage.setItem(key, value)
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
}

export function useLoginForm() {
  const { t } = useI18n()
  const message = useMsg()
  const { loginSuccess } = useLoginSuccess()
  const loginFormRef = ref()
  const loading = ref(false)
  const loginFormData = reactive({
    account: 'admin',
    password: '123456',
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
    const { account, password, isRemember } = loginFormData
    if (!isRemember) {
      accountStorage.remove(ACCOUNT_INFO)
      return
    }
    accountStorage.set(
      ACCOUNT_INFO,
      JSON.stringify({ account, password, isRemember }),
    )
  }

  function resetLoginForm() {
    try {
      const cached = JSON.parse(accountStorage.get(ACCOUNT_INFO) || '{}')
      if (cached.account && cached.password) {
        loginFormData.account = cached.account
        loginFormData.password = cached.password
        loginFormData.isRemember = cached.isRemember
      }
    } catch {
      // ignore invalid cache
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
