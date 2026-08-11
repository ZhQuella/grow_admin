import { nanoid } from 'nanoid'
import type {
  ProcessConditionArm,
  ProcessConditionBranchConfig,
  ProcessFlowNode,
  ProcessParallelArm,
  ProcessParallelBranchConfig,
  ProcessRuleCondition,
} from '../types'

/** 条件分支固定默认出口 id（画布锚点，不进可编辑条件列表） */
export const CONDITION_DEFAULT_ARM_ID = 'default'

export const MIN_CONDITION_ARM_COUNT = 1
export const MAX_CONDITION_ARM_COUNT = 10
export const MIN_BRANCH_COUNT = 2
export const MAX_BRANCH_COUNT = 10

export function branchHandleId(branchId: string) {
  return `out-b-${branchId}`
}

export function conditionDefaultHandleId() {
  return branchHandleId(CONDITION_DEFAULT_ARM_ID)
}

export function parseBranchHandleId(handleId?: string | null): string | null {
  if (!handleId || !String(handleId).startsWith('out-b-')) return null
  return String(handleId).slice('out-b-'.length) || null
}

export function isBranchHandleId(handleId?: string | null) {
  return !!parseBranchHandleId(handleId)
}

function emptyCondition(): ProcessRuleCondition {
  return { field: '', op: 'eq', value: '' }
}

export function createConditionArm(
  patch: Partial<ProcessConditionArm> = {},
): ProcessConditionArm {
  return {
    id: patch.id || nanoid(8),
    label: patch.label || '条件',
    logic: patch.logic || 'and',
    conditions: patch.conditions?.length ? patch.conditions : [emptyCondition()],
    expression: patch.expression || '',
  }
}

export function createParallelArm(
  patch: Partial<ProcessParallelArm> = {},
): ProcessParallelArm {
  return {
    id: patch.id || nanoid(8),
    label: patch.label || '并行',
  }
}

function isLegacyDefaultArm(item: ProcessConditionArm) {
  return !!item.isDefault || item.id === CONDITION_DEFAULT_ARM_ID
}

/** 可编辑的条件出口（不含固定默认锚点） */
export function normalizeConditionBranches(
  config: ProcessConditionBranchConfig | null | undefined,
): ProcessConditionArm[] {
  const cfg = config || {}
  if (cfg.branches?.length) {
    const arms = cfg.branches
      .filter((item) => !isLegacyDefaultArm(item))
      .map((item, index) =>
        createConditionArm({
          ...item,
          id:
            item.id === CONDITION_DEFAULT_ARM_ID
              ? nanoid(8)
              : item.id,
          label: item.label || `条件${index + 1}`,
        }),
      )
    return arms.length
      ? arms
      : [createConditionArm({ label: '条件1' })]
  }

  // 旧二路：只保留「满足」侧为条件出口
  return [
    createConditionArm({
      label: cfg.trueLabel || '条件1',
      logic: cfg.logic || 'and',
      conditions: cfg.conditions?.length ? cfg.conditions : [emptyCondition()],
      expression: cfg.expression || '',
    }),
  ]
}

/** 画布展示：条件出口 + 固定默认锚点 */
export function getConditionCanvasArms(
  config: ProcessConditionBranchConfig | null | undefined,
): Array<{ id: string; label: string; isDefault?: boolean }> {
  const arms = normalizeConditionBranches(config).map((item) => ({
    id: item.id,
    label: item.label,
  }))
  return [
    ...arms,
    { id: CONDITION_DEFAULT_ARM_ID, label: '默认', isDefault: true },
  ]
}

export function normalizeParallelBranches(
  config: ProcessParallelBranchConfig | null | undefined,
): ProcessParallelArm[] {
  const cfg = config || {}
  if (cfg.branches?.length) {
    return cfg.branches.map((item, index) =>
      createParallelArm({
        ...item,
        label: item.label || `并行${index + 1}`,
      }),
    )
  }
  const labels = cfg.branchLabels?.length ? cfg.branchLabels : ['并行1', '并行2']
  return labels.map((label, index) =>
    createParallelArm({ label: label || `并行${index + 1}` }),
  )
}

export function getNodeBranchArms(
  node: ProcessFlowNode,
): Array<{ id: string; label: string; isDefault?: boolean }> {
  if (node.type === 'condition-branch') {
    return getConditionCanvasArms(node.config as ProcessConditionBranchConfig)
  }
  if (node.type === 'parallel-branch') {
    return normalizeParallelBranches(node.config as ProcessParallelBranchConfig)
  }
  return []
}

export function listBranchHandleIds(node: ProcessFlowNode): string[] {
  return getNodeBranchArms(node).map((item) => branchHandleId(item.id))
}

/** 分支出口均匀分布在底部（百分比 left） */
export function branchHandleLeftPercent(index: number, total: number) {
  if (total <= 1) return 50
  return ((index + 1) / (total + 1)) * 100
}
