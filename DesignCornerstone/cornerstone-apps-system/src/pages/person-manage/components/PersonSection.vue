<template>
  <section class="person-section">
    <h3 class="person-section__title">{{ title }}</h3>
    <div class="person-section__body">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineOptions({ name: 'PersonSection' })

defineProps<{
  title: string
}>()
</script>

<style scoped>
.person-section {
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

@media (max-width: 1100px) {
  .person-section {
    grid-template-columns: 1fr;
  }
}
</style>
