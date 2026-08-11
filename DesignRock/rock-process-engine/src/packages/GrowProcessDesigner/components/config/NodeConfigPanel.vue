<template>
  <div class="box-border flex h-full min-h-0 flex-col">
    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <template v-if="node">
          <!-- 公共头部 -->
          <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
            <GrowFormItem label="名称">
              <GrowInput
                :model-value="node.name"
                size="small"
                placeholder="节点名称"
                @update:model-value="(v) => patchNode({ name: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="类型">
              <GrowInput :model-value="typeLabel" size="small" disabled />
            </GrowFormItem>
          </GrowForm>

          <!-- 会签 -->
          <template v-if="node.type === 'countersign'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="说明">
                <GrowInput
                  :model-value="countersign.description || ''"
                  type="textarea"
                  size="small"
                  :rows="2"
                  @update:model-value="(v) => patchConfig({ description: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="指派类型">
                <GrowSelect
                  :model-value="countersign.assigneeType || 'user'"
                  :options="ASSIGNEE_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ assigneeType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="参与人">
                <GrowInput
                  :model-value="countersign.assignees || ''"
                  size="small"
                  placeholder="多人逗号分隔"
                  @update:model-value="(v) => patchConfig({ assignees: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="通过规则">
                <GrowSelect
                  :model-value="countersign.passRule || 'all'"
                  :options="COUNTERSIGN_PASS_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ passRule: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="countersign.passRule === 'percent'" label="通过比例%">
                <GrowInput
                  :model-value="String(countersign.passPercent ?? 100)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ passPercent: Number(v) || 100 })"
                />
              </GrowFormItem>
              <GrowFormItem label="可见他人">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!countersign.visibleToOthers"
                    @update:model-value="(v) => patchConfig({ visibleToOthers: !!v })"
                  />
                  未签人可见他人意见
                </label>
              </GrowFormItem>
              <GrowFormItem label="必填意见">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!countersign.requireComment"
                    @update:model-value="(v) => patchConfig({ requireComment: !!v })"
                  />
                  会签时必须填写意见
                </label>
              </GrowFormItem>
              <GrowFormItem label="驳回策略">
                <GrowSelect
                  :model-value="countersign.onReject || 'reject'"
                  :options="COUNTERSIGN_REJECT_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ onReject: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="countersign.onReject === 'to-node'" label="驳回目标">
                <GrowInput
                  :model-value="countersign.rejectTarget || ''"
                  size="small"
                  placeholder="节点 ID"
                  @update:model-value="(v) => patchConfig({ rejectTarget: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">表单</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="表单 Key">
                <GrowInput
                  :model-value="countersign.formKey || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="表单名称">
                <GrowInput
                  :model-value="countersign.formName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formName: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="时限(时)">
                <GrowInput
                  :model-value="countersign.dueInHours == null ? '' : String(countersign.dueInHours)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ dueInHours: Number(v) || undefined })"
                />
              </GrowFormItem>
              <GrowFormItem label="超时动作">
                <GrowSelect
                  :model-value="countersign.timeoutAction || 'none'"
                  :options="TIMEOUT_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timeoutAction: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="countersign.timeoutAction === 'escalate'" label="转交对象">
                <GrowInput
                  :model-value="countersign.escalateTo || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ escalateTo: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="启用条件">
                <GrowInput
                  :model-value="countersign.enableWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ enableWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="跳过条件">
                <GrowInput
                  :model-value="countersign.skipWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ skipWhen: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 加签 -->
          <template v-else-if="node.type === 'add-sign'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="说明">
                <GrowInput
                  :model-value="addSign.description || ''"
                  type="textarea"
                  size="small"
                  :rows="2"
                  @update:model-value="(v) => patchConfig({ description: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="加签方式">
                <GrowSelect
                  :model-value="addSign.mode || 'after'"
                  :options="ADD_SIGN_MODE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ mode: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="指派类型">
                <GrowSelect
                  :model-value="addSign.assigneeType || 'user'"
                  :options="ASSIGNEE_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ assigneeType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="加签人">
                <GrowInput
                  :model-value="addSign.assignee || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ assignee: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="加签原因">
                <GrowInput
                  :model-value="addSign.reason || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ reason: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="必填原因">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!addSign.requireReason"
                    @update:model-value="(v) => patchConfig({ requireReason: !!v })"
                  />
                  加签时必须填写原因
                </label>
              </GrowFormItem>
              <GrowFormItem label="回到原审批">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="addSign.returnToOrigin !== false"
                    @update:model-value="(v) => patchConfig({ returnToOrigin: !!v })"
                  />
                  加签完成后回到原审批人
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">表单</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="表单 Key">
                <GrowInput
                  :model-value="addSign.formKey || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formKey: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="超时动作">
                <GrowSelect
                  :model-value="addSign.timeoutAction || 'none'"
                  :options="TIMEOUT_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timeoutAction: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="addSign.timeoutAction === 'escalate'" label="转交对象">
                <GrowInput
                  :model-value="addSign.escalateTo || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ escalateTo: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="启用条件">
                <GrowInput
                  :model-value="addSign.enableWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ enableWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="跳过条件">
                <GrowInput
                  :model-value="addSign.skipWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ skipWhen: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 审批人 -->
          <template v-else-if="node.type === 'approver'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="说明">
                <GrowInput
                  :model-value="approver.description || ''"
                  type="textarea"
                  size="small"
                  :rows="2"
                  @update:model-value="(v) => patchConfig({ description: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3">
              <PersonAssigneeFields
                :assignee-type="approver.assigneeType"
                :value="approver.approvers"
                :candidates="approver.candidates"
                value-label="审批人"
                value-key="approvers"
                show-candidates
                :extras="approver"
                @change="patchConfig"
              />
            </div>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="通过文案">
                <GrowInput
                  :model-value="approver.approveLabel || '通过'"
                  size="small"
                  @update:model-value="(v) => patchConfig({ approveLabel: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="驳回文案">
                <GrowInput
                  :model-value="approver.rejectLabel || '驳回'"
                  size="small"
                  @update:model-value="(v) => patchConfig({ rejectLabel: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="依次审批">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!approver.sequential"
                    @update:model-value="(v) => patchConfig({ sequential: !!v })"
                  />
                  按审批人顺序依次审批
                </label>
              </GrowFormItem>
              <GrowFormItem label="允许转办">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!approver.allowTransfer"
                    @update:model-value="(v) => patchConfig({ allowTransfer: !!v })"
                  />
                  审批人可转交他人
                </label>
              </GrowFormItem>
              <GrowFormItem label="驳回必填">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!approver.requireCommentOnReject"
                    @update:model-value="(v) => patchConfig({ requireCommentOnReject: !!v })"
                  />
                  驳回时必须填写意见
                </label>
              </GrowFormItem>
              <GrowFormItem label="通过必填">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!approver.requireCommentOnApprove"
                    @update:model-value="(v) => patchConfig({ requireCommentOnApprove: !!v })"
                  />
                  通过时必须填写意见
                </label>
              </GrowFormItem>
              <GrowFormItem label="驳回策略">
                <GrowSelect
                  :model-value="approver.rejectStrategy || 'previous'"
                  :options="REJECT_STRATEGY_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ rejectStrategy: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="approver.rejectStrategy === 'to-node'" label="驳回目标">
                <GrowInput
                  :model-value="approver.rejectTarget || ''"
                  size="small"
                  placeholder="节点 ID"
                  @update:model-value="(v) => patchConfig({ rejectTarget: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="通过抄送">
                <GrowInput
                  :model-value="approver.ccOnApprove || ''"
                  size="small"
                  placeholder="通过后自动抄送人"
                  @update:model-value="(v) => patchConfig({ ccOnApprove: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">表单</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="表单 Key">
                <GrowInput
                  :model-value="approver.formKey || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="表单名称">
                <GrowInput
                  :model-value="approver.formName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formName: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="优先级">
                <GrowSelect
                  :model-value="approver.priority || 'normal'"
                  :options="PRIORITY_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ priority: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="时限(时)">
                <GrowInput
                  :model-value="approver.dueInHours == null ? '' : String(approver.dueInHours)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ dueInHours: Number(v) || undefined })"
                />
              </GrowFormItem>
              <GrowFormItem label="超时动作">
                <GrowSelect
                  :model-value="approver.timeoutAction || 'none'"
                  :options="TIMEOUT_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timeoutAction: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="approver.timeoutAction === 'escalate'" label="转交对象">
                <GrowInput
                  :model-value="approver.escalateTo || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ escalateTo: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="启用条件">
                <GrowInput
                  :model-value="approver.enableWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ enableWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="跳过条件">
                <GrowInput
                  :model-value="approver.skipWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ skipWhen: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 抄送人 -->
          <template v-else-if="node.type === 'cc'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="说明">
                <GrowInput
                  :model-value="ccCfg.description || ''"
                  type="textarea"
                  size="small"
                  :rows="2"
                  @update:model-value="(v) => patchConfig({ description: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3">
              <PersonAssigneeFields
                :assignee-type="ccCfg.assigneeType"
                :value="ccCfg.recipients"
                value-label="抄送人"
                value-key="recipients"
                :extras="ccCfg"
                @change="patchConfig"
              />
            </div>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="抄送时机">
                <GrowSelect
                  :model-value="ccCfg.timing || 'on-enter'"
                  :options="CC_TIMING_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timing: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="等待确认">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!ccCfg.waitConfirm"
                    @update:model-value="(v) => patchConfig({ waitConfirm: !!v })"
                  />
                  抄送人确认后再继续
                </label>
              </GrowFormItem>
              <GrowFormItem label="可查看表单">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!ccCfg.canViewForm"
                    @update:model-value="(v) => patchConfig({ canViewForm: !!v })"
                  />
                  抄送人可查看完整表单
                </label>
              </GrowFormItem>
              <GrowFormItem label="通知渠道">
                <GrowSelect
                  :model-value="ccCfg.channel || 'inbox'"
                  :options="CC_CHANNEL_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ channel: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="标题">
                <GrowInput
                  :model-value="ccCfg.title || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ title: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="内容">
                <GrowInput
                  :model-value="ccCfg.content || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  @update:model-value="(v) => patchConfig({ content: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="超时动作">
                <GrowSelect
                  :model-value="ccCfg.timeoutAction || 'none'"
                  :options="TIMEOUT_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timeoutAction: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="ccCfg.timeoutAction === 'escalate'" label="转交对象">
                <GrowInput
                  :model-value="ccCfg.escalateTo || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ escalateTo: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="启用条件">
                <GrowInput
                  :model-value="ccCfg.enableWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ enableWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="跳过条件">
                <GrowInput
                  :model-value="ccCfg.skipWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ skipWhen: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 办理人 -->
          <template v-else-if="node.type === 'handler'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="说明">
                <GrowInput
                  :model-value="handler.description || ''"
                  type="textarea"
                  size="small"
                  :rows="2"
                  @update:model-value="(v) => patchConfig({ description: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3">
              <PersonAssigneeFields
                :assignee-type="handler.assigneeType"
                :value="handler.handlers"
                :candidates="handler.candidates"
                value-label="办理人"
                value-key="handlers"
                show-candidates
                :extras="handler"
                @change="patchConfig"
              />
            </div>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="允许转办">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!handler.allowTransfer"
                    @update:model-value="(v) => patchConfig({ allowTransfer: !!v })"
                  />
                  办理人可转交他人
                </label>
              </GrowFormItem>
              <GrowFormItem label="必填意见">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!handler.requireComment"
                    @update:model-value="(v) => patchConfig({ requireComment: !!v })"
                  />
                  办理时必须填写意见
                </label>
              </GrowFormItem>
              <GrowFormItem label="结果选项">
                <GrowInput
                  :model-value="handler.resultOptions || ''"
                  size="small"
                  placeholder="已处理,无法处理"
                  @update:model-value="(v) => patchConfig({ resultOptions: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="handler.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">表单</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="表单 Key">
                <GrowInput
                  :model-value="handler.formKey || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="表单名称">
                <GrowInput
                  :model-value="handler.formName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formName: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="优先级">
                <GrowSelect
                  :model-value="handler.priority || 'normal'"
                  :options="PRIORITY_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ priority: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="时限(时)">
                <GrowInput
                  :model-value="handler.dueInHours == null ? '' : String(handler.dueInHours)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ dueInHours: Number(v) || undefined })"
                />
              </GrowFormItem>
              <GrowFormItem label="超时动作">
                <GrowSelect
                  :model-value="handler.timeoutAction || 'none'"
                  :options="TIMEOUT_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ timeoutAction: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="handler.timeoutAction === 'escalate'" label="转交对象">
                <GrowInput
                  :model-value="handler.escalateTo || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ escalateTo: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="启用条件">
                <GrowInput
                  :model-value="handler.enableWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ enableWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="跳过条件">
                <GrowInput
                  :model-value="handler.skipWhen || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ skipWhen: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 开始 -->
          <template v-else-if="node.type === 'start'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="发起人">
                <GrowSelect
                  :model-value="startCfg.initiatorType || 'anyone'"
                  :options="INITIATOR_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ initiatorType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="startCfg.initiatorType && startCfg.initiatorType !== 'anyone'" label="发起范围">
                <GrowInput
                  :model-value="startCfg.initiator || ''"
                  size="small"
                  placeholder="角色 / 表达式"
                  @update:model-value="(v) => patchConfig({ initiator: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="业务类型">
                <GrowInput
                  :model-value="startCfg.bizType || ''"
                  size="small"
                  placeholder="如 leave / purchase"
                  @update:model-value="(v) => patchConfig({ bizType: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">表单</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="表单 Key">
                <GrowInput
                  :model-value="startCfg.formKey || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="表单名称">
                <GrowInput
                  :model-value="startCfg.formName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ formName: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="初始变量">
                <GrowInput
                  :model-value="startCfg.initVariables || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  placeholder='JSON，如 {"dept":"sales"}'
                  @update:model-value="(v) => patchConfig({ initVariables: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="startCfg.remark || ''"
                  size="small"
                  placeholder="启动说明"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 消息开始 -->
          <template v-else-if="node.type === 'start-message'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="消息名">
                <GrowInput
                  :model-value="startMessage.messageName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ messageName: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="关联键">
                <GrowInput
                  :model-value="startMessage.correlationKey || ''"
                  size="small"
                  placeholder="correlation key"
                  @update:model-value="(v) => patchConfig({ correlationKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="来源系统">
                <GrowInput
                  :model-value="startMessage.sourceSystem || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ sourceSystem: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="变量映射">
                <GrowInput
                  :model-value="startMessage.payloadMap || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  placeholder="payload 映射到流程变量"
                  @update:model-value="(v) => patchConfig({ payloadMap: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="允许重复">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!startMessage.allowDuplicate"
                    @update:model-value="(v) => patchConfig({ allowDuplicate: !!v })"
                  />
                  允许重复消息启动多实例
                </label>
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="startMessage.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 定时开始 -->
          <template v-else-if="node.type === 'start-timer'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="计划类型">
                <GrowSelect
                  :model-value="startTimer.scheduleType || 'cron'"
                  :options="SCHEDULE_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ scheduleType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="计划">
                <GrowInput
                  :model-value="startTimer.schedule || ''"
                  size="small"
                  :placeholder="startTimer.scheduleType === 'cron' ? 'Cron，如 0 0 * * *' : '间隔表达式'"
                  @update:model-value="(v) => patchConfig({ schedule: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="startTimer.scheduleType !== 'cron'" label="间隔(分)">
                <GrowInput
                  :model-value="startTimer.intervalMinutes == null ? '' : String(startTimer.intervalMinutes)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ intervalMinutes: Number(v) || undefined })"
                />
              </GrowFormItem>
              <GrowFormItem label="时区">
                <GrowInput
                  :model-value="startTimer.timezone || ''"
                  size="small"
                  placeholder="Asia/Shanghai"
                  @update:model-value="(v) => patchConfig({ timezone: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="首次执行">
                <GrowInput
                  :model-value="startTimer.startAt || ''"
                  size="small"
                  placeholder="ISO 时间"
                  @update:model-value="(v) => patchConfig({ startAt: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="结束时间">
                <GrowInput
                  :model-value="startTimer.endAt || ''"
                  size="small"
                  placeholder="空=长期"
                  @update:model-value="(v) => patchConfig({ endAt: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="错过策略">
                <GrowSelect
                  :model-value="startTimer.misfirePolicy || 'ignore'"
                  :options="MISFIRE_POLICY_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ misfirePolicy: String(v) })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="startTimer.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 结束 -->
          <template v-else-if="node.type === 'end-event'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="结果">
                <GrowInput
                  :model-value="endEvent.outcome || ''"
                  size="small"
                  placeholder="completed / cancelled"
                  @update:model-value="(v) => patchConfig({ outcome: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="业务状态">
                <GrowInput
                  :model-value="endEvent.bizStatus || ''"
                  size="small"
                  placeholder="写回业务单据状态"
                  @update:model-value="(v) => patchConfig({ bizStatus: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="终止全部">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!endEvent.terminateAll"
                    @update:model-value="(v) => patchConfig({ terminateAll: !!v })"
                  />
                  结束时终止其它并行分支
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="结束通知">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!endEvent.notifyOnEnd"
                    @update:model-value="(v) => patchConfig({ notifyOnEnd: !!v })"
                  />
                  流程结束时发送通知
                </label>
              </GrowFormItem>
              <GrowFormItem v-if="endEvent.notifyOnEnd" label="通知对象">
                <GrowInput
                  :model-value="endEvent.notifyRecipients || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ notifyRecipients: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="endEvent.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 终止流程 -->
          <template v-else-if="node.type === 'terminate'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="结果">
                <GrowInput
                  :model-value="terminateCfg.outcome || 'terminated'"
                  size="small"
                  @update:model-value="(v) => patchConfig({ outcome: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="原因">
                <GrowInput
                  :model-value="terminateCfg.reason || ''"
                  size="small"
                  placeholder="终止原因"
                  @update:model-value="(v) => patchConfig({ reason: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="业务状态">
                <GrowInput
                  :model-value="terminateCfg.bizStatus || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ bizStatus: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="审计日志">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="terminateCfg.audit !== false"
                    @update:model-value="(v) => patchConfig({ audit: !!v })"
                  />
                  记录终止审计日志
                </label>
              </GrowFormItem>
              <GrowFormItem label="通知发起人">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!terminateCfg.notifyInitiator"
                    @update:model-value="(v) => patchConfig({ notifyInitiator: !!v })"
                  />
                  终止时通知流程发起人
                </label>
              </GrowFormItem>
              <GrowFormItem label="通知对象">
                <GrowInput
                  :model-value="terminateCfg.notifyRecipients || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ notifyRecipients: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 消息通知 -->
          <template v-else-if="node.type === 'message-notify'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="渠道">
                <GrowSelect
                  :model-value="messageNotify.channel || 'inbox'"
                  :options="NOTIFY_CHANNEL_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ channel: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="接收类型">
                <GrowSelect
                  :model-value="messageNotify.recipientType || 'user'"
                  :options="ASSIGNEE_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ recipientType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="接收人">
                <GrowInput
                  :model-value="messageNotify.recipients || ''"
                  size="small"
                  placeholder="用户 / 角色，多人逗号分隔"
                  @update:model-value="(v) => patchConfig({ recipients: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="messageNotify.channel === 'webhook'" label="Webhook">
                <GrowInput
                  :model-value="messageNotify.webhookUrl || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ webhookUrl: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="标题">
                <GrowInput
                  :model-value="messageNotify.title || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ title: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="内容">
                <GrowInput
                  :model-value="messageNotify.content || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  placeholder="通知正文，可含变量占位"
                  @update:model-value="(v) => patchConfig({ content: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="模板 ID">
                <GrowInput
                  :model-value="messageNotify.templateId || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ templateId: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="模板名称">
                <GrowInput
                  :model-value="messageNotify.templateName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ templateName: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="失败阻断">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!messageNotify.failOnError"
                    @update:model-value="(v) => patchConfig({ failOnError: !!v })"
                  />
                  发送失败时阻断流程
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="messageNotify.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 服务任务 -->
          <template v-else-if="node.type === 'service-task'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="协议">
                <GrowSelect
                  :model-value="serviceTask.protocol || 'http'"
                  :options="SERVICE_PROTOCOL_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ protocol: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="端点">
                <GrowInput
                  :model-value="serviceTask.endpoint || ''"
                  size="small"
                  placeholder="URL / topic / method"
                  @update:model-value="(v) => patchConfig({ endpoint: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="(serviceTask.protocol || 'http') === 'http'" label="方法">
                <GrowSelect
                  :model-value="serviceTask.method || 'POST'"
                  :options="HTTP_METHOD_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ method: String(v) })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="请求体">
                <GrowInput
                  :model-value="serviceTask.bodyTemplate || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  placeholder="请求体模板"
                  @update:model-value="(v) => patchConfig({ bodyTemplate: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="请求头">
                <GrowInput
                  :model-value="serviceTask.headers || ''"
                  type="textarea"
                  size="small"
                  :rows="3"
                  placeholder="JSON 请求头"
                  @update:model-value="(v) => patchConfig({ headers: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="结果变量">
                <GrowInput
                  :model-value="serviceTask.resultVariable || ''"
                  size="small"
                  placeholder="响应写入变量名"
                  @update:model-value="(v) => patchConfig({ resultVariable: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="成功条件">
                <GrowInput
                  :model-value="serviceTask.successWhen || ''"
                  size="small"
                  placeholder="成功判定表达式"
                  @update:model-value="(v) => patchConfig({ successWhen: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="失败策略">
                <GrowSelect
                  :model-value="serviceTask.failAction || 'error'"
                  :options="FAIL_ACTION_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ failAction: String(v) })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">时限</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="超时(ms)">
                <GrowInput
                  :model-value="String(serviceTask.timeoutMs ?? 30000)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ timeoutMs: Number(v) || 30000 })"
                />
              </GrowFormItem>
              <GrowFormItem label="重试次数">
                <GrowInput
                  :model-value="String(serviceTask.retry ?? 0)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ retry: Number(v) || 0 })"
                />
              </GrowFormItem>
              <GrowFormItem label="重试间隔">
                <GrowInput
                  :model-value="String(serviceTask.retryIntervalMs ?? 1000)"
                  size="small"
                  placeholder="毫秒"
                  @update:model-value="(v) => patchConfig({ retryIntervalMs: Number(v) || 1000 })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="认证方式">
                <GrowSelect
                  :model-value="serviceTask.authType || 'none'"
                  :options="AUTH_TYPE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ authType: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="serviceTask.authType && serviceTask.authType !== 'none'" label="认证值">
                <GrowInput
                  :model-value="serviceTask.authValue || ''"
                  size="small"
                  placeholder="Token / 密钥"
                  @update:model-value="(v) => patchConfig({ authValue: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="serviceTask.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 子流程 -->
          <template v-else-if="node.type === 'subprocess'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="流程 ID">
                <GrowInput
                  :model-value="subprocess.processRef || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ processRef: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="流程名">
                <GrowInput
                  :model-value="subprocess.processName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ processName: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="同步等待">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="subprocess.sync !== false"
                    @update:model-value="(v) => patchConfig({ sync: !!v })"
                  />
                  等待子流程完成
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="入参映射">
                <GrowInput
                  :model-value="subprocess.inputMap || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  placeholder="JSON / 表达式"
                  @update:model-value="(v) => patchConfig({ inputMap: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="出参映射">
                <GrowInput
                  :model-value="subprocess.outputMap || ''"
                  type="textarea"
                  size="small"
                  :rows="4"
                  @update:model-value="(v) => patchConfig({ outputMap: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="多实例">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!subprocess.multiInstance"
                    @update:model-value="(v) => patchConfig({ multiInstance: !!v })"
                  />
                  按集合变量拆分多实例
                </label>
              </GrowFormItem>
              <GrowFormItem v-if="subprocess.multiInstance" label="集合变量">
                <GrowInput
                  :model-value="subprocess.collectionVariable || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ collectionVariable: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="失败策略">
                <GrowSelect
                  :model-value="subprocess.onError || 'fail'"
                  :options="SUBPROCESS_ERROR_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ onError: String(v) })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="subprocess.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 状态节点 -->
          <template v-else-if="node.type === 'state'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="状态键">
                <GrowInput
                  :model-value="stateCfg.stateKey || ''"
                  size="small"
                  placeholder="如 pending / approved"
                  @update:model-value="(v) => patchConfig({ stateKey: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="显示名">
                <GrowInput
                  :model-value="stateCfg.stateLabel || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ stateLabel: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="颜色">
                <GrowInput
                  :model-value="stateCfg.color || ''"
                  size="small"
                  placeholder="#hex 或 CSS 变量"
                  @update:model-value="(v) => patchConfig({ color: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="终态">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!stateCfg.isTerminal"
                    @update:model-value="(v) => patchConfig({ isTerminal: !!v })"
                  />
                  标记为终态
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="可回退到">
                <GrowInput
                  :model-value="(stateCfg.allowRollbackTo || []).join(',')"
                  size="small"
                  placeholder="状态键，逗号分隔"
                  @update:model-value="(v) => patchConfig({ allowRollbackTo: parseList(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="可跳转到">
                <GrowInput
                  :model-value="(stateCfg.allowJumpTo || []).join(',')"
                  size="small"
                  placeholder="状态键，逗号分隔"
                  @update:model-value="(v) => patchConfig({ allowJumpTo: parseList(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="业务字段">
                <GrowInput
                  :model-value="stateCfg.bizField || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ bizField: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="业务值">
                <GrowInput
                  :model-value="stateCfg.bizValue || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ bizValue: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="进入通知">
                <GrowInput
                  :model-value="stateCfg.notifyOnEnter || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ notifyOnEnter: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="离开通知">
                <GrowInput
                  :model-value="stateCfg.notifyOnLeave || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ notifyOnLeave: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="stateCfg.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 脚本任务 -->
          <template v-else-if="node.type === 'script-task'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="语言">
                <GrowSelect
                  :model-value="scriptTask.language || 'javascript'"
                  :options="SCRIPT_LANG_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ language: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="脚本">
                <GrowInput
                  :model-value="scriptTask.script || ''"
                  type="textarea"
                  size="small"
                  :rows="6"
                  placeholder="// 设计期占位，运行时执行"
                  @update:model-value="(v) => patchConfig({ script: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="结果变量">
                <GrowInput
                  :model-value="scriptTask.resultVariable || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ resultVariable: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="失败阻断">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="scriptTask.failOnError !== false"
                    @update:model-value="(v) => patchConfig({ failOnError: !!v })"
                  />
                  脚本异常时阻断流程
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="scriptTask.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 条件分支（多路 + 固定默认锚点） -->
          <template v-else-if="node.type === 'condition-branch'">
            <div class="mt-3 mb-2 flex items-center justify-between">
              <span class="text-xs font-medium text-text">条件出口</span>
              <GrowButton
                size="small"
                :disabled="conditionArms.length >= MAX_CONDITION_ARM_COUNT"
                @click="addConditionArm"
              >
                <GrowIconify icon="carbon:add" :size="14" />
                添加条件
              </GrowButton>
            </div>
            <p class="m-0 mb-2 text-[11px] text-text-secondary">
              画布底部另有固定「默认」锚点，条件都不满足时走该出口。
            </p>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="(arm, armIndex) in conditionArms"
                :key="arm.id"
                class="rounded border border-solid border-border px-2.5 py-2"
              >
                <div class="mb-1.5 flex items-center justify-between gap-2">
                  <span class="text-[11px] font-medium text-text">条件 {{ armIndex + 1 }}</span>
                  <GrowButton
                    text
                    size="small"
                    type="danger"
                    :disabled="conditionArms.length <= MIN_CONDITION_ARM_COUNT"
                    @click="removeConditionArm(armIndex)"
                  >
                    删除
                  </GrowButton>
                </div>
                <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
                  <GrowFormItem label="名称">
                    <GrowInput
                      :model-value="arm.label"
                      size="small"
                      placeholder="出口名称"
                      @update:model-value="(v) => updateConditionArm(armIndex, { label: String(v ?? '') })"
                    />
                  </GrowFormItem>
                  <GrowFormItem v-if="(arm.conditions?.length || 0) > 1" label="组合">
                    <GrowSelect
                      :model-value="arm.logic || 'and'"
                      :options="FILTER_LOGIC_OPTIONS"
                      size="small"
                      class="w-full"
                      @update:model-value="(v) => setArmLogic(armIndex, v)"
                    />
                  </GrowFormItem>
                </GrowForm>

                <div class="mt-2 mb-1.5 flex items-center justify-between">
                  <span class="text-[11px] text-text-secondary">规则</span>
                  <GrowButton size="small" @click="addArmCondition(armIndex)">
                    <GrowIconify icon="carbon:add" :size="12" />
                    添加规则
                  </GrowButton>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div
                    v-for="(cond, condIndex) in arm.conditions || []"
                    :key="`${arm.id}-c-${condIndex}`"
                    class="rounded bg-layout/40 px-2 py-1.5"
                  >
                    <div class="mb-1 flex items-center justify-between">
                      <span class="text-[10px] text-text-secondary">#{{ condIndex + 1 }}</span>
                      <GrowButton
                        text
                        size="small"
                        type="danger"
                        :disabled="(arm.conditions?.length || 0) <= 1"
                        @click="removeArmCondition(armIndex, condIndex)"
                      >
                        删
                      </GrowButton>
                    </div>
                    <GrowForm label-width="40px" label-position="left" size="small" :show-message="false">
                      <GrowFormItem label="字段">
                        <GrowInput
                          :model-value="cond.field"
                          size="small"
                          @update:model-value="(v) => updateArmCondition(armIndex, condIndex, { field: String(v ?? '') })"
                        />
                      </GrowFormItem>
                      <GrowFormItem label="运算">
                        <GrowSelect
                          :model-value="cond.op || 'eq'"
                          :options="RULE_OP_OPTIONS"
                          size="small"
                          class="w-full"
                          @update:model-value="(v) => updateArmCondition(armIndex, condIndex, { op: String(v ?? 'eq') })"
                        />
                      </GrowFormItem>
                      <GrowFormItem
                        v-if="cond.op !== 'empty' && cond.op !== 'not-empty'"
                        label="值"
                      >
                        <GrowInput
                          :model-value="cond.value"
                          size="small"
                          @update:model-value="(v) => updateArmCondition(armIndex, condIndex, { value: String(v ?? '') })"
                        />
                      </GrowFormItem>
                    </GrowForm>
                  </div>
                </div>
                <GrowForm
                  class="mt-1.5"
                  label-width="72px"
                  label-position="left"
                  size="small"
                  :show-message="false"
                >
                  <GrowFormItem label="表达式">
                    <GrowInput
                      :model-value="arm.expression || ''"
                      size="small"
                      placeholder="可选，与条件并用"
                      @update:model-value="(v) => updateConditionArm(armIndex, { expression: String(v ?? '') })"
                    />
                  </GrowFormItem>
                </GrowForm>
              </div>
            </div>

            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="conditionBranch.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 并行分支（多路） -->
          <template v-else-if="node.type === 'parallel-branch'">
            <div class="mt-3 mb-2 flex items-center justify-between">
              <span class="text-xs font-medium text-text">并行出口</span>
              <GrowButton
                size="small"
                :disabled="parallelArms.length >= MAX_BRANCH_COUNT"
                @click="addParallelArm"
              >
                <GrowIconify icon="carbon:add" :size="14" />
                添加分支
              </GrowButton>
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="(arm, armIndex) in parallelArms"
                :key="arm.id"
                class="rounded border border-solid border-border px-2.5 py-2"
              >
                <div class="mb-1.5 flex items-center justify-between gap-2">
                  <span class="text-[11px] text-text-secondary">出口 {{ armIndex + 1 }}</span>
                  <GrowButton
                    text
                    size="small"
                    type="danger"
                    :disabled="parallelArms.length <= MIN_BRANCH_COUNT"
                    @click="removeParallelArm(armIndex)"
                  >
                    删除
                  </GrowButton>
                </div>
                <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
                  <GrowFormItem label="名称">
                    <GrowInput
                      :model-value="arm.label"
                      size="small"
                      placeholder="如 分支A"
                      @update:model-value="(v) => updateParallelArm(armIndex, { label: String(v ?? '') })"
                    />
                  </GrowFormItem>
                </GrowForm>
              </div>
            </div>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">汇聚</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="汇聚策略">
                <GrowSelect
                  :model-value="parallelBranch.joinMode || 'all'"
                  :options="JOIN_MODE_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ joinMode: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem v-if="parallelBranch.joinMode === 'count'" label="汇聚数量">
                <GrowInput
                  :model-value="parallelBranch.joinCount == null ? '' : String(parallelBranch.joinCount)"
                  size="small"
                  @update:model-value="(v) => patchConfig({ joinCount: Number(v) || undefined })"
                />
              </GrowFormItem>
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="parallelBranch.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <!-- 业务规则任务 -->
          <template v-else-if="node.type === 'business-rule-task'">
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">基础</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="规则集 ID">
                <GrowInput
                  :model-value="businessRule.ruleSetId || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ ruleSetId: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="规则集名">
                <GrowInput
                  :model-value="businessRule.ruleSetName || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ ruleSetName: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">办理</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="入参变量">
                <GrowInput
                  :model-value="businessRule.inputVars || ''"
                  type="textarea"
                  size="small"
                  :rows="3"
                  @update:model-value="(v) => patchConfig({ inputVars: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="出参变量">
                <GrowInput
                  :model-value="businessRule.outputVars || ''"
                  type="textarea"
                  size="small"
                  :rows="3"
                  @update:model-value="(v) => patchConfig({ outputVars: String(v ?? '') })"
                />
              </GrowFormItem>
              <GrowFormItem label="命中策略">
                <GrowSelect
                  :model-value="businessRule.hitPolicy || 'first'"
                  :options="HIT_POLICY_OPTIONS"
                  size="small"
                  class="w-full"
                  @update:model-value="(v) => patchConfig({ hitPolicy: String(v) })"
                />
              </GrowFormItem>
              <GrowFormItem label="未命中阻断">
                <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                  <GrowCheckbox
                    :model-value="!!businessRule.failOnMiss"
                    @update:model-value="(v) => patchConfig({ failOnMiss: !!v })"
                  />
                  无规则命中时阻断流程
                </label>
              </GrowFormItem>
            </GrowForm>
            <div class="mt-3 mb-1.5 text-xs font-medium text-text">高级</div>
            <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
              <GrowFormItem label="备注">
                <GrowInput
                  :model-value="businessRule.remark || ''"
                  size="small"
                  @update:model-value="(v) => patchConfig({ remark: String(v ?? '') })"
                />
              </GrowFormItem>
            </GrowForm>
          </template>

          <p class="mt-4 mb-0 text-xs text-text-secondary">
            当前为流程编排设计期，执行与模拟将在后续版本对接。
          </p>
        </template>

        <!-- 连线配置 -->
        <template v-else-if="edge">
          <div class="mb-1.5 text-xs font-medium text-text">连线</div>
          <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
            <GrowFormItem label="标签">
              <GrowInput
                :model-value="edge.label || ''"
                size="small"
                placeholder="连线上显示的文字"
                @update:model-value="(v) => patchEdge({ label: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="流转类型">
              <GrowSelect
                :model-value="edge.transitionKind || 'forward'"
                :options="TRANSITION_KIND_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchEdge({ transitionKind: String(v) as ProcessTransitionKind })"
              />
            </GrowFormItem>
            <GrowFormItem label="条件">
              <GrowInput
                :model-value="edge.condition || ''"
                size="small"
                placeholder="可选条件表达式"
                @update:model-value="(v) => patchEdge({ condition: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="优先级">
              <GrowInput
                :model-value="edge.priority == null ? '' : String(edge.priority)"
                size="small"
                placeholder="数值越小越优先"
                @update:model-value="(v) => patchEdge({ priority: v === '' ? undefined : Number(v) })"
              />
            </GrowFormItem>
            <GrowFormItem label="备注">
              <GrowInput
                :model-value="edge.remark || ''"
                size="small"
                placeholder="设计说明"
                @update:model-value="(v) => patchEdge({ remark: String(v ?? '') })"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-3 mb-0 text-xs text-text-secondary">
            状态机回退 / 跳转请将「流转类型」设为回退或跳转。
          </p>
        </template>

        <template v-else>
          <p class="m-0 text-xs text-text-secondary">选中画布节点或连线以编辑配置</p>
        </template>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PersonAssigneeFields from './PersonAssigneeFields.vue'
import {
  ADD_SIGN_MODE_OPTIONS,
  ASSIGNEE_TYPE_OPTIONS,
  AUTH_TYPE_OPTIONS,
  COUNTERSIGN_PASS_OPTIONS,
  FILTER_LOGIC_OPTIONS,
  HIT_POLICY_OPTIONS,
  HTTP_METHOD_OPTIONS,
  JOIN_MODE_OPTIONS,
  NODE_TYPE_META,
  NOTIFY_CHANNEL_OPTIONS,
  PRIORITY_OPTIONS,
  REJECT_STRATEGY_OPTIONS,
  RULE_OP_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  SCRIPT_LANG_OPTIONS,
  SERVICE_PROTOCOL_OPTIONS,
  TIMEOUT_ACTION_OPTIONS,
  TRANSITION_KIND_OPTIONS,
} from '../../static/nodeCatalog'
import type {
  ProcessAddSignConfig,
  ProcessApproverConfig,
  ProcessBusinessRuleTaskConfig,
  ProcessCcConfig,
  ProcessConditionArm,
  ProcessConditionBranchConfig,
  ProcessCountersignConfig,
  ProcessEndEventConfig,
  ProcessFlowEdge,
  ProcessFlowNode,
  ProcessHandlerConfig,
  ProcessMessageNotifyConfig,
  ProcessParallelArm,
  ProcessParallelBranchConfig,
  ProcessRuleCondition,
  ProcessScriptTaskConfig,
  ProcessServiceTaskConfig,
  ProcessStartConfig,
  ProcessStartMessageConfig,
  ProcessStartTimerConfig,
  ProcessStateConfig,
  ProcessSubprocessConfig,
  ProcessTerminateConfig,
  ProcessTransitionKind,
} from '../../types'
import {
  MAX_BRANCH_COUNT,
  MAX_CONDITION_ARM_COUNT,
  MIN_BRANCH_COUNT,
  MIN_CONDITION_ARM_COUNT,
  createConditionArm,
  createParallelArm,
  normalizeConditionBranches,
  normalizeParallelBranches,
} from '../../utils/branches'

defineOptions({
  name: 'ProcessNodeConfigPanel',
})

const INITIATOR_TYPE_OPTIONS = [
  { label: '任何人', value: 'anyone' },
  { label: '角色', value: 'role' },
  { label: '表达式', value: 'expression' },
]

const CC_TIMING_OPTIONS = [
  { label: '到达本节点', value: 'on-enter' },
  { label: '上游完成时', value: 'on-leave' },
]

const CC_CHANNEL_OPTIONS = NOTIFY_CHANNEL_OPTIONS.filter((item) =>
  ['inbox', 'email', 'sms', 'all'].includes(String(item.value)),
)

const COUNTERSIGN_REJECT_OPTIONS = [
  { label: '驳回', value: 'reject' },
  { label: '结束流程', value: 'end' },
  { label: '指定节点', value: 'to-node' },
]

const MISFIRE_POLICY_OPTIONS = [
  { label: '忽略', value: 'ignore' },
  { label: '立即补跑一次', value: 'fire-once' },
]

const FAIL_ACTION_OPTIONS = [
  { label: '报错中断', value: 'error' },
  { label: '忽略继续', value: 'ignore' },
  { label: '补偿回滚', value: 'compensate' },
]

const SUBPROCESS_ERROR_OPTIONS = [
  { label: '失败中断', value: 'fail' },
  { label: '忽略继续', value: 'ignore' },
  { label: '补偿回滚', value: 'compensate' },
]

const props = defineProps<{
  node: ProcessFlowNode | null
  edge: ProcessFlowEdge | null
}>()

const emit = defineEmits<{
  'update-node': [id: string, patch: Partial<ProcessFlowNode>]
  'update-edge': [id: string, patch: Partial<ProcessFlowEdge>]
}>()

const typeLabel = computed(() =>
  props.node ? NODE_TYPE_META[props.node.type].label : '',
)

const countersign = computed(() => (props.node?.config || {}) as ProcessCountersignConfig)
const addSign = computed(() => (props.node?.config || {}) as ProcessAddSignConfig)
const approver = computed(() => (props.node?.config || {}) as ProcessApproverConfig)
const ccCfg = computed(() => (props.node?.config || {}) as ProcessCcConfig)
const handler = computed(() => (props.node?.config || {}) as ProcessHandlerConfig)
const startCfg = computed(() => (props.node?.config || {}) as ProcessStartConfig)
const startMessage = computed(() => (props.node?.config || {}) as ProcessStartMessageConfig)
const startTimer = computed(() => (props.node?.config || {}) as ProcessStartTimerConfig)
const endEvent = computed(() => (props.node?.config || {}) as ProcessEndEventConfig)
const terminateCfg = computed(() => (props.node?.config || {}) as ProcessTerminateConfig)
const messageNotify = computed(() => (props.node?.config || {}) as ProcessMessageNotifyConfig)
const serviceTask = computed(() => (props.node?.config || {}) as ProcessServiceTaskConfig)
const subprocess = computed(() => (props.node?.config || {}) as ProcessSubprocessConfig)
const stateCfg = computed(() => (props.node?.config || {}) as ProcessStateConfig)
const scriptTask = computed(() => (props.node?.config || {}) as ProcessScriptTaskConfig)
const conditionBranch = computed(() => (props.node?.config || {}) as ProcessConditionBranchConfig)
const parallelBranch = computed(
  () => (props.node?.config || {}) as ProcessParallelBranchConfig,
)
const businessRule = computed(
  () => (props.node?.config || {}) as ProcessBusinessRuleTaskConfig,
)

const conditionArms = computed(() => normalizeConditionBranches(conditionBranch.value))
const parallelArms = computed(() => normalizeParallelBranches(parallelBranch.value))

function parseList(value: string | number | null) {
  return String(value ?? '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function patchConditionArms(branches: ProcessConditionArm[]) {
  patchConfig({ branches })
}

function patchParallelArms(branches: ProcessParallelArm[]) {
  patchConfig({ branches })
}

function addConditionArm() {
  if (conditionArms.value.length >= MAX_CONDITION_ARM_COUNT) return
  patchConditionArms([
    ...conditionArms.value,
    createConditionArm({ label: `条件${conditionArms.value.length + 1}` }),
  ])
}

function removeConditionArm(index: number) {
  if (conditionArms.value.length <= MIN_CONDITION_ARM_COUNT) return
  patchConditionArms(conditionArms.value.filter((_, i) => i !== index))
}

function updateConditionArm(index: number, patch: Partial<ProcessConditionArm>) {
  const next = conditionArms.value.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  )
  patchConditionArms(next)
}

function setArmLogic(index: number, value: string | number | null) {
  updateConditionArm(index, { logic: String(value) === 'or' ? 'or' : 'and' })
}

function addArmCondition(armIndex: number) {
  const arm = conditionArms.value[armIndex]
  if (!arm) return
  updateConditionArm(armIndex, {
    conditions: [...(arm.conditions || []), { field: '', op: 'eq', value: '' }],
  })
}

function removeArmCondition(armIndex: number, condIndex: number) {
  const arm = conditionArms.value[armIndex]
  if (!arm) return
  const conditions = (arm.conditions || []).filter((_, i) => i !== condIndex)
  updateConditionArm(armIndex, {
    conditions: conditions.length ? conditions : [{ field: '', op: 'eq', value: '' }],
  })
}

function updateArmCondition(
  armIndex: number,
  condIndex: number,
  patch: Partial<ProcessRuleCondition>,
) {
  const arm = conditionArms.value[armIndex]
  if (!arm) return
  const conditions = (arm.conditions || []).map((item, i) =>
    i === condIndex ? { ...item, ...patch } : item,
  )
  updateConditionArm(armIndex, { conditions })
}

function addParallelArm() {
  if (parallelArms.value.length >= MAX_BRANCH_COUNT) return
  patchParallelArms([
    ...parallelArms.value,
    createParallelArm({ label: `并行${parallelArms.value.length + 1}` }),
  ])
}

function removeParallelArm(index: number) {
  if (parallelArms.value.length <= MIN_BRANCH_COUNT) return
  patchParallelArms(parallelArms.value.filter((_, i) => i !== index))
}

function updateParallelArm(index: number, patch: Partial<ProcessParallelArm>) {
  const next = parallelArms.value.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  )
  patchParallelArms(next)
}

function patchNode(patch: Partial<ProcessFlowNode>) {
  if (!props.node) return
  emit('update-node', props.node.id, patch)
}

function patchConfig(patch: Record<string, unknown>) {
  if (!props.node) return
  emit('update-node', props.node.id, {
    config: { ...props.node.config, ...patch } as ProcessFlowNode['config'],
  })
}

function patchEdge(patch: Partial<ProcessFlowEdge>) {
  if (!props.edge) return
  emit('update-edge', props.edge.id, patch)
}
</script>
