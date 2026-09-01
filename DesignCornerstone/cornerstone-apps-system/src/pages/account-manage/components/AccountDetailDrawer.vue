<template>
  <GrowDrawer
    v-model="visible"
    :title="detail ? `账号详情 · ${detail.username}` : '账号详情'"
    size="520px"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="account-detail__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <p v-if="loading" class="account-detail__hint">加载中…</p>
          <div v-else-if="detail" class="account-detail">
      <section class="account-detail__section">
        <h4 class="account-detail__title">基本信息</h4>
        <dl class="account-detail__dl">
          <div><dt>账号名称</dt><dd>{{ detail.username }}</dd></div>
          <div><dt>昵称</dt><dd>{{ detail.nickname || '-' }}</dd></div>
          <div>
            <dt>状态</dt>
            <dd>
              <GrowTag :type="detail.enabled ? 'success' : 'danger'" size="small">
                {{ detail.enabled ? '启用' : '停用' }}
              </GrowTag>
            </dd>
          </div>
          <div><dt>绑定人员</dt><dd>{{ detail.personName || '未绑定' }}</dd></div>
          <div><dt>人员状态</dt><dd>{{ detail.personStatus ? accountPersonStatusLabel(detail.personStatus) : '-' }}</dd></div>
          <div><dt>部门</dt><dd>{{ detail.deptName || '-' }}</dd></div>
          <div><dt>手机号</dt><dd>{{ detail.mobile || '-' }}</dd></div>
          <div><dt>邮箱</dt><dd>{{ detail.email || '-' }}</dd></div>
          <div><dt>最近登录</dt><dd>{{ formatTime(detail.lastLoginAt) }}</dd></div>
          <div><dt>更新时间</dt><dd>{{ formatTime(detail.updatedAt) }}</dd></div>
          <div class="account-detail__span"><dt>备注</dt><dd>{{ detail.remark || '-' }}</dd></div>
        </dl>
      </section>

      <section class="account-detail__section">
        <h4 class="account-detail__title">绑定角色</h4>
        <div v-if="!detail.roles.length" class="account-detail__hint">暂未绑定角色</div>
        <div v-else class="account-detail__tags">
          <GrowTag v-for="role in detail.roles" :key="role.id" size="small" type="info">
            {{ role.name }}
          </GrowTag>
        </div>
      </section>
          </div>
        </GrowScrollbar>
      </template>
    </GrowWatchBox>
    <template #footer>
      <GrowButton @click="visible = false">关闭</GrowButton>
    </template>
  </GrowDrawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { GrowWatchBox } from '@grow-admin-rock/components/watch-box'
import { getSystemAccountDetail } from '../../../api/systemAccount'
import type { SystemAccountDetail, SystemAccountListItem } from '../../../types/systemAccount'
import { accountPersonStatusLabel, formatTime, toMessage } from '../use/helpers'

defineOptions({ name: 'AccountDetailDrawer' })

const message = useMsg()
const visible = ref(false)
const loading = ref(false)
const detail = ref<SystemAccountDetail | null>(null)

async function open(row: SystemAccountListItem) {
  detail.value = null
  visible.value = true
  loading.value = true
  try {
    detail.value = await getSystemAccountDetail(row.accountId)
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.account-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.account-detail__watch {
  height: 100%;
  min-height: 240px;
}

.account-detail__section {
  padding: 12px;
  border-radius: 8px;
  background: var(--layout-container-background-color);
}

.account-detail__title {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.account-detail__dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: 0;
}

.account-detail__dl div {
  min-width: 0;
}

.account-detail__span {
  grid-column: 1 / -1;
}

.account-detail__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.account-detail__dl dd {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  word-break: break-all;
}

.account-detail__hint {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.account-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
