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
  tenantId: string;
  username: string;
  realname: string;
  avatar: string;
  deptName: string;
  desc: string;
  password: string;
  accessToken: string;
  roles: Array<{ name: string; value: string }>;
};

type CaptchaStore = Record<string, string>;

function accountResultSuccess<T>(data: T) {
  return {
    code: 200,
    message: '操作成功',
    data,
  };
}

function captchaStore() {
  const g = globalThis as typeof globalThis & { __GROW_CAPTCHAS__?: CaptchaStore };
  g.__GROW_CAPTCHAS__ = g.__GROW_CAPTCHAS__ || {};
  return g.__GROW_CAPTCHAS__;
}

function createCaptcha() {
  const captchaId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const captchaCode = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" fill="#f1f5f9"/><path d="M4 31L116 9M8 8L112 33" stroke="#cbd5e1"/><text x="60" y="28" text-anchor="middle" font-family="monospace" font-size="24" font-weight="700" letter-spacing="5" fill="#334155">${captchaCode}</text></svg>`;
  captchaStore()[captchaId] = captchaCode;
  return {
    captchaId,
    imageBase64: `data:image/svg+xml;base64,${btoa(svg)}`,
  };
}

function toAuthUser(account: AccountRecord, person?: PersonRecord): AuthUser {
  const hasSuper = account.roleIds.includes('role_super');
  return {
    userId: account.accountId,
    tenantId: '1',
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
      tenantId: '1',
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
    url: mockUrl('/account/captcha'),
    timeout: 200,
    method: 'get',
    response: () => accountResultSuccess(createCaptcha()),
  },
  {
    url: mockUrl('/account/login'),
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const { tenantCode, account, password, captchaId, captchaCode } = body;
      const expectedCaptchaCode = captchaStore()[String(captchaId || '')];
      delete captchaStore()[String(captchaId || '')];
      if (!tenantCode) return resultError('请输入租户代码');
      if (!expectedCaptchaCode || expectedCaptchaCode !== String(captchaCode || '').toUpperCase()) {
        return resultError('验证码错误或已失效');
      }
      const result = recordAccountLogin(String(account || ''), String(password || ''));
      if (!result || 'error' in result) {
        return resultError(result?.error || '账号或密码错误');
      }
      const user = toAuthUser(result.account, result.person);
      rememberAuthUser(user);
      return accountResultSuccess({ accessToken: user.accessToken });
    },
  },
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
