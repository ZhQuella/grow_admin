import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig, useLockStore } from '@grow-admin-rock/state'
import { domEventManager } from '@grow-admin-rock/utils'

const ACTIVITY_EVENTS = [
  'click',
  'keyup',
  'keydown',
  'mousemove',
  'mousedown',
  'mouseup',
  'wheel',
] as const

/** 锁屏前预警时长（毫秒） */
const LOCK_WARNING_TIME_MS = 60 * 1000

function getActivityTarget() {
  return document.documentElement || document.body
}

export function useAutoLocker() {
  const { t } = useI18n()
  const message = useMsg()
  const appConfig = useAppConfig()
  const lockStore = useLockStore()
  const { useLockPage, lockTime } = storeToRefs(appConfig)
  const { isLock } = storeToRefs(lockStore)

  const lastEventTime = ref(Date.now())
  const warningShown = ref(false)
  let idleAnimationFrame = 0

  function isEnabled() {
    return useLockPage.value && lockTime.value > 0
  }

  function getLockScreenTimeMs() {
    return lockTime.value * 60 * 1000
  }

  function showWarning() {
    const seconds = LOCK_WARNING_TIME_MS / 1000
    message.warning?.(t('layout.lock.idleWarning', { time: seconds }))
    warningShown.value = true
  }

  function stopIdleWatch() {
    domEventManager.removeAll(getActivityTarget())
    cancelAnimationFrame(idleAnimationFrame)
    idleAnimationFrame = 0
  }

  function checkIdleTime() {
    if (!isEnabled() || isLock.value) {
      return
    }

    const elapsed = Date.now() - lastEventTime.value
    const lockScreenTimeMs = getLockScreenTimeMs()

    if (elapsed >= lockScreenTimeMs) {
      lockStore.lock()
      stopIdleWatch()
      return
    }

    if (elapsed >= lockScreenTimeMs - LOCK_WARNING_TIME_MS && !warningShown.value) {
      showWarning()
    }

    idleAnimationFrame = requestAnimationFrame(checkIdleTime)
  }

  function handleActivity() {
    lastEventTime.value = Date.now()
    warningShown.value = false
    cancelAnimationFrame(idleAnimationFrame)
    idleAnimationFrame = requestAnimationFrame(checkIdleTime)
  }

  function startAutoLocker() {
    if (!isEnabled() || isLock.value) {
      return
    }

    const target = getActivityTarget()
    domEventManager.add(target, [...ACTIVITY_EVENTS], handleActivity, { passive: true })
    lastEventTime.value = Date.now()
    warningShown.value = false
    handleActivity()
  }

  watch(isLock, (locked) => {
    if (locked) {
      stopIdleWatch()
      return
    }
    startAutoLocker()
  })

  watch([useLockPage, lockTime], () => {
    stopIdleWatch()
    startAutoLocker()
  })

  onMounted(() => {
    startAutoLocker()
  })

  onUnmounted(() => {
    stopIdleWatch()
  })
}
