import type {
  DataPrepDataset,
  DataPrepSchemaBundle,
  DataPrepSchemaListItem,
  DatasetQueryRequest,
  DatasetQueryResult,
} from './types'
import {
  getDatasetFromStorage,
  loadDatasetsFromStorage,
  removeDatasetFromStorage,
  upsertDatasetInStorage,
} from './datasetStorage'

type ApiEnvelope<T> = {
  code: string
  data: T
  message?: string
}

async function mockFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }
  const body = (await response.json()) as ApiEnvelope<T>
  if (String(body.code) !== '1') {
    throw new Error(body.message || '接口返回错误')
  }
  return body.data
}

/** 列出 Mock Schema（DatabaseSchema 格式） */
export function fetchDataPrepSchemas() {
  return mockFetch<DataPrepSchemaListItem[]>('/mock/data-prep/schemas')
}

export function fetchDataPrepSchemaBundle(schemaId: string) {
  return mockFetch<DataPrepSchemaBundle>(
    `/mock/data-prep/schema-bundle?id=${encodeURIComponent(schemaId)}`,
  )
}

export function fetchDataPrepDatasets() {
  return mockFetch<DataPrepDataset[]>('/mock/data-prep/datasets').catch(() =>
    loadDatasetsFromStorage(),
  )
}

export async function saveDataPrepDataset(dataset: DataPrepDataset) {
  const saved = await mockFetch<DataPrepDataset>('/mock/data-prep/datasets', {
    method: 'POST',
    body: JSON.stringify(dataset),
  }).catch(() => dataset)
  upsertDatasetInStorage(saved)
  return saved
}

export async function deleteDataPrepDataset(id: string) {
  await mockFetch<{ id: string }>(
    `/mock/data-prep/dataset?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  ).catch(() => ({ id }))
  removeDatasetFromStorage(id)
}

export function queryDataPrepDataset(request: DatasetQueryRequest) {
  const payload = {
    ...request,
    dataset: request.dataset || (request.datasetId ? getDatasetFromStorage(request.datasetId) : undefined),
  }
  return mockFetch<DatasetQueryResult>('/mock/data-prep/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
