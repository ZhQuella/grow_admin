<template>
  <div ref="chartRef" :style="{ width, height }" />
</template>

<script lang="ts" setup>
import type { PropType, Ref } from "vue";
import { ref, watch } from "vue";
import { useEcharts } from '@grow-admin-rock/hooks';
const chartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useEcharts(chartRef as Ref<HTMLDivElement>);

const props = defineProps({
  loading: Boolean,
  width: {
    type: String as PropType<string>,
    default: "100%"
  },
  height: {
    type: String as PropType<string>,
    default: "300px"
  }
});

watch(
  () => props.loading,
  () => {
    if (props.loading) {
      return;
    }
    setOptions({
      tooltip: {
        trigger: "item"
      },
      legend: {
        top: "5%",
        left: "center",
        // doesn't perfectly work with our tricks, disable it
        selectedMode: false
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "70%"],
          // adjust the start angle
          startAngle: 180,
          label: {
            show: true,
            formatter(param) {
              // correct the percentage
              return param.name + " (" + param.percent * 2 + "%)";
            }
          },
          data: [
            { value: 1048, name: "Search Engine" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" },
            {
              // make an record to fill the bottom 50%
              value: 1048 + 735 + 580 + 484 + 300,
              itemStyle: {
                // stop the chart from rendering this piece
                color: "none",
                decal: {
                  symbol: "none"
                }
              },
              label: {
                show: false
              }
            }
          ]
        }
      ]
    });
  },
  { immediate: true }
);
</script>

