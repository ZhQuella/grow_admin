interface AppLock {
  currentLock: () => AppLockInstance
  createLock: (lock: string) => AppLockInstance
}

interface AppLockInstance {
  currentLock: () => string
}