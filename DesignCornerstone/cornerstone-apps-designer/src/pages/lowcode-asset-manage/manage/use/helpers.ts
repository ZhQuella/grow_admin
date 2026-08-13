import { lowcodeAssetTypeLabel, type LowcodeAssetType } from '../../../../types/lowcodeAsset'

export function typeLabel(type: LowcodeAssetType) {
  return lowcodeAssetTypeLabel(type)
}

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}
