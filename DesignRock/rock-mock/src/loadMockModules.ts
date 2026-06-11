import type { MockMethod } from '#/types';

type MockModule = { default?: MockMethod[] } | MockMethod[];

export function loadMockModules(modules: Record<string, unknown>): MockMethod[] {
  const mockModules: MockMethod[] = [];

  Object.keys(modules).forEach((key) => {
    if (key.includes('/_')) {
      return;
    }

    const module = modules[key] as MockModule;
    const items = Array.isArray(module) ? module : module.default;

    if (items?.length) {
      mockModules.push(...items);
    }
  });

  return mockModules;
}
