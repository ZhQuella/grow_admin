import { nanoid } from 'nanoid'
import type {
  ProcessFlow,
  ProcessFlowEdge,
  ProcessFlowNode,
  ProcessNodeConfigMap,
  ProcessNodeType,
} from './types'
import { NODE_TYPE_META } from './static/nodeCatalog'
import { resolveSourceHandle, resolveTargetHandle } from './utils/connection'
import { createConditionArm, createParallelArm } from './utils/branches'

const humanDefaults = {
  description: '',
  enableWhen: '',
  skipWhen: '',
  timeoutAction: 'none' as const,
  escalateTo: '',
}

const personAssignDefaults = {
  selectScope: 'all' as const,
  selectScopeValue: '',
  selectMin: 1,
  selectMax: 1,
  relativeTo: 'initiator' as const,
  relativeField: '',
  deptFrom: 'initiator' as const,
  deptFromValue: '',
  deptLevel: 'current' as const,
  deptLevelN: 1,
  includeDeputy: false,
  supervisorEnd: 'levels' as const,
  supervisorLevels: 2,
  supervisorUntilRole: '',
  supervisorMode: 'sequential' as const,
  skipDuplicate: true,
  skipIfInitiator: true,
  emptyFallback: 'error' as const,
  emptyFallbackValue: '',
}

