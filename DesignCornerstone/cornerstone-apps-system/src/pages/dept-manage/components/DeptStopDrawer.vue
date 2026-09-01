<template>
  <GrowDrawer
    v-model="visible"
    :title="department ? `停用部门 · ${department.name}` : '停用部门'"
    size="min(880px, 96%)"
    append-to-body
    destroy-on-close
    class="dept-stop"
  >
    <div class="dept-stop__steps">
      <GrowSteps :current="step + 1" :items="stepItems" />
    </div>
    <GrowWatchBox class="dept-stop__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div v-if="loading" class="dept-stop__empty">加载中…</div>
          <div v-else-if="impact && department" class="dept-stop__body">
            <template v-if="step === 0">
              <section class="dept-stop__card">
                <h4>部门信息</h4>
                <dl class="dept-stop__dl">
                  <div><dt>部门名称</dt><dd>{{ department.name }}</dd></div>
                  <div><dt>部门编码</dt><dd>{{ department.code }}</dd></div>
                  <div><dt>当前上级</dt><dd>{{ department.parentName || '顶级部门' }}</dd></div>
                  <div>
                    <dt>状态</dt>
                    <dd><GrowTag type="success" size="small">启用</GrowTag></dd>
                  </div>
                </dl>
              </section>

              <section class="dept-stop__card">
                <h4>影响统计</h4>
                <dl class="dept-stop__dl">
                  <div><dt>停用部门</dt><dd>{{ impact.departments.length }} 个</dd></div>
                  <div><dt>同步停用岗位</dt><dd>{{ impact.posts.length }} 个</dd></div>
                  <div><dt>待处理有效任职</dt><dd>{{ impact.assignments.length }} 条</dd></div>
                </dl>
              </section>

              <section class="dept-stop__card">
                <div class="dept-stop__card-head">
                  <h4>停用范围</h4>
                  <span>当前部门及其全部下级部门</span>
                </div>
                <div class="dept-stop__scope">
                  <div v-for="item in impact.departments" :key="item.id">
                    <span>{{ item.name }}</span>
                    <small>{{ item.code }}</small>
                  </div>
                </div>
              </section>

              <GrowAlert
                class="dept-stop__alert"
                type="warning"
                show-icon
                :closable="false"
                title="停用会同步影响组织下的岗位和负责人"
                description="岗位同步停用；部门负责人自动清空并保留历史。主职必须迁出，兼职可迁出或结束。"
              />
            </template>

            <template v-else>
              <header class="dept-stop__card dept-stop__card-head">
                <div>
                  <h4>安排人员去向</h4>
                  <p>按任职关系逐条处理，同一人员的主职和兼职分别计算。</p>
                </div>
                <span>{{ completedCount }} / {{ decisions.length }} 已完成</span>
              </header>

              <section class="dept-stop__card">
                <div class="dept-stop__card-head">
                  <h4>批量设置迁移目标</h4>
                  <span>仅应用到处理方式为“迁移”的任职</span>
                </div>
                <div class="dept-stop__bulk-fields">
                  <label>
                    <span>目标部门</span>
                    <GrowSelect v-model="bulkDeptId" :options="targetDeptOptions" clearable filterable placeholder="请选择" @change="onBulkDeptChange" />
                  </label>
                  <label>
                    <span>目标岗位</span>
                    <GrowSelect v-model="bulkPostId" :options="postOptions[bulkDeptId] || []" clearable filterable placeholder="请先选择部门" />
                  </label>
                  <GrowButton :disabled="!bulkDeptId || !bulkPostId" @click="applyAll">应用到全部迁移项</GrowButton>
                </div>
              </section>

              <div class="dept-stop__assignments">
                <section v-for="(decision, index) in decisions" :key="decision.assignmentId" class="dept-stop__assignment">
                  <header>
                    <div>
                      <strong>{{ impact.assignments[index].name }}</strong>
                      <span>{{ impact.assignments[index].employeeNo }} · {{ impact.assignments[index].deptName }} / {{ impact.assignments[index].postName }}</span>
                    </div>
                    <div class="dept-stop__assignment-state">
                      <GrowTag :type="impact.assignments[index].assignmentType === 'primary' ? 'primary' : 'info'" size="small">
                        {{ impact.assignments[index].assignmentType === 'primary' ? '主职' : '兼职' }}
                      </GrowTag>
                      <GrowTag :type="decisionComplete(decision) ? 'success' : 'warning'" size="small">
                        {{ decisionComplete(decision) ? '已完成' : '待完善' }}
                      </GrowTag>
                    </div>
                  </header>
                  <div class="dept-stop__assignment-fields">
                    <label>
                      <span>处理方式</span>
                      <GrowSelect
                        v-model="decision.action"
                        :options="impact.assignments[index].assignmentType === 'primary' ? primaryActions : partTimeActions"
                        @change="onActionChange(decision)"
                      />
                    </label>
                    <label v-if="decision.action === 'move'">
                      <span>目标部门</span>
                      <GrowSelect
                        v-model="decision.targetDeptId"
                        :options="targetDeptOptions"
                        filterable
                        placeholder="请选择"
                        @change="onDeptChange(decision)"
                      />
                    </label>
                    <label v-if="decision.action === 'move'">
                      <span>目标岗位</span>
                      <GrowSelect
                        v-model="decision.targetPostId"
                        :options="postOptions[decision.targetDeptId || ''] || []"
                        filterable
                        placeholder="请先选择部门"
                      />
                    </label>
                    <label class="dept-stop__reason">
                      <span>调整原因</span>
                      <GrowInput v-model="decision.reason" maxlength="100" placeholder="请输入" />
                    </label>
                  </div>
                </section>
              </div>
            </template>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowSpace>
        <GrowButton @click="visible = false">取消</GrowButton>
        <GrowButton v-if="step === 1" @click="step = 0">上一步</GrowButton>
        <GrowButton v-if="step === 0 && decisions.length" type="primary" :disabled="loading" @click="step = 1">
          下一步：安排人员去向
        </GrowButton>
        <GrowButton v-else type="danger" :disabled="loading" :loading="submitting" @click="submit">确认停用</GrowButton>
      </GrowSpace>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchSystemPosts } from '../../../api/systemPost'
