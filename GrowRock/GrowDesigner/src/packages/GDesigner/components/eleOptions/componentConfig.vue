<template>
  <div class="h-full p-[10px]">
    <ElForm label-width="130px" label-position="left" size="small" :show-message="false">
      <ElFormItem v-for="(item,index) in renderList" :key="index">
        <template #label>
          {{ item.name }}
          <el-tooltip v-if="item.describe" :content="item.describe" placement="left">
            <div class="flex justify-center pt-[5px]">
              <el-icon :size="14" class="ml-[5px]">
                <Help />
              </el-icon>
            </div>
          </el-tooltip>
        </template>
        <template #default>
          <component :is="item.eleType"
                     v-bind="item.props || {}" class="w-full"
                     clearable
                     v-model="currentPropsConfig[item.modelKey]">
            <template v-if="item.eleType === 'ElSelect'">
              <ElOption v-for="(ele, index) in item.props.options || []"
                        :key="index"
                        :label="ele.label"
                        :value="ele.value" />
            </template>
          </component>
        </template>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { Help } from "@vicons/carbon";
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
    'el-form': elFormConfig.props,
    'el-form-item': elFormItemConfig.props,
    'el-button': elButtonConfig.props,
    'img': imageConfig.props,
    'BasicTitle': BasicTitleConfig.props
  };
  return renderMap[currentBasicConfig.value.elTagName] || [];
});
</script>

<style scoped>

</style>