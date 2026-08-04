<script lang="ts" setup>
import { computed, useAttrs, useSlots, ref } from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'

type DropdownItemOption = {
  label?: string
  text?: string
  command?: string | number | boolean
  value?: string | number | boolean
  disabled?: boolean
  divided?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 菜单项；有值时自动渲染 #dropdown（可被插槽覆盖） */
    items?: DropdownItemOption[]
    /** 拆分按钮模式下的按钮文案 */
    content?: string
  }>(),
  {
    items: () => [],
    content: '',
  },
)

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.Dropdown,
  inheritAttrs: false,
})

const attrs = useAttrs()
const slots = useSlots()

const Dropdown = useDriverComponent(RockComponent.Dropdown)
const DropdownMenu = useDriverComponent(RockComponent.DropdownMenu)
const DropdownItem = useDriverComponent(RockComponent.DropdownItem)

const menuItems = computed(() =>
  Array.isArray(props.items) ? props.items.filter(Boolean) : [],
)

const isSplitButton = computed(() =>
  Boolean(attrs['split-button'] ?? attrs.splitButton),
)

/** Naive 无 Menu/Item：把 items 映射为 options */
const bindProps = computed(() => {
  const rest = { ...(attrs as Record<string, unknown>) }
  if (!DropdownMenu && menuItems.value.length) {
    rest.options = menuItems.value.map((item, index) => {
      if (item.divided) {
        return { type: 'divider', key: `divider-${index}` }
      }
      return {
        label: item.label ?? item.text ?? String(item.command ?? item.value ?? index),
        key: item.command ?? item.value ?? item.label ?? index,
        disabled: Boolean(item.disabled),
      }
    })
  }
  return rest
})

const showSlotMenu = computed(
  () => Boolean(DropdownMenu) && (Boolean(slots.dropdown) || menuItems.value.length > 0),
)
</script>

<template>
  <component :is="Dropdown" v-bind="bindProps" :ref="DriverRefKey">
    <!-- 拆分按钮：默认插槽为按钮文案；否则走触发元素插槽 -->
    <template v-if="isSplitButton">{{ content }}</template>
    <slot v-else />
    <template v-if="showSlotMenu" #dropdown>
      <slot name="dropdown">
        <component :is="DropdownMenu">
          <component
            :is="DropdownItem"
            v-for="(item, index) in menuItems"
            :key="index"
            :command="item.command ?? item.value ?? item.label"
            :disabled="item.disabled"
            :divided="item.divided"
          >
            {{ item.label ?? item.text ?? item.command ?? item.value }}
          </component>
        </component>
      </slot>
    </template>
    <template
      v-for="name in Object.keys(slots).filter((n) => n !== 'default' && n !== 'dropdown')"
      #[name]="data"
    >
      <slot :name="name" v-bind="data || {}" />
    </template>
  </component>
</template>
