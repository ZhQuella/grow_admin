import * as pack from './package.json';
import { ServiceIdentifier } from '@grow-admin-rock/ioc';
import { RouteOperator, RoutesTable } from '#/.';
import { MenuState } from '#/model/MenuState';

export const Beans = {
  RouteTable: Symbol.for(`${pack.name}/RouteTable`) as ServiceIdentifier<RoutesTable>,
  RouteOperator: Symbol.for(`${pack.name}/RouteOperator`) as ServiceIdentifier<RouteOperator>,
  MenuState: Symbol.for(`${pack.name}/MenuState`) as ServiceIdentifier<MenuState>,
};
export type BeanKeys = typeof Beans;

/**
 * Module提供的Bean
 */
export const ProvideBean = Beans