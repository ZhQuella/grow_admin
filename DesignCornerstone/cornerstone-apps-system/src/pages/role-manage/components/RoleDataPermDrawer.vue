<template>
  <GrowDrawer
    v-model="visible"
    :title="role ? `数据权限 · ${role.name}` : '数据权限'"
    size="920px"
    append-to-body
    destroy-on-close
    class="role-drawer"
  >
    <GrowWatchBox class="role-drawer__watch">
      <template #default="{ height }">
        <div v-if="height > 0 && !menus.length" class="role-data-perm__empty" :style="{ height: `${height}px` }">
          请先在「菜单和功能」中勾选菜单，再为每个菜单配置行权限和可见列。
        </div>
        <div
          v-else-if="height > 0"
          class="role-data-perm"
          :style="{ height: `${height}px` }"
        >
          <aside class="role-data-perm__aside">
            <div class="role-data-perm__aside-head">
              <div class="role-data-perm__aside-title">已授权菜单</div>
              <div class="role-data-perm__aside-count">{{ menus.length }}</div>
            </div>
            <GrowInput
              v-model="menuKeyword"
              clearable
              placeholder="搜索菜单"
            />
            <div class="role-data-perm__menu-scroll">
              <GrowScrollbar height="100%">
                <div v-if="!filteredMenuTree.length" class="role-data-perm__hint role-data-perm__hint--pad">
                  未找到匹配菜单
                </div>
                <GrowTree
                  v-else
                  :key="menuKeyword || 'all'"
                  class="role-data-perm__menu-tree"
                  :data="filteredMenuTree"
                  node-key="key"
                  highlight-current
                  default-expand-all
                  :expand-on-click-node="false"
                  :current-node-key="menuTreeCurrentKey"
                  :props="{ label: 'title', children: 'children', disabled: 'disabled' }"
                  @node-click="onMenuTreeClick"
                >
                  <template #default="{ data }">
                    <span
                      class="role-data-perm__menu-label"
                      :class="{ 'is-dir': isDirectoryNode(data) }"
                      @click="onMenuLabelClick($event, data)"
                    >{{ data.title }}</span>
                  </template>
                </GrowTree>
              </GrowScrollbar>
            </div>
          </aside>

          <div v-if="activeMenu && activeDraft" class="role-data-perm__main">
            <GrowScrollbar height="100%">
              <div class="role-data-perm__panel">
                <header class="role-data-perm__header">
                  <div>
                    <div class="role-data-perm__header-title">{{ activeMenu.title }}</div>
                    <div class="role-data-perm__header-sub">{{ activeMenu.group }}</div>
                  </div>
                </header>

                <section class="role-data-perm__card">
                  <div class="role-data-perm__block">
                    <h4 class="role-data-perm__title">可编辑和删除的记录范围</h4>
                    <div class="role-data-perm__radios">
                      <div
                        v-for="item in EDIT_SCOPE_OPTIONS"
                        :key="item.value"
                        class="role-data-perm__radio-wrap"
                      >
                        <button
                          type="button"
                          class="role-data-perm__radio"
                          :class="{ 'is-active': activeDraft.editScope === item.value }"
                          @click="onEditScopeChange(item.value)"
                        >
                          <span class="role-data-perm__radio-dot" />
                          <span>{{ item.label }}</span>
                        </button>
                        <RowSelfRelatedEditor
                          v-if="activeDraft.editScope === item.value && item.value === 'self'"
                          :model-value="activeDraft.selfRelated"
                          :columns="activeColumns"
                          @update:model-value="(value) => { activeDraft.selfRelated = value }"
                        />
                        <div
                          v-if="activeDraft.editScope === item.value && item.value === 'custom'"
                          class="role-data-perm__custom"
                        >
                          <div class="role-data-perm__custom-bar">
                            <GrowInput
                              v-model="deptKeyword"
                              clearable
                              placeholder="搜索部门"
                            />
                            <div class="role-data-perm__custom-actions">
                              <span>已选 {{ activeDraft.deptIds.length }} 个部门</span>
                              <GrowButton link type="primary" @click="selectAllDepts">全选</GrowButton>
                              <GrowButton link @click="clearDepts">清空</GrowButton>
                            </div>
                          </div>
                          <p v-if="!activeDraft.deptIds.length" class="role-data-perm__warn">
                            自定义部门至少勾选一个部门
                          </p>
                          <div v-if="filteredDeptTree.length" class="role-data-perm__tree">
                            <GrowTree
                              :key="`${activeMenuName}-${treeKey}`"
                              :data="filteredDeptTree"
                              node-key="id"
                              show-checkbox
                              default-expand-all
                              :default-checked-keys="activeDraft.deptIds"
                              :props="{ label: 'title', children: 'children' }"
                              @check="onCheck"
                            />
                          </div>
                          <p v-else class="role-data-perm__hint">未找到匹配部门</p>
                          <div v-if="selectedDeptNames.length" class="role-data-perm__tags">
                            <GrowTag
                              v-for="name in selectedDeptNames"
                              :key="name"
                              size="small"
                            >
                              {{ name }}
                            </GrowTag>
                          </div>
                        </div>
                        <RowFilterEditor
                          v-if="activeDraft.editScope === item.value && item.value === 'specified'"
                          :model-value="activeDraft.filters"
                          :columns="enabledColumns"
                          :dept-tree="deptTree"
                          @update:model-value="(value) => { activeDraft.filters = value }"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-if="activeDraft.editScope !== 'all'" class="role-data-perm__block">
                    <div class="role-data-perm__block-title">
                      <h4 class="role-data-perm__title">其它记录权限</h4>
                      <GrowTooltip
                        content="不在上方可编辑删除范围内的记录，按此规则决定能否查看"
                        placement="top"
                      >
                        <GrowIconify icon="ant-design:question-circle-outlined" :size="14" />
                      </GrowTooltip>
                    </div>
                    <div class="role-data-perm__radios">
                      <div
                        v-for="item in VIEW_OTHER_OPTIONS"
                        :key="item.value"
                        class="role-data-perm__radio-wrap"
                      >
                        <button
                          type="button"
                          class="role-data-perm__radio"
                          :class="{ 'is-active': activeDraft.viewOther === item.value }"
                          @click="onViewOtherChange(item.value)"
                        >
                          <span class="role-data-perm__radio-dot" />
                          <span>{{ item.label }}</span>
                        </button>
                        <RowSelfRelatedEditor
                          v-if="activeDraft.viewOther === item.value && item.value === 'self'"
                          :model-value="activeDraft.viewSelfRelated"
                          :columns="activeColumns"
                          @update:model-value="(value) => { activeDraft.viewSelfRelated = value }"
                        />
                        <RowFilterEditor
                          v-if="activeDraft.viewOther === item.value && item.value === 'specified'"
                          :model-value="activeDraft.viewFilters"
                          :columns="enabledColumns"
                          :dept-tree="deptTree"
                          @update:model-value="(value) => { activeDraft.viewFilters = value }"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section class="role-data-perm__card">
                  <div class="role-data-perm__card-head">
                    <div>
                      <h4 class="role-data-perm__title">列权限</h4>
                      <span class="role-data-perm__card-extra">按表勾选可见列，同一菜单下的多张表分别配置</span>
                    </div>
                    <div v-if="enabledColumns.length" class="role-data-perm__custom-actions">
                      <span>已选 {{ checkedColumnCount }}/{{ enabledColumns.length }}</span>
                      <GrowButton link type="primary" @click="selectAllColumns">全部全选</GrowButton>
                      <GrowButton link @click="clearColumns">全部清空</GrowButton>
                    </div>
                  </div>
                  <p v-if="!columnGroups.length" class="role-data-perm__hint">
                    该菜单暂无表定义，请先在菜单管理中按表配置。
                  </p>
                  <div v-else class="role-data-perm__table-list">
                    <section
                      v-for="group in columnGroups"
                      :key="group.code"
                      class="role-data-perm__table"
                    >
                      <div class="role-data-perm__table-head">
                        <div>
                          <div class="role-data-perm__table-title">{{ group.title }}</div>
                          <div class="role-data-perm__table-code">{{ group.code }}</div>
                        </div>
                        <div class="role-data-perm__custom-actions">
                          <span>已选 {{ tableCheckedCount(group) }}/{{ tableEnabledCount(group) }}</span>
                          <GrowButton link type="primary" @click="selectTableColumns(group.code)">全选</GrowButton>
                          <GrowButton link @click="clearTableColumns(group.code)">清空</GrowButton>
                        </div>
                      </div>
                      <div class="role-data-perm__columns">
                        <label
                          v-for="col in group.columns"
                          :key="col.id"
                          class="role-data-perm__column"
                          :class="{
                            'is-checked': activeDraft.columnIds.includes(col.id),
                            'is-disabled': !col.enabled,
                          }"
                        >
                          <GrowCheckbox
                            :model-value="activeDraft.columnIds.includes(col.id)"
                            :disabled="!col.enabled"
                            @update:model-value="(value) => onToggleColumn(col.id, Boolean(value))"
                          />
                          <span class="role-data-perm__column-text">
                            <span class="role-data-perm__column-title">
                              {{ col.title }}
                              <GrowTag v-if="!col.enabled" type="info" size="small">停用</GrowTag>
                            </span>
                            <span class="role-data-perm__column-code">{{ col.code }}</span>
                          </span>
                        </label>
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </GrowScrollbar>
          </div>
        </div>
      </template>
    </GrowWatchBox>
    <template #footer>
      <div class="role-drawer__footer">
        <GrowSpace>
          <GrowButton @click="visible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="saving" :disabled="!menus.length" @click="submit">
            确定
          </GrowButton>
        </GrowSpace>
      </div>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchAllSystemMenuColumns } from '../../../api/systemMenuColumn'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import {
  fetchSystemDeptTree,
  getSystemRoleDetail,
  saveSystemRoleDataPerm,
} from '../../../api/systemRole'
import type { SystemMenuColumn } from '../../../types/systemMenuColumn'
import {
  EDIT_SCOPE_OPTIONS,
  VIEW_OTHER_OPTIONS,
  type EditScope,
  type SelfRelatedConfig,
  type SystemDeptTreeNode,
  type SystemRoleDataPermItem,
  type SystemRoleListItem,
  type ViewOtherScope,
} from '../../../types/systemRole'
import {
  emptyFilterCondition,
  emptySelfRelated,
  isEditScope,
  isViewOther,
  pickCheckedKeys,
  toMessage,
} from '../use/helpers'
import RowFilterEditor from './RowFilterEditor.vue'
import RowSelfRelatedEditor from './RowSelfRelatedEditor.vue'
import {
  buildGrantedMenuTree,
  filterGrantedMenuTree,
  flattenGrantedMenuTree,
  type GrantedMenuItem,
  type GrantedMenuTreeNode,
} from '../use/permTree'

