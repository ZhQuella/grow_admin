<template>
  <GrowDrawer
    v-model="visible"
    :title="department ? `合并部门 · ${department.name}` : '合并部门'"
    size="min(960px, 96%)"
    append-to-body
    destroy-on-close
    class="dept-merge"
  >
    <div class="dept-merge__steps">
      <GrowSteps :current="step + 1" :items="stepItems" />
    </div>
    <GrowWatchBox class="dept-merge__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-if="loading" class="dept-merge__empty">加载中…</div>
          <div v-else-if="impact && department" class="dept-merge__body">
            <section v-if="step === 0" class="dept-merge__section">
              <header class="dept-merge__section-head">
                <div>
                  <h3>选择接收部门</h3>
                  <p>目标必须是启用部门，且不能位于源部门的下级范围内。</p>
                </div>
              </header>

              <div class="dept-merge__route">
                <div>
                  <span>源部门</span>
                  <strong>{{ department.name }}</strong>
                  <small>{{ department.code }}</small>
                </div>
                  <GrowIconify icon="ant-design:arrow-right-outlined" :size="14" />
                <div :class="{ 'is-pending': !targetDepartment }">
                  <span>接收部门</span>
                  <strong>{{ targetDepartment?.name || '请选择目标部门' }}</strong>
                  <small>{{ targetDepartment?.code || '将接收岗位与人员' }}</small>
                </div>
              </div>

              <label class="dept-merge__field dept-merge__target-field">
                <span>目标部门</span>
                <GrowTreeSelect
                  v-model="targetId"
                  :data="targetTree"
                  :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
                  check-strictly
                  filterable
                  default-expand-all
                  placeholder="请选择启用部门"
                  @change="onTargetChange"
                />
              </label>

              <dl class="dept-merge__metrics">
                <div><dt>直属岗位待映射</dt><dd>{{ impact.posts.length }} 个</dd></div>
                <div><dt>有效任职</dt><dd>{{ impact.assignments.length }} 条</dd></div>
                <div><dt>直属子部门待决定</dt><dd>{{ impact.children.length }} 个</dd></div>
              </dl>
            </section>

            <section v-else-if="step === 1" class="dept-merge__section">
              <header class="dept-merge__section-head">
                <div>
                  <h3>设置岗位映射</h3>
                  <p>每个源岗位都需要指定目标岗位，或在目标部门中新建岗位。</p>
                </div>
                <span>{{ completedMappingCount }} / {{ mappings.length }} 已完成</span>
              </header>

              <div v-if="!mappings.length" class="dept-merge__empty">源部门没有直属岗位，可直接进入下一步</div>
              <div v-else class="dept-merge__mappings">
                <section v-for="(mapping, index) in mappings" :key="mapping.sourcePostId" class="dept-merge__mapping">
                  <header>
                    <div>
                      <strong>{{ impact.posts[index].name }}</strong>
                      <span>{{ impact.posts[index].activePersonCount }} 人任职</span>
                    </div>
                    <GrowTag :type="mappingComplete(mapping) ? 'success' : 'warning'" size="small">
                      {{ mappingComplete(mapping) ? '已完成' : '待设置' }}
                    </GrowTag>
                  </header>
                  <div class="dept-merge__mapping-fields">
                    <label class="dept-merge__field">
                      <span>处理方式</span>
                      <GrowSelect v-model="mapping.action" :options="mappingActions" @change="clearMappingTarget(mapping)" />
                    </label>
                    <label v-if="mapping.action === 'existing'" class="dept-merge__field">
                      <span>目标岗位</span>
                      <GrowSelect
                        v-model="mapping.targetPostId"
                        :options="targetPostOptions"
                        filterable
                        placeholder="请选择目标岗位"
                      />
                    </label>
                  </div>
                  <DeptMergePostForm
                    v-if="mapping.action === 'create' && mapping.targetPost"
                    v-model="mapping.targetPost"
                  />
                </section>
              </div>
            </section>

            <section v-else-if="step === 2" class="dept-merge__section">
              <header class="dept-merge__section-head">
                <div>
                  <h3>设置组织处理方式</h3>
                  <p>决定子部门、源负责人以及合并后源部门的状态。</p>
                </div>
              </header>

              <div class="dept-merge__setting-group">
                <div class="dept-merge__setting-title">
                  <div>
                    <h4>直属子部门</h4>
                    <p>勾选的子部门迁移到目标部门下，人员和岗位保持不变。</p>
                  </div>
                  <span>已选择 {{ childIds.length }} / {{ impact.children.length }}</span>
                </div>
                <div v-if="impact.children.length" class="dept-merge__children">
                  <label v-for="child in impact.children" :key="child.id" class="dept-merge__child">
                    <GrowCheckbox v-model="childIds" :label="child.id">{{ child.name }}</GrowCheckbox>
                    <span>{{ child.directPersonCount }} 人 · {{ child.directPostCount }} 岗位</span>
                  </label>
                </div>
                <div v-else class="dept-merge__empty dept-merge__empty--compact">没有直属子部门</div>
              </div>

              <div class="dept-merge__setting-group">
                <div class="dept-merge__setting-title">
                  <div>
                    <h4>源部门负责人</h4>
                    <p v-if="impact.source.managerName">
                      {{ impact.source.managerName }}{{ impact.source.managerPostName ? ` · ${impact.source.managerPostName}` : '' }}
                    </p>
                    <p v-else>源部门当前未设置负责人</p>
                  </div>
                </div>
                <GrowRadioGroup v-model="managerAction" :options="managerActions" />
              </div>

              <label class="dept-merge__source-state" :class="{ 'is-selected': stopSource }">
                <GrowCheckbox v-model="stopSource">合并后停用源部门</GrowCheckbox>
                <span v-if="stopSource">未迁移的下级部门会同步停用，有效任职需要逐条处理。</span>
                <span v-else>源部门及未迁移的子部门继续保持当前状态。</span>
              </label>
            </section>

            <section v-else-if="step === personStep" class="dept-merge__section">
              <header class="dept-merge__section-head">
                <div>
                  <h3>安排剩余人员去向</h3>
                  <p>仅处理随源部门停用、且没有迁移到目标部门下的子部门任职。</p>
                </div>
                <span>{{ completedDecisionCount }} / {{ remainingRows.length }} 已完成</span>
              </header>

              <div v-if="!remainingRows.length" class="dept-merge__empty">没有需要额外处理的有效任职</div>
              <div v-else class="dept-merge__assignments">
                <section v-for="row in remainingRows" :key="row.assignmentId" class="dept-merge__assignment">
                  <header>
                    <div>
                      <strong>{{ row.name }}</strong>
                      <span>{{ row.employeeNo }} · {{ row.deptName }} / {{ row.postName }}</span>
                    </div>
                    <div class="dept-merge__assignment-state">
                      <GrowTag :type="row.assignmentType === 'primary' ? 'primary' : 'info'" size="small">
                        {{ row.assignmentType === 'primary' ? '主职' : '兼职' }}
                      </GrowTag>
                      <GrowTag :type="decisionComplete(decision(row.assignmentId)) ? 'success' : 'warning'" size="small">
                        {{ decisionComplete(decision(row.assignmentId)) ? '已完成' : '待完善' }}
                      </GrowTag>
                    </div>
                  </header>
                  <div class="dept-merge__assignment-fields">
                    <label class="dept-merge__field">
                      <span>处理方式</span>
                      <GrowSelect
                        v-model="decision(row.assignmentId).action"
                        :options="row.assignmentType === 'primary' ? primaryActions : partTimeActions"
                        @change="onDecisionActionChange(decision(row.assignmentId))"
                      />
                    </label>
                    <label v-if="decision(row.assignmentId).action === 'move'" class="dept-merge__field">
                      <span>目标部门</span>
                      <GrowSelect
                        v-model="decision(row.assignmentId).targetDeptId"
                        :options="outsideDeptOptions"
                        filterable
                        placeholder="请选择"
                        @change="onDecisionDeptChange(decision(row.assignmentId))"
                      />
                    </label>
                    <label v-if="decision(row.assignmentId).action === 'move'" class="dept-merge__field">
                      <span>目标岗位</span>
                      <GrowSelect
                        v-model="decision(row.assignmentId).targetPostId"
                        :options="postOptions[decision(row.assignmentId).targetDeptId || ''] || []"
                        filterable
                        placeholder="请先选择部门"
                      />
                    </label>
                    <label class="dept-merge__field">
                      <span>调整原因</span>
                      <GrowInput v-model="decision(row.assignmentId).reason" maxlength="100" placeholder="请输入" />
                    </label>
                  </div>
                </section>
              </div>
            </section>

            <section v-else class="dept-merge__section dept-merge__confirm">
              <header class="dept-merge__section-head">
                <div>
                  <h3>确认合并方案</h3>
                  <p>提交后将按以下方案调整组织、岗位、人员和负责人。</p>
                </div>
              </header>

              <div class="dept-merge__route dept-merge__route--confirm">
                <div>
                  <span>源部门</span>
                  <strong>{{ department.name }}</strong>
                  <small>{{ department.code }}</small>
                </div>
                  <GrowIconify icon="ant-design:arrow-right-outlined" :size="14" />
                <div>
                  <span>接收部门</span>
                  <strong>{{ targetDepartment?.name }}</strong>
                  <small>{{ targetDepartment?.code }}</small>
                </div>
              </div>

              <dl class="dept-merge__summary">
                <div><dt>岗位处理</dt><dd>{{ mappings.length }} 个岗位已完成映射</dd></div>
                <div><dt>子部门迁移</dt><dd>{{ childIds.length }} 个迁往目标部门</dd></div>
                <div><dt>源负责人</dt><dd>{{ managerActionText }}</dd></div>
                <div><dt>源部门状态</dt><dd>{{ stopSource ? '合并后停用' : '合并后保持启用' }}</dd></div>
                <div v-if="stopSource"><dt>额外人员处置</dt><dd>{{ remainingRows.length }} 条有效任职</dd></div>
              </dl>

              <GrowAlert
                :type="stopSource ? 'warning' : 'info'"
                show-icon
                :closable="false"
                :title="stopSource ? '源部门及未迁移子部门将停用' : '源部门继续保留'"
                :description="stopSource ? '岗位同步停用，负责人清空并保留历史。' : '直属岗位和人员按映射迁入目标部门。'"
              />
            </section>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton v-if="step > 0" @click="step -= 1">上一步</GrowButton>
        <GrowButton v-if="step < confirmStep" type="primary" :disabled="loading" @click="next">下一步</GrowButton>
        <GrowButton v-else type="primary" :loading="submitting" @click="submit">确认合并</GrowButton>
      </GrowSpace>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemPosts } from '../../../api/systemPost'
