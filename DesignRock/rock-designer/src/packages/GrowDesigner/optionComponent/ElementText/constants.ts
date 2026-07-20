/** 文字设置：选项与默认值配置 */

export const TEXT_ALLOWED_TAGS = new Set(['BasicTitle', 'p', 'span'])

export const DEFAULT_TEXT_COLOR = '#101010'

export const FONT_STYLE_TOGGLES = [
  { key: 'bold', tip: '加粗', label: 'B', style: 'font-weight: 700' },
  { key: 'italic', tip: '斜体', label: 'I', style: 'font-style: italic' },
  { key: 'underline', tip: '下划线', label: 'U', style: 'text-decoration: underline' },
  { key: 'strike', tip: '删除线', label: 'S', style: 'text-decoration: line-through' },
] as const

export type FontStyleKey = (typeof FONT_STYLE_TOGGLES)[number]['key']

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', tip: '左对齐', icon: 'carbon:align-horizontal-left' },
  { value: 'center', tip: '水平居中', icon: 'carbon:align-horizontal-center' },
  { value: 'right', tip: '右对齐', icon: 'carbon:align-horizontal-right' },
  { value: 'justify', tip: '两端对齐', icon: 'carbon:text-align-justify' },
] as const

export const VERTICAL_ALIGN_OPTIONS = [
  { value: 'flex-start', tip: '顶部对齐', icon: 'carbon:align-vertical-top' },
  { value: 'center', tip: '垂直居中', icon: 'carbon:align-vertical-center' },
  { value: 'flex-end', tip: '底部对齐', icon: 'carbon:align-vertical-bottom' },
] as const

/** 自动/固定：文本框尺寸行为 */
export const RESIZE_MODE_OPTIONS = [
  { value: 'auto', tip: '自动宽度', icon: 'carbon:text-scale' },
  { value: 'fixed-width', tip: '固定宽度', icon: 'carbon:text-font' },
  { value: 'fixed', tip: '固定尺寸', icon: 'carbon:checkbox' },
] as const

export type ResizeMode = (typeof RESIZE_MODE_OPTIONS)[number]['value']

export const WRITING_MODE_OPTIONS = [
  { value: 'horizontal-tb', tip: '横向排列', icon: 'carbon:arrows-horizontal' },
  { value: 'vertical-rl', tip: '纵向排列', icon: 'carbon:arrows-vertical' },
] as const

export const LIST_STYLE_OPTIONS = [
  { value: 'disc', tip: '无序列表', icon: 'carbon:list' },
  { value: 'decimal', tip: '有序列表', icon: 'carbon:list-numbered' },
] as const
