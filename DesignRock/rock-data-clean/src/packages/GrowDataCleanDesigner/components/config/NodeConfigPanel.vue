<template>
  <div class="box-border flex h-full min-h-0 flex-col">
    <GrowScrollbar class="min-h-0 flex-1">
      <div class="box-border px-3 py-3">
        <GrowForm label-width="72px" label-position="left" size="small" :show-message="false">
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

        <template v-if="node.type === 'table'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="来源">
              <GrowSelect
                :model-value="tableConfig.sourceKind"
                :options="TABLE_SOURCE_KIND_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="onSourceKindChange"
              />
            </GrowFormItem>
            <GrowFormItem label="数据表">
              <GrowSelect
                :model-value="tableConfig.refId || ''"
                :options="tableOptions"
                size="small"
                class="w-full"
                placeholder="选择数据表"
                @update:model-value="onTableRefChange"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            支持建模表 / Dataset 原始表 / Dataset 输出；行数据来自清洗专用 Mock。
          </p>
          <div class="mt-3 border-t border-solid border-border pt-3">
            <OutputFieldsPicker
              :model-value="tableConfig.fields"
              :candidates="fieldCandidates"
              title="输出字段"
              hint="勾选带入清洗流的字段；未配置默认全部，也可全部取消。"
              empty-text="请先选择数据表"
              @update:model-value="(v) => patchConfig({ fields: v })"
            />
          </div>
        </template>

        <template v-else-if="node.type === 'api'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="方法">
              <GrowSelect
                :model-value="apiConfig.method || 'GET'"
                :options="API_METHOD_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ method: String(v) })"
              />
            </GrowFormItem>
            <GrowFormItem label="URL">
              <GrowInput
                :model-value="apiConfig.url || ''"
                size="small"
                placeholder="/demo/orders 或留空用默认样例"
                @update:model-value="(v) => patchConfig({ url: String(v ?? '') })"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            预览不会发起真实 HTTP，按 URL 匹配本地 Mock（如 `/demo/orders`）。
          </p>
        </template>

        <template v-else-if="node.type === 'condition' || node.type === 'filter'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem v-if="conditionRules.length > 1" label="组合">
              <GrowSelect
                :model-value="conditionConfig.logic || 'and'"
                :options="FILTER_LOGIC_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ logic: String(v) as 'and' | 'or' })"
              />
            </GrowFormItem>
          </GrowForm>

          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">条件</span>
            <GrowButton size="small" @click="addConditionRule">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in conditionRules"
              :key="`cond-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-secondary">条件 {{ index + 1 }}</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="conditionRules.length <= 1"
                  @click="removeConditionRule(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="48px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="字段">
                  <GrowInput
                    :model-value="item.field"
                    size="small"
                    placeholder="字段名"
                    @update:model-value="(v) => updateConditionRule(index, { field: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem label="运算">
                  <GrowSelect
                    :model-value="item.op || 'eq'"
                    :options="FILTER_OP_OPTIONS"
                    size="small"
                    class="w-full"
                    @update:model-value="(v) => updateConditionRule(index, { op: String(v ?? 'eq') })"
                  />
                </GrowFormItem>
                <GrowFormItem
                  v-if="item.op !== 'empty' && item.op !== 'not-empty'"
                  label="值"
                >
                  <GrowInput
                    :model-value="item.value"
                    size="small"
                    placeholder="比较值"
                    @update:model-value="(v) => updateConditionRule(index, { value: String(v ?? '') })"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>

          <p class="mt-2 mb-0 text-xs text-text-secondary">
            <template v-if="node.type === 'condition'">
              满足条件的数据从右侧「是」出口流出，否则从「否」出口流出；两路均可继续连接下游。
            </template>
            <template v-else>
              仅保留满足条件的行，不满足的行会被丢弃。
            </template>
          </p>
        </template>

        <template v-else-if="node.type === 'split-field'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="源字段">
              <GrowInput
                :model-value="splitConfig.field || ''"
                size="small"
                placeholder="如 full_name / address"
                @update:model-value="(v) => patchConfig({ field: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="拆分方式">
              <GrowSelect
                :model-value="splitConfig.mode || 'delimiter'"
                :options="SPLIT_MODE_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="onSplitModeChange"
              />
            </GrowFormItem>
            <GrowFormItem v-if="(splitConfig.mode || 'delimiter') === 'delimiter'" label="分隔符">
              <GrowInput
                :model-value="splitConfig.delimiter ?? ','"
                size="small"
                placeholder=","
                @update:model-value="(v) => patchConfig({ delimiter: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem v-else-if="splitConfig.mode === 'regex'" label="正则">
              <GrowInput
                :model-value="splitConfig.pattern || ''"
                size="small"
                placeholder="^(\\d{4})-(\\d{2})-(\\d{2})$"
                @update:model-value="(v) => patchConfig({ pattern: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="保留原字段">
              <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                <GrowCheckbox
                  :model-value="splitConfig.keepOriginal !== false"
                  @update:model-value="(v) => patchConfig({ keepOriginal: !!v })"
                />
                拆分后保留源字段
              </label>
            </GrowFormItem>
            <GrowFormItem label="不足补空">
              <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                <GrowCheckbox
                  :model-value="splitConfig.padEmpty !== false"
                  @update:model-value="(v) => patchConfig({ padEmpty: !!v })"
                />
                段数不够时用空值补齐
              </label>
            </GrowFormItem>
          </GrowForm>

          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">输出字段</span>
            <GrowButton size="small" @click="addSplitOutput">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in splitOutputs"
              :key="`split-out-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <span class="text-[11px] text-text-secondary">第 {{ index + 1 }} 段</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="splitOutputs.length <= 1"
                  @click="removeSplitOutput(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="56px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="字段名">
                  <GrowInput
                    :model-value="item.name"
                    size="small"
                    placeholder="field_n"
                    @update:model-value="(v) => updateSplitOutput(index, { name: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem v-if="splitConfig.mode === 'fixed-width'" label="宽度">
                  <GrowInput
                    :model-value="item.width != null ? String(item.width) : ''"
                    size="small"
                    placeholder="字符数"
                    @update:model-value="(v) => onSplitWidthChange(index, v)"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>

          <p class="mt-2 mb-0 text-xs text-text-secondary">
            例：`张三,李四` 按逗号拆成 `first_name` / `last_name`；日期可用正则捕获年/月/日。
          </p>
        </template>

        <template v-else-if="node.type === 'null-handle'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="策略">
              <GrowSelect
                :model-value="nullHandleConfig.strategy || 'fill'"
                :options="NULL_STRATEGY_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ strategy: String(v) })"
              />
            </GrowFormItem>
            <GrowFormItem v-if="(nullHandleConfig.strategy || 'fill') === 'fill'" label="填充值">
              <GrowInput
                :model-value="nullHandleConfig.fillValue || ''"
                size="small"
                placeholder="空值替换为"
                @update:model-value="(v) => patchConfig({ fillValue: String(v ?? '') })"
              />
            </GrowFormItem>
          </GrowForm>
          <div class="mt-3 border-t border-solid border-border pt-3">
            <OutputFieldsPicker
              :model-value="nullHandleConfig.fields"
              :candidates="fieldCandidates"
              empty-means="all"
              title="作用字段"
              hint="未勾选时默认处理全部字段。"
              @update:model-value="(v) => patchConfig({ fields: v ?? [] })"
            />
          </div>
        </template>

        <template v-else-if="node.type === 'trim-case'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="操作">
              <GrowSelect
                :model-value="(trimCaseConfig.ops || ['trim'])[0] || 'trim'"
                :options="TRIM_OP_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ ops: [String(v)] })"
              />
            </GrowFormItem>
          </GrowForm>
          <div class="mt-3 border-t border-solid border-border pt-3">
            <OutputFieldsPicker
              :model-value="trimCaseConfig.fields"
              :candidates="fieldCandidates"
              empty-means="all"
              title="作用字段"
              hint="未勾选时默认处理字符串列；也可指定字段。"
              @update:model-value="(v) => patchConfig({ fields: v ?? [] })"
            />
          </div>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            M1 单选一种操作；需要组合时可在后续版本扩展为多选。
          </p>
        </template>

        <template v-else-if="node.type === 'dedupe'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="保留">
              <GrowSelect
                :model-value="dedupeConfig.keep || 'first'"
                :options="DEDUPE_KEEP_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ keep: String(v) })"
              />
            </GrowFormItem>
          </GrowForm>
          <div class="mt-3 border-t border-solid border-border pt-3">
            <OutputFieldsPicker
              :model-value="dedupeConfig.fields"
              :candidates="fieldCandidates"
              empty-means="all"
              title="去重字段"
              hint="未勾选时按全部字段去重；勾选后仅按所选字段判断重复。"
              @update:model-value="(v) => patchConfig({ fields: v ?? [] })"
            />
          </div>
        </template>

        <template v-else-if="node.type === 'format'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="字段">
              <GrowInput
                :model-value="formatConfig.field || ''"
                size="small"
                placeholder="如 phone / created_at"
                @update:model-value="(v) => patchConfig({ field: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="格式">
              <GrowSelect
                :model-value="formatConfig.format || 'date'"
                :options="FORMAT_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ format: String(v) })"
              />
            </GrowFormItem>
            <GrowFormItem v-if="formatConfig.format === 'regex'" label="正则">
              <GrowInput
                :model-value="formatConfig.pattern || ''"
                size="small"
                placeholder="含捕获组时取第 1 组"
                @update:model-value="(v) => patchConfig({ pattern: String(v ?? '') })"
              />
            </GrowFormItem>
          </GrowForm>
        </template>

        <template v-else-if="node.type === 'outlier'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="字段">
              <GrowInput
                :model-value="outlierConfig.field || ''"
                size="small"
                placeholder="如 amount"
                @update:model-value="(v) => patchConfig({ field: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="规则">
              <GrowSelect
                :model-value="outlierConfig.rule || 'range'"
                :options="OUTLIER_RULE_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ rule: String(v) })"
              />
            </GrowFormItem>
            <GrowFormItem v-if="(outlierConfig.rule || 'range') === 'range'" label="最小">
              <GrowInput
                :model-value="outlierConfig.min || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ min: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem v-if="(outlierConfig.rule || 'range') === 'range'" label="最大">
              <GrowInput
                :model-value="outlierConfig.max || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ max: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem v-else-if="outlierConfig.rule === 'regex'" label="正则">
              <GrowInput
                :model-value="outlierConfig.pattern || ''"
                size="small"
                placeholder="合法值需匹配"
                @update:model-value="(v) => patchConfig({ pattern: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem v-else-if="outlierConfig.rule === 'enum'" label="枚举">
              <GrowInput
                :model-value="outlierConfig.enumValues || ''"
                size="small"
                placeholder="paid,pending"
                @update:model-value="(v) => patchConfig({ enumValues: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="动作">
              <GrowSelect
                :model-value="outlierConfig.action || 'mark'"
                :options="OUTLIER_ACTION_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ action: String(v) })"
              />
            </GrowFormItem>
            <GrowFormItem v-if="outlierConfig.action === 'replace'" label="替换为">
              <GrowInput
                :model-value="outlierConfig.replaceValue || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ replaceValue: String(v ?? '') })"
              />
            </GrowFormItem>
          </GrowForm>
        </template>

        <template v-else-if="node.type === 'join'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="类型">
              <GrowSelect
                :model-value="joinConfig.joinType || 'left'"
                :options="JOIN_TYPE_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ joinType: String(v) })"
              />
            </GrowFormItem>
          </GrowForm>
          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">关联字段</span>
            <GrowButton size="small" @click="addJoinKey">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in joinKeys"
              :key="`join-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between">
                <span class="text-[11px] text-text-secondary">条件 {{ index + 1 }}</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="joinKeys.length <= 1"
                  @click="removeJoinKey(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="56px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="左字段">
                  <GrowInput
                    :model-value="item.leftField"
                    size="small"
                    placeholder="左表字段"
                    @update:model-value="(v) => updateJoinKey(index, { leftField: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem label="右字段">
                  <GrowInput
                    :model-value="item.rightField"
                    size="small"
                    placeholder="右表字段"
                    @update:model-value="(v) => updateJoinKey(index, { rightField: String(v ?? '') })"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            请将左路上游接到左上/主输入，右路上游接到左下输入。
          </p>
        </template>

        <template v-else-if="node.type === 'union'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="去重">
              <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
                <GrowCheckbox
                  :model-value="!!unionConfig.dedupe"
                  @update:model-value="(v) => patchConfig({ dedupe: !!v })"
                />
                合并后按全部字段去重
              </label>
            </GrowFormItem>
            <GrowFormItem label="字段映射">
              <GrowInput
                :model-value="fieldMapText"
                size="small"
                placeholder="右字段:左字段, 如 name:customer_name"
                @update:model-value="onFieldMapChange"
              />
            </GrowFormItem>
          </GrowForm>
        </template>

        <template v-else-if="node.type === 'groupby'">
          <div class="mt-1 border-b border-solid border-border pb-3">
            <OutputFieldsPicker
              :model-value="groupByConfig.groupFields || []"
              :candidates="fieldCandidates"
              empty-means="none"
              :default-all="false"
              title="分组字段"
              hint="勾选用于分组的字段；可多选，也可不选（仅聚合）。"
              @update:model-value="(v) => patchConfig({ groupFields: v ?? [] })"
            />
          </div>
          <div class="mt-3 mb-2 flex items-center justify-between">
            <span class="text-xs font-medium text-text">度量</span>
            <GrowButton size="small" @click="addMetric">
              <GrowIconify icon="carbon:add" :size="14" />
              添加
            </GrowButton>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in groupMetrics"
              :key="`metric-${index}`"
              class="rounded border border-solid border-border px-2.5 py-2"
            >
              <div class="mb-1.5 flex items-center justify-between">
                <span class="text-[11px] text-text-secondary">度量 {{ index + 1 }}</span>
                <GrowButton
                  text
                  size="small"
                  type="danger"
                  :disabled="groupMetrics.length <= 1"
                  @click="removeMetric(index)"
                >
                  删除
                </GrowButton>
              </div>
              <GrowForm label-width="48px" label-position="left" size="small" :show-message="false">
                <GrowFormItem label="字段">
                  <GrowInput
                    :model-value="item.field"
                    size="small"
                    @update:model-value="(v) => updateMetric(index, { field: String(v ?? '') })"
                  />
                </GrowFormItem>
                <GrowFormItem label="函数">
                  <GrowSelect
                    :model-value="item.fn || 'SUM'"
                    :options="AGG_FN_OPTIONS"
                    size="small"
                    class="w-full"
                    @update:model-value="(v) => updateMetric(index, { fn: String(v) as any })"
                  />
                </GrowFormItem>
                <GrowFormItem label="别名">
                  <GrowInput
                    :model-value="item.alias"
                    size="small"
                    @update:model-value="(v) => updateMetric(index, { alias: String(v ?? '') })"
                  />
                </GrowFormItem>
              </GrowForm>
            </div>
          </div>
        </template>

        <template v-else-if="node.type === 'pivot'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="行字段">
              <GrowInput
                :model-value="pivotConfig.rowField || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ rowField: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="列字段">
              <GrowInput
                :model-value="pivotConfig.colField || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ colField: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="值字段">
              <GrowInput
                :model-value="pivotConfig.valueField || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ valueField: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="聚合">
              <GrowSelect
                :model-value="pivotConfig.agg || 'SUM'"
                :options="AGG_FN_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ agg: String(v) })"
              />
            </GrowFormItem>
          </GrowForm>
        </template>

        <template v-else-if="node.type === 'output'">
          <GrowForm
            class="mt-1"
            label-width="72px"
            label-position="left"
            size="small"
            :show-message="false"
          >
            <GrowFormItem label="输出名">
              <GrowInput
                :model-value="outputConfig.outputName || ''"
                size="small"
                @update:model-value="(v) => patchConfig({ outputName: String(v ?? '') })"
              />
            </GrowFormItem>
            <GrowFormItem label="目标">
              <GrowSelect
                :model-value="outputConfig.target || 'report'"
                :options="OUTPUT_TARGET_OPTIONS"
                size="small"
                class="w-full"
                @update:model-value="(v) => patchConfig({ target: String(v) as any })"
              />
            </GrowFormItem>
          </GrowForm>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            调用时执行：下游报表/页面拉数时按流定义实时跑。消费者绑定后续对接。
          </p>
          <div class="mt-3 border-t border-solid border-border pt-3">
            <OutputFieldsPicker
              :model-value="outputConfig.fields"
              :candidates="fieldCandidates"
              title="输出字段"
              hint="勾选最终输出字段；未配置默认全部，也可全部取消。"
              empty-text="请先连接上游节点，并确保上游可预览"
              @update:model-value="(v) => patchConfig({ fields: v })"
            />
          </div>
        </template>

        <template v-else>
          <p class="mt-2 mb-0 text-xs text-text-secondary">
            「{{ typeLabel }}」暂无专用配置项。
          </p>
        </template>

        <div class="mt-4 rounded border border-solid border-border px-2.5 py-2 text-xs text-text-secondary">
          <div>输入行数：{{ formatRows(node.stats?.inputRows) }}</div>
          <div class="mt-1">输出行数：{{ formatRows(node.stats?.outputRows) }}</div>
        </div>
      </div>
    </GrowScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DEMO_SOURCE_OPTIONS,
  FILTER_LOGIC_OPTIONS,
  FILTER_OP_OPTIONS,
  NODE_TYPE_META,
  SPLIT_MODE_OPTIONS,
  TABLE_SOURCE_KIND_OPTIONS,
} from '../../static/nodeCatalog'
import type {
  CleanApiSourceConfig,
  CleanConditionConfig,
  CleanDedupeConfig,
  CleanFilterCondition,
  CleanFilterConfig,
  CleanFlowNode,
  CleanFormatConfig,
  CleanGroupByConfig,
  CleanGroupByMetric,
  CleanJoinConfig,
  CleanNullHandleConfig,
  CleanOutputConfig,
  CleanOutlierConfig,
  CleanPivotConfig,
  CleanPreviewColumn,
  CleanSplitFieldConfig,
  CleanSplitMode,
  CleanSplitOutputField,
  CleanTableSourceConfig,
  CleanTableSourceKind,
  CleanTrimCaseConfig,
  CleanUnionConfig,
} from '../../types'
import OutputFieldsPicker, {
  type CleanFieldCandidate,
} from './OutputFieldsPicker.vue'