import { fetchSystemDeptMergeImpact, fetchSystemDeptStopImpact, mergeSystemDept } from '../../../api/systemDept'
import type { SystemDeptAssignmentDecision, SystemDeptDetail, SystemDeptMergeImpact, SystemDeptNewPost, SystemDeptNode, SystemDeptPost, SystemDeptPostMapping, SystemDeptStopImpact } from '../../../types/systemDept'
import DeptMergePostForm from './DeptMergePostForm.vue'

defineOptions({ name: 'DeptMergeDrawer' })

const emit = defineEmits<{ success: [] }>()
const message = useMsg() as any
const visible = ref(false)
const loading = ref(false)
const submitting = ref(false)
const step = ref(0)
const department = ref<SystemDeptDetail | null>(null)
const tree = ref<SystemDeptNode[]>([])
const impact = ref<SystemDeptMergeImpact | null>(null)
const stopImpact = ref<SystemDeptStopImpact | null>(null)
const targetId = ref('')
const targetPostOptions = ref<Array<{ label: string, value: string }>>([])
const targetPosts = ref<Array<{ id: string; code?: string }>>([])
const mappings = ref<SystemDeptPostMapping[]>([])
const childIds = ref<string[]>([])
const managerAction = ref<'replace' | 'cancel'>('cancel')
const stopSource = ref(false)
const decisions = ref<SystemDeptAssignmentDecision[]>([])
const postOptions = reactive<Record<string, Array<{ label: string, value: string }>>>({})

