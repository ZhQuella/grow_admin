<template>
  <div>
    <div class="mb-2.5 bg-layout px-5 py-[50px] text-[17px] text-text">
      标签页操作示例
    </div>
    <div class="mx-2.5 mb-2.5 last:mb-0">
      <el-card>
        <template #header>
          <div class="font-semibold">
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
    <div class="mx-2.5 mb-2.5 last:mb-0">
      <el-card>
        <template #header>
          <div class="font-semibold">
            <span>打开子页面</span>
          </div>
        </template>
        <div>
          <el-button @click="onOpenPageStack(1)">堆栈打开 子页面1</el-button>
          <el-button @click="onOpenPageStack(2)">堆栈打开 子页面2</el-button>
          <el-button @click="onOpenPageNewTab(1)">新标签打开 设置中心</el-button>
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

function onOpenPageStack(id: number) {
  go({
    name: 'Child',
    params: { id: String(id) },
  }, {
    tabMode: 'stack',
    parentName: 'OpenSubpage',
  })
}

function onOpenPageNewTab(id: number) {
  go({
    name: 'WorkspaceSettings',
    params: { id: String(id) },
  })
}
</script>
