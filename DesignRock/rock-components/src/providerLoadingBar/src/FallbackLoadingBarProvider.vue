<script lang="ts" setup>
import { onBeforeUnmount, provide, ref } from 'vue'
import {
  LOADING_BAR_INJECTION_KEY,
  type LoadingBarApi,
} from './loadingBarApi'

defineOptions({ name: 'LoadingBarProvider' })

const visible = ref(false)
const fading = ref(false)
const percent = ref(0)
const status = ref<'loading' | 'error'>('loading')

let trickleTimer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (trickleTimer != null) {
    clearInterval(trickleTimer)
    trickleTimer = null
  }
  if (hideTimer != null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function nextTrickle(current: number) {
  if (current >= 94) {
    return current
  }
  const increment = current < 20 ? 12 : current < 50 ? 6 : current < 80 ? 3 : 1
  return Math.min(94, current + increment * (0.4 + Math.random() * 0.6))
}

function start() {
  clearTimers()
  status.value = 'loading'
  fading.value = false
  percent.value = 2
  visible.value = true
  trickleTimer = setInterval(() => {
    percent.value = nextTrickle(percent.value)
  }, 240)
}

function complete(nextStatus: 'loading' | 'error') {
  clearTimers()
  status.value = nextStatus
  percent.value = 100
  hideTimer = setTimeout(() => {
    fading.value = true
    hideTimer = setTimeout(() => {
      visible.value = false
      fading.value = false
      percent.value = 0
      status.value = 'loading'
    }, 220)
  }, 180)
}

function finish() {
  complete('loading')
}

function error() {
  complete('error')
}

const api: LoadingBarApi = { start, finish, error }
provide(LOADING_BAR_INJECTION_KEY, api)
defineExpose(api)

onBeforeUnmount(clearTimers)
</script>

<template>
  <slot />
  <Teleport to="body">
    <div
      v-show="visible"
      class="grow-loading-bar"
      :class="{
        'grow-loading-bar--error': status === 'error',
        'grow-loading-bar--fading': fading,
      }"
      aria-hidden="true"
    >
      <div class="grow-loading-bar__peg" :style="{ width: `${percent}%` }" />
    </div>
  </Teleport>
</template>

<style>
.grow-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9998;
  width: 100%;
  height: 2px;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.22s ease;
}

.grow-loading-bar--fading {
  opacity: 0;
}

.grow-loading-bar__peg {
  height: 100%;
  background: var(--primary-color, #8b5cf6);
  box-shadow: 0 0 8px var(--primary-color, #8b5cf6);
  transition: width 0.24s ease;
}

.grow-loading-bar--error .grow-loading-bar__peg {
  background: var(--error-color, #d03050);
  box-shadow: 0 0 8px var(--error-color, #d03050);
}
</style>
