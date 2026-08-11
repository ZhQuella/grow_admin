import type {
  ProcessNodeCategory,
  ProcessNodeType,
  ProcessPaletteGroup,
} from '../types'

export const CATEGORY_META: Record<
  ProcessNodeCategory,
  { label: string; cssVar: string }
> = {
  human: { label: '人工工作流', cssVar: '--process-cat-human' },
  event: { label: '事件驱动流', cssVar: '--process-cat-event' },
  system: { label: '系统编排流', cssVar: '--process-cat-system' },
  state: { label: '状态机流', cssVar: '--process-cat-state' },
  decision: { label: '决策规则流', cssVar: '--process-cat-decision' },
  branch: { label: '分支', cssVar: '--process-cat-branch' },
}

export const NODE_TYPE_META: Record<
  ProcessNodeType,
  {
    label: string
    category: ProcessNodeCategory
    icon: string
    description: string
    inputs: number
    outputs: number
    enabled: boolean
  }
> = {
  countersign: {
    label: '会签',
    category: 'human',
    icon: 'carbon:user-multiple',
    description: '多人会签，按规则通过',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'add-sign': {
    label: '加签',
    category: 'human',
    icon: 'carbon:user-follow',
    description: '流程中动态前/后加签',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  approver: {
    label: '审批人',
    category: 'human',
    icon: 'carbon:user-certification',
    description: '指定审批人进行审批',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  cc: {
    label: '抄送人',
    category: 'human',
    icon: 'carbon:send-alt',
    description: '抄送通知相关人员',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  handler: {
    label: '办理人',
    category: 'human',
    icon: 'carbon:task',
    description: '指定办理人处理事务',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  start: {
    label: '开始',
    category: 'event',
    icon: 'carbon:play-filled',
    description: '流程开始（无入口）',
    inputs: 0,
    outputs: 1,
    enabled: true,
  },
  'start-message': {
    label: '消息开始',
    category: 'event',
    icon: 'carbon:mail-all',
    description: '外部消息触发流程',
    inputs: 0,
    outputs: 1,
    enabled: true,
  },
  'start-timer': {
    label: '定时开始',
    category: 'event',
    icon: 'carbon:timer',
    description: '按 Cron/间隔定时启动',
    inputs: 0,
    outputs: 1,
    enabled: true,
  },
  'end-event': {
    label: '结束',
    category: 'event',
    icon: 'carbon:stop-filled',
    description: '流程正常结束（无出口）',
    inputs: 1,
    outputs: 0,
    enabled: true,
  },
  terminate: {
    label: '终止流程',
    category: 'event',
    icon: 'carbon:close-filled',
    description: '强制终止流程及全部并行分支（无出口）',
    inputs: 1,
    outputs: 0,
    enabled: true,
  },
  'message-notify': {
    label: '消息通知',
    category: 'event',
    icon: 'carbon:notification',
    description: '发送站内信 / 邮件 / 短信等通知',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'service-task': {
    label: '服务任务',
    category: 'system',
    icon: 'carbon:api',
    description: '调用 HTTP/RPC/MQ 等系统接口',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  subprocess: {
    label: '子流程',
    category: 'system',
    icon: 'carbon:flow',
    description: '引用另一流程（可跨系统）',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  state: {
    label: '状态节点',
    category: 'state',
    icon: 'carbon:circle-dash',
    description: '实体状态；支持回退/跳转连线',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'script-task': {
    label: '脚本任务',
    category: 'decision',
    icon: 'carbon:script',
    description: '执行脚本计算逻辑结果',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'business-rule-task': {
    label: '业务规则任务',
    category: 'decision',
    icon: 'carbon:rule',
    description: '执行业务规则集并写回变量',
    inputs: 1,
    outputs: 1,
    enabled: true,
  },
  'condition-branch': {
    label: '条件分支',
    category: 'branch',
    icon: 'carbon:flow',
    description: '按多条件排他分流，可添加多条分支',
    inputs: 1,
    outputs: 10,
    enabled: true,
  },
  'parallel-branch': {
    label: '并行分支',
    category: 'branch',
    icon: 'carbon:fork',
    description: '分叉为多路并行，可添加多条分支',
    inputs: 1,
    outputs: 10,
    enabled: true,
  },
}

const CATEGORY_ORDER: ProcessNodeCategory[] = [
  'human',
  'event',
  'system',
  'state',
  'decision',
  'branch',
]

export const PALETTE_GROUPS: ProcessPaletteGroup[] = CATEGORY_ORDER.map((category) => ({
  category,
  label: CATEGORY_META[category].label,
  items: (Object.keys(NODE_TYPE_META) as ProcessNodeType[])
    .filter((type) => NODE_TYPE_META[type].category === category)
    .map((type) => {
      const meta = NODE_TYPE_META[type]
      return {
        type,
        category: meta.category,
        label: meta.label,
        icon: meta.icon,
        description: meta.description,
        enabled: meta.enabled,
      }
    }),
}))

export const PERSON_ASSIGNEE_TYPE_OPTIONS: Array<{
  label: string
  value: string
  hint?: string
}> = [
  { label: '指定成员', value: 'user' },
  { label: '发起人自己', value: 'initiator' },
  { label: '发起人自选', value: 'initiator-select' },
  {
    label: '角色',
    value: 'role',
    hint: '按系统角色匹配办理人，如财务、人事',
  },
  {
    label: '直属主管',
    value: 'direct-supervisor',
    hint: '取相对人的一级直属汇报上级',
  },
  {
    label: '部门主管',
    value: 'dept-manager',
    hint: '取指定组织层级的部门负责人',
  },
  {
    label: '连续多级主管',
    value: 'multi-level-supervisor',
    hint: '沿汇报链向上连续多级审批',
  },
]

/** @deprecated 兼容旧引用，人员节点请用 PERSON_ASSIGNEE_TYPE_OPTIONS */
export const ASSIGNEE_TYPE_OPTIONS = [
  ...PERSON_ASSIGNEE_TYPE_OPTIONS.map(({ label, value }) => ({ label, value })),
  { label: '部门', value: 'dept' },
  { label: '表达式', value: 'expression' },
]

export const SELECT_SCOPE_OPTIONS = [
  { label: '全员', value: 'all' },
  { label: '同部门', value: 'same-dept' },
  { label: '指定角色', value: 'role' },
  { label: '指定成员', value: 'users' },
]

export const RELATIVE_TO_OPTIONS = [
  { label: '发起人', value: 'initiator' },
  { label: '上一办理人', value: 'previous' },
  { label: '表单字段', value: 'form-field' },
]

export const DEPT_FROM_OPTIONS = [
  { label: '发起人部门', value: 'initiator' },
  { label: '表单字段', value: 'form-field' },
  { label: '指定部门', value: 'specified' },
]

export const DEPT_LEVEL_OPTIONS = [
  { label: '本级部门', value: 'current' },
  { label: '上一级', value: 'parent' },
  { label: '上两级', value: 'grandparent' },
  { label: '指定层数', value: 'level-n' },
]

export const SUPERVISOR_END_OPTIONS = [
  { label: '固定级数', value: 'levels' },
  { label: '直到最高主管', value: 'top' },
  { label: '直到指定角色', value: 'until-role' },
]

export const SUPERVISOR_MODE_OPTIONS = [
  { label: '逐级依次', value: 'sequential' },
  { label: '同时并行', value: 'parallel' },
]

export const EMPTY_FALLBACK_OPTIONS = [
  { label: '跳过本节点', value: 'skip' },
  { label: '报错中断', value: 'error' },
  { label: '指定成员', value: 'to-user' },
  { label: '指定角色', value: 'to-role' },
]

export const COUNTERSIGN_PASS_OPTIONS = [
  { label: '全部通过', value: 'all' },
  { label: '一人通过', value: 'any' },
  { label: '按比例', value: 'percent' },
  { label: '依次会签', value: 'sequential' },
]

export const ADD_SIGN_MODE_OPTIONS = [
  { label: '前加签', value: 'before' },
  { label: '后加签', value: 'after' },
  { label: '并加签', value: 'parallel' },
]

export const PRIORITY_OPTIONS = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]

export const TIMEOUT_ACTION_OPTIONS = [
  { label: '无动作', value: 'none' },
  { label: '自动通过', value: 'auto-pass' },
  { label: '自动驳回', value: 'auto-reject' },
  { label: '仅通知', value: 'notify' },
  { label: '升级转交', value: 'escalate' },
]

export const REJECT_STRATEGY_OPTIONS = [
  { label: '上一节点', value: 'previous' },
  { label: '发起人', value: 'initiator' },
  { label: '指定节点', value: 'to-node' },
  { label: '结束流程', value: 'end' },
]

export const SERVICE_PROTOCOL_OPTIONS = [
  { label: 'HTTP', value: 'http' },
  { label: 'RPC', value: 'rpc' },
  { label: '消息队列', value: 'mq' },
]

export const HTTP_METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

export const AUTH_TYPE_OPTIONS = [
  { label: '无', value: 'none' },
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'Basic', value: 'basic' },
  { label: 'API Key', value: 'api-key' },
]

export const SCRIPT_LANG_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Groovy', value: 'groovy' },
  { label: '表达式', value: 'expression' },
]

export const TRANSITION_KIND_OPTIONS = [
  { label: '正向流转', value: 'forward' },
  { label: '回退', value: 'rollback' },
  { label: '跳转', value: 'jump' },
]

export const FILTER_LOGIC_OPTIONS = [
  { label: '且 (AND)', value: 'and' },
  { label: '或 (OR)', value: 'or' },
]

export const RULE_OP_OPTIONS = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
  { label: '包含', value: 'contains' },
  { label: '为空', value: 'empty' },
  { label: '不为空', value: 'not-empty' },
]

export const NOTIFY_CHANNEL_OPTIONS = [
  { label: '站内信', value: 'inbox' },
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: 'Webhook', value: 'webhook' },
  { label: '全部渠道', value: 'all' },
  { label: '自定义', value: 'custom' },
]

export const SCHEDULE_TYPE_OPTIONS = [
  { label: 'Cron', value: 'cron' },
  { label: '固定延迟', value: 'delay' },
  { label: '固定频率', value: 'rate' },
]

export const JOIN_MODE_OPTIONS = [
  { label: '全部完成', value: 'all' },
  { label: '任一完成', value: 'any' },
  { label: '达到数量', value: 'count' },
]

export const HIT_POLICY_OPTIONS = [
  { label: '取第一条', value: 'first' },
  { label: '全部收集', value: 'collect' },
]

