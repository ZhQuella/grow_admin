<template>
  <div class="prop-carousel-items">
    <GrowBadge
      class="prop-carousel-items__badge"
      :value="itemCount"
      :hidden="itemCount <= 0"
    >
      <GrowButton type="primary" size="small" @click="visible = true">
        设置轮播项
      </GrowButton>
    </GrowBadge>

    <CarouselItemsDialog
      v-model:visible="visible"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { findByUUID } from '@grow-admin-rock/utils'
import { ACTIVE_UUID, DRAGGABLE_CONGIG } from '../../config/designation'
import CarouselItemsDialog from './CarouselItemsDialog.vue'
import type { CarouselItemDraft } from './types'

defineOptions({ name: 'PropCarouselItems' })

const draggableConfig: any = inject(DRAGGABLE_CONGIG)
const activeUUID = inject(ACTIVE_UUID) as Ref<string>
const visible = ref(false)

const parentStructure = computed(() =>
  findByUUID(draggableConfig?.structures || [], activeUUID?.value),
)

const itemCount = computed(
  () => parentStructure.value?.children?.length || 0,
)

const onConfirm = (_items: CarouselItemDraft[]) => {
  // 弹窗内已直接写回 structure / props，这里仅关闭
  visible.value = false
}
</script>

<style scoped lang="scss">
.prop-carousel-items {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.prop-carousel-items__badge {
  flex-shrink: 0;
  line-height: 1;
}
</style>
