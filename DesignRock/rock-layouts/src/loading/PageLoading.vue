<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useAppStore } from '@grow-admin-rock/state'
import './page-loading.css'

const DEFAULT_LOADING_TIP_KEY = 'layout.common.pageLoading'
const LOGO_URL = '/logo.png'

const { t } = useI18n()
const appStore = useAppStore()
const { pageLoading, pageLoadingTip } = storeToRefs(appStore)

const loadingTip = computed(() =>
  t(pageLoadingTip.value || DEFAULT_LOADING_TIP_KEY),
)
</script>

<template>
  <Teleport to="body">
    <Transition name="page-loading-fade">
      <div
        v-if="pageLoading"
        class="page-loading"
        aria-live="polite"
        aria-busy="true"
        :aria-label="loadingTip"
      >
        <div class="page-loading__logo">
          <img :src="LOGO_URL" alt="Grow Admin" width="36" height="36" />
        </div>
        <p class="page-loading__title">
          {{ loadingTip }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
