/** 流程节点类别（组件库分组） */
export type ProcessNodeCategory =
  | 'human'
  | 'event'
  | 'system'
  | 'state'
  | 'decision'
  | 'branch'

/** 流程节点类型 */
export type ProcessNodeType =
  // 人工工作流
  | 'countersign'
  | 'add-sign'
  | 'approver'
  | 'cc'
  | 'handler'
  // 事件驱动流
  | 'start'
  | 'start-message'
  | 'start-timer'
  | 'end-event'
  | 'terminate'
  | 'message-notify'
  // 系统编排流
  | 'service-task'
  | 'subprocess'
  // 状态机流
  | 'state'
  // 决策规则流
  | 'script-task'
  | 'business-rule-task'
  // 分支
  | 'condition-branch'
  | 'parallel-branch'

export type ProcessNodePosition = { x: number; y: number }

/**
 * 人员指派方式（审批人 / 抄送人 / 办理人）
 * - user: 指定成员
 * - initiator: 发起人自己
 * - initiator-select: 发起人自选
 * - role: 角色
 * - direct-supervisor: 直属主管
 * - dept-manager: 部门主管
 * - multi-level-supervisor: 连续多级主管
 * 其余为会签/加签等兼容项
 */
export type ProcessAssigneeType =
  | 'user'
  | 'initiator'
  | 'initiator-select'
  | 'role'
  | 'direct-supervisor'
  | 'dept-manager'
  | 'multi-level-supervisor'
  | 'dept'
  | 'expression'
  | 'initiator-leader'

/** 主管/部门主管等衍生解析配置 */
export type ProcessPersonAssignExtras = {
  /** 发起人自选：可选范围 */
  selectScope?: 'all' | 'same-dept' | 'role' | 'users'
  /** 自选范围值（角色编码 / 指定成员） */
  selectScopeValue?: string
  /** 自选人数下限 */
  selectMin?: number
  /** 自选人数上限，0=不限 */
  selectMax?: number
  /** 主管相对谁解析 */
  relativeTo?: 'initiator' | 'previous' | 'form-field'
  /** relativeTo=form-field 时的表单字段 */
  relativeField?: string
  /** 部门主管：部门来源 */
  deptFrom?: 'initiator' | 'form-field' | 'specified'
  /** 部门来源值（字段名 / 部门 ID） */
  deptFromValue?: string
  /** 部门主管：取哪一层组织 */
  deptLevel?: 'current' | 'parent' | 'grandparent' | 'level-n'
  /** deptLevel=level-n 时的向上层级数 */
  deptLevelN?: number
  /** 是否包含副职/代理人 */
  includeDeputy?: boolean
  /** 连续多级：结束方式 */
  supervisorEnd?: 'levels' | 'top' | 'until-role'
  /** 连续多级：向上级数（end=levels） */
  supervisorLevels?: number
  /** 连续多级：直到某角色（end=until-role） */
  supervisorUntilRole?: string
  /** 连续多级：依次 / 同时 */
  supervisorMode?: 'sequential' | 'parallel'
  /** 跳过与上一审批人相同的人 */
  skipDuplicate?: boolean
  /** 主管即发起人时跳过并继续向上 */
  skipIfInitiator?: boolean
  /** 找不到人时策略 */
  emptyFallback?: 'skip' | 'error' | 'to-user' | 'to-role'
  /** 找不到人时的兜底用户/角色 */
  emptyFallbackValue?: string
}

/** 人工节点通用：可跳过 / 超时 */
export type ProcessHumanCommon = {
  /** 节点说明（给办理人看） */
  description?: string
  /** 启用条件表达式，空=始终启用 */
  enableWhen?: string
  /** 跳过条件表达式 */
  skipWhen?: string
  /** 超时动作 */
  timeoutAction?: 'none' | 'auto-pass' | 'auto-reject' | 'notify' | 'escalate'
  /** 超时后转交人/角色 */
  escalateTo?: string
}

export type ProcessCountersignConfig = ProcessHumanCommon & {
  assigneeType?: ProcessAssigneeType
  assignees?: string
  /** all=全票通过，any=一票通过，percent=按比例，sequential=依次会签 */
  passRule?: 'all' | 'any' | 'percent' | 'sequential'
  passPercent?: number
  formKey?: string
  formName?: string
  dueInHours?: number
  /** 未签人是否可见他人意见 */
  visibleToOthers?: boolean
  requireComment?: boolean
  /** 会签失败走驳回还是结束 */
  onReject?: 'reject' | 'end' | 'to-node'
  rejectTarget?: string
}

export type ProcessAddSignConfig = ProcessHumanCommon & {
  /** before=前加签，after=后加签，parallel=并加签 */
  mode?: 'before' | 'after' | 'parallel'
  assigneeType?: ProcessAssigneeType
  assignee?: string
  reason?: string
  /** 是否必须填写加签意见 */
  requireReason?: boolean
  /** 加签人完成后是否回到原审批人 */
  returnToOrigin?: boolean
  formKey?: string
}

