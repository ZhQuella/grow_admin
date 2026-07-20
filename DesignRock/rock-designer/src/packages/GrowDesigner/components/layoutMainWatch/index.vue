<template>
  <div
    ref="hostRef"
    class="layout-main-watch"
    :class="{ 'is-absolute-fill': fill === 'absolute' }"
  >
    <GrowWatchBox class="layout-main-watch__box" @resize="onResize">
      <template #default="size">
        <div class="layout-main-watch__body">
          <slot v-bind="size" />
        </div>
      </template>
    </GrowWatchBox>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, reactive, ref } from 'vue'
import { LAYOUT_MAIN_SIZE, type LayoutMainSize } from '../../config/designation'

defineOptions({ name: 'LayoutMainWatch' })

const props = withDefaults(
  defineProps<{
    /** absolute：预览铺满主区域；flow：设计器保持可投放文档流 */
    fill?: 'absolute' | 'flow'
  }>(),
  {
    fill: 'flow',
  },
)

const injected = inject<LayoutMainSize | null>(LAYOUT_MAIN_SIZE, null)
const size = injected ?? reactive<LayoutMainSize>({ width: 0, height: 0 })
if (!injected) {
  provide(LAYOUT_MAIN_SIZE, size)
}

const hostRef = ref<HTMLElement | null>(null)

const onResize = (next: LayoutMainSize) => {
  size.width = next.width
  size.height = next.height
}

onMounted(() => {
  const el = hostRef.value
  if (!el) return
  const syncFromHost = () => {
    const h = el.clientHeight
    const w = el.clientWidth
    if (h > 0) {
      size.height = h
      size.width = w
    }
  }
  syncFromHost()
  requestAnimationFrame(syncFromHost)
})
</script>

<style scoped>
.layout-main-watch {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 120px;
  flex: 1 1 auto;
  /* 自身可参与父级 flex 撑高，但不对业务子节点做 flex 排布 */
  display: block;
}

.layout-main-watch.is-absolute-fill {
  height: 100%;
  min-height: 0;
}

.layout-main-watch__box {
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.layout-main-watch.is-absolute-fill .layout-main-watch__box {
  position: absolute !important;
  inset: 0;
  width: auto !important;
  height: auto !important;
}

.layout-main-watch.is-absolute-fill :deep(.grow-watch-box) {
  position: absolute !important;
  inset: 0;
  width: auto !important;
  height: auto !important;
  min-width: 0;
  min-height: 0;
}

.layout-main-watch__body {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  /* 文档流排布，避免 flex 把按钮等子项横向拉满 */
  position: relative;
  overflow: auto;
}
</style>