import { fetchSystemDeptStopImpact, stopSystemDept } from '../../../api/systemDept'
import type { SystemPostOption } from '../../../types/systemPerson'
import type { SystemDeptAssignmentDecision, SystemDeptDetail, SystemDeptNode, SystemDeptStopImpact } from '../../../types/systemDept'

defineOptions({ name: 'DeptStopDrawer' })

const emit = defineEmits<{ success: [] }>()
const message = useMsg() as any
const visible = ref(false)
const loading = ref(false)
const submitting = ref(false)
const step = ref(0)
const department = ref<SystemDeptDetail | null>(null)
const tree = ref<SystemDeptNode[]>([])
const impact = ref<SystemDeptStopImpact | null>(null)
const decisions = ref<SystemDeptAssignmentDecision[]>([])
const postOptions = reactive<Record<string, Array<{ label: string, value: string }>>>({})
const bulkDeptId = ref('')
const bulkPostId = ref('')

const stepItems = [
  { title: '确认影响范围', description: '检查部门、岗位和任职' },
  { title: '安排人员去向', description: '迁移主职，迁移或结束兼职' },
]
const primaryActions = [{ label: '迁移任职', value: 'move' }]
const partTimeActions = [{ label: '迁移任职', value: 'move' }, { label: '结束兼职', value: 'end' }]

function flatten(nodes: SystemDeptNode[]): SystemDeptNode[] {
  return nodes.flatMap((item) => [item, ...flatten(item.children || [])])
}

const targetDeptOptions = computed(() => {
  const stopped = new Set(impact.value?.departments.map((item) => item.id) || [])
  return flatten(tree.value)
    .filter((item) => item.status === 'enabled' && !stopped.has(item.id))
    .map((item) => ({ label: item.name, value: item.id }))
})
const completedCount = computed(() => decisions.value.filter(decisionComplete).length)

async function loadPosts(deptId: string) {
  if (!deptId || postOptions[deptId]) return
  const posts: SystemPostOption[] = await fetchSystemPosts(deptId)
  postOptions[deptId] = posts.filter((item) => item.enabled).map((item) => ({ label: item.name, value: item.id }))
}

async function onBulkDeptChange(value: string) {
  bulkPostId.value = ''
  await loadPosts(value)
}

async function onDeptChange(decision: SystemDeptAssignmentDecision) {
  decision.targetPostId = ''
  await loadPosts(decision.targetDeptId || '')
}

function onActionChange(decision: SystemDeptAssignmentDecision) {
  if (decision.action === 'end') {
    decision.targetDeptId = ''
    decision.targetPostId = ''
  }
}

function decisionComplete(decision: SystemDeptAssignmentDecision) {
  if (!decision.reason.trim()) return false
  return decision.action === 'end' || Boolean(decision.targetDeptId && decision.targetPostId)
}

