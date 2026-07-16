<template>
  <GrowForm class="configuration-form" label-width="50px">
    <GrowFormItem v-for="(item, index) of configurationList" :key="index" :label="item.name">
      <component :is="item.eleType" />
    </GrowFormItem>
  </GrowForm>
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

<style scoped>
.configuration-form {
  padding: 5px 10px 0;
}
</style>
