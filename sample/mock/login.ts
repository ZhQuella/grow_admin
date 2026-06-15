import type { MockMethod } from '@grow-admin-rock/mock/types';
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util';

function randomToken(length = 50) {
  const chars = '1234567890abcdef';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const Range = 999999 - 100000;
const verificationCode = `${100000 + Math.round(Math.random() * Range)}`;
const phone = '13800138000';
const identifying = randomToken(20);

const mocks = [
  {
    url: '/api/verification/code',
    method: 'post',
    timeout: 200,
    response: ({ body }) => {
      const { phoneNumber } = body;
      if (phoneNumber === phone) {
        return resultSuccess({ verificationCode }, { message: '获取验证码成功' });
      }
      return resultError('手机号不存在或账号不存在', { code: '50002' });
    },
  },
  {
    url: '/api/test/verification/code',
    method: 'post',
    timeout: 200,
    response: ({ body }) => {
      const { account, verificationCode: code } = body;
      if (account === 'admin' && code === verificationCode) {
        return resultSuccess({ identifying }, { message: '验证码验证成功' });
      }
      return resultError('验证码验证失败', { code: '50003' });
    },
  },
  {
    url: '/api/modify/account/password',
    method: 'post',
    timeout: 200,
    response: ({ body }) => {
      const { tagCode, newPassword } = body;
      if (identifying === tagCode && newPassword) {
        return resultSuccess(null, { message: '密码修改成功' });
      }
      return resultError('密码修改失败', { code: '50004' });
    },
  },
  {
    url: '/api/modify/phone/login',
    method: 'post',
    timeout: 200,
    response: ({ body }) => {
      const { phoneNumber, verificationCode: code } = body;
      if (phone === phoneNumber && code === verificationCode) {
        return resultSuccess(
          { accessToken: randomToken() },
          { message: '登录成功' },
        );
      }
      return resultError('账号错误或验证码错误', { code: '50004' });
    },
  },
] as MockMethod[];

export default mocks;
