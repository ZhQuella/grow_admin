import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { tryOnUnmounted, useDebounceFn } from '@vueuse/core'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { ScreenValueEnum } from '@grow-admin-rock/constants'
import { useTheme } from '@grow-admin-rock/state'
import { addEventResize, removeResizeListener } from '@grow-admin-rock/utils'
import echarts from '../echarts'
import { useBreakpoint } from '../event/use-breakpoint'

type UseEchartsOptions = {
  renderer?: 'canvas' | 'svg'
}

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useEcharts(
  elRef: Ref<HTMLDivElement | null>,
  options?: UseEchartsOptions,
) {
  const { resolvedTheme } = useTheme()
  let chartInstance: echarts.ECharts | null = null
  const cacheOptions = ref({}) as Ref<EChartsOption>
  let setToken = 0

  const themeType = computed(() => resolvedTheme.value)
  const echartsTheme = computed(() => (themeType.value === 'dark' ? 'dark' : undefined))

  const resizeChart = useDebounceFn(() => {
    chartInstance?.resize({
      animation: {
        duration: 300,
        easing: 'quadraticIn',
      },
    })
  }, 200)

  async function resize() {
    await resizeChart()
  }

  function disposeInstance() {
    const el = unref(elRef)
    if (el) {
      removeResizeListener(el, resize)
    }
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    if (el) {
      echarts.getInstanceByDom(el)?.dispose()
    }
  }

  const initCharts = async (theme = echartsTheme.value) => {
    const el = unref(elRef)
    if (!el?.isConnected) {
      return
    }
    const existing = echarts.getInstanceByDom(el)
    if (existing) {
      existing.dispose()
    }
    if (chartInstance && chartInstance !== existing) {
      chartInstance.dispose()
    }
    chartInstance = echarts.init(el, theme, { renderer: options?.renderer || 'svg' })
    addEventResize(el, resize)
    const { widthRef } = useBreakpoint()
    if (unref(widthRef) <= ScreenValueEnum.MD || el.offsetHeight === 0) {
      await wait(30)
      await resize()
    }
  }

  const getOptions = computed(() => {
    if (themeType.value !== 'dark') {
      return unref(cacheOptions) as EChartsOption
    }
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value,
    } as EChartsOption
  })

  const setOptions = async (nextOptions: EChartsOption, clear = true) => {
    const token = ++setToken
    cacheOptions.value = nextOptions
    const el = unref(elRef)
    if (!el) return
    if (el.offsetHeight === 0) {
      await wait(30)
      if (token !== setToken) return
      if (!unref(elRef) || unref(elRef)!.offsetHeight === 0) return
    }
    await nextTick()
    await wait(30)
    if (token !== setToken) return
    const currentEl = unref(elRef)
    if (!currentEl?.isConnected) return
    const live = chartInstance && !chartInstance.isDisposed() && chartInstance.getDom() === currentEl
    if (!live) {
      await initCharts(echartsTheme.value)
      if (!chartInstance || token !== setToken) return
    }
    if (clear) {
      chartInstance.clear()
    }
    chartInstance.setOption(unref(getOptions))
  }

  const getInstance = (): echarts.ECharts | null => {
    const el = unref(elRef)
    if (chartInstance && !chartInstance.isDisposed() && (!el || chartInstance.getDom() === el)) {
      return chartInstance
    }
    return el ? echarts.getInstanceByDom(el) || null : null
  }

  tryOnUnmounted(() => {
    disposeInstance()
  })

  watch(elRef, (el, prev) => {
    if (prev && prev !== el) {
      echarts.getInstanceByDom(prev)?.dispose()
      if (chartInstance?.getDom() === prev) {
        chartInstance = null
      }
    }
  })

  watch(
    () => themeType.value,
    async () => {
      if (!chartInstance) return
      disposeInstance()
      await initCharts(echartsTheme.value)
      await setOptions(cacheOptions.value)
    },
  )

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  }
}
