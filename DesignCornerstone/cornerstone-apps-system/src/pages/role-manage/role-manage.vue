<template>
  <div class="role-manage">
    <GrowRow justify="space-between" class="role-manage__toolbar">
      <GrowCol :span="14">
        <div class="role-manage__toolbar-left">
          <GrowSpace>
            <GrowButton type="primary" @click="openCreate()">新增</GrowButton>
          </GrowSpace>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="role-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="role-manage__table">
      <GrowWatchBox class="role-manage__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            row-key="id"
            border
          >
            <GrowTableColumn
              v-for="col in leafColumns"
              :key="String(col.field)"
              :prop="String(col.field)"
              :label="col.title"
              :width="col.width"
              :min-width="col.minWidth || (col.width ? undefined : 120)"
              :fixed="col.fixed"
              :show-overflow-tooltip="col.field !== 'actions' && col.field !== 'enabled'"
            >
              <template #default="{ row }">
                <template v-if="col.field === 'name'">
                  <span class="role-manage__name">
                    {{ row.name }}
                    <GrowTag v-if="row.builtIn" type="info" size="small">内置</GrowTag>
                  </span>
                </template>
                <template v-else-if="col.field === 'dataPermCount'">
                  {{ row.dataPermCount ? `${row.dataPermCount} 个菜单` : '-' }}
                </template>
                <template v-else-if="col.field === 'memberCount'">
                  <GrowButton link type="primary" @click="openMemberList(row)">
                    {{ row.memberCount }}
                  </GrowButton>
                </template>
                <template v-else-if="col.field === 'enabled'">
                  <GrowTooltip
                    :content="row.builtIn ? '超级管理员不能停用' : (row.enabled ? '停用' : '启用')"
                    placement="top"
                  >
                    <span class="role-manage__switch">
                      <GrowSwitch
                        :model-value="row.enabled"
                        size="small"
                        :disabled="row.builtIn"
                        @update:model-value="(value) => onToggleEnabled(row, Boolean(value))"
                      />
                    </span>
                  </GrowTooltip>
                </template>
                <template v-else-if="col.field === 'updatedAt'">
                  {{ formatTime(row.updatedAt) }}
                </template>
                <template v-else-if="col.field === 'actions'">
                  <div class="role-manage__actions">
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton class="role-manage__icon-btn" link type="primary" @click="openEdit(row)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip :content="row.builtIn ? '查看超级管理员账号' : '绑定账号'" placement="top">
                      <GrowButton class="role-manage__icon-btn" link type="primary" @click="openMembers(row)">
                        <GrowIconify :icon="row.builtIn ? 'ant-design:team-outlined' : 'ant-design:user-add-outlined'" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="数据权限" placement="top">
                      <GrowButton class="role-manage__icon-btn" link type="primary" @click="openDataPerm(row)">
                        <GrowIconify icon="ant-design:safety-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="菜单和功能" placement="top">
                      <GrowButton class="role-manage__icon-btn" link type="primary" @click="openMenuPerm(row)">
                        <GrowIconify icon="ant-design:apartment-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="详情" placement="top">
                      <GrowButton class="role-manage__icon-btn" link type="primary" @click="openDetail(row)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="删除" placement="top">
                      <GrowButton
                        class="role-manage__icon-btn"
                        link
                        type="danger"
                        :disabled="row.enabled || row.builtIn"
                        :loading="deleteLoading && deleteTarget?.id === row.id"
                        @click="onDelete(row)"
                      >
                        <GrowIconify icon="ant-design:delete-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                </template>
                <template v-else>
                  {{ row[col.field] ?? '-' }}
                </template>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <div class="role-manage__pager">
      <GrowPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="loadList"
        @size-change="onSizeChange"
      />
    </div>

    <GrowDialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增角色' : '编辑角色'"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <GrowForm
        ref="formRef"
        class="role-manage__form"
        :model="formModel"
        :rules="formRules"
        label-width="72px"
      >
        <GrowFormItem label="名称" prop="name">
          <GrowInput v-model="formModel.name" maxlength="64" clearable placeholder="角色名称" />
        </GrowFormItem>
        <GrowFormItem label="编码" prop="code">
          <GrowInput
            v-model="formModel.code"
            maxlength="64"
            clearable
            placeholder="角色唯一编码"
          />
        </GrowFormItem>
        <GrowFormItem label="排序" prop="sort">
          <GrowInputNumber
            v-model="formModel.sort"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </GrowFormItem>
        <GrowFormItem label="角色描述" prop="remark">
          <GrowInput
            v-model="formModel.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </GrowFormItem>
      </GrowForm>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="formVisible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="formSubmitting" @click="submitForm">
            确定
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <GrowDialog
      v-model="deleteVisible"
      title="删除确认"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <p class="role-manage__delete-hint">
        确认删除角色「{{ deleteTarget?.name }}」？删除后不可恢复。
      </p>
      <dl v-if="deleteImpact" class="role-manage__delete-impact">
        <div><dt>绑定账号</dt><dd>{{ deleteImpact.memberCount }} 个</dd></div>
        <div><dt>菜单权限</dt><dd>{{ deleteImpact.menuCount }} 项</dd></div>
        <div><dt>功能权限</dt><dd>{{ deleteImpact.functionCount }} 项</dd></div>
        <div><dt>数据权限</dt><dd>{{ deleteImpact.dataPermCount }} 项</dd></div>
      </dl>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="deleteVisible = false">取消</GrowButton>
          <GrowButton type="danger" :loading="deleteSubmitting" @click="confirmDelete">
            删除
          </GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>

    <RoleMemberDrawer ref="memberDrawerRef" @success="loadList" />
    <RoleDataPermDrawer ref="dataPermDrawerRef" @success="loadList" />
    <RoleMenuPermDrawer ref="menuPermDrawerRef" @success="loadList" />
    <RoleDetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import type { SystemRoleListItem } from '../../types/systemRole'