const mappingActions = [{ label: '映射已有岗位', value: 'existing' }, { label: '新建目标岗位', value: 'create' }]
const primaryActions = [{ label: '迁移任职', value: 'move' }]
const partTimeActions = [{ label: '迁移任职', value: 'move' }, { label: '结束兼职', value: 'end' }]
const managerActions = computed(() => impact.value?.source.managerId
  ? [{ label: '取消源负责人', value: 'cancel' }, { label: '替换目标负责人', value: 'replace' }]
  : [{ label: '源部门无负责人', value: 'cancel' }])
const requiresPersonStep = computed(() => stopSource.value && remainingRows.value.length > 0)
const stepLabels = computed(() => requiresPersonStep.value
  ? ['接收部门', '岗位映射', '组织处理', '人员去向', '确认方案']
  : ['接收部门', '岗位映射', '组织处理', '确认方案'])
const stepItems = computed(() => stepLabels.value.map((title) => ({ title })))
const confirmStep = computed(() => stepLabels.value.length - 1)
const personStep = computed(() => requiresPersonStep.value ? 3 : -1)

function flatten(nodes: SystemDeptNode[]): SystemDeptNode[] {
  return nodes.flatMap((item) => [item, ...flatten(item.children || [])])
}

function subtreeIds(rootId: string) {
  const all = flatten(tree.value)
  const result = new Set<string>()
  const walk = (id: string) => {
    result.add(id)
    all.filter((item) => item.parentId === id).forEach((item) => walk(item.id))
  }
  walk(rootId)
  return result
}

