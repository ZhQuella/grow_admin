import { ref, watch } from 'vue'
import { fetchSystemTenantHistory } from '../../../api/systemTenant'
import type { SystemTenantHistoryItem, SystemTenantListItem } from '../../../types/systemTenant'
import { toMessage } from './helpers'

export function useTenantHistory() {
  const visible = ref(false)
  const target = ref<SystemTenantListItem>()
  const loading = ref(false)
  const isMock = !import.meta.env.VITE_ACCOUNT_API_URL
  const error = ref('')
  const items = ref<SystemTenantHistoryItem[]>([])
  const page = ref(0)
  const pageSize = 10
  const total = ref(0)
  const hasMore = ref(true)
  let requestId = 0

  async function loadMore() {
    if (!visible.value || !target.value || loading.value || !hasMore.value) return
    const currentRequest = ++requestId
    const nextPage = page.value + 1
    loading.value = true
    error.value = ''
    try {
      const result = await fetchSystemTenantHistory(target.value.id, nextPage, pageSize)
      if (currentRequest !== requestId) return
      const records = result.items ?? []
      const knownIds = new Set(items.value.map((item) => String(item.id)))
      records.forEach((item) => {
        const id = String(item.id)
        if (knownIds.has(id)) return
        knownIds.add(id)
        items.value.push(item)
      })
      page.value = nextPage
      total.value = result.total ?? 0
      hasMore.value = records.length > 0 && nextPage * pageSize < total.value
    } catch (cause) {
      if (currentRequest !== requestId) return
      error.value = toMessage(cause, '变更历史加载失败，请重试')
    } finally {
      if (currentRequest === requestId) loading.value = false
    }
  }

  async function open(row: SystemTenantListItem) {
    requestId++
    loading.value = false
    target.value = row
    items.value = []
    page.value = 0
    total.value = 0
    hasMore.value = true
    error.value = ''
    visible.value = true
    await loadMore()
  }

  watch(visible, (value) => {
    if (!value) {
      requestId++
      loading.value = false
    }
  }, { flush: 'sync' })

  return { visible, target, loading, isMock, error, items, total, hasMore, loadMore, open }
}
