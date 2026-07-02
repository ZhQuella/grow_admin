import type { AnyFunction } from '@grow-admin-rock/types'
import ResizeObserver from 'resize-observer-polyfill'

const resizeHandler = function (entries: ResizeObserverEntry[]) {
  for (const entry of entries) {
    const listeners = (entry.target as any).__resizeListeners__ || []
    if (listeners.length) {
      listeners.forEach((fn: AnyFunction) => {
        fn()
      })
    }
  }
}

export function addEventResize(node: HTMLElement, fun: AnyFunction) {
  if (!(node as any).__resizeListeners__) {
    (node as any).__resizeListeners__ = []
  }
  (node as any).__ro__ = new ResizeObserver(resizeHandler)
  ;(node as any).__ro__.observe(node)
  ;(node as any).__resizeListeners__.push(fun)
}

export function removeResizeListener(node: HTMLElement | null, fun: AnyFunction) {
  if (!node || !(node as any).__resizeListeners__) return
  ;(node as any).__resizeListeners__.splice((node as any).__resizeListeners__.indexOf(fun), 1)
  if (!(node as any).__resizeListeners__.length) {
    ;(node as any).__ro__.disconnect()
  }
}
