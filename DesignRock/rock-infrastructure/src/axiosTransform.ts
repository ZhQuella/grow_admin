/**
 * Data processing class, can be configured according to the project
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestOptions, RequestResult } from '@grow-admin-rock/types';
import { Bean } from '@grow-admin-rock/ioc';
import { InfrastructureOptions } from '#/../bridge';

/**
 * 标准请求响应类型
 */
export type GrowResponse = AxiosResponse<RequestResult>;
/**
 * 任意类型请求响应类型
 */
export type GrowResponseAny = AxiosResponse<any>;
/**
 * 请求配置
 */
export type GrowRequestConfig = AxiosRequestConfig;

export interface CreateAxiosOptions extends AxiosRequestConfig {
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}

export class DefaultCreateAxiosOptions implements CreateAxiosOptions {
  options : InfrastructureOptions;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
  constructor(
    options: InfrastructureOptions
  ) {
    console.log('DefaultCreateAxiosOptions', options);
    this.options = options;
  }
}

@Bean()
export abstract class AxiosTransform {
  /**
   * 请求前置钩子
   * @param config 数据配置
   * @param options Axios配置
   * @returns {GrowRequestConfig}
   */
  beforeRequestHook?: (
    config: GrowRequestConfig,
    options: RequestOptions
  ) => GrowRequestConfig;

  /**
   * 请求成功后转换钩子
   * @param res 原始返回值
   * @param options 请求转换配置
   * @returns 拆箱后的数据
   */
  transformRequestHook?: (
    res: GrowResponse,
    options: RequestOptions
  ) => any;

  /**
   * @description: 请求失败处理
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (
    config: GrowRequestConfig,
    options: CreateAxiosOptions
  ) => GrowRequestConfig;

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: GrowResponseAny) => GrowResponseAny;

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void;

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error: Error) => void;
}
