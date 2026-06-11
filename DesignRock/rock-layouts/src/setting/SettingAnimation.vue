<script setup lang="ts">
import { RouterTransitionEnum } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppConfig } from '@grow-admin-rock/state'
import { computed } from 'vue'

const { t } = useI18n()
const appConfig = useAppConfig()
const { transition } = storeToRefs(appConfig)

const transitionOptions = computed(() =>
  Object.values(RouterTransitionEnum).map((value) => ({
    label: t(`layout.setting.transition.${value}`),
    value,
  })),
)

function resetAnimation() {
  appConfig.setTransition({
    enable: true,
    basicTransition: RouterTransitionEnum.FADE_SIDE,
  })
}

defineExpose({ resetAnimation })
</script>

<template>
  <GrowForm label-width="100px" label-position="left" class="mb-5">
    <GrowFormItem :label="t('layout.setting.transitionEnable')">
      <GrowSwitch
        :model-value="transition.enable"
        @update:model-value="(value) => appConfig.setTransition({ enable: value })"
      />
    </GrowFormItem>

    <GrowFormItem :label="t('layout.setting.transitionType')">
      <GrowSelect
        class="w-full"
        :model-value="transition.basicTransition"
        :options="transitionOptions"
        @update:model-value="(value) => appConfig.setTransition({ basicTransition: value })"
      />
    </GrowFormItem>
  </GrowForm>
</template>
