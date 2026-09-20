import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'

export interface AccountLoginParams {
  tenantCode: string
  account: string
  password: string
  captchaId: string
  captchaCode: string
}

export interface CaptchaResult {
  captchaId: string
  imageBase64: string
}

export interface AccountLoginResult {
  accessToken: string
}

export interface ForgetPasswordForm {
  account: string
  phoneNumber: string
  verificationCode: string
}

export interface ChangePasswordParams {
  password: string
  newPassword: string
  tagCode: string
}

export interface PhoneLoginParams {
  phoneNumber: string
  verificationCode: string
}

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)
const accountApiUrl = import.meta.env.VITE_ACCOUNT_API_URL

export function loginMockTest(params: { username: string; password: string }) {
  return useRequest().post(
    {
      url: '/login',
      data: params,
    },
    {
      errorMessageMode: 'none',
      isTransformResponse: false,
    },
  )
}

export function accountLogin(params: AccountLoginParams) {
  return useRequest().post<AccountLoginResult>(
    {
      url: '/account/login',
      baseURL: accountApiUrl,
      data: params,
    },
    { withToken: false, errorMessageMode: 'message' },
  )
}

export function getCaptcha() {
  return useRequest().get<CaptchaResult>(
    {
      url: '/account/captcha',
      baseURL: accountApiUrl,
    },
    { withToken: false, errorMessageMode: 'message' },
  )
}

export function getVerificationCode(data: Pick<ForgetPasswordForm, 'phoneNumber' | 'account'>) {
  return useRequest().post<Recordable<any>>({
    url: '/verification/code',
    data,
  })
}

export function testVerificationCode(data: ForgetPasswordForm) {
  return useRequest().post<Recordable<any>>({
    url: '/test/verification/code',
    data,
  })
}

export function modifyPassword(data: ChangePasswordParams) {
  return useRequest().post({
    url: '/modify/account/password',
    data,
  })
}

export function phoneLogin(data: PhoneLoginParams) {
  return useRequest().post<Recordable<any>>({
    url: '/modify/phone/login',
    data,
  })
}
