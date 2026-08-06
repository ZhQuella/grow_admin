<template>
  <GrowDialog
    :model-value="visible"
    title="选择人员"
    width="860px"
    append-to-body
    destroy-on-close
    align-center
    :z-index="4200"
    class="person-select-dialog"
    @update:model-value="onVisibleChange"
  >
    <div class="person-select-dialog__body" @click.stop>
      <div class="person-select-dialog__search">
        <GrowInput
          v-model="keyword"
          class="person-select-dialog__search-input"
          clearable
          placeholder="搜索姓名"
        />
      </div>

      <GrowTabs v-model="activeTab" class="person-select-dialog__tabs">
        <GrowTabPane label="按部门" name="dept" />
        <GrowTabPane label="按角色" name="role" />
      </GrowTabs>

      <div
        v-if="activeTab === 'dept' && breadcrumb.length"
        class="person-select-dialog__breadcrumb"
      >
        <template v-for="(item, index) in breadcrumb" :key="item.id">
          <button
            type="button"
            class="person-select-dialog__crumb"
            :class="{ 'is-current': index === breadcrumb.length - 1 }"
            @click="onCrumbClick(item.id)"
          >
            {{ item.name }}
          </button>
          <span
            v-if="index < breadcrumb.length - 1"
            class="person-select-dialog__crumb-sep"
          >/</span>
        </template>
      </div>

      <div class="person-select-dialog__panels">
        <!-- 左侧：部门 / 角色 -->
        <aside class="person-select-dialog__left">
          <GrowScrollbar class="person-select-dialog__left-scroll">
            <template v-if="activeTab === 'dept'">
              <label class="person-select-dialog__row person-select-dialog__row--all">
                <GrowCheckbox
                  :model-value="deptLevelAllChecked"
                  :indeterminate="deptLevelPartial"
                  @update:model-value="onToggleAllDepts"
                />
                <span class="person-select-dialog__row-title">全选</span>
              </label>

              <div
                v-for="dept in currentDepts"
                :key="dept.id"
                class="person-select-dialog__row"
              >
                <GrowCheckbox
                  :model-value="isDeptChecked(dept.id)"
                  :indeterminate="isDeptIndeterminate(dept.id)"
                  @update:model-value="(v: boolean) => onToggleDept(dept.id, v)"
                />
                <div class="person-select-dialog__row-main">
                  <span class="person-select-dialog__dept-icon">
                    <GrowIconify icon="ant-design:apartment-outlined" :size="16" />
                  </span>
                  <div class="person-select-dialog__row-text">
                    <div class="person-select-dialog__row-title">{{ dept.name }}</div>
                    <div class="person-select-dialog__row-sub">
                      {{ getDeptPersonCount(dept.id) }}人
                    </div>
                  </div>
                </div>
                <button
                  v-if="hasChildDepts(dept.id)"
                  type="button"
                  class="person-select-dialog__next"
                  @click="onEnterDept(dept.id)"
                >
                  下级
                </button>
              </div>
              <div
                v-if="!currentDepts.length"
                class="person-select-dialog__empty"
              >
                暂无子部门
              </div>
            </template>

            <template v-else>
              <label class="person-select-dialog__row person-select-dialog__row--all">
                <GrowCheckbox
                  :model-value="roleAllChecked"
                  :indeterminate="rolePartial"
                  @update:model-value="onToggleAllRoles"
                />
                <span class="person-select-dialog__row-title">全选</span>
              </label>

              <div
                v-for="role in roles"
                :key="role.id"
                class="person-select-dialog__row"
              >
                <GrowCheckbox
                  :model-value="isRoleChecked(role.id)"
                  :indeterminate="isRoleIndeterminate(role.id)"
                  @update:model-value="(v: boolean) => onToggleRole(role.id, v)"
                />
                <div class="person-select-dialog__row-main">
                  <span class="person-select-dialog__dept-icon person-select-dialog__dept-icon--role">
                    <GrowIconify icon="ant-design:team-outlined" :size="16" />
                  </span>
                  <div class="person-select-dialog__row-text">
                    <div class="person-select-dialog__row-title">{{ role.name }}</div>
                    <div class="person-select-dialog__row-sub">
                      {{ getRolePersonCount(role.id) }}人
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </GrowScrollbar>
        </aside>

        <!-- 右侧：人员表 -->
        <section class="person-select-dialog__right">
          <GrowScrollbar class="person-select-dialog__right-scroll">
            <table class="person-select-dialog__table">
              <thead>
                <tr>
                  <th class="person-select-dialog__th-check" />
                  <th>姓名</th>
                  <th>部门</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!filteredPersons.length">
                  <td colspan="3" class="person-select-dialog__empty">暂无人员</td>
                </tr>
                <tr
                  v-for="person in filteredPersons"
                  :key="person.userId"
                  class="person-select-dialog__tr"
                  @click="onTogglePerson(person.userId)"
                >
                  <td class="person-select-dialog__td-check" @click.stop>
                    <GrowCheckbox
                      :model-value="
                        multiple
                          ? draftIds.has(person.userId)
                          : draftSingle === person.userId
                      "
                      @update:model-value="() => onTogglePerson(person.userId)"
                    />
                  </td>
                  <td>{{ person.name }}</td>
                  <td>{{ person.deptName }}</td>
                </tr>
              </tbody>
            </table>
          </GrowScrollbar>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="person-select-dialog__footer">
        <span class="person-select-dialog__count">
          已选 {{ selectedCount }} 人
        </span>
        <div class="person-select-dialog__footer-right">
          <GrowButton @click="onCancel">取消</GrowButton>
          <GrowButton type="primary" @click="onConfirm">确定</GrowButton>
        </div>
      </div>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { PersonSelectValue } from '../types'
