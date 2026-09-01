<template>
  <div class="dept-action">
    <p v-if="loading" class="dept-action__hint">加载中…</p>

    <template v-else-if="mode === 'enable' && enableImpact">
      <p class="dept-action__hint">勾选本次需要恢复的部门。勾选子部门会自动勾选上级，取消上级会取消全部下级。</p>
      <div class="dept-action__choices">
        <label
          v-for="item in enableImpact.departments"
          :key="item.id"
          class="dept-action__choice"
          :style="{ paddingLeft: `${12 + depthOf(item.id) * 20}px` }"
        >
          <GrowCheckbox
            :model-value="selectedIds.includes(item.id)"
            :disabled="item.id === department.id"
            @update:model-value="toggleDepartment(item.id, Boolean($event))"
          >
            {{ item.name }}
          </GrowCheckbox>
        </label>
      </div>
    </template>

    <template v-else-if="mode === 'delete' && deleteImpact">
      <GrowAlert
        class="dept-action__alert"
        type="error"
        show-icon
        :closable="false"
        title="删除后不可作为有效部门使用"
        description="历史任职和权限引用仍保留原部门名称。未取消的当前任职会显示“部门已删除”并置灰。"
      />
      <label class="dept-action__switch">
        <GrowCheckbox v-model="cascade" @change="reloadDeleteImpact">同时删除全部下级部门</GrowCheckbox>
        <span>本次范围 {{ deleteImpact.departments.length }} 个部门</span>
      </label>
      <label class="dept-action__switch">
        <GrowCheckbox v-model="cancelAssignments">一并取消相关人员部门任职</GrowCheckbox>
        <span>取消后主职和兼职均结束，原因记录为“部门删除”</span>
      </label>
      <div class="dept-action__summary">
        <span>历史任职 {{ deleteImpact.historyAssignmentCount }} 条</span>
        <span>当前有效任职 {{ deleteImpact.assignments.length }} 条</span>
      </div>
      <GrowScrollbar v-if="deleteImpact.assignments.length" height="220px">
        <div class="dept-action__people">
          <div v-for="item in deleteImpact.assignments" :key="item.assignmentId">
            <strong>{{ item.name }}</strong>
            <span>{{ item.deptName }} · {{ item.postName }} · {{ item.assignmentType === 'primary' ? '主职' : '兼职' }}</span>
          </div>
        </div>
      </GrowScrollbar>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
  deleteSystemDept,
  enableSystemDept,
  fetchSystemDeptDeleteImpact,
  fetchSystemDeptEnableImpact,
} from '../../../api/systemDept'
import type { SystemDeptDeleteImpact, SystemDeptDetail, SystemDeptEnableImpact, SystemDeptNode } from '../../../types/systemDept'

defineOptions({ name: 'DeptActionPanel' })

const props = defineProps<{
  mode: 'enable' | 'delete'
  department: SystemDeptDetail
  tree: SystemDeptNode[]
}>()

const loading = ref(false)
const enableImpact = ref<SystemDeptEnableImpact | null>(null)
const deleteImpact = ref<SystemDeptDeleteImpact | null>(null)
const selectedIds = ref<string[]>([props.department.id])
const cascade = ref(false)
const cancelAssignments = ref(false)

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

function depthOf(id: string) {
  if (!enableImpact.value) return 0
  const byId = new Map(enableImpact.value.departments.map((item) => [item.id, item]))
  let depth = 0
  let current = byId.get(id)
  while (current?.parentId && byId.has(current.parentId)) {
    depth += 1
    current = byId.get(current.parentId)
  }
  return depth
}

function toggleDepartment(id: string, checked: boolean) {
  if (!enableImpact.value) return
  const all = enableImpact.value.departments
  const selected = new Set(selectedIds.value)
  if (checked) {
    selected.add(id)
    let current = all.find((item) => item.id === id)
    while (current?.parentId) {
      const parent = all.find((item) => item.id === current?.parentId)
      if (!parent) break
      selected.add(parent.id)
      current = parent
    }
  } else {
    const children = collectSubtreeIds(all.map((item) => ({ ...item, children: undefined })), id)
    const walk = (parentId: string) => {
      selected.delete(parentId)
      all.filter((item) => item.parentId === parentId).forEach((item) => walk(item.id))
    }
    children.add(id)
    walk(id)
  }
  selected.add(props.department.id)
  selectedIds.value = [...selected]
}

async function reloadDeleteImpact() {
  loading.value = true
  try {
    deleteImpact.value = await fetchSystemDeptDeleteImpact(props.department.id, cascade.value)
  } finally {
    loading.value = false
  }
}

async function load() {
  if (props.mode === 'enable') {
    loading.value = true
    try {
      enableImpact.value = await fetchSystemDeptEnableImpact(props.department.id)
      selectedIds.value = [props.department.id]
    } finally {
      loading.value = false
    }
  } else if (props.mode === 'delete') {
    await reloadDeleteImpact()
  }
}

async function submit() {
  if (props.mode === 'enable') return enableSystemDept(props.department.id, selectedIds.value)
  if (deleteImpact.value?.hasChildren && !cascade.value) throw new Error('该部门存在下级部门，请勾选同时删除')
  return deleteSystemDept(props.department.id, cascade.value, cancelAssignments.value)
}

load()
defineExpose({ submit })
</script>

<style scoped>
.dept-action {
  display: flex;
  flex-direction: column;
}

.dept-action__hint,
.dept-action__switch span,
.dept-action__people span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dept-action__hint {
  margin: 0 0 12px;
}

.dept-action :deep(.el-checkbox) {
  height: auto;
  align-items: center;
}

.dept-action :deep(.el-checkbox__label) {
  padding-left: 8px;
  font-size: 13px;
  line-height: 20px;
}

.dept-action :deep(.el-alert__title) {
  font-size: 13px;
  line-height: 20px;
}

.dept-action :deep(.el-alert__description) {
  font-size: 12px;
  line-height: 18px;
}

.dept-action__choices {
  flex: none;
  overflow: auto;
  max-height: 280px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.dept-action__people {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.dept-action__choice,
.dept-action__people > div {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dept-action__choice:last-child,
.dept-action__people > div:last-child {
  border-bottom: 0;
}

.dept-action__alert {
  margin-bottom: 16px;
}

.dept-action__switch {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 0 16px;
  gap: 4px;
}

.dept-action__summary {
  display: flex;
  margin: 12px 0 8px;
  gap: 16px;
  font-size: 13px;
}

.dept-action__people > div {
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
}

.dept-action__people strong {
  font-size: 13px;
  font-weight: 600;
}

.dept-action__people > div {
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
}
</style>
