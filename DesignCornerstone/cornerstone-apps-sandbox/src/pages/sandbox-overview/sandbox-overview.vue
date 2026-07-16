<template>
  <div class="h-[88vh]">
    <GrowSplitPane :tree-data="treeData" :root-horizontal="false">
      <template #Editor>
        <div class="box-border flex h-full min-h-0 flex-col overflow-hidden p-2">
          <div class="mb-2 shrink-0 text-sm font-medium text-text">
            代码编辑器
            <span class="ml-2 text-xs font-normal text-text-secondary">
              多文件 · 入口 App.vue · 支持 ./ 相对引入
            </span>
          </div>
          <MultiFileEditor
            v-model:files="sandboxFiles"
            entry="App.vue"
            class="min-h-0 flex-1 overflow-hidden rounded border border-solid border-border bg-component"
            :editor-options="{ theme: 'auto' }"
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
          <div class="mb-2 shrink-0 text-sm font-medium text-text">呈现沙箱</div>
          <GrowCodeSandbox
            :files="sandboxFiles"
            entry="App.vue"
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
  GrowCodeDeps,
  GrowCodeSandbox,
  composeVueSfc,
  DEFAULT_SANDBOX_DEPENDENCIES,
  mergeDependencies,
} from '@grow-admin-rock/code-sandbox'
import MultiFileEditor from './MultiFileEditor.vue'

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

const appVue = composeVueSfc({
  template: `  <div class="sandbox-demo">
    <section class="sandbox-demo__section">
      <h3>多文件引入演示</h3>
      <HelloCard :title="cardTitle" />
      <p class="sandbox-demo__tip">formatLabel(routeName) = {{ formattedRoute }}</p>
    </section>

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

    <section class="sandbox-demo__section">
      <h3>npm 动态注入 · nanoid（CDN，无需安装）</h3>
      <p class="sandbox-demo__tip">id：{{ randomId || '点击生成' }}</p>
      <GrowButton size="small" @click="genId">nanoid()</GrowButton>
    </section>
  </div>`,
  script: `import { computed, ref } from 'vue'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { useUserStore } from '@grow-admin-rock/state'
import { isString, isNullOrUnDef } from '@grow-admin-rock/utils'
import { useRouteNavigate } from '@grow-admin-rock/hooks'
import HelloCard from './HelloCard.vue'
import { formatLabel } from './format.js'

const route = useRoute()
const userStore = useUserStore()
const { go } = useRouteNavigate()

const loading = ref(false)
const result = ref(null)
const error = ref('')
const randomId = ref('')
const cardTitle = ref('来自 ./HelloCard.vue')

const routeName = computed(() => String(route.name ?? ''))
const displayName = computed(() => userStore.getDisplayName)
const routeNameIsString = computed(() => isString(routeName.value))
const resultIsEmpty = computed(() => isNullOrUnDef(result.value))
const formattedRoute = computed(() => formatLabel(routeName.value))

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
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
}

function genId() {
  randomId.value = nanoid()
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
})

const helloCardVue = composeVueSfc({
  template: `<div class="hello-card">
  <strong>{{ title }}</strong>
  <p class="hello-card__tip">{{ tip }}</p>
  <GrowButton size="small" @click="onPing">子组件按钮</GrowButton>
</div>`,
  script: `import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'HelloCard' },
})

const tip = computed(() => \`完整 SFC 子文件 · \${props.title}\`)

function onPing() {
  // 使用宿主注入的 Grow 能力时，模板里直接写 GrowButton 即可
}`,
  style: `.hello-card {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--layout-color);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hello-card__tip {
  margin: 0;
  font-size: 12px;
  color: var(--text-color-secondary);
}`,
  scriptLang: 'ts',
  styleScoped: true,
})

const formatJs = `/** 纯 JS 工具，可被 App.vue / 其它文件相对路径引入 */
export function formatLabel(value) {
  const text = value == null ? '' : String(value)
  return text ? \`[\${text}]\` : '（空）'
}
`

const sandboxFiles = ref<Record<string, string>>({
  'App.vue': appVue,
  'HelloCard.vue': helloCardVue,
  'format.js': formatJs,
})

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

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

const dependencies = ref<CodeDependency[]>(
  mergeDependencies(DEFAULT_SANDBOX_DEPENDENCIES, [
    {
      name: 'nanoid',
      version: '5.1.5',
      source: 'npm',
      kind: 'api',
      enabled: true,
      injectAs: ['nanoid'],
    },
  ]),
)
</script>
