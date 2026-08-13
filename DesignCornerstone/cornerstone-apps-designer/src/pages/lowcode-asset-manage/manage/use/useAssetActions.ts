import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { useRouteNavigate } from '@grow-admin-rock/hooks'
import {
  deleteLowcodeAsset,
  fetchLowcodeAssetVersions,
  publishLowcodeAsset,
  rollbackLowcodeAsset,
  setLowcodeAssetEnabled,
  type LowcodeAssetVersionListItem,
} from '../../../../api/lowcodeAsset'
import type { LowcodeAssetListItem } from '../../../../types/lowcodeAsset'

type UseAssetActionsOptions = {
  onSuccess: () => void | Promise<void>
}

export function useAssetActions(options: UseAssetActionsOptions) {
  const message = useMsg()
  const { go } = useRouteNavigate()

  const publishVisible = ref(false)
  const publishSubmitting = ref(false)
  const publishRemark = ref('')
  const publishTarget = ref<LowcodeAssetListItem | null>(null)

  const deleteVisible = ref(false)
  const deleteSubmitting = ref(false)
  const deleteTarget = ref<LowcodeAssetListItem | null>(null)

  const versionVisible = ref(false)
  const versionLoading = ref(false)
  const versionAsset = ref<LowcodeAssetListItem | null>(null)
  const versionCurrent = ref<string | null>(null)
  const versionRows = ref<LowcodeAssetVersionListItem[]>([])

  function goDesign(row: LowcodeAssetListItem) {
    go(
      { name: 'LowcodeAssetDesign', params: { id: row.id } },
      { tabMode: 'stack', parentName: 'LowcodeAssetManage' },
    )
  }

  function onPublish(row: LowcodeAssetListItem) {
    publishTarget.value = row
    publishRemark.value = ''
    publishVisible.value = true
  }

  async function confirmPublish() {
    if (!publishTarget.value) return
    publishSubmitting.value = true
    try {
      await publishLowcodeAsset(publishTarget.value.id, publishRemark.value.trim())
      message.success('发布成功')
      publishVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败')
    } finally {
      publishSubmitting.value = false
    }
  }

  async function onToggleEnabled(row: LowcodeAssetListItem) {
    try {
      await setLowcodeAssetEnabled(row.id, !row.enabled)
      message.success(row.enabled ? '已停用' : '已启用')
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  function onDelete(row: LowcodeAssetListItem) {
    if (row.enabled) {
      message.warning('启用中的资产不能删除，请先停用')
      return
    }
    deleteTarget.value = row
    deleteVisible.value = true
  }

  async function confirmDelete() {
    if (!deleteTarget.value) return
    deleteSubmitting.value = true
    try {
      await deleteLowcodeAsset(deleteTarget.value.id)
      message.success('删除成功')
      deleteVisible.value = false
      await options.onSuccess()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    } finally {
      deleteSubmitting.value = false
    }
  }

  async function openVersions(row: LowcodeAssetListItem) {
    versionAsset.value = row
    versionVisible.value = true
    versionLoading.value = true
    versionRows.value = []
    versionCurrent.value = row.currentVersion
    try {
      const data = await fetchLowcodeAssetVersions(row.id)
      versionCurrent.value = data.currentVersion
      versionRows.value = data.items || []
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载版本失败')
    } finally {
      versionLoading.value = false
    }
  }

  async function onRollback(row: LowcodeAssetVersionListItem) {
    if (!versionAsset.value) return
    try {
      await rollbackLowcodeAsset(versionAsset.value.id, row.version)
    } catch (error) {
      message.warning(error instanceof Error ? error.message : '暂未开放')
    }
  }

  return {
    publishVisible,
    publishSubmitting,
    publishRemark,
    publishTarget,
    deleteVisible,
    deleteSubmitting,
    deleteTarget,
    versionVisible,
    versionLoading,
    versionAsset,
    versionCurrent,
    versionRows,
    goDesign,
    onPublish,
    confirmPublish,
    onToggleEnabled,
    onDelete,
    confirmDelete,
    openVersions,
    onRollback,
  }
}
