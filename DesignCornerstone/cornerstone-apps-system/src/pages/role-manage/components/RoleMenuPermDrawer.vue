<template>
  <GrowDrawer
    v-model="visible"
    :title="role ? `菜单和功能 · ${role.name}` : '菜单和功能'"
    size="560px"
    append-to-body
    destroy-on-close
    class="role-drawer"
  >
    <GrowWatchBox class="role-drawer__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <div class="role-menu-perm">
            <p class="role-menu-perm__hint">
              勾选目录或菜单会级联子级；叶子为菜单功能。确定后一次性保存。
            </p>
            <div v-if="!treeData.length" class="role-menu-perm__empty">
              暂无菜单，请先在菜单管理中配置
            </div>
            <div v-else class="role-menu-perm__tree">
              <GrowTree
                :key="treeKey"
                :data="treeData"
                node-key="key"
                show-checkbox
                default-expand-all
                :default-checked-keys="checkedKeys"
                :props="{ label: 'title', children: 'children' }"
                @check="onCheck"
              />
            </div>
          </div>
        </GrowScrollbar>
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
import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { fetchAllSystemMenuFunctions } from '../../../api/systemMenuFunction'
import { fetchSystemMenuTree } from '../../../api/systemMenu'
import { getSystemRoleDetail, saveSystemRoleMenuPerm } from '../../../api/systemRole'
import type { RolePermTreeNode, SystemRoleListItem } from '../../../types/systemRole'
import { pickCheckedKeys, toCheckedPermKeys, toMessage } from '../use/helpers'
import { buildRolePermTree, collectPermFromKeys } from '../use/permTree'

defineOptions({
  name: 'RoleMenuPermDrawer',
})

const emit = defineEmits<{
  success: []
}>()

const message = useMsg()
const visible = ref(false)
const saving = ref(false)
const role = ref<SystemRoleListItem | null>(null)
const treeData = ref<RolePermTreeNode[]>([])
const checkedKeys = ref<string[]>([])
const treeKey = ref(0)

function onCheck(arg1: unknown, arg2?: unknown) {
  checkedKeys.value = pickCheckedKeys(arg1, arg2)
}

async function open(row: SystemRoleListItem) {
  role.value = row
  checkedKeys.value = []
  visible.value = true
  try {
    const [detail, menus, functions] = await Promise.all([
      getSystemRoleDetail(row.id),
      fetchSystemMenuTree(),
      fetchAllSystemMenuFunctions(),
    ])
    treeData.value = buildRolePermTree(
      Array.isArray(menus) ? menus : [],
      Array.isArray(functions) ? functions : [],
    )
    checkedKeys.value = toCheckedPermKeys(
      Array.isArray(detail?.menuNames) ? detail.menuNames : [],
      Array.isArray(detail?.functionIds) ? detail.functionIds : [],
    )
    treeKey.value += 1
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  }
}

async function submit() {
  const id = role.value?.id
  if (!id) return
  saving.value = true
  try {
    const { menuNames, functionIds } = collectPermFromKeys(treeData.value, checkedKeys.value)
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.role-menu-perm__hint,
.role-menu-perm__empty {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.role-menu-perm__empty {
  padding: 48px 0;
  text-align: center;
}

.role-menu-perm__tree {
  padding: 8px;
  border-radius: 8px;
  background: var(--layout-color);
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
