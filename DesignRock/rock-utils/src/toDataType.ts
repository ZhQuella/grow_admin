import { isNullOrUnDef } from './is';

export function toBool(val: unknown): boolean {
  return isNullOrUnDef(val) ? false : val === true || val === 'true';
}
