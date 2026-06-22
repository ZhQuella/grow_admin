import { getMockModules } from '#/registerMock';
import { loadMockModules } from '#/loadMockModules';
import { installProdMockInterceptor } from '#/prodMockInterceptor';
import type { MockMethod } from '#/types';

export function createAppMockServer(modules: Record<string, unknown>) {
  const mocks: MockMethod[] = [
    ...loadMockModules(modules),
    ...getMockModules(),
  ];

  installProdMockInterceptor(mocks);
}
