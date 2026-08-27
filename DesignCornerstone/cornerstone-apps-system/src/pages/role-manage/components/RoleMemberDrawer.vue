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
              <GrowButton type="primary" @click="pickerVisible = true">选择人员</GrowButton>
            </div>

            <div class="role-member__selected">
              <div class="role-member__selected-head">
                {{ readonly ? `共 ${selectedPersons.length} 人` : `已选 ${selectedPersons.length} 人` }}
              </div>
              <div v-if="!selectedPersons.length" class="role-member__empty">
                {{ readonly ? '暂未绑定人员' : '点击「选择人员」，确定后会添加到这里' }}
              </div>
              <div v-else class="role-member__list">
                <div
                  v-for="person in selectedPersons"
                  :key="person.userId"
                  class="role-member__item"
                >
                  <div class="role-member__item-main">
                    <div class="role-member__item-title">{{ person.name }}</div>
                    <div class="role-member__item-meta">{{ person.post }} · {{ person.deptName }}</div>
                  </div>
                  <GrowTooltip v-if="!readonly" content="移除" placement="top">
                    <GrowButton class="role-member__remove" link type="danger" @click="onRemove(person.userId)">
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

  <PersonSelectDialog
    v-if="!readonly"
    v-model:visible="pickerVisible"
    multiple
    @confirm="onPickConfirm"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { PersonSelectDialog } from '@grow-admin-rock/business-components/person-select'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import {
  fetchSystemPersons,
  getSystemRoleDetail,
  saveSystemRoleMembers,
} from '../../../api/systemRole'
import type { SystemPerson, SystemRoleListItem } from '../../../types/systemRole'
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
const persons = ref<SystemPerson[]>([])
const selectedIds = ref<string[]>([])

const drawerTitle = computed(() => {
  const name = role.value?.name
  if (readonly.value) return name ? `人员列表 · ${name}` : '人员列表'
  return name ? `绑定人员 · ${name}` : '绑定人员'
})

const selectedPersons = computed(() => {
  const order = new Map(selectedIds.value.map((id, index) => [id, index]))
  return persons.value
    .filter((item) => order.has(item.userId))
    .sort((a, b) => (order.get(a.userId) ?? 0) - (order.get(b.userId) ?? 0))
})

watch(visible, (open) => {
  if (!open) pickerVisible.value = false
})

function onPickConfirm(value: string | string[] | '') {
  const ids = Array.isArray(value) ? value : value ? [String(value)] : []
  const merged = [...selectedIds.value]
  for (const id of ids) {
    if (id && !merged.includes(id)) merged.push(id)
  }
  selectedIds.value = merged
}

function onRemove(userId: string) {
  selectedIds.value = selectedIds.value.filter((id) => id !== userId)
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
      fetchSystemPersons(),
    ])
    persons.value = Array.isArray(list) ? list : []
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