type Draft = {
  editScope: EditScope
  viewOther: ViewOtherScope
  deptIds: string[]
  selfRelated: SelfRelatedConfig
  viewSelfRelated: SelfRelatedConfig
  filters: SystemRoleDataPermItem['filters']
  viewFilters: SystemRoleDataPermItem['viewFilters']
  columnIds: string[]
}

defineOptions({
  name: 'RoleDataPermDrawer',
})

const emit = defineEmits<{
  success: []
}>()

const message = useMsg()
const visible = ref(false)
const saving = ref(false)
const role = ref<SystemRoleListItem | null>(null)
const menus = ref<GrantedMenuItem[]>([])
const menuTree = ref<GrantedMenuTreeNode[]>([])
const activeMenuName = ref('')
const menuKeyword = ref('')
const deptKeyword = ref('')
const deptTree = ref<SystemDeptTreeNode[]>([])
const columns = ref<SystemMenuColumn[]>([])
const drafts = ref<Record<string, Draft>>({})
const treeKey = ref(0)

const activeMenu = computed(() => menus.value.find((item) => item.name === activeMenuName.value) || null)
const activeDraft = computed(() => drafts.value[activeMenuName.value] || null)
const activeMenuKey = computed(() => (activeMenuName.value ? `menu:${activeMenuName.value}` : undefined))
const menuTreeCurrentKey = ref<string | undefined>()
const filteredMenuTree = computed(() => filterGrantedMenuTree(menuTree.value, menuKeyword.value))

