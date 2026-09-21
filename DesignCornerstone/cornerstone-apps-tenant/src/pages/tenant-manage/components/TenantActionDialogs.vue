<template>
  <GrowDialog
    v-model="periodVisible"
    :title="periodMode === 'trial' ? '试用' : '开通'"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <p class="tenant-action-dialogs__hint">
      开始日期锁定为今天 {{ todayDate() }}，结束日不得早于今天。
    </p>
    <GrowForm ref="periodFormRef" :model="periodForm" :rules="periodRules" label-width="92px">
      <GrowFormItem label="开始日期">
        <GrowInput :model-value="todayDate()" disabled />
      </GrowFormItem>
      <GrowFormItem label="结束日期" prop="expiredOn">
        <GrowDatePicker
          v-model="periodForm.expiredOn"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结束日"
          :disabled-date="disablePastPeriodDate"
          style="width: 100%"
        />
      </GrowFormItem>
      <GrowFormItem label="宽限天数" prop="graceDays">
        <GrowInputNumber
          v-model="periodForm.graceDays"
          :min="0"
          :precision="0"
          controls-position="right"
          style="width: 100%"
        />
        <div class="tenant-action-dialogs__form-tip">服务到期后继续有效的天数</div>
      </GrowFormItem>
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="periodForm.remark" type="textarea" :rows="3" maxlength="200" />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="periodVisible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="periodSubmitting" @click="submitPeriod">确定</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog v-model="disableVisible" title="停用租户" width="440px" append-to-body destroy-on-close>
    <p class="tenant-action-dialogs__hint">
      停用后该租户立即不可登录，须再次试用或开通才能恢复。
    </p>
    <GrowForm ref="disableFormRef" :model="disableForm" label-width="72px">
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="disableForm.remark" type="textarea" :rows="3" maxlength="200" />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="disableVisible = false">取消</GrowButton>
        <GrowButton type="warning" :loading="disableSubmitting" @click="submitDisable">停用</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog v-model="codeVisible" title="修改租户编码" width="520px" append-to-body destroy-on-close>
    <p class="tenant-action-dialogs__hint">
      租户编码是登录组织代码。修改后，该租户下所有账号必须使用新的组织代码登录。是否确认修改？
    </p>
    <GrowForm ref="codeFormRef" :model="codeForm" :rules="codeRules" label-width="92px">
      <GrowFormItem label="当前编码">
        <GrowInput :model-value="codeTarget?.tenantCode" disabled />
      </GrowFormItem>
      <GrowFormItem label="新编码" prop="newTenantCode">
        <GrowInput v-model="codeForm.newTenantCode" maxlength="12" clearable placeholder="5～12 位大小写字母、数字或下划线" />
      </GrowFormItem>
      <GrowFormItem label="确认编码" prop="confirmTenantCode">
        <GrowInput v-model="codeForm.confirmTenantCode" maxlength="12" clearable placeholder="须等于新编码" />
      </GrowFormItem>
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="codeForm.remark" type="textarea" :rows="3" maxlength="200" />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="codeVisible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="codeSubmitting" @click="submitCode">确认修改</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog v-model="deleteVisible" title="删除租户" width="480px" append-to-body destroy-on-close>
    <p class="tenant-action-dialogs__hint">
      删除为逻辑删除，不可恢复，并立即失效该租户登录态。数据不会自动清空。
    </p>
    <GrowForm ref="deleteFormRef" :model="deleteForm" :rules="deleteRules" label-width="92px">
      <GrowFormItem label="确认编码" prop="confirmTenantCode">
        <GrowInput v-model="deleteForm.confirmTenantCode" :placeholder="deleteTarget?.tenantCode" />
      </GrowFormItem>
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="deleteForm.remark" type="textarea" :rows="3" maxlength="200" />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="deleteVisible = false">取消</GrowButton>
        <GrowButton type="danger" :loading="deleteSubmitting" @click="submitDelete">删除</GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog
    v-model="clearVisible"
    class="tenant-action-dialogs__clear-dialog"
    title="清空租户数据"
    width="520px"
    append-to-body
    destroy-on-close
  >
    <p class="tenant-action-dialogs__hint">
      将删除该租户下账号、组织、普通角色、自建菜单和业务数据，保留租户记录、授权和租户管理员角色。
    </p>
    <GrowScrollbar height="100%" class="tenant-action-dialogs__clear-scrollbar" always>
      <div v-if="clearLoading" class="tenant-action-dialogs__loading">加载影响范围…</div>
      <dl v-else-if="clearImpact" class="tenant-action-dialogs__impact">
        <div><dt>账号</dt><dd>{{ clearImpact.accountCount }}</dd></div>
        <div><dt>部门</dt><dd>{{ clearImpact.deptCount }}</dd></div>
        <div><dt>岗位</dt><dd>{{ clearImpact.postCount }}</dd></div>
        <div><dt>职级</dt><dd>{{ clearImpact.positionCount }}</dd></div>
        <div><dt>人员</dt><dd>{{ clearImpact.personCount }}</dd></div>
        <div><dt>普通角色</dt><dd>{{ clearImpact.roleCount }}</dd></div>
        <div><dt>自建菜单</dt><dd>{{ clearImpact.selfMenuCount }}</dd></div>
        <div><dt>低代码页面</dt><dd>{{ clearImpact.lowcodePageCount }}</dd></div>
        <div><dt>报表</dt><dd>{{ clearImpact.reportCount }}</dd></div>
        <div><dt>流程</dt><dd>{{ clearImpact.processCount }}</dd></div>
      </dl>
    </GrowScrollbar>
    <GrowForm ref="clearFormRef" class="tenant-action-dialogs__clear-form" :model="clearForm" :rules="clearRules" label-width="92px">
      <GrowFormItem label="确认编码" prop="confirmTenantCode">
        <GrowInput v-model="clearForm.confirmTenantCode" :placeholder="clearTarget?.tenantCode" />
      </GrowFormItem>
      <GrowFormItem label="备注" prop="remark">
        <GrowInput v-model="clearForm.remark" type="textarea" :rows="3" maxlength="200" />
      </GrowFormItem>
    </GrowForm>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="clearVisible = false">取消</GrowButton>
        <GrowButton type="danger" :disabled="clearLoading" :loading="clearSubmitting" @click="submitClear">
          确认清空
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>

  <GrowDialog
    v-model="grantVisible"
    class="tenant-action-dialogs__grant-dialog"
    title="租户授权"
    width="760px"
    append-to-body
    destroy-on-close
  >
    <p class="tenant-action-dialogs__hint">
      {{ grantDetail?.tenantName }}（{{ grantDetail?.tenantCode }}）
      · 最近授权：{{ formatTime(grantDetail?.grantedAt) }}
      {{ grantDetail?.grantedBy ? ` · ${grantDetail.grantedBy}` : '' }}
    </p>
    <div class="tenant-action-dialogs__grant-options">
      <span>勾选菜单时同时授权所有按钮和列权限</span>
      <GrowSwitch
        :model-value="grantFunctionsWithMenu"
        @update:model-value="(value) => toggleGrantFunctionsWithMenu(Boolean(value))"
      />
    </div>
    <div v-if="grantLoading" class="tenant-action-dialogs__loading">加载应用功能…</div>
    <div v-else class="tenant-action-dialogs__grant">
      <aside class="tenant-action-dialogs__grant-list">
        <div class="tenant-action-dialogs__grant-panel-title">应用功能</div>
        <GrowScrollbar height="360px">
          <div
            v-for="item in grantApplications"
            :key="item.id"
            class="tenant-action-dialogs__grant-application"
            :class="{ 'is-active': grantActiveMenu?.id === item.id }"
            @click="onGrantApplicationClick(item)"
          >
            <GrowCheckbox
              :model-value="grantMenuIds.includes(item.id)"
              @click.stop
              @update:model-value="(value) => toggleGrantApplication(item.id, Boolean(value))"
            />
            <span>{{ item.title }}</span>
          </div>
          <div v-if="!grantApplications.length" class="tenant-action-dialogs__empty">暂无应用功能</div>
        </GrowScrollbar>
      </aside>
      <main class="tenant-action-dialogs__grant-main">
        <div class="tenant-action-dialogs__grant-header">
          <span class="tenant-action-dialogs__grant-panel-title">功能管理</span>
          <GrowCheckbox
            v-if="grantPermissionTab === 'functions'"
            :model-value="grantAllActiveFunctionsChecked"
            :indeterminate="grantSomeActiveFunctionsChecked"
            :disabled="!grantActiveFunctions.length"
            @update:model-value="(value) => toggleAllGrantActiveFunctions(Boolean(value))"
          >
            全选
          </GrowCheckbox>
          <GrowCheckbox
            v-else
            :model-value="grantAllActiveColumnsChecked"
            :indeterminate="grantSomeActiveColumnsChecked"
            :disabled="!grantToggleableActiveColumns.length"
            @update:model-value="(value) => toggleAllGrantActiveColumns(Boolean(value))"
          >
            全选
          </GrowCheckbox>
        </div>
        <template v-if="grantActiveMenu">
          <div class="tenant-action-dialogs__grant-title">{{ grantActiveMenu.title }}</div>
          <GrowTabs v-model="grantPermissionTab" class="tenant-action-dialogs__grant-tabs">
            <GrowTabPane name="functions" :label="`按钮权限（${grantActiveFunctions.length}）`" />
            <GrowTabPane name="columns" :label="`列权限（${grantActiveColumns.length}）`" />
          </GrowTabs>
          <GrowScrollbar height="260px">
            <template v-if="grantPermissionTab === 'functions'">
              <label
                v-for="item in grantActiveFunctions"
                :key="item.id"
                class="tenant-action-dialogs__function"
              >
                <GrowCheckbox
                  :model-value="grantFunctionIds.includes(item.id)"
                  @update:model-value="(value) => toggleGrantFunction(item.id, Boolean(value))"
                />
                <span>{{ item.title }}</span>
                <span class="tenant-action-dialogs__function-code">{{ item.code }}</span>
              </label>
              <div v-if="!grantActiveFunctions.length" class="tenant-action-dialogs__empty">
                该应用功能暂无按钮权限
              </div>
            </template>
            <template v-else>
              <section
                v-for="group in grantActiveColumnGroups"
                :key="group.code"
                class="tenant-action-dialogs__column-group"
              >
                <div class="tenant-action-dialogs__column-group-title">{{ group.title }}</div>
                <label
                  v-for="item in group.items"
                  :key="item.id"
                  class="tenant-action-dialogs__function"
                >
                  <GrowCheckbox
                    :model-value="grantColumnIds.includes(item.id)"
                    :disabled="!item.enabled"
                    @update:model-value="(value) => toggleGrantColumn(item.id, Boolean(value))"
                  />
                  <span>{{ item.title }}</span>
                  <span class="tenant-action-dialogs__function-code">{{ item.code }}</span>
                  <GrowTag v-if="!item.enabled" type="info" size="small">已停用</GrowTag>
                </label>
              </section>
              <div v-if="!grantActiveColumns.length" class="tenant-action-dialogs__empty">
                该应用功能暂无列权限定义
              </div>
            </template>
          </GrowScrollbar>
        </template>
        <div v-else class="tenant-action-dialogs__empty">请选择应用功能查看权限</div>
      </main>
    </div>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="grantVisible = false">取消</GrowButton>
        <GrowButton type="primary" :disabled="grantLoading" :loading="grantSubmitting" @click="submitGrant">
          保存授权
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { formatTime } from '../use/helpers'
import { useTenantActions } from '../use/useTenantActions'

