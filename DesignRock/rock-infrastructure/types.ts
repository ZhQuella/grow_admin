import { HttpStatusCode } from "@grow-admin-rock/types";
export namespace Protocols {
  /**
   * 返回数据对象
   */
  export interface ResponseData<T> {
    /** 返回码 */
    code: string | HttpStatusCode;
    /** 返回提示信息 */
    message: string | undefined;
    /** 错误明细 */
    details: string | undefined;
    /** 验证错误明细 */
    vavalidationErrors: any | undefined;
    /** 返回数据对象 */
    data: T | undefined;

    isOk(): boolean;
  }
}
