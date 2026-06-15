import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { LoginFormType } from '#/constant'

export function useLoginEvent() {
  const router = useRouter()
  const formType = ref<LoginFormType>('login')
  const tagCode = ref('')

  function onChangeFormType(type: LoginFormType | string) {
    formType.value = type as LoginFormType
  }

  function onForgetPasswordSuccess(identifying: string) {
    tagCode.value = identifying
    formType.value = 'changePassword'
  }

  function onChangePasswordBack() {
    tagCode.value = ''
    formType.value = 'forgetPassword'
  }

  function onChangePasswordSuccess() {
    tagCode.value = ''
    formType.value = 'login'
  }

  function onGoToIndex() {
    router.push({ name: 'Home' })
  }

  return {
    formType,
    tagCode,
    onGoToIndex,
    onChangeFormType,
    onForgetPasswordSuccess,
    onChangePasswordBack,
    onChangePasswordSuccess,
  }
}