const emit = defineEmits<{ success: [] }>()

const {
  todayDate,
  periodVisible,
  periodMode,
  periodSubmitting,
  periodFormRef,
  periodForm,
  periodRules,
  disablePastPeriodDate,
  openPeriod,
  submitPeriod,
  disableVisible,
  disableSubmitting,
  disableFormRef,
  disableForm,
  openDisable,
  submitDisable,
  codeVisible,
  codeSubmitting,
  codeTarget,
  codeFormRef,
  codeForm,
  codeRules,
  openCode,
  submitCode,
  deleteVisible,
  deleteSubmitting,
  deleteTarget,
  deleteFormRef,
  deleteForm,
  deleteRules,
  openDelete,
  submitDelete,
  clearVisible,
  clearLoading,
  clearSubmitting,
  clearTarget,
  clearImpact,
  clearFormRef,
  clearForm,
  clearRules,
  openClear,
  submitClear,
  grantVisible,
  grantLoading,
  grantSubmitting,
  grantDetail,
  grantApplications,
  grantMenuIds,
  grantFunctionIds,
  grantColumnIds,
  grantActiveMenu,
  grantActiveFunctions,
  grantActiveColumns,
  grantToggleableActiveColumns,
  grantActiveColumnGroups,
  grantPermissionTab,
  grantFunctionsWithMenu,
  grantAllActiveFunctionsChecked,
  grantSomeActiveFunctionsChecked,
  grantAllActiveColumnsChecked,
  grantSomeActiveColumnsChecked,
  openGrant,
  toggleGrantApplication,
  onGrantApplicationClick,
  toggleGrantFunction,
  toggleGrantFunctionsWithMenu,
  toggleAllGrantActiveFunctions,
  toggleGrantColumn,
  toggleAllGrantActiveColumns,
  submitGrant,
} = useTenantActions({ onSuccess: () => emit('success') })

