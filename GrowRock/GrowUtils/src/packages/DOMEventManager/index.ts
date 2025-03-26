import { DOMListenerOptions, EventHandler, EventType } from "types/DOMEventManager";

export default class DOMEventManager {
    private static instance: DOMEventManager;
    private listeners: Map<EventTarget, Map<string, Set<EventHandler>>>;
    private defaultOptions: DOMListenerOptions;

    private constructor(defaultOptions: DOMListenerOptions = {}) {
        this.listeners = new Map();
        this.defaultOptions = {
            passive: false,
            capture: false,
            once: false,
            ...defaultOptions
        };
    }

    public static getInstance(options?: DOMListenerOptions): DOMEventManager {
        if (!DOMEventManager.instance) {
            DOMEventManager.instance = new DOMEventManager(options);
        }
        return DOMEventManager.instance;
    }

    /**
     * 添加事件监听
     * @param target 目标元素
     * @param eventType 事件类型（字符串或数组）
     * @param handler 处理函数
     * @param options 监听选项
     */
    add(
        target: EventTarget,
        eventType: EventType,
        handler: EventHandler,
        options?: Partial<DOMListenerOptions>
    ): void {
        const eventTypes = Array.isArray(eventType) ? eventType : [eventType];
        eventTypes.forEach(type => {
            this.addSingleEventListener(target, type, handler, options);
        });
    }

    private addSingleEventListener(
        target: EventTarget,
        eventType: string,
        handler: EventHandler,
        options?: Partial<DOMListenerOptions>
    ): void {
        const finalOptions = { ...this.defaultOptions, ...options };

        if (!this.listeners.has(target)) {
            this.listeners.set(target, new Map());
        }
        const targetListeners = this.listeners.get(target)!;

        if (!targetListeners.has(eventType)) {
            targetListeners.set(eventType, new Set());
        }
        const eventHandlers = targetListeners.get(eventType)!;

        if (finalOptions.once && eventHandlers.size > 0) {
            return;
        }

        const wrappedHandler = (event: Event) => {
            handler(event);
            if (finalOptions.once) {
                this.remove(target, eventType, wrappedHandler);
            }
        };

        target.addEventListener(eventType, wrappedHandler, {
            passive: finalOptions.passive,
            capture: finalOptions.capture
        });

        eventHandlers.add(wrappedHandler);
    }

    /**
     * 移除事件监听
     * @param target 目标元素
     * @param eventType 事件类型（字符串或数组）
     * @param handler 可选，指定要移除的处理函数
     */
    remove(
        target: EventTarget,
        eventType: EventType,
        handler?: EventHandler
    ): void {
        const eventTypes = Array.isArray(eventType) ? eventType : [eventType];
        eventTypes.forEach(type => {
            this.removeSingleEventListener(target, type, handler);
        });
    }

    private removeSingleEventListener(
        target: EventTarget,
        eventType: string,
        handler?: EventHandler
    ): void {
        const targetListeners = this.listeners.get(target);
        if (!targetListeners) return;

        const eventHandlers = targetListeners.get(eventType);
        if (!eventHandlers) return;

        if (handler) {
            // 查找并移除指定的处理函数
            eventHandlers.forEach(h => {
                if (h === handler) {
                    target.removeEventListener(eventType, h, {
                        capture: this.defaultOptions.capture
                    });
                    eventHandlers.delete(h);
                }
            });
        } else {
            // 移除该类型的所有处理函数
            eventHandlers.forEach(h => {
                target.removeEventListener(eventType, h, {
                    capture: this.defaultOptions.capture
                });
            });
            targetListeners.delete(eventType);
        }

        if (targetListeners.size === 0) {
            this.listeners.delete(target);
        }
    }

    /**
     * 移除目标元素的所有监听
     * @param target 目标元素
     */
    removeAll(target: EventTarget): void {
        const targetListeners = this.listeners.get(target);
        if (!targetListeners) return;

        targetListeners.forEach((handlers, eventType) => {
            handlers.forEach(handler => {
                target.removeEventListener(eventType, handler, {
                    capture: this.defaultOptions.capture
                });
            });
        });

        this.listeners.delete(target);
    }

    /**
     * 检查目标元素是否有特定事件监听
     * @param target 目标元素
     * @param eventType 事件类型（字符串或数组）
     */
    hasEvent(target: EventTarget, eventType: EventType): boolean {
        const eventTypes = Array.isArray(eventType) ? eventType : [eventType];
        return eventTypes.some(type =>
            this.listeners.get(target)?.has(type) ?? false
        );
    }

    /**
     * 获取目标元素的所有监听事件类型
     * @param target 目标元素
     */
    getEventTypes(target: EventTarget): string[] {
        const targetListeners = this.listeners.get(target);
        return targetListeners ? Array.from(targetListeners.keys()) : [];
    }

    /**
     * 销毁管理器，清理所有监听
     */
    destroy(): void {
        this.listeners.forEach((_, target) => {
            this.removeAll(target);
        });
    }

    /**
     * 批量添加事件监听
     * @param target 目标元素
     * @param events 事件类型和处理函数的键值对
     * @param options 监听选项
     */
    addMultiple(
        target: EventTarget,
        events: Record<string, EventHandler>,
        options?: Partial<DOMListenerOptions>
    ): void {
        Object.entries(events).forEach(([eventType, handler]) => {
            this.add(target, eventType, handler, options);
        });
    }
}
