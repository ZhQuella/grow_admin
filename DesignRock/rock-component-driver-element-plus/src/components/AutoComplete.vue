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
  'status',
  'z-index',
  'zIndex',
  'options',
  'value',
  'modelValue',
  'model-value',
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
 * Element Plus 侧对齐 Naive NAutoComplete：
 * options / value → ElAutocomplete fetch-suggestions / modelValue
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
    loading: { type: Boolean, default: false },
    size: {
      type: String as PropType<'small' | 'medium' | 'large' | 'default'>,
      default: 'default',
    },
    triggerOnFocus: { type: Boolean, default: true },
    placement: { type: String, default: 'bottom-start' },
  },
  emits: [
    'update:value',
    'update:modelValue',
    'change',
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
      if (props.size === 'medium') return 'default'
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

    const fetchSuggestions = (
      queryString: string,
      cb: (items: SuggestionItem[]) => void,
    ) => {
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

    const onUpdate = (next: string) => {
      emit('update:value', next)
      emit('update:modelValue', next)
      emit('change', next)
    }

    const onSelect = (item: Record<string, any>) => {
      emit('select', String(item?.value ?? ''))
    }

    return () => {
      const extra = passthroughAttrs.value
      const { class: extraClass, style: extraStyle, ...restAttrs } = extra
      // 外层占整行（对齐 GrowInput）；勿把 display:block 透传到内部 ElInput
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
              loading: props.loading,
              size: epSize.value,
              triggerOnFocus: props.triggerOnFocus,
              placement: epPlacement.value,
              fetchSuggestions,
              valueKey: 'value',
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

