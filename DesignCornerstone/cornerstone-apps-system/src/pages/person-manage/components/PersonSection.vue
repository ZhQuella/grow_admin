<template>
  <section class="person-section" :class="{ 'is-editable': canEdit }">
    <h3 class="person-section__title">{{ title }}</h3>
    <div class="person-section__body">
      <div v-if="canEdit || $slots.extra" class="person-section__extra">
        <slot name="extra">
          <template v-if="editing">
            <GrowTooltip content="取消" placement="top">
              <GrowButton link @click="emit('cancel')">
                <GrowIconify icon="ant-design:close-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
            <GrowTooltip content="保存" placement="top">
              <GrowButton link type="primary" :loading="saving" @click="emit('save')">
                <GrowIconify icon="ant-design:check-outlined" :size="16" />
              </GrowButton>
            </GrowTooltip>
          </template>
          <GrowTooltip v-else content="编辑" placement="top">
            <GrowButton link type="primary" @click="emit('edit', title)">
              <GrowIconify icon="ant-design:edit-outlined" :size="16" />
            </GrowButton>
          </GrowTooltip>
        </slot>
      </div>
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineOptions({ name: 'PersonSection' })

defineProps<{
  title: string
  canEdit?: boolean
  editing?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  edit: [title: string]
  save: []
  cancel: []
}>()
</script>

<style scoped>
.person-section {
  position: relative;
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 8px 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.person-section:last-child {
  border-bottom: 0;
}

.person-section__title {
  margin: 0;
  padding-top: 6px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.person-section__body {
  min-width: 0;
}

.person-section.is-editable .person-section__body {
  padding-top: 28px;
}

.person-section__extra {
  position: absolute;
  top: 16px;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: 22px;
}

@media (max-width: 1100px) {
  .person-section {
    grid-template-columns: 1fr;
  }
}
</style>
