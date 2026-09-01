<template>
  <div class="post-manage">
    <GrowRow justify="space-between" class="post-manage__toolbar">
      <GrowCol :span="14">
        <div class="post-manage__toolbar-left">
          <GrowButton type="primary" @click="formRef?.openCreate()">新增岗位</GrowButton>
        </div>
      </GrowCol>
      <GrowCol :span="10">
        <div class="post-manage__toolbar-options">
          <GrowSearchBar :search="searchList" @search="onSearch" />
          <GrowColumnBar :columns="tableColumns" @confirm="onColumnsConfirm" />
        </div>
      </GrowCol>
    </GrowRow>

    <div class="post-manage__table">
      <GrowWatchBox class="post-manage__watch">
        <template #default="{ height }">
          <GrowTable
            v-if="height > 0"
            :data="tableData"
            :height="`${height}px`"
            row-key="rowKey"
            border
            :span-method="spanMethod"
            :row-class-name="rowClassName"
          >
            <GrowTableColumn v-if="isColumnVisible('deptName')" prop="deptName" label="部门" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="post-manage__dept" :style="{ paddingLeft: `${row.deptLevel * 16}px` }">
                  <button
                    v-if="row.hasChildren"
                    type="button"
                    class="post-manage__fold"
                    :title="row.expanded ? '折叠' : '展开'"
                    @click.stop="toggleDeptExpand(row.deptId)"
                  >
                    <GrowIconify
                      :icon="row.expanded ? 'ant-design:caret-down-outlined' : 'ant-design:caret-right-outlined'"
                      :size="12"
                    />
                  </button>
                  <span v-else class="post-manage__fold-placeholder" />
                  <GrowIconify icon="ant-design:folder-open-outlined" :size="16" />
                  {{ row.deptName }}
                </span>
              </template>
            </GrowTableColumn>
            <GrowTableColumn v-if="isColumnVisible('deptCode')" prop="deptCode" label="部门编码" min-width="120" show-overflow-tooltip />
            <GrowTableColumn v-if="isColumnVisible('parentDeptName')" prop="parentDeptName" label="上级部门" min-width="120" show-overflow-tooltip />

            <PostGroupColumn v-if="postGroupVisible" label="岗位" align="center" header-align="center">
              <GrowTableColumn v-if="isColumnVisible('postName')" prop="postName" label="名称" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">
                  <GrowButton v-if="row.post" link type="primary" @click="detailRef?.open(row.post)">
                    {{ row.post.name }}
                  </GrowButton>
                  <span v-else class="post-manage__empty">暂无直属岗位</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('postCode')" prop="postCode" label="编码" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ row.post?.code || '-' }}</template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('occupied')" prop="occupied" label="全部" width="88" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    link
                    type="primary"
                    @click="memberRef?.open(row.post, 'occupied')"
                  >
                    {{ formatOccupiedRatio(row.post.occupied, row.post.formalHeadcount + row.post.contractorHeadcount) }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('formalHeadcount')" prop="formalHeadcount" label="全职" width="88" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    link
                    type="primary"
                    @click="memberRef?.open(row.post, 'formal')"
                  >
                    {{ formatOccupiedRatio(row.post.formalOccupied, row.post.formalHeadcount) }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('partTimeHeadcount')" prop="partTimeHeadcount" label="兼职" width="88" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    link
                    type="primary"
                    @click="memberRef?.open(row.post, 'partTime')"
                  >
                    {{ formatOccupiedRatio(row.post.partTimeOccupied, row.post.partTimeHeadcount) }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('internHeadcount')" prop="internHeadcount" label="实习" width="88" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    link
                    type="primary"
                    @click="memberRef?.open(row.post, 'intern')"
                  >
                    {{ formatOccupiedRatio(row.post.internOccupied, row.post.internHeadcount) }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('contractorHeadcount')" prop="contractorHeadcount" label="外包" width="88" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    link
                    type="primary"
                    @click="memberRef?.open(row.post, 'contractor')"
                  >
                    {{ formatOccupiedRatio(row.post.contractorOccupied, row.post.contractorHeadcount) }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('overstaffed')" prop="overstaffed" label="超编" width="80" align="center">
                <template #default="{ row }">
                  <GrowButton
                    v-if="row.post"
                    :class="{ 'post-manage__over': row.post.overstaffed > 0 }"
                    link
                    :type="row.post.overstaffed > 0 ? 'danger' : 'primary'"
                    @click="memberRef?.open(row.post, 'overstaffed')"
                  >
                    {{ row.post.overstaffed }}
                  </GrowButton>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('postEnabled')" prop="postEnabled" label="岗位状态" width="96" align="center">
                <template #default="{ row }">
                  <GrowTag v-if="row.post" :type="row.post.enabled ? 'success' : 'info'" size="small">
                    {{ row.post.enabled ? '启用' : '停用' }}
                  </GrowTag>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
              <GrowTableColumn v-if="isColumnVisible('postActions')" prop="postActions" label="操作" width="128" align="center">
                <template #default="{ row }">
                  <div v-if="row.post" class="post-manage__actions">
                    <GrowTooltip
                      :content="row.post.activePersonCount > 0 && row.post.enabled ? '有效任职，不能停用' : (row.post.enabled ? '停用' : '启用')"
                      placement="top"
                    >
                      <span>
                        <GrowButton
                          class="post-manage__icon-btn"
                          link
                          :type="row.post.enabled ? 'warning' : 'primary'"
                          :disabled="row.post.enabled && row.post.activePersonCount > 0"
                          @click="onToggleEnabled(row.post, !row.post.enabled)"
                        >
                          <GrowIconify
                            :icon="row.post.enabled ? 'ant-design:stop-outlined' : 'ant-design:play-circle-outlined'"
                            :size="16"
                          />
                        </GrowButton>
                      </span>
                    </GrowTooltip>
                    <GrowTooltip content="详情" placement="top">
                      <GrowButton class="post-manage__icon-btn" link type="primary" @click="detailRef?.open(row.post)">
                        <GrowIconify icon="ant-design:profile-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                    <GrowTooltip content="编辑" placement="top">
                      <GrowButton class="post-manage__icon-btn" link type="primary" @click="formRef?.openEdit(row.post)">
                        <GrowIconify icon="ant-design:edit-outlined" :size="16" />
                      </GrowButton>
                    </GrowTooltip>
                  </div>
                  <span v-else>-</span>
                </template>
              </GrowTableColumn>
            </PostGroupColumn>

            <GrowTableColumn v-if="isColumnVisible('directPostCount')" prop="directPostCount" label="直属岗位数" width="110" align="center" />
            <GrowTableColumn v-if="isColumnVisible('deptStatus')" prop="deptStatus" label="部门状态" width="96" align="center">
              <template #default="{ row }">
                <GrowTag :type="row.deptEnabled ? 'success' : 'info'" size="small">
                  {{ row.deptEnabled ? '启用' : '停用' }}
                </GrowTag>
              </template>
            </GrowTableColumn>
            <GrowTableColumn v-if="isColumnVisible('deptActions')" prop="deptActions" label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <GrowTooltip
                  :content="row.deptEnabled ? '新增岗位' : '停用部门不能新增岗位'"
                  placement="top"
                >
                  <span>
                    <GrowButton
                      class="post-manage__icon-btn"
                      link
                      type="primary"
                      :disabled="!row.deptEnabled"
                      @click="formRef?.openCreate(row.deptId)"
                    >
                      <GrowIconify icon="ant-design:plus-outlined" :size="16" />
                    </GrowButton>
                  </span>
                </GrowTooltip>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </template>
      </GrowWatchBox>
    </div>

    <PostFormDrawer ref="formRef" @success="refresh" />
    <PostDetailDrawer ref="detailRef" />
    <PostMemberDialog ref="memberRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { GrowSearchBar } from '@grow-admin-rock/components/search-bar'
import { GrowColumnBar } from '@grow-admin-rock/components/column-bar'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import type { SystemPostListItem } from '../../types/systemPost'
import PostFormDrawer from './components/PostFormDrawer.vue'
import PostDetailDrawer from './components/PostDetailDrawer.vue'
import PostGroupColumn from './components/PostGroupColumn.vue'
import PostMemberDialog from './components/PostMemberDialog.vue'
import { formatOccupiedRatio, type PostMemberMetric } from './use/helpers'
import { usePostManage } from './use/usePostManage'

defineOptions({
  name: 'PostManagePage',
})

const formRef = ref<{ openCreate: (deptId?: string) => void; openEdit: (row: SystemPostListItem) => void } | null>(null)
const detailRef = ref<{ open: (row: SystemPostListItem) => void } | null>(null)
const memberRef = ref<{ open: (row: SystemPostListItem, metric: PostMemberMetric) => void } | null>(null)

const {
  tableData,
  searchList,
  tableColumns,
  postGroupVisible,
  isColumnVisible,
  refresh,
  onSearch,
  onColumnsConfirm,
  onToggleEnabled,
  toggleDeptExpand,
  spanMethod,
  rowClassName,
} = usePostManage()
</script>

<style scoped>
.post-manage {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
}

.post-manage__toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-background-color);
}

.post-manage__toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.post-manage__toolbar-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.post-manage__table {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--component-background-color);
}

.post-manage__watch {
  height: 100%;
  min-height: 0;
}

.post-manage__dept {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.post-manage__fold,
.post-manage__fold-placeholder {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-color-secondary);
}

.post-manage__fold {
  cursor: pointer;
}

.post-manage__fold:hover {
  color: var(--el-color-primary);
}

.post-manage__empty {
  color: var(--text-color-secondary);
}

.post-manage__actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.post-manage__icon-btn {
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

.post-manage__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}

.post-manage__over {
  font-weight: 600;
}

.post-manage__table :deep(.el-table .cell) {
  font-size: 13px;
}

.post-manage__table :deep(.el-table th.el-table__cell) {
  background: var(--el-fill-color-light);
}

.post-manage__table :deep(.el-table td.el-table__cell) {
  vertical-align: middle;
}

.post-manage__table :deep(.post-manage__row--disabled) {
  color: var(--text-color-secondary);
}
</style>
