<template>
  <!-- 顶栏 + 主区域 -->
  <GrowLayout
    v-if="layout === 'header-main'"
    direction="vertical"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutHeader :height="headerHeight">
      <slot name="header" />
    </GrowLayoutHeader>
    <GrowLayoutContent :style="mainStyle">
      <LayoutMainWatch fill="absolute">
        <template #default="mainSize">
          <slot name="main" v-bind="mainSize" />
        </template>
      </LayoutMainWatch>
    </GrowLayoutContent>
  </GrowLayout>

  <!-- 顶栏 + 主区域 + 底栏 -->
  <GrowLayout
    v-else-if="layout === 'header-main-footer'"
    direction="vertical"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutHeader :height="headerHeight">
      <slot name="header" />
    </GrowLayoutHeader>
    <GrowLayoutContent :style="mainStyle">
      <LayoutMainWatch fill="absolute">
        <template #default="mainSize">
          <slot name="main" v-bind="mainSize" />
        </template>
      </LayoutMainWatch>
    </GrowLayoutContent>
    <GrowLayoutFooter :height="footerHeight">
      <slot name="footer" />
    </GrowLayoutFooter>
  </GrowLayout>

  <!-- 侧边栏 + 主区域 -->
  <GrowLayout
    v-else-if="layout === 'aside-main'"
    direction="horizontal"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutSider :width="asideWidth">
      <slot name="aside" />
    </GrowLayoutSider>
    <GrowLayoutContent :style="mainStyle">
      <LayoutMainWatch fill="absolute">
        <template #default="mainSize">
          <slot name="main" v-bind="mainSize" />
        </template>
      </LayoutMainWatch>
    </GrowLayoutContent>
  </GrowLayout>

  <!-- 顶栏 + 侧边栏 + 主区域 -->
  <GrowLayout
    v-else-if="layout === 'header-aside-main'"
    direction="vertical"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutHeader :height="headerHeight">
      <slot name="header" />
    </GrowLayoutHeader>
    <GrowLayout direction="horizontal" :style="nestedContainerStyle">
      <GrowLayoutSider :width="asideWidth">
        <slot name="aside" />
      </GrowLayoutSider>
      <GrowLayoutContent :style="mainStyle">
        <LayoutMainWatch fill="absolute">
          <template #default="mainSize">
            <slot name="main" v-bind="mainSize" />
          </template>
        </LayoutMainWatch>
      </GrowLayoutContent>
    </GrowLayout>
  </GrowLayout>

  <!-- 顶栏 + 侧边栏 + 主区域 + 底栏 -->
  <GrowLayout
    v-else-if="layout === 'header-aside-main-footer'"
    direction="vertical"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutHeader :height="headerHeight">
      <slot name="header" />
    </GrowLayoutHeader>
    <GrowLayout direction="horizontal" :style="nestedContainerStyle">
      <GrowLayoutSider :width="asideWidth">
        <slot name="aside" />
      </GrowLayoutSider>
      <GrowLayout direction="vertical" :style="nestedContainerStyle">
        <GrowLayoutContent :style="mainStyle">
          <LayoutMainWatch fill="absolute">
            <template #default="mainSize">
              <slot name="main" v-bind="mainSize" />
            </template>
          </LayoutMainWatch>
        </GrowLayoutContent>
        <GrowLayoutFooter :height="footerHeight">
          <slot name="footer" />
        </GrowLayoutFooter>
      </GrowLayout>
    </GrowLayout>
  </GrowLayout>

  <!-- 侧边栏 + 顶栏 + 主区域 -->
  <GrowLayout
    v-else-if="layout === 'aside-header-main'"
    direction="horizontal"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutSider :width="asideWidth">
      <slot name="aside" />
    </GrowLayoutSider>
    <GrowLayout direction="vertical" :style="nestedContainerStyle">
      <GrowLayoutHeader :height="headerHeight">
        <slot name="header" />
      </GrowLayoutHeader>
      <GrowLayoutContent :style="mainStyle">
        <LayoutMainWatch fill="absolute">
          <template #default="mainSize">
            <slot name="main" v-bind="mainSize" />
          </template>
        </LayoutMainWatch>
      </GrowLayoutContent>
    </GrowLayout>
  </GrowLayout>

  <!-- 侧边栏 + 顶栏 + 主区域 + 底栏（默认兜底） -->
  <GrowLayout
    v-else
    direction="horizontal"
    :class="nodeClass"
    :style="rootStyle"
  >
    <GrowLayoutSider :width="asideWidth">
      <slot name="aside" />
    </GrowLayoutSider>
    <GrowLayout direction="vertical" :style="nestedContainerStyle">
      <GrowLayoutHeader :height="headerHeight">
        <slot name="header" />
      </GrowLayoutHeader>
      <GrowLayoutContent :style="mainStyle">
        <LayoutMainWatch fill="absolute">
          <template #default="mainSize">
            <slot name="main" v-bind="mainSize" />
          </template>
        </LayoutMainWatch>
      </GrowLayoutContent>
      <GrowLayoutFooter :height="footerHeight">
        <slot name="footer" />
      </GrowLayoutFooter>
    </GrowLayout>
  </GrowLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEFAULT_PAGE_LAYOUT } from '../../GrowDesigner/static/layoutPresets'
import LayoutMainWatch from '../../GrowDesigner/components/layoutMainWatch/index.vue'

defineOptions({ name: 'RenderPageLayout' })

const props = defineProps<{
  layout?: string
  headerHeight?: string
  asideWidth?: string
  footerHeight?: string
  nodeClass?: unknown
  nodeStyle?: Record<string, any> | undefined
}>()

const layout = computed(() => props.layout || DEFAULT_PAGE_LAYOUT)
const headerHeight = computed(() => props.headerHeight || '40px')
const asideWidth = computed(() => props.asideWidth || '200px')
const footerHeight = computed(() => props.footerHeight || '60px')
const rootStyle = computed(() => ({
  width: '100%',
  height: '100%',
  flex: '1 1 auto',
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden',
  ...(props.nodeStyle || {}),
}))
const mainStyle = {
  padding: '10px',
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'hidden',
  position: 'relative' as const,
}
/** 嵌套 Container 参与父级 flex 撑满，否则主区域 WatchBox 高度为 0 */
const nestedContainerStyle = {
  flex: '1 1 auto',
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden',
  height: 'auto',
  position: 'relative' as const,
}
</script>
