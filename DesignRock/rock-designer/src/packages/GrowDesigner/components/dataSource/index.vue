<template>
  <div class="designer-subpanel" @click.stop @mouseup.stop>
    <div class="designer-subpanel__toolbar">
      <GrowButton type="primary" size="small" @click.stop="onCreate">
        <GrowIconify icon="carbon:add" :size="16" class="designer-subpanel__btn-icon" />
        添加
      </GrowButton>
    </div>
    <GrowScrollbar class="designer-subpanel__body">
      <div class="designer-subpanel__placeholder" />
    </GrowScrollbar>

    <div v-if="showConfig.visible" class="designer-subpanel__drawer">
      <div class="designer-subpanel__drawer-header">
        <GrowIconify icon="carbon:close" :size="18" hover-pointer @click.stop="onClose" />
      </div>
      <div class="designer-subpanel__drawer-body">
        <GrowCodeEditor
          v-model="editorValue"
          default-language="json"
          :language-switchable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { GrowCodeEditor } from '@grow-admin-rock/code-sandbox'

const showConfig = reactive({
  visible: false,
})
const editorValue = ref('{}')

const onCreate = () => {
  showConfig.visible = true
}

const onClose = () => {
  showConfig.visible = false
}
</script>

<style lang="scss" scoped>
.designer-subpanel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: visible;
}

.designer-subpanel__toolbar {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  padding: 4px;
  border-bottom: 1px solid var(--layout-border-color);
}

.designer-subpanel__btn-icon {
  margin-right: 4px;
}

.designer-subpanel__body {
  flex: 1;
  min-height: 0;
}

.designer-subpanel__placeholder {
  padding: 5px;
}

.designer-subpanel__drawer {
  position: absolute;
  top: 0;
  left: 100%;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: 300px;
  border-left: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
  box-shadow: var(--card-shadow);
}

.designer-subpanel__drawer-header {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--layout-border-color);
}

.designer-subpanel__drawer-body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}
</style>