defineOptions({
  name: 'CleanNodeConfigPanel',
})

const props = defineProps<{
  node: CleanFlowNode
  /** 当前节点可用字段候选（表列 / 上游输出列） */
  fieldCandidates?: CleanFieldCandidate[] | CleanPreviewColumn[]
}>()

const emit = defineEmits<{
  'update-node': [id: string, patch: Partial<CleanFlowNode>]
}>()

const OUTPUT_TARGET_OPTIONS = [
  { label: '报表数据集', value: 'report' },
  { label: '低代码页面数据源', value: 'lowcode' },
  { label: 'API 端点', value: 'api' },
]

const NULL_STRATEGY_OPTIONS = [
  { label: '填充', value: 'fill' },
  { label: '删除行', value: 'drop-row' },
  { label: '前向填充', value: 'ffill' },
  { label: '后向填充', value: 'bfill' },
]

const TRIM_OP_OPTIONS = [
  { label: '去两端空格', value: 'trim' },
  { label: '去除全部空白', value: 'trim-all' },
  { label: '转大写', value: 'upper' },
  { label: '转小写', value: 'lower' },
  { label: '首字母大写', value: 'capitalize' },
]

const DEDUPE_KEEP_OPTIONS = [
  { label: '保留第一条', value: 'first' },
  { label: '保留最后一条', value: 'last' },
  { label: '随机保留', value: 'random' },
]

