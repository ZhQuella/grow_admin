import type { MockMethod } from 'vite-plugin-mock';

export type { MockMethod };

export interface MockRequestParams {
  method: string;
  body: Recordable<any>;
  /** 请求头（键名须为小写，由生产拦截器 / 开发中间件在入口归一化） */
  headers?: { authorization?: string } & Recordable<string>;
  query: Recordable<any>;
}

export type MockDefinition = MockMethod | MockMethod[];
