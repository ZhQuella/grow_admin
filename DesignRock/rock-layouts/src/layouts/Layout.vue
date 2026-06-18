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
      <div class="box-border flex h-[50px] w-full items-center border-b border-solid border-border">
        <slot name="logo" />
      </div>
      <div class="relative flex-1 transition-all">
        <GrowScrollbar>
          <slot v-if="layoutType === 'side'" name="menu" />
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
        class="relative z-10 box-border flex h-[50px] shrink-0 items-center overflow-hidden border-b border-solid border-border bg-component px-[10px]"
        :class="layoutType === 'roof' ? 'justify-between gap-2' : 'justify-between'"
      >
        <template v-if="layoutType === 'roof'">
          <div class="-enter-y flex h-full min-w-0 flex-1 items-center overflow-hidden">
            <slot name="logo" />
            <div class="flex h-full shrink-0 items-center">
              <slot name="bread" />
            </div>
            <div class="h-full min-w-0 flex-1 overflow-hidden">
              <slot name="menu" />
            </div>
          </div>
          <div class="-enter-y flex h-full shrink-0 items-center gap-2">
            <slot name="option" />
          </div>
        </template>
        <template v-else>
          <div class="-enter-y flex h-full shrink-0 items-center">
            <slot name="bread" />
          </div>
          <div class="-enter-y flex h-full shrink-0 items-center gap-2">
            <slot name="option" />
          </div>
        </template>
      </div>
      <div
        class="box-border h-[40px] shrink-0 border-b border-solid border-border bg-component px-[10px] -enter-y"
      >
        <slot name="tab" />
      </div>
      <div
        class="relative min-h-0 flex-1 overflow-hidden bg-layout enter-y"
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
