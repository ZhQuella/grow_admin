<template>
  <div ref="chartRef" :style="{ height, width }" />
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import { onMounted, ref, Ref } from "vue";
import { useEcharts } from '@grow-admin-rock/hooks';

defineProps({
  width: {
    type: String as PropType<string>,
    default: "100%"
  },
  height: {
    type: String as PropType<string>,
    default: "280px"
  }
});

const chartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useEcharts(chartRef as Ref<HTMLDivElement>);
onMounted(() => {
  setOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        lineStyle: {
          width: 1,
          color: "#019680"
        }
      }
    },
    grid: {
      left: "1%",
      right: "1%",
      top: "2  %",
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: [...new Array(12)].map((_item, index) => `${index + 1}月`)
    },
    yAxis: {
      type: "value",
      max: 8000,
      splitNumber: 4
    },
    series: [
      {
        data: [3000, 2000, 3333, 5000, 3200, 4200, 3200, 2100, 3000, 5100, 6000, 3200, 4800],
        type: "bar",
        barMaxWidth: 80
      }
    ]
  });
});
</script>

