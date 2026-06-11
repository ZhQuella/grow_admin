<script lang="ts" setup>
import { ref } from 'vue'
import { SettingDrawer } from '@grow-admin-rock/layouts'
import LoginLanguageSwitch from '#/components/LoginLanguageSwitch/index.vue'
import LoginThemeSwitch from '#/components/LoginThemeSwitch/index.vue'
import { useI18n, useLocale } from '@grow-admin-rock/locale'
import { loginMockTest } from '#/api/login'

const { t } = useI18n()
const { getLocale } = useLocale()
const settingVisible = ref(false)
const mockLoading = ref(false)
const mockResult = ref('')

async function handleMockLogin() {
  mockLoading.value = true
  mockResult.value = ''
  try {
    const res = await loginMockTest({ username: 'admin', password: '123456' })
    mockResult.value = JSON.stringify(res, null, 2)
  } catch (error) {
    mockResult.value = error instanceof Error ? error.message : String(error)
  } finally {
    mockLoading.value = false
  }
}
</script>

<template>
  <div class="relative flex-center min-h-screen p-6 bg-layout text-text" :key="getLocale">
    <div class="fixed top-4 right-4 z-10 flex flex-col items-stretch gap-2">
      <LoginThemeSwitch />
      <LoginLanguageSwitch />
      <GrowButton type="primary" @click="settingVisible = true">
        {{ t('layout.login.projectSetting') }}
      </GrowButton>
    </div>

    <div class="box-card w-full max-w-[400px] p-8 surface-panel shadow-card">
      <!-- UnoCSS screens 测试：sm 0px / md 768px / lg 1024px / xl 1280px -->
      <div
        class="mb-4 rounded-lg px-4 py-3 text-center text-sm font-medium text-white
          bg-red-500 md:bg-blue-500 lg:bg-green-500 xl:bg-purple-500"
      >
        <span class="md:hidden">sm · 0px+ · red</span>
        <span class="hidden md:inline lg:hidden">md · 768px+ · blue</span>
        <span class="hidden lg:inline xl:hidden">lg · 1024px+ · green</span>
        <span class="hidden xl:inline">xl · 1280px+ · purple</span>
      </div>

      <h1 class="m-0 mb-2 text-2xl font-semibold text-text">{{ t('layout.login.title') }}</h1>
      <p class="m-0 mb-6 text-sm text-muted">{{ t('layout.login.subtitle') }}</p>

      <GrowButton
        class="w-full"
        type="primary"
        :loading="mockLoading"
        @click="handleMockLogin"
      >
        {{ t('layout.login.mockLogin') }}
      </GrowButton>

      <pre
        v-if="mockResult"
        class="mt-4 max-h-48 overflow-auto rounded border border-border bg-layout p-3 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap break-all"
      >{{ mockResult }}</pre>
    </div>

    <SettingDrawer v-model="settingVisible" />
  </div>
</template>
