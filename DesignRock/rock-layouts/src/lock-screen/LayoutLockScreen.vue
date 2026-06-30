<template>
  <Teleport to="body">
    <Transition name="layout-lock-slide">
      <div
        v-if="isLock"
        class="layout-lock-screen fixed inset-0 z-[900] flex items-center justify-center"
      >
        <div class="layout-lock-screen__clock pointer-events-none absolute bottom-10 left-10 select-none">
          <div class="text-[24px] font-semibold leading-none tracking-wide text-text">
            {{ dateLine }}
          </div>
          <div class="mt-3 text-[18px] leading-none text-text-secondary">
            {{ timeLine }}
          </div>
        </div>

        <div class="layout-lock-screen__panel flex w-full max-w-[360px] flex-col items-center rounded-2xl bg-component px-6 py-8">
          <GrowAvatar
            v-if="hasAvatar"
            :size="80"
            :src="avatar"
            class="mb-4"
          />
          <span
            v-else
            class="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-a12 text-primary"
          >
            <GrowIconify icon="ant-design:user-outlined" :size="36" />
          </span>

          <div class="mb-6 text-center">
            <div class="text-lg font-semibold text-text">
              {{ displayName }}
            </div>
            <div
              v-if="deptName"
              class="mt-1 text-sm text-text-secondary"
            >
              {{ deptName }}
            </div>
          </div>

          <GrowForm
            ref="formRef"
            class="w-full"
            size="large"
            :model="formData"
            :rules="formRules"
            @submit.prevent="handleUnlock"
          >
            <GrowFormItem prop="password">
              <GrowInput
                v-model="formData.password"
                type="password"
                show-password
                clearable
                autocomplete="off"
                name="screen-unlock-password"
                :placeholder="t('layout.lock.passwordPlaceholder')"
                @keyup.enter="handleUnlock"
              >
                <template #prefix>
                  <GrowIconify icon="ant-design:lock-outlined" :size="16" class="text-text-secondary" />
                </template>
              </GrowInput>
            </GrowFormItem>

            <GrowButton
              type="primary"
              size="large"
              class="!w-full"
              :loading="unlocking"
              native-type="button"
              @click="handleUnlock"
            >
              {{ t('layout.lock.unlock') }}
            </GrowButton>
          </GrowForm>

          <GrowButton
            type="text"
            block
            size="large"
            class="mt-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-primary"
            @click="handleLogout"
          >
            <GrowIconify icon="ant-design:logout-outlined" :size="15" />
            <span>{{ t('layout.user.logout') }}</span>
          </GrowButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { driverRef, useMsg } from '@grow-admin-rock/components'
import { useI18n } from '@grow-admin-rock/locale'
import { storeToRefs, useLockStore } from '@grow-admin-rock/state'
import type { UserInfo } from '@grow-admin-rock/types'
import { useLockScreenClock } from './useLockScreenClock'

const props = defineProps<{
  userInfo?: UserInfo | null
  verifyPassword: (password: string) => Promise<boolean>
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()
const message = useMsg()
const lockStore = useLockStore()
const { isLock } = storeToRefs(lockStore)
const { dateLine, timeLine } = useLockScreenClock(isLock)

const formRef = ref()
const unlocking = ref(false)
const formData = reactive({
  password: '',
})

const formRules = computed(() => ({
  password: [
    {
      required: true,
      message: t('layout.lock.passwordRequired'),
      trigger: ['blur', 'change'],
    },
  ],
}))

const displayName = computed(
  () => props.userInfo?.realname || props.userInfo?.username || '',
)
const deptName = computed(() => props.userInfo?.deptName || '')
const avatar = computed(() => props.userInfo?.avatar || '')
const hasAvatar = computed(() => !!props.userInfo?.avatar)

watch(isLock, (locked) => {
  if (locked) {
    formData.password = ''
  }
})

function blurActiveElement() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

async function waitForDomSettle() {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function clearPassword() {
  formData.password = ''
  driverRef(formRef)?.clearValidate?.()
}

async function handleLogout() {
  clearPassword()
  blurActiveElement()
  lockStore.unlock()
  await waitForDomSettle()
  emit('logout')
}

async function handleUnlock() {
  try {
    await driverRef(formRef)?.validate()
  } catch {
    return
  }

  unlocking.value = true
  try {
    const valid = await props.verifyPassword(formData.password)
    if (!valid) {
      message.error?.(t('layout.lock.passwordError'))
      clearPassword()
      return
    }

    clearPassword()
    blurActiveElement()
    await waitForDomSettle()
    lockStore.unlock()
  } finally {
    unlocking.value = false
  }
}
</script>

<style scoped>
.layout-lock-screen {
  background-color: var(--lock-screen-overlay-color);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.layout-lock-screen__panel {
  box-shadow: var(--lock-screen-panel-shadow);
}

@media (max-width: 768px) {
  .layout-lock-screen__clock {
    bottom: 1.5rem;
    left: 1.5rem;
  }

  .layout-lock-screen__clock > div:first-child {
    font-size: 2rem;
  }

  .layout-lock-screen__clock > div:last-child {
    margin-top: 0.5rem;
    font-size: 1rem;
  }
}

.layout-lock-slide-enter-active,
.layout-lock-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-lock-slide-enter-from,
.layout-lock-slide-leave-to {
  transform: translateY(-100%);
}
</style>