watch(activeMenuKey, (key) => {
  menuTreeCurrentKey.value = key
}, { immediate: true })

const activeColumns = computed(() =>
  columns.value
    .filter((item) => item.menuName === activeMenuName.value)
    .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN') || a.code.localeCompare(b.code)),
)

const enabledColumns = computed(() => activeColumns.value.filter((item) => item.enabled !== false))

const columnGroups = computed(() => {
  const groups: Array<{ code: string; title: string; columns: SystemMenuColumn[] }> = []
  const index = new Map<string, (typeof groups)[number]>()
  for (const col of activeColumns.value) {
    const code = col.tableCode || 'default'
    const current = index.get(code)
    if (current) {
      current.columns.push(col)
      continue
    }
    const next = {
      code,
      title: col.tableTitle || '未分组',
      columns: [col],
    }
    index.set(code, next)
    groups.push(next)
  }
  return groups.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN') || a.code.localeCompare(b.code))
})

const checkedColumnCount = computed(() => {
  const draft = activeDraft.value
  if (!draft) return 0
  const ids = new Set(draft.columnIds)
  return enabledColumns.value.filter((item) => ids.has(item.id)).length
})

const deptTitleMap = computed(() => {
  const map = new Map<string, string>()
  const walk = (nodes: SystemDeptTreeNode[]) => {
    for (const node of nodes) {
      map.set(node.id, node.title)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(deptTree.value)
  return map
})

const selectedDeptNames = computed(() => {
  const draft = activeDraft.value
  if (!draft) return []
  return draft.deptIds
    .map((id) => deptTitleMap.value.get(id) || id)
})

const filteredDeptTree = computed(() => filterDeptTree(deptTree.value, deptKeyword.value))

function filterDeptTree(nodes: SystemDeptTreeNode[], keyword: string): SystemDeptTreeNode[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return nodes
  const walk = (list: SystemDeptTreeNode[]): SystemDeptTreeNode[] => {
    const next: SystemDeptTreeNode[] = []
    for (const node of list) {
      const children = node.children?.length ? walk(node.children) : []
      if (node.title.toLowerCase().includes(q) || children.length) {
        next.push(children.length ? { ...node, children } : { ...node, children: undefined })
      }
    }
    return next
  }
  return walk(nodes)
}

function collectDeptIds(nodes: SystemDeptTreeNode[]): string[] {
  const ids: string[] = []
  const walk = (list: SystemDeptTreeNode[]) => {
    for (const node of list) {
      ids.push(node.id)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

function tableEnabledCount(group: { columns: SystemMenuColumn[] }) {
  return group.columns.filter((item) => item.enabled !== false).length
}

function tableCheckedCount(group: { columns: SystemMenuColumn[] }) {
  const draft = activeDraft.value
  if (!draft) return 0
  const ids = new Set(draft.columnIds)
  return group.columns.filter((item) => item.enabled !== false && ids.has(item.id)).length
}

function isDirectoryNode(data: GrantedMenuTreeNode | undefined) {
  return Boolean(data) && !data?.menuName
}

function restoreMenuTreeCurrent() {
  const key = activeMenuKey.value
  menuTreeCurrentKey.value = undefined
  nextTick(() => {
    menuTreeCurrentKey.value = key
  })
}

function onSelectMenu(name: string) {
  if (activeMenuName.value === name) return
  activeMenuName.value = name
  deptKeyword.value = ''
  treeKey.value += 1
}

function onMenuLabelClick(event: MouseEvent, data: GrantedMenuTreeNode) {
  if (!isDirectoryNode(data)) return
  event.stopPropagation()
  restoreMenuTreeCurrent()
}

function onMenuTreeClick(data: GrantedMenuTreeNode) {
  if (isDirectoryNode(data)) {
    restoreMenuTreeCurrent()
    return
  }
  if (data?.menuName) onSelectMenu(data.menuName)
}

function onEditScopeChange(value: EditScope) {
  const current = activeDraft.value
  if (!current) return
  current.editScope = value
  if (value === 'all') current.viewOther = 'none'
  if (value === 'specified' && !current.filters.length) {
    current.filters = [emptyFilterCondition()]
  }
}

function onViewOtherChange(value: ViewOtherScope) {
  const current = activeDraft.value
  if (!current) return
  current.viewOther = value
  if (value === 'specified' && !current.viewFilters.length) {
    current.viewFilters = [emptyFilterCondition()]
  }
}

function onCheck(arg1: unknown, arg2?: unknown) {
  const current = activeDraft.value
  if (!current) return
  current.deptIds = pickCheckedKeys(arg1, arg2)
}

function onToggleColumn(id: string, checked: boolean) {
  const current = activeDraft.value
  if (!current) return
  const set = new Set(current.columnIds)
  if (checked) set.add(id)
  else set.delete(id)
  current.columnIds = [...set]
}

function selectAllColumns() {
  const current = activeDraft.value
  if (!current) return
  current.columnIds = enabledColumns.value.map((item) => item.id)
}

function clearColumns() {
  const current = activeDraft.value
  if (!current) return
  current.columnIds = []
}

function selectTableColumns(tableCode: string) {
  const current = activeDraft.value
  if (!current) return
  const ids = new Set(current.columnIds)
  for (const col of activeColumns.value) {
    if (col.tableCode === tableCode && col.enabled !== false) ids.add(col.id)
  }
  current.columnIds = [...ids]
}

function clearTableColumns(tableCode: string) {
  const current = activeDraft.value
  if (!current) return
  const drop = new Set(
    activeColumns.value.filter((item) => item.tableCode === tableCode).map((item) => item.id),
  )
  current.columnIds = current.columnIds.filter((id) => !drop.has(id))
}

function selectAllDepts() {
  const current = activeDraft.value
  if (!current) return
  current.deptIds = collectDeptIds(deptTree.value)
  treeKey.value += 1
}

function clearDepts() {
  const current = activeDraft.value
  if (!current) return
  current.deptIds = []
  treeKey.value += 1
}

function cloneSelfRelated(config?: SelfRelatedConfig): SelfRelatedConfig {
  return {
    createdBySelf: config?.createdBySelf !== false,
    fieldContainsSelf: Boolean(config?.fieldContainsSelf),
    columnIds: [...(config?.columnIds || [])],
  }
}

function emptyDraft(menuName: string): Draft {
  return {
    editScope: 'self',
    viewOther: 'none',
    deptIds: [],
    selfRelated: emptySelfRelated(),
    viewSelfRelated: emptySelfRelated(),
    filters: [],
    viewFilters: [],
    columnIds: columns.value
      .filter((item) => item.menuName === menuName && item.enabled !== false)
      .map((item) => item.id),
  }
}

function toSavedDraft(saved: SystemRoleDataPermItem, fallback: Draft): Draft {
  const editScope = isEditScope(saved.editScope) ? saved.editScope : fallback.editScope
  return {
    editScope,
    viewOther: editScope === 'all'
      ? 'none'
      : (isViewOther(saved.viewOther) ? saved.viewOther : fallback.viewOther),
    deptIds: [...(saved.deptIds || [])],
    selfRelated: cloneSelfRelated(saved.selfRelated),
    viewSelfRelated: cloneSelfRelated(saved.viewSelfRelated),
    filters: Array.isArray(saved.filters)
      ? saved.filters.map((item) => ({
          ...item,
          value: Array.isArray(item.value) ? [...item.value] : [],
        }))
      : [],
    viewFilters: Array.isArray(saved.viewFilters)
      ? saved.viewFilters.map((item) => ({
          ...item,
          value: Array.isArray(item.value) ? [...item.value] : [],
        }))
      : [],
    columnIds: [...(saved.columnIds || [])],
  }
}

function validateDraft(draft: Draft, title: string) {
  if (draft.editScope === 'custom' && !draft.deptIds.length) {
    return `请为「${title}」勾选自定义部门`
  }
  if (draft.editScope === 'self') {
    if (!draft.selfRelated.createdBySelf && !draft.selfRelated.fieldContainsSelf) {
      return `请为「${title}」至少选择一种与成员相关的记录`
    }
    if (draft.selfRelated.fieldContainsSelf && !draft.selfRelated.columnIds.length) {
      return `请为「${title}」勾选包含成员本人的字段`
    }
  }
  if (draft.editScope === 'specified') {
    if (!draft.filters.length) return `请为「${title}」添加筛选条件`
    if (draft.filters.some((item) => !item.columnId || !item.value.length)) {
      return `请为「${title}」补全筛选条件`
    }
  }
  if (draft.editScope === 'all') return ''
  if (draft.viewOther === 'self') {
    if (!draft.viewSelfRelated.createdBySelf && !draft.viewSelfRelated.fieldContainsSelf) {
      return `请为「${title}」至少选择一种其它记录的成员相关条件`
    }
    if (draft.viewSelfRelated.fieldContainsSelf && !draft.viewSelfRelated.columnIds.length) {
      return `请为「${title}」勾选其它记录中包含成员本人的字段`
    }
  }
  if (draft.viewOther === 'specified') {
    if (!draft.viewFilters.length) return `请为「${title}」添加其它记录的筛选条件`
    if (draft.viewFilters.some((item) => !item.columnId || !item.value.length)) {
      return `请为「${title}」补全其它记录的筛选条件`
    }
  }
  return ''
}

async function open(row: SystemRoleListItem) {
  role.value = row
  menus.value = []
  menuTree.value = []
  activeMenuName.value = ''
  menuKeyword.value = ''
  deptKeyword.value = ''
  drafts.value = {}
  visible.value = true
  try {
    const [detail, tree, rawMenus, cols] = await Promise.all([
      getSystemRoleDetail(row.id),
      fetchSystemDeptTree(),
      fetchSystemMenuTree(),
      fetchAllSystemMenuColumns(),
    ])
    deptTree.value = Array.isArray(tree) ? tree : []
    columns.value = Array.isArray(cols) ? cols : []
    const menuList = Array.isArray(rawMenus) ? rawMenus : []
    menuTree.value = buildGrantedMenuTree(menuList, detail.menuNames || [])
    menus.value = flattenGrantedMenuTree(menuTree.value)
    const existing = new Map((detail.dataPerms || []).map((item) => [item.menuName, item]))
    const next: Record<string, Draft> = {}
    for (const item of menus.value) {
      const saved = existing.get(item.name)
      next[item.name] = saved ? toSavedDraft(saved, emptyDraft(item.name)) : emptyDraft(item.name)
    }
    drafts.value = next
    activeMenuName.value = menus.value[0]?.name || ''
    treeKey.value += 1
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  }
}

async function submit() {
  const id = role.value?.id
  if (!id) return
  const items: SystemRoleDataPermItem[] = []
  for (const menu of menus.value) {
    const draft = drafts.value[menu.name]
    if (!draft) continue
    const error = validateDraft(draft, menu.title)
    if (error) {
      message.warning(error)
      activeMenuName.value = menu.name
      return
    }
    items.push({
      menuName: menu.name,
      editScope: draft.editScope,
      viewOther: draft.editScope === 'all' ? 'none' : draft.viewOther,
      deptIds: draft.editScope === 'custom' ? draft.deptIds : [],
      selfRelated: draft.editScope === 'self' ? draft.selfRelated : emptySelfRelated(),
      viewSelfRelated: draft.editScope !== 'all' && draft.viewOther === 'self'
        ? draft.viewSelfRelated
        : emptySelfRelated(),
      filters: draft.editScope === 'specified' ? draft.filters : [],
      viewFilters: draft.editScope !== 'all' && draft.viewOther === 'specified'
        ? draft.viewFilters
        : [],
      columnIds: draft.columnIds,
    })
  }
  saving.value = true
  try {
    await saveSystemRoleDataPerm(id, items)
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

.role-data-perm {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.role-data-perm__aside {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  width: 280px;
  min-height: 0;
  padding: 16px 12px 16px 16px;
  border-right: 1px solid var(--layout-border-color);
}

.role-data-perm__aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-data-perm__aside-title {
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}

.role-data-perm__aside-count {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-data-perm__aside :deep(.el-input),
.role-data-perm__custom-bar :deep(.el-input),
.role-data-perm__aside :deep(.n-input) {
  width: 100%;
}

.role-data-perm__menu-scroll {
  flex: 1;
  min-height: 0;
}

.role-data-perm__menu-tree {
  background: transparent;
}

.role-data-perm__aside :deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
  align-items: flex-start;
  padding: 6px 8px;
}

.role-data-perm__aside :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--color-primary-a08, var(--layout-color));
}

.role-data-perm__aside :deep(.el-tree-node.is-disabled > .el-tree-node__content) {
  cursor: default;
  opacity: 1;
  background: transparent;
}

.role-data-perm__menu-label {
  display: block;
  flex: 1;
  min-width: 0;
  line-height: 20px;
}

.role-data-perm__menu-label.is-dir {
  color: var(--text-color-secondary);
  font-weight: 600;
  cursor: default;
}

.role-data-perm__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.role-data-perm__panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 24px;
}

.role-data-perm__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.role-data-perm__header-title {
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.role-data-perm__header-sub {
  margin-top: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-data-perm__card {
  padding: 16px;
  border: 1px solid var(--layout-border-color);
  border-radius: 10px;
  background: var(--component-background-color);
}

.role-data-perm__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.role-data-perm__title {
  margin: 0;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.role-data-perm__card-extra {
  display: block;
  margin-top: 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.role-data-perm__block > .role-data-perm__title {
  margin-bottom: 12px;
}

.role-data-perm__block + .role-data-perm__block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--layout-border-color);
}

.role-data-perm__block-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.role-data-perm__block-title .role-data-perm__title {
  margin: 0;
}

.role-data-perm__radios {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-data-perm__radio-wrap {
  display: flex;
  flex-direction: column;
}

.role-data-perm__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: var(--text-color);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.role-data-perm__radio-dot {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 50%;
  background: var(--component-background-color);
}

.role-data-perm__radio.is-active .role-data-perm__radio-dot {
  border-color: var(--primary-color);
  box-shadow: inset 0 0 0 4px var(--primary-color);
}

.role-data-perm__custom {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0 8px 28px;
}

.role-data-perm__custom-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-data-perm__custom-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-data-perm__tree {
  max-height: 280px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--layout-color);
}

.role-data-perm__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-data-perm__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.role-data-perm__table-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-data-perm__table {
  padding: 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--layout-color);
}

.role-data-perm__table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.role-data-perm__table-title {
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}

.role-data-perm__table-code {
  margin-top: 2px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-data-perm__column {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 8px;
  background: var(--layout-color);
  color: var(--text-color);
  cursor: pointer;
}

.role-data-perm__column.is-checked {
  border-color: var(--primary-color);
  background: var(--color-primary-a08, var(--layout-color));
}

.role-data-perm__column.is-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.role-data-perm__column-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.role-data-perm__column-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 1.4;
}

.role-data-perm__column-code {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.role-data-perm__hint,
.role-data-perm__empty,
.role-data-perm__warn {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.role-data-perm__hint {
  color: var(--text-color-secondary);
}

.role-data-perm__hint--pad {
  padding: 24px 8px;
  text-align: center;
}

.role-data-perm__warn {
  color: var(--error-color, #d03050);
}

.role-data-perm__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  color: var(--text-color-secondary);
  text-align: center;
}
</style>

<style>
/* Drawer 挂到 body，需非 scoped 才能锁住 body 高度 */
.role-drawer.el-drawer,
.role-drawer.n-drawer {
  display: flex;
  flex-direction: column;
}

.role-drawer .n-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.role-drawer .el-drawer__body,
.role-drawer .n-drawer-body,
.role-drawer .n-drawer-body-content-wrapper {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.role-drawer__watch {
  flex: 1;
  height: 100%;
  min-height: 0;
}
</style>
