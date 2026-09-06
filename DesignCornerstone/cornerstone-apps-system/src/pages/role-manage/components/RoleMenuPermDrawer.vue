<template>
  <GrowDrawer
    v-model="visible"
    :title="role ? `菜单和功能 · ${role.name}` : '菜单和功能'"
    size="780px"
    append-to-body
    destroy-on-close
    class="role-drawer"
  >
    <GrowWatchBox class="role-drawer__watch">
      <template #default="{ height }">
        <div v-if="height > 0" class="role-menu-perm" :style="{ height: `${height}px` }">
          <aside class="role-menu-perm__aside">
            <div class="role-menu-perm__section-title">菜单权限</div>
            <div v-if="!treeData.length" class="role-menu-perm__empty">
              暂无菜单，请先在菜单管理中配置
            </div>
            <GrowScrollbar v-else height="100%">
              <GrowTree
                :key="treeKey"
                :data="treeData"
                node-key="key"
                show-checkbox
                check-strictly
                highlight-current
                :expand-on-click-node="false"
                :check-on-click-node="false"
                :check-on-click-leaf="false"
                :current-node-key="activeMenuKey"
                :default-checked-keys="checkedKeys"
                :default-expanded-keys="expandedKeys"
                :props="{ label: 'title', children: 'children', disabled: 'disabled' }"
                @check="onCheck"
                @node-click="onNodeClick"
                @node-expand="onNodeExpand"
                @node-collapse="onNodeCollapse"
              >
                <template #default="{ data }">
                  <span class="role-menu-perm__tree-node">
                    <GrowIconify
                      :icon="data.directory ? 'ant-design:folder-outlined' : 'ant-design:appstore-outlined'"
                      :size="15"
                    />
                    <span class="role-menu-perm__tree-title">{{ data.title }}</span>
                    <span v-if="functionCountText(data)" class="role-menu-perm__tree-count">
                      {{ functionCountText(data) }}
                    </span>
                  </span>
                </template>
              </GrowTree>
            </GrowScrollbar>
          </aside>

          <main class="role-menu-perm__main">
            <template v-if="activeMenu">
              <div class="role-menu-perm__main-head">
                <div>
                  <div class="role-menu-perm__section-title">{{ activeMenu.title }}</div>
                  <div class="role-menu-perm__sub">
                    {{ activeMenuGranted ? '已授权菜单，可配置功能' : '勾选功能将自动授权该菜单' }}
                  </div>
                </div>
                <div class="role-menu-perm__main-actions">
                  <GrowButton
                    v-if="activeFunctions.length"
                    link
                    type="primary"
                    :disabled="!toggleableFunctions.length"
                    @click="onToggleAllFunctions(!allFunctionsChecked)"
                  >
                    {{ allFunctionsChecked ? '取消全选' : '全部勾选' }}
                  </GrowButton>
                  <GrowTag :type="activeMenuGranted ? 'success' : 'info'" size="small">
                    {{ activeMenuGranted ? '已授权' : '未授权' }}
                  </GrowTag>
                </div>
              </div>
              <div v-if="!activeFunctions.length" class="role-menu-perm__empty">
                该菜单暂无功能权限
              </div>
              <GrowScrollbar v-else height="100%">
                <div class="role-menu-perm__functions">
                  <label
                    v-for="item in activeFunctions"
                    :key="item.id"
                    class="role-menu-perm__function"
                    :class="{
                      'is-checked': checkedFunctionIds.includes(item.id),
                      'is-disabled': isFunctionDisabled(item),
                    }"
                  >
                    <GrowCheckbox
                      :model-value="checkedFunctionIds.includes(item.id)"
                      :disabled="isFunctionDisabled(item)"
                      @update:model-value="(value) => onToggleFunction(item.id, Boolean(value))"
                    />
                    <span class="role-menu-perm__function-main">
                      <span class="role-menu-perm__function-title">
                        {{ item.title }}
                        <GrowTag v-if="item.enabled === false" type="info" size="small">已停用</GrowTag>
                      </span>
                      <span class="role-menu-perm__function-code">{{ item.code }}</span>
                      <span v-if="item.description" class="role-menu-perm__function-description">
                        {{ item.description }}
                      </span>
                    </span>
                  </label>
                </div>
              </GrowScrollbar>
            </template>
            <div v-else class="role-menu-perm__empty">请选择菜单查看功能权限</div>
          </main>
        </div>
      </template>
    </GrowWatchBox>
    <template #footer>
      <div class="role-drawer__footer">
        <GrowSpace>
          <GrowButton @click="visible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="saving" @click="submit">
            确定
          </GrowButton>
        </GrowSpace>
      </div>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchAllSystemMenuFunctions } from '../../../api/systemMenuFunction'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import { getSystemRoleDetail, saveSystemRoleMenuPerm } from '../../../api/systemRole'
