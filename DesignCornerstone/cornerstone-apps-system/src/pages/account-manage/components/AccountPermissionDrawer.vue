<template>
  <GrowDrawer
    v-model="visible"
    :title="account ? `权限明细 · ${account.username}` : '权限明细'"
    size="680px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="account-permission__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div class="account-permission">
            <div v-if="loading" class="account-permission__empty">加载中…</div>
            <template v-else-if="views.length">
              <GrowTabs v-model="activeTab" class="account-permission__tabs">
                <GrowTabPane
                  v-for="item in views"
                  :key="item.id"
                  :name="item.id"
                  :label="item.label"
                >
                  <template #label>
                    <span class="account-permission__tab-label">
                      {{ item.label }}
                      <GrowTag v-if="item.id !== 'all' && !item.enabled" size="small" type="info">已停用</GrowTag>
                    </span>
                  </template>
                </GrowTabPane>
              </GrowTabs>

              <div v-if="currentView" class="account-permission__content">
                <p v-if="currentView.id === 'all'" class="account-permission__note">
                  仅汇总启用角色的有效权限；行权限规则之间为「或」关系。
                </p>
                <p v-else-if="!currentView.enabled" class="account-permission__note account-permission__note--disabled">
                  该角色已停用，以下为保留的历史配置，不参与当前有效权限。
                </p>

                <section class="account-permission__section">
                  <h4>菜单与功能</h4>
                  <div v-if="!currentView.menuGroups.length" class="account-permission__empty">未配置菜单权限</div>
                  <div v-else class="account-permission__groups">
                    <div v-for="group in currentView.menuGroups" :key="group.name" class="account-permission__group">
                      <div class="account-permission__group-title">{{ group.title }}</div>
                      <div v-if="group.functions.length" class="account-permission__tags">
                        <GrowTag v-for="fn in group.functions" :key="fn.id" size="small">{{ fn.title }}</GrowTag>
                      </div>
                      <span v-else class="account-permission__muted">未配置功能权限</span>
                    </div>
                  </div>
                </section>

                <section class="account-permission__section">
                  <h4>数据权限</h4>
                  <div v-if="!currentView.dataGroups.length" class="account-permission__empty">未配置数据权限</div>
                  <div v-else class="account-permission__groups">
                    <div v-for="group in currentView.dataGroups" :key="group.name" class="account-permission__group">
                      <div class="account-permission__group-title">{{ group.title }}</div>
                      <div class="account-permission__rules">
                        <div v-for="rule in group.rules" :key="rule.key" class="account-permission__rule">
                          <GrowTag v-if="currentView.id === 'all'" size="small" type="info">{{ rule.roleName }}</GrowTag>
                          <span>可编辑删除：{{ editScopeLabel(rule.editScope) }}</span>
                          <span v-if="rule.editScope !== 'all'">其它记录：{{ viewOtherLabel(rule.viewOther) }}</span>
                        </div>
                      </div>
                      <div v-if="group.columns.length" class="account-permission__columns">
                        <span class="account-permission__muted">可见列</span>
                        <div class="account-permission__tags">
                          <GrowTag v-for="column in group.columns" :key="column.id" size="small">
                            {{ column.tableTitle ? `${column.tableTitle} / ${column.title}` : column.title }}
                          </GrowTag>
                        </div>
                      </div>
                      <span v-else class="account-permission__muted">未勾选可见列</span>
                      <div v-if="group.editableColumns.length" class="account-permission__columns">
                        <span class="account-permission__muted">可编辑列</span>
                        <div class="account-permission__tags">
                          <GrowTag v-for="column in group.editableColumns" :key="column.id" size="small" type="success">
                            {{ column.tableTitle ? `${column.tableTitle} / ${column.title}` : column.title }}
                          </GrowTag>
                        </div>
                      </div>
                      <span v-else class="account-permission__muted">未授权可编辑列</span>
                    </div>
                  </div>
                </section>
              </div>
            </template>
            <div v-else class="account-permission__empty">该账号未绑定角色</div>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer><GrowButton @click="visible = false">关闭</GrowButton></template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchAllSystemMenuFunctions } from '../../../api/systemMenuFunction'
import { fetchAllSystemMenuColumns } from '../../../api/systemMenuColumn'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import { getSystemRoleDetail } from '../../../api/systemRole'
import type { SystemMenuColumn } from '../../../types/systemMenuColumn'
import type { SystemMenuFunction } from '../../../types/systemMenuFunction'
import type { SystemRoleDataPermItem, SystemRoleDetail } from '../../../types/systemRole'
import type { SystemAccountListItem } from '../../../types/systemAccount'
import { editScopeLabel, viewOtherLabel } from '../../role-manage/use/helpers'
import { findMenuTitle } from '../../role-manage/use/permTree'
import { toMessage } from '../use/helpers'

