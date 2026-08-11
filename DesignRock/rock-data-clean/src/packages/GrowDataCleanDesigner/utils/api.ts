import type { CleanDemoTable } from '../static/demoTables'
import {
  buildCleanTableRowsMap,
  DEMO_CLEAN_TABLES,
  type CleanTableRowsMap,
} from '../static/demoTables'

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

/** 清洗专用表清单（Mock） */
export function fetchCleanDemoTables() {
  return mockFetch<CleanDemoTable[]>('/mock/data-clean/tables')
}

/** 单表行数据（Mock） */
export function fetchCleanTableRows(tableId: string) {
  return mockFetch<Record<string, unknown>[]>(
    `/mock/data-clean/table-rows?id=${encodeURIComponent(tableId)}`,
  )
}

/**
 * 加载预览用行索引。优先走 Mock；失败时回退包内 demoTables。
 */
export async function loadCleanTableRowsMap(): Promise<CleanTableRowsMap> {
  try {
    const tables = await fetchCleanDemoTables()
    if (tables?.length) return buildCleanTableRowsMap(tables)
  } catch {
    // ignore and fallback
  }
  return buildCleanTableRowsMap(DEMO_CLEAN_TABLES)
}