import {
  ROOT_ID,
  addUserIds,
  getAllRoles,
  getChildDepts,
  getDeptBreadcrumb,
  getDeptPersonCount,
  getPersonsByDept,
  getPersonsByRole,
  getRolePersonCount,
  hasChildDepts,
  isAllSelected,
  isPartialSelected,
  removeUserIds,
  searchPersonsByName,
} from '../utils'

defineOptions({ name: 'PersonSelectDialog' })

const props = withDefaults(
  defineProps<{
    visible: boolean
    modelValue?: PersonSelectValue
    multiple?: boolean
  }>(),
  {
    modelValue: undefined,
    multiple: false,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: string | string[] | '']
}>()

const activeTab = ref<'dept' | 'role'>('dept')
const keyword = ref('')
const currentDeptId = ref(ROOT_ID)
const draftIds = ref<Set<string>>(new Set())
const draftSingle = ref<string>('')

const roles = computed(() => getAllRoles())
const currentDepts = computed(() => getChildDepts(currentDeptId.value))
const breadcrumb = computed(() => getDeptBreadcrumb(currentDeptId.value))

const scopePersons = computed(() => {
  if (activeTab.value === 'role') {
    return getPersonsByDept(ROOT_ID)
  }
  return getPersonsByDept(currentDeptId.value)
})

const filteredPersons = computed(() => {
  // 有关键字时全局按姓名搜；否则按当前部门范围
  if (keyword.value.trim()) {
    return searchPersonsByName(keyword.value)
  }
  return scopePersons.value
})

const selectedCount = computed(() => draftIds.value.size)

const deptLevelUserIds = computed(() =>
  currentDepts.value.flatMap((d) => getPersonsByDept(d.id).map((p) => p.userId)),
)

const deptLevelAllChecked = computed(() =>
  isAllSelected(draftIds.value, deptLevelUserIds.value),
)

const deptLevelPartial = computed(() =>
  isPartialSelected(draftIds.value, deptLevelUserIds.value),
)

