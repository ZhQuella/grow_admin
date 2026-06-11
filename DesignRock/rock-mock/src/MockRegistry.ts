import type { MockDefinition, MockMethod } from '#/types';

function normalizeMocks(definition: MockDefinition): MockMethod[] {
  return Array.isArray(definition) ? definition : [definition];
}

export class MockRegistry {
  private mocks: MockMethod[] = [];

  register(definition: MockDefinition) {
    this.mocks.push(...normalizeMocks(definition));
    return this;
  }

  registerMany(definitions: MockDefinition[]) {
    definitions.forEach((definition) => this.register(definition));
    return this;
  }

  getAll(): MockMethod[] {
    return [...this.mocks];
  }

  clear() {
    this.mocks = [];
    return this;
  }
}

export const globalMockRegistry = new MockRegistry();
