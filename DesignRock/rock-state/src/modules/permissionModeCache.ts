import { PermissionModeEnum } from '@grow-admin-rock/constants'
import { createStorageName } from '@grow-admin-rock/utils'
import { useAuthStore } from './authStore'
import { useTabStore } from './tabStore'

function permissionModeStorageKey() {
  return `${createStorageName(import.meta.env)}__LAST_PERMISSION_MODE`
}

function tabPersistStorageKey() {
  return `${createStorageName(import.meta.env)}__TAB`
}

function isPermissionMode(value: string | null): value is PermissionModeEnum {
  return (
    value === PermissionModeEnum.BACK
    || value === PermissionModeEnum.FRONT
    || value === PermissionModeEnum.MIXTURE
  )
}

/** 读取上次成功应用的权限模式 */
export function getCachedPermissionMode(): PermissionModeEnum | null {
  const value = localStorage.getItem(permissionModeStorageKey())
  return isPermissionMode(value) ? value : null
}

/** 写入当前生效的权限模式 */
export function setCachedPermissionMode(mode: PermissionModeEnum) {
  localStorage.setItem(permissionModeStorageKey(), mode)
}

/** 配置文件模式与本地缓存是否不一致 */
export function isPermissionModeCacheStale(configuredMode: PermissionModeEnum): boolean {
  const cached = getCachedPermissionMode()
  return cached !== null && cached !== configuredMode
}

/**
 * 清空权限模式变更后失效的菜单 / 标签缓存。
 * 动态路由清理由调用方（路由层）负责。
 */
export function clearPermissionRelatedCaches() {
  try {
    sessionStorage.removeItem(tabPersistStorageKey())
  }
  catch {
    // ignore storage access errors
  }

  useAuthStore().resetState()
  useTabStore().resetState()
}

/**
 * 比对配置文件权限模式与本地缓存：不一致则清缓存，并更新本地缓存为当前配置。
 * @returns 是否发生了模式变更并已清缓存
 */
export function reconcilePermissionModeWithCache(configuredMode: PermissionModeEnum): boolean {
  const stale = isPermissionModeCacheStale(configuredMode)
  if (stale) {
    clearPermissionRelatedCaches()
  }
  setCachedPermissionMode(configuredMode)
  return stale
}
