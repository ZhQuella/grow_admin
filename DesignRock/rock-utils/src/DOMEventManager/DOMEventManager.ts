import type { DOMListenerOptions, EventHandler, EventType } from './types'

export default class DOMEventManager {
  private static instance: DOMEventManager
  private listeners: Map<EventTarget, Map<string, Set<EventHandler>>>
  private defaultOptions: DOMListenerOptions

  private constructor(defaultOptions: DOMListenerOptions = {}) {
    this.listeners = new Map()
    this.defaultOptions = {
      passive: false,
      capture: false,
      once: false,
      ...defaultOptions,
    }
  }

  static getInstance(options?: DOMListenerOptions): DOMEventManager {
    if (!DOMEventManager.instance) {
      DOMEventManager.instance = new DOMEventManager(options)
    }
    return DOMEventManager.instance
  }

  add(
    target: EventTarget,
    eventType: EventType,
    handler: EventHandler,
    options?: Partial<DOMListenerOptions>,
  ): void {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType]
    eventTypes.forEach((type) => {
      this.addSingleEventListener(target, type, handler, options)
    })
  }

  private addSingleEventListener(
    target: EventTarget,
    eventType: string,
    handler: EventHandler,
    options?: Partial<DOMListenerOptions>,
  ): void {
    const finalOptions = { ...this.defaultOptions, ...options }

    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map())
    }
    const targetListeners = this.listeners.get(target)!

    if (!targetListeners.has(eventType)) {
      targetListeners.set(eventType, new Set())
    }
    const eventHandlers = targetListeners.get(eventType)!

    if (finalOptions.once && eventHandlers.size > 0) {
      return
    }

    const wrappedHandler = (event: Event) => {
      handler(event)
      if (finalOptions.once) {
        this.remove(target, eventType, wrappedHandler)
      }
    }

    target.addEventListener(eventType, wrappedHandler, {
      passive: finalOptions.passive,
      capture: finalOptions.capture,
    })

    eventHandlers.add(wrappedHandler)
  }

  remove(
    target: EventTarget,
    eventType: EventType,
    handler?: EventHandler,
  ): void {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType]
    eventTypes.forEach((type) => {
      this.removeSingleEventListener(target, type, handler)
    })
  }

  private removeSingleEventListener(
    target: EventTarget,
    eventType: string,
    handler?: EventHandler,
  ): void {
    const targetListeners = this.listeners.get(target)
    if (!targetListeners) return

    const eventHandlers = targetListeners.get(eventType)
    if (!eventHandlers) return

    if (handler) {
      eventHandlers.forEach((h) => {
        if (h === handler) {
          target.removeEventListener(eventType, h, {
            capture: this.defaultOptions.capture,
          })
          eventHandlers.delete(h)
        }
      })
    } else {
      eventHandlers.forEach((h) => {
        target.removeEventListener(eventType, h, {
          capture: this.defaultOptions.capture,
        })
      })
      targetListeners.delete(eventType)
    }

    if (targetListeners.size === 0) {
      this.listeners.delete(target)
    }
  }

  removeAll(target: EventTarget): void {
    const targetListeners = this.listeners.get(target)
    if (!targetListeners) return

    targetListeners.forEach((handlers, eventType) => {
      handlers.forEach((handler) => {
        target.removeEventListener(eventType, handler, {
          capture: this.defaultOptions.capture,
        })
      })
    })

    this.listeners.delete(target)
  }

  hasEvent(target: EventTarget, eventType: EventType): boolean {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType]
    return eventTypes.some((type) =>
      this.listeners.get(target)?.has(type) ?? false,
    )
  }

  getEventTypes(target: EventTarget): string[] {
    const targetListeners = this.listeners.get(target)
    return targetListeners ? Array.from(targetListeners.keys()) : []
  }

  destroy(): void {
    this.listeners.forEach((_, target) => {
      this.removeAll(target)
    })
  }

  addMultiple(
    target: EventTarget,
    events: Record<string, EventHandler>,
    options?: Partial<DOMListenerOptions>,
  ): void {
    Object.entries(events).forEach(([eventType, handler]) => {
      this.add(target, eventType, handler, options)
    })
  }
}