/** 审批人 */
export type ProcessApproverConfig = ProcessHumanCommon &
  ProcessPersonAssignExtras & {
    assigneeType?: ProcessAssigneeType
    approvers?: string
    candidates?: string
    formKey?: string
    formName?: string
    approveLabel?: string
    rejectLabel?: string
    dueInHours?: number
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    /** 允许多级依次审批（按 approvers 顺序） */
    sequential?: boolean
    allowTransfer?: boolean
    requireCommentOnReject?: boolean
    requireCommentOnApprove?: boolean
    /** 驳回策略 */
    rejectStrategy?: 'previous' | 'initiator' | 'to-node' | 'end'
    rejectTarget?: string
    /** 通过后是否自动抄送 */
    ccOnApprove?: string
  }

/** 抄送人 */
export type ProcessCcConfig = ProcessHumanCommon &
  ProcessPersonAssignExtras & {
    assigneeType?: ProcessAssigneeType
    recipients?: string
    waitConfirm?: boolean
    /** 抄送时机：到达本节点 / 上游完成时 */
    timing?: 'on-enter' | 'on-leave'
    title?: string
    content?: string
    channel?: 'inbox' | 'email' | 'sms' | 'all'
    /** 是否可查看完整表单 */
    canViewForm?: boolean
  }

/** 办理人 */
export type ProcessHandlerConfig = ProcessHumanCommon &
  ProcessPersonAssignExtras & {
    assigneeType?: ProcessAssigneeType
    handlers?: string
    candidates?: string
    formKey?: string
    formName?: string
    dueInHours?: number
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    allowTransfer?: boolean
    requireComment?: boolean
    remark?: string
    /** 办理结果枚举，逗号分隔，如 已处理,无法处理 */
    resultOptions?: string
  }

export type ProcessStartConfig = {
  remark?: string
  /** 谁可发起：全部 / 角色 / 表达式 */
  initiatorType?: 'anyone' | 'role' | 'expression'
  initiator?: string
  /** 启动表单 */
  formKey?: string
  formName?: string
  /** 业务单据类型，如 leave / purchase */
  bizType?: string
  /** 启动时写入的流程变量 JSON */
  initVariables?: string
}

export type ProcessStartMessageConfig = {
  messageName?: string
  correlationKey?: string
  /** 消息来源系统 */
  sourceSystem?: string
  /** payload 映射到流程变量 */
  payloadMap?: string
  /** 是否允许重复消息启动多实例 */
  allowDuplicate?: boolean
  remark?: string
}

export type ProcessStartTimerConfig = {
  /** cron / fixed-delay / fixed-rate */
  scheduleType?: 'cron' | 'delay' | 'rate'
  schedule?: string
  timezone?: string
  /** delay/rate 时的间隔（分钟） */
  intervalMinutes?: number
  /** 首次执行时间 ISO */
  startAt?: string
  /** 结束时间 ISO，空=长期 */
  endAt?: string
  /** 错过触发时：忽略 / 立即补跑一次 */
  misfirePolicy?: 'ignore' | 'fire-once'
  remark?: string
}

export type ProcessEndEventConfig = {
  outcome?: string
  terminateAll?: boolean
  /** 结束时回调通知 */
  notifyOnEnd?: boolean
  notifyRecipients?: string
  /** 写回业务状态 */
  bizStatus?: string
  remark?: string
}

export type ProcessTerminateConfig = {
  reason?: string
  outcome?: string
  /** 是否记录审计日志 */
  audit?: boolean
  notifyInitiator?: boolean
  notifyRecipients?: string
  bizStatus?: string
}

export type ProcessMessageNotifyConfig = {
  channel?: 'inbox' | 'email' | 'sms' | 'webhook' | 'custom'
  recipients?: string
  /** 接收人类型 */
  recipientType?: ProcessAssigneeType
  title?: string
  content?: string
  templateId?: string
  templateName?: string
  /** webhook URL（channel=webhook） */
  webhookUrl?: string
  /** 发送失败是否阻断流程 */
  failOnError?: boolean
  /** 发送时机说明 */
  remark?: string
}

export type ProcessServiceTaskConfig = {
  protocol?: 'http' | 'rpc' | 'mq'
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  timeoutMs?: number
  retry?: number
  /** 重试间隔 ms */
  retryIntervalMs?: number
  headers?: string
  bodyTemplate?: string
  /** 响应写入变量名 */
  resultVariable?: string
  /** 成功判定表达式 */
  successWhen?: string
  failAction?: 'error' | 'ignore' | 'compensate'
  authType?: 'none' | 'bearer' | 'basic' | 'api-key'
  authValue?: string
  remark?: string
}

