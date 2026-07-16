<template>
  <component :is="componentName" v-bind="propsInfo">
    {{ propsInfo.context }}
  </component>
</template>

<script setup lang="ts">
import {computed, toRefs} from "vue"

interface PropsType {
  config: any;
  propsInfo: any;
}

const props = withDefaults(defineProps<PropsType>(), {
  config: () => ({}),
  propsInfo: () => ({})
});

const { config, propsInfo } = toRefs(props);

const componentName = computed(() => {
  if(config.value.elTagName === 'BasicTitle'){
    return propsInfo.value.level
  }
  return config.value.elTagName
})

</script>

<script lang="ts">
import BasicTitle from "../../../BasicTitle/index.vue"

export default {
  components: {
    BasicTitle
  }
}
</script>
