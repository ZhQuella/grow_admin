<template>
  <div class="h-full flex flex-col">
    <h5 class="text-[14px] p-[10px] bg-BG_COLOR2">组件配置</h5>
    <div class="px-[5px] shrink-0 grow-0">
      <ElTabs v-model="tabModel" stretch>
        <ElTabPane label="属性" name="props" />
        <ElTabPane label="样式" name="styles" />
        <ElTabPane label="事件" name="events" />
        <ElTabPane label="高级" name="renderArgument" />
      </ElTabs>
    </div>
    <ElScrollbar class="h-full flex-1">
      <component :is="renderConfigComponent"
                 :currentBasicConfig="currentBasicConfig">
      </component>
<!--      <ElementSize v-model:styleOption="config.styles[activeUUID]" />-->
<!--      <ElementDisplay />-->
<!--      {{ tabModel }}-->
<!--      {{ config[tabModel][activeUUID] }}-->
<!--      {{ config.styles[activeUUID] }}-->
<!--      <p class="p-[10px] text-center">用爱发电中...😊</p>-->
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "eleOptions" });
import { toRefs, ref, computed } from "vue";
// import ElementSize from "../../optionComponent/ElementSize/index.vue";
// import ElementDisplay from "../../optionComponent/ElementDisplay/index.vue";

const props = defineProps({
  activeUUID: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    required: true
  }
});

const { activeUUID, config } = toRefs(props);
const tabModel = ref("props");
const currentBasicConfig = computed(() => {
  return config.value['renderArgument'][activeUUID.value]
});
const renderConfigComponent = computed(() => {
  const renderMap = {
    props: "componentConfig"
  };
  return renderMap[tabModel.value] || null;
})
</script>

<script lang="ts">
import componentConfig from "./componentConfig.vue";

export default {
  components: {
    componentConfig
  }
}
</script>
