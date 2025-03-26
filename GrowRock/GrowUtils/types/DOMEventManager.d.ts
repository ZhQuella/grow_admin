export type EventHandler = (event: Event) => void;

export interface DOMListenerOptions {
    passive?: boolean;
    capture?: boolean;
    once?: boolean;
}

export type EventType = string | string[];