const sourceScope = computed(() => department.value ? subtreeIds(department.value.id) : new Set<string>())
const targetTree = computed(() => {
  const blocked = sourceScope.value
  const walk = (nodes: SystemDeptNode[]): Array<SystemDeptNode & { disabled?: boolean }> => nodes.map((item) => ({
    ...item,
    disabled: item.status !== 'enabled' || blocked.has(item.id),
    children: item.children?.length ? walk(item.children) : undefined,
  }))
  return walk(tree.value)
})
const targetDepartment = computed(() => flatten(tree.value).find((item) => item.id === targetId.value) || null)
const stoppedScope = computed(() => {
  if (!department.value) return new Set<string>()
  const moved = new Set<string>()
  childIds.value.forEach((id) => subtreeIds(id).forEach((childId) => moved.add(childId)))
  return new Set([...sourceScope.value].filter((id) => !moved.has(id)))
})
const outsideDeptOptions = computed(() => flatten(tree.value)
  .filter((item) => item.status === 'enabled' && !stoppedScope.value.has(item.id))
  .map((item) => ({ label: item.name, value: item.id })))
const remainingRows = computed(() => {
  if (!stopSource.value || !stopImpact.value || !department.value) return []
  const moved = new Set<string>()
  childIds.value.forEach((id) => subtreeIds(id).forEach((childId) => moved.add(childId)))
  return stopImpact.value.assignments.filter((item) => item.deptId !== department.value!.id && !moved.has(item.deptId))
})
const completedMappingCount = computed(() => mappings.value.filter(mappingComplete).length)
const completedDecisionCount = computed(() => remainingRows.value
  .filter((row) => decisionComplete(decision(row.assignmentId))).length)
const managerActionText = computed(() => managerAction.value === 'replace'
  ? `使用 ${impact.value?.source.managerName || '源负责人'} 替换目标负责人`
  : impact.value?.source.managerName ? '取消源负责人' : '源部门无负责人')

async function onTargetChange(value: string) {
  targetPostOptions.value = []
  targetPosts.value = []
  mappings.value.forEach((item) => {
    item.targetPostId = ''
    item.targetPost = createTargetPost(sourcePost(item.sourcePostId))
  })
  if (!value) return
  const posts = await fetchSystemPosts(value)
  targetPosts.value = posts
  targetPostOptions.value = posts.filter((item) => item.enabled).map((item) => ({
    label: item.name,
    value: item.id,
  }))
}

function clearMappingTarget(mapping: SystemDeptPostMapping) {
  mapping.targetPostId = ''
  mapping.targetPost = createTargetPost(sourcePost(mapping.sourcePostId))
}

function mappingComplete(mapping: SystemDeptPostMapping) {
  return mapping.action === 'existing' ? Boolean(mapping.targetPostId) : newPostComplete(mapping.targetPost)
}

function sourcePost(id: string) {
  return impact.value?.posts.find((item) => item.id === id)
}

function createTargetPost(source?: SystemDeptPost): SystemDeptNewPost {
  return {
    name: source?.name || '',
    code: source?.code || '',
    postType: source?.postType || '',
    formalHeadcount: Number(source?.formalHeadcount || 0),
    contractorHeadcount: Number(source?.contractorHeadcount || 0),
    partTimeHeadcount: Number(source?.partTimeHeadcount || 0),
    duty: source?.duty || '',
    requirement: source?.requirement || '',
    sort: Number(source?.sort || 0),
    remark: source?.remark || '',
  }
}

function newPostComplete(post?: SystemDeptNewPost) {
  return Boolean(post?.name.trim() && post.code.trim())
}

function decision(assignmentId: string) {
  return decisions.value.find((item) => item.assignmentId === assignmentId)!
}

function decisionComplete(item: SystemDeptAssignmentDecision) {
  if (!item.reason.trim()) return false
  return item.action === 'end' || Boolean(item.targetDeptId && item.targetPostId)
}

