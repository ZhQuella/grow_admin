<script lang="ts" setup>
import LoginLanguageSwitch from '#/pages/Login/components/LoginLanguageSwitch/index.vue'
import LoginThemeSwitch from '#/pages/Login/components/LoginThemeSwitch/index.vue'
import LoginForm from '#/pages/Login/components/LoginForm/index.vue'
import ForgetPassword from '#/pages/Login/components/ForgetPassword/index.vue'
import ChangePassword from '#/pages/Login/components/ChangePassword/index.vue'
import MobilePhone from '#/pages/Login/components/MobilePhone/index.vue'
import QrCodeLogin from '#/pages/Login/components/QrCodeLogin/index.vue'
import ThirdParty from '#/pages/Login/components/ThirdParty/index.vue'
import { useLoginEvent } from '#/pages/Login/use/useLoginEvent'
import { getImageUrl } from '#/utils/getImageUrl'
import { useI18n, useLocale } from '@grow-admin-rock/locale'

const { t } = useI18n()
const { getLocale } = useLocale()

const {
  formType,
  tagCode,
  onChangeFormType,
  onForgetPasswordSuccess,
  onChangePasswordBack,
  onChangePasswordSuccess,
} = useLoginEvent()
</script>

<template>
  <div class="relative h-screen overflow-hidden bg-layout text-text" :key="getLocale">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span
        class="bg-primary-a28 absolute -top-32 right-[10%] h-[28rem] w-[28rem] rounded-full opacity-45 blur-[80px]"
      />
      <span
        class="bg-primary-a16 absolute -bottom-40 left-[35%] h-96 w-96 rounded-full opacity-45 blur-[80px]"
      />
      <span
        class="login-ambient-grid absolute inset-0 [mask-image:radial-gradient(circle_at_70%_40%,black,transparent_72%)]"
      />
    </div>

    <div class="fixed top-3 right-3 z-30 flex items-center gap-2 md:top-4 md:right-4 md:gap-2.5">
      <LoginThemeSwitch />
      <LoginLanguageSwitch />
      <GrowButton
        tag="a"
        href="https://github.com/ZhQuella/grow_up_admin"
        target="_blank"
        rel="noopener noreferrer"
        circle
        class="login-interactive-icon !h-9 !w-9 border border-border bg-component text-text-secondary"
        aria-label="GitHub"
      >
        <GrowIconify icon="ant-design:github-filled" :size="20" hover-pointer />
      </GrowButton>
    </div>

    <GrowScrollbar class="h-full" style="height: 100%">
      <div class="relative z-1 flex min-h-screen">
        <aside
          class="bg-login-brand hidden w-[30%] max-w-[560px] flex-col items-center justify-center px-10 py-12 xl:flex"
        >
          <div class="w-full max-w-[420px]">
            <GrowTag
              round
              class="-enter-y bg-login-brand-badge border-login-brand-badge-border mb-5 border px-3 py-1.5 text-xs font-semibold tracking-wider uppercase"
            >
              Grow Admin SaaS
            </GrowTag>
            <GrowH2 class="text-login-brand mb-3 text-[2rem] font-bold leading-tight tracking-tight -enter-x">
              {{ t('layout.login.title') }}
            </GrowH2>
            <p class="text-login-brand-muted mb-7 text-[0.95rem] leading-relaxed enter-x">
              {{ t('layout.login.subtitle') }}
            </p>

            <ul class="mb-8 list-none p-0">
              <li
                v-for="key in ['state1', 'state2', 'state3']"
                :key="key"
                class="login-brand-highlight-item text-login-brand-soft mb-2.5 text-base font-medium -enter-x"
              >
                {{ t(`layout.login.state.${key}`) }}
              </li>
            </ul>

            <div class="enter-y">
              <img
                class="shadow-login-illustration mx-auto block w-full max-w-[360px]"
                :src="getImageUrl('login_illustration.png')"
                alt=""
              />
            </div>
          </div>
        </aside>

        <main class="flex flex-1 items-center justify-center px-3.5 py-5 pb-8 md:px-5 md:py-8 md:pb-12">
          <div
            class="login-card-panel w-full sm:w-full md:max-w-[700px] xl:max-w-[440px] rounded-2xl border border-border p-5 md:rounded-[20px] md:px-7 md:pt-8 md:pb-6"
          >
            <div class="mb-6 flex items-center gap-3.5 enter-y">
              <div
                class="shadow-login-logo h-[52px] w-[52px] shrink-0 rounded-[14px] border border-border bg-component p-2"
              >
                <img class="block h-full w-full object-contain" :src="getImageUrl('logo.png')" alt="Grow Admin" />
              </div>
              <div>
                <GrowH1 class="mb-1 text-[1.35rem] font-bold leading-tight tracking-tight text-text">
                  {{ t('layout.login.title') }}
                </GrowH1>
                <GrowText class="text-sm leading-normal text-muted">
                  {{ t('layout.login.subtitle') }}
                </GrowText>
              </div>
            </div>

            <div>
              <div v-if="formType === 'login'">
                <div class="min-h-[280px]">
                  <LoginForm @forget="onChangeFormType" />
                </div>
                <GrowRow :gutter="12" class="mt-2">
                  <GrowCol :span="12">
                    <GrowButton class="w-full" @click="onChangeFormType('mobilePhone')">
                      {{ t('layout.login.word.numberLogin') }}
                    </GrowButton>
                  </GrowCol>
                  <GrowCol :span="12">
                    <GrowButton class="w-full" @click="onChangeFormType('qrCodeLogin')">
                      {{ t('layout.login.word.scanCodeLogin') }}
                    </GrowButton>
                  </GrowCol>
                </GrowRow>
              </div>

              <ForgetPassword
                v-if="formType === 'forgetPassword'"
                @back="onChangeFormType"
                @success="onForgetPasswordSuccess"
              />

              <ChangePassword
                v-if="formType === 'changePassword'"
                :tag-code="tagCode"
                @back="onChangePasswordBack"
                @success="onChangePasswordSuccess"
              />

              <MobilePhone v-if="formType === 'mobilePhone'" @back="onChangeFormType" />

              <QrCodeLogin v-if="formType === 'qrCodeLogin'" @back="onChangeFormType" />
            </div>

            <div class="mt-2">
              <GrowDivider>{{ t('layout.login.word.otherLoginTitle') }}</GrowDivider>
            </div>
            <div class="mx-auto mt-5 w-full max-w-[300px]">
              <ThirdParty />
            </div>
          </div>
        </main>
      </div>
    </GrowScrollbar>
  </div>
</template>
