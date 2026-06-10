<script setup lang="ts">
import { computed } from 'vue'
import {
  APP_THEME_COLOR_LIST,
  ContentLayoutEnum,
  MenuModeEnum,
  MenuTypeEnum,
  RouterTransitionEnum,
  ThemeEnum,
  ThemeModeEnum,
} from '@grow-admin-rock/constants'
import { storeToRefs, useAppConfig } from '@grow-admin-rock/state'

const appConfig = useAppConfig()
const {
  openSettingDrawer,
  themeMode,
  themeColor,
  navBarMode,
  grayMode,
  colorWeak,
  openKeepAlive,
  sidebar,
  menu,
  header,
  tabTar,
  content,
  footer,
  logo,
  transition,
} = storeToRefs(appConfig)

const drawerVisible = computed({
  get: () => openSettingDrawer.value,
  set: (value: boolean) => appConfig.setOpenSettingDrawer(value),
})

const themeModeOptions = [
  { label: '亮色', value: ThemeModeEnum.LIGHT },
  { label: '暗色', value: ThemeModeEnum.DARK },
  { label: '跟随系统', value: ThemeModeEnum.SYSTEM },
]

const navBarModeOptions = [
  { label: '侧边栏', value: MenuTypeEnum.SIDEBAR },
  { label: '顶部菜单', value: MenuTypeEnum.TOP_MENU },
  { label: '混合菜单', value: MenuTypeEnum.MIX },
  { label: '混合侧边栏', value: MenuTypeEnum.MIX_SIDEBAR },
]

const menuThemeOptions = [
  { label: '亮色', value: ThemeEnum.LIGHT },
  { label: '暗色', value: ThemeEnum.DARK },
]

const menuModeOptions = [
  { label: '垂直', value: MenuModeEnum.VERTICAL },
  { label: '水平', value: MenuModeEnum.HORIZONTAL },
  { label: '内嵌', value: MenuModeEnum.INLINE },
]

const contentModeOptions = [
  { label: '流式', value: ContentLayoutEnum.FULL },
  { label: '定宽', value: ContentLayoutEnum.FIXED },
]

const transitionOptions = Object.values(RouterTransitionEnum).map((value) => ({
  label: value,
  value,
}))

function resetConfig() {
  appConfig.$reset()
  appConfig.setThemeMode(ThemeModeEnum.SYSTEM)
  appConfig.setThemeColor('#8b5cf6')
}
</script>