const API_METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
]

const FORMAT_OPTIONS = [
  { label: '日期', value: 'date' },
  { label: '手机号', value: 'phone' },
  { label: '身份证', value: 'id-card' },
  { label: '金额', value: 'money' },
  { label: '正则', value: 'regex' },
]

const OUTLIER_RULE_OPTIONS = [
  { label: '范围', value: 'range' },
  { label: '正则', value: 'regex' },
  { label: '枚举', value: 'enum' },
]

const OUTLIER_ACTION_OPTIONS = [
  { label: '标记', value: 'mark' },
  { label: '删除行', value: 'drop' },
  { label: '替换', value: 'replace' },
]

const JOIN_TYPE_OPTIONS = [
  { label: 'LEFT', value: 'left' },
  { label: 'INNER', value: 'inner' },
  { label: 'RIGHT', value: 'right' },
  { label: 'FULL', value: 'full' },
]

const AGG_FN_OPTIONS = [
  { label: 'SUM', value: 'SUM' },
  { label: 'COUNT', value: 'COUNT' },
  { label: 'AVG', value: 'AVG' },
  { label: 'MAX', value: 'MAX' },
  { label: 'MIN', value: 'MIN' },
]

const typeLabel = computed(() => NODE_TYPE_META[props.node.type].label)

