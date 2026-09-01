<template>
  <div>
    <p class="menu-delete-panel__hint">
      确认删除「{{ state.deleteTarget?.title }}」？
      <template v-if="state.deleteImpact?.childCount">
        将同时删除其下 {{ state.deleteImpact.childCount }} 个子级，删除后不可恢复。
      </template>
      <template v-else>
        删除后不可恢复。
      </template>
    </p>
    <dl v-if="state.deleteImpact" class="menu-delete-panel__impact-list">
      <div><dt>角色菜单授权</dt><dd>{{ state.deleteImpact.roleMenuGrantCount }} 项</dd></div>
      <div><dt>关联功能</dt><dd>{{ state.deleteImpact.functionCount }} 项</dd></div>
      <div><dt>角色功能授权</dt><dd>{{ state.deleteImpact.functionGrantCount }} 项</dd></div>
      <div><dt>关联数据表</dt><dd>{{ state.deleteImpact.tableCount }} 张</dd></div>
      <div><dt>列权限配置</dt><dd>{{ state.deleteImpact.columnPermissionCount }} 项</dd></div>
    </dl>
  </div>
</template>

<script lang="ts" setup>
import { proxyRefs } from 'vue'
import type { useMenuActions } from '../use/useMenuActions'

defineOptions({ name: 'MenuDeletePanel' })

const props = defineProps<{
  state: ReturnType<typeof useMenuActions>
}>()

const state = proxyRefs(props.state)
</script>

<style scoped>
.menu-delete-panel__hint {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.menu-delete-panel__impact-list {
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--layout-border-color);
  border-radius: 6px;
  background: var(--layout-color);
}

.menu-delete-panel__impact-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 28px;
}

.menu-delete-panel__impact-list dt,
.menu-delete-panel__impact-list dd {
  margin: 0;
}

.menu-delete-panel__impact-list dt {
  color: var(--text-color-secondary);
}
</style>
