<script lang="ts">
import { computed, defineComponent, h, type PropType, type VNodeChild } from 'vue'

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Ant Design Vue 侧对齐 Naive NHighlight */
export default defineComponent({
  name: 'Highlight',
  inheritAttrs: false,
  props: {
    text: { type: String, default: '' },
    patterns: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    caseSensitive: Boolean,
    autoEscape: { type: Boolean, default: true },
    highlightTag: { type: String, default: 'mark' },
    highlightClass: String,
    highlightStyle: [String, Object] as PropType<string | Record<string, string>>,
  },
  setup(props, { attrs }) {
    const children = computed((): VNodeChild[] => {
      const text = props.text || ''
      const patterns = (props.patterns || []).filter(
        (item) => typeof item === 'string' && item.length > 0,
      )
      if (!text || !patterns.length) return [text]

      const pattern = patterns
        .map((word) => (props.autoEscape ? escapeRegExp(word) : word))
        .join('|')
      if (!pattern) return [text]

      const regex = new RegExp(`(${pattern})`, props.caseSensitive ? 'g' : 'gi')
      return text.split(regex).flatMap((part, index) => {
        if (!part) return []
        const matched = patterns.some((word) =>
          props.caseSensitive
            ? word === part
            : word.toLowerCase() === part.toLowerCase(),
        )
        if (!matched) return [part]
        return [
          h(
            props.highlightTag || 'mark',
            {
              key: index,
              class: props.highlightClass,
              style: props.highlightStyle,
            },
            part,
          ),
        ]
      })
    })

    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['grow-highlight', attrs.class],
        },
        children.value,
      )
  },
})
</script>
