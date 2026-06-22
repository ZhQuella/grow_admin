import type { AuthenticationSchemes, AuthenticationToken, ErrorMessageMode, RequestOptions } from '@grow-admin-rock/types';
import { ContentTypeEnum } from '#/constants';
import { CreateAxiosOptions } from 'index';
import types from './beankeys';
import { diKT } from '@grow-admin-rock/ioc';
import { forIn } from 'lodash-es';


type promoteFunc = (msg: string, payload?: any, mode?: ErrorMessageMode) => void;

/**
 * 基础设施观察者
 */
export interface InfrastructurePromoter {
  // 不同级别的提醒
  create?: promoteFunc;
  info?: promoteFunc;
  warning?: promoteFunc;
  error?: promoteFunc;
  /**
   * 简单的提示
   */
  notify?: promoteFunc;
  /**
   * Message形式的提醒
   */
  message?: promoteFunc;
  /**
   * 模态窗口的提醒
   */
  modal?: promoteFunc;
}

/**
 * 基础设施参数
 */
export interface InfrastructureOptions {
  apiUrl?: string;
  tokenProvider?: () => AuthenticationToken | undefined;
  /**
   * 基础设施401未授权处理
   * @returns 
   * @see Symbol.for(401)
   */
  onUnauthorized?: () => void;
  onAll?: (event: string | Symbol, payload?: any) => void;
  promoter?: InfrastructurePromoter
}

/**
 * 设置基础设施的监听器
 * 
 * @param func 提醒 function 对接组件实现
 */
export const setPromoter = (promoter?: InfrastructurePromoter) => {
  const infrastructureOptions = diKT(types.InfrastructureOptions)
  if (promoter) {
    const _promoter = infrastructureOptions.promoter || {}
    forIn(promoter, (v, k) => {
      _promoter[k] = v
    })
    infrastructureOptions.promoter = _promoter;
  } else {
    infrastructureOptions.promoter = promoter;
  }
};

export const defaultRequestOptions: RequestOptions = {
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
  // authentication schemes，e.g: Bearer
  authenticationScheme: 'Bearer',
  // 是否返回原生响应头 比如：需要获取响应头时使用该属性
  isReturnNativeResponse: false,
  // 需要对返回数据进行处理
  isTransformResponse: true,
  // post请求的时候添加参数到url
  joinParamsToUrl: false,
  // 格式化提交参数时间
  formatDate: true,
  // 消息提示类型
  errorMessageMode: 'message',
  // 接口地址
  apiUrl: '',
  //  是否加入时间戳
  joinTime: true,
  // 忽略重复请求
  ignoreCancelToken: true,
  // 是否携带token
  withToken: true,
};

export const defaultCreateAxiosOptions = {
  timeout: 10 * 1000,
  headers: { 'Content-Type': ContentTypeEnum.JSON },
  // 如果是form-data格式
  // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
  // 配置项，下面的选项都可以在独立的接口请求中覆盖
  requestOptions: defaultRequestOptions,
} as CreateAxiosOptions;
