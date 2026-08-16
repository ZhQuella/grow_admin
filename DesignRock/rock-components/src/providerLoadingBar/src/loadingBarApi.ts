import { inject, type InjectionKey } from 'vue'

export interface LoadingBarApi {
  start: () => void
  finish: () => void
  error: () => void
}

export const LOADING_BAR_INJECTION_KEY: InjectionKey<LoadingBarApi> = Symbol('GrowLoadingBar')

export const noopLoadingBar: LoadingBarApi = {
  start() {},
  finish() {},
  error() {},
}

export function useFallbackLoadingBar(): LoadingBarApi {
  return inject(LOADING_BAR_INJECTION_KEY, noopLoadingBar)
}
