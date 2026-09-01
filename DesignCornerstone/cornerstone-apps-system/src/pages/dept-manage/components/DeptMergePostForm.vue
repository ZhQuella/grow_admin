<template>
  <div class="dept-merge-post-form">
    <label class="dept-merge-post-form__field">
      <span>岗位名称 <b>*</b></span>
      <GrowInput :model-value="modelValue.name" maxlength="64" clearable placeholder="请输入" @update:model-value="patch('name', String($event || ''))" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>岗位编码 <b>*</b></span>
      <GrowInput :model-value="modelValue.code" maxlength="64" clearable placeholder="目标部门内唯一" @update:model-value="patch('code', String($event || ''))" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>岗位类型</span>
      <GrowSelect :model-value="modelValue.postType" :options="postTypeOptions" clearable placeholder="选填" @update:model-value="patchPostType" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>全职编制</span>
      <GrowInputNumber :model-value="modelValue.formalHeadcount" :min="0" :max="9999" controls-position="right" @update:model-value="patch('formalHeadcount', Number($event || 0))" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>兼职编制</span>
      <GrowInputNumber :model-value="modelValue.partTimeHeadcount" :min="0" :max="9999" controls-position="right" @update:model-value="patch('partTimeHeadcount', Number($event || 0))" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>外包编制</span>
      <GrowInputNumber :model-value="modelValue.contractorHeadcount" :min="0" :max="9999" controls-position="right" @update:model-value="patch('contractorHeadcount', Number($event || 0))" />
    </label>
    <label class="dept-merge-post-form__field">
      <span>排序号</span>
      <GrowInputNumber :model-value="modelValue.sort" :min="0" :max="9999" controls-position="right" @update:model-value="patch('sort', Number($event || 0))" />
    </label>
    <label class="dept-merge-post-form__field is-wide">
      <span>岗位职责</span>
      <GrowInput :model-value="modelValue.duty" type="textarea" :rows="2" maxlength="500" show-word-limit @update:model-value="patch('duty', String($event || ''))" />
    </label>
    <label class="dept-merge-post-form__field is-wide">
      <span>任职要求</span>
      <GrowInput :model-value="modelValue.requirement" type="textarea" :rows="2" maxlength="500" show-word-limit @update:model-value="patch('requirement', String($event || ''))" />
    </label>
    <label class="dept-merge-post-form__field is-wide">
      <span>岗位说明</span>
      <GrowInput :model-value="modelValue.remark" type="textarea" :rows="2" maxlength="300" show-word-limit @update:model-value="patch('remark', String($event || ''))" />
    </label>
  </div>
</template>

<script lang="ts" setup>
import { POST_TYPE_OPTIONS } from '../../../types/systemPost'
import type { SystemDeptNewPost } from '../../../types/systemDept'

defineOptions({ name: 'DeptMergePostForm' })

const props = defineProps<{
  modelValue: SystemDeptNewPost
}>()

const emit = defineEmits<{ 'update:modelValue': [value: SystemDeptNewPost] }>()
const postTypeOptions = POST_TYPE_OPTIONS.map(({ label, value }) => ({ label, value }))

function patch<K extends keyof SystemDeptNewPost>(key: K, value: SystemDeptNewPost[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function patchPostType(value: unknown) {
  patch('postType', String(value || '') as SystemDeptNewPost['postType'])
}
</script>

<style scoped>
.dept-merge-post-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--layout-border-color);
}

.dept-merge-post-form__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.dept-merge-post-form__field > span {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-merge-post-form__field b {
  color: var(--el-color-danger);
  font-weight: 400;
}

.dept-merge-post-form__field.is-wide {
  grid-column: span 2;
}

.dept-merge-post-form :deep(.el-input),
.dept-merge-post-form :deep(.el-select),
.dept-merge-post-form :deep(.el-input-number) {
  width: 100%;
}

@media (max-width: 900px) {
  .dept-merge-post-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .dept-merge-post-form {
    grid-template-columns: 1fr;
  }

  .dept-merge-post-form__field.is-wide {
    grid-column: auto;
  }
}
</style>
