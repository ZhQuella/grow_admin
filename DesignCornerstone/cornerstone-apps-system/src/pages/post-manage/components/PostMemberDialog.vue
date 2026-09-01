<template>
  <GrowDialog
    v-model="visible"
    :title="`${metricLabel} · ${post?.name || ''}`"
    width="760px"
    append-to-body
    destroy-on-close
  >
    <div v-loading="loading" class="post-members">
      <div class="post-members__summary">
        <span>配置岗位 <strong>{{ metricValue }}</strong></span>
        <span>人数 <strong>{{ members.length }}</strong></span>
      </div>
      <GrowTable :data="members" row-key="assignmentId" border empty-text="暂无对应人员">
        <GrowTableColumn prop="name" label="姓名" min-width="110" show-overflow-tooltip />
        <GrowTableColumn prop="employeeNo" label="工号" min-width="110" show-overflow-tooltip />
        <GrowTableColumn label="人员类型" min-width="90">
          <template #default="{ row }">{{ employeeTypeLabel(row.employeeType) }}</template>
        </GrowTableColumn>
        <GrowTableColumn label="任职类型" min-width="90">
          <template #default="{ row }">{{ row.assignmentType === 'primary' ? '主职' : '兼职' }}</template>
        </GrowTableColumn>
        <GrowTableColumn label="人员状态" min-width="90">
          <template #default="{ row }">{{ employeeStatusLabel(row.employeeStatus) }}</template>
        </GrowTableColumn>
        <GrowTableColumn prop="startDate" label="开始日期" min-width="110" />
      </GrowTable>
    </div>
    <template #footer>
      <GrowButton @click="visible = false">关闭</GrowButton>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { getSystemPostDetail } from '../../../api/systemPost'
import { employeeStatusLabel, employeeTypeLabel } from '../../../types/systemPerson'
import type { SystemPostDetail, SystemPostListItem, SystemPostMember } from '../../../types/systemPost'
import type { PostMemberMetric } from '../use/helpers'

defineOptions({ name: 'PostMemberDialog' })

const message = useMsg() as any
const visible = ref(false)
const loading = ref(false)
const post = ref<SystemPostListItem | null>(null)
const detail = ref<SystemPostDetail | null>(null)
const metric = ref<PostMemberMetric>('occupied')

const labels: Record<PostMemberMetric, string> = {
  formal: '全职人员',
  contractor: '外包人员',
  partTime: '兼职人员',
  intern: '实习人员',
  occupied: '全部人员',
  overstaffed: '超编人员',
}

const metricLabel = computed(() => labels[metric.value])
const metricValue = computed(() => {
  if (!post.value) return 0
  const values: Record<PostMemberMetric, number> = {
    formal: post.value.formalHeadcount,
    contractor: post.value.contractorHeadcount,
    partTime: post.value.partTimeHeadcount,
    intern: post.value.internHeadcount,
    occupied: post.value.occupied,
    overstaffed: post.value.overstaffed,
  }
  return values[metric.value]
})

const members = computed<SystemPostMember[]>(() => {
  const rows = detail.value?.members || []
  if (metric.value === 'formal') {
    return rows.filter((item) => item.assignmentType === 'primary' && item.employeeType === 'full_time')
  }
  if (metric.value === 'contractor') {
    return rows.filter((item) => item.assignmentType === 'primary' && item.employeeType === 'contractor')
  }
  if (metric.value === 'partTime') {
    return rows.filter((item) => item.assignmentType === 'part_time')
  }
  if (metric.value === 'intern') {
    return rows.filter((item) => item.assignmentType === 'primary' && item.employeeType === 'intern')
  }
  const occupying = rows.filter((item) => item.occupyHeadcount)
  if (metric.value === 'overstaffed') {
    return [...occupying]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, detail.value?.overstaffed || 0)
  }
  return occupying
})

async function open(row: SystemPostListItem, value: PostMemberMetric) {
  post.value = row
  metric.value = value
  detail.value = null
  visible.value = true
  loading.value = true
  try {
    detail.value = await getSystemPostDetail(row.id)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载人员失败')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.post-members {
  min-height: 180px;
}

.post-members__summary {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
  color: var(--text-color-secondary);
}

.post-members__summary strong {
  margin-left: 4px;
  color: var(--text-color-primary);
  font-variant-numeric: tabular-nums;
}
</style>
