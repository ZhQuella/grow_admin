import { diK } from '@grow-admin-rock/ioc';
import { globalMockRegistry, MockRegistry } from '#/MockRegistry';
import { isMockEnabled } from '#/registerMock';
import types from '../beankeys';

export function useMockRegistry(): MockRegistry {
  return diK(types.MockRegistry) ?? globalMockRegistry;
}

export function useMock() {
  return {
    enabled: isMockEnabled(),
    registry: useMockRegistry(),
    getModules: () => useMockRegistry().getAll(),
  };
}
