import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useLocale } from '@grow-admin-rock/locale'

const WEEKDAY_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatClock(now: Date, locale: string) {
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())
  const isZh = locale.startsWith('zh')

  const dateLine = isZh
    ? `${year}年${month}月${day}日`
    : new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now)

  const weekday = isZh
    ? WEEKDAY_ZH[now.getDay()]
    : new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)
  const timeLine = `${weekday} ${hours}:${minutes}:${seconds}`

  return { dateLine, timeLine }
}

export function useLockScreenClock(enabled: Ref<boolean>) {
  const { getLocale } = useLocale()
  const now = ref(new Date())
  let timer: number | undefined

  const dateLine = computed(
    () => formatClock(now.value, getLocale.value).dateLine,
  )
  const timeLine = computed(
    () => formatClock(now.value, getLocale.value).timeLine,
  )

  function start() {
    now.value = new Date()
    timer = window.setInterval(() => {
      now.value = new Date()
    }, 1000)
  }

  function stop() {
    if (timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  }

  watch(enabled, (active) => {
    if (active) {
      start()
      return
    }
    stop()
  }, { immediate: true })

  onBeforeUnmount(stop)

  return {
    dateLine,
    timeLine,
  }
}