type PermissionRule = SystemRoleDataPermItem & { key: string; roleName: string }
type PermissionColumn = { id: string; title: string; tableTitle: string }
type PermissionView = {
  id: string
  label: string
  enabled: boolean
  menuGroups: Array<{ name: string; title: string; functions: SystemMenuFunction[] }>
  dataGroups: Array<{
    name: string
    title: string
    rules: PermissionRule[]
    columns: PermissionColumn[]
    editableColumns: PermissionColumn[]
  }>
}

defineOptions({ name: 'AccountPermissionDrawer' })

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const account = ref<SystemAccountListItem | null>(null)
const activeTab = ref('all')
const views = ref<PermissionView[]>([])
const currentView = computed(() => views.value.find((item) => item.id === activeTab.value) || views.value[0])

function buildView(
  id: string,
  label: string,
  enabled: boolean,
  roles: SystemRoleDetail[],
  functions: SystemMenuFunction[],
  columns: SystemMenuColumn[],
  menuTitle: (name: string) => string,
): PermissionView {
  const menuNames = [...new Set(roles.flatMap((role) => role.menuNames || []))]
  const functionIds = new Set(roles.flatMap((role) => role.functionIds || []))
  const functionMap = new Map(functions.map((item) => [item.id, item]))
  const columnMap = new Map(columns.map((item) => [item.id, item]))
  const rules = roles.flatMap((role) => (role.dataPerms || []).map((rule, index) => ({
    ...rule,
    key: `${role.id}:${rule.menuName}:${index}`,
    roleName: role.name,
  })))
  const dataMenus = [...new Set(rules.map((item) => item.menuName))]

  return {
    id,
    label,
    enabled,
    menuGroups: menuNames.map((name) => ({
      name,
      title: menuTitle(name),
      functions: [...functionIds]
        .map((functionId) => functionMap.get(functionId))
        .filter((item): item is SystemMenuFunction => Boolean(item && item.menuName === name)),
    })),
    dataGroups: dataMenus.map((name) => {
      const groupRules = rules.filter((item) => item.menuName === name)
      const columnIds = [...new Set(groupRules.flatMap((item) => item.columnIds || []))]
      const editableColumnIds = new Set(groupRules.flatMap((item) => item.editableColumnIds || []))
      const toPermissionColumn = (columnId: string): PermissionColumn => {
        const column = columnMap.get(columnId)
        return {
          id: columnId,
          title: column?.title || columnId,
          tableTitle: column?.tableTitle || '',
        }
      }
      return {
        name,
        title: menuTitle(name),
        rules: groupRules,
        columns: columnIds.map(toPermissionColumn),
        editableColumns: columnIds.filter((id) => editableColumnIds.has(id)).map(toPermissionColumn),
      }
    }),
  }
}

async function open(row: SystemAccountListItem) {
  account.value = row
  activeTab.value = 'all'
  views.value = []
  visible.value = true
  if (!row.roleIds.length) return
  loading.value = true
  try {
    const [roles, menus, functions, columns] = await Promise.all([
      Promise.all(row.roleIds.map((id) => getSystemRoleDetail(id))),
      fetchSystemMenuTree(),
      fetchAllSystemMenuFunctions(),
      fetchAllSystemMenuColumns(),
    ])
    const menuList = Array.isArray(menus) ? menus : []
    const functionList = Array.isArray(functions) ? functions : []
    const columnList = Array.isArray(columns) ? columns : []
    const titleOf = (name: string) => findMenuTitle(menuList, name)
    const enabledRoles = roles.filter((role) => role.enabled)
    views.value = [
      buildView('all', '全部', true, enabledRoles, functionList, columnList, titleOf),
      ...roles.map((role) => buildView(role.id, role.name, role.enabled, [role], functionList, columnList, titleOf)),
    ]
  } catch (error) {
    message.error(toMessage(error, '权限明细加载失败'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.account-permission__watch {
  height: 100%;
  min-height: 280px;
}

.account-permission {
  padding: 0 16px 16px;
}

.account-permission__tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  padding-top: 8px;
  background: var(--component-background-color);
}

.account-permission__tab-label,
.account-permission__rule,
.account-permission__columns {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.account-permission__content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.account-permission__note {
  margin: 0;
  padding: 9px 12px;
  border-left: 3px solid var(--primary-color);
  border-radius: 4px;
  color: var(--text-color-secondary);
  background: var(--layout-container-background-color);
  font-size: 12px;
  line-height: 1.6;
}

.account-permission__note--disabled {
  border-left-color: var(--warning-color, #e6a23c);
}

.account-permission__section h4 {
  margin: 0 0 10px;
  font-size: 14px;
}

.account-permission__groups {
  border-top: 1px solid var(--layout-border-color);
}

.account-permission__group {
  padding: 12px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.account-permission__group-title {
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}

.account-permission__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.account-permission__rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.account-permission__rule {
  color: var(--text-color);
  font-size: 12px;
}

.account-permission__muted,
.account-permission__empty {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.account-permission__empty {
  padding: 24px 0;
  text-align: center;
}
</style>
