<template>
  <aside v-if="visible" class="org-panel" @click.stop>
    <div class="org-panel__head">
      <h4>{{ title }}</h4>
      <GrowButton text size="small" class="org-panel__close" title="关闭" @click="emit('close')">
        <GrowIconify icon="carbon:close" :size="15" />
      </GrowButton>
    </div>
    <div class="org-panel__body">
      <p v-if="loading" class="org-panel__hint">正在加载完整信息…</p>
      <template v-if="post">
        <header class="org-panel__hero">
          <div>
            <strong>{{ postDetail?.name || post.name }}</strong>
            <p>{{ postDetail?.code || '-' }} · {{ postDetail?.deptName || post.deptName || '-' }}</p>
          </div>
          <GrowTag :type="postDetail?.enabled === false ? 'info' : 'success'" size="small">
            {{ postDetail?.enabled === false ? '停用' : '启用' }}
          </GrowTag>
        </header>
        <GrowAlert
          v-if="(postDetail?.overstaffed ?? post.overstaffed) > 0"
          type="warning"
          :closable="false"
          title="当前岗位已超出编制人数"
        />
        <section class="org-panel__section">
          <h5>编制统计</h5>
          <dl class="org-panel__metrics">
            <div><dt>全职编制</dt><dd>{{ postDetail?.formalHeadcount ?? '-' }}</dd></div>
            <div><dt>兼职编制</dt><dd>{{ postDetail?.partTimeHeadcount ?? '-' }}</dd></div>
            <div><dt>实习编制</dt><dd>{{ postDetail?.internHeadcount ?? '-' }}</dd></div>
            <div><dt>外包编制</dt><dd>{{ postDetail?.contractorHeadcount ?? '-' }}</dd></div>
            <div><dt>在岗</dt><dd>{{ postDetail?.occupied ?? post.occupied }}</dd></div>
            <div><dt>空缺</dt><dd>{{ postDetail?.vacancy ?? post.vacancy }}</dd></div>
            <div>
              <dt>超编</dt>
              <dd :class="{ 'is-over': (postDetail?.overstaffed ?? post.overstaffed) > 0 }">
                {{ postDetail?.overstaffed ?? post.overstaffed }}
              </dd>
            </div>
            <div><dt>总编制</dt><dd>{{ post.headcount }}</dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>基础信息</h5>
          <dl class="org-panel__dl">
            <div><dt>岗位类型</dt><dd>{{ postTypeLabel(postDetail?.postType) }}</dd></div>
            <div><dt>职位/职级</dt><dd>{{ displayText(post.jobGrade) }}</dd></div>
            <div><dt>排序号</dt><dd>{{ displayText(postDetail?.sort) }}</dd></div>
            <div><dt>所属部门</dt><dd>
              <GrowButton v-if="post.deptId" link type="primary" @click="emit('node', `dept:${post.deptId}`)">
                {{ postDetail?.deptName || post.deptName }}
              </GrowButton>
              <span v-else>-</span>
            </dd></div>
            <div class="is-span"><dt>岗位职责</dt><dd>{{ displayText(postDetail?.duty) }}</dd></div>
            <div class="is-span"><dt>任职要求</dt><dd>{{ displayText(postDetail?.requirement) }}</dd></div>
            <div class="is-span"><dt>岗位说明</dt><dd>{{ displayText(postDetail?.remark) }}</dd></div>
            <div><dt>创建时间</dt><dd>{{ formatTime(postDetail?.createdAt) }}</dd></div>
            <div><dt>更新时间</dt><dd>{{ formatTime(postDetail?.updatedAt) }}</dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>在岗人员（{{ postDetail?.members?.length || 0 }}）</h5>
          <p v-if="!postDetail?.members?.length" class="org-panel__hint">暂无在岗人员</p>
          <button
            v-for="item in postDetail?.members || []"
            :key="item.assignmentId"
            type="button"
            class="org-panel__card"
            @click="emit('node', `person:${item.userId}`)"
          >
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">
              {{ item.employeeNo }} · {{ assignmentTypeLabel(item.assignmentType) }}
              · {{ item.primary ? '主岗位' : '非主岗' }}
              · {{ employeeStatusLabel(item.employeeStatus) }}
            </div>
          </button>
        </section>
        <section v-if="postDetail?.history?.length" class="org-panel__section">
          <h5>历史任职（{{ postDetail.history.length }}）</h5>
          <div v-for="item in postDetail.history" :key="item.assignmentId" class="org-panel__card org-panel__card--static">
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">
              {{ item.employeeNo }} · {{ assignmentTypeLabel(item.assignmentType) }}
              · {{ item.startDate || '-' }} 至 {{ item.endDate || '-' }}
            </div>
          </div>
        </section>
      </template>
      <template v-else-if="person">
        <header class="org-panel__hero">
          <div>
            <strong>{{ personDetail?.name || person.name }}</strong>
            <p>{{ personDetail?.employeeNo || person.employeeNo || '-' }} · {{ personDetail?.deptName || person.deptName || '-' }}</p>
          </div>
          <GrowTag :type="statusTag(personDetail?.employeeStatus || person.employeeStatus)" size="small">
            {{ employeeStatusLabel(personDetail?.employeeStatus || person.employeeStatus) }}
          </GrowTag>
        </header>
        <section class="org-panel__section">
          <h5>基本信息</h5>
          <dl class="org-panel__dl">
            <div><dt>员工类型</dt><dd>{{ employeeTypeLabel(personDetail?.employeeType) }}</dd></div>
            <div><dt>手机号</dt><dd>{{ displayText(personDetail?.mobile) }}</dd></div>
            <div><dt>邮箱</dt><dd>{{ displayText(personDetail?.email) }}</dd></div>
            <div><dt>入职日期</dt><dd>{{ displayText(personDetail?.entryDate) }}</dd></div>
            <div><dt>司龄</dt><dd>{{ displayText(personDetail?.tenureText) }}</dd></div>
            <div><dt>工龄</dt><dd>{{ displayText(personDetail?.workYearsText) }}</dd></div>
            <div><dt>办公地点</dt><dd>{{ displayText(personDetail?.officeLocation) }}</dd></div>
            <div><dt>分机号</dt><dd>{{ displayText(personDetail?.extension) }}</dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>任职与汇报</h5>
          <dl class="org-panel__dl">
            <div><dt>主部门</dt><dd>
              <GrowButton v-if="person.deptId" link type="primary" @click="emit('node', `dept:${person.deptId}`)">
                {{ personDetail?.mainDeptName || person.deptName }}
              </GrowButton>
              <span v-else>-</span>
            </dd></div>
            <div><dt>主岗位</dt><dd>
              <GrowButton v-if="person.postId" link type="primary" @click="emit('post', person.postId)">
                {{ personDetail?.post || person.postName }}
              </GrowButton>
              <span v-else>{{ displayText(person.postName) }}</span>
            </dd></div>
            <div><dt>职位</dt><dd>{{ displayText(personDetail?.jobTitle || person.jobGrade) }}</dd></div>
            <div><dt>职级</dt><dd>{{ displayText(personDetail?.jobGrade || person.jobGrade) }}</dd></div>
            <div><dt>主上级</dt><dd>
              <GrowButton
                v-if="personDetail?.supervisorId || person.supervisorId"
                link
                type="primary"
                @click="emit('node', `person:${personDetail?.supervisorId || person.supervisorId}`)"
              >
                {{ personDetail?.supervisorName || person.supervisorName }}
              </GrowButton>
              <span v-else>未设置</span>
            </dd></div>
            <div class="is-span"><dt>协同上级</dt><dd>
              <template v-if="collaborators.length">
                <GrowButton
                  v-for="item in collaborators"
                  :key="item.userId"
                  link
                  type="primary"
                  @click="emit('node', `person:${item.userId}`)"
                >{{ item.name }}</GrowButton>
              </template>
              <span v-else>-</span>
            </dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>下属（{{ subordinates.length }}）</h5>
          <p v-if="!subordinates.length" class="org-panel__hint">暂无直接下属</p>
          <button
            v-for="item in subordinates"
            :key="item.userId"
            type="button"
            class="org-panel__card"
            @click="emit('node', `person:${item.userId}`)"
          >
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">{{ item.relation === 'primary' ? '主汇报' : '协同汇报' }}</div>
          </button>
        </section>
        <section class="org-panel__section">
          <h5>有效任职</h5>
          <p v-if="!assignments.length" class="org-panel__hint">暂无有效任职</p>
          <button
            v-for="item in assignments"
            :key="item.assignmentId"
            type="button"
            class="org-panel__card"
            @click="item.postId && emit('post', item.postId)"
          >
            <div class="org-panel__card-title">{{ item.postName }}</div>
            <div class="org-panel__card-meta">
              {{ item.deptName }} · {{ item.primary ? '主岗位' : assignmentTypeLabel(item.assignmentType) }}
              <template v-if="item.jobGrade"> · {{ item.jobGrade }}</template>
            </div>
          </button>
        </section>
        <section class="org-panel__section">
          <h5>绑定账号</h5>
          <dl class="org-panel__dl">
            <div><dt>账号</dt><dd>{{ displayText(personDetail?.account?.username || personDetail?.accountUsername) }}</dd></div>
            <div><dt>状态</dt><dd>{{ accountStatusLabel(personDetail?.account?.enabled ?? person.accountEnabled) }}</dd></div>
            <div class="is-span"><dt>角色</dt><dd>{{ roleText }}</dd></div>
            <div><dt>最近登录</dt><dd>{{ formatTime(personDetail?.account?.lastLoginAt) }}</dd></div>
          </dl>
        </section>
        <section v-if="personDetail?.history?.length" class="org-panel__section">
          <h5>近期异动</h5>
          <div v-for="item in personDetail.history.slice(0, 8)" :key="item.id" class="org-panel__card org-panel__card--static">
            <div class="org-panel__card-title">{{ item.title }}</div>
            <div class="org-panel__card-meta">
              {{ item.effectiveDate || formatTime(item.createdAt) }} · {{ item.operator || '-' }}
            </div>
            <div v-if="item.summary" class="org-panel__card-meta">{{ item.summary }}</div>
          </div>
        </section>
      </template>
      <template v-else-if="dept">
        <header class="org-panel__hero">
          <div>
            <strong>{{ deptDetail?.name || dept.name }}</strong>
            <p>{{ deptDetail?.code || dept.code || '-' }} · {{ deptDetail?.parentName || dept.parentName || '顶级部门' }}</p>
          </div>
          <GrowTag :type="(deptDetail?.status || dept.status) === 'enabled' ? 'success' : 'info'" size="small">
            {{ (deptDetail?.status || dept.status) === 'enabled' ? '启用' : '停用' }}
          </GrowTag>
        </header>
        <section class="org-panel__section">
          <h5>基本信息</h5>
          <dl class="org-panel__dl">
            <div><dt>上级部门</dt><dd>
              <GrowButton v-if="dept.parentId" link type="primary" @click="emit('node', `dept:${dept.parentId}`)">
                {{ deptDetail?.parentName || dept.parentName }}
              </GrowButton>
              <span v-else>顶级部门</span>
            </dd></div>
            <div><dt>同级排序</dt><dd>{{ displayText(deptDetail?.sort ?? dept.sort) }}</dd></div>
            <div><dt>人员数量</dt><dd>{{ dept.personCount }}</dd></div>
            <div><dt>岗位数量</dt><dd>{{ dept.postCount }}</dd></div>
            <div><dt>直属人员</dt><dd>{{ displayText(deptDetail?.directPersonCount) }}</dd></div>
            <div><dt>直属子部门</dt><dd>{{ displayText(deptDetail?.directChildCount) }}</dd></div>
            <div class="is-span"><dt>部门描述</dt><dd>{{ displayText(deptDetail?.description) }}</dd></div>
            <div><dt>创建时间</dt><dd>{{ formatTime(deptDetail?.createdAt) }}</dd></div>
            <div><dt>更新时间</dt><dd>{{ formatTime(deptDetail?.updatedAt) }}</dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>部门负责人</h5>
          <dl class="org-panel__dl">
            <div><dt>负责人</dt><dd>
              <GrowButton v-if="deptDetail?.managerId" link type="primary" @click="emit('node', `person:${deptDetail.managerId}`)">
                {{ deptDetail.managerName }}
              </GrowButton>
              <span v-else>{{ displayText(dept.managerName || '未设置') }}</span>
            </dd></div>
            <div><dt>负责岗位</dt><dd>{{ displayText(deptDetail?.managerPostName) }}</dd></div>
            <div class="is-span"><dt>指定方式</dt><dd>{{ managerSourceText }}</dd></div>
          </dl>
        </section>
        <section class="org-panel__section">
          <h5>有效人员（{{ deptRelated?.people?.length || 0 }}）</h5>
          <p v-if="!deptRelated?.people?.length" class="org-panel__hint">暂无有效人员</p>
          <button
            v-for="item in deptRelated?.people || []"
            :key="item.assignmentId"
            type="button"
            class="org-panel__card"
            @click="emit('node', `person:${item.userId}`)"
          >
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">
              {{ item.employeeNo }} · {{ item.postName || '-' }} · {{ assignmentTypeLabel(item.assignmentType) }}
            </div>
          </button>
        </section>
        <section class="org-panel__section">
          <h5>直属岗位（{{ deptRelated?.posts?.length || 0 }}）</h5>
          <p v-if="!deptRelated?.posts?.length" class="org-panel__hint">暂无直属岗位</p>
          <button
            v-for="item in deptRelated?.posts || []"
            :key="item.id"
            type="button"
            class="org-panel__card"
            @click="emit('post', item.id)"
          >
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">任职 {{ item.activePersonCount }} 人 · {{ item.enabled ? '启用' : '停用' }}</div>
          </button>
        </section>
        <section class="org-panel__section">
          <h5>直属子部门（{{ deptRelated?.children?.length || 0 }}）</h5>
          <p v-if="!deptRelated?.children?.length" class="org-panel__hint">暂无直属子部门</p>
          <button
            v-for="item in deptRelated?.children || []"
            :key="item.id"
            type="button"
            class="org-panel__card"
            @click="emit('node', `dept:${item.id}`)"
          >
            <div class="org-panel__card-title">{{ item.name }}</div>
            <div class="org-panel__card-meta">{{ item.code }} · 有效人员 {{ item.directPersonCount }}</div>
          </button>
        </section>
        <section v-if="deptDetail?.managerHistory?.length" class="org-panel__section">
          <h5>负责人历史</h5>
          <div v-for="item in deptDetail.managerHistory" :key="item.id" class="org-panel__card org-panel__card--static">
            <div class="org-panel__card-title">{{ item.personName }}</div>
            <div class="org-panel__card-meta">
              {{ item.postName || '按人员设置' }} · {{ item.reason }}
              · {{ formatTime(item.startedAt) }} - {{ formatTime(item.endedAt) }}
            </div>
          </div>
        </section>
      </template>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  assignmentTypeLabel,
  employeeStatusLabel,
  employeeTypeLabel,
} from '../../../types/systemPerson'
import type { SystemDeptDetail, SystemDeptRelated } from '../../../types/systemDept'
import type { SystemPersonDetail } from '../../../types/systemPerson'
import type { SystemPostDetail } from '../../../types/systemPost'
import { postTypeLabel } from '../../../types/systemPost'
import type { OrgChartDept, OrgChartPerson, OrgChartPost } from '../../../types/systemOrgChart'
import { accountStatusLabel, displayText, formatTime, statusTag } from '../use/helpers'

