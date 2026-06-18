<template>
  <GrowDropdown
    trigger="hover"
    placement="bottom-end"
    :show-arrow="false"
    class="inline-block"
    @command="handleCommand"
  >
    <div
      class="inline-flex cursor-pointer items-center justify-center"
      :aria-label="displayName"
      :title="displayName"
    >
      <GrowAvatar
        v-if="hasAvatar"
        :size="32"
        :src="avatar"
      />
      <span
        v-else
        class="grid-center h-8 w-8 shrink-0 rounded-full bg-primary-a12 text-primary leading-none"
      >
        <GrowIconify
          icon="ant-design:user-outlined"
          :size="16"
          class="!flex !items-center !justify-center leading-none [&_svg]:block [&_svg]:h-4 [&_svg]:w-4"
        />
      </span>
    </div>

    <template #dropdown>
      <GrowDropdownMenu
        class="w-max min-w-[180px] py-1 [&_.el-dropdown-menu\_\_item]:flex [&_.el-dropdown-menu\_\_item]:justify-start [&_.el-dropdown-menu\_\_item]:px-3 [&_.el-dropdown-menu\_\_item]:py-[5px] [&_.el-dropdown-menu\_\_item]:leading-[22px]"
      >
        <GrowDropdownItem
          disabled
          class="!cursor-default !opacity-100 [&.is-disabled]:!cursor-default [&.is-disabled]:!opacity-100"
        >
          <div class="py-0.5 leading-snug">
            <div class="text-sm font-semibold text-text whitespace-nowrap">
              {{ displayName }}
            </div>
            <div
              v-if="deptName"
              class="mt-0.5 text-xs text-text-secondary whitespace-nowrap"
            >
              {{ deptName }}
            </div>
          </div>
        </GrowDropdownItem>
        <GrowDropdownItem command="logout" divided>
          <span class="flex w-full items-center text-sm leading-[22px]">
            <span class="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-secondary">
              <GrowIconify icon="ant-design:logout-outlined" :size="15" />
            </span>
            <span class="flex-1 text-left whitespace-nowrap">
              {{ t('layout.user.logout') }}
            </span>
          </span>
        </GrowDropdownItem>
      </GrowDropdownMenu>
    </template>

    <template #overlay>
      <GrowMenu
        class="w-max min-w-[180px] py-1 [&_.ant-menu-item]:flex [&_.ant-menu-item]:items-center [&_.ant-menu-item]:justify-start [&_.ant-menu-item]:h-auto [&_.ant-menu-item]:m-0 [&_.ant-menu-item]:px-3 [&_.ant-menu-item]:py-[5px] [&_.ant-menu-item]:leading-[22px]"
        @click="handleAntMenuClick"
      >
        <GrowMenuItem
          disabled
          class="!cursor-default !opacity-100 [&.ant-menu-item-disabled]:!cursor-default [&.ant-menu-item-disabled]:!opacity-100"
        >
          <div class="py-0.5 leading-snug">
            <div class="text-sm font-semibold text-text whitespace-nowrap">
              {{ displayName }}
            </div>
            <div
              v-if="deptName"
              class="mt-0.5 text-xs text-text-secondary whitespace-nowrap"
            >
              {{ deptName }}
            </div>
          </div>
        </GrowMenuItem>
        <GrowMenuItem
          key="logout"
          class="!mt-1 !border-t !border-border !pt-[9px]"
        >
          <span class="flex w-full items-center text-sm leading-[22px]">
            <span class="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-text-secondary">
              <GrowIconify icon="ant-design:logout-outlined" :size="15" />
            </span>
            <span class="flex-1 text-left whitespace-nowrap">
              {{ t('layout.user.logout') }}
            </span>
          </span>
        </GrowMenuItem>
      </GrowMenu>
    </template>
  </GrowDropdown>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { UserInfo } from '@grow-admin-rock/types'
import { useI18n } from '@grow-admin-rock/locale'

const props = defineProps<{
  userInfo?: UserInfo | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()

const displayName = computed(
  () => props.userInfo?.realname || props.userInfo?.username || '',
)
const deptName = computed(() => props.userInfo?.deptName || '')
const avatar = computed(() => props.userInfo?.avatar || '')
const hasAvatar = computed(() => !!props.userInfo?.avatar)

function handleCommand(command: string | number) {
  if (String(command) === 'logout') {
    emit('logout')
  }
}

function handleAntMenuClick(info: { key: string | number }) {
  if (String(info.key) === 'logout') {
    emit('logout')
  }
}
</script>
