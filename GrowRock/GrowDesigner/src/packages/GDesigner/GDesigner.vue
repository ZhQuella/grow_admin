<template>
  <div class="h-full relative" @mouseup="onLeftOptionClose" @click="onActivated('')">
    <div class="flex h-full rounded-[4px] overflow-hidden">
      <div
        class="grow-0 shrink-0 w-[50px] bg-BG_COLOR3 box-border p-[5px] border-r-[1px] border-BORDER_COLOR2 border-solid"
        @mouseup.stop
      >
        <el-tooltip class="box-item" effect="dark" content="组件库" placement="right">
          <div
            class="text-center leading-[40px] mb-[5px] cursor-pointer hover:text-PUBLIC_MAIN_COLOR transition duration-150"
            :class="[
              {
                'text-PUBLIC_MAIN_COLOR': optionConfig.type === 'module'
              }
            ]"
            @click="onLeftOptionClick('module')"
          >
            <el-icon :size="18" @click="onLeftOptionClose">
              <FlowLogsVpc />
            </el-icon>
          </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="查看数据" placement="right">
          <div
            class="text-center leading-[40px] mb-[5px] cursor-pointer hover:text-PUBLIC_MAIN_COLOR transition duration-150"
            :class="[
              {
                'text-PUBLIC_MAIN_COLOR': optionConfig.type === 'json'
              }
            ]"
            @click="onLeftOptionClick('json')"
          >
            <el-icon :size="18" @click="onLeftOptionClose">
              <DataBase />
            </el-icon>
          </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="结构树" placement="right">
          <div
            class="text-center leading-[40px] mb-[5px] cursor-pointer hover:text-PUBLIC_MAIN_COLOR transition duration-150"
            :class="[
              {
                'text-PUBLIC_MAIN_COLOR': optionConfig.type === 'tree'
              }
            ]"
            @click="onLeftOptionClick('tree')"
          >
            <el-icon :size="18" @click="onLeftOptionClose">
              <TreeView />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
      <div
        class="h-full w-[300px] left-[50px] top-[0px] bg-BG_COLOR3 flex flex-col z-10"
        :class="[
          {
            absolute: !optionConfig.isFixed
          }
        ]"
        @mouseup.stop
        v-if="optionConfig.visible"
      >
        <div class="flex p-[5px] justify-between border-b-[1px] border-BORDER_COLOR2 border-solid">
          <h4 class="leading-[30px] text-[14px]">{{ optionConfig.title }}</h4>
          <div>
            <el-icon
              class="w-[30px] h-[30px] text-center leading-[30px] cursor-pointer"
              :class="{
                'text-PUBLIC_MAIN_COLOR': optionConfig.isFixed
              }"
              @click="onChangeOptionFixed"
              size="16"
            >
              <component :is="optionConfig.isFixed ? 'TagNone' : 'Tag'" />
            </el-icon>
            <el-icon
              class="w-[30px] h-[30px] text-center leading-[30px] cursor-pointer"
              @click="onLeftClose"
              size="16"
            >
              <Close />
            </el-icon>
          </div>
        </div>
        <div class="flex-1 h-[1px]">
          <component
            :is="optionConfig.componentName"
            :data="draggableConfig"
            class="flex-1 h-full"
            @dragstart="onGenerateKey"
            @node-click="onActiveNode"
          />
        </div>
      </div>
      <div class="flex-1 bg-BG_COLOR2 relative">
        <el-scrollbar class="h-full draggable-content">
          <DraggableView
            :draggableConfig="draggableConfig"
            @add="onDraggableViewAdd"
            @special="onSpecialAdd"
            @active="onActivated"
            @delete="onDeleteItem"
            @copy="onCopyItem"
          />
        </el-scrollbar>
        <div
          class="text-gray-400 absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] leading-full pointer-events-none text-center text-[24px]"
          v-if="!draggableConfig.structures.length"
        >
          请从左侧组件库中拖入对应组件
        </div>
      </div>
      <div
        class="grow-0 shrink-0 w-[300px] bg-BG_COLOR3 border-l-[1px] border-BORDER_COLOR2 border-solid"
        @click.stop
      >
        <component
          :is="activeUUID ? 'EleOptions' : 'PageOptions'"
          :config="draggableConfig"
          :activeUUID="activeUUID"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FlowLogsVpc, Close, DataBase, TreeView } from "@vicons/carbon";
import DraggableView from "./components/draggableView/index.vue";

import { useOption } from "./use/useOption";
import { useEvents } from "./use/useEvents";

const {
  draggableConfig,
  optionConfig,
  onLeftOptionClick,
  onLeftOptionClose,
  onChangeOptionFixed,
  onLeftClose,
  activeUUID
} = useOption();

const { onGenerateKey, onDraggableViewAdd, onSpecialAdd, onActivated, onDeleteItem, onCopyItem, onActiveNode } =
  useEvents({
    draggableConfig,
    activeUUID
  });
</script>

<script lang="ts">
import { defineComponent } from "vue";
import moduleOptions from "./components/moduleOptions/index.vue";
import reviewData from "./components/reviewData/index.vue";
import reviewTree from "./components/reviewTree/index.vue";
import EleOptions from "./components/eleOptions/index.vue";
import PageOptions from "./components/pageOptions/index.vue";

export default defineComponent({
  name: "GDesigner",
  components: {
    EleOptions,
    PageOptions,
    moduleOptions,
    reviewData,
    reviewTree
  }
});
</script>

<style lang="scss" scoped>
:deep(.draggable-content .el-scrollbar__wrap) {
  display: flex;
  flex-direction: column;
  .el-scrollbar__view {
    flex-grow: 1;
  }
}
</style>
