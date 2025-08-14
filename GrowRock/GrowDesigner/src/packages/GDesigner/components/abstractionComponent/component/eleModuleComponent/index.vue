<template>
  <template v-if="!isSocket">
    <component :is="config.elTagName"
               v-bind="propsInfo">
      <span v-if="['el-button'].includes(config.elTagName)">{{ propsInfo.content }}</span>
      <template v-if="['el-select'].includes(config.elTagName)">
        <ElOption v-for="item in propsInfo.options"
                  :key="item[propsInfo.renderKey]"
                  :label="item[propsInfo.renderLabel]"
                  :value="item[propsInfo.renderValue]" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from "vue";

const list = ref([]);

interface PropsType {
  config: any;
  propsInfo: any;
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({})
});

const { config, propsInfo } = toRefs(props);

const isSocket = computed(() => {
  const slotMap = ["el-card", "el-tabs", "el-row"];
  return slotMap.includes(config.value.elTagName);
});
</script>
