import type { MockMethod } from '@grow-admin-rock/mock/types';
import { mockUrl } from '@grow-admin-rock/mock/constants';
import {
  resultError,
  resultSuccess,
} from '@grow-admin-rock/mock/util';
import { recordAccountLogin, type AccountRecord } from './accountStore';
import { getDeptName, type PersonRecord } from './orgStore';

type AuthUser = {
  userId: string;
  username: string;
  realname: string;
  avatar: string;
  deptName: string;
  desc: string;
  password: string;
  accessToken: string;
  roles: Array<{ name: string; value: string }>;
};

function toAuthUser(account: AccountRecord, person?: PersonRecord): AuthUser {
  const hasSuper = account.roleIds.includes('role_super');
  return {
    userId: account.accountId,
    username: account.username,
    realname: person?.name || (account.username === 'admin' ? 'Grow Admin' : account.username),
    avatar: '',
    deptName: person ? getDeptName(person.deptId) : '',
    desc: account.remark || '',
    password: account.password,
    accessToken: account.username === 'admin' ? 'grow-admin-fake-token' : `grow-token-${account.accountId}`,
    roles: hasSuper
      ? [{ name: 'Super Admin', value: 'super' }]
      : [{ name: 'User', value: 'user' }],
  };
}

function rememberAuthUser(user: AuthUser) {
  const g = globalThis as typeof globalThis & { __GROW_AUTH_USERS__?: Record<string, AuthUser> };
  g.__GROW_AUTH_USERS__ = g.__GROW_AUTH_USERS__ || {};
  g.__GROW_AUTH_USERS__[user.accessToken] = user;
}

export function findAuthUserByToken(token?: string) {
  if (!token) return undefined;
  const g = globalThis as typeof globalThis & { __GROW_AUTH_USERS__?: Record<string, AuthUser> };
  return g.__GROW_AUTH_USERS__?.[token];
}

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
      const result = recordAccountLogin(String(username || ''), String(password || ''));
      if (!result || 'error' in result) {
        return resultError(result?.error || '账号或密码错误');
      }
      const user = toAuthUser(result.account, result.person);
      rememberAuthUser(user);
      return resultSuccess(user);
    },
  }
] as MockMethod[];

export default mocks;
