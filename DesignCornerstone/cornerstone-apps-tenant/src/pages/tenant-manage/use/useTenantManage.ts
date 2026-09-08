import { onMounted } from 'vue'
import { useTenantActions } from './useTenantActions'
import { useTenantForm } from './useTenantForm'
import { useTenantTable } from './useTenantTable'
import {
  availableTenantActions,
  formatServicePeriod,
  formatTime,
  tenantStatusLabel,
  tenantStatusTagType,
  tenantTypeLabel,
} from './helpers'

export function useTenantManage() {
  const table = useTenantTable()
  const form = useTenantForm({ onSuccess: table.loadList })
  const actions = useTenantActions({ onSuccess: table.loadList })

  onMounted(() => {
    void table.loadList()
  })

  return {
    ...table,
    ...form,
    ...actions,
    availableTenantActions,
    formatServicePeriod,
    formatTime,
    tenantStatusLabel,
    tenantStatusTagType,
    tenantTypeLabel,
  }
}
