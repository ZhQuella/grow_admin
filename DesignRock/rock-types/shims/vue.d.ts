declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const Component: DefineComponent<{}, {}, any>
  export default Component
}