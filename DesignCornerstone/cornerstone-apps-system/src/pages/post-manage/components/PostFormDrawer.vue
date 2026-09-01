<template>
  <GrowDrawer
    v-model="visible"
    :title="mode === 'create' ? '新增岗位' : `编辑岗位${model.name ? ` · ${model.name}` : ''}`"
    size="640px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="post-form__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-loading="loading">
          <GrowForm
            ref="formRef"
            class="post-form"
            :model="model"
            :rules="rules"
            label-width="80px"
          >
            <section class="post-form__section">
              <h4>基础信息</h4>
              <div class="post-form__grid">
                <GrowFormItem label="岗位名称" prop="name">
                  <GrowInput v-model="model.name" maxlength="64" clearable placeholder="如前端工程师" />
                </GrowFormItem>
                <GrowFormItem label="岗位编码" prop="code">
                  <GrowInput v-model="model.code" maxlength="64" clearable placeholder="同一部门下唯一" />
                </GrowFormItem>
                <GrowFormItem label="所属部门" prop="deptId">
                  <GrowTreeSelect
                    v-model="model.deptId"
                    :data="deptTree"
                    :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
                    check-strictly
                    clearable
                    filterable
                    default-expand-all
                    :disabled="deptLocked"
                    placeholder="请选择启用部门"
                  />
                  <p v-if="deptLocked" class="post-form__hint">已有有效任职，调整部门请通过部门迁移或人员调岗</p>
                </GrowFormItem>
                <GrowFormItem label="排序号" prop="sort">
                  <GrowInputNumber v-model="model.sort" :min="0" :max="9999" controls-position="right" />
                </GrowFormItem>
              </div>
            </section>

            <section class="post-form__section">
              <h4>编制</h4>
              <div class="post-form__quota">
                <label class="post-form__quota-item">
                  <span>全职</span>
                  <GrowInputNumber v-model="model.formalHeadcount" :min="0" :max="9999" controls-position="right" />
                </label>
                <label class="post-form__quota-item">
                  <span>兼职</span>
                  <GrowInputNumber v-model="model.partTimeHeadcount" :min="0" :max="9999" controls-position="right" />
                </label>
                <label class="post-form__quota-item">
                  <span>实习</span>
                  <GrowInputNumber v-model="model.internHeadcount" :min="0" :max="9999" controls-position="right" />
                </label>
                <label class="post-form__quota-item">
                  <span>外包</span>
                  <GrowInputNumber v-model="model.contractorHeadcount" :min="0" :max="9999" controls-position="right" />
                </label>
              </div>
            </section>

            <section class="post-form__section">
              <h4>职责说明</h4>
              <GrowFormItem label="岗位职责" prop="duty">
                <GrowInput v-model="model.duty" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填" />
              </GrowFormItem>
              <GrowFormItem label="任职要求" prop="requirement">
                <GrowInput v-model="model.requirement" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填" />
              </GrowFormItem>
              <GrowFormItem label="岗位说明" prop="remark">
                <GrowInput v-model="model.remark" type="textarea" :rows="2" maxlength="300" show-word-limit placeholder="选填" />
              </GrowFormItem>
            </section>
          </GrowForm>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton type="primary" :loading="submitting" @click="submit">保存</GrowButton>
      </GrowSpace>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchSystemDeptTree } from '../../../api/systemDept'
import { createSystemPost, getSystemPostDetail, updateSystemPost } from '../../../api/systemPost'
import type { SystemDeptNode } from '../../../types/systemDept'
import type { SystemPostListItem, SystemPostSavePayload, SystemPostType } from '../../../types/systemPost'
import { toMessage, validateGrowForm } from '../use/helpers'

defineOptions({ name: 'PostFormDrawer' })

const emit = defineEmits<{ success: [] }>()
const message = useMsg() as any

const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const deptTree = ref<Array<SystemDeptNode & { disabled?: boolean }>>([])
const deptLocked = ref(false)

type FormModel = {
  id?: string
  name: string
  code: string
  deptId: string
  postType: SystemPostType | ''
  formalHeadcount: number
  contractorHeadcount: number
  partTimeHeadcount: number
  internHeadcount: number
  duty: string
  requirement: string
  sort: number
  remark: string
}

function emptyForm(): FormModel {
  return {
    id: undefined,
    name: '',
    code: '',
    deptId: '',
    postType: '',
    formalHeadcount: 0,
    contractorHeadcount: 0,
    partTimeHeadcount: 0,
    internHeadcount: 0,
    duty: '',
    requirement: '',
    sort: 10,
    remark: '',
  }
}

const model = reactive<FormModel>(emptyForm())

