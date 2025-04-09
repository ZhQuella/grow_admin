<template>
  <div
    class="relative transition delay-0 border-[1px] hover:border-PUBLIC_MAIN_COLOR border-dashed rounded-[5px] overflow-hidden duration-350"
    :class="{
      'border-PUBLIC_MAIN_COLOR': isActived,
      'border-slate-300': !isActived
    }"
    @click.stop="onActiveStructure"
  >
    <!-- todo 这里需要点击显示 根据active的值进行判断 -->
    <transition
      appear
      name="animate__animated animate__bounce"
      enter-active-class="animate__lightSpeedInLeft"
      leave-active-class="animate__lightSpeedOutLeft"
    >
      <div
        class="z-20 absolute top-0 left-0 pr-[4px] h-[26px] bg-PUBLIC_MAIN_COLOR text-center rounded-br-[5px] overflow-hidden"
        v-show="isActived"
      >
        <el-icon class="draggable-content-bar cursor-pointer w-[26px] h-[26px]">
          <Move class="text-white" />
        </el-icon>
        <el-icon class="ml-[5px] cursor-pointer w-[26px] h-[26px]" @click="onDeleteItem">
          <Delete class="text-white" />
        </el-icon>
        <el-icon class="ml-[5px] cursor-pointer w-[26px] h-[26px]">
          <Copy class="text-white" @click="onCopyItem" />
        </el-icon>
        <el-icon
          class="ml-[5px] cursor-pointer w-[26px] h-[26px]"
          v-if="isAdd"
          @click="onAddSpecificChild"
        >
          <AddAlt class="text-white" />
        </el-icon>
      </div>
    </transition>
    <div class="p-[5px]">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from "../../config/designation";
import { Move, Delete, Copy, AddAlt } from "@vicons/carbon";
import { inject, computed, toRefs } from "vue";

const draggableConfig: any = inject(DRAGGABLE_CONGIG);
const activeUUID = inject(ACTIVE_UUID) as Ref<string>;

interface Props {
  structure: any;
}

const emit = defineEmits(["special", "active", "delete", "copy"]);

const props = defineProps<Props>();
const { structure } = toRefs(props);

const uuid = computed(() => {
  return structure?.value?.uuid;
});

const currentArgument = computed(() => {
  const { renderArgument } = draggableConfig;
  const argument = renderArgument[uuid?.value];
  return argument || {};
});

const isAdd = computed(() => {
  return currentArgument?.value?.isAdd;
});

const isActived = computed(() => activeUUID.value === uuid.value);

const onActiveStructure = () => {
  emit("active", uuid.value);
};

const onAddSpecificChild = () => {
  emit("special", {
    structure: props.structure,
    renderArgument: currentArgument.value
  });
};

const onDeleteItem = () => {
  emit("delete", props.structure);
};

const onCopyItem = () => {
  emit("copy", props.structure);
};
</script>
<style lang="scss">
.draggable-grop-wrap {
  .ghost {
    width: 100% !important;
    display: block !important;
    height: 5px !important;
    background-color: rgb(var(--public-main-color)) !important;
    overflow: hidden !important;
    padding: 0px !important;
  }
}
</style>
