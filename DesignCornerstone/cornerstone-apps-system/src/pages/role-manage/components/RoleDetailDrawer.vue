<template>
  <GrowDrawer
    v-model="visible"
    :title="detail ? `角色详情 · ${detail.name}` : '角色详情'"
    size="560px"
    append-to-body
    destroy-on-close
  >
    <p v-if="loading" class="role-detail__hint">加载中…</p>
    <div v-else-if="detail" class="role-detail">
      <section class="role-detail__section">
        <h4 class="role-detail__title">基本信息</h4>
        <dl class="role-detail__dl">
          <div><dt>名称</dt><dd>{{ detail.name }}</dd></div>
          <div><dt>编码</dt><dd>{{ detail.code }}</dd></div>
          <div><dt>排序</dt><dd>{{ detail.sort }}</dd></div>
          <div>
            <dt>状态</dt>
            <dd>
              <GrowTag :type="detail.enabled ? 'success' : 'danger'" size="small">
                {{ detail.enabled ? '启用' : '停用' }}
              </GrowTag>
              <GrowTag v-if="detail.builtIn" type="info" size="small">内置</GrowTag>
            </dd>
          </div>
          <div><dt>备注</dt><dd>{{ detail.remark || '-' }}</dd></div>
          <div><dt>更新时间</dt><dd>{{ formatTime(detail.updatedAt) }}</dd></div>
        </dl>
      </section>

      <section class="role-detail__section">
        <h4 class="role-detail__title">数据权限</h4>
        <div v-if="!detail.dataPerms.length" class="role-detail__hint">未配置数据权限</div>
        <div v-else class="role-detail__menus">
          <div v-for="perm in detail.dataPerms" :key="perm.menuName" class="role-detail__menu">
            <div class="role-detail__menu-title">{{ perm.menuTitle }}</div>
            <p class="role-detail__text">
              可编辑删除：{{ editScopeLabel(perm.editScope) }}
            </p>
            <p v-if="selfSummary(perm)" class="role-detail__hint">{{ selfSummary(perm) }}</p>
            <div v-if="perm.editScope === 'custom'" class="role-detail__tags">
              <GrowTag v-for="dept in perm.depts" :key="dept.id" size="small">
                {{ dept.name }}
              </GrowTag>
            </div>
            <div v-if="perm.editScope === 'specified'" class="role-detail__hint">
              <p
                v-for="row in perm.filters"
                :key="row.id"
                class="role-detail__text"
              >
                {{ filterConditionText(row, perm.columns) }}
              </p>
            </div>
            <p v-if="perm.editScope !== 'all'" class="role-detail__text">
              其它记录：{{ viewOtherLabel(perm.viewOther) }}
            </p>
            <p v-if="perm.editScope !== 'all' && viewSelfSummary(perm)" class="role-detail__hint">
              {{ viewSelfSummary(perm) }}
            </p>
            <div v-if="perm.editScope !== 'all' && perm.viewOther === 'specified'" class="role-detail__hint">
              <p
                v-for="row in perm.viewFilters"
                :key="row.id"
                class="role-detail__text"
              >
                {{ filterConditionText(row, perm.columns) }}
              </p>
            </div>
            <div v-if="!perm.columns.length" class="role-detail__hint">未勾选可见列</div>
            <div v-else class="role-detail__tables">
              <div
                v-for="group in groupColumns(perm.columns)"
                :key="group.code"
                class="role-detail__table"
              >
                <div class="role-detail__table-title">{{ group.title }}</div>
                <div class="role-detail__tags">
                  <GrowTag v-for="col in group.columns" :key="col.id" size="small">
                    {{ col.title }}
                  </GrowTag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="role-detail__section">
        <h4 class="role-detail__title">菜单和功能</h4>
        <div v-if="!menuGroups.length" class="role-detail__hint">未配置菜单权限</div>
        <div v-else class="role-detail__menus">
          <div v-for="group in menuGroups" :key="group.name" class="role-detail__menu">
            <div class="role-detail__menu-title">{{ group.title }}</div>
            <div v-if="group.functions.length" class="role-detail__tags">
              <GrowTag v-for="fn in group.functions" :key="fn.id" size="small">
                {{ fn.title }}
              </GrowTag>
            </div>
            <div v-else class="role-detail__hint">未勾选功能</div>
          </div>
        </div>
      </section>

      <section class="role-detail__section">
        <h4 class="role-detail__title">绑定账号（{{ detail.members.length }}）</h4>
        <div v-if="!detail.members.length" class="role-detail__hint">暂未绑定账号</div>
        <div v-else class="role-detail__people">
          <div v-for="member in detail.members" :key="member.userId" class="role-detail__person">
            <div class="role-detail__person-name">{{ member.username || member.name }}</div>
            <div class="role-detail__person-meta">
              {{ member.name ? `${member.name} · ${member.deptName}` : member.deptName }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { fetchAllSystemMenuFunctions } from '../../../api/systemMenuFunction'
import { fetchAllSystemMenuColumns } from '../../../api/systemMenuColumn'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import { getSystemRoleDetail } from '../../../api/systemRole'
import type { SystemMenuColumn } from '../../../types/systemMenuColumn'
import type { SystemMenuFunction } from '../../../types/systemMenuFunction'
import type { SystemRoleColumnRef, SystemRoleDataPermView, SystemRoleDetail, SystemRoleListItem } from '../../../types/systemRole'
import {
  editScopeLabel,
  filterOperatorLabel,
  filterValueLabel,
  formatTime,
  summarizeSelfRelated,
  toMessage,
  viewOtherLabel,
} from '../use/helpers'
import { findMenuTitle } from '../use/permTree'

defineOptions({
  name: 'RoleDetailDrawer',
})

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const detail = ref<SystemRoleDetail | null>(null)
const functions = ref<SystemMenuFunction[]>([])
const columns = ref<SystemMenuColumn[]>([])

const menuGroups = computed(() => {
  const current = detail.value
  if (!current) return []
  const fnMap = new Map(functions.value.map((item) => [item.id, item]))
  return current.menuNames.map((name) => ({
    name,
    title: current.menus.find((item) => item.name === name)?.title || name,
    functions: current.functionIds
      .map((id) => fnMap.get(id))
      .filter((item): item is SystemMenuFunction => Boolean(item) && item.menuName === name),
  }))
})

function groupColumns(columns: SystemRoleColumnRef[]) {
  const groups: Array<{ code: string; title: string; columns: SystemRoleColumnRef[] }> = []
  const index = new Map<string, (typeof groups)[number]>()
  for (const col of columns) {
    const code = col.tableCode || 'default'
    const current = index.get(code)
    if (current) {
      current.columns.push(col)
      continue
    }
    const next = { code, title: col.tableTitle || '未分组', columns: [col] }
    index.set(code, next)
    groups.push(next)
  }
  return groups
    .map((group) => ({
      ...group,
      columns: [...group.columns].sort(
        (a, b) => a.title.localeCompare(b.title, 'zh-CN') || a.code.localeCompare(b.code),
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN') || a.code.localeCompare(b.code))
}

function columnRefTitle(columns: SystemRoleColumnRef[], id: string) {
  const col = columns.find((item) => item.id === id)
  if (!col) return id
  return col.tableTitle ? `${col.tableTitle} / ${col.title}` : col.title
}

function selfSummary(perm: SystemRoleDataPermView) {
  if (perm.editScope !== 'self') return ''
  return summarizeSelfRelated(perm.selfRelated, (id) => columnRefTitle(perm.columns, id))
}

function viewSelfSummary(perm: SystemRoleDataPermView) {
  if (perm.viewOther !== 'self') return ''
  return summarizeSelfRelated(perm.viewSelfRelated, (id) => columnRefTitle(perm.columns, id))
}

function filterConditionText(row: { id: string; columnId: string; operator: string; value: string[] }, columns: SystemRoleColumnRef[]) {
  return `${columnRefTitle(columns, row.columnId)} ${filterOperatorLabel(row.operator)} ${filterValueLabel(row.value)}`
}

async function open(row: SystemRoleListItem) {
  detail.value = null
  visible.value = true
  loading.value = true
  try {
    const [role, menus, fns, cols] = await Promise.all([
      getSystemRoleDetail(row.id),
      fetchSystemMenuTree(),
      fetchAllSystemMenuFunctions(),
      fetchAllSystemMenuColumns(),
    ])
    functions.value = Array.isArray(fns) ? fns : []
    columns.value = Array.isArray(cols) ? cols : []
    const menuList = Array.isArray(menus) ? menus : []
    const colMap = new Map(columns.value.map((item) => [item.id, item]))
    detail.value = {
      ...role,
      menus: (role.menuNames || []).map((name) => ({
        name,
        title: findMenuTitle(menuList, name),
      })),
      functions: (role.functionIds || []).map((id) => {
        const item = functions.value.find((fn) => fn.id === id)
        return {
          id,
          title: item?.title || id,
          code: item?.code || id,
          menuName: item?.menuName || '',
          menuTitle: item ? findMenuTitle(menuList, item.menuName) : '',
        }
      }),
      dataPerms: (role.dataPerms || []).map((perm) => ({
        ...perm,
        menuTitle: findMenuTitle(menuList, perm.menuName),
        columns: (perm.columnIds || []).map((id) => {
          const col = colMap.get(id)
          return {
            id,
            title: col?.title || id,
            code: col?.code || id,
            tableCode: col?.tableCode || '',
            tableTitle: col?.tableTitle || '',
          }
        }),
      })),
    }
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.role-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-detail__section {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.role-detail__title {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.role-detail__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.role-detail__dl div {
  min-width: 0;
}

.role-detail__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-detail__dl dd {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  word-break: break-all;
}

.role-detail__text {
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
}

.role-detail__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.role-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.role-detail__tables {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.role-detail__table-title {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-detail__menus {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-detail__menu-title {
  color: var(--text-color);
  font-size: 13px;
  font-weight: 500;
}

.role-detail__people {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-detail__person {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--component-color, #fff);
}

.role-detail__person-name {
  color: var(--text-color);
  font-size: 13px;
}

.role-detail__person-meta {
  margin-top: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}
</style>