const tableConfig = computed(
  () => (props.node?.config || {}) as CleanTableSourceConfig,
)
const apiConfig = computed(() => (props.node?.config || {}) as CleanApiSourceConfig)
const nullHandleConfig = computed(
  () => (props.node?.config || {}) as CleanNullHandleConfig,
)
const trimCaseConfig = computed(
  () => (props.node?.config || {}) as CleanTrimCaseConfig,
)
const dedupeConfig = computed(
  () => (props.node?.config || {}) as CleanDedupeConfig,
)
const formatConfig = computed(() => (props.node?.config || {}) as CleanFormatConfig)
const outlierConfig = computed(() => (props.node?.config || {}) as CleanOutlierConfig)
const joinConfig = computed(() => (props.node?.config || {}) as CleanJoinConfig)
const unionConfig = computed(() => (props.node?.config || {}) as CleanUnionConfig)
const groupByConfig = computed(() => (props.node?.config || {}) as CleanGroupByConfig)
const pivotConfig = computed(() => (props.node?.config || {}) as CleanPivotConfig)
const outputConfig = computed(
  () => (props.node?.config || {}) as CleanOutputConfig,
)

const joinKeys = computed(() =>
  joinConfig.value.keys?.length
    ? joinConfig.value.keys
    : [{ leftField: '', rightField: '' }],
)

