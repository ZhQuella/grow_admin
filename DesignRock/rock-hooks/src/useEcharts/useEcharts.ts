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

  const themeType = computed(() => resolvedTheme.value)

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

  const initCharts = async (theme = themeType.value) => {
    const el = unref(elRef)
    if (!el) {
      return
    }
    chartInstance = echarts.init(el, theme, {
      renderer: options?.renderer || 'svg',
    })
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
    cacheOptions.value = nextOptions
    if (unref(elRef)?.offsetHeight === 0) {
      await wait(30)
      await setOptions(unref(getOptions))
      return
    }
    nextTick(async () => {
      await wait(30)
      if (!chartInstance) {
        await initCharts(themeType.value)
        if (!chartInstance) return
      }
      if (clear) {
        chartInstance?.clear()
      }
      chartInstance?.setOption(unref(getOptions))
    })
  }

  const getInstance = (): echarts.ECharts | null => {
    if (!chartInstance) {
      void initCharts(themeType.value)
    }
    return chartInstance
  }

  tryOnUnmounted(() => {
    if (!chartInstance) return
    removeResizeListener(unref(elRef), resize)
    chartInstance.dispose()
    chartInstance = null
  })

  watch(
    () => themeType.value,
    async (theme) => {
      if (chartInstance) {
        chartInstance.dispose()
        await initCharts(theme)
        await setOptions(cacheOptions.value)
      }
    },
  )

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  }
}
