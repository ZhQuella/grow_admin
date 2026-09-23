<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@grow-admin-rock/state'

const {
  isFullScreen,
  isPutAway,
  collapsed,
  onChangeSide,
  isSideLayout,
  isRoofLayout,
  isMixedLayout,
  isDoubleSideLayout,
} = useLayout()

const activeRootMenu = ref('')
const mixedMenuHasChildren = ref(false)

function selectRootMenu(name: string, hasChildren: boolean, revealChildren = false) {
  activeRootMenu.value = name
  mixedMenuHasChildren.value = hasChildren
  if (isDoubleSideLayout.value && revealChildren && hasChildren && !isPutAway.value) {
    onChangeSide()
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div
      v-if="!isFullScreen && (isRoofLayout || isMixedLayout || isDoubleSideLayout)"
      class="relative z-10 box-border flex h-[50px] shrink-0 items-center justify-between gap-2 overflow-hidden border-b border-solid border-border bg-component px-[10px]"
    >
      <div class="-enter-y flex h-full min-w-0 flex-1 items-center overflow-hidden">
        <slot name="logo" />
        <div class="flex h-full shrink-0 items-center">
          <slot name="bread" />
        </div>
        <div
          v-if="!isDoubleSideLayout"
          class="h-full min-w-0 flex-1 overflow-hidden"
          :class="isMixedLayout ? 'ml-4' : ''"
        >
          <slot
            name="menu"
            :menu-level="isMixedLayout ? 'first' : 'all'"
            :active-root-menu="activeRootMenu"
            :select-root-menu="selectRootMenu"
          />
        </div>
      </div>
      <div class="-enter-y flex h-full shrink-0 items-center gap-2">
        <slot name="option" />
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1">
      <div
        v-if="!isFullScreen && isDoubleSideLayout"
        class="h-full flex w-[65px] shrink-0 grow-0 flex-col border-r border-solid border-border bg-component -enter-x"
      >
        <GrowScrollbar class="h-full">
          <slot
            name="menu"
            menu-level="first"
            :active-root-menu="activeRootMenu"
            :select-root-menu="selectRootMenu"
          />
        </GrowScrollbar>
      </div>

      <div
        v-if="!isFullScreen && (isSideLayout || ((isMixedLayout || isDoubleSideLayout) && mixedMenuHasChildren))"
        class="h-full flex shrink-0 grow-0 flex-col border-r border-solid border-border bg-component -enter-x transition-all duration-350"
        :class="[
          {
            'w-[210px]': isPutAway,
            'w-[65px]': !isDoubleSideLayout && collapsed && !isPutAway,
            'w-0 border-r-0': isDoubleSideLayout && !isPutAway,
          },
        ]"
      >
        <div
          v-if="isSideLayout"
          class="box-border flex h-[50px] w-full items-center border-b border-solid border-border"
        >
          <slot name="logo" />
        </div>
        <div class="relative min-h-0 flex-1 transition-all">
          <GrowScrollbar v-if="!isDoubleSideLayout || isPutAway" class="h-full">
            <slot
              name="menu"
              :menu-level="isMixedLayout || isDoubleSideLayout ? 'children' : 'all'"
              :active-root-menu="activeRootMenu"
              :select-root-menu="selectRootMenu"
            />
          </GrowScrollbar>
          <div
            v-if="!isDoubleSideLayout"
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

      <div
        v-if="!isFullScreen && isDoubleSideLayout && mixedMenuHasChildren"
        class="side-show-btn side-show-btn--double max"
        :class="[
          {
            max: isPutAway,
            min: !isPutAway,
          },
        ]"
        :style="{ left: isPutAway ? '279px' : '69px' }"
        @click="onChangeSide"
      />

      <div class="flex h-full w-[1px] flex-1 flex-col">
        <div
          v-if="!isFullScreen && isSideLayout"
          class="relative z-10 box-border flex h-[50px] shrink-0 items-center justify-between overflow-hidden border-b border-solid border-border bg-component px-[10px]"
        >
          <div class="-enter-y flex h-full shrink-0 items-center">
            <slot name="bread" />
          </div>
          <div class="-enter-y flex h-full shrink-0 items-center gap-2">
            <slot name="option" />
          </div>
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
  </div>
</template>

<style lang="scss" scoped>
$sode-deg: 5deg;

.side-show-btn {
  position: absolute;
  z-index: 20;
  height: 100px;
  width: 5px;
  right: -9px;
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

.side-show-btn--double {
  right: auto;
  transition: left 0.35s;
}
</style>
