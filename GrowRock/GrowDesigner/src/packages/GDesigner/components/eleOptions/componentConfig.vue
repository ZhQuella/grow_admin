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
          <component :is="item.eleType" v-bind="item.props || {}" class="w-full">
            <template v-if="item.eleType === 'ElSelect'">
              <ElOption v-for="(item, index) in item.props.options || []"
                        :key="index"
                        :label="item.label"
                        :value="item.value" />
            </template>
          </component>
        </template>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import elFormConfig from "../../static/elFormConfig";
import { Help } from "@vicons/carbon";

const props = defineProps({
  currentBasicConfig: {
    type: Object,
    default: () => ({})
  }
});
const { currentBasicConfig } = toRefs(props);

const renderList = computed(() => {
  const renderMap = {
    'el-form': elFormConfig.props
  };
  return renderMap[currentBasicConfig.value.elTagName] || [];
});
</script>

<style scoped>

</style>