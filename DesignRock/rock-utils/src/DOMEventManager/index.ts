import DOMEventManager from './DOMEventManager'

export type { DOMListenerOptions, EventHandler, EventType } from './types'
export { default as DOMEventManager } from './DOMEventManager'

export const domEventManager = DOMEventManager.getInstance({ passive: true })
