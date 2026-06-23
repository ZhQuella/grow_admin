<template>
  <div class="open-subpage">
    <div class="open-subpage__header">
      标签页操作示例
    </div>
    <div class="open-subpage__section">
      <el-card>
        <template #header>
          <div class="open-subpage__card-header">
            <span>标签操作</span>
          </div>
        </template>
        <div>
          <el-button @click="closeAll">关闭所有</el-button>
          <el-button @click="closeLeft">关闭左侧</el-button>
          <el-button @click="closeRight">关闭右侧</el-button>
          <el-button @click="closeOther">关闭其他</el-button>
          <el-button @click="closeCurrent">关闭当前</el-button>
          <el-button @click="reloadCurrent">刷新当前</el-button>
        </div>
      </el-card>
    </div>
    <div class="open-subpage__section">
      <el-card>
        <template #header>
          <div class="open-subpage__card-header">
            <span>打开子页面</span>
          </div>
        </template>
        <div>
          <el-button @click="onOpenPage(1)">打开子页面1</el-button>
          <el-button @click="onOpenPage(2)">打开子页面2</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouteNavigate, useTabs } from '@grow-admin-rock/hooks'

defineOptions({
  name: 'OpenSubpagePage',
})

const { go } = useRouteNavigate()
const { closeAll, closeLeft, closeRight, closeOther, closeCurrent, reloadCurrent } = useTabs()

function onOpenPage(id: number) {
  go({
    name: 'Child',
    params: { id: String(id) },
  })
}
</script>

<style scoped>
.open-subpage__header {
  margin-bottom: 10px;
  padding: 50px 20px;
  font-size: 17px;
  color: var(--text-color);
  background: var(--layout-container-background-color);
}

.open-subpage__section {
  margin: 0 10px 10px;
}

.open-subpage__section:last-child {
  margin-bottom: 0;
}

.open-subpage__card-header {
  font-weight: 600;
}
</style>
