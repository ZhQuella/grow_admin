import type { MockMethod } from '@grow-admin-rock/mock/types';
import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  getRequestToken,
  resultError,
  resultSuccess,
} from '@grow-admin-rock/mock/util';
import { createFakeUserList, findAuthUserByToken } from './auth';

function toUserInfo(user = createFakeUserList()[0]) {
  const { password, accessToken, desc, ...userInfo } = user;
  return userInfo;
}

const mocks = [
  {
    url: mockUrl('/user/info'),
    method: 'get',
    timeout: 200,
    response: (req) => {
      const token = getRequestToken(req);
      if (!token) {
        return resultError('未登录或登录已过期');
      }
      const current = findAuthUserByToken(token) || createFakeUserList()[0];
      return resultSuccess(toUserInfo(current), { message: '获取用户信息成功' });
    },
  },
  {
    url: mockUrl('/logout'),
    method: 'post',
    timeout: 200,
    response: (req) => {
      const token = getRequestToken(req);
      if (!token) {
        return resultError('未登录或登录已过期');
      }
      return resultSuccess(null, { message: '退出登录成功' });
    },
  },
] as MockMethod[];

export default mocks;
