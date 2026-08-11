<template>
  <div>
    <div class="mb-1.5 text-xs font-medium text-text">设置人员</div>
    <div class="mb-3 grid grid-cols-2 gap-x-2 gap-y-2">
      <label
        v-for="opt in PERSON_ASSIGNEE_TYPE_OPTIONS"
        :key="opt.value"
        class="inline-flex min-w-0 cursor-pointer items-center gap-1.5 text-xs text-text"
      >
        <input
          type="radio"
          class="shrink-0 accent-[var(--el-color-primary,#409eff)]"
          :name="radioName"
          :value="opt.value"
          :checked="normalizedType === opt.value"
          @change="onTypeChange(opt.value)"
        />
        <span class="truncate">{{ opt.label }}</span>
        <span
          v-if="opt.hint"
          class="inline-flex shrink-0 text-text-secondary"
          :title="opt.hint"
        >
          <GrowIconify icon="carbon:help" :size="12" />
        </span>
      </label>
    </div>

    <GrowForm label-width="84px" label-position="left" size="small" :show-message="false">
      <!-- 指定成员 -->
      <template v-if="normalizedType === 'user'">
        <GrowFormItem :label="valueLabel">
          <GrowInput
            :model-value="value || ''"
            size="small"
            placeholder="成员账号，多人逗号分隔"
            @update:model-value="(v) => emitValue(String(v ?? ''))"
          />
        </GrowFormItem>
        <GrowFormItem v-if="showCandidates" label="候选人">
          <GrowInput
            :model-value="candidates || ''"
            size="small"
            placeholder="可选候选人，逗号分隔"
            @update:model-value="(v) => emitChange({ candidates: String(v ?? '') })"
          />
        </GrowFormItem>
      </template>

      <!-- 发起人自选 -->
      <template v-else-if="normalizedType === 'initiator-select'">
        <GrowFormItem label="可选范围">
          <GrowSelect
            :model-value="extras.selectScope || 'all'"
            :options="SELECT_SCOPE_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ selectScope: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem
          v-if="extras.selectScope === 'role' || extras.selectScope === 'users'"
          :label="extras.selectScope === 'role' ? '角色' : '成员'"
        >
          <GrowInput
            :model-value="extras.selectScopeValue || ''"
            size="small"
            :placeholder="extras.selectScope === 'role' ? '角色编码' : '成员账号，逗号分隔'"
            @update:model-value="(v) => emitChange({ selectScopeValue: String(v ?? '') })"
          />
        </GrowFormItem>
        <GrowFormItem label="最少人数">
          <GrowInput
            :model-value="String(extras.selectMin ?? 1)"
            size="small"
            @update:model-value="(v) => emitChange({ selectMin: Math.max(1, Number(v) || 1) })"
          />
        </GrowFormItem>
        <GrowFormItem label="最多人数">
          <GrowInput
            :model-value="String(extras.selectMax ?? 1)"
            size="small"
            placeholder="0=不限"
            @update:model-value="(v) => emitChange({ selectMax: Number(v) || 0 })"
          />
        </GrowFormItem>
      </template>

      <!-- 角色 -->
      <template v-else-if="normalizedType === 'role'">
        <GrowFormItem label="角色">
          <GrowInput
            :model-value="value || ''"
            size="small"
            placeholder="角色编码，多个逗号分隔"
            @update:model-value="(v) => emitValue(String(v ?? ''))"
          />
        </GrowFormItem>
      </template>

      <!-- 直属主管 -->
      <template v-else-if="normalizedType === 'direct-supervisor'">
        <GrowFormItem label="相对谁">
          <GrowSelect
            :model-value="extras.relativeTo || 'initiator'"
            :options="RELATIVE_TO_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ relativeTo: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem v-if="extras.relativeTo === 'form-field'" label="表单字段">
          <GrowInput
            :model-value="extras.relativeField || ''"
            size="small"
            placeholder="存用户 ID 的字段名"
            @update:model-value="(v) => emitChange({ relativeField: String(v ?? '') })"
          />
        </GrowFormItem>
        <GrowFormItem label="含副职">
          <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
            <GrowCheckbox
              :model-value="!!extras.includeDeputy"
              @update:model-value="(v) => emitChange({ includeDeputy: !!v })"
            />
            一并纳入副职 / 代理人
          </label>
        </GrowFormItem>
      </template>

      <!-- 部门主管 -->
      <template v-else-if="normalizedType === 'dept-manager'">
        <GrowFormItem label="部门来源">
          <GrowSelect
            :model-value="extras.deptFrom || 'initiator'"
            :options="DEPT_FROM_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ deptFrom: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem
          v-if="extras.deptFrom === 'form-field' || extras.deptFrom === 'specified'"
          :label="extras.deptFrom === 'form-field' ? '表单字段' : '部门'"
        >
          <GrowInput
            :model-value="extras.deptFromValue || ''"
            size="small"
            :placeholder="extras.deptFrom === 'form-field' ? '部门字段名' : '部门 ID'"
            @update:model-value="(v) => emitChange({ deptFromValue: String(v ?? '') })"
          />
        </GrowFormItem>
        <GrowFormItem label="组织层级">
          <GrowSelect
            :model-value="extras.deptLevel || 'current'"
            :options="DEPT_LEVEL_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ deptLevel: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem v-if="extras.deptLevel === 'level-n'" label="向上层数">
          <GrowInput
            :model-value="String(extras.deptLevelN ?? 1)"
            size="small"
            placeholder="1=本级，2=上一级…"
            @update:model-value="(v) => emitChange({ deptLevelN: Math.max(1, Number(v) || 1) })"
          />
        </GrowFormItem>
        <GrowFormItem label="含副职">
          <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
            <GrowCheckbox
              :model-value="!!extras.includeDeputy"
              @update:model-value="(v) => emitChange({ includeDeputy: !!v })"
            />
            一并纳入副职 / 代理人
          </label>
        </GrowFormItem>
      </template>

      <!-- 连续多级主管 -->
      <template v-else-if="normalizedType === 'multi-level-supervisor'">
        <GrowFormItem label="相对谁">
          <GrowSelect
            :model-value="extras.relativeTo || 'initiator'"
            :options="RELATIVE_TO_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ relativeTo: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem v-if="extras.relativeTo === 'form-field'" label="表单字段">
          <GrowInput
            :model-value="extras.relativeField || ''"
            size="small"
            placeholder="存用户 ID 的字段名"
            @update:model-value="(v) => emitChange({ relativeField: String(v ?? '') })"
          />
        </GrowFormItem>
        <GrowFormItem label="结束方式">
          <GrowSelect
            :model-value="extras.supervisorEnd || 'levels'"
            :options="SUPERVISOR_END_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ supervisorEnd: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem v-if="extras.supervisorEnd === 'levels'" label="向上级数">
          <GrowInput
            :model-value="String(extras.supervisorLevels ?? 2)"
            size="small"
            @update:model-value="(v) => emitChange({ supervisorLevels: Math.max(1, Number(v) || 1) })"
          />
        </GrowFormItem>
        <GrowFormItem v-if="extras.supervisorEnd === 'until-role'" label="直到角色">
          <GrowInput
            :model-value="extras.supervisorUntilRole || ''"
            size="small"
            placeholder="如 director / VP"
            @update:model-value="(v) => emitChange({ supervisorUntilRole: String(v ?? '') })"
          />
        </GrowFormItem>
        <GrowFormItem label="审批方式">
          <GrowSelect
            :model-value="extras.supervisorMode || 'sequential'"
            :options="SUPERVISOR_MODE_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ supervisorMode: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem label="跳过重复">
          <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
            <GrowCheckbox
              :model-value="extras.skipDuplicate !== false"
              @update:model-value="(v) => emitChange({ skipDuplicate: !!v })"
            />
            与上一审批人相同时跳过
          </label>
        </GrowFormItem>
        <GrowFormItem label="跳过本人">
          <label class="inline-flex items-center gap-1 pt-0.5 text-xs text-text">
            <GrowCheckbox
              :model-value="extras.skipIfInitiator !== false"
              @update:model-value="(v) => emitChange({ skipIfInitiator: !!v })"
            />
            主管即发起人时继续向上
          </label>
        </GrowFormItem>
      </template>

      <!-- 找不到人兜底：主管类 / 角色 -->
      <template
        v-if="
          normalizedType === 'role' ||
          normalizedType === 'direct-supervisor' ||
          normalizedType === 'dept-manager' ||
          normalizedType === 'multi-level-supervisor'
        "
      >
        <GrowFormItem label="无人时">
          <GrowSelect
            :model-value="extras.emptyFallback || 'error'"
            :options="EMPTY_FALLBACK_OPTIONS"
            size="small"
            class="w-full"
            @update:model-value="(v) => emitChange({ emptyFallback: String(v) })"
          />
        </GrowFormItem>
        <GrowFormItem
          v-if="extras.emptyFallback === 'to-user' || extras.emptyFallback === 'to-role'"
          :label="extras.emptyFallback === 'to-user' ? '兜底成员' : '兜底角色'"
        >
          <GrowInput
            :model-value="extras.emptyFallbackValue || ''"
            size="small"
            @update:model-value="(v) => emitChange({ emptyFallbackValue: String(v ?? '') })"
          />
        </GrowFormItem>
      </template>
    </GrowForm>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DEPT_FROM_OPTIONS,
  DEPT_LEVEL_OPTIONS,
  EMPTY_FALLBACK_OPTIONS,
  PERSON_ASSIGNEE_TYPE_OPTIONS,
  RELATIVE_TO_OPTIONS,
  SELECT_SCOPE_OPTIONS,
  SUPERVISOR_END_OPTIONS,
  SUPERVISOR_MODE_OPTIONS,
} from '../../static/nodeCatalog'
import type { ProcessAssigneeType, ProcessPersonAssignExtras } from '../../types'

