<script setup lang="ts">
import { useLayout } from '@grow-admin-rock/state'


const { layoutType, isFullScreen, isPutAway, collapsed, onChangeSide } = useLayout()


</script>

<template>
  <div class="flex h-full">
    <div
      v-if="layoutType === 'side' && !isFullScreen"
      class="h-full flex w-[210px] shrink-0 grow-0 flex-col border-r border-solid border-border bg-component -enter-x transition-all duration-350"
      :class="[
        {
          'w-[210px]': !collapsed && isPutAway,
          'w-[65px]': collapsed && !isPutAway,
        },
      ]"
    >
      <div class="box-border h-[50px] border-b border-solid border-border">
        <slot name="logo" />
      </div>
      <div class="relative flex-1 transition-all">
        <GrowScrollbar>
          <slot name="menu" />
        </GrowScrollbar>
        <div
          class="side-show-btn max"
          :class="[
            {
              max: isPutAway,
              min: !isPutAway,
            },
          ]"
          @click="onChangeSide"
        />
      </div>
    </div>
    <div class="flex h-full w-[1px] flex-1 flex-col">
      <div
        v-if="!isFullScreen"
        class="box-border flex h-[50px] justify-between border-b border-solid border-border bg-component px-[10px]"
      >
        <div class="-enter-y flex shrink-0">
          <slot v-if="layoutType === 'roof'" name="logo" />
          <slot name="bread" />
        </div>
        <div class="relative -enter-y w-full grow-0 overflow-hidden px-[10px]">
          <slot v-if="layoutType === 'roof'" name="menu" />
        </div>
        <div class="-enter-y">
          <slot name="option" />
        </div>
      </div>
      <div
        class="box-border h-[40px] border-b border-solid border-border bg-component px-[10px] -enter-y"
      >
        <slot name="tab" />
      </div>
      <div
        class="relative flex-1 overflow-hidden bg-layout enter-y"
        :style="{
          height: `calc(100% - ${!isFullScreen ? 90 : 40}px)`,
        }"
      >
        <slot name="view" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$sode-deg: 5deg;

.side-show-btn {
  position: absolute;
  height: 100px;
  width: 5px;
  right: -13px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  &::after,
  &::before {
    content: "";
    display: block;
    height: 50%;
    width: 100%;
    position: absolute;
    border-radius: 3px;
    transition: all 0.35s;
    background-color: var(--text-color-secondary);
  }
  &::after {
    top: 0px;
    transform-origin: bottom center;
    border-radius: 3px 3px 0px 0px;
  }
  &::before {
    bottom: 0px;
    transform-origin: top center;
    border-radius: 0px 0px 3px 3px;
  }
  &.min {
    &:hover {
      &:hover {
        &::after {
          transform: rotate(-$sode-deg);
        }
        &::before {
          transform: rotate($sode-deg);
        }
      }
    }
  }
  &.max {
    &:hover {
      &::after {
        transform: rotate($sode-deg);
      }
      &::before {
        transform: rotate(-$sode-deg);
      }
    }
  }
}
</style>
