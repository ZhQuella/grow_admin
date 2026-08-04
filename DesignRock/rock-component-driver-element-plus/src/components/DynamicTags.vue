<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType,
} from 'vue'
import { ElButton, ElInput, ElTag } from 'element-plus'

type DynamicTagsOption = string | { label: string; value: string }

const toLabel = (item: DynamicTagsOption) =>
  typeof item === 'string' ? item : String(item?.label ?? item?.value ?? '')

const toValue = (item: DynamicTagsOption) =>
  typeof item === 'string' ? item : String(item?.value ?? item?.label ?? '')

/**
 * Element Plus 侧对齐 Naive NDynamicTags：
 * 标签列表 + 输入新增，支持 value / onUpdate:value。
 */
export default defineComponent({
  name: 'DynamicTags',
  inheritAttrs: false,
  props: {
    value: {
      type: Array as PropType<DynamicTagsOption[]>,
      default: undefined,
    },
    modelValue: {
      type: Array as PropType<DynamicTagsOption[]>,
      default: undefined,
    },
    defaultValue: {
      type: Array as PropType<DynamicTagsOption[]>,
      default: () => [],
    },
    closable: { type: Boolean, default: true },
    disabled: Boolean,
    round: Boolean,
    max: Number,
    size: {
      type: String as PropType<'small' | 'medium' | 'large' | 'default'>,
      default: 'default',
    },
    type: {
      type: String as PropType<
        'default' | 'primary' | 'success' | 'info' | 'warning' | 'error' | 'danger'
      >,
      default: 'primary',
    },
    onCreate: {
      type: Function as PropType<(label: string) => DynamicTagsOption>,
      default: (label: string) => label,
    },
  },
  emits: ['update:value', 'update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const inputVisible = ref(false)
    const inputValue = ref('')
    const inputRef = ref<{ focus?: () => void } | null>(null)
    const uncontrolled = ref<DynamicTagsOption[]>([...(props.defaultValue || [])])

    const mergedValue = computed(() => {
      if (Array.isArray(props.value)) return props.value
      if (Array.isArray(props.modelValue)) return props.modelValue
      return uncontrolled.value
    })

    const epSize = computed(() => {
      if (props.size === 'medium') return 'default'
      if (props.size === 'large' || props.size === 'small') return props.size
      return 'default'
    })

    const epTagType = computed(() => {
      if (props.type === 'error') return 'danger'
      if (props.type === 'default') return 'info'
      return props.type
    })

    const reachedMax = computed(() => {
      if (props.max == null || !Number.isFinite(props.max)) return false
      return mergedValue.value.length >= Number(props.max)
    })

    const emitValue = (next: DynamicTagsOption[]) => {
      uncontrolled.value = next
      emit('update:value', next)
      emit('update:modelValue', next)
      emit('change', next)
    }

    const removeAt = (index: number) => {
      if (props.disabled) return
      const next = mergedValue.value.slice()
      next.splice(index, 1)
      emitValue(next)
    }

    const showInput = async () => {
      if (props.disabled || reachedMax.value) return
      inputVisible.value = true
      await nextTick()
      inputRef.value?.focus?.()
    }

    const confirmInput = () => {
      const label = inputValue.value.trim()
      inputVisible.value = false
      inputValue.value = ''
      if (!label || props.disabled || reachedMax.value) return
      const created = props.onCreate ? props.onCreate(label) : label
      if (created == null || created === '') return
      emitValue([...mergedValue.value, created])
    }

    return () => {
      const tags = mergedValue.value.map((item, index) =>
        h(
          ElTag,
          {
            key: `${toValue(item)}-${index}`,
            closable: props.closable && !props.disabled,
            disableTransitions: false,
            size: epSize.value,
            type: epTagType.value as any,
            round: props.round,
            onClose: () => removeAt(index),
            style: { marginRight: '8px' },
          },
          () => toLabel(item),
        ),
      )

      const editor = inputVisible.value
        ? h(ElInput, {
            ref: inputRef,
            modelValue: inputValue.value,
            'onUpdate:modelValue': (v: string) => {
              inputValue.value = v
            },
            size: epSize.value,
            disabled: props.disabled,
            style: { width: '120px', verticalAlign: 'middle' },
            onKeyup: (e: KeyboardEvent) => {
              if (e.key === 'Enter') confirmInput()
            },
            onBlur: confirmInput,
          })
        : h(
            ElButton,
            {
              size: epSize.value,
              disabled: props.disabled || reachedMax.value,
              onClick: showInput,
            },
            () => '+ 新标签',
          )

      return h(
        'div',
        {
          ...attrs,
          class: ['grow-ep-dynamic-tags', attrs.class],
          style: [
            {
              display: 'inline-flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '4px',
            },
            attrs.style as any,
          ],
        },
        [...tags, editor],
      )
    }
  },
})
</script>
