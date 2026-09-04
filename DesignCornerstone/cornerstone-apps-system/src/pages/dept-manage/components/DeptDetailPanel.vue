<template>
  <div class="dept-detail-panel">
    <section class="dept-detail-panel__section">
      <h4 class="dept-detail-panel__title">基本信息</h4>
      <dl class="dept-detail-panel__dl">
        <div><dt>部门名称</dt><dd>{{ department.name }}</dd></div>
        <div><dt>部门编码</dt><dd>{{ department.code }}</dd></div>
        <div><dt>上级部门</dt><dd>{{ department.parentName || '顶级部门' }}</dd></div>
        <div><dt>同级排序</dt><dd>{{ department.sort }}</dd></div>
        <div>
          <dt>状态</dt>
          <dd>
            <GrowTag :type="department.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ department.status === 'enabled' ? '启用' : '停用' }}
            </GrowTag>
          </dd>
        </div>
        <div><dt>更新时间</dt><dd>{{ formatTime(department.updatedAt) }}</dd></div>
        <div><dt>创建时间</dt><dd>{{ formatTime(department.createdAt) }}</dd></div>
        <div class="dept-detail-panel__span"><dt>部门描述</dt><dd>{{ department.description || '-' }}</dd></div>
      </dl>
    </section>

    <section class="dept-detail-panel__section">
      <h4 class="dept-detail-panel__title">部门负责人</h4>
      <dl class="dept-detail-panel__dl">
        <div><dt>负责人</dt><dd>{{ department.managerName || '未设置' }}</dd></div>
        <div><dt>岗位</dt><dd>{{ department.managerPostName || '-' }}</dd></div>
        <div class="dept-detail-panel__span"><dt>指定方式</dt><dd>{{ managerSourceText }}</dd></div>
      </dl>
    </section>

    <section class="dept-detail-panel__section">
      <h4 class="dept-detail-panel__title">关联数据</h4>
      <p v-if="relatedLoading" class="dept-detail-panel__hint">加载中…</p>
      <p v-else-if="relatedError" class="dept-detail-panel__hint">{{ relatedError }}</p>
      <GrowTabs v-else-if="related" v-model="relatedTab">
        <GrowTabPane name="people" :label="`有效人员（${related.people.length}）`">
          <GrowTable :data="related.people" row-key="assignmentId" border empty-text="暂无有效人员">
            <GrowTableColumn prop="name" label="姓名" min-width="100" />
            <GrowTableColumn prop="employeeNo" label="工号" min-width="110" />
            <GrowTableColumn prop="postName" label="岗位" min-width="120" />
            <GrowTableColumn label="任职类型" min-width="90">
              <template #default="{ row }">
                <GrowTag :type="row.assignmentType === 'primary' ? 'primary' : 'info'" size="small">
                  {{ row.assignmentType === 'primary' ? '主职' : '兼职' }}
                </GrowTag>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </GrowTabPane>
        <GrowTabPane name="posts" :label="`直属岗位（${related.posts.length}）`">
          <GrowTable :data="related.posts" row-key="id" border empty-text="暂无直属岗位">
            <GrowTableColumn prop="name" label="岗位名称" min-width="140" />
            <GrowTableColumn prop="activePersonCount" label="任职人数" min-width="100" />
            <GrowTableColumn label="状态" min-width="80">
              <template #default="{ row }">
                <GrowTag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '停用' }}
                </GrowTag>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </GrowTabPane>
        <GrowTabPane name="children" :label="`直属子部门（${related.children.length}）`">
          <GrowTable :data="related.children" row-key="id" border empty-text="暂无直属子部门">
            <GrowTableColumn prop="name" label="部门名称" min-width="140" />
            <GrowTableColumn prop="code" label="部门编码" min-width="120" />
            <GrowTableColumn prop="directPersonCount" label="有效人员" min-width="100" />
            <GrowTableColumn label="状态" min-width="80">
              <template #default="{ row }">
                <GrowTag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </GrowTag>
              </template>
            </GrowTableColumn>
          </GrowTable>
        </GrowTabPane>
      </GrowTabs>
    </section>

    <section class="dept-detail-panel__section">
      <h4 class="dept-detail-panel__title">负责人历史</h4>
      <p v-if="!department.managerHistory.length" class="dept-detail-panel__hint">暂无负责人变更历史</p>
      <div v-else class="dept-detail-panel__people">
        <div v-for="item in department.managerHistory" :key="item.id" class="dept-detail-panel__person">
          <div class="dept-detail-panel__person-name">{{ item.personName }}</div>
          <div class="dept-detail-panel__person-meta">
            {{ item.postName || '按人员设置' }} · {{ item.reason }}
            · {{ formatTime(item.startedAt) }} - {{ formatTime(item.endedAt) }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { fetchSystemDeptRelated } from '../../../api/systemDept'
import type { SystemDeptDetail, SystemDeptRelated } from '../../../types/systemDept'

defineOptions({ name: 'DeptDetailPanel' })

const props = defineProps<{
  department: SystemDeptDetail
  initialTab?: 'people' | 'posts' | 'children'
}>()
const relatedLoading = ref(true)
const relatedError = ref('')
const related = ref<SystemDeptRelated | null>(null)
const relatedTab = ref(props.initialTab || 'people')

const managerSourceText = computed(() => {
  if (props.department.managerType === 'post') return '按岗位指定'
  if (props.department.managerType === 'person') return '直接指定人员'
  return '未设置'
})

async function loadRelated(id: string) {
  relatedLoading.value = true
  relatedError.value = ''
  try {
    related.value = await fetchSystemDeptRelated(id)
  } catch {
    related.value = null
    relatedError.value = '关联数据加载失败'
  } finally {
    relatedLoading.value = false
  }
}

watch(
  () => [props.department.id, props.initialTab] as const,
  ([id, tab]) => {
    relatedTab.value = tab || 'people'
    loadRelated(id)
  },
  { immediate: true },
)

function formatTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.dept-detail-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.dept-detail-panel__section {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.dept-detail-panel__title {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}

.dept-detail-panel__section :deep(.el-tabs__header) {
  margin: 0 0 12px;
}

.dept-detail-panel__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.dept-detail-panel__dl div {
  min-width: 0;
}

.dept-detail-panel__span {
  grid-column: 1 / -1;
}

.dept-detail-panel__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.dept-detail-panel__dl dd {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  word-break: break-all;
}

.dept-detail-panel__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.dept-detail-panel__people {
  display: flex;
  flex-direction: column;
}

.dept-detail-panel__person {
  padding: 10px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.dept-detail-panel__person:first-child {
  padding-top: 0;
}

.dept-detail-panel__person:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.dept-detail-panel__person-name {
  color: var(--text-color);
  font-size: 13px;
  line-height: 20px;
}

.dept-detail-panel__person-meta {
  margin-top: 2px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