defineExpose({ openPeriod, openDisable, openCode, openDelete, openClear, openGrant })
</script>

<style scoped>
.tenant-action-dialogs__hint {
  margin: 0 0 14px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.tenant-action-dialogs__form-tip {
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.tenant-action-dialogs__loading,
.tenant-action-dialogs__empty {
  padding: 24px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.tenant-action-dialogs__impact {
  margin: 0;
  padding: 10px 12px;
}

.tenant-action-dialogs__impact div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.tenant-action-dialogs__impact dt,
.tenant-action-dialogs__impact dd {
  margin: 0;
}

.tenant-action-dialogs__impact dt {
  color: var(--text-color-secondary);
}

.tenant-action-dialogs__clear-form {
  flex-shrink: 0;
  margin-top: 16px;
}

.tenant-action-dialogs__clear-scrollbar {
  flex: 1;
  min-height: 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
}

.tenant-action-dialogs__clear-scrollbar :deep(.el-scrollbar__wrap) {
  overscroll-behavior: contain;
}

.tenant-action-dialogs__grant {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 360px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.tenant-action-dialogs__grant-options,
.tenant-action-dialogs__grant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tenant-action-dialogs__grant-options {
  margin-bottom: 12px;
}

.tenant-action-dialogs__grant-list {
  border-right: 1px solid var(--layout-border-color);
  padding: 8px;
}

.tenant-action-dialogs__grant-main {
  padding: 12px 16px;
  overflow: hidden;
}

.tenant-action-dialogs__grant-panel-title {
  font-weight: 600;
}

.tenant-action-dialogs__grant-list .tenant-action-dialogs__grant-panel-title {
  padding: 4px 4px 12px;
}

.tenant-action-dialogs__grant-application {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  cursor: pointer;
}

.tenant-action-dialogs__grant-application:hover,
.tenant-action-dialogs__grant-application.is-active {
  background: var(--color-primary-a08, var(--layout-color));
}

.tenant-action-dialogs__grant-header {
  margin-bottom: 12px;
}

.tenant-action-dialogs__grant-title {
  margin-bottom: 8px;
  color: var(--text-color-secondary);
}

.tenant-action-dialogs__grant-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.tenant-action-dialogs__grant-tabs :deep(.el-tabs__content) {
  display: none;
}

.tenant-action-dialogs__column-group + .tenant-action-dialogs__column-group {
  margin-top: 12px;
}

.tenant-action-dialogs__column-group-title {
  margin-bottom: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
  font-weight: 600;
}

.tenant-action-dialogs__function {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  cursor: pointer;
}

.tenant-action-dialogs__function-code {
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>

<style>
.el-overlay-dialog:has(.tenant-action-dialogs__clear-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tenant-action-dialogs__clear-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: min(600px, calc(100vh - 48px));
  height: min(600px, calc(100dvh - 48px));
  max-width: calc(100vw - 32px);
  margin: 0;
  overflow: hidden;
}

.tenant-action-dialogs__clear-dialog .el-dialog__header,
.tenant-action-dialogs__clear-dialog .el-dialog__footer,
.tenant-action-dialogs__clear-dialog .tenant-action-dialogs__hint {
  flex-shrink: 0;
}

.tenant-action-dialogs__clear-dialog .el-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.el-overlay-dialog:has(.tenant-action-dialogs__grant-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tenant-action-dialogs__grant-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 0;
  overflow: hidden;
}

.tenant-action-dialogs__grant-dialog .el-dialog__header,
.tenant-action-dialogs__grant-dialog .el-dialog__footer {
  flex-shrink: 0;
}

.tenant-action-dialogs__grant-dialog .el-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
</style>
