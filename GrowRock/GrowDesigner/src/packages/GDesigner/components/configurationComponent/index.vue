<template>
  <ElForm class="px-[10px] pt-[5px]" label-width="50px">
    <ElFormItem v-for="(item, index) of configurationList" :key="index" :label="item.name">
      <component :is="item.eleType" />
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import configurationList from "../../static/pageConfig";

const emit = defineEmits(["change"]);


const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
});
const { config } = toRefs(props);

</script>

<style scoped></style>
