/** 判断值是否为 null */
function isNull(val: unknown): val is null {
  return val === null;
}

/** 判断值是否已定义（非 undefined） */
function isCustomDef<T = unknown>(val?: T): val is T {
  return typeof val !== 'undefined';
}

/** 判断值是否为 undefined */
function isUnDef<T = unknown>(val?: T): val is T {
  return !isCustomDef(val);
}

/** 判断值是否为 null 或 undefined */
export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}
