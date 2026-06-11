import * as pack from './package.json';
import type { ServiceIdentifier } from '@grow-admin-rock/ioc';
import type { MockRegistry } from '#/MockRegistry';

export default {
  MockRegistry: Symbol.for(`${pack.name}/MockRegistry`) as ServiceIdentifier<MockRegistry>,
  MockEnabled: Symbol.for(`${pack.name}/MockEnabled`) as ServiceIdentifier<boolean>,
};
