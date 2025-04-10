<template>
  <div class="h-full flex flex-col relative">
    <div class="h-[40px] border-b border-BORDER_COLOR] p-[4px] flex justify-end">
      <ElButton type="primary" :icon="Add" @click="onCreate">
        添加
      </ElButton>
    </div>
    <ElScrollbar class="flex-1">
      <div class="p-[5px]">

      </div>
    </ElScrollbar>

    <div v-if="showConfig.visible" class="absolute w-[300px] left-[300px] top-[-40px] bottom-0 bg-BG_COLOR3 flex flex-col border-l border-BORDER_COLOR]">
      <div class="h-[40px] border-b border-BORDER_COLOR] p-[4px] flex justify-end">
        <div class="p-[7px]">
          <el-icon :size="18" class="cursor-pointer" @click="onClose">
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="flex-1">
        2
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Add, Close } from "@vicons/carbon";
import { reactive } from "vue";

const showConfig = reactive({
  visible: false
});

const onCreate = () => {
  showConfig.visible = true;
};

const onClose = () => {
  showConfig.visible = false;
};
</script>
