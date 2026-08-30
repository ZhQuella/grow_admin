<template>
  <GrowForm
    ref="formRef"
    class="menu-form-panel"
    :model="state.formModel"
    :rules="state.formRules"
    label-width="88px"
  >
    <GrowRow :gutter="16">
      <GrowCol :span="24">
        <GrowFormItem label="挂载位置" prop="parentName">
          <GrowTreeSelect
            v-model="state.formModel.parentName"
            :data="state.parentTreeData"
            :props="{ label: 'title', value: 'name', children: 'children', disabled: 'disabled' }"
            check-strictly
            clearable
            filterable
            default-expand-all
            placeholder="不选则为根级"
          />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="类型" prop="menuType">
          <GrowRadioGroup v-model="state.formModel.menuType" :options="state.menuTypeOptions" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="排序" prop="sort">
          <GrowInputNumber v-model="state.formModel.sort" :min="0" :max="9999" controls-position="right" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.formModel.menuType === MenuTypeEnum.MENU" :span="24">
        <GrowFormItem label="菜单类型" prop="menuKind">
          <GrowRadioGroup
            :model-value="state.formModel.menuKind"
            :options="state.menuKindOptions"
            @update:model-value="state.onMenuKindChange"
          />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="标题" prop="title">
          <GrowInput v-model="state.formModel.title" maxlength="64" clearable placeholder="侧边栏显示名称" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="标识" prop="name">
          <GrowInput v-model="state.formModel.name" maxlength="64" clearable placeholder="如 MenuManage" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.showComponentKey" :span="12">
        <GrowFormItem label="组件标识">
          <div class="menu-form-panel__custom-component">
            <GrowSwitch
              :model-value="state.formModel.customComponentKey"
              :disabled="state.isAutomationMenu"
              @update:model-value="state.onCustomComponentKeyChange"
            />
            <GrowInput
              v-if="state.formModel.customComponentKey"
              v-model="state.formModel.componentKey"
              class="menu-form-panel__custom-component-input"
              maxlength="64"
              clearable
              placeholder="请填写组件标识"
            />
          </div>
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.showPath" :span="12">
        <GrowFormItem label="访问路径" prop="path" required>
          <GrowInput v-model="state.formModel.path" maxlength="128" clearable placeholder="如 menu-manage" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol v-if="state.isExternalMenu" :span="12">
        <GrowFormItem label="打开方式" prop="openMode">
          <GrowSelect v-model="state.formModel.openMode" :options="state.openModeOptions" />
        </GrowFormItem>
      </GrowCol>
      <GrowCol :span="12">
        <GrowFormItem label="图标" prop="icon" class="menu-form-panel__icon-item">
          <div class="menu-form-panel__icon-field">
            <GrowInput
              v-model="state.formModel.icon"
              maxlength="128"
              clearable
              placeholder="ant-design:menu-outlined"
            />
            <span class="menu-form-panel__icon-preview">
              <GrowIconify
                v-if="state.formModel.icon.trim()"
                :icon="state.formModel.icon.trim()"
                :size="24"
              />
            </span>
          </div>
        </GrowFormItem>
      </GrowCol>
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
          <div class="menu-form-panel__switch-group">
            <label class="menu-form-panel__switch">
              <GrowSwitch v-model="state.formModel.enabled" />
              <span>启用</span>
            </label>
            <label class="menu-form-panel__switch">
              <GrowSwitch v-model="state.formModel.isVisible" />
              <span>显示</span>
            </label>
            <label class="menu-form-panel__switch">
              <GrowSwitch v-model="state.formModel.isKeepAlive" />
              <span>缓存</span>
            </label>
            <label class="menu-form-panel__switch">
              <GrowSwitch v-model="state.formModel.affix" />
              <span>固定标签</span>
            </label>
            <label class="menu-form-panel__switch">
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
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { useMenuForm } from '../use/useMenuForm'

defineOptions({ name: 'MenuFormPanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuForm>
}>()

const formRef = props.state.formRef
const state = proxyRefs(props.state)
</script>

<style scoped>
.menu-form-panel :deep(.el-input-number),
.menu-form-panel :deep(.el-select),
.menu-form-panel :deep(.el-tree-select) {
  width: 100%;
}

.menu-form-panel__custom-component,
.menu-form-panel__icon-field,
.menu-form-panel__switch,
.menu-form-panel__switch-group {
  display: flex;
  align-items: center;
}

.menu-form-panel__custom-component {
  gap: 8px;
  width: 100%;
  min-height: 32px;
}

.menu-form-panel__custom-component :deep(.el-switch) {
  flex-shrink: 0;
}

.menu-form-panel__custom-component-input,
.menu-form-panel__custom-component :deep(.el-input) {
  flex: 1 1 0;
  min-width: 0;
  width: auto;
}

.menu-form-panel__icon-item :deep(.el-form-item__label) {
  height: 40px;
  line-height: 40px;
}

.menu-form-panel__icon-item :deep(.el-form-item__content) {
  align-items: center;
  min-height: 40px;
}

.menu-form-panel__icon-field {
  gap: 8px;
  height: 40px;
}

.menu-form-panel__icon-field :deep(.el-input) {
  flex: 1;
  min-width: 0;
  height: 40px;
}

.menu-form-panel__icon-field :deep(.el-input__wrapper) {
  height: 40px;
  min-height: 40px;
}

.menu-form-panel__icon-preview {
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

.menu-form-panel__icon-preview :deep(.grow-iconify) {
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

.menu-form-panel__icon-preview :deep(svg) {
  display: block;
  width: 24px !important;
  height: 24px !important;
}

.menu-form-panel__switch-group {
  flex-wrap: wrap;
  gap: 16px 20px;
  min-height: 32px;
}

.menu-form-panel__switch {
  gap: 8px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}
</style>