const roleAllUserIds = computed(() =>
  roles.value.flatMap((r) => getPersonsByRole(r.id).map((p) => p.userId)),
)

const roleAllChecked = computed(() =>
  isAllSelected(draftIds.value, roleAllUserIds.value),
)

const rolePartial = computed(() =>
  isPartialSelected(draftIds.value, roleAllUserIds.value),
)

function normalizeIncoming(value: PersonSelectValue): string[] {
  if (value == null || value === '') return []
  return Array.isArray(value) ? value.filter(Boolean) : [String(value)]
}

function resetDraft() {
  const ids = normalizeIncoming(props.modelValue)
  if (props.multiple) {
    draftIds.value = new Set(ids)
    draftSingle.value = ''
  } else {
    draftSingle.value = ids[0] || ''
    draftIds.value = new Set(draftSingle.value ? [draftSingle.value] : [])
  }
  keyword.value = ''
  activeTab.value = 'dept'
  currentDeptId.value = ROOT_ID
}

watch(
  () => props.visible,
  (open) => {
    if (open) resetDraft()
  },
)

const onVisibleChange = (open: boolean) => {
  emit('update:visible', open)
}

const isDeptChecked = (deptId: string) =>
  isAllSelected(
    draftIds.value,
    getPersonsByDept(deptId).map((p) => p.userId),
  )

const isDeptIndeterminate = (deptId: string) =>
  isPartialSelected(
    draftIds.value,
    getPersonsByDept(deptId).map((p) => p.userId),
  )

const isRoleChecked = (roleId: string) =>
  isAllSelected(
    draftIds.value,
    getPersonsByRole(roleId).map((p) => p.userId),
  )

const isRoleIndeterminate = (roleId: string) =>
  isPartialSelected(
    draftIds.value,
    getPersonsByRole(roleId).map((p) => p.userId),
  )

const onEnterDept = (deptId: string) => {
  currentDeptId.value = deptId
}

const onCrumbClick = (deptId: string) => {
  currentDeptId.value = deptId
}

const onToggleDept = (deptId: string, checked: boolean) => {
  const next = new Set(draftIds.value)
  const ids = getPersonsByDept(deptId).map((p) => p.userId)
  if (checked) addUserIds(next, ids)
  else removeUserIds(next, ids)
  applyDraftIds(next)
}

const onToggleAllDepts = (checked: boolean) => {
  const next = new Set(draftIds.value)
  const ids = deptLevelUserIds.value
  if (checked) addUserIds(next, ids)
  else removeUserIds(next, ids)
  applyDraftIds(next)
}

const onToggleRole = (roleId: string, checked: boolean) => {
  const next = new Set(draftIds.value)
  const ids = getPersonsByRole(roleId).map((p) => p.userId)
  if (checked) addUserIds(next, ids)
  else removeUserIds(next, ids)
  applyDraftIds(next)
}

const onToggleAllRoles = (checked: boolean) => {
  const next = new Set(draftIds.value)
  const ids = roleAllUserIds.value
  if (checked) addUserIds(next, ids)
  else removeUserIds(next, ids)
  applyDraftIds(next)
}

/** 写入草稿；单选时同步 draftSingle 为第一个 */
const applyDraftIds = (next: Set<string>) => {
  draftIds.value = next
  if (!props.multiple) {
    draftSingle.value = next.values().next().value || ''
  }
}

const onTogglePerson = (userId: string) => {
  if (!props.multiple) {
    draftSingle.value = draftSingle.value === userId ? '' : userId
    draftIds.value = new Set(draftSingle.value ? [draftSingle.value] : [])
    return
  }
  const next = new Set(draftIds.value)
  if (next.has(userId)) next.delete(userId)
  else next.add(userId)
  draftIds.value = next
}

const onCancel = () => {
  emit('update:visible', false)
}