import type { SystemMenuFunction } from '../../../types/systemMenuFunction'
import type { RolePermTreeNode, SystemRoleListItem } from '../../../types/systemRole'
import { pickCheckedKeys, toMessage } from '../use/helpers'
import {
  buildRolePermTree,
  flattenRoleMenuTree,
  flattenRolePermTree,
  syncRoleDirectoryKeys,
  toggleRolePermNode,
} from '../use/permTree'

defineOptions({ name: 'RoleMenuPermDrawer' })

const emit = defineEmits<{
  success: []
}>()

const message = useMsg()
const visible = ref(false)
const saving = ref(false)
const role = ref<SystemRoleListItem | null>(null)
const treeData = ref<RolePermTreeNode[]>([])
const functions = ref<SystemMenuFunction[]>([])
const checkedKeys = ref<string[]>([])
const checkedFunctionIds = ref<string[]>([])
const historicalDisabledMenus = ref<string[]>([])
const activeMenuName = ref('')
const treeKey = ref(0)
const expandedKeys = ref<string[]>([])

function collectExpandableKeys(nodes: RolePermTreeNode[]): string[] {
  const keys: string[] = []
  const walk = (list: RolePermTreeNode[]) => {
    for (const node of list) {
      if (!node.children?.length) continue
      keys.push(node.key)
      walk(node.children)
    }
  }
  walk(nodes)
  return keys
}

