<template>
  <GrowForm
    ref="formRef"
    class="application-function-form-panel"
    :model="state.formModel"
    :rules="state.formRules"
    label-width="88px"
  >
    <GrowRow :gutter="16">
      <GrowCol :span="12">
        <GrowFormItem label="排序" prop="sort">
          <GrowInputNumber v-model="state.formModel.sort" :min="0" :max="9999" controls-position="right" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="24">
        <GrowFormItem label="功能类型" prop="menuKind" required>
          <GrowRadioGroup
            :model-value="state.formModel.menuKind"
            :options="state.menuKindOptions"
            @update:model-value="state.onMenuKindChange"
          />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="功能名称" prop="title">
          <GrowInput v-model="state.formModel.title" maxlength="64" clearable placeholder="功能显示名称" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.showPath" :span="12">
        <GrowFormItem label="访问路径" prop="path" required>
          <GrowInput
            v-model="state.formModel.path"
            maxlength="128"
            clearable
            placeholder="如 demo"
          />
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.isExternalMenu" :span="12">
        <GrowFormItem label="打开方式" prop="openMode" required>
          <GrowSelect v-model="state.formModel.openMode" :options="state.openModeOptions" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol
        :span="24"
        class="application-function-form-panel__required-extension"
      >
        <GrowRow :gutter="16">
          <GrowCol v-if="state.isAutomationMenu" :span="12">
            <GrowFormItem label="页面类型" prop="automationType" required>
              <GrowSelect
                v-model="state.formModel.automationType"
                :options="state.automationTypeOptions"
                @change="state.onAutomationTypeChange"
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="state.isAutomationMenu" :span="12">
            <GrowFormItem label="选择页面" prop="automationPage" required>
              <GrowSelect
                v-model="state.formModel.automationPage"
                :options="state.automationPageOptions"
                :placeholder="state.automationPagePlaceholder"
                clearable
              />
            </GrowFormItem>
          </GrowCol>
          <GrowCol v-if="state.isExternalMenu" :span="24">
            <GrowFormItem label="链接" prop="link" required>
              <GrowInput v-model="state.formModel.link" maxlength="256" clearable placeholder="外链或 iframe 地址" />
            </GrowFormItem>
          </GrowCol>
        </GrowRow>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem
          label="图标"
          prop="icon"
          class="application-function-form-panel__icon-item"
        >
          <div class="application-function-form-panel__icon-field">
            <GrowInput
              v-model="state.formModel.icon"
              maxlength="128"
              clearable
              placeholder="ant-design:menu-outlined"
            />
            <span class="application-function-form-panel__icon-preview">
              <GrowIconify
                v-if="state.formModel.icon.trim()"
                :icon="state.formModel.icon.trim()"
                :size="24"
              />
            </span>
          </div>
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="24">
        <GrowFormItem label="说明" prop="description">
          <GrowInput
            v-model="state.formModel.description"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            placeholder="选填"
          />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="24">
        <GrowFormItem label="选项">
          <div class="application-function-form-panel__switch-group">
            <label class="application-function-form-panel__switch">
              <GrowSwitch v-model="state.formModel.enabled" />
              <span>启用</span>
            </label>
            <label class="application-function-form-panel__switch">
              <GrowSwitch v-model="state.formModel.isVisible" />
              <span>显示</span>
            </label>
            <label class="application-function-form-panel__switch">
              <GrowSwitch v-model="state.formModel.isKeepAlive" />
              <span>缓存</span>
            </label>
            <label class="application-function-form-panel__switch">
              <GrowSwitch v-model="state.formModel.affix" />
              <span>固定标签</span>
            </label>
            <label class="application-function-form-panel__switch">
              <GrowSwitch v-model="state.formModel.defaultShow" />
              <span>默认打开</span>
            </label>
          </div>
        </GrowFormItem>
      </GrowCol>
    </GrowRow>
  </GrowForm>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import type { useApplicationFunctionForm } from '../use/useApplicationFunctionForm'

defineOptions({ name: 'ApplicationFunctionFormPanel' })

const props = defineProps<{
  state: ReturnType<typeof useApplicationFunctionForm>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.application-function-form-panel :deep(.el-input-number),
.application-function-form-panel :deep(.el-select),
.application-function-form-panel :deep(.el-tree-select) {
  width: 100%;
}

.application-function-form-panel__icon-field,
.application-function-form-panel__switch,
.application-function-form-panel__switch-group {
  display: flex;
  align-items: center;
}

.application-function-form-panel__required-extension {
  min-height: 56px;
}

.application-function-form-panel__icon-item :deep(.el-form-item__label) {
  height: 40px;
  line-height: 40px;
}

.application-function-form-panel__icon-item :deep(.el-form-item__content) {
  align-items: center;
  min-height: 40px;
}

.application-function-form-panel__icon-field {
  gap: 8px;
  height: 40px;
}

.application-function-form-panel__icon-field :deep(.el-input) {
  flex: 1;
  min-width: 0;
  height: 40px;
}

.application-function-form-panel__icon-field :deep(.el-input__wrapper) {
  height: 40px;
  min-height: 40px;
}

.application-function-form-panel__icon-preview {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid var(--layout-border-color);
  border-radius: 4px;
  background: var(--component-background-color);
  color: var(--text-color);
}

.application-function-form-panel__icon-preview :deep(.grow-iconify) {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block !important;
  width: 24px;
  height: 24px;
  margin: 0;
  font-size: 24px;
  line-height: 0;
  transform: translate(-50%, -50%);
}

.application-function-form-panel__icon-preview :deep(svg) {
  display: block;
  width: 24px !important;
  height: 24px !important;
}

.application-function-form-panel__switch-group {
  flex-wrap: wrap;
  gap: 16px 20px;
  min-height: 32px;
}

.application-function-form-panel__switch {
  gap: 8px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}
</style>
