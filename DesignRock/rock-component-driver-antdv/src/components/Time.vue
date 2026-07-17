<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({ name: 'Time' })

const props = withDefaults(
  defineProps<{
    time?: number | Date | string | null
    type?: 'relative' | 'date' | 'datetime'
    format?: string
    unix?: boolean
    text?: boolean
    to?: number | Date | string | null
    timeZone?: string | null
  }>(),
  {
    type: 'datetime',
    unix: false,
    text: false,
  },
)

const resolveTimeZone = (zone?: string | null) => {
  if (typeof zone !== 'string') return undefined
  const trimmed = zone.trim()
  return trimmed || undefined
}

const toDate = (value: number | Date | string | null | undefined, unix: boolean) => {
  if (value == null || value === '') return new Date()
  if (value instanceof Date) return value
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(unix ? value * 1000 : value)
  }
  const raw = String(value).trim()
  if (!raw) return new Date()
  const asNum = Number(raw)
  if (!Number.isNaN(asNum)) {
    return new Date(unix ? asNum * 1000 : asNum)
  }
  return new Date(raw)
}

const formatWithZone = (date: Date, zone?: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }
  if (zone) options.timeZone = zone
  try {
    return new Intl.DateTimeFormat(undefined, options).format(date)
  } catch {
    return date.toLocaleString()
  }
}

const renderedTime = computed(() => {
  try {
    const zone = resolveTimeZone(props.timeZone)
    const date = toDate(props.time, props.unix)
    if (Number.isNaN(date.getTime())) return '-'

    if (props.format) {
      return formatWithZone(date, zone)
    }
    if (props.type === 'date') {
      try {
        return date.toLocaleDateString(undefined, zone ? { timeZone: zone } : undefined)
      } catch {
        return date.toLocaleDateString()
      }
    }
    if (props.type === 'relative') {
      const target = toDate(props.to ?? Date.now(), props.unix)
      const diffSec = Math.round((date.getTime() - target.getTime()) / 1000)
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
      const abs = Math.abs(diffSec)
      if (abs < 60) return rtf.format(diffSec, 'second')
      if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
      if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
      if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day')
      if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month')
      return rtf.format(Math.round(diffSec / 31536000), 'year')
    }
    try {
      return date.toLocaleString(undefined, zone ? { timeZone: zone } : undefined)
    } catch {
      return date.toLocaleString()
    }
  } catch {
    return '-'
  }
})
</script>

<template>
  <span class="grow-time" :data-time-text="text || undefined">{{ renderedTime }}</span>
</template>

<style scoped>
.grow-time {
  display: inline;
  font-size: 14px;
  line-height: 1.5;
  color: inherit;
  white-space: nowrap;
}
</style>
