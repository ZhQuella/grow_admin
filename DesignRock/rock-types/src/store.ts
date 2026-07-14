// Lock screen information

export interface LockInfo {
  // Password required
  pwd?: string | undefined
  // Is it locked?
  isLock?: boolean
}

export interface PersistStrategy {
  key?: string;
  storage?: Storage;
  paths?: string[];
}

export interface PersistOptions {
  storage?: Storage;
  paths?: string[];
  pick?: string[];
  strategies?: PersistStrategy[];
  afterRestore?: (ctx: PiniaPluginContext) => void;
}
