import type { MockMethod } from 'vite-plugin-mock';

export type { MockMethod };

export interface MockRequestParams {
  method: string;
  body: Recordable<any>;
  headers?: { authorization?: string };
  query: Recordable<any>;
}

export type MockDefinition = MockMethod | MockMethod[];