defineOptions({ name: 'OrgChartDetail' })

const props = defineProps<{
  visible: boolean
  loading?: boolean
  dept?: OrgChartDept | null
  deptDetail?: SystemDeptDetail | null
  deptRelated?: SystemDeptRelated | null
  person?: OrgChartPerson | null
  personDetail?: SystemPersonDetail | null
  post?: OrgChartPost | null
  postDetail?: SystemPostDetail | null
}>()

const emit = defineEmits<{
  close: []
  node: [id: string]
  post: [postId: string]
}>()

const title = computed(() => {
  if (props.post) return '岗位详情'
  if (props.person) return '人员详情'
  if (props.dept) return '部门详情'
  return '节点详情'
})

const managerSourceText = computed(() => {
  if (props.deptDetail?.managerType === 'post') return '按岗位指定'
  if (props.deptDetail?.managerType === 'person') return '直接指定人员'
  return '未设置'
})

const collaborators = computed(() => {
  const detail = props.personDetail
  if (detail?.collaborators?.length) {
    return detail.collaborators.map((item) => ({ userId: item.userId, name: item.name }))
  }
  const names = props.person?.collaboratorNames || []
  const ids = props.person?.collaboratorIds || []
  return names.map((name, index) => ({ userId: ids[index] || '', name }))
})