export type ProcessSubprocessConfig = {
  processRef?: string
  processName?: string
  sync?: boolean
  inputMap?: string
  outputMap?: string
  /** 多实例：按集合拆分 */
  multiInstance?: boolean
  collectionVariable?: string
  /** 子流程失败策略 */
  onError?: 'fail' | 'ignore' | 'compensate'
  remark?: string
}

export type ProcessStateConfig = {
  stateKey?: string
  stateLabel?: string
  allowRollbackTo?: string[]
  allowJumpTo?: string[]
  isTerminal?: boolean
  /** 进入该状态时写回业务字段 */
  bizField?: string
  bizValue?: string
  /** 进入/离开时通知 */
  notifyOnEnter?: string
  notifyOnLeave?: string
  color?: string
  remark?: string
}

export type ProcessScriptTaskConfig = {
  language?: 'javascript' | 'groovy' | 'expression'
  script?: string
  /** 结果写入变量 */
  resultVariable?: string
  failOnError?: boolean
  remark?: string
}

export type ProcessRuleCondition = {
  field: string
  op: string
  value: string
}

export type ProcessBusinessRuleTaskConfig = {
  ruleSetId?: string
  ruleSetName?: string
  inputVars?: string
  outputVars?: string
  /** 命中多条时：第一条 / 全部合并 */
  hitPolicy?: 'first' | 'collect'
  failOnMiss?: boolean
  remark?: string
}

/** 条件分支 / 并行分支的单条出口 */
export type ProcessBranchArmBase = {
  id: string
  label: string
}

/** 条件分支出口：可配置多组条件（默认出口为画布固定锚点，不在此配置） */
export type ProcessConditionArm = ProcessBranchArmBase & {
  logic?: 'and' | 'or'
  conditions?: ProcessRuleCondition[]
  expression?: string
  /** @deprecated 默认改为固定锚点 out-b-default */
  isDefault?: boolean
}

export type ProcessConditionBranchConfig = {
  branches?: ProcessConditionArm[]
  remark?: string
  /** @deprecated 默认锚点固定存在 */
  unmatchedPolicy?: 'default' | 'error'
  /** @deprecated 兼容旧二路配置 */
  logic?: 'and' | 'or'
  expression?: string
  conditions?: ProcessRuleCondition[]
  trueLabel?: string
  falseLabel?: string
  defaultPath?: 'false' | 'error'
}

export type ProcessParallelArm = ProcessBranchArmBase

export type ProcessParallelBranchConfig = {
  branches?: ProcessParallelArm[]
  /** 汇聚策略（设计期声明，运行时对接） */
  joinMode?: 'all' | 'any' | 'count'
  joinCount?: number
  remark?: string
  /** @deprecated 兼容旧二路配置 */
  branchLabels?: string[]
}

export type ProcessNodeConfigMap = {
  countersign: ProcessCountersignConfig
  'add-sign': ProcessAddSignConfig
  approver: ProcessApproverConfig
  cc: ProcessCcConfig
  handler: ProcessHandlerConfig
  start: ProcessStartConfig
  'start-message': ProcessStartMessageConfig
  'start-timer': ProcessStartTimerConfig
  'end-event': ProcessEndEventConfig
  terminate: ProcessTerminateConfig
  'message-notify': ProcessMessageNotifyConfig
  'service-task': ProcessServiceTaskConfig
  subprocess: ProcessSubprocessConfig
  state: ProcessStateConfig
  'script-task': ProcessScriptTaskConfig
  'business-rule-task': ProcessBusinessRuleTaskConfig
  'condition-branch': ProcessConditionBranchConfig
  'parallel-branch': ProcessParallelBranchConfig
}

export type ProcessFlowNode<T extends ProcessNodeType = ProcessNodeType> = {
  id: string
  type: T
  name: string
  position: ProcessNodePosition
  config: ProcessNodeConfigMap[T]
}

export type ProcessTransitionKind = 'forward' | 'rollback' | 'jump'

export type ProcessFlowEdge = {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
  transitionKind?: ProcessTransitionKind
  condition?: string
  /** 连线优先级（条件分支多出口时） */
  priority?: number
  remark?: string
}

export type ProcessFlowStatus = 'draft' | 'published'

export type ProcessFlow = {
  version: 1
  id: string
  name: string
  status: ProcessFlowStatus
  nodes: ProcessFlowNode[]
  edges: ProcessFlowEdge[]
  updatedAt?: string
}

export type ProcessPaletteItem = {
  type: ProcessNodeType
  category: ProcessNodeCategory
  label: string
  icon: string
  description?: string
  enabled?: boolean
}

export type ProcessPaletteGroup = {
  category: ProcessNodeCategory
  label: string
  items: ProcessPaletteItem[]
}
