import type { PropBindMode } from '../../static/propBindModes'

export type StepStatus = '' | 'process' | 'wait' | 'finish' | 'error'

export type StepItemDraft = {
  id: string
  title: string
  description: string
  status: StepStatus
  disabled: boolean
  icon: string
  bindModes: {
    title?: PropBindMode
    description?: PropBindMode
    icon?: PropBindMode
  }
}

export const STEP_STATUS_OPTIONS: { label: string; value: StepStatus }[] = [
  { label: '跟随步骤条', value: '' },
  { label: '进行中', value: 'process' },
  { label: '等待', value: 'wait' },
  { label: '完成', value: 'finish' },
  { label: '错误', value: 'error' },
]

export const normalizeStepStatus = (value: unknown): StepStatus => {
  if (
    value === 'process' ||
    value === 'wait' ||
    value === 'finish' ||
    value === 'error'
  ) {
    return value
  }
  return ''
}