const groupMetrics = computed<CleanGroupByMetric[]>(() =>
  groupByConfig.value.metrics?.length
    ? groupByConfig.value.metrics
    : [{ field: '', fn: 'SUM', alias: 'metric_1' }],
)

const fieldMapText = computed(() =>
  Object.entries(unionConfig.value.fieldMap || {})
    .map(([from, to]) => `${from}:${to}`)
    .join(','),
)
const splitConfig = computed(
  () => (props.node?.config || {}) as CleanSplitFieldConfig,
)
const splitOutputs = computed<CleanSplitOutputField[]>(() =>
  splitConfig.value.outputs?.length
    ? splitConfig.value.outputs
    : [{ name: 'field_1' }, { name: 'field_2' }],
)

const conditionConfig = computed(() => {
  const raw = (props.node?.config || {}) as CleanConditionConfig | CleanFilterConfig
  return {
    logic: raw.logic || 'and',
    conditions: raw.conditions || [],
  }
})

const conditionRules = computed<CleanFilterCondition[]>(() =>
  conditionConfig.value.conditions?.length
    ? conditionConfig.value.conditions
    : [{ field: '', op: 'eq', value: '' }],
)

const tableOptions = computed(() => {
  const kind = (tableConfig.value.sourceKind || 'schema-table') as CleanTableSourceKind
  return (DEMO_SOURCE_OPTIONS[kind] || []).map((item) => ({
    label: item.label,
    value: item.id,
  }))
})

