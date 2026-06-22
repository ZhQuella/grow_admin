import type { MockMethod } from '@grow-admin-rock/mock/types';
import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  getRequestToken,
  resultError,
  resultSuccess,
} from '@grow-admin-rock/mock/util';
import { createFakeUserList } from './auth';

const fakeUser = createFakeUserList()[0];

function toUserInfo() {
  const { password, accessToken, roles, desc, ...userInfo } = fakeUser;
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
      return resultSuccess(toUserInfo(), { message: '获取用户信息成功' });
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
