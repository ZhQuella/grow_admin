<template>
  <div
    ref="rootRef"
    class="formula-chip-input"
    :class="{ 'is-empty': isEmpty }"
    contenteditable="true"
    role="textbox"
    :data-placeholder="placeholder"
    @input="onInput"
    @keydown="onKeydown"
    @mouseup="saveSelection"
    @keyup="saveSelection"
    @blur="saveSelection"
    @click="onRootClick"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'

defineOptions({
  name: 'DataPrepFormulaChipInput',
})

export type FormulaChipField = {
  field: string
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    fields?: FormulaChipField[]
    placeholder?: string
  }>(),
  {
    fields: () => [],
    placeholder: '点击左侧字段 / 函数插入，或直接输入公式',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootRef = ref<HTMLElement | null>(null)
const savedRange = ref<Range | null>(null)
let syncing = false

const fieldLabelMap = computed(() => {
  const map = new Map<string, string>()
  for (const item of props.fields || []) {
    map.set(item.field, item.label || item.field)
  }
  return map
})

const isEmpty = computed(() => !String(props.modelValue || '').trim())

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function labelOf(field: string) {
  return fieldLabelMap.value.get(field) || field
}

function chipHtml(field: string) {
  const label = escapeHtml(labelOf(field))
  return `<span class="formula-chip" contenteditable="false" data-field="${escapeHtml(field)}" title="${escapeHtml(field)}"><span class="formula-chip__label">${label}</span></span>`
}

function formulaToHtml(formula: string) {
  if (!formula) return ''
  const re = /\[([^\]]+)\]/g
  let html = ''
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(formula))) {
    if (match.index > last) {
      html += escapeHtml(formula.slice(last, match.index))
    }
    html += chipHtml(match[1].trim())
    last = match.index + match[0].length
  }
  if (last < formula.length) html += escapeHtml(formula.slice(last))
  return html
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as HTMLElement
  if (el.classList.contains('formula-chip')) {
    const field = el.getAttribute('data-field') || ''
    return field ? `[${field}]` : ''
  }
  if (el.tagName === 'BR') return '\n'
  let out = ''
  el.childNodes.forEach((child) => {
    out += serializeNode(child)
  })
  return out
}

function readFormulaFromDom() {
  const root = rootRef.value
  if (!root) return ''
  let out = ''
  root.childNodes.forEach((child) => {
    out += serializeNode(child)
  })
  return out.replace(/\u200b/g, '')
}

function renderFromModel(formula: string) {
  const root = rootRef.value
  if (!root) return
  syncing = true
  root.innerHTML = formulaToHtml(formula)
  syncing = false
}

function saveSelection() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  const root = rootRef.value
  if (!root || !root.contains(range.commonAncestorContainer)) return
  savedRange.value = range.cloneRange()
}

function restoreSelection() {
  const root = rootRef.value
  const selection = window.getSelection()
  if (!root || !selection) return false
  if (savedRange.value && root.contains(savedRange.value.commonAncestorContainer)) {
    selection.removeAllRanges()
    selection.addRange(savedRange.value)
    return true
  }
  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
  savedRange.value = range.cloneRange()
  return true
}

function placeCaretAfter(node: Node) {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  savedRange.value = range.cloneRange()
}

function insertHtmlAtCursor(html: string) {
  const root = rootRef.value
  if (!root) return
  root.focus()
  restoreSelection()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  range.deleteContents()
  const temp = document.createElement('div')
  temp.innerHTML = html
  const frag = document.createDocumentFragment()
  let last: ChildNode | null = null
  while (temp.firstChild) {
    last = temp.firstChild
    frag.appendChild(temp.firstChild)
  }
  range.insertNode(frag)
  if (last) placeCaretAfter(last)
  else saveSelection()
  emit('update:modelValue', readFormulaFromDom())
}

function insertText(text: string) {
  insertHtmlAtCursor(escapeHtml(text))
}

function insertField(field: string) {
  insertHtmlAtCursor(chipHtml(field))
}

function onInput() {
  if (syncing) return
  emit('update:modelValue', readFormulaFromDom())
  saveSelection()
}

function onKeydown(event: KeyboardEvent) {
  // 避免在芯片内编辑；退格删整颗芯片由浏览器处理 contenteditable=false
  if (event.key === 'Enter') {
    event.preventDefault()
    insertText('\n')
  }
}

function onRootClick() {
  saveSelection()
}

onMounted(() => {
  renderFromModel(props.modelValue || '')
})

watch(
  () => props.modelValue,
  async (value) => {
    await nextTick()
    const current = readFormulaFromDom()
    if (current === (value || '')) return
    renderFromModel(value || '')
  },
)

watch(
  () => props.fields,
  async () => {
    await nextTick()
    // 字段标签变化时按当前公式重绘芯片文案
    renderFromModel(props.modelValue || '')
  },
  { deep: true },
)

onBeforeUnmount(() => {
  savedRange.value = null
})

defineExpose({
  insertField,
  insertText,
  focus() {
    rootRef.value?.focus()
    restoreSelection()
  },
  renderFromModel,
})
</script>

<style scoped>
.formula-chip-input {
  box-sizing: border-box;
  min-height: 140px;
  max-height: 220px;
  overflow: auto;
  padding: 12px 14px;
  border: 1px solid var(--layout-border-color, var(--border-color));
  border-radius: 6px;
  background: var(--component-background-color, #fff);
  color: var(--text-color);
  font-size: 13px;
  line-height: 1.8;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.formula-chip-input:focus {
  border-color: color-mix(in srgb, var(--primary-color) 55%, var(--layout-border-color, var(--border-color)));
}

.formula-chip-input.is-empty:before {
  content: attr(data-placeholder);
  color: var(--text-color-secondary, var(--text-secondary-color));
  pointer-events: none;
}

.formula-chip-input :deep(.formula-chip) {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  margin: 0 2px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 28%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  vertical-align: middle;
  user-select: none;
  white-space: nowrap;
}

.formula-chip-input :deep(.formula-chip__label) {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