const fieldCandidates = computed<CleanFieldCandidate[]>(() =>
  (props.fieldCandidates || []).map((item) => ({
    key: item.key,
    title: item.title || item.key,
    dataType: item.dataType,
  })),
)

function formatRows(value?: number | null) {
  return value == null ? '-' : String(value)
}

function patchNode(patch: Partial<CleanFlowNode>) {
  if (!props.node) return
  emit('update-node', props.node.id, patch)
}

function patchConfig(patch: Record<string, unknown>) {
  if (!props.node) return
  emit('update-node', props.node.id, {
    config: { ...props.node.config, ...patch } as CleanFlowNode['config'],
  })
}

function onSourceKindChange(value: string | number | null) {
  const sourceKind = String(value) as CleanTableSourceKind
  patchConfig({
    sourceKind,
    refId: '',
    refLabel: '',
    tableId: '',
    tableName: '',
    fields: null,
  })
}

function onTableRefChange(value: string | number | null) {
  const refId = String(value ?? '')
  const kind = (tableConfig.value.sourceKind || 'schema-table') as CleanTableSourceKind
  const hit = (DEMO_SOURCE_OPTIONS[kind] || []).find((item) => item.id === refId)
  patchConfig({
    refId,
    refLabel: hit?.label || '',
    tableId: hit?.id || '',
    tableName: hit?.tableName || '',
    fields: null,
  })
}

