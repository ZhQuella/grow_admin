import { driverRef } from '@grow-admin-rock/components'

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function formatTime(value?: string) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function formatDate(value?: string) {
  if (!value) return '-'
  return value.slice(0, 10)
}

export function maskMobile(value?: string) {
  const text = String(value || '')
  if (text.length < 7) return text || '-'
  return `${text.slice(0, 3)}****${text.slice(-4)}`
}

export function maskId(value?: string) {
  const text = String(value || '')
  if (text.length < 8) return text || '-'
  return `${text.slice(0, 4)}********${text.slice(-4)}`
}

export function maskBank(value?: string) {
  const text = String(value || '')
  if (text.length < 8) return text || '-'
  return `${text.slice(0, 4)} **** **** ${text.slice(-4)}`
}

export function maskAccount(value?: string) {
  const text = String(value || '')
  if (text.length < 6) return text || '-'
  return `${text.slice(0, 2)}****${text.slice(-4)}`
}

export function displayText(value?: string | number | null) {
  const text = String(value ?? '').trim()
  return text || '-'
}

export function pickSelectId(value: unknown): string {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return pickSelectId(value[0])
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    return String(rec.id ?? rec.value ?? '')
  }
  return String(value)
}

export function toPostSelectOptions(posts: Array<{ id: string; name: string; enabled?: boolean }>) {
  return posts
    .filter((item) => item.enabled !== false)
    .map((item) => ({ label: item.name, value: item.id }))
}

export function optionLabel<T extends string>(
  options: ReadonlyArray<{ label: string; value: T }>,
  value?: string,
) {
  if (!value) return '-'
  return options.find((item) => item.value === value)?.label || value
}

export function parseIdCard(idNumber: string) {
  const id = String(idNumber || '').trim()
  if (!/^\d{17}[\dXx]$/.test(id)) return null
  return {
    birthDate: `${id.slice(6, 10)}-${id.slice(10, 12)}-${id.slice(12, 14)}`,
    gender: Number(id.slice(16, 17)) % 2 === 1 ? 'male' : 'female',
  }
}

export function yearsAndMonths(from?: string, to?: string) {
  if (!from) return ''
  const start = new Date(from)
  const end = to ? new Date(to) : new Date()
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return ''
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  if (months < 0) return ''
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (!years && !rest) return '不足1个月'
  if (!years) return `${rest}个月`
  if (!rest) return `${years}年`
  return `${years}年${rest}个月`
}

export function calcAge(birthDate?: string) {
  if (!birthDate) return ''
  const start = new Date(birthDate)
  if (Number.isNaN(start.getTime())) return ''
  const end = new Date()
  let age = end.getFullYear() - start.getFullYear()
  if (end.getMonth() * 32 + end.getDate() < start.getMonth() * 32 + start.getDate()) age -= 1
  return age >= 0 ? String(age) : ''
}

export function todayText() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function collectDeptIds(
  nodes: Array<{ id: string; children?: any[] }>,
  rootId: string,
) {
  const ids = new Set<string>()
  const walk = (list: Array<{ id: string; children?: any[] }>, active: boolean) => {
    for (const node of list) {
      const on = active || node.id === rootId
      if (on) ids.add(node.id)
      if (node.children?.length) walk(node.children, on)
    }
  }
  walk(nodes, !rootId)
  return ids
}

export function findDeptTitle(
  nodes: Array<{ id: string; title: string; children?: any[] }>,
  id: string,
): string {
  for (const node of nodes) {
    if (node.id === id) return node.title
    if (node.children?.length) {
      const found = findDeptTitle(node.children, id)
      if (found) return found
    }
  }
  return ''
}

export function nextFamilyId() {
  return `fm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function emptyFamilyMember() {
  return { id: nextFamilyId(), name: '', relation: '', gender: '', birthday: '', phone: '' }
}

export function hasFamilyContent(row: { name?: string; relation?: string; gender?: string; birthday?: string; phone?: string }) {
  return !!(row.name || row.relation || row.gender || row.birthday || row.phone)
}

export function nextEmergencyId() {
  return `ec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function emptyEmergencyContact() {
  return { id: nextEmergencyId(), name: '', relation: '', phone: '' }
}

export function hasEmergencyContent(row: { name?: string; relation?: string; phone?: string }) {
  return !!(row.name || row.relation || row.phone)
}

export function normalizeEmergencyContacts(source: {
  emergencyContacts?: Array<{ id?: string; name?: string; relation?: string; phone?: string }>
  emergencyName?: string
  emergencyRelation?: string
  emergencyPhone?: string
}) {
  if (Array.isArray(source.emergencyContacts) && source.emergencyContacts.length) {
    return source.emergencyContacts.map((item) => ({
      id: item.id || nextEmergencyId(),
      name: item.name || '',
      relation: item.relation || '',
      phone: item.phone || '',
    }))
  }
  if (source.emergencyName || source.emergencyRelation || source.emergencyPhone) {
    return [{
      id: nextEmergencyId(),
      name: source.emergencyName || '',
      relation: source.emergencyRelation || '',
      phone: source.emergencyPhone || '',
    }]
  }
  return []
}

export function nextAssignmentId() {
  return `as_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function emptyAssignment(type: 'primary' | 'part_time' = 'primary') {
  return {
    id: nextAssignmentId(),
    deptId: '',
    deptName: '',
    postId: '',
    postName: '',
    jobCode: '',
    jobTitle: '',
    jobGrade: '',
    type,
    startDate: todayText(),
    endDate: '',
    status: 'active' as const,
    occupyHeadcount: type === 'primary',
    supervisorId: '',
    collaboratorIds: [],
  }
}

export function hasAssignmentContent(row: {
  deptId?: string
  postId?: string
  jobCode?: string
  jobTitle?: string
  jobGrade?: string
}) {
  return !!(row.deptId || row.postId || row.jobCode || row.jobTitle || row.jobGrade)
}

export function statusTag(status?: string) {
  if (status === 'formal' || status === 'rehired') return 'success'
  if (status === 'probation' || status === 'pending') return 'warning'
  if (status === 'resigned' || status === 'retired' || status === 'disabled') return 'info'
  return 'info'
}

export async function validateGrowForm(formRef: { value: unknown }) {
  const form = driverRef(formRef as any) as { validate?: () => Promise<unknown> } | undefined
  if (!form?.validate) {
    throw new Error('表单未就绪')
  }
  const result = await form.validate()
  if (result === false) {
    throw new Error('校验未通过')
  }
}
