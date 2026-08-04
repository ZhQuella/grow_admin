<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue'
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import GrowStep from './Step.vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.Steps,
  inheritAttrs: false,
})

const emit = defineEmits<{
  'update:current': [value: number]
}>()

const Steps = useDriverComponent(RockComponent.Steps)
const attrs = useAttrs()

/** 同一点击可能冒泡多次，短防抖 */
let lastReportAt = 0
let lastReportIndex = -1
const reportCurrent = (index: number) => {
  const n = Number(index)
  if (!Number.isFinite(n) || n < 1) return
  const now = Date.now()
  if (n === lastReportIndex && now - lastReportAt < 50) return
  lastReportAt = now
  lastReportIndex = n
  emit('update:current', n)
}

const driverKind = computed(() => {
  const name = String(
    (Steps as { name?: string; __name?: string } | undefined)?.name ||
      (Steps as { __name?: string } | undefined)?.__name ||
      '',
  )
  if (name.includes('ElSteps') || name === 'ElSteps') return 'ep'
  if (name.startsWith('A') || name.includes('Ant') || name === 'ASteps') return 'antd'
  return 'naive'
})

const normalizeStepItem = (item: Record<string, unknown>, index: number) => {
  const title =
    item.title != null && String(item.title).trim()
      ? String(item.title)
      : `步骤 ${index + 1}`
  const next: Record<string, unknown> = {
    title,
    description: item.description == null ? '' : String(item.description),
    disabled: Boolean(item.disabled),
  }
  if (item.icon != null && String(item.icon).trim()) {
    next.icon = String(item.icon).trim()
  }
  const status = item.status
  if (
    status === 'process' ||
    status === 'wait' ||
    status === 'finish' ||
    status === 'error'
  ) {
    next.status = status
  }
  return next
}

/** 绑定/配置的步骤数据；有数组时优先于默认插槽 */
const stepItems = computed(() => {
  const raw = (attrs as Record<string, unknown>).items
  if (!Array.isArray(raw) || raw.length === 0) return null
  return raw.map((item, index) =>
    normalizeStepItem(
      item && typeof item === 'object'
        ? (item as Record<string, unknown>)
        : { title: String(item ?? '') },
      index,
    ),
  )
})

/**
 * 以 Naive API 为准（current 从 1 起、vertical、content-placement），
 * EP / AntDV 做字段映射。
 */
const boundAttrs = computed(() => {
  const raw = { ...(attrs as Record<string, unknown>) }
  Reflect.deleteProperty(raw, 'name')
  Reflect.deleteProperty(raw, 'visible')
  Reflect.deleteProperty(raw, 'render')
  Reflect.deleteProperty(raw, 'items')
  Reflect.deleteProperty(raw, '__childPaneNames__')
  Reflect.deleteProperty(raw, '__stepsItems__')
  Reflect.deleteProperty(raw, 'design-host')
  Reflect.deleteProperty(raw, 'designHost')

  if (raw.current != null && raw.current !== '') {
    const n = Number(raw.current)
    if (Number.isFinite(n)) raw.current = n
  }

  // 传给 Naive 用于 clickable 样式；实际切换由 DOM 点击委托保证
  raw['onUpdate:current'] = reportCurrent
  raw.onUpdateCurrent = reportCurrent

  const kind = driverKind.value
  if (kind === 'naive') return raw

  const current = raw.current
  const vertical = raw.vertical
  const contentPlacement = raw.contentPlacement ?? raw['content-placement']
  const status = raw.status

  if (kind === 'ep') {
    if (current != null && current !== '') {
      const n = Number(current)
      if (Number.isFinite(n)) raw.active = Math.max(0, n - 1)
    }
    Reflect.deleteProperty(raw, 'current')
    if (vertical != null) {
      raw.direction = vertical ? 'vertical' : 'horizontal'
      Reflect.deleteProperty(raw, 'vertical')
    }
    if (status != null && status !== '') {
      raw['process-status'] = status
    }
    Reflect.deleteProperty(raw, 'contentPlacement')
    Reflect.deleteProperty(raw, 'content-placement')
    return raw
  }

  // antd
  if (current != null && current !== '') {
    const n = Number(current)
    if (Number.isFinite(n)) raw.current = Math.max(0, n - 1)
  }
  if (vertical != null) {
    raw.direction = vertical ? 'vertical' : 'horizontal'
    Reflect.deleteProperty(raw, 'vertical')
  }
  if (contentPlacement != null) {
    raw.labelPlacement = contentPlacement === 'bottom' ? 'vertical' : 'horizontal'
    Reflect.deleteProperty(raw, 'contentPlacement')
    Reflect.deleteProperty(raw, 'content-placement')
  }
  return raw
})

const STEP_SELECTOR = '.n-step, .el-step, .ant-steps-item'
const DISABLED_SELECTOR =
  '.n-step--disabled, .is-disabled, .ant-steps-item-disabled'

const resolveHostEl = (): HTMLElement | null => {
  const raw = DriverRef.value as { $el?: unknown } | HTMLElement | null | undefined
  if (!raw) return null
  if (raw instanceof HTMLElement) return raw
  const el = (raw as { $el?: unknown }).$el
  return el instanceof HTMLElement ? el : null
}

const onHostClick = (event: Event) => {
  const target = event.target as HTMLElement | null
  if (!target) return
  const stepEl = target.closest(STEP_SELECTOR) as HTMLElement | null
  if (!stepEl || stepEl.matches(DISABLED_SELECTOR) || stepEl.closest(DISABLED_SELECTOR)) {
    return
  }
  const host = resolveHostEl()
  if (!host || !host.contains(stepEl)) return
  const siblings = Array.from(host.querySelectorAll(STEP_SELECTOR)).filter(
    (el) => el.parentElement === stepEl.parentElement,
  )
  const index = siblings.indexOf(stepEl) + 1
  if (index < 1) return
  reportCurrent(index)
}

let attachedEl: HTMLElement | null = null

const detachHostClick = () => {
  if (!attachedEl) return
  attachedEl.removeEventListener('click', onHostClick)
  attachedEl = null
}

const attachHostClick = async () => {
  await nextTick()
  detachHostClick()
  const host = resolveHostEl()
  if (!host) return
  host.addEventListener('click', onHostClick)
  attachedEl = host
}

const setDriverRef = (inst: unknown) => {
  DriverRef.value = inst
  void attachHostClick()
}

onMounted(() => {
  void attachHostClick()
})

watch(DriverRef, () => {
  void attachHostClick()
})

onBeforeUnmount(() => {
  detachHostClick()
})
</script>

<template>
  <component
    :is="Steps"
    v-bind="boundAttrs"
    :ref="setDriverRef"
    class="grow-steps"
  >
    <template v-if="stepItems">
      <GrowStep
        v-for="(item, index) in stepItems"
        :key="index"
        v-bind="item"
      />
    </template>
    <slot v-else />
  </component>
</template>

<style>
.grow-steps .n-step:not(.n-step--disabled),
.grow-steps .el-step:not(.is-disabled),
.grow-steps .ant-steps-item:not(.ant-steps-item-disabled) {
  cursor: pointer;
}
</style>