defineOptions({
  name: 'ProcessPersonAssigneeFields',
})

const props = withDefaults(
  defineProps<{
    assigneeType?: ProcessAssigneeType | string
    value?: string
    candidates?: string
    valueLabel?: string
    valueKey?: string
    showCandidates?: boolean
    extras?: ProcessPersonAssignExtras
  }>(),
  {
    valueLabel: '成员',
    valueKey: 'assignee',
    showCandidates: false,
    extras: () => ({}),
  },
)

const emit = defineEmits<{
  change: [patch: Record<string, unknown>]
}>()

const radioName = `person-assignee-${Math.random().toString(36).slice(2, 9)}`

const LEGACY_TYPE_MAP: Record<string, ProcessAssigneeType> = {
  'initiator-leader': 'direct-supervisor',
  dept: 'dept-manager',
  expression: 'user',
}

const normalizedType = computed(() => {
  const raw = String(props.assigneeType || 'user')
  return LEGACY_TYPE_MAP[raw] || (raw as ProcessAssigneeType)
})

function emitChange(patch: Record<string, unknown>) {
  emit('change', patch)
}

function emitValue(value: string) {
  emitChange({ [props.valueKey]: value })
}

function onTypeChange(type: string) {
  emitChange({ assigneeType: type })
}
</script>
