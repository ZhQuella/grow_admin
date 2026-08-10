import type { DataPrepDataset } from '../model/types'

export const DATA_PREP_DATASETS_STORAGE_KEY = 'grow-admin:data-prep:datasets:v2'

export function loadDatasetsFromStorage(): DataPrepDataset[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(DATA_PREP_DATASETS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DataPrepDataset[]) : []
  } catch {
    return []
  }
}

export function saveDatasetsToStorage(datasets: DataPrepDataset[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(DATA_PREP_DATASETS_STORAGE_KEY, JSON.stringify(datasets))
}

export function upsertDatasetInStorage(dataset: DataPrepDataset): DataPrepDataset[] {
  const list = loadDatasetsFromStorage()
  const next = {
    ...dataset,
    updatedAt: new Date().toISOString(),
  }
  const idx = list.findIndex((item) => item.id === next.id)
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  saveDatasetsToStorage(list)
  return list
}

export function removeDatasetFromStorage(id: string): DataPrepDataset[] {
  const list = loadDatasetsFromStorage().filter((item) => item.id !== id)
  saveDatasetsToStorage(list)
  return list
}

export function getDatasetFromStorage(id: string): DataPrepDataset | undefined {
  return loadDatasetsFromStorage().find((item) => item.id === id)
}
