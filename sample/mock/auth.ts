import type { MockMethod } from '@grow-admin-rock/mock/types';
import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  getRequestToken,
  resultError,
  resultSuccess,
} from '@grow-admin-rock/mock/util';

export function createFakeUserList() {
  return [
    {
      userId: '1',
      username: 'admin',
      realname: 'Grow Admin',
      avatar: '',
      deptName: '技术部',
      desc: 'administrator',
      password: '1237894560',
      accessToken: 'grow-admin-fake-token',
      roles: [{ name: 'Super Admin', value: 'super' }],
    },
  ];
}

const mocks = [
  {
    url: mockUrl('/login'),
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body;
      const user = createFakeUserList().find(
        (item) => item.username === username && item.password === password,
      );

      if (!user) {
        return resultError('账号或密码错误');
      }

      return resultSuccess(user);
    },
  }
] as MockMethod[];

export default mocks;
