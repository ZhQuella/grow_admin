import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer';
import { getMockModules } from '#/registerMock';
import { loadMockModules } from '#/loadMockModules';
import type { MockMethod } from '#/types';

export function createAppMockServer(modules: Record<string, unknown>) {
  const mocks: MockMethod[] = [
    ...loadMockModules(modules),
    ...getMockModules(),
  ];

  return createProdMockServer(mocks);
}
