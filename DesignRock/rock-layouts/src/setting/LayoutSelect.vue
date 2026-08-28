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
      <div class="flex gap-[15px]">
        <button
          type="button"
          class="h-[70px] w-[70px] cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.ROOF ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutRoof')"
          :title="t('layout.setting.layoutRoof')"
          @click="onSelect(SystemLayoutEnum.ROOF)"
        >
          <div class="mb-[2px] h-[15px] bg-primary" />
          <div class="mb-[2px] h-[10px] bg-text-secondary opacity-60" />
          <div class="h-[33px] bg-layout" />
        </button>

        <button
          type="button"
          class="flex h-[70px] w-[70px] cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.SIDE ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutSide')"
          :title="t('layout.setting.layoutSide')"
          @click="onSelect(SystemLayoutEnum.SIDE)"
        >
          <div class="h-[62px] w-[20px] bg-primary" />
          <div class="ml-[2px] w-[40px]">
            <div class="mb-[2px] h-[10px] bg-text-secondary opacity-60" />
            <div class="h-[49px] bg-layout" />
          </div>
        </button>

        <button
          type="button"
          class="h-[70px] w-[70px] cursor-pointer overflow-hidden rounded-[4px] border-2 border-solid p-[2px] transition-colors"
          :class="layoutType === SystemLayoutEnum.MIXED ? 'border-primary' : 'border-border'"
          :aria-label="t('layout.setting.layoutMixed')"
          :title="t('layout.setting.layoutMixed')"
          @click="onSelect(SystemLayoutEnum.MIXED)"
        >
          <div class="mb-[2px] h-[15px] bg-primary" />
          <div class="flex h-[45px]">
            <div class="w-[20px] bg-primary opacity-75" />
            <div class="ml-[2px] flex-1 bg-layout" />
          </div>
        </button>
      </div>
    </GrowFormItem>
  </GrowForm>
</template>
