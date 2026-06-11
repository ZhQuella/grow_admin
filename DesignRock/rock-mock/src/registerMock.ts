import { diK } from '@grow-admin-rock/ioc';
import type { MockDefinition } from '#/types';
import { globalMockRegistry } from '#/MockRegistry';
import types from '../beankeys';

export function registerMock(definition: MockDefinition) {
  const registry = diK(types.MockRegistry) ?? globalMockRegistry;
  registry.register(definition);
  return registry;
}

export function registerMocks(definitions: MockDefinition[]) {
  const registry = diK(types.MockRegistry) ?? globalMockRegistry;
  registry.registerMany(definitions);
  return registry;
}

export function getMockModules(): MockMethod[] {
  const registry = diK(types.MockRegistry) ?? globalMockRegistry;
  return registry.getAll();
}

export function isMockEnabled() {
  return diK(types.MockEnabled) ?? import.meta.env.VITE_USE_MOCK === 'true';
}
