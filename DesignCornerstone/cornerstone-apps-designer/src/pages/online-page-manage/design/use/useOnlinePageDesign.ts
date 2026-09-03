import { computed, ref, watch } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { useRoute } from '@grow-admin-rock/middleware-router'
import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import * as GrowState from '@grow-admin-rock/state'
import * as GrowRouter from '@grow-admin-rock/middleware-router'
import * as GrowUtils from '@grow-admin-rock/utils'
import * as GrowHooks from '@grow-admin-rock/hooks'
import type { CodeDependency, SandboxExpose } from '@grow-admin-rock/code-sandbox'
import {
  DEFAULT_SANDBOX_DEPENDENCIES,
  mergeDependencies,
} from '@grow-admin-rock/code-sandbox'
import { getOnlinePageDetail, saveOnlinePageDraft } from '../../../../api/onlinePage'
import {
  createEmptyOnlinePageDraft,
  type OnlinePage,
} from '../../../../types/onlinePage'

const ROUTE_NAME = 'OnlinePageDesign'

export function useOnlinePageDesign() {
  const route = useRoute()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()
  /** keep-alive 下多个设计页共享当前 route，只加载本实例打开时的 id */
  const boundId = String(route.params.id || '')

  const loading = ref(false)
  const saving = ref(false)
  const asset = ref<OnlinePage | null>(null)
  const schemaReady = ref(false)
  const sandboxFiles = ref<Record<string, string>>({})
  const dependencies = ref<CodeDependency[]>([])
  const previewExpanded = ref(false)

  const publishStateTagType = computed(() => {
    if (!asset.value?.currentVersion) {
      return 'info'
    }
    return asset.value?.enabled ? 'success' : 'danger'
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

  async function loadAsset(id: string) {
    if (!id) {
      asset.value = null
      sandboxFiles.value = {}
      dependencies.value = []
      schemaReady.value = false
      return
    }

    if (asset.value?.id === id && schemaReady.value) {
      return
    }

    loading.value = true
    schemaReady.value = false
    try {
      const detail = await getOnlinePageDetail(id)
      if (id !== boundId) {
        return
      }
      const draft = detail.draft || createEmptyOnlinePageDraft()
      asset.value = detail
      sandboxFiles.value = { ...draft.files }
      dependencies.value = mergeDependencies(
        DEFAULT_SANDBOX_DEPENDENCIES,
        draft.dependencies || [],
      )
      schemaReady.value = true
      setTab(`设计-${detail.name}`)
    } catch (error) {
      if (id !== boundId) {
        return
      }
      asset.value = null
      sandboxFiles.value = {}
      dependencies.value = []
      schemaReady.value = false
      message.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      if (id === boundId) {
        loading.value = false
      }
    }
  }

  async function onSave() {
    if (!asset.value) return
    saving.value = true
    try {
      await saveOnlinePageDraft(asset.value.id, {
        files: { ...sandboxFiles.value },
        dependencies: dependencies.value.map(({ value: _value, ...item }) => item),
      })
      message.success('保存成功')
      closeCurrent()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      saving.value = false
    }
  }

  function onBack() {
    closeCurrent()
  }

  watch(
    () => ({ name: route.name, id: String(route.params.id || '') }),
    ({ name, id }) => {
      if (name !== ROUTE_NAME || id !== boundId) return
      void loadAsset(boundId)
    },
    { immediate: true },
  )

  return {
    loading,
    saving,
    asset,
    publishStateTagType,
    schemaReady,
    sandboxFiles,
    dependencies,
    sandboxExpose,
    previewExpanded,
    onSave,
    onBack,
  }
}
