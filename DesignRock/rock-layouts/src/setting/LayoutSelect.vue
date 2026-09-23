<script setup lang="ts">
import { SystemLayoutEnum, type SystemLayoutType } from '@grow-admin-rock/constants'
import { useI18n } from '@grow-admin-rock/locale'
import { useLayout } from '@grow-admin-rock/state'

const { t } = useI18n()
const { layoutType, selectLayoutType } = useLayout()

function onSelect(type: SystemLayoutType) {
  selectLayoutType(type)
}
</script>

<template>
  <GrowForm label-width="100px" label-position="left" class="mb-5">
    <GrowFormItem :label="t('layout.setting.layout')">
      <div class="flex flex-nowrap gap-[8px]">
        <button
          type="button"
          class="h-[56px] w-[56px] shrink-0 cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.ROOF ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutRoof')"
          :title="t('layout.setting.layoutRoof')"
          @click="onSelect(SystemLayoutEnum.ROOF)"
        >
          <div class="mb-[2px] h-[12px] bg-primary" />
          <div class="mb-[2px] h-[8px] bg-text-secondary opacity-60" />
          <div class="h-[24px] bg-layout" />
        </button>

        <button
          type="button"
          class="flex h-[56px] w-[56px] shrink-0 cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.SIDE ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutSide')"
          :title="t('layout.setting.layoutSide')"
          @click="onSelect(SystemLayoutEnum.SIDE)"
        >
          <div class="h-[48px] w-[16px] bg-primary" />
          <div class="ml-[2px] w-[30px]">
            <div class="mb-[2px] h-[8px] bg-text-secondary opacity-60" />
            <div class="h-[38px] bg-layout" />
          </div>
        </button>

        <button
          type="button"
          class="h-[56px] w-[56px] shrink-0 cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.MIXED ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutMixed')"
          :title="t('layout.setting.layoutMixed')"
          @click="onSelect(SystemLayoutEnum.MIXED)"
        >
          <div class="mb-[2px] h-[12px] bg-primary" />
          <div class="flex h-[34px]">
            <div class="w-[16px] bg-primary opacity-75" />
            <div class="ml-[2px] flex-1 bg-layout" />
          </div>
        </button>

        <button
          type="button"
          class="h-[56px] w-[56px] shrink-0 cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.DOUBLE_SIDE ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutDoubleSide')"
          :title="t('layout.setting.layoutDoubleSide')"
          @click="onSelect(SystemLayoutEnum.DOUBLE_SIDE)"
        >
          <div class="mb-[2px] h-[12px] bg-primary" />
          <div class="flex h-[34px]">
            <div class="w-[10px] bg-primary opacity-75" />
            <div class="ml-[2px] w-[14px] bg-primary opacity-55" />
            <div class="ml-[2px] flex-1 bg-layout" />
          </div>
        </button>
      </div>
    </GrowFormItem>
  </GrowForm>
</template>