function onSplitModeChange(value: string | number | null) {
  const mode = String(value) as CleanSplitMode
  patchConfig({ mode })
}

function addSplitOutput() {
  const next = [...splitOutputs.value, { name: `field_${splitOutputs.value.length + 1}` }]
  patchConfig({ outputs: next })
}

function removeSplitOutput(index: number) {
  if (splitOutputs.value.length <= 1) return
  const next = splitOutputs.value.filter((_, i) => i !== index)
  patchConfig({ outputs: next })
}

function updateSplitOutput(index: number, patch: Partial<CleanSplitOutputField>) {
  const next = splitOutputs.value.map((item, i) => (i === index ? { ...item, ...patch } : item))
  patchConfig({ outputs: next })
}

function onSplitWidthChange(index: number, value: string | number | null) {
  const raw = String(value ?? '').trim()
  const width = raw === '' ? undefined : Number(raw)
  updateSplitOutput(index, {
    width: width != null && Number.isFinite(width) && width > 0 ? width : undefined,
  })
}

function addConditionRule() {
  patchConfig({
    conditions: [...conditionRules.value, { field: '', op: 'eq', value: '' }],
  })
}

function removeConditionRule(index: number) {
  if (conditionRules.value.length <= 1) return
  const next = conditionRules.value.filter((_, i) => i !== index)
  patchConfig({
    conditions: next,
    logic: next.length > 1 ? conditionConfig.value.logic || 'and' : 'and',
  })
}

function updateConditionRule(index: number, patch: Partial<CleanFilterCondition>) {
  const next = conditionRules.value.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  )
  patchConfig({ conditions: next })
}

function addJoinKey() {
  patchConfig({
    keys: [...joinKeys.value, { leftField: '', rightField: '' }],
  })
}

function removeJoinKey(index: number) {
  if (joinKeys.value.length <= 1) return
  patchConfig({ keys: joinKeys.value.filter((_, i) => i !== index) })
}

function updateJoinKey(
  index: number,
  patch: Partial<{ leftField: string; rightField: string }>,
) {
  const next = joinKeys.value.map((item, i) => (i === index ? { ...item, ...patch } : item))
  patchConfig({ keys: next })
}

function onFieldMapChange(value: string | number | null) {
  const map: Record<string, string> = {}
  String(value ?? '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [from, to] = pair.split(':').map((part) => part.trim())
      if (from && to) map[from] = to
    })
  patchConfig({ fieldMap: map })
}

function addMetric() {
  patchConfig({
    metrics: [
      ...groupMetrics.value,
      { field: '', fn: 'SUM', alias: `metric_${groupMetrics.value.length + 1}` },
    ],
  })
}

function removeMetric(index: number) {
  if (groupMetrics.value.length <= 1) return
  patchConfig({ metrics: groupMetrics.value.filter((_, i) => i !== index) })
}

function updateMetric(index: number, patch: Partial<CleanGroupByMetric>) {
  const next = groupMetrics.value.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  )
  patchConfig({ metrics: next })
}
</script>
