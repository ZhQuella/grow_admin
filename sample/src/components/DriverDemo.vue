<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMessage, useNotice, useDialog } from '@grow-admin-rock/components'
import { ComponentLibraryType } from '@grow-admin-rock/types'
import { useRequest } from '@/apis/infrastructure'
import { projectSetting } from '../projectSetting'

const inputValue = ref('')
const message = useMessage()
const notice = useNotice()
const dialog = useDialog()

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
const mockLoading = ref(false)
const mockRawResult = ref('')
const mockParsedResult = ref('')

const currentBreakpoint = computed(() => {
  const width = viewportWidth.value
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 768) return 'md'
  return 'sm'
})

const breakpointLabel = computed(() => {
  const map: Record<string, string> = {
    sm: 'sm（< 768px）',
    md: 'md（768px ~ 1023px）',
    lg: 'lg（1024px ~ 1279px）',
    xl: 'xl（≥ 1280px）',
  }
  return map[currentBreakpoint.value]
})

const responsiveCards = [
  { title: '区块 A', desc: '默认 1 列，md 起 2 列，lg 起 4 列', tone: 'bg-primary-a08' },
  { title: '区块 B', desc: '随窗口宽度自动重排', tone: 'bg-primary-a12' },
  { title: '区块 C', desc: '用于验证 UnoCSS 断点', tone: 'bg-primary-a16' },
  { title: '区块 D', desc: '调整浏览器宽度观察变化', tone: 'bg-primary-a10' },
]

function updateViewport() {
  viewportWidth.value = window.innerWidth
}

function handleMessage(type: 'success' | 'error' | 'warning' | 'info') {
  message?.[type]?.('这是一条 Message 提示')
}

function handleNotice() {
  notice?.success?.({
    title: '通知标题',
    content: '这是一条 Notification 通知',
    message: '这是一条 Notification 通知',
    description: '这是一条 Notification 通知',
  })
}

function handleDialog() {
  if (!dialog) return
  if (typeof dialog.warning === 'function') {
    dialog.warning({
      title: '确认操作',
      content: '确定要执行此操作吗？',
      positiveText: '确定',
      negativeText: '取消',
    })
  } else if (projectSetting.componentLibrary === ComponentLibraryType.AntDesignVue) {
    dialog.confirm({
      title: '确认操作',
      content: '确定要执行此操作吗？',
    })
  } else if (typeof dialog.confirm === 'function') {
    dialog.confirm('确定要执行此操作吗？', '确认操作')
  }
}

async function runMockLogin(success = true) {
  mockLoading.value = true
  mockRawResult.value = ''
  mockParsedResult.value = ''

  const payload = {
    username: success ? 'admin' : 'guest',
    password: success ? '123456' : 'wrong-password',
  }

  try {
    const raw = await useRequest().post(
      { url: '/login', data: payload },
      { isTransformResponse: false, errorMessageMode: 'none' },
    )
    mockRawResult.value = JSON.stringify(raw, null, 2)

    if (raw?.type === 'success') {
      message?.success?.(raw.message || 'Mock 登录成功')
      try {
        const parsed = await useRequest().post(
          { url: '/login', data: payload },
          { errorMessageMode: 'none' },
        )
        mockParsedResult.value = JSON.stringify(parsed, null, 2)
      } catch (error) {
        mockParsedResult.value = error instanceof Error ? error.message : String(error)
      }
      return
    }

    message?.error?.(raw?.message || 'Mock 登录失败')
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error)
    mockRawResult.value = text
    message?.error?.(text)
  } finally {
    mockLoading.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-text">Grow Admin - 组件驱动演示</h1>
      <p class="mt-1 text-sm text-muted">当前组件库：{{ projectSetting.componentLibrary }}</p>
    </div>

    <GrowCard>
      <template #header>组件能力</template>
      <GrowSpace direction="vertical" class="w-full">
        <div class="flex flex-wrap justify-center gap-2">
          <GrowButton type="primary" @click="handleMessage('success')">Message Success</GrowButton>
          <GrowButton @click="handleMessage('error')">Message Error</GrowButton>
          <GrowButton @click="handleMessage('warning')">Message Warning</GrowButton>
          <GrowButton @click="handleMessage('info')">Message Info</GrowButton>
        </div>

        <div class="flex flex-wrap justify-center gap-2">
          <GrowButton type="primary" @click="handleNotice">Notification</GrowButton>
          <GrowButton @click="handleDialog">Dialog 确认框</GrowButton>
        </div>

        <GrowInput v-model="inputValue" placeholder="GrowInput 输入框" style="max-width: 320px" />
        <p v-if="inputValue" class="text-sm text-muted">输入值: {{ inputValue }}</p>
      </GrowSpace>
    </GrowCard>

    <GrowCard>
      <template #header>响应式测试</template>
      <GrowSpace direction="vertical" class="w-full">
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <GrowTag type="primary">当前断点：{{ currentBreakpoint }}</GrowTag>
          <GrowTag>{{ breakpointLabel }}</GrowTag>
          <GrowTag>视口宽度：{{ viewportWidth }}px</GrowTag>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in responsiveCards"
            :key="item.title"
            class="rounded-lg border border-border p-4"
            :class="item.tone"
          >
            <div class="mb-1 font-semibold text-text">{{ item.title }}</div>
            <div class="text-sm text-muted">{{ item.desc }}</div>
          </div>
        </div>

        <p class="text-sm text-muted">
          拖动浏览器窗口：&lt; 768px 为 1 列，≥ 768px 为 2 列，≥ 1024px 为 4 列。
        </p>
      </GrowSpace>
    </GrowCard>

    <GrowCard>
      <template #header>Mock 数据请求测试</template>
      <GrowSpace direction="vertical" class="w-full">
        <p class="text-sm text-muted">
          接口：<code class="text-text">POST /api/login</code>（账号 admin / 密码 123456）
        </p>

        <div class="flex flex-wrap gap-2">
          <GrowButton type="primary" :loading="mockLoading" @click="runMockLogin(true)">
            成功请求
          </GrowButton>
          <GrowButton :loading="mockLoading" @click="runMockLogin(false)">
            失败请求
          </GrowButton>
        </div>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <div class="mb-2 text-sm font-medium text-text">原始响应（isTransformResponse: false）</div>
            <pre
              class="max-h-56 overflow-auto rounded-lg border border-border bg-component p-3 text-xs text-text"
            >{{ mockRawResult || '点击上方按钮发起 Mock 请求' }}</pre>
          </div>
          <div>
            <div class="mb-2 text-sm font-medium text-text">转换后数据（默认 transform）</div>
            <pre
              class="max-h-56 overflow-auto rounded-lg border border-border bg-component p-3 text-xs text-text"
            >{{ mockParsedResult || '成功请求后会展示 data 字段解析结果' }}</pre>
          </div>
        </div>
      </GrowSpace>
    </GrowCard>
  </div>
</template>
