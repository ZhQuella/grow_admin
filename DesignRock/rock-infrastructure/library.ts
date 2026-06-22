import type { CommonModuleLibContext } from '@grow-admin-rock/base-package';
import { install } from '@grow-admin-rock/base-package';
import { AsyncIocModule } from '@grow-admin-rock/ioc';
import { RequestOptions } from '@grow-admin-rock/types';
import { clone, deepMerge } from '@grow-admin-rock/utils';
import { defaultCreateAxiosOptions, defaultRequestOptions } from './bridge';
import * as pack from './package.json';
import { CreateAxiosOptions, InfrastructureAxios, InfrastructureOptions } from '.';
import types from './beankeys';

export const Lib: CommonModuleLibContext<typeof types> = {
  install,
  name: pack.name,
  version: pack.version,
  types,
  module: new AsyncIocModule(async (bind , unbind, isBound) => {
    console.debug(`【${pack.name}】 IocModule start load`);
    bind<InfrastructureAxios>(types.InfrastructureAxios).to(InfrastructureAxios);
    if (!isBound(types.CreateAxiosOptions)) {
      bind<CreateAxiosOptions>(types.CreateAxiosOptions).toDynamicValue(
        (context) => {
          if (!isBound(types.InfrastructureOptions)) {
            throw new Error('ContextOptions not found');
          }
          const contextOpt: InfrastructureOptions = context.container.get(types.InfrastructureOptions);
          let requestOptions: RequestOptions;
          if (isBound(types.RequestOptions)) {
            requestOptions = context.container.get(types.RequestOptions);
          } else {
            requestOptions = defaultRequestOptions;
          }
          requestOptions.apiUrl = contextOpt.apiUrl;
          const transformer = context.container.get(types.AxiosTransform);
          const config = {
            transform: clone(transformer),
            requestOptions,
          };
          return deepMerge(defaultCreateAxiosOptions, config);
        }
      );
    }
  })
};