const subordinates = computed(() => props.personDetail?.subordinates || [])

const assignments = computed(() => {
  if (props.personDetail?.assignments?.length) {
    return props.personDetail.assignments.map((item) => ({
      assignmentId: item.id,
      postId: item.postId,
      postName: item.postName,
      deptName: item.deptName,
      jobGrade: item.jobGrade || '',
      assignmentType: item.type,
      primary: item.type === 'primary',
    }))
  }
  return props.person?.assignments || []
})

const roleText = computed(() => {
  const roles = props.personDetail?.account?.roles || []
  if (!roles.length) return '-'
  return roles.map((item) => item.name || item.code).filter(Boolean).join('、') || '-'
})
</script>

<style scoped>
.org-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: 440px;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--component-background-color);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}

.org-panel__head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 40px;
  padding: 0 8px 0 14px;
  border-bottom: 1px solid var(--layout-border-color);
}

.org-panel__head h4 {
  flex: 1;
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-panel__close {
  width: 28px;
  min-width: 28px;
  height: 28px;
  padding: 0;
  color: var(--text-color-secondary);
}

.org-panel__body {
  flex: 1;
  min-height: 0;
  padding: 4px 16px 20px;
  overflow: auto;
}

.org-panel__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0 12px;
  border-bottom: 1px solid var(--layout-border-color);
}

