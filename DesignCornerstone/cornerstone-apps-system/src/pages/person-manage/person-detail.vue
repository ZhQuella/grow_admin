<template>
  <div class="person-detail">
    <div class="person-detail__body">
      <GrowScrollbar height="100%">
        <div v-if="loading" class="person-detail__hint">加载中…</div>
        <div v-else-if="!detail" class="person-detail__hint">未找到该人员</div>
        <div v-else class="person-detail__content">
          <PersonSection v-for="section in sections" :key="section.title" :title="section.title">
            <GrowRow :gutter="16">
              <GrowCol
                v-for="item in section.fields"
                :key="item.label"
                :span="item.span === 3 ? 24 : item.span === 2 ? 8 : 4"
              >
                <div class="person-detail__item">
                  <div class="person-detail__label">{{ item.label }}</div>
                  <div class="person-detail__value">
                    <SensitiveText
                      v-if="item.sensitive"
                      :value="item.raw"
                      :masked="item.value"
                    />
                    <GrowTag v-else-if="item.tag" :type="item.tag" size="small">
                      {{ item.value }}
                    </GrowTag>
                    <span v-else>{{ item.value }}</span>
                  </div>
                </div>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="家庭信息">
            <div
              v-for="row in familyRows"
              :key="row.id"
              class="person-detail__family"
            >
              <GrowRow :gutter="16">
                <GrowCol :span="4">
                  <div class="person-detail__item">
                    <div class="person-detail__label">姓名</div>
                    <div class="person-detail__value">{{ row.name }}</div>
                  </div>
                </GrowCol>
                <GrowCol :span="4">
                  <div class="person-detail__item">
                    <div class="person-detail__label">关系</div>
                    <div class="person-detail__value">{{ row.relation }}</div>
                  </div>
                </GrowCol>
                <GrowCol :span="4">
                  <div class="person-detail__item">
                    <div class="person-detail__label">性别</div>
                    <div class="person-detail__value">{{ row.gender }}</div>
                  </div>
                </GrowCol>
                <GrowCol :span="4">
                  <div class="person-detail__item">
                    <div class="person-detail__label">生日</div>
                    <div class="person-detail__value">{{ row.birthday }}</div>
                  </div>
                </GrowCol>
                <GrowCol :span="4">
                  <div class="person-detail__item">
                    <div class="person-detail__label">电话</div>
                    <div class="person-detail__value">{{ row.phone }}</div>
                  </div>
                </GrowCol>
              </GrowRow>
            </div>
          </PersonSection>

          <PersonSection title="个人材料">
            <div class="person-detail__materials">
              <div v-for="key in MATERIAL_KEYS" :key="key" class="person-detail__material">
                <div class="person-detail__material-label">{{ MATERIAL_LABELS[key] }}</div>
                <div class="person-detail__material-card">
                  <img
                    v-if="detail.materials?.[key]?.url"
                    :src="detail.materials[key]?.url"
                    :alt="MATERIAL_LABELS[key]"
                  >
                  <span v-else>未上传</span>
                </div>
              </div>
            </div>
          </PersonSection>

          <PersonSection title="人事历史">
            <div v-if="!historyRows.length" class="person-detail__empty">暂无历史记录</div>
            <GrowTimeline v-else class="person-detail__timeline">
              <GrowTimelineItem
                v-for="(item, index) in historyRows"
                :key="item.id"
                :timestamp="item.effectiveDate || formatTime(item.createdAt)"
                :type="historyTag(item.type)"
                :hollow="index !== 0"
                placement="top"
              >
                <div class="person-detail__history-card">
                  <GrowTag :type="historyTag(item.type)" size="small">{{ item.title }}</GrowTag>
                  <p class="person-detail__history-summary">{{ item.summary }}</p>
                  <div class="person-detail__history-meta">
                    {{ item.operator }} · {{ formatTime(item.createdAt) }}
                  </div>
                </div>
              </GrowTimelineItem>
            </GrowTimeline>
          </PersonSection>
        </div>
      </GrowScrollbar>
    </div>

    <div class="person-detail__bar">
      <GrowSpace>
        <GrowButton @click="onBack">返回</GrowButton>
        <GrowButton type="primary" @click="openEdit">编辑</GrowButton>
      </GrowSpace>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  MATERIAL_KEYS,
  MATERIAL_LABELS,
  type PersonEventType,
} from '../../types/systemPerson'
import PersonSection from './components/PersonSection.vue'
import SensitiveText from './components/SensitiveText.vue'
import { formatTime } from './use/helpers'
import { usePersonDetail } from './use/usePersonDetail'

defineOptions({ name: 'PersonDetailPage' })

const {
  loading,
  detail,
  sections,
  familyRows,
  historyRows,
  onBack,
  openEdit,
} = usePersonDetail()

function historyTag(type: PersonEventType | string) {
  if (type === 'resign') return 'danger'
  if (type === 'transfer') return 'warning'
  if (type === 'confirm') return 'success'
  if (type === 'reinstate') return 'primary'
  return 'info'
}
</script>

<style scoped>
.person-detail {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
  background: var(--layout-container-background-color);
}

.person-detail__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--component-background-color);
}

.person-detail__content {
  padding: 8px 20px 32px;
}

.person-detail__item {
  margin-bottom: 12px;
}

.person-detail__label {
  margin-bottom: 6px;
  color: var(--text-color-secondary);
  font-size: 13px;
  line-height: 22px;
}

.person-detail__value {
  min-height: 22px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.person-detail__hint,
.person-detail__empty {
  padding: 24px 0;
  color: var(--text-color-secondary);
  text-align: center;
}

.person-detail__empty {
  padding: 8px 0;
  text-align: left;
  font-size: 13px;
}

.person-detail__family + .person-detail__family {
  margin-top: 8px;
}

.person-detail__bar {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: flex-end;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid var(--layout-border-color);
  border-radius: 0 0 8px 8px;
  background: var(--component-background-color);
}

.person-detail__materials {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.person-detail__material {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.person-detail__material-label,
.person-detail__material-name {
  width: 100%;
  overflow: hidden;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-detail__material-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border: 1px dashed var(--layout-border-color);
  border-radius: 8px;
  color: var(--text-color-secondary);
  background: var(--layout-container-background-color);
  font-size: 12px;
}

.person-detail__material-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-detail__timeline {
  padding: 4px 0 0 4px;
}

.person-detail__history-card {
  padding-bottom: 4px;
}

.person-detail__history-summary {
  margin: 8px 0 0;
  line-height: 1.5;
}

.person-detail__history-meta {
  margin-top: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .person-detail__materials {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
