<template>
  <div class="h-[90vh]">
    <GrowSplitPane :tree-data="treeData" :root-horizontal="false">
      <template #Editor>
        <div class="box-border flex h-full min-h-0 flex-col overflow-hidden p-2">
          <div class="mb-2 shrink-0 text-sm font-medium text-text">代码编辑器</div>
          <GrowCodeEditor
            v-model="editorCode"
            language="vue"
            class="min-h-0 flex-1 overflow-hidden rounded border border-solid border-border bg-component"
            :options="{ theme: 'auto' }"
          />
        </div>
      </template>
      <template #Deps>
        <div class="box-border h-full min-h-0 overflow-hidden p-2">
          <GrowCodeDeps
            v-model="dependencies"
            class="h-full rounded border border-solid border-border bg-component"
          >
            <template #title>
              <span class="text-sm font-medium text-text">依赖注入</span>
            </template>
          </GrowCodeDeps>
        </div>
      </template>
      <template #Sandbox>
        <div class="box-border flex h-full min-h-0 flex-col overflow-hidden p-2">
          <div class="mb-2 shrink-0 text-sm font-medium text-text">代码沙箱</div>
          <GrowCodeSandbox
            v-model="editorCode"
            language="vue"
            class="min-h-0 flex-1 rounded border border-solid border-border bg-component"
            :expose="sandboxExpose"
            :dependencies="dependencies"
          />
        </div>
      </template>
    </GrowSplitPane>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { SplitPaneItem } from '@grow-admin-rock/components/split-pane'
import { GrowSplitPane } from '@grow-admin-rock/components/split-pane'
import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import * as GrowState from '@grow-admin-rock/state'
import * as GrowRouter from '@grow-admin-rock/middleware-router'
import * as GrowUtils from '@grow-admin-rock/utils'
import * as GrowHooks from '@grow-admin-rock/hooks'
import type { CodeDependency, SandboxExpose } from '@grow-admin-rock/code-sandbox'
import {
  GrowCodeEditor,
  GrowCodeDeps,
  GrowCodeSandbox,
  composeVueSfc,
  DEFAULT_SANDBOX_DEPENDENCIES,
  mergeDependencies,
} from '@grow-admin-rock/code-sandbox'

defineOptions({
  name: 'SandboxOverviewPage',
})

const treeData: SplitPaneItem[] = [
  {
    size: 66,
    minSize: 30,
    horizontal: true,
    child: [
      { size: 65, minSize: 30, slotKey: 'Editor' },
      { size: 35, minSize: 20, slotKey: 'Deps' },
    ],
  },
  {
    size: 34,
    minSize: 20,
    slotKey: 'Sandbox',
  },
]

const editorCode = ref(
  composeVueSfc({
    template: `  <div class="sandbox-demo">
    <section class="sandbox-demo__section">
      <h3>组件（勾选后无需 import）</h3>
      <div class="sandbox-demo__actions">
        <GrowButton type="primary" :loading="loading" @click="fetchUser">
          useRequest 请求
        </GrowButton>
        <GrowButton @click="clearResult">清空结果</GrowButton>
      </div>
    </section>

    <section class="sandbox-demo__section">
      <h3>默认注入 · useRequest</h3>
      <p v-if="loading" class="sandbox-demo__tip">请求中…</p>
      <p v-if="error" class="sandbox-demo__error">{{ error }}</p>
      <pre v-if="result" class="sandbox-demo__result">{{ result }}</pre>
      <p v-else-if="!loading && !error" class="sandbox-demo__tip">点击上方按钮调用 useRequest().get</p>
    </section>

    <section class="sandbox-demo__section">
      <h3>默认注入 · middleware-router</h3>
      <p class="sandbox-demo__tip">当前路由：{{ routeName }}</p>
    </section>

    <section class="sandbox-demo__section">
      <h3>默认注入 · state</h3>
      <p class="sandbox-demo__tip">用户展示名：{{ displayName || '（暂无，请求后可写入 store）' }}</p>
    </section>

    <section class="sandbox-demo__section">
      <h3>默认注入 · utils</h3>
      <p class="sandbox-demo__tip">isString(routeName) = {{ routeNameIsString }}</p>
      <p class="sandbox-demo__tip">isNullOrUnDef(result) = {{ resultIsEmpty }}</p>
    </section>

    <section class="sandbox-demo__section">
      <h3>默认注入 · hooks</h3>
      <p class="sandbox-demo__tip">useRouteNavigate().go 跳转到当前页（不经过 Redirect）</p>
      <GrowButton size="small" @click="goCurrent">跳转至数据报表</GrowButton>
    </section>
  </div>`,
    script: `import { computed, ref } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { useUserStore } from '@grow-admin-rock/state'
import { isString, isNullOrUnDef } from '@grow-admin-rock/utils'
import { useRouteNavigate } from '@grow-admin-rock/hooks'

const route = useRoute()
const userStore = useUserStore()
const { go } = useRouteNavigate()

const loading = ref(false)
const result = ref(null)
const error = ref('')

const routeName = computed(() => String(route.name ?? ''))
const displayName = computed(() => userStore.getDisplayName)
const routeNameIsString = computed(() => isString(routeName.value))
const resultIsEmpty = computed(() => isNullOrUnDef(result.value))

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
    // 默认注入的 API，无需 import
    const data = await useRequest().get({ url: '/user/info' })
    result.value = data
    if (data) {
      userStore.setUserInfo(data)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function clearResult() {
  result.value = null
  error.value = ''
}

function goCurrent() {
  go({ name: 'DataReport' })
}`,
    style: `.sandbox-demo {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sandbox-demo__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sandbox-demo__section h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-base, var(--text-color));
}
.sandbox-demo__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.sandbox-demo__tip {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-secondary);
}
.sandbox-demo__error {
  margin: 0;
  font-size: 13px;
  color: #d03050;
}
.sandbox-demo__result {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-color);
  overflow: auto;
  font-size: 12px;
}`,
    scriptLang: 'ts',
    styleScoped: true,
  }),
)

/** 与业务侧 routers.ts 一致：从 IOC 取 Axios 实例 */
const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/**
 * 默认能力面：
 * - useRequest → script 内直接调用
 * - state / middleware-router / utils / hooks → 可按包名 import
 */
const sandboxExpose = computed<SandboxExpose>(() => ({
  apis: {
    useRequest,
  },
  modules: {
    '@grow-admin-rock/state': GrowState,
    '@grow-admin-rock/middleware-router': GrowRouter,
    '@grow-admin-rock/utils': GrowUtils,
    '@grow-admin-rock/hooks': GrowHooks,
  },
}))

/** 默认锁定依赖 + 可额外勾选的组件等 */
const dependencies = ref<CodeDependency[]>(
  mergeDependencies(DEFAULT_SANDBOX_DEPENDENCIES, [
    
  ]),
)
</script>
