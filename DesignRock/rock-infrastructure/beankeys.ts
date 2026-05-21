import * as pack from "./package.json"
import { AxiosTransform, CreateAxiosOptions, InfrastructureAxios } from '.';
import { InfrastructureOptions } from './bridge';
import { ServiceIdentifier } from '@grow-admin-rock/ioc';
import { RequestOptions } from '@grow-admin-rock/types';

export default {
  /**
   * 基础设施参数
   */
  InfrastructureOptions: Symbol.for(`${pack.name}/InfrastructureOptions`) as ServiceIdentifier<InfrastructureOptions>,
  /**
   * 请求发送参数
   */
  RequestOptions: Symbol.for(`${pack.name}/RequestOptions`) as ServiceIdentifier<RequestOptions>,
  /**
   * Axios初始化参数
   */
  CreateAxiosOptions: Symbol.for(`${pack.name}/CreateAxiosOptions`) as ServiceIdentifier<Partial<CreateAxiosOptions>>,
  /**
   * Axios初始化参数
   */
  AxiosTransform: Symbol.for(`${pack.name}/AxiosTransform`) as ServiceIdentifier<AxiosTransform>,
  /**
   * 基础设施中的Axio对象
   */
  InfrastructureAxios: Symbol.for(`${pack.name}/InfrastructureAxios`) as ServiceIdentifier<InfrastructureAxios>,
};