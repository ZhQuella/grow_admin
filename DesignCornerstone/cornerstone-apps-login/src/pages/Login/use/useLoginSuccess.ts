import { AUTHORITY_TOKEN } from '@grow-admin-rock/constants'
import { useRouter } from 'vue-router'

const tokenStorage = {
  get(key: string) {
    return sessionStorage.getItem(key)
  },
  set(key: string, value: string) {
    sessionStorage.setItem(key, value)
  },
  remove(key: string) {
    sessionStorage.removeItem(key)
  },
}

export function useLoginSuccess() {
  const router = useRouter()

  function loginSuccess(result: Recordable<any>) {
    const token = result?.accessToken ?? result?.token
    if (!token) {
      throw new Error('登录响应缺少 token')
    }
    tokenStorage.set(AUTHORITY_TOKEN, token)
    router.push({ name: 'Home' })
  }

  return {
    loginSuccess,
  }
}
