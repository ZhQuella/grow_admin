import { isNullOrUnDef } from './is';

/** 将未知类型的值转换为布尔值 */
export function toBool(val: unknown): boolean {
  return isNullOrUnDef(val) ? false : val === true || val === 'true';
}
