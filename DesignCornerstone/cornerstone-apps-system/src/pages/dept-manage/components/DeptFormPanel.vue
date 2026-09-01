<template>
  <GrowForm ref="formRef" class="dept-form" :model="model" :rules="rules" label-width="80px">
    <GrowFormItem label="部门名称" prop="name">
      <GrowInput v-model="model.name" maxlength="64" clearable placeholder="请输入部门名称" />
    </GrowFormItem>
    <GrowFormItem label="部门编码" prop="code">
      <GrowInput v-model="model.code" maxlength="64" clearable placeholder="全局唯一" />
    </GrowFormItem>
    <GrowFormItem v-if="mode === 'edit'" label="上级部门">
      <GrowInput :model-value="department?.parentName || '顶级部门'" disabled />
      <p class="dept-form__hint">调整上级部门请使用「迁移」</p>
    </GrowFormItem>
    <GrowFormItem v-else label="上级部门" prop="parentId">
      <GrowTreeSelect
        v-model="model.parentId"
        :data="parentTree"
        :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
        check-strictly
        clearable
        filterable
        default-expand-all
        placeholder="不选则为顶级部门"
      />
    </GrowFormItem>
    <GrowFormItem label="排序号" prop="sort">
      <GrowInputNumber v-model="model.sort" :min="0" :max="9999" controls-position="right" />
    </GrowFormItem>

    <template v-if="mode === 'edit'">
      <GrowFormItem label="负责人来源">
        <GrowRadioGroup v-model="model.managerType" :options="managerTypeOptions" />
      </GrowFormItem>
      <GrowFormItem v-if="model.managerType === 'post'" label="负责人岗位" prop="managerPostId">
        <GrowSelect
          v-model="model.managerPostId"
          :options="postOptions"
          clearable
          placeholder="请选择当前部门岗位"
          @change="model.managerId = ''"
        />
      </GrowFormItem>
      <GrowFormItem v-if="model.managerType" label="部门负责人" prop="managerId">
        <GrowSelect
          v-model="model.managerId"
          :options="managerOptions"
          clearable
          filterable
          placeholder="仅显示本部门正式人员"
        />
      </GrowFormItem>
    </template>

    <GrowFormItem label="部门描述">
      <GrowInput
        v-model="model.description"
        type="textarea"
        :rows="4"
        maxlength="300"
        show-word-limit
        placeholder="选填"
      />
    </GrowFormItem>
  </GrowForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { createSystemDept, fetchSystemDeptRelated, updateSystemDept } from '../../../api/systemDept'
import type { SystemDeptNode, SystemDeptSavePayload } from '../../../types/systemDept'

defineOptions({ name: 'DeptFormPanel' })

const props = defineProps<{
  mode: 'create' | 'edit'
  department: SystemDeptNode | null
  tree: SystemDeptNode[]
}>()

const related = ref<Awaited<ReturnType<typeof fetchSystemDeptRelated>> | null>(null)
const formRef = ref()
const model = reactive<SystemDeptSavePayload>({
  name: props.mode === 'edit' ? props.department?.name || '' : '',
  code: props.mode === 'edit' ? props.department?.code || '' : '',
  parentId: props.mode === 'create' ? props.department?.id || null : props.department?.parentId ?? null,
  sort: props.mode === 'create' ? 0 : props.department?.sort || 0,
  description: props.mode === 'edit' ? props.department?.description || '' : '',
  managerType: props.mode === 'edit' ? props.department?.managerType || '' : '',
  managerId: props.mode === 'edit' ? props.department?.managerId || '' : '',
  managerPostId: props.mode === 'edit' ? props.department?.managerPostId || '' : '',
})

const rules = {
  name: [{ required: true, message: '请填写部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请填写部门编码', trigger: 'blur' }],
  managerPostId: [{
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      if (model.managerType === 'post' && !value) callback(new Error('请选择负责人岗位'))
      else callback()
    },
    trigger: 'change',
  }],
  managerId: [{
    validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      if (model.managerType && !value) callback(new Error('请选择部门负责人'))
      else callback()
    },
    trigger: 'change',
  }],
}

const managerTypeOptions = [
  { label: '不设置', value: '' },
  { label: '按人员', value: 'person' },
  { label: '按岗位', value: 'post' },
]

function collectIds(nodes: SystemDeptNode[], rootId: string) {
  const result = new Set<string>()
  const walk = (list: SystemDeptNode[], inside = false) => {
    for (const node of list) {
      const hit = inside || node.id === rootId
      if (hit) result.add(node.id)
      if (node.children?.length) walk(node.children, hit)
    }
  }
  walk(nodes)
  return result
}

const blockedIds = computed(() => props.mode === 'edit' && props.department
  ? collectIds(props.tree, props.department.id)
  : new Set<string>())

const parentTree = computed(() => {
  const walk = (nodes: SystemDeptNode[]): Array<SystemDeptNode & { disabled?: boolean }> => nodes.map((node) => ({
    ...node,
    disabled: node.status !== 'enabled' || blockedIds.value.has(node.id),
    children: node.children?.length ? walk(node.children) : undefined,
  }))
  return walk(props.tree)
})

const postOptions = computed(() => (related.value?.posts || [])
  .filter((item) => item.enabled)
  .map((item) => ({ label: item.name, value: item.id })))

const managerOptions = computed(() => {
  const postId = model.managerType === 'post' ? model.managerPostId : ''
  return (related.value?.people || [])
    .filter((item) => item.employeeStatus === 'formal' && (!postId || item.postId === postId))
    .filter((item, index, list) => list.findIndex((row) => row.userId === item.userId) === index)
    .map((item) => ({ label: `${item.name} · ${item.postName}`, value: item.userId }))
})

if (props.mode === 'edit' && props.department) {
  fetchSystemDeptRelated(props.department.id).then((value) => { related.value = value })
}

async function submit() {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) throw new Error('表单未就绪')
  const valid = await form.validate()
  if (valid === false) throw new Error('校验未通过')
  const payload: SystemDeptSavePayload = {
    ...model,
    name: model.name.trim(),
    code: model.code.trim(),
    description: model.description.trim(),
    managerType: model.managerType || '',
    managerId: model.managerType ? model.managerId : '',
    managerPostId: model.managerType === 'post' ? model.managerPostId : '',
  }
  if (props.mode === 'edit' && props.department) {
    return updateSystemDept(props.department.id, payload)
  }
  return createSystemDept(payload)
}

defineExpose({ submit })
</script>

<style scoped>
.dept-form :deep(.el-input-number),
.dept-form :deep(.el-select),
.dept-form :deep(.el-tree-select) {
  width: 100%;
}

.dept-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.dept-form :deep(.el-form-item__label) {
  font-size: 13px;
}

.dept-form__hint {
  margin: 4px 0 0;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
