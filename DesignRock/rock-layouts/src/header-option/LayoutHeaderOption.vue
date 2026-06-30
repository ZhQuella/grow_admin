<template>
  <LayoutSearch />
  <GrowButton
    v-if="isFullscreenSupported"
    circle
    text
    class="!ml-[0px]"
    :aria-label="isScreenFullscreen ? t('layout.common.exitFullScreen') : t('layout.common.fullScreen')"
    :title="isScreenFullscreen ? t('layout.common.exitFullScreen') : t('layout.common.fullScreen')"
    @click="toggleScreenFullscreen"
  >
    <GrowIconify
      :icon="isScreenFullscreen ? 'ant-design:fullscreen-exit-outlined' : 'ant-design:fullscreen-outlined'"
      :size="18"
      hover-pointer
    />
  </GrowButton>
  <GrowButton
    v-if="showLockButton"
    circle
    text
    class="!ml-[0px]"
    :aria-label="t('layout.lock.lockScreen')"
    :title="t('layout.lock.lockScreen')"
    @click="handleLock"
  >
    <GrowIconify icon="ant-design:lock-outlined" :size="18" hover-pointer />
  </GrowButton>
  <GrowButton
    v-if="showHeaderSettingButton"
    circle
    text
    :aria-label="t('layout.setting.title')"
    :title="t('layout.setting.title')"
    @click="emit('open-setting')"
    class="!ml-[0px]"
  >
    <GrowIconify icon="ant-design:setting-outlined" :size="18" hover-pointer />
  </GrowButton>
  <LayoutUserInfo :user-info="userInfo" @logout="emit('logout')" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { SettingButtonPositionEnum } from '@grow-admin-rock/constants'
import { useFullscreen } from '@grow-admin-rock/hooks'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig, useLockStore } from '@grow-admin-rock/state'
import type { UserInfo } from '@grow-admin-rock/types'
import LayoutUserInfo from '../user-info/LayoutUserInfo.vue'
import LayoutSearch from '../search/LayoutSearch.vue'

defineProps<{
  userInfo?: UserInfo | null
}>()

const emit = defineEmits<{
  'open-setting': []
  logout: []
}>()

const { t } = useI18n()
const appConfig = useAppConfig()
const lockStore = useLockStore()
const { showSettingButton, showSettingDrawer, settingButtonPosition, useLockPage } = storeToRefs(appConfig)
const { isFullscreen: isScreenFullscreen, isSupported: isFullscreenSupported, toggle: toggleScreenFullscreen } = useFullscreen()

const showHeaderSettingButton = computed(() => {
  if (!showSettingButton.value || !showSettingDrawer.value) return false
  const position = settingButtonPosition.value
  return (
    position === SettingButtonPositionEnum.HEADER
    || position === SettingButtonPositionEnum.AUTO
  )
})

const showLockButton = computed(() => useLockPage.value)

function handleLock() {
  lockStore.lock()
}
</script>
