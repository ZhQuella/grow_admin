import type { ApplicationFunctionNode } from '../../../types/applicationFunction'

export function sortApplicationFunctions(items: ApplicationFunctionNode[]) {
  return [...items].sort((first, second) => (first.sort ?? 0) - (second.sort ?? 0))
}

export function filterApplicationFunctions(
  items: ApplicationFunctionNode[],
  query: Recordable<any>,
) {
  const keyword = String(query.keyword || '').trim().toLowerCase()
  return items.filter((item) => {
    const keywordMatched = !keyword || [item.title, item.name, item.path]
      .some((value) => String(value || '').toLowerCase().includes(keyword))
    const visibleMatched = query.isVisible == null || query.isVisible === ''
      || String(item.isVisible) === String(query.isVisible)
    const enabledMatched = query.enabled == null || query.enabled === ''
      || String(item.enabled) === String(query.enabled)
    return keywordMatched && visibleMatched && enabledMatched
  })
}
