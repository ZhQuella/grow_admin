<template>
  <div class="person-detail">
    <div class="person-detail__body">
      <GrowScrollbar height="100%">
        <div v-if="loading && !detail" class="person-detail__hint">加载中…</div>
        <div v-else-if="!detail" class="person-detail__hint">未找到该人员</div>
        <div v-else class="person-detail__content">
          <PersonSection
            v-if="sectionMap['基本信息']"
            title="基本信息"
            :can-edit="canEdit"
            :editing="editingSection === '基本信息'"
            :saving="saving"
            @edit="startEdit"
            @save="saveSection"
            @cancel="cancelEdit"
          >
            <GrowForm
              v-if="canEdit"
              v-show="editingSection === '基本信息'"
              ref="formRef"
              :model="formModel"
              :rules="formRules"
              label-position="top"
            >
              <PersonProfileForm v-bind="profileBind" section="基本信息" />
            </GrowForm>
            <GrowRow v-show="editingSection !== '基本信息'" :gutter="16">
              <GrowCol
                v-for="item in sectionMap['基本信息'].fields"
                :key="item.label"
                :span="item.span === 3 ? 24 : item.span === 2 ? 12 : 6"
              >
                <div class="person-detail__item">
                  <div class="person-detail__label">{{ item.label }}</div>
                  <div class="person-detail__value">
                    <SensitiveText
                      v-if="item.sensitive"
                      :value="item.raw"
                      :masked="item.value"
                    />
                    <GrowTag v-else-if="item.tag" :type="item.tag" size="small">
                      {{ item.value }}
                    </GrowTag>
                    <span v-else>{{ item.value }}</span>
                  </div>
                </div>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="任职与上下级">
            <div v-if="!assignmentRows.length" class="person-detail__empty">暂无任职关系</div>
            <div
              v-for="row in assignmentRows"
              :key="row.id"
              class="person-detail__card"
            >
                <div class="person-detail__card-head">
                  <GrowTag :type="row.type === 'primary' ? 'primary' : 'info'" size="small">
                    {{ assignmentTypeLabel(row.type) }}
                  </GrowTag>
                  <GrowTag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ assignmentStatusLabel(row.status) }}
                  </GrowTag>
                  <span class="person-detail__card-meta">{{ row.occupyHeadcount ? '占用编制' : '不占编制' }}</span>
                </div>
                <GrowRow :gutter="16">
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">部门</div>
                      <div class="person-detail__value">{{ row.deptName || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">岗位</div>
                      <div class="person-detail__value">{{ row.postName || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">职位</div>
                      <div class="person-detail__value">{{ row.jobTitle || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">职级</div>
                      <div class="person-detail__value">{{ row.jobGrade || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">岗位编码</div>
                      <div class="person-detail__value">{{ row.jobCode || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">开始日期</div>
                      <div class="person-detail__value">{{ formatDate(row.startDate) }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">结束日期</div>
                      <div class="person-detail__value">{{ formatDate(row.endDate) }}</div>
                    </div>
                  </GrowCol>
                </GrowRow>
                <div class="person-detail__divider" />
                <GrowRow :gutter="16">
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">主上级</div>
                      <div class="person-detail__value">{{ row.supervisorName || '-' }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="12">
                    <div class="person-detail__item">
                      <div class="person-detail__label">协同上级</div>
                      <div class="person-detail__value">{{ (row.collaboratorNames || []).join('、') || '-' }}</div>
                    </div>
                  </GrowCol>
                </GrowRow>
            </div>
          </PersonSection>

          <PersonSection title="账号信息">
            <GrowRow :gutter="16">
              <GrowCol :span="6">
                <div class="person-detail__item">
                  <div class="person-detail__label">绑定账号</div>
                  <div class="person-detail__value">{{ detail.account?.username || detail.accountUsername || '未绑定' }}</div>
                </div>
              </GrowCol>
              <GrowCol :span="6">
                <div class="person-detail__item">
                  <div class="person-detail__label">账号状态</div>
                  <div class="person-detail__value">{{ accountStatusText }}</div>
                </div>
              </GrowCol>
              <GrowCol :span="6">
                <div class="person-detail__item">
                  <div class="person-detail__label">账号角色</div>
                  <div class="person-detail__value">{{ accountRoleText }}</div>
                </div>
              </GrowCol>
              <GrowCol :span="6">
                <div class="person-detail__item">
                  <div class="person-detail__label">最后登录</div>
                  <div class="person-detail__value">{{ formatTime(detail.account?.lastLoginAt) }}</div>
                </div>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection
            v-for="title in followSections"
            :key="title"
            :title="title"
            :can-edit="canEdit"
            :editing="editingSection === title"
            :saving="saving"
            @edit="startEdit"
            @save="saveSection"
            @cancel="cancelEdit"
          >
            <GrowForm
              v-if="canEdit"
              v-show="editingSection === title"
              :model="formModel"
              label-position="top"
            >
              <PersonProfileForm v-bind="profileBind" :section="title" />
            </GrowForm>
            <GrowRow v-show="sectionMap[title] && editingSection !== title" :gutter="16">
              <GrowCol
                v-for="item in sectionMap[title].fields"
                :key="item.label"
                :span="item.span === 3 ? 24 : item.span === 2 ? 12 : 6"
              >
                <div class="person-detail__item">
                  <div class="person-detail__label">{{ item.label }}</div>
                  <div class="person-detail__value">
                    <SensitiveText
                      v-if="item.sensitive"
                      :value="item.raw"
                      :masked="item.value"
                    />
                    <GrowTag v-else-if="item.tag" :type="item.tag" size="small">
                      {{ item.value }}
                    </GrowTag>
                    <span v-else>{{ item.value }}</span>
                  </div>
                </div>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection
            title="紧急联系人"
            :can-edit="canEdit"
            :editing="editingSection === '紧急联系人'"
            :saving="saving"
            @edit="startEdit"
            @save="saveSection"
            @cancel="cancelEdit"
          >
            <GrowForm
              v-if="canEdit"
              v-show="editingSection === '紧急联系人'"
              :model="formModel"
              label-position="top"
            >
              <PersonProfileForm v-bind="profileBind" section="紧急联系人" />
            </GrowForm>
            <div v-show="editingSection !== '紧急联系人'">
              <div
                v-for="row in emergencyRows"
                :key="row.id"
                class="person-detail__family"
              >
                <GrowRow :gutter="16">
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">姓名</div>
                      <div class="person-detail__value">{{ row.name }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">关系</div>
                      <div class="person-detail__value">{{ row.relation }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="6">
                    <div class="person-detail__item">
                      <div class="person-detail__label">电话</div>
                      <div class="person-detail__value">{{ row.phone }}</div>
                    </div>
                  </GrowCol>
                </GrowRow>
              </div>
              <div class="person-detail__editor-spacer" />
            </div>
          </PersonSection>

          <PersonSection
            title="家庭信息"
            :can-edit="canEdit"
            :editing="editingSection === '家庭信息'"
            :saving="saving"
            @edit="startEdit"
            @save="saveSection"
            @cancel="cancelEdit"
          >
            <GrowForm
              v-if="canEdit"
              v-show="editingSection === '家庭信息'"
              :model="formModel"
              label-position="top"
            >
              <PersonProfileForm v-bind="profileBind" section="家庭信息" />
            </GrowForm>
            <div v-show="editingSection !== '家庭信息'">
              <div
                v-for="row in familyRows"
                :key="row.id"
                class="person-detail__family"
              >
                <GrowRow :gutter="16">
                  <GrowCol :span="4">
                    <div class="person-detail__item">
                      <div class="person-detail__label">姓名</div>
                      <div class="person-detail__value">{{ row.name }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="4">
                    <div class="person-detail__item">
                      <div class="person-detail__label">关系</div>
                      <div class="person-detail__value">{{ row.relation }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="4">
                    <div class="person-detail__item">
                      <div class="person-detail__label">性别</div>
                      <div class="person-detail__value">{{ row.gender }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="4">
                    <div class="person-detail__item">
                      <div class="person-detail__label">生日</div>
                      <div class="person-detail__value">{{ row.birthday }}</div>
                    </div>
                  </GrowCol>
                  <GrowCol :span="4">
                    <div class="person-detail__item">
                      <div class="person-detail__label">电话</div>
                      <div class="person-detail__value">{{ row.phone }}</div>
                    </div>
                  </GrowCol>
                </GrowRow>
              </div>
              <div class="person-detail__editor-spacer" />
            </div>
          </PersonSection>

          <PersonSection
            title="个人材料"
            :can-edit="canEdit"
            :editing="editingSection === '个人材料'"
            :saving="saving"
            @edit="startEdit"
            @save="saveSection"
            @cancel="cancelEdit"
          >
            <GrowForm
              v-if="canEdit"
              v-show="editingSection === '个人材料'"
              :model="formModel"
              label-position="top"
            >
              <PersonProfileForm v-bind="profileBind" section="个人材料" />
            </GrowForm>
            <div v-show="editingSection !== '个人材料'" class="person-detail__materials">
              <div v-for="key in MATERIAL_KEYS" :key="key" class="person-detail__material">
                <div class="person-detail__material-label">{{ MATERIAL_LABELS[key] }}</div>
                <div class="person-detail__material-card">
                  <img
                    v-if="detail.materials?.[key]?.url"
                    :src="detail.materials[key]?.url"
                    :alt="MATERIAL_LABELS[key]"
                  >
                  <span v-else>未上传</span>
                </div>
              </div>
            </div>
          </PersonSection>

          <PersonSection title="人事历史">
            <div v-if="!historyRows.length" class="person-detail__empty">暂无历史记录</div>
            <GrowTimeline v-else class="person-detail__timeline">
              <GrowTimelineItem
                v-for="(item, index) in historyRows"
                :key="item.id"
                :timestamp="item.effectiveDate || formatTime(item.createdAt)"
                :type="historyTag(item.type)"
                :hollow="index !== 0"
                placement="top"
              >
                <div class="person-detail__history-card">
                  <GrowTag :type="historyTag(item.type)" size="small">{{ item.title }}</GrowTag>
                  <p class="person-detail__history-summary">{{ item.summary }}</p>
                  <div class="person-detail__history-meta">
                    {{ item.operator }} · {{ formatTime(item.createdAt) }}
                  </div>
                </div>
              </GrowTimelineItem>
            </GrowTimeline>
          </PersonSection>
        </div>
      </GrowScrollbar>
    </div>

    <div class="person-detail__bar">
      <GrowSpace>
        <GrowButton @click="onBack">返回</GrowButton>
        <GrowButton v-if="canTransfer" type="primary" @click="openTransfer">调岗</GrowButton>
      </GrowSpace>
    </div>

    <PersonTransferDrawer ref="transferRef" @success="onEventSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
  MATERIAL_KEYS,
  MATERIAL_LABELS,
  assignmentStatusLabel,
  assignmentTypeLabel,
  canPersonAction,
  type PersonEventType,
  type SystemPersonListItem,
} from '../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../types/systemRole'
import PersonTransferDrawer from './components/PersonTransferDrawer.vue'
import PersonProfileForm from './components/PersonProfileForm.vue'
import PersonSection from './components/PersonSection.vue'
import SensitiveText from './components/SensitiveText.vue'
import { formatDate, formatTime } from './use/helpers'
import { usePersonDetail } from './use/usePersonDetail'

defineOptions({ name: 'PersonDetailPage' })

const {
  loading,
  saving,
  canEdit,
  formRef,
  formModel,
  formRules,
  editingSection,
  deptTree,
  supervisorOptions,
  tenureText,
  ageText,
  workYearsText,
  detail,
  sections,
  emergencyRows,
  familyRows,
  historyRows,
  assignmentRows,
  startEdit,
  cancelEdit,
  saveSection,
  onAssignmentsChange,
  onEmergencyChange,
  onFamilyChange,
  onMaterialsChange,
  onIdNumberBlur,
  reload,
  onBack,
} = usePersonDetail()

const transferRef = ref<{
  open: (row: SystemPersonListItem, tree: SystemDeptTreeNode[]) => void
} | null>(null)

const canTransfer = computed(() => canPersonAction(detail.value?.employeeStatus, 'transfer'))

function openTransfer() {
  if (!detail.value) return
  transferRef.value?.open(detail.value, deptTree.value)
}

function onEventSuccess() {
  cancelEdit()
  void reload()
}

const profileBind = computed(() => ({
  bare: true,
  model: formModel,
  deptTree: deptTree.value,
  supervisorOptions: supervisorOptions.value,
  tenureText: tenureText.value,
  ageText: ageText.value,
  workYearsText: workYearsText.value,
  'onUpdate:assignments': onAssignmentsChange,
  'onUpdate:emergency': onEmergencyChange,
  'onUpdate:family': onFamilyChange,
  'onUpdate:materials': onMaterialsChange,
  onIdNumberBlur,
}))

const sectionMap = computed(() => {
  const map: Record<string, (typeof sections.value)[number]> = {}
  sections.value.forEach((section) => {
    map[section.title] = section
  })
  return map
})

const followSections = [
  '工作信息',
  '个人信息',
  '学历信息',
  '合同信息',
  '银行卡信息',
]

const accountStatusText = computed(() => {
  const enabled = detail.value?.account?.enabled ?? detail.value?.accountEnabled
  if (detail.value?.account?.username || detail.value?.accountUsername) {
    return enabled ? '启用' : '停用'
  }
  return '未绑定'
})
const accountRoleText = computed(() => {
  const roles = detail.value?.account?.roles || []
  return roles.length ? roles.map((item) => item.name).join('、') : '-'
})

function historyTag(type: PersonEventType | string) {
  if (type === 'resign' || type === 'delete' || type === 'retire') return 'danger'
  if (type === 'transfer' || type === 'disable' || type.startsWith('part_time')) return 'warning'
  if (type === 'confirm' || type === 'enable') return 'success'
  if (type === 'reinstate') return 'primary'
  return 'info'
}
</script>

<style scoped>
.person-detail {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
  background: var(--layout-container-background-color);
}

.person-detail__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--component-background-color);
}

.person-detail__content {
  padding: 8px 20px 32px;
}

.person-detail__item {
  margin-bottom: 12px;
}

.person-detail__label {
  margin-bottom: 8px;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 22px;
}

.person-detail__value {
  display: flex;
  align-items: center;
  min-height: 32px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.person-detail :deep(.el-form-item__label) {
  margin-bottom: 8px;
  padding: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 22px;
  height: auto;
}

.person-detail__hint,
.person-detail__empty {
  padding: 24px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.person-detail__empty {
  padding: 8px 0;
  text-align: left;
  font-size: 13px;
}

.person-detail__card {
  padding: 8px 12px 0;
  margin-bottom: 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.person-detail__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  margin-bottom: 4px;
}

.person-detail__card-meta {
  flex: 1;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.person-detail__divider {
  height: 1px;
  margin: 0 0 8px;
  background: var(--layout-border-color);
}

.person-detail__family + .person-detail__family {
  margin-top: 0;
}

.person-detail__editor-spacer {
  height: 22px;
}

.person-detail__bar {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: flex-end;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid var(--layout-border-color);
  border-radius: 0 0 8px 8px;
  background: var(--component-background-color);
}

.person-detail__materials {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.person-detail__material {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.person-detail__material-label {
  width: 100%;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-detail__material-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 8px;
  color: var(--text-color-secondary);
  background: var(--layout-container-background-color);
  font-size: 12px;
}

.person-detail__material-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-detail__timeline {
  padding: 4px 0 0 4px;
}

.person-detail__history-card {
  padding-bottom: 4px;
}

.person-detail__history-summary {
  margin: 8px 0 0;
  line-height: 1.5;
}

.person-detail__history-meta {
  margin-top: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
