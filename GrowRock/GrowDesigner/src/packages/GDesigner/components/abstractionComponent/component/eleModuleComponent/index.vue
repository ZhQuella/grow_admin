<template>
  <template v-if="!isSocket">
    <component :is="config.elTagName"></component>
  </template>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from "vue";

const list = ref([]);

interface PropsType {
  config: any;
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({})
});

const { config } = toRefs(props);

const isSocket = computed(() => {
  const slotMap = ["el-card", "el-tabs", "el-row"];
  return slotMap.includes(config.value.elTagName);
});
</script>
