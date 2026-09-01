<template>
  <GrowDrawer
    v-model="visible"
    :title="department ? `迁移部门 · ${department.name}` : '迁移部门'"
    size="560px"
    append-to-body
    destroy-on-close
    class="dept-migrate"
  >
    <GrowWatchBox class="dept-migrate__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-if="department" class="dept-migrate__body">
            <GrowForm label-width="88px" class="dept-migrate__form">
              <GrowFormItem label="当前上级">
                <GrowInput :model-value="department.parentName || '顶级部门'" disabled />
              </GrowFormItem>
              <GrowFormItem label="迁移后上级">
                <GrowTreeSelect
                  v-model="targetParentId"
                  :data="parentTree"
                  :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
                  check-strictly
                  clearable
                  filterable
                  default-expand-all
                  placeholder="不选则为顶级部门"
                />
              </GrowFormItem>
            </GrowForm>

            <section class="dept-migrate__section">
              <h4>本次调整范围</h4>
              <dl class="dept-migrate__dl">
                <div><dt>迁移部门</dt><dd>{{ department.name }}</dd></div>
                <div><dt>组织范围</dt><dd>{{ department.descendantCount + 1 }} 个部门节点</dd></div>
                <div><dt>人员任职</dt><dd>保持原部门与岗位不变</dd></div>
                <div><dt>部门岗位</dt><dd>保持归属不变</dd></div>
              </dl>
            </section>

            <GrowAlert
              type="info"
              show-icon
              :closable="false"
              title="迁移只改变组织层级"
              description="不转移人员、岗位或负责人。"
            />
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton type="primary" :disabled="!targetChanged" :loading="submitting" @click="submit">
          确认迁移
        </GrowButton>
      </GrowSpace>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { migrateSystemDept } from '../../../api/systemDept'
import type { SystemDeptDetail, SystemDeptNode } from '../../../types/systemDept'

defineOptions({ name: 'DeptMigrateDrawer' })

const emit = defineEmits<{ success: [] }>()
const message = useMsg() as any
const visible = ref(false)
const submitting = ref(false)
const department = ref<SystemDeptDetail | null>(null)
const tree = ref<SystemDeptNode[]>([])
const targetParentId = ref<string | null>(null)

function collectSubtreeIds(nodes: SystemDeptNode[], rootId: string) {
  const result = new Set<string>()
  const walk = (list: SystemDeptNode[], inside = false) => {
    for (const item of list) {
      const hit = inside || item.id === rootId
      if (hit) result.add(item.id)
      if (item.children?.length) walk(item.children, hit)
    }
  }
  walk(nodes)
  return result
}

const blockedIds = computed(() => department.value
  ? collectSubtreeIds(tree.value, department.value.id)
  : new Set<string>())
const parentTree = computed(() => {
  const walk = (nodes: SystemDeptNode[]): Array<SystemDeptNode & { disabled?: boolean }> => nodes.map((item) => ({
    ...item,
    disabled: item.status !== 'enabled' || blockedIds.value.has(item.id),
    children: item.children?.length ? walk(item.children) : undefined,
  }))
  return walk(tree.value)
})
const targetChanged = computed(() => Boolean(department.value) && targetParentId.value !== department.value?.parentId)

function open(row: SystemDeptDetail, sourceTree: SystemDeptNode[]) {
  department.value = row
  tree.value = sourceTree
  targetParentId.value = row.parentId
  visible.value = true
}

async function submit() {
  if (!department.value || !targetChanged.value) return
  try {
    submitting.value = true
    await migrateSystemDept(department.value.id, targetParentId.value)
    message.success('部门迁移成功')
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '迁移失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.dept-migrate__watch {
  height: 100%;
  min-height: 0;
}

.dept-migrate__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 16px;
  font-size: 13px;
}

.dept-migrate__form :deep(.el-tree-select),
.dept-migrate__form :deep(.el-input) {
  width: 100%;
}

.dept-migrate__form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.dept-migrate__form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.dept-migrate__form :deep(.el-form-item__label) {
  font-size: 13px;
}

.dept-migrate__section {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.dept-migrate__section h4 {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-migrate__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.dept-migrate__dl div {
  min-width: 0;
}

.dept-migrate__dl dt,
.dept-migrate__dl dd {
  margin: 0;
}

.dept-migrate__dl dt {
  margin-bottom: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-migrate__dl dd {
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
  word-break: break-word;
}

@media (max-width: 560px) {
  .dept-migrate__dl {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
.dept-migrate.el-drawer,
.dept-migrate.n-drawer {
  display: flex;
  flex-direction: column;
}

.dept-migrate .n-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dept-migrate .el-drawer__body,
.dept-migrate .n-drawer-body,
.dept-migrate .n-drawer-body-content-wrapper {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}
</style>