function onDecisionActionChange(item: SystemDeptAssignmentDecision) {
  if (item.action === 'end') {
    item.targetDeptId = ''
    item.targetPostId = ''
  }
}

async function onDecisionDeptChange(item: SystemDeptAssignmentDecision) {
  item.targetPostId = ''
  const deptId = item.targetDeptId || ''
  if (!deptId || postOptions[deptId]) return
  const posts = await fetchSystemPosts(deptId)
  postOptions[deptId] = posts.filter((post) => post.enabled).map((post) => ({ label: post.name, value: post.id }))
}

function validateRemainingRows() {
  for (const row of remainingRows.value) {
    const item = decision(row.assignmentId)
    if (item.action === 'move' && (!item.targetDeptId || !item.targetPostId)) {
      throw new Error(`请为 ${row.name} 选择目标部门和岗位`)
    }
    if (!item.reason.trim()) throw new Error(`请填写 ${row.name} 的调整原因`)
  }
}

function validateStep() {
  if (step.value === 0 && !targetId.value) throw new Error('请选择目标部门')
  if (step.value === 1) {
    for (let i = 0; i < mappings.value.length; i += 1) {
      const item = mappings.value[i]
      const name = impact.value!.posts[i].name
      if (item.action === 'existing' && !item.targetPostId) throw new Error(`请选择 ${name} 的目标岗位`)
      if (item.action === 'create' && !newPostComplete(item.targetPost)) {
        throw new Error(`请完整填写 ${name} 对应的新岗位名称和编码`)
      }
      if (item.action === 'create' && item.targetPost) {
        const code = item.targetPost.code.trim().toLowerCase()
        const duplicatedExisting = targetPosts.value.some((post) => post.code?.trim().toLowerCase() === code)
        const duplicatedNew = mappings.value.some((other) => other !== item
          && other.action === 'create'
          && other.targetPost?.code.trim().toLowerCase() === code)
        if (duplicatedExisting || duplicatedNew) throw new Error(`目标部门下岗位编码「${item.targetPost.code}」已存在`)
      }
    }
  }
  if (step.value === personStep.value) validateRemainingRows()
}

function next() {
  try {
    validateStep()
    step.value += 1
  } catch (error) {
    message.error(error instanceof Error ? error.message : '请完成当前步骤')
  }
}

async function open(row: SystemDeptDetail, sourceTree: SystemDeptNode[]) {
  department.value = row
  tree.value = sourceTree
  impact.value = null
  stopImpact.value = null
  targetId.value = ''
  targetPostOptions.value = []
  targetPosts.value = []
  childIds.value = []
  managerAction.value = 'cancel'
  stopSource.value = false
  decisions.value = []
  Object.keys(postOptions).forEach((key) => delete postOptions[key])
  step.value = 0
  visible.value = true
  loading.value = true
  try {
    const [mergeValue, stopValue] = await Promise.all([
      fetchSystemDeptMergeImpact(row.id),
      fetchSystemDeptStopImpact(row.id),
    ])
    impact.value = mergeValue
    stopImpact.value = stopValue
    mappings.value = mergeValue.posts.map((post) => ({
      sourcePostId: post.id,
      action: 'existing',
      targetPost: createTargetPost(post),
    }))
    decisions.value = stopValue.assignments.map((item) => ({
      assignmentId: item.assignmentId,
      action: 'move',
      targetDeptId: '',
      targetPostId: '',
      reason: '部门合并后停用',
    }))
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载合并信息失败')
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!department.value || !impact.value || !targetId.value) return
  try {
    validateRemainingRows()
    submitting.value = true
    await mergeSystemDept({
      sourceId: department.value.id,
      targetId: targetId.value,
      postMappings: mappings.value,
      childIds: childIds.value,
      managerAction: managerAction.value,
      stopSource: stopSource.value,
      stopDecisions: decisions.value,
    })
    message.success('部门合并成功')
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '合并失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.dept-merge__steps {
  box-sizing: border-box;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--layout-border-color);
}

