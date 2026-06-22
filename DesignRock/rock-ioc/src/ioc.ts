import { ThrownHandler } from '@grow-admin-rock/types';
import {
  interfaces,
  Container,
  ContainerModule,
  AsyncContainerModule,
} from 'inversify';
import { injectable, inject } from 'inversify';
import { InjectionKey } from 'vue';

export type ServiceIdentifier<T> = interfaces.ServiceIdentifier<T> & InjectionKey<T>;
export type IocModule = interfaces.ContainerModule;
export const IocModule = ContainerModule;
export type AsyncIocModule = interfaces.AsyncContainerModule;
export const AsyncIocModule = AsyncContainerModule;
export type IocContainer = Container;
export const IocContainer = Container;
export type IocContainerOptions = interfaces.ContainerOptions;
export const Bean = injectable;
export const Autowired = inject;

export const CONTAINER_KEY:ServiceIdentifier<IocContainer> = Symbol.for('CONTAINER_KEY') as ServiceIdentifier<IocContainer>;
export const THROWN_HANDLER:ServiceIdentifier<ThrownHandler> = Symbol.for('ThrownHandler') as ServiceIdentifier<ThrownHandler>;