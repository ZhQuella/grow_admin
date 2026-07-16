<template>
  <div class="component-config">
    <GrowForm label-width="130px" label-position="left" size="small" :show-message="false">
      <GrowFormItem v-for="(item,index) in renderList" :key="index">
        <template #label>
          {{ item.name }}
          <GrowTooltip v-if="item.describe" :content="item.describe" placement="left">
            <div class="component-config__help">
              <GrowIconify icon="carbon:help" :size="14" />
            </div>
          </GrowTooltip>
        </template>
        <template #default>
          <component :is="item.eleType"
                     v-bind="item.props || {}" class="component-config__control"
                     clearable
                     v-model="currentPropsConfig[item.modelKey]" />
        </template>
      </GrowFormItem>
    </GrowForm>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
//  ------ ElementUI配置项 Start -----
import elFormConfig from "../../static/elementInfo/elFormConfig";
import elFormItemConfig from "../../static/elementInfo/elFormItemConfig";
import elButtonConfig from "../../static/elementInfo/elButtonConfig";
//  ------ ElementUI配置项 End -----

//  ------ 基础标签配置项 Start -----
import imageConfig from "../../static/elementInfo/imageConfig";
import BasicTitleConfig from "../../static/elementInfo/basicTitleConfig"
//  ------ 基础标签配置项 End -----

const props = defineProps({
  currentBasicConfig: {
    type: Object,
    default: () => ({})
  },
  currentPropsConfig: {
    type: Object,
    default: () => ({})
  }
});
const { currentBasicConfig, currentPropsConfig } = toRefs(props);
const renderList = computed(() => {
  const renderMap = {
    'GrowForm': elFormConfig.props,
    'GrowFormItem': elFormItemConfig.props,
    'GrowButton': elButtonConfig.props,
    'img': imageConfig.props,
    'BasicTitle': BasicTitleConfig.props
  };
  return renderMap[currentBasicConfig.value.elTagName] || [];
});
</script>

<style scoped>
.component-config {
  height: 100%;
  padding: 10px;
}

.component-config__help {
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.component-config__control {
  width: 100%;
}
</style>