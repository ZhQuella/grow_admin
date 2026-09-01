<template>
  <span v-if="field === 'name'" class="post-cell__department">
    <GrowIconify icon="ant-design:folder-open-outlined" :size="16" />
    {{ row.name }}
  </span>

  <GrowTag v-else-if="field === 'enabled'" :type="row.enabled ? 'success' : 'info'" size="small">
    {{ row.enabled ? '启用' : '停用' }}
  </GrowTag>

  <div v-else-if="field === 'actions'" class="post-cell__actions">
    <GrowTooltip :content="row.enabled ? '新增岗位' : '停用部门不能新增岗位'" placement="top">
      <span>
        <GrowButton
          class="post-cell__icon-btn"
          link
          type="primary"
          :disabled="!row.enabled"
          @click="emit('create', row.entityId)"
        >
          <GrowIconify icon="ant-design:plus-outlined" :size="16" />
        </GrowButton>
      </span>
    </GrowTooltip>
  </div>

  <div v-else-if="isPostField" class="post-cell__list">
    <div v-if="!row.posts.length" class="post-cell__empty">
      {{ field === 'postName' ? '暂无直属岗位' : '-' }}
    </div>
    <div
      v-for="post in row.posts"
      :key="post.id"
      class="post-cell__row"
      :class="{ 'is-left': field === 'postName' || field === 'postCode' }"
    >
      <strong v-if="field === 'postName'" class="post-cell__ellipsis">{{ post.name }}</strong>
      <span v-else-if="field === 'postCode'" class="post-cell__code post-cell__ellipsis">{{ post.code }}</span>
      <GrowTooltip v-else-if="metricOf(field)" content="查看对应人员" placement="top">
        <GrowButton
          class="post-cell__number"
          :class="{ 'is-danger': field === 'postOverstaffed' && numberOf(post, field) > 0 }"
          link
          :type="field === 'postOverstaffed' && numberOf(post, field) > 0 ? 'danger' : 'primary'"
          @click="openMembers(post, field)"
        >
          {{ numberOf(post, field) }}
        </GrowButton>
      </GrowTooltip>
      <GrowTooltip
        v-else-if="field === 'postEnabled'"
        :content="post.activePersonCount > 0 && post.enabled ? '有效任职，不能停用' : (post.enabled ? '停用' : '启用')"
        placement="top"
      >
        <span class="post-cell__switch">
          <GrowSwitch
            :model-value="post.enabled"
            size="small"
            @update:model-value="(value) => emit('toggle', post, Boolean(value))"
          />
        </span>
      </GrowTooltip>
      <div v-else-if="field === 'postActions'" class="post-cell__actions">
        <GrowTooltip content="详情" placement="top">
          <GrowButton class="post-cell__icon-btn" link type="primary" @click="emit('detail', post)">
            <GrowIconify icon="ant-design:profile-outlined" :size="16" />
          </GrowButton>
        </GrowTooltip>
        <GrowTooltip content="编辑" placement="top">
          <GrowButton class="post-cell__icon-btn" link type="primary" @click="emit('edit', post)">
            <GrowIconify icon="ant-design:edit-outlined" :size="16" />
          </GrowButton>
        </GrowTooltip>
      </div>
    </div>
  </div>

  <template v-else>{{ row[field] ?? '-' }}</template>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import type { SystemPostListItem } from '../../../types/systemPost'
import type { PostTreeRow } from '../use/usePostTable'

export type PostMemberMetric = 'formal' | 'contractor' | 'partTime' | 'occupied' | 'overstaffed'

defineOptions({ name: 'PostTableCell' })

const props = defineProps<{
  row: PostTreeRow
  field: string
}>()
const { row, field } = toRefs(props)

const emit = defineEmits<{
  create: [deptId: string]
  detail: [post: SystemPostListItem]
  edit: [post: SystemPostListItem]
  toggle: [post: SystemPostListItem, enabled: boolean]
  members: [post: SystemPostListItem, metric: PostMemberMetric]
}>()

const postFields = new Set([
  'postName',
  'postCode',
  'postFormal',
  'postContractor',
  'postPartTime',
  'postOccupied',
  'postOverstaffed',
  'postEnabled',
  'postActions',
])

const isPostField = computed(() => postFields.has(field.value))

function metricOf(value: string): PostMemberMetric | null {
  const map: Record<string, PostMemberMetric> = {
    postFormal: 'formal',
    postContractor: 'contractor',
    postPartTime: 'partTime',
    postOccupied: 'occupied',
    postOverstaffed: 'overstaffed',
  }
  return map[value] || null
}

function numberOf(post: SystemPostListItem, value: string) {
  const map: Record<string, number> = {
    postFormal: post.formalHeadcount,
    postContractor: post.contractorHeadcount,
    postPartTime: post.partTimeHeadcount,
    postOccupied: post.occupied,
    postOverstaffed: post.overstaffed,
  }
  return map[value] ?? 0
}

function openMembers(post: SystemPostListItem, value: string) {
  const metric = metricOf(value)
  if (metric) emit('members', post, metric)
}
</script>

<style scoped>
.post-cell__department {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.post-cell__list {
  width: 100%;
}

.post-cell__row,
.post-cell__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 44px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--layout-border-color);
}

.post-cell__row:last-child,
.post-cell__empty:last-child {
  border-bottom: 0;
}

.post-cell__empty {
  color: var(--text-color-secondary);
}

.post-cell__row.is-left,
.post-cell__list .post-cell__empty {
  justify-content: flex-start;
}

.post-cell__ellipsis {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-cell__code {
  color: var(--text-color-secondary);
}

.post-cell__number {
  min-width: 28px;
  height: 28px;
  padding: 0 4px;
  font-variant-numeric: tabular-nums;
}

.post-cell__number.is-danger {
  font-weight: 600;
}

.post-cell__switch,
.post-cell__actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.post-cell__actions {
  gap: 2px;
}

.post-cell__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.post-cell__icon-btn :deep(.grow-iconify) {
  display: flex !important;
}
</style>
