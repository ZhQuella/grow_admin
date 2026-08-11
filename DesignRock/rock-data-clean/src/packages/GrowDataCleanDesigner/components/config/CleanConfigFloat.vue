<template>
  <aside
    v-if="visible"
    class="absolute bottom-2.5 right-2.5 top-2.5 z-30 box-border flex w-[400px] min-h-0 flex-col overflow-hidden rounded-md border border-solid border-border bg-component shadow-card"
    @click.stop
  >
    <div
      class="box-border flex h-10 w-full shrink-0 flex-nowrap items-center border-b border-solid border-border py-0 pl-3 pr-2"
    >
      <h4
        class="m-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-[30px] text-text"
        :title="title"
      >
        {{ title }}
      </h4>
      <div class="ml-auto flex w-auto shrink-0 flex-nowrap items-center justify-end p-0">
        <GrowButton
          text
          size="small"
          class="!h-7 !max-w-7 !min-w-7 !w-7 !shrink-0 !p-0 text-text-secondary"
          title="关闭"
          @click="$emit('close')"
        >
          <GrowIconify icon="carbon:close" :size="15" />
        </GrowButton>
      </div>
    </div>
    <div class="box-border flex min-h-0 flex-1 flex-col overflow-hidden">
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CleanConfigFloat',
})

defineProps<{
  visible: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>