export function defaultConfigForType<T extends ProcessNodeType>(
  type: T,
): ProcessNodeConfigMap[T] {
  switch (type) {
    case 'countersign':
      return {
        ...humanDefaults,
        assigneeType: 'role',
        assignees: '',
        passRule: 'all',
        passPercent: 100,
        formKey: '',
        formName: '',
        dueInHours: 48,
        visibleToOthers: true,
        requireComment: true,
        onReject: 'reject',
        rejectTarget: '',
      } as ProcessNodeConfigMap[T]
    case 'add-sign':
      return {
        ...humanDefaults,
        mode: 'after',
        assigneeType: 'user',
        assignee: '',
        reason: '',
        requireReason: true,
        returnToOrigin: true,
        formKey: '',
      } as ProcessNodeConfigMap[T]
    case 'approver':
      return {
        ...humanDefaults,
        ...personAssignDefaults,
        assigneeType: 'user',
        approvers: '',
        candidates: '',
        formKey: '',
        formName: '',
        approveLabel: '通过',
        rejectLabel: '驳回',
        dueInHours: 24,
        priority: 'normal',
        sequential: false,
        allowTransfer: true,
        requireCommentOnReject: true,
        requireCommentOnApprove: false,
        rejectStrategy: 'previous',
        rejectTarget: '',
        ccOnApprove: '',
      } as ProcessNodeConfigMap[T]
    case 'cc':
      return {
        ...humanDefaults,
        ...personAssignDefaults,
        assigneeType: 'user',
        recipients: '',
        waitConfirm: false,
        timing: 'on-enter',
        title: '',
        content: '',
        channel: 'inbox',
        canViewForm: true,
      } as ProcessNodeConfigMap[T]
    case 'handler':
      return {
        ...humanDefaults,
        ...personAssignDefaults,
        assigneeType: 'user',
        handlers: '',
        candidates: '',
        formKey: '',
        formName: '',
        dueInHours: 24,
        priority: 'normal',
        allowTransfer: true,
        requireComment: false,
        remark: '',
        resultOptions: '已处理,无法处理',
      } as ProcessNodeConfigMap[T]
    case 'start':
      return {
        remark: '',
        initiatorType: 'anyone',
        initiator: '',
        formKey: '',
        formName: '',
        bizType: '',
        initVariables: '',
      } as ProcessNodeConfigMap[T]
    case 'start-message':
      return {
        messageName: '',
        correlationKey: '',
        sourceSystem: '',
        payloadMap: '',
        allowDuplicate: false,
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'start-timer':
      return {
        scheduleType: 'cron',
        schedule: '0 0 * * *',
        timezone: 'Asia/Shanghai',
        intervalMinutes: 60,
        startAt: '',
        endAt: '',
        misfirePolicy: 'ignore',
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'end-event':
      return {
        outcome: 'completed',
        terminateAll: false,
        notifyOnEnd: false,
        notifyRecipients: '',
        bizStatus: '',
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'terminate':
      return {
        reason: '',
        outcome: 'terminated',
        audit: true,
        notifyInitiator: true,
        notifyRecipients: '',
        bizStatus: '',
      } as ProcessNodeConfigMap[T]
    case 'message-notify':
      return {
        channel: 'inbox',
        recipientType: 'user',
        recipients: '',
        title: '',
        content: '',
        templateId: '',
        templateName: '',
        webhookUrl: '',
        failOnError: false,
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'service-task':
      return {
        protocol: 'http',
        endpoint: '',
        method: 'POST',
        timeoutMs: 30000,
        retry: 0,
        retryIntervalMs: 1000,
        headers: '',
        bodyTemplate: '',
        resultVariable: 'serviceResult',
        successWhen: '',
        failAction: 'error',
        authType: 'none',
        authValue: '',
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'subprocess':
      return {
        processRef: '',
        processName: '',
        sync: true,
        inputMap: '',
        outputMap: '',
        multiInstance: false,
        collectionVariable: '',
        onError: 'fail',
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'state':
      return {
        stateKey: '',
        stateLabel: '',
        allowRollbackTo: [],
        allowJumpTo: [],
        isTerminal: false,
        bizField: 'status',
        bizValue: '',
        notifyOnEnter: '',
        notifyOnLeave: '',
        color: '',
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'script-task':
      return {
        language: 'javascript',
        script: '',
        resultVariable: 'scriptResult',
        failOnError: true,
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'business-rule-task':
      return {
        ruleSetId: '',
        ruleSetName: '',
        inputVars: '',
        outputVars: '',
        hitPolicy: 'first',
        failOnMiss: false,
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'condition-branch':
      return {
        branches: [createConditionArm({ label: '条件1' })],
        remark: '',
      } as ProcessNodeConfigMap[T]
    case 'parallel-branch':
      return {
        branches: [
          createParallelArm({ label: '并行1' }),
          createParallelArm({ label: '并行2' }),
        ],
        joinMode: 'all',
        joinCount: 1,
        remark: '',
      } as ProcessNodeConfigMap[T]
    default:
      return {} as ProcessNodeConfigMap[T]
  }
}

export function createProcessFlowNode(
  type: ProcessNodeType,
  patch: Partial<ProcessFlowNode> & { position?: { x: number; y: number } } = {},
): ProcessFlowNode {
  const meta = NODE_TYPE_META[type]
  return {
    id: patch.id ?? nanoid(10),
    type,
    name: patch.name ?? meta.label,
    position: patch.position ?? { x: 280, y: 40 },
    config: (patch.config as ProcessFlowNode['config']) ?? defaultConfigForType(type),
  }
}

export function createProcessFlowEdge(
  patch: Partial<ProcessFlowEdge> & Pick<ProcessFlowEdge, 'source' | 'target'>,
): ProcessFlowEdge {
  return {
    id: patch.id ?? nanoid(10),
    source: patch.source,
    target: patch.target,
    sourceHandle: patch.sourceHandle ?? 'out-bottom',
    targetHandle: patch.targetHandle ?? 'in-top',
    label: patch.label ?? '',
    transitionKind: patch.transitionKind ?? 'forward',
    condition: patch.condition ?? '',
    priority: patch.priority ?? 0,
    remark: patch.remark ?? '',
  }
}

export function createProcessFlow(
  patch: Partial<ProcessFlow> & Pick<ProcessFlow, 'name'> = { name: '未命名流程' },
): ProcessFlow {
  return {
    version: 1,
    id: patch.id ?? nanoid(10),
    name: patch.name,
    status: patch.status ?? 'draft',
    nodes: patch.nodes ? [...patch.nodes] : [],
    edges: patch.edges ? [...patch.edges] : [],
    updatedAt: patch.updatedAt,
  }
}

export function cloneProcessFlow(flow: ProcessFlow): ProcessFlow {
  const cloned = JSON.parse(JSON.stringify(flow)) as ProcessFlow
  cloned.edges = (cloned.edges || []).map((edge) => ({
    ...edge,
    sourceHandle: resolveSourceHandle(edge.sourceHandle),
    targetHandle: resolveTargetHandle(edge.targetHandle),
  }))
  return cloned
}
