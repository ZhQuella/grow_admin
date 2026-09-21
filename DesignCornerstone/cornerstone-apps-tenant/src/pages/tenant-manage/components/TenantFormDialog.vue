<template>
  <GrowDialog
    v-model="formVisible"
    class="tenant-form-dialog"
    :title="formTitle"
    width="min(760px, 92vw)"
    append-to-body
    destroy-on-close
  >
    <GrowScrollbar max-height="65vh" class="tenant-form-dialog__scrollbar">
      <GrowForm
        ref="formRef"
        class="tenant-form-dialog__form"
        :model="formModel"
        :rules="formRules"
        label-position="top"
      >
      <section v-if="formMode === 'view'" class="tenant-form-dialog__section">
        <h4 class="tenant-form-dialog__section-title">租户状态</h4>
        <div class="tenant-form-dialog__grid">
          <GrowFormItem label="租户ID">
            <GrowInput :model-value="formModel.id" disabled />
          </GrowFormItem>
          <GrowFormItem label="当前状态">
            <div class="tenant-form-dialog__readonly">
              <GrowTag v-if="formDetail" :type="tenantStatusTagType(formDetail.status)" size="small">
                {{ tenantStatusLabel(formDetail.status) }}
              </GrowTag>
            </div>
          </GrowFormItem>
          <GrowFormItem class="tenant-form-dialog__full" label="服务期限">
            <div class="tenant-form-dialog__readonly">
              {{ formDetail ? formatServicePeriod(formDetail) : '-' }}
            </div>
          </GrowFormItem>
        </div>
      </section>

      <section class="tenant-form-dialog__section">
        <h4 class="tenant-form-dialog__section-title">基本信息</h4>
        <div class="tenant-form-dialog__grid">
          <GrowFormItem v-if="formMode !== 'edit'" label="租户编码" prop="tenantCode">
            <GrowInput
              v-model="formModel.tenantCode"
              maxlength="12"
              clearable
              placeholder="5～12 位大小写字母、数字或下划线"
              :disabled="formMode === 'view'"
            />
          </GrowFormItem>
          <GrowFormItem label="租户名称" prop="tenantName">
            <GrowInput
              v-model="formModel.tenantName"
              maxlength="128"
              clearable
              placeholder="2-128 位"
              :disabled="formMode === 'view'"
            />
          </GrowFormItem>
          <GrowFormItem label="租户简称" prop="shortName">
            <GrowInput
              v-model="formModel.shortName"
              maxlength="64"
              clearable
              :disabled="formMode === 'view'"
            />
          </GrowFormItem>
        </div>
      </section>

      <section class="tenant-form-dialog__section tenant-form-dialog__section--last">
        <h4 class="tenant-form-dialog__section-title">联系信息</h4>
        <div class="tenant-form-dialog__grid">
          <GrowFormItem label="联系人姓名" prop="contactName">
            <GrowInput v-model="formModel.contactName" maxlength="64" clearable :disabled="formMode === 'view'" />
          </GrowFormItem>
          <GrowFormItem label="联系人手机号" prop="contactMobile">
            <GrowInput v-model="formModel.contactMobile" maxlength="32" clearable :disabled="formMode === 'view'" />
          </GrowFormItem>
        </div>
      </section>

      </GrowForm>
    </GrowScrollbar>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="formVisible = false">{{ formMode === 'view' ? '关闭' : '取消' }}</GrowButton>
        <GrowButton v-if="formMode !== 'view'" type="primary" :loading="formSubmitting" @click="submitForm">
          确定
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatServicePeriod, tenantStatusLabel, tenantStatusTagType } from '../use/helpers'
import { useTenantForm } from '../use/useTenantForm'

const emit = defineEmits<{ success: [] }>()

const {
  formVisible,
  formMode,
  formSubmitting,
  formRef,
  formModel,
  formDetail,
  formRules,
  openCreate,
  openEdit,
  openView,
  submitForm,
} = useTenantForm({ onSuccess: () => emit('success') })

const formTitle = computed(() => {
  if (formMode.value === 'create') return '新增租户'
  if (formMode.value === 'edit') return '编辑租户'
  return '查看租户'
})

defineExpose({ openCreate, openEdit, openView })
</script>

<style scoped>
.tenant-form-dialog__form {
  padding-right: 12px;
}

.tenant-form-dialog__section {
  margin-bottom: 18px;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--layout-border-color);
}

.tenant-form-dialog__section--last {
  margin-bottom: 0;
  border-bottom: 0;
}

.tenant-form-dialog__section-title {
  margin: 0 0 12px;
  color: var(--text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.tenant-form-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
}

.tenant-form-dialog__full {
  grid-column: 1 / -1;
}

.tenant-form-dialog__readonly {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.tenant-form-dialog__form :deep(.el-select),
.tenant-form-dialog__form :deep(.el-date-editor) {
  width: 100%;
}

@media (max-width: 768px) {
  .tenant-form-dialog__grid {
    grid-template-columns: 1fr;
  }

  .tenant-form-dialog__full {
    grid-column: auto;
  }
}
</style>

<style>
.el-overlay-dialog:has(.tenant-form-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tenant-form-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 0;
  overflow: hidden;
}

.tenant-form-dialog .el-dialog__header,
.tenant-form-dialog .el-dialog__footer {
  flex-shrink: 0;
}

.tenant-form-dialog .el-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
</style>