function applyAll() {
  for (const decision of decisions.value) {
    if (decision.action !== 'move') continue
    decision.targetDeptId = bulkDeptId.value
    decision.targetPostId = bulkPostId.value
  }
}

async function open(row: SystemDeptDetail, sourceTree: SystemDeptNode[]) {
  department.value = row
  tree.value = sourceTree
  impact.value = null
  decisions.value = []
  step.value = 0
  bulkDeptId.value = ''
  bulkPostId.value = ''
  Object.keys(postOptions).forEach((key) => delete postOptions[key])
  visible.value = true
  loading.value = true
  try {
    impact.value = await fetchSystemDeptStopImpact(row.id)
    decisions.value = impact.value.assignments.map((item) => ({
      assignmentId: item.assignmentId,
      action: 'move',
      targetDeptId: '',
      targetPostId: '',
      reason: '部门停用',
    }))
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载停用影响失败')
  } finally {
    loading.value = false
  }
}

function validate() {
  for (let i = 0; i < decisions.value.length; i += 1) {
    const decision = decisions.value[i]
    const row = impact.value!.assignments[i]
    if (decision.action === 'move' && (!decision.targetDeptId || !decision.targetPostId)) {
      throw new Error(`请为 ${row.name} 选择目标部门和岗位`)
    }
    if (!decision.reason.trim()) throw new Error(`请填写 ${row.name} 的调整原因`)
  }
}

async function submit() {
  if (!department.value || !impact.value) return
  try {
    validate()
    submitting.value = true
    await stopSystemDept(department.value.id, decisions.value)
    message.success('部门已停用')
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '停用失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.dept-stop__steps {
  box-sizing: border-box;
  padding: 16px;
  border-bottom: 1px solid var(--layout-border-color);
}

.dept-stop__steps :deep(.el-step__title) {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-stop__steps :deep(.el-step__description) {
  padding-right: 8%;
  font-size: 12px;
  line-height: 18px;
}

.dept-stop__alert :deep(.el-alert__title) {
  font-size: 13px;
  line-height: 20px;
}

.dept-stop__alert :deep(.el-alert__description) {
  font-size: 12px;
  line-height: 18px;
}

.dept-stop__watch {
  height: calc(100% - 72px);
  min-height: 0;
}

.dept-stop__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  font-size: 13px;
}

.dept-stop__card {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.dept-stop__card h4 {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-stop__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dept-stop__card-head h4 {
  margin: 0;
}

.dept-stop__card-head p {
  margin: 4px 0 0;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dept-stop__card-head > span {
  flex: 0 0 auto;
  color: var(--el-color-primary);
  font-size: 13px;
  line-height: 22px;
}

.dept-stop__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.dept-stop__dl div {
  min-width: 0;
}

.dept-stop__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-stop__dl dd {
  display: flex;
  align-items: center;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  word-break: break-all;
}

.dept-stop__scope {
  overflow: hidden;
  margin-top: 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--component-background-color);
}

.dept-stop__scope > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 6px 12px;
  gap: 12px;
}

.dept-stop__scope > div + div {
  border-top: 1px solid var(--layout-border-color);
}

.dept-stop__scope > div > span {
  color: var(--text-color);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.dept-stop__scope small,
.dept-stop__assignment header span,
.dept-stop__empty {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-stop__assignment header,
.dept-stop__assignment-state {
  display: flex;
  align-items: center;
}

.dept-stop__bulk-fields {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto;
  align-items: end;
  margin-top: 12px;
  gap: 12px;
}

.dept-stop__bulk-fields label,
.dept-stop__assignment-fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.dept-stop__bulk-fields label > span,
.dept-stop__assignment-fields label > span {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-stop__assignments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dept-stop__assignment {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.dept-stop__assignment header {
  justify-content: space-between;
  gap: 12px;
}

.dept-stop__assignment header > div:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.dept-stop__assignment header strong {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.dept-stop__assignment-state {
  flex: 0 0 auto;
  gap: 6px;
}

.dept-stop__assignment-fields {
  display: grid;
  grid-template-columns: 130px minmax(150px, 1fr) minmax(150px, 1fr) minmax(180px, 1.2fr);
  align-items: end;
  margin-top: 12px;
  gap: 12px;
}

.dept-stop__reason {
  grid-column: auto;
}

.dept-stop__empty {
  padding: 32px 0;
  text-align: center;
}

@media (max-width: 820px) {
  .dept-stop__assignment-fields,
  .dept-stop__bulk-fields,
  .dept-stop__dl {
    grid-template-columns: 1fr;
  }
}
</style>
