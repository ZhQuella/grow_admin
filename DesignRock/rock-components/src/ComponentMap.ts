import { Bean } from '@grow-admin-rock/ioc';
import { RockComponent } from './RockComponent';

@Bean()
export default class ComponentMap {
  private map: Map<RockComponent, WmqComponent<any>>;

  constructor() {
    this.map = new Map<RockComponent, WmqComponent<any>>();
  }

  register(key: string | RockComponent, value: WmqComponent<any>) {
    this.map.set(key as RockComponent, value);
  }

  unregister(key: RockComponent) {
    this.map.delete(key);
  }

  get(key: string | RockComponent): WmqComponent<any> | undefined {
    return this.map.get(key as RockComponent);
  }

  has(key: string | RockComponent) {
    return this.map.has(key as RockComponent);
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }

  get keys(): IterableIterator<RockComponent> {
    return this.map.keys();
  }

  get values(): IterableIterator<WmqComponent<any>> {
    return this.map.values();
  }

  get entries(): IterableIterator<[string | RockComponent, WmqComponent<any>]> {
    return this.map.entries();
  }
}
