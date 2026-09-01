<script lang="ts" setup>
import { useDriverComponent, RockComponent } from '#/index'
import { DriverRefKey } from '#/utils/refSupport'
import { ref } from 'vue'

const DriverRef = ref()
defineExpose({ [DriverRefKey]: DriverRef })
defineOptions({
  name: RockComponent.Alert,
})
const Alert = useDriverComponent(RockComponent.Alert)
</script>
<template>
  <component :is="Alert" class="grow-alert" v-bind="$attrs" :ref="DriverRefKey">
    <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
      <slot :name="item" v-bind="data || {}" />
    </template>
  </component>
</template>

<style>
.grow-alert.el-alert {
  --el-alert-title-font-size: 13px;
  --el-alert-description-font-size: 12px;
  --el-alert-close-font-size: 12px;
}

.grow-alert.el-alert--with-description {
  align-items: center;
  padding: 8px 12px;
}

.grow-alert .el-alert__title,
.grow-alert.el-alert--with-description .el-alert__title {
  font-size: 13px !important;
  font-weight: 600;
  line-height: 20px;
}

.grow-alert .el-alert__description {
  margin-top: 4px;
  font-size: 12px !important;
  line-height: 18px;
}

.grow-alert .el-alert__icon,
.grow-alert.el-alert--with-description .el-alert__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px !important;
  font-size: 16px !important;
  margin-top: 0 !important;
}
</style>