<template>
  <GrowDrawer v-model="drawerVisible" title="项目配置" :size="320" append-to-body>
    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">主题模式</h4>
      <GrowRadioGroup
        :model-value="themeMode"
        :options="themeModeOptions"
        @update:model-value="appConfig.setThemeMode"
      />
    </section>

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">主题色</h4>
      <div class="grow-setting-drawer__colors">
        <button
          v-for="color in APP_THEME_COLOR_LIST"
          :key="color"
          type="button"
          class="grow-setting-drawer__color"
          :class="{ 'is-active': themeColor === color }"
          :style="{ backgroundColor: color }"
          @click="appConfig.setThemeColor(color)"
        />
      </div>
    </section>

    <GrowDivider />

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">布局</h4>
      <div class="grow-setting-drawer__row">
        <span>导航栏模式</span>
        <GrowSelect
          :model-value="navBarMode"
          :options="navBarModeOptions"
          style="width: 140px"
          @update:model-value="appConfig.setNavBarMode"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>内容区域</span>
        <GrowSelect
          :model-value="content.mode"
          :options="contentModeOptions"
          style="width: 140px"
          @update:model-value="(value) => appConfig.setContent({ mode: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>全屏内容</span>
        <GrowSwitch
          :model-value="content.fullScreen"
          @update:model-value="(value) => appConfig.setContent({ fullScreen: value })"
        />
      </div>
    </section>

    <GrowDivider />

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">侧边栏</h4>
      <div class="grow-setting-drawer__row">
        <span>显示侧边栏</span>
        <GrowSwitch
          :model-value="sidebar.show"
          @update:model-value="(value) => appConfig.setSidebar({ show: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>固定侧边栏</span>
        <GrowSwitch
          :model-value="sidebar.fixed"
          @update:model-value="(value) => appConfig.setSidebar({ fixed: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>折叠菜单</span>
        <GrowSwitch
          :model-value="sidebar.collapsed"
          @update:model-value="(value) => appConfig.setSidebar({ collapsed: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>菜单主题</span>
        <GrowRadioGroup
          :model-value="sidebar.theme"
          :options="menuThemeOptions"
          @update:model-value="(value) => appConfig.setSidebar({ theme: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>菜单宽度</span>
        <GrowInputNumber
          :model-value="sidebar.width"
          :min="160"
          :max="320"
          @update:model-value="(value) => appConfig.setSidebar({ width: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>菜单模式</span>
        <GrowSelect
          :model-value="menu.mode"
          :options="menuModeOptions"
          style="width: 140px"
          @update:model-value="(value) => appConfig.setMenu({ mode: value })"
        />
      </div>
    </section>

    <GrowDivider />

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">顶栏</h4>
      <div class="grow-setting-drawer__row">
        <span>显示顶栏</span>
        <GrowSwitch
          :model-value="header.show"
          @update:model-value="(value) => appConfig.setHeader({ show: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>固定顶栏</span>
        <GrowSwitch
          :model-value="header.fixed"
          @update:model-value="(value) => appConfig.setHeader({ fixed: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>顶栏主题</span>
        <GrowRadioGroup
          :model-value="header.theme"
          :options="menuThemeOptions"
          @update:model-value="(value) => appConfig.setHeader({ theme: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>显示面包屑</span>
        <GrowSwitch
          :model-value="header.showBreadCrumb"
          @update:model-value="(value) => appConfig.setHeader({ showBreadCrumb: value })"
        />
      </div>
    </section>

    <GrowDivider />

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">标签页</h4>
      <div class="grow-setting-drawer__row">
        <span>显示标签页</span>
        <GrowSwitch
          :model-value="tabTar.show"
          @update:model-value="(value) => appConfig.setTabTar({ show: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>缓存标签页</span>
        <GrowSwitch
          :model-value="tabTar.cache"
          @update:model-value="(value) => appConfig.setTabTar({ cache: value })"
        />
      </div>
    </section>

    <GrowDivider />

    <section class="grow-setting-drawer__section">
      <h4 class="grow-setting-drawer__title">动画与其它</h4>
      <div class="grow-setting-drawer__row">
        <span>切换动画</span>
        <GrowSwitch
          :model-value="transition.enable"
          @update:model-value="(value) => appConfig.setTransition({ enable: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>动画类型</span>
        <GrowSelect
          :model-value="transition.basicTransition"
          :options="transitionOptions"
          style="width: 140px"
          @update:model-value="(value) => appConfig.setTransition({ basicTransition: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>页面 Loading</span>
        <GrowSwitch
          :model-value="transition.openPageLoading"
          @update:model-value="(value) => appConfig.setTransition({ openPageLoading: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>进度条</span>
        <GrowSwitch
          :model-value="transition.openNProgress"
          @update:model-value="(value) => appConfig.setTransition({ openNProgress: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>KeepAlive</span>
        <GrowSwitch :model-value="openKeepAlive" @update:model-value="appConfig.setOpenKeepAlive" />
      </div>
      <div class="grow-setting-drawer__row">
        <span>灰色模式</span>
        <GrowSwitch :model-value="grayMode" @update:model-value="appConfig.setGrayMode" />
      </div>
      <div class="grow-setting-drawer__row">
        <span>色弱模式</span>
        <GrowSwitch :model-value="colorWeak" @update:model-value="appConfig.setColorWeak" />
      </div>
      <div class="grow-setting-drawer__row">
        <span>显示 Logo</span>
        <GrowSwitch
          :model-value="logo.show"
          @update:model-value="(value) => appConfig.setLogo({ show: value })"
        />
      </div>
      <div class="grow-setting-drawer__row">
        <span>显示页脚</span>
        <GrowSwitch
          :model-value="footer.show"
          @update:model-value="(value) => appConfig.setFooter({ show: value })"
        />
      </div>
    </section>

    <div class="grow-setting-drawer__footer">
      <GrowButton @click="resetConfig">重置配置</GrowButton>
      <GrowButton type="primary" @click="drawerVisible = false">关闭</GrowButton>
    </div>
  </GrowDrawer>
</template>
