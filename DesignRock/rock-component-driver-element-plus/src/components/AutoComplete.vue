<script lang="ts">
import { computed, defineComponent, h, type PropType } from 'vue'
import { ElAutocomplete } from 'element-plus'

type OptionItem =
  | string
  | {
      label?: string
      value?: string
      disabled?: boolean
      type?: string
      children?: unknown[]
    }

type SuggestionItem = {
  value: string
  label: string
  disabled?: boolean
}

type FetchSuggestions = (
  queryString: string,
  cb: (items: SuggestionItem[]) => void,
) => void | SuggestionItem[] | Promise<void | SuggestionItem[]>

/** Naive 专属属性，不透传给 ElAutocomplete */
const NAIVE_ONLY_ATTR_KEYS = new Set([
  'bordered',
  'blur-after-select',
  'blurAfterSelect',
  'clear-after-select',
  'clearAfterSelect',
  'append',
  'show-empty',
  'showEmpty',
  'get-show',
  'getShow',
  'render-label',
  'renderLabel',
  'render-option',
  'renderOption',
  'status',
  'z-index',
  'zIndex',
  'options',
  'value',
  'modelValue',
  'model-value',
  'fetch-suggestions',
  'fetchSuggestions',
])

const EP_PLACEMENTS = new Set([
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
])

const normalizeOptions = (raw: unknown): SuggestionItem[] => {
  if (!Array.isArray(raw)) return []
  const result: SuggestionItem[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      result.push({ value: item, label: item })
      continue
    }
    if (!item || typeof item !== 'object') continue
    const option = item as Exclude<OptionItem, string>
    if (option.type === 'group' && Array.isArray(option.children)) {
      result.push(...normalizeOptions(option.children))
      continue
    }
    const value = String(option.value ?? option.label ?? '')
    if (!value) continue
    result.push({
      value,
      label: String(option.label ?? value),
      disabled: Boolean(option.disabled),
    })
  }
  return result
}

/**
 * Element Plus ElAutocomplete 驱动。
 * - 优先使用 fetch-suggestions（函数或数组）
 * - 未配置时用 options 做本地过滤（设计器便捷候选）
 */
export default defineComponent({
  name: 'AutoComplete',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number] as PropType<string | number | null>, default: null },
    modelValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: null,
    },
    options: {
      type: Array as PropType<OptionItem[]>,
      default: () => [],
    },
    placeholder: { type: String, default: '请输入' },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: {
      type: String as PropType<'small' | 'medium' | 'large' | 'default' | ''>,
      default: 'default',
    },
    triggerOnFocus: { type: Boolean, default: true },
    placement: { type: String, default: 'bottom-start' },
    valueKey: { type: String, default: 'value' },
    debounce: { type: Number, default: 300 },
    fetchSuggestions: {
      type: [Function, Array] as PropType<FetchSuggestions | SuggestionItem[]>,
      default: undefined,
    },
  },
  emits: [
    'update:value',
    'update:modelValue',
    'change',
    'input',
    'select',
    'blur',
    'focus',
    'clear',
  ],
  setup(props, { attrs, emit, slots }) {
    const mergedValue = computed(() => {
      if (props.value != null && props.value !== '') return String(props.value)
      if (props.modelValue != null && props.modelValue !== '') {
        return String(props.modelValue)
      }
      return ''
    })

    const epSize = computed(() => {
      if (props.size === 'medium' || props.size === '') return 'default'
      if (props.size === 'large' || props.size === 'small') return props.size
      return 'default'
    })

    const epPlacement = computed(() => {
      const raw = String(props.placement || 'bottom-start')
      return EP_PLACEMENTS.has(raw) ? raw : 'bottom-start'
    })

    const suggestionSource = computed(() => normalizeOptions(props.options))

    const passthroughAttrs = computed(() => {
      const next: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(attrs)) {
        if (NAIVE_ONLY_ATTR_KEYS.has(key)) continue
        next[key] = val
      }
      return next
    })

    const resolveCustomFetch = (): FetchSuggestions | SuggestionItem[] | undefined => {
      if (props.fetchSuggestions != null) return props.fetchSuggestions
      const fromAttrs = attrs.fetchSuggestions ?? attrs['fetch-suggestions']
      if (typeof fromAttrs === 'function' || Array.isArray(fromAttrs)) {
        return fromAttrs as FetchSuggestions | SuggestionItem[]
      }
      return undefined
    }

    const builtInFetch: FetchSuggestions = (queryString, cb) => {
      try {
        const q = String(queryString ?? '')
          .trim()
          .toLowerCase()
        const list = suggestionSource.value.filter((item) => !item.disabled)
        if (!q) {
          cb(list)
          return
        }
        cb(
          list.filter(
            (item) =>
              item.value.toLowerCase().includes(q) ||
              item.label.toLowerCase().includes(q),
          ),
        )
      } catch {
        cb([])
      }
    }

    const fetchSuggestions: FetchSuggestions = (queryString, cb) => {
      const custom = resolveCustomFetch()
      if (Array.isArray(custom)) {
        cb(normalizeOptions(custom))
        return
      }
      if (typeof custom === 'function') {
        return custom(queryString, cb)
      }
      return builtInFetch(queryString, cb)
    }

    const onUpdate = (next: string | number) => {
      emit('update:value', next)
      emit('update:modelValue', next)
      emit('change', next)
      emit('input', next)
    }

    const onSelect = (item: Record<string, any>) => {
      emit('select', item)
    }

    return () => {
      const extra = passthroughAttrs.value
      const { class: extraClass, style: extraStyle, ...restAttrs } = extra
      return h(
        'div',
        {
          class: ['grow-ep-auto-complete', extraClass],
          style: [
            { width: '100%', display: 'block', boxSizing: 'border-box' },
            extraStyle as any,
          ],
        },
        [
          h(
            ElAutocomplete,
            {
              ...restAttrs,
              class: 'grow-ep-auto-complete__inner',
              style: { width: '100%' },
              modelValue: mergedValue.value,
              placeholder: props.placeholder,
              clearable: props.clearable,
              disabled: props.disabled,
              size: epSize.value,
              triggerOnFocus: props.triggerOnFocus,
              placement: epPlacement.value,
              valueKey: props.valueKey || 'value',
              debounce: props.debounce,
              fetchSuggestions,
              'onUpdate:modelValue': onUpdate,
              onSelect,
              onBlur: (e: FocusEvent) => emit('blur', e),
              onFocus: (e: FocusEvent) => emit('focus', e),
              onClear: () => emit('clear'),
            },
            {
              default: (slotProps: { item?: SuggestionItem }) => {
                const item = slotProps?.item
                return h('span', null, item?.label || item?.value || '')
              },
              ...(slots.prefix ? { prefix: () => slots.prefix?.() } : {}),
              ...(slots.suffix ? { suffix: () => slots.suffix?.() } : {}),
            },
          ),
        ],
      )
    }
  },
})
</script>

<style scoped>
.grow-ep-auto-complete {
  width: 100%;
  display: block;
  box-sizing: border-box;
}

.grow-ep-auto-complete :deep(.el-tooltip__trigger),
.grow-ep-auto-complete :deep(.el-only-child),
.grow-ep-auto-complete :deep(.el-autocomplete),
.grow-ep-auto-complete :deep(.el-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
