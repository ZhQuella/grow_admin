import { computed, ref, unref, type MaybeRef } from 'vue'
import { useEventListener } from '../event/use-event-listener'

type FullscreenElement = Element & {
  requestFullscreen?: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

type FullscreenDocument = Document & {
  fullscreenElement?: Element | null
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
  exitFullscreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

function getFullscreenElement() {
  const doc = document as FullscreenDocument
  return (
    doc.fullscreenElement
    ?? doc.webkitFullscreenElement
    ?? doc.mozFullScreenElement
    ?? doc.msFullscreenElement
    ?? null
  )
}

function resolveTarget(target?: MaybeRef<Element | null | undefined>) {
  return unref(target) ?? document.documentElement
}

function isElementFullscreenSupported(element: Element) {
  const el = element as FullscreenElement
  return Boolean(
    el.requestFullscreen
    || el.webkitRequestFullscreen
    || el.mozRequestFullScreen
    || el.msRequestFullscreen,
  )
}

async function requestElementFullscreen(element: Element) {
  const el = element as FullscreenElement
  if (el.requestFullscreen) {
    await el.requestFullscreen()
    return
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen()
    return
  }
  if (el.mozRequestFullScreen) {
    await el.mozRequestFullScreen()
    return
  }
  if (el.msRequestFullscreen) {
    await el.msRequestFullscreen()
  }
}

async function exitDocumentFullscreen() {
  const doc = document as FullscreenDocument
  if (doc.exitFullscreen) {
    await doc.exitFullscreen()
    return
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen()
    return
  }
  if (doc.mozCancelFullScreen) {
    await doc.mozCancelFullScreen()
    return
  }
  if (doc.msExitFullscreen) {
    await doc.msExitFullscreen()
  }
}

export function useFullscreen(target?: MaybeRef<Element | null | undefined>) {
  const isFullscreen = ref(Boolean(getFullscreenElement()))

  const syncFullscreenState = () => {
    isFullscreen.value = Boolean(getFullscreenElement())
  }

  const isSupported = computed(() => {
    if (typeof document === 'undefined') {
      return false
    }
    return isElementFullscreenSupported(resolveTarget(target))
  })

  useEventListener({
    el: document,
    name: 'fullscreenchange',
    listener: syncFullscreenState,
    isDebounce: false,
    wait: 0,
  })

  useEventListener({
    el: document,
    name: 'webkitfullscreenchange',
    listener: syncFullscreenState,
    isDebounce: false,
    wait: 0,
  })

  async function enter(element?: Element) {
    if (!isSupported.value) {
      return
    }
    await requestElementFullscreen(element ?? resolveTarget(target))
    syncFullscreenState()
  }

  async function exit() {
    if (!getFullscreenElement()) {
      return
    }
    await exitDocumentFullscreen()
    syncFullscreenState()
  }

  async function toggle() {
    if (isFullscreen.value) {
      await exit()
      return
    }
    await enter()
  }

  return {
    isFullscreen,
    isSupported,
    enter,
    exit,
    toggle,
  }
}