const menuNodes = computed(() => flattenRoleMenuTree(treeData.value))
const permNodeMap = computed(() => new Map(
  flattenRolePermTree(treeData.value).map((item) => [item.key, item]),
))
const activeMenu = computed(() => menuNodes.value.find((item) => item.menuName === activeMenuName.value) || null)
const activeMenuKey = computed(() => activeMenu.value?.key)
const activeFunctions = computed(() => functions.value
  .filter((item) => item.menuName === activeMenuName.value)
  .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN')))

const effectiveMenuNames = computed(() => {
  const names = new Set(historicalDisabledMenus.value)
  for (const key of checkedKeys.value) {
    if (key.startsWith('menu:')) names.add(key.slice(5))
  }
  return [...names]
})

const activeMenuGranted = computed(() => effectiveMenuNames.value.includes(activeMenuName.value))
const functionMap = computed(() => new Map(functions.value.map((item) => [item.id, item])))
const functionCountByMenu = computed(() => {
  const selected = new Set(checkedFunctionIds.value)
  const map = new Map<string, { selected: number, total: number }>()
  for (const item of functions.value) {
    const current = map.get(item.menuName) || { selected: 0, total: 0 }
    current.total += 1
    if (selected.has(item.id)) current.selected += 1
    map.set(item.menuName, current)
  }
  return map
})

function functionCountText(data: RolePermTreeNode) {
  if (!data.menuName) return ''
  const count = functionCountByMenu.value.get(data.menuName)
  if (!count?.total) return ''
  return `${count.selected}/${count.total}`
}
const toggleableFunctions = computed(() =>
  activeFunctions.value.filter((item) => !isFunctionDisabled(item)),
)
const allFunctionsChecked = computed(() => {
  const list = toggleableFunctions.value
  return list.length > 0 && list.every((item) => checkedFunctionIds.value.includes(item.id))
})

function isFunctionDisabled(item: SystemMenuFunction) {
  return Boolean(activeMenu.value?.disabled) || item.enabled === false
}

function grantActiveMenu() {
  const menu = activeMenu.value
  if (!menu || menu.disabled || checkedKeys.value.includes(menu.key)) return
  checkedKeys.value = toggleRolePermNode(treeData.value, checkedKeys.value, menu.key, true)
  treeKey.value += 1
}

function onNodeClick(data: RolePermTreeNode) {
  if (data.menuName) activeMenuName.value = data.menuName
}

function onNodeExpand(data: RolePermTreeNode) {
  if (!expandedKeys.value.includes(data.key)) {
    expandedKeys.value = [...expandedKeys.value, data.key]
  }
}

function onNodeCollapse(data: RolePermTreeNode) {
  expandedKeys.value = expandedKeys.value.filter((key) => key !== data.key)
}

function onCheck(arg1: unknown, arg2?: unknown) {
  const rawNextKeys = pickCheckedKeys(arg1, arg2)
  const previous = new Set(checkedKeys.value)
  const next = new Set(rawNextKeys)
  const changedKey = [...new Set([...previous, ...next])]
    .find((key) => previous.has(key) !== next.has(key))
  const changedNode = changedKey ? permNodeMap.value.get(changedKey) : undefined
  const nextKeys = changedNode
    ? toggleRolePermNode(treeData.value, rawNextKeys, changedNode.key, next.has(changedNode.key))
    : syncRoleDirectoryKeys(treeData.value, rawNextKeys)
  const nextMenus = new Set(nextKeys
    .filter((key) => key.startsWith('menu:'))
    .map((key) => key.slice(5)))
  checkedFunctionIds.value = checkedFunctionIds.value.filter((id) => {
    const fn = functionMap.value.get(id)
    return Boolean(fn && (nextMenus.has(fn.menuName) || historicalDisabledMenus.value.includes(fn.menuName)))
  })
  checkedKeys.value = nextKeys
  treeKey.value += 1
}

function onToggleFunction(id: string, checked: boolean) {
  const item = functionMap.value.get(id)
  if (!item || isFunctionDisabled(item)) return
  const ids = new Set(checkedFunctionIds.value)
  if (checked) {
    ids.add(id)
    grantActiveMenu()
  }
  else ids.delete(id)
  checkedFunctionIds.value = [...ids]
}

function onToggleAllFunctions(checked: boolean) {
  const ids = new Set(checkedFunctionIds.value)
  for (const item of toggleableFunctions.value) {
    if (checked) ids.add(item.id)
    else ids.delete(item.id)
  }
  if (checked) grantActiveMenu()
  checkedFunctionIds.value = [...ids]
}

async function open(row: SystemRoleListItem) {
  role.value = row
  treeData.value = []
  functions.value = []
  checkedKeys.value = []
  checkedFunctionIds.value = []
  historicalDisabledMenus.value = []
  activeMenuName.value = ''
  expandedKeys.value = []
  visible.value = true
  try {
    const [detail, menus, rawFunctions] = await Promise.all([
      getSystemRoleDetail(row.id),
      fetchSystemMenuTree(),
      fetchAllSystemMenuFunctions(),
    ])
    treeData.value = buildRolePermTree(Array.isArray(menus) ? menus : [])
    expandedKeys.value = collectExpandableKeys(treeData.value)
    functions.value = Array.isArray(rawFunctions) ? rawFunctions : []
    const grantedMenus = Array.isArray(detail?.menuNames) ? detail.menuNames : []
    const nodeMap = new Map(flattenRoleMenuTree(treeData.value).map((item) => [item.menuName, item]))
    historicalDisabledMenus.value = grantedMenus.filter((name) => nodeMap.get(name)?.disabled)
    checkedKeys.value = syncRoleDirectoryKeys(
      treeData.value,
      grantedMenus.map((name) => `menu:${name}`),
    )
    checkedFunctionIds.value = Array.isArray(detail?.functionIds) ? [...detail.functionIds] : []
    activeMenuName.value = grantedMenus[0] || flattenRoleMenuTree(treeData.value)[0]?.menuName || ''
    treeKey.value += 1
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  }
}

async function submit() {
  const id = role.value?.id
  if (!id) return
  const menuNames = effectiveMenuNames.value
  const menuSet = new Set(menuNames)
  const functionIds = checkedFunctionIds.value.filter((functionId) => {
    const fn = functionMap.value.get(functionId)
    return Boolean(fn && menuSet.has(fn.menuName))
  })
  saving.value = true
  try {
    await saveSystemRoleMenuPerm(id, { menuNames, functionIds })
    message.success('保存成功')
    visible.value = false
    emit('success')
  } catch (error) {
    message.error(toMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.role-drawer__footer {
  display: flex;
  justify-content: flex-end;
}

.role-menu-perm {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.role-menu-perm__aside,
.role-menu-perm__main {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  padding: 16px;
}

.role-menu-perm__aside {
  border-right: 1px solid var(--layout-border-color);
}

.role-menu-perm__section-title {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.role-menu-perm__aside > .role-menu-perm__section-title {
  margin-bottom: 12px;
}

.role-menu-perm__main-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.role-menu-perm__main-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.role-menu-perm__sub,
.role-menu-perm__function-code,
.role-menu-perm__function-description {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-menu-perm__sub {
  margin-top: 4px;
}

.role-menu-perm__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
}

.role-menu-perm__tree-node {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 7px;
}

.role-menu-perm__tree-node :deep(.grow-iconify) {
  display: flex !important;
  flex: 0 0 auto;
}

.role-menu-perm__tree-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-menu-perm__tree-count {
  flex: 0 0 auto;
  color: var(--text-color-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.role-menu-perm__functions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-menu-perm__function {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--layout-container-background-color);
  cursor: pointer;
}

.role-menu-perm__function.is-checked {
  border-color: transparent;
  background: var(--color-primary-a08, var(--layout-color));
  box-shadow: none;
}

.role-menu-perm__function.is-disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.role-menu-perm__function-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.role-menu-perm__function-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-color);
  font-size: 13px;
}

.role-menu-perm__function-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
