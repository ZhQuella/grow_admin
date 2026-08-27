<template>
  <GrowDrawer
    v-model="visible"
    :title="drawerTitle"
    size="560px"
    append-to-body
    destroy-on-close
    class="role-drawer"
  >
    <GrowWatchBox class="role-drawer__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div class="role-member">
            <div v-if="!readonly" class="role-member__toolbar">
              <GrowButton type="primary" @click="openPicker">选择账号</GrowButton>
            </div>

            <div class="role-member__selected">
              <div class="role-member__selected-head">
                {{ readonly ? `共 ${selectedAccounts.length} 个账号` : `已选 ${selectedAccounts.length} 个账号` }}
              </div>
              <div v-if="!selectedAccounts.length" class="role-member__empty">
                {{ readonly ? '暂未绑定账号' : '点击「选择账号」，确定后会添加到这里' }}
              </div>
              <div v-else class="role-member__list">
                <div
                  v-for="account in selectedAccounts"
                  :key="account.accountId"
                  class="role-member__item"
                >
                  <div class="role-member__item-main">
                    <div class="role-member__item-title">{{ account.username }}</div>
                    <div class="role-member__item-meta">
                      {{ account.personName || '未绑定人员' }}
                      {{ account.enabled ? '' : ' · 已停用' }}
                    </div>
                  </div>
                  <GrowTooltip v-if="!readonly" content="移除" placement="top">
                    <GrowButton class="role-member__remove" link type="danger" @click="onRemove(account.accountId)">
                      <GrowIconify icon="ant-design:close-outlined" :size="16" />
                    </GrowButton>
                  </GrowTooltip>
                </div>
              </div>
            </div>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <div class="role-drawer__footer">
        <GrowSpace v-if="readonly">
          <GrowButton @click="visible = false">关闭</GrowButton>
        </GrowSpace>
        <GrowSpace v-else>
          <GrowButton @click="visible = false">取消</GrowButton>
          <GrowButton type="primary" :loading="saving" @click="submit">
            确定
          </GrowButton>
        </GrowSpace>
      </div>
    </template>
  </GrowDrawer>

  <GrowDialog
    v-if="!readonly"
    v-model="pickerVisible"
    title="选择账号"
    width="640px"
    append-to-body
    destroy-on-close
    align-center
    :z-index="4200"
  >
    <div class="role-account-picker">
      <GrowInput
        v-model="pickerKeyword"
        clearable
        placeholder="搜索登录名或人员"
      />
      <div class="role-account-picker__table">
        <GrowScrollbar height="360px">
          <table>
            <thead>
              <tr>
                <th class="role-account-picker__check" />
                <th>登录名</th>
                <th>绑定人员</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredAccounts.length">
                <td colspan="4" class="role-account-picker__empty">暂无账号</td>
              </tr>
              <tr
                v-for="account in filteredAccounts"
                :key="account.accountId"
                class="role-account-picker__row"
                @click="onToggleDraft(account.accountId)"
              >
                <td class="role-account-picker__check" @click.stop>
                  <GrowCheckbox
                    :model-value="draftIds.includes(account.accountId)"
                    @update:model-value="() => onToggleDraft(account.accountId)"
                  />
                </td>
                <td>{{ account.username }}</td>
                <td>{{ account.personName || '未绑定人员' }}</td>
                <td>{{ account.enabled ? '启用' : '停用' }}</td>
              </tr>
            </tbody>
          </table>
        </GrowScrollbar>
      </div>
    </div>
    <template #footer>
      <div class="role-account-picker__footer">
        <span>已选 {{ draftIds.length }} 个账号</span>
        <GrowSpace>
          <GrowButton @click="pickerVisible = false">取消</GrowButton>
          <GrowButton type="primary" @click="onPickConfirm">确定</GrowButton>
        </GrowSpace>
      </div>
    </template>
  </GrowDialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchSystemAccountBriefs } from '../../../api/systemAccount'
