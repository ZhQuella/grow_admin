import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import {
  resolveSearchBarFields,
  type ResolveSearchBarFieldsOptions,
  type SearchBarFieldLike,
} from './resolveSearchBarFields'

type MaybeRefOrGetter<T> = MaybeRef<T> | (() => T)

const read = <T,>(source: MaybeRefOrGetter<T> | undefined, fallback: T): T => {
  if (source === undefined) return fallback
  if (typeof source === 'function') return (source as () => T)()
  return unref(source as MaybeRef<T>)
}

export type UseResolveSearchBarFieldsOptions = ResolveSearchBarFieldsOptions & {
  state?: MaybeRefOrGetter<Record<string, unknown>>
  refs?: MaybeRefOrGetter<Record<string, unknown>>
  fieldBindModes?: MaybeRefOrGetter<
    Record<string, Record<string, string>> | undefined
  >
}

/**
 * 高级搜索字段解析 hook：在 Renderer / 设计态把 search[] 解成组件可直接消费的配置。
 * 解析逻辑不放在 rock-components/searchBar。
 */
export function useResolveSearchBarFields(
  fields: MaybeRefOrGetter<SearchBarFieldLike[] | undefined | null>,
  options: UseResolveSearchBarFieldsOptions = {},
): ComputedRef<SearchBarFieldLike[]> {
  return computed(() => {
    const list = read(fields, null)
    const state = read(options.state, {})
    const refs = read(options.refs, {})
    const fieldBindModes = read(options.fieldBindModes, undefined)
    return resolveSearchBarFields(list, state, {
      refs,
      fieldBindModes,
    })
  })
}
