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
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "#999"
          }
        }
      },
      legend: {
        data: ["Evaporation", "Precipitation", "Temperature"]
      },
      xAxis: [
        {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisPointer: {
            type: "shadow"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          name: "Precipitation",
          min: 0,
          max: 250,
          interval: 50,
          axisLabel: {
            formatter: "{value} ml"
          }
        },
        {
          type: "value",
          name: "Temperature",
          min: 0,
          max: 25,
          interval: 5,
          axisLabel: {
            formatter: "{value} °C"
          }
        }
      ],
      series: [
        {
          name: "Evaporation",
          type: "bar",
          tooltip: {
            valueFormatter: function (value) {
              return value + " ml";
            }
          },
          data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
        },
        {
          name: "Precipitation",
          type: "bar",
          tooltip: {
            valueFormatter: function (value) {
              return value + " ml";
            }
          },
          data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
        },
        {
          name: "Temperature",
          type: "line",
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + " °C";
            }
          },
          data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
        }
      ]
    });
  },
  { immediate: true }
);
</script>