const onConfirm = () => {
  if (props.multiple) {
    emit('confirm', Array.from(draftIds.value))
  } else {
    const id = draftSingle.value || Array.from(draftIds.value)[0] || ''
    emit('confirm', id)
  }
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.person-select-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 420px;
}

.person-select-dialog__search {
  width: 100%;
}

.person-select-dialog__search-input {
  width: 100%;
}

.person-select-dialog__breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-color-secondary);
}

.person-select-dialog__crumb {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;

  &.is-current {
    color: var(--text-color);
    cursor: default;
  }

  &:hover:not(.is-current) {
    color: var(--primary-color-hover);
  }
}

.person-select-dialog__crumb-sep {
  color: var(--text-color-secondary);
}

.person-select-dialog__panels {
  display: flex;
  gap: 12px;
  min-height: 320px;
  height: 320px;
}

.person-select-dialog__left,
.person-select-dialog__right {
  position: relative;
  z-index: 0;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  overflow: hidden;
  min-height: 0;
  background: var(--component-background-color);
  isolation: isolate;
}

.person-select-dialog__left {
  flex: 0 0 280px;
  width: 280px;
}

.person-select-dialog__right {
  flex: 1 1 auto;
  min-width: 0;
}

.person-select-dialog__left-scroll,
.person-select-dialog__right-scroll {
  height: 100%;
}

.person-select-dialog__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--layout-border-color);

  &--all {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--layout-container-background-color);
    font-weight: 500;
  }

  &:hover:not(.person-select-dialog__row--all) {
    background: var(--color-primary-a04);
  }

  /* 避免驱动层 checkbox 绝对定位原生长出容器，盖住表头 */
  :deep(.el-checkbox),
  :deep(.n-checkbox),
  :deep(.ant-checkbox-wrapper) {
    flex: 0 0 auto;
    margin: 0;
    height: auto;
    line-height: 1;
  }

  :deep(.el-checkbox__input),
  :deep(.n-checkbox-box),
  :deep(.ant-checkbox) {
    position: relative;
    z-index: 0;
  }
}

.person-select-dialog__row-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
}

.person-select-dialog__dept-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  line-height: 0;
  border-radius: 6px;
  background: var(--color-primary-a08);
  color: var(--primary-color);
  overflow: hidden;

  :deep(.grow-iconify) {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    line-height: 0;
    font-size: 16px !important;
    color: inherit;
  }

  :deep(svg) {
    display: block;
    width: 16px;
    height: 16px;
  }

  &--role {
    background: var(--color-primary-a12);
    color: var(--primary-color);
  }
}

.person-select-dialog__row-text {
  min-width: 0;
}

.person-select-dialog__row-title {
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-select-dialog__row-sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.person-select-dialog__next {
  flex: 0 0 auto;
  margin-left: 4px;
  padding: 0 0 0 10px;
  border: 0;
  border-left: 1px solid var(--layout-border-color);
  background: transparent;
  color: var(--primary-color);
  font-size: 13px;
  line-height: 28px;
  cursor: pointer;

  &:hover {
    color: var(--primary-color-hover);
  }
}

.person-select-dialog__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid var(--layout-border-color);
    background: var(--component-background-color);
  }

  th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--layout-container-background-color);
    font-weight: 500;
    color: var(--text-color);
  }

  td {
    position: relative;
    z-index: 0;
  }

  .person-select-dialog__th-check,
  .person-select-dialog__td-check {
    width: 40px;

    :deep(.el-checkbox),
    :deep(.n-checkbox),
    :deep(.ant-checkbox-wrapper) {
      margin: 0;
      height: auto;
      line-height: 1;
    }
  }
}

.person-select-dialog__tr {
  cursor: pointer;

  &:hover td {
    background: var(--color-primary-a08);
  }
}

.person-select-dialog__empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.person-select-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.person-select-dialog__count {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.person-select-dialog__footer-right {
  display: flex;
  gap: 8px;
}
</style>
