export type LoginFormType =
  | 'login'
  | 'forgetPassword'
  | 'changePassword'
  | 'mobilePhone'
  | 'qrCodeLogin'

export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  MOBILE,
  QR_CODE,
  OAUTH_CODE,
}
