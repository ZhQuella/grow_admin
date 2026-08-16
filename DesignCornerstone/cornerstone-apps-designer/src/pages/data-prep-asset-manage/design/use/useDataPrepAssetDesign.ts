import { ref, watch, computed } from 'vue'
import type { DataPrepDataset } from '@grow-admin-rock/data-prep'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { useRoute } from '@grow-admin-rock/middleware-router'
import {
  getDataPrepAssetDetail,
  saveDataPrepAssetSchema,
} from '../../../../api/dataPrepAsset'
import {
  createEmptyDataPrepSchema,
  type DataPrepAsset,
} from '../../../../types/dataPrepAsset'

const ROUTE_NAME = 'DataPrepAssetDesign'

export function useDataPrepAssetDesign() {
  const route = useRoute()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const saving = ref(false)
  const asset = ref<DataPrepAsset | null>(null)
  const designerSchema = ref<DataPrepDataset | null>(null)
  const schemaReady = ref(false)

  const publishStateTagType = computed(() => {
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
      const detail = await getDataPrepAssetDetail(id)
      if (route.name !== ROUTE_NAME || String(route.params.id || '') !== id) {
        return
      }
      asset.value = detail
      designerSchema.value = detail.draftSchema || createEmptyDataPrepSchema()
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

  async function persistSchema() {
    if (!asset.value || !designerSchema.value) return
    await saveDataPrepAssetSchema(asset.value.id, designerSchema.value)
  }

  async function onSave() {
    if (!asset.value || !designerSchema.value) return
    saving.value = true
    try {
      await persistSchema()
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
    onSave,
    onBack,
  }
}
