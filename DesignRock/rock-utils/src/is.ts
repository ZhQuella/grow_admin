function isNull(val: unknown): val is null {
  return val === null;
}

function isCustomDef<T = unknown>(val?: T): val is T {
  return typeof val !== 'undefined';
}

function isUnDef<T = unknown>(val?: T): val is T {
  return !isCustomDef(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}