const rules = computed(() => ({
  name: [{ required: true, message: '请填写岗位名称', trigger: 'blur' }],
  code: [{ required: true, message: '请填写岗位编码', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
}))

function markDisabled(nodes: SystemDeptNode[], keepId?: string): Array<SystemDeptNode & { disabled?: boolean }> {
  return nodes.map((node) => ({
    ...node,
    disabled: node.status !== 'enabled' && node.id !== keepId,
    children: node.children?.length ? markDisabled(node.children, keepId) : undefined,
  }))
}

async function loadOptions(keepDeptId?: string) {
  const tree = await fetchSystemDeptTree(true)
  deptTree.value = markDisabled(tree, keepDeptId)
}

async function openCreate(deptId = '') {
  mode.value = 'create'
  Object.assign(model, emptyForm(), { deptId })
  deptLocked.value = false
  loading.value = true
  visible.value = true
  try {
    await loadOptions()
  } catch (error) {
    message.error(toMessage(error, '加载选项失败'))
  } finally {
    loading.value = false
  }
}

async function openEdit(row: SystemPostListItem) {
  mode.value = 'edit'
  Object.assign(model, emptyForm(), { id: row.id, name: row.name })
  deptLocked.value = row.activePersonCount > 0
  loading.value = true
  visible.value = true
  try {
    const [detail] = await Promise.all([
      getSystemPostDetail(row.id),
      loadOptions(row.deptId),
    ])
    Object.assign(model, {
      id: detail.id,
      name: detail.name,
      code: detail.code,
      deptId: detail.deptId,
      postType: detail.postType || '',
      formalHeadcount: detail.formalHeadcount,
      contractorHeadcount: detail.contractorHeadcount,
      partTimeHeadcount: detail.partTimeHeadcount,
      internHeadcount: detail.internHeadcount,
      duty: detail.duty || '',
      requirement: detail.requirement || '',
      sort: detail.sort,
      remark: detail.remark || '',
    })
    deptLocked.value = detail.activePersonCount > 0
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  } finally {
    loading.value = false
  }
}

async function submit() {
  try {
    await validateGrowForm(formRef)
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload: SystemPostSavePayload = {
      name: model.name.trim(),
      code: model.code.trim(),
      deptId: model.deptId,
      postType: model.postType || '',
      formalHeadcount: Number(model.formalHeadcount || 0),
      contractorHeadcount: Number(model.contractorHeadcount || 0),
      partTimeHeadcount: Number(model.partTimeHeadcount || 0),
      internHeadcount: Number(model.internHeadcount || 0),
      duty: model.duty.trim(),
      requirement: model.requirement.trim(),
      sort: Number(model.sort || 0),
      remark: model.remark.trim(),
    }
    const result = mode.value === 'create'
      ? await createSystemPost(payload)
      : await updateSystemPost(model.id!, payload)
    if (result?.nameDuplicated) {
      message.warning('同部门已存在同名岗位，已保存')
    } else {
      message.success(mode.value === 'create' ? '创建成功' : '保存成功')
    }
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(toMessage(error, '保存失败'))
  } finally {
    submitting.value = false
  }
}

defineExpose({ openCreate, openEdit })
</script>

<style scoped>
.post-form {
  padding: 4px 20px 12px;
}

.post-form__watch {
  height: 100%;
  min-height: 240px;
}

.post-form__section {
  padding: 16px 0 4px;
  border-bottom: 1px solid var(--layout-border-color);
}

.post-form__section:last-child {
  border-bottom: 0;
}

.post-form__section h4 {
  margin: 0 0 14px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.post-form__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0 16px;
}

.post-form__quota {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
}

.post-form__quota-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 12px 14px;
  border-right: 1px solid var(--layout-border-color);
  border-bottom: 1px solid var(--layout-border-color);
}

.post-form__quota-item:nth-child(2n) {
  border-right: 0;
}

.post-form__quota-item:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.post-form__quota-item span {
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.post-form :deep(.el-input-number),
.post-form :deep(.n-input-number),
.post-form :deep(.ant-input-number),
.post-form :deep(.ant-input-number-group-wrapper),
.post-form :deep(.el-select),
.post-form :deep(.n-select),
.post-form :deep(.ant-select),
.post-form :deep(.el-tree-select) {
  width: 100%;
}

.post-form :deep(.el-form-item),
.post-form :deep(.n-form-item),
.post-form :deep(.ant-form-item) {
  margin-bottom: 14px;
}

.post-form :deep(.el-form-item__label),
.post-form :deep(.n-form-item-label),
.post-form :deep(.ant-form-item-label) {
  font-size: 13px;
}

.post-form__hint {
  margin: 6px 0 0;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