import RoleMemberDrawer from './components/RoleMemberDrawer.vue'
import RoleDataPermDrawer from './components/RoleDataPermDrawer.vue'
import RoleMenuPermDrawer from './components/RoleMenuPermDrawer.vue'
import RoleDetailDrawer from './components/RoleDetailDrawer.vue'
import { useRoleManage } from './use/useRoleManage'

defineOptions({
  name: 'RoleManagePage',
})

const memberDrawerRef = ref<{
  open: (row: SystemRoleListItem, options?: { readonly?: boolean }) => void
} | null>(null)
const dataPermDrawerRef = ref<{ open: (row: SystemRoleListItem) => void } | null>(null)
const menuPermDrawerRef = ref<{ open: (row: SystemRoleListItem) => void } | null>(null)
const detailDrawerRef = ref<{ open: (row: SystemRoleListItem) => void } | null>(null)

function openMembers(row: SystemRoleListItem) {
  memberDrawerRef.value?.open(row, { readonly: Boolean(row.builtIn) })
}

function openMemberList(row: SystemRoleListItem) {
  memberDrawerRef.value?.open(row, { readonly: true })
}

function openDataPerm(row: SystemRoleListItem) {
  dataPermDrawerRef.value?.open(row)
}

function openMenuPerm(row: SystemRoleListItem) {
  menuPermDrawerRef.value?.open(row)
}

function openDetail(row: SystemRoleListItem) {
  detailDrawerRef.value?.open(row)
}

const {
  tableData,
  total,
  page,
  pageSize,
  searchList,
  tableColumns,
  leafColumns,
  loadList,
  onSearch,
  onColumnsConfirm,
  onSizeChange,
  formVisible,
  formMode,
  formSubmitting,
  formRef,
  formModel,
  formRules,
  openCreate,
  openEdit,
  submitForm,
  deleteVisible,
  deleteLoading,
  deleteSubmitting,
  deleteTarget,
  deleteImpact,
  onToggleEnabled,
  onDelete,
  confirmDelete,
  formatTime,
} = useRoleManage()
</script>

<style scoped>
.role-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.role-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.role-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.role-manage__hint {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.role-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.role-manage__watch {
  height: 100%;
  min-height: 0;
}

.role-manage__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background: var(--component-background-color);
}

.role-manage__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.role-manage__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.role-manage__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.role-manage__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.role-manage__switch {
  display: inline-flex;
  align-items: center;
}

.role-manage__delete-hint {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.role-manage__delete-impact {
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--layout-color);
}

.role-manage__delete-impact div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.role-manage__delete-impact dt,
.role-manage__delete-impact dd {
  margin: 0;
}

.role-manage__delete-impact dt {
  color: var(--text-color-secondary);
}

.role-manage__form :deep(.el-input-number),
.role-manage__form :deep(.el-select) {
  width: 100%;
}
</style>
