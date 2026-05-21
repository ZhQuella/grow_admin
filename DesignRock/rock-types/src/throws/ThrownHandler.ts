/**
 * 异常处理方式
 *
 * @description modal: 弹出模态框
 * @description notify: 弹出通知
 * @description message: 弹出消息
 * @description logger: 记录日志
 * @description thrown: 抛出异常
 */
export type HandleTypes = 'modal' | 'notify' | 'message' | 'logger' | 'thrown';
/**
 * 异常数据
 */
export interface FailData {
  message: string;
  code?: number;
  data?: any;
  err?: any;
}
/**
 * 异常处理器
 */
export interface ThrownHandler {
  /**
   * 
   * @param message 消息体
   * @param handleType 
   * @param err 
   * @param failData 
   */
  debug(message:string, handleType?:HandleTypes, err?: Error, failData?: FailData): Promise<any>;
  info(message:string, handleType?:HandleTypes, err?: Error, failData?: FailData): Promise<any>;
  warn(message:string, handleType?:HandleTypes, err?: Error, failData?: FailData): Promise<any>;
  error(message:string, handleType?:HandleTypes, err?: Error, failData?: FailData): Promise<any>;
}