.org-panel__hero strong {
  font-size: 16px;
}

.org-panel__hero p {
  margin: 4px 0 0;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.org-panel__body :deep(.el-alert),
.org-panel__body :deep(.n-alert) {
  margin-top: 12px;
}

.org-panel__section {
  padding: 16px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.org-panel__section h5 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
}

.org-panel__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.org-panel__dl div {
  min-width: 0;
}

.org-panel__dl .is-span {
  grid-column: 1 / -1;
}

.org-panel__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.org-panel__dl dd {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  word-break: break-all;
}

.org-panel__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--layout-border-color);
  border-left: 1px solid var(--layout-border-color);
}

.org-panel__metrics div {
  padding: 8px;
  border-right: 1px solid var(--layout-border-color);
  border-bottom: 1px solid var(--layout-border-color);
}

.org-panel__metrics dt {
  color: var(--text-color-secondary);
  font-size: 11px;
}

.org-panel__metrics dd {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
}

.org-panel__card {
  display: block;
  width: 100%;
  margin: 0 0 8px;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--layout-container-background-color, var(--el-fill-color-light));
  text-align: left;
  cursor: pointer;
}

.org-panel__card:hover {
  background: var(--el-fill-color);
}

.org-panel__card--static {
  cursor: default;
}

.org-panel__card-title {
  font-size: 13px;
}

.org-panel__card-meta {
  margin-top: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.org-panel__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.is-over {
  color: var(--el-color-danger);
}
</style>
