import { computed, ref, watch } from 'vue'
import type { DesignerSchema } from '@grow-admin-rock/designer'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { useRoute } from '@grow-admin-rock/middleware-router'
import {
  getLowcodeAssetDetail,
  saveLowcodeAssetSchema,
} from '../../../../api/lowcodeAsset'
import {
  createEmptyDesignerSchema,
  lowcodeAssetTypeLabel,
  type LowcodeAsset,
} from '../../../../types/lowcodeAsset'

const ROUTE_NAME = 'LowcodeAssetDesign'

export function useLowcodeAssetDesign() {
  const route = useRoute()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const saving = ref(false)
  const asset = ref<LowcodeAsset | null>(null)
  const designerSchema = ref<DesignerSchema | null>(null)
  const schemaReady = ref(false)
  const designerRef = ref<{ getSchema: () => DesignerSchema } | null>(null)

  const typeLabel = computed(() =>
    asset.value ? lowcodeAssetTypeLabel(asset.value.type) : '',
  )

  const publishStateTagType = computed(() =>{
    if (!asset.value?.currentVersion) {
      return 'info'
    }
    return asset.value?.enabled ? 'success' : 'danger'
  })

  async function loadAsset(id: string) {
    if (!id) {
      asset.value = null
      designerSchema.value = null
      schemaReady.value = false
      return
    }

    if (asset.value?.id === id && designerSchema.value) {
      return
    }

    loading.value = true
    schemaReady.value = false
    try {
      const detail = await getLowcodeAssetDetail(id)
      // 请求返回时可能已切到其他路由，避免串写
      if (route.name !== ROUTE_NAME || String(route.params.id || '') !== id) {
        return
      }
      asset.value = detail
      designerSchema.value = detail.draftSchema || createEmptyDesignerSchema()
      schemaReady.value = true
      setTab(`设计-${detail.name}`)
    } catch (error) {
      if (route.name !== ROUTE_NAME || String(route.params.id || '') !== id) {
        return
      }
      asset.value = null
      designerSchema.value = null
      schemaReady.value = false
      message.error(error instanceof Error ? error.message : '加载失败')
    } finally {
      if (route.name === ROUTE_NAME && String(route.params.id || '') === id) {
        loading.value = false
      }
    }
  }

  async function onSave() {
    if (!asset.value || !designerRef.value) return
    saving.value = true
    try {
      const schema = designerRef.value.getSchema()
      await saveLowcodeAssetSchema(asset.value.id, schema)
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
      // keep-alive 下多个设计页会共享当前 route，仅在本路由激活时加载
      if (name !== ROUTE_NAME) return
      void loadAsset(id)
    },
    { immediate: true },
  )

  return {
    loading,
    saving,
    asset,
    publishStateTagType,
    designerSchema,
    schemaReady,
    designerRef,
    typeLabel,
    onSave,
    onBack,
  }
}