.dept-merge__steps :deep(.el-step__title) {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-merge__steps :deep(.el-step__description) {
  padding-right: 8%;
  font-size: 12px;
  line-height: 18px;
}

.dept-merge__watch {
  height: calc(100% - 64px);
  min-height: 0;
}

.dept-merge__body {
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  font-size: 13px;
}

.dept-merge__section-head,
.dept-merge__setting-title,
.dept-merge__mapping header,
.dept-merge__assignment header,
.dept-merge__assignment-state,
.dept-merge__child {
  display: flex;
  align-items: center;
}

.dept-merge__section-head,
.dept-merge__setting-title,
.dept-merge__mapping header,
.dept-merge__assignment header {
  justify-content: space-between;
  gap: 16px;
}

.dept-merge__section-head {
  align-items: flex-start;
  margin-bottom: 8px;
}

.dept-merge__section-head h3,
.dept-merge__setting-title h4 {
  margin: 0;
  font-weight: 600;
}

.dept-merge__section-head h3 {
  font-size: 13px;
  line-height: 20px;
}

.dept-merge__section-head p,
.dept-merge__setting-title p,
.dept-merge__route span,
.dept-merge__route small,
.dept-merge__mapping header span,
.dept-merge__assignment header span,
.dept-merge__child > span,
.dept-merge__source-state > span,
.dept-merge__empty {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-merge__section-head p,
.dept-merge__setting-title p {
  margin: 2px 0 0;
  line-height: 18px;
}

.dept-merge__section-head > span,
.dept-merge__setting-title > span {
  flex: 0 0 auto;
  color: var(--el-color-primary);
  font-size: 13px;
}

.dept-merge__route {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
  gap: 8px;
}

.dept-merge__route > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.dept-merge__route strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-merge__route .is-pending strong,
.dept-merge__route .is-pending small {
  color: var(--el-text-color-placeholder);
  font-weight: 400;
}

.dept-merge__route--confirm {
  margin-bottom: 12px;
}

.dept-merge__target-field {
  width: 100%;
  margin-top: 12px;
}

.dept-merge__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.dept-merge__field > span {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-merge__body :deep(.el-tree-select),
.dept-merge__field :deep(.el-select),
.dept-merge__field :deep(.el-input) {
  width: 100%;
}

.dept-merge__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 12px;
  gap: 12px 16px;
}

.dept-merge__metrics > div {
  min-width: 0;
}

.dept-merge__metrics dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-merge__metrics dd {
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
}

.dept-merge__mappings,
.dept-merge__assignments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dept-merge__mapping,
.dept-merge__assignment {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.dept-merge__mapping header > div,
.dept-merge__assignment header > div:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.dept-merge__mapping header strong,
.dept-merge__assignment header strong {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-merge__mapping-fields {
  display: grid;
  grid-template-columns: 180px minmax(220px, 1fr);
  margin-top: 8px;
  gap: 8px;
}

.dept-merge__setting-group {
  padding: 12px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.dept-merge__setting-group:first-of-type {
  padding-top: 0;
}

.dept-merge__setting-title h4 {
  font-size: 13px;
  line-height: 20px;
}

.dept-merge__setting-group :deep(.el-radio-group) {
  display: flex;
  margin-top: 8px;
}

.dept-merge__children {
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
}

.dept-merge__child {
  justify-content: space-between;
  min-height: 44px;
  padding: 8px 12px;
  gap: 12px;
}

.dept-merge__child + .dept-merge__child {
  border-top: 1px solid var(--layout-border-color);
}

.dept-merge__source-state {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-top: 12px;
  padding: 8px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  gap: 4px;
  line-height: 18px;
}

.dept-merge__source-state.is-selected {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.dept-merge__assignment-state {
  flex: 0 0 auto;
  gap: 6px;
}

.dept-merge__assignment-fields {
  display: grid;
  grid-template-columns: 140px minmax(160px, 1fr) minmax(160px, 1fr) minmax(180px, 1.2fr);
  align-items: end;
  margin-top: 8px;
  gap: 8px;
}

.dept-merge__summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0;
  gap: 8px 16px;
}

.dept-merge__summary div {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 4px 8px;
  min-width: 0;
}

.dept-merge__summary dt,
.dept-merge__summary dd {
  margin: 0;
}

.dept-merge__summary dt {
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.dept-merge__summary dd {
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
  word-break: break-word;
}

.dept-merge__confirm :deep(.grow-alert) {
  margin-top: 12px;
}

.dept-merge__empty {
  padding: 32px 0;
  text-align: center;
}

.dept-merge__empty--compact {
  padding: 16px 0 0;
}

@media (max-width: 860px) {
  .dept-merge__assignment-fields,
  .dept-merge__mapping-fields,
  .dept-merge__metrics,
  .dept-merge__route {
    grid-template-columns: 1fr;
  }
}
</style>
