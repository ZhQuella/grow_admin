<template>
  <section class="person-section" :class="{ 'is-editable': canEdit }">
    <h3 class="person-section__title">{{ title }}</h3>
    <div class="person-section__body">
      <div v-if="canEdit || $slots.extra" class="person-section__extra">
        <slot name="extra">
          <template v-if="editing">
            <GrowButton link @click="emit('cancel')">取消</GrowButton>
            <GrowButton link type="primary" :loading="saving" @click="emit('save')">保存</GrowButton>
          </template>
          <GrowButton v-else link type="primary" @click="emit('edit', title)">编辑</GrowButton>
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