import { getSystemRoleDetail, saveSystemRoleMembers } from '../../../api/systemRole'
import type { SystemAccountBrief } from '../../../types/systemAccount'
import type { SystemRoleListItem } from '../../../types/systemRole'
import { toMessage } from '../use/helpers'

defineOptions({
  name: 'RoleMemberDrawer',
})

const emit = defineEmits<{
  success: []
}>()

const message = useMsg()
const visible = ref(false)
const pickerVisible = ref(false)
const saving = ref(false)
const readonly = ref(false)
const role = ref<SystemRoleListItem | null>(null)
const accounts = ref<SystemAccountBrief[]>([])
const selectedIds = ref<string[]>([])
const draftIds = ref<string[]>([])
const pickerKeyword = ref('')

const drawerTitle = computed(() => {
  const name = role.value?.name
  if (readonly.value) return name ? `账号列表 · ${name}` : '账号列表'
  return name ? `绑定账号 · ${name}` : '绑定账号'
})

const accountMap = computed(() => new Map(accounts.value.map((item) => [item.accountId, item])))

const selectedAccounts = computed(() =>
  selectedIds.value.map((id) => {
    const item = accountMap.value.get(id)
    return item || {
      accountId: id,
      username: id,
      personName: '',
      enabled: true,
    }
  }),
)

const filteredAccounts = computed(() => {
  const keyword = pickerKeyword.value.trim().toLowerCase()
  if (!keyword) return accounts.value
  return accounts.value.filter((item) => {
    const username = item.username.toLowerCase()
    const personName = (item.personName || '').toLowerCase()
    return username.includes(keyword) || personName.includes(keyword)
  })
})

watch(visible, (open) => {
  if (!open) pickerVisible.value = false
})

function openPicker() {
  draftIds.value = []
  pickerKeyword.value = ''
  pickerVisible.value = true
}

function onToggleDraft(accountId: string) {
  if (draftIds.value.includes(accountId)) {
    draftIds.value = draftIds.value.filter((id) => id !== accountId)
    return
  }
  draftIds.value = [...draftIds.value, accountId]
}

function onPickConfirm() {
  const merged = [...selectedIds.value]
  for (const id of draftIds.value) {
    if (id && !merged.includes(id)) merged.push(id)
  }
  selectedIds.value = merged
  pickerVisible.value = false
}

function onRemove(accountId: string) {
  selectedIds.value = selectedIds.value.filter((id) => id !== accountId)
}

async function open(row: SystemRoleListItem, options?: { readonly?: boolean }) {
  role.value = row
  readonly.value = Boolean(options?.readonly)
  pickerVisible.value = false
  selectedIds.value = []
  visible.value = true
  try {
    const [detail, list] = await Promise.all([
      getSystemRoleDetail(row.id),
      fetchSystemAccountBriefs(),
    ])
    accounts.value = Array.isArray(list) ? list : []
    selectedIds.value = Array.isArray(detail?.userIds) ? [...detail.userIds] : []
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  }
}

async function submit() {
  if (readonly.value) return
  const id = role.value?.id
  if (!id) return
  saving.value = true
  try {
    await saveSystemRoleMembers(id, selectedIds.value)
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

.role-member {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.role-member__selected-head {
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
}

.role-member__empty {
  padding: 32px 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  text-align: center;
}

.role-member__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-member__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
}

.role-member__item-main {
  flex: 1;
  min-width: 0;
}

.role-member__item-title {
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-member__item-meta {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-member__remove {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}

.role-account-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-account-picker__table {
  overflow: hidden;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
}

.role-account-picker__table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.role-account-picker__table th,
.role-account-picker__table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--layout-border-color);
  background: var(--component-background-color);
}

.role-account-picker__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--layout-container-background-color);
  font-weight: 500;
}

.role-account-picker__check {
  width: 40px;
}

.role-account-picker__row {
  cursor: pointer;
}

.role-account-picker__row:hover td {
  background: var(--color-primary-a08);
}

.role-account-picker__empty {
  padding: 24px 12px;
  color: var(--text-color-secondary);
  text-align: center;
}

.role-account-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: var(--text-color-secondary);
  font-size: 13px;
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
