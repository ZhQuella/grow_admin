<template>
  <GrowDrawer
    v-model="visible"
    :title="detail ? `岗位详情 · ${detail.name}` : '岗位详情'"
    size="min(1040px, 96%)"
    append-to-body
    destroy-on-close
  >
    <GrowWatchBox class="post-detail__watch">
      <template #default="{ height }">
        <GrowScrollbar v-if="height > 0" :height="`${height}px`">
          <p v-if="loading" class="post-detail__hint">加载中…</p>
          <div v-else-if="detail" class="post-detail">
            <header class="post-detail__hero">
              <div>
                <h3>{{ detail.name }}</h3>
                <p>{{ detail.code }} · {{ detail.deptName || '未分配部门' }}</p>
              </div>
              <GrowTag :type="detail.enabled ? 'success' : 'info'" size="small">
                {{ detail.enabled ? '启用' : '停用' }}
              </GrowTag>
            </header>

            <GrowAlert
              v-if="detail.overstaffed > 0"
              type="warning"
              :closable="false"
              title="当前岗位已超出编制人数，系统仅做提示，不阻止继续分配人员。"
              class="post-detail__alert"
            />

            <section class="post-detail__section">
              <h4>编制统计</h4>
              <dl class="post-detail__metrics">
                <div><dt>全职编制</dt><dd>{{ detail.formalHeadcount }}</dd></div>
                <div><dt>兼职编制</dt><dd>{{ detail.partTimeHeadcount }}</dd></div>
                <div><dt>实习编制</dt><dd>{{ detail.internHeadcount }}</dd></div>
                <div><dt>外包编制</dt><dd>{{ detail.contractorHeadcount }}</dd></div>
                <div><dt>当前在岗人数</dt><dd>{{ detail.occupied }}</dd></div>
                <div><dt>空缺人数</dt><dd>{{ detail.vacancy }}</dd></div>
                <div><dt>超编人数</dt><dd :class="{ 'post-detail__over': detail.overstaffed > 0 }">{{ detail.overstaffed }}</dd></div>
              </dl>
            </section>

            <section class="post-detail__section">
              <h4>基础信息</h4>
              <dl class="post-detail__dl">
                <div><dt>岗位名称</dt><dd>{{ detail.name }}</dd></div>
                <div><dt>岗位编码</dt><dd>{{ detail.code }}</dd></div>
                <div><dt>所属部门</dt><dd>{{ detail.deptName || '-' }}</dd></div>
                <div><dt>岗位类型</dt><dd>{{ postTypeLabel(detail.postType) }}</dd></div>
                <div><dt>排序号</dt><dd>{{ detail.sort }}</dd></div>
                <div><dt>创建时间</dt><dd>{{ formatTime(detail.createdAt) }}</dd></div>
                <div><dt>更新时间</dt><dd>{{ formatTime(detail.updatedAt) }}</dd></div>
              </dl>
              <dl class="post-detail__descriptions">
                <div><dt>岗位职责</dt><dd>{{ detail.duty || '-' }}</dd></div>
                <div><dt>任职要求</dt><dd>{{ detail.requirement || '-' }}</dd></div>
                <div><dt>岗位说明</dt><dd>{{ detail.remark || '-' }}</dd></div>
              </dl>
            </section>

            <section class="post-detail__section">
              <div class="post-detail__section-head">
                <h4>在岗人员</h4>
                <span>{{ detail.members.length }} 人</span>
              </div>
              <GrowTable :data="detail.members" row-key="assignmentId" border empty-text="暂无在岗人员">
                  <GrowTableColumn prop="name" label="姓名" min-width="90" />
                  <GrowTableColumn prop="employeeNo" label="工号" min-width="110" />
                  <GrowTableColumn label="任职类型" min-width="90">
                    <template #default="{ row }">
                      {{ assignmentTypeLabel(row.assignmentType) }}
                    </template>
                  </GrowTableColumn>
                  <GrowTableColumn label="是否主岗位" min-width="100">
                    <template #default="{ row }">{{ row.primary ? '是' : '否' }}</template>
                  </GrowTableColumn>
                  <GrowTableColumn prop="startDate" label="入岗日期" min-width="110" />
                  <GrowTableColumn label="是否占用编制" min-width="110">
                    <template #default="{ row }">{{ row.occupyHeadcount ? '是' : '否' }}</template>
                  </GrowTableColumn>
                  <GrowTableColumn label="人员状态" min-width="90">
                    <template #default="{ row }">{{ employeeStatusLabel(row.employeeStatus) }}</template>
                  </GrowTableColumn>
              </GrowTable>
            </section>

            <section class="post-detail__section">
              <div class="post-detail__section-head">
                <h4>历史任职</h4>
                <span>{{ detail.history.length }} 条</span>
              </div>
              <GrowTable :data="detail.history" row-key="assignmentId" border empty-text="暂无历史任职">
                  <GrowTableColumn prop="name" label="姓名" min-width="90" />
                  <GrowTableColumn prop="employeeNo" label="工号" min-width="110" />
                  <GrowTableColumn label="任职类型" min-width="90">
                    <template #default="{ row }">
                      {{ assignmentTypeLabel(row.assignmentType) }}
                    </template>
                  </GrowTableColumn>
                  <GrowTableColumn prop="startDate" label="入岗日期" min-width="110" />
                  <GrowTableColumn prop="endDate" label="结束日期" min-width="110" />
                  <GrowTableColumn label="是否占用编制" min-width="110">
                    <template #default="{ row }">{{ row.occupyHeadcount ? '是' : '否' }}</template>
                  </GrowTableColumn>
              </GrowTable>
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
import { getSystemPostDetail } from '../../../api/systemPost'
import { assignmentTypeLabel, employeeStatusLabel } from '../../../types/systemPerson'
import { postTypeLabel, type SystemPostDetail, type SystemPostListItem } from '../../../types/systemPost'
import { formatTime, toMessage } from '../use/helpers'

defineOptions({ name: 'PostDetailDrawer' })

const message = useMsg() as any
const visible = ref(false)
const loading = ref(false)
const detail = ref<SystemPostDetail | null>(null)

async function open(row: SystemPostListItem) {
  detail.value = null
  visible.value = true
  loading.value = true
  try {
    detail.value = await getSystemPostDetail(row.id)
  } catch (error) {
    message.error(toMessage(error, '加载失败'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.post-detail {
  padding: 0 20px 24px;
}

.post-detail__watch {
  height: 100%;
  min-height: 240px;
}

.post-detail__hero,
.post-detail__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.post-detail__hero {
  padding: 8px 0 20px;
  border-bottom: 1px solid var(--layout-border-color);
}

.post-detail__hero h3,
.post-detail__section h4 {
  margin: 0;
  letter-spacing: 0;
}

.post-detail__hero h3 {
  font-size: 18px;
}

.post-detail__hero p {
  margin: 5px 0 0;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.post-detail__section {
  padding: 20px 0;
  border-bottom: 1px solid var(--layout-border-color);
}

.post-detail__section h4 {
  margin-bottom: 14px;
  font-size: 14px;
}

.post-detail__section-head h4 {
  margin-bottom: 0;
}

.post-detail__section-head {
  margin-bottom: 12px;
}

.post-detail__section-head span {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.post-detail__metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--layout-border-color);
  border-left: 1px solid var(--layout-border-color);
}

.post-detail__metrics div {
  min-width: 0;
  padding: 12px;
  border-right: 1px solid var(--layout-border-color);
  border-bottom: 1px solid var(--layout-border-color);
}

.post-detail__metrics dt {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.post-detail__metrics dd {
  margin: 5px 0 0;
  font-size: 20px;
  font-weight: 600;
}

.post-detail__dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 24px;
  margin: 0;
}

.post-detail__dl div {
  min-width: 0;
}

.post-detail__dl dt {
  margin: 0 0 4px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.post-detail__descriptions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 24px;
  margin: 20px 0 0;
  padding-top: 18px;
  border-top: 1px dashed var(--layout-border-color);
}

.post-detail__descriptions dt {
  color: var(--text-color-secondary);
  font-size: 12px;
}

.post-detail__descriptions dd {
  margin: 5px 0 0;
  color: var(--text-color);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.post-detail__dl dd {
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  word-break: break-all;
}

.post-detail__hint {
  margin: 0;
  padding: 16px;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.post-detail__alert {
  margin-top: 16px;
}

.post-detail__over {
  color: var(--el-color-danger);
}

@media (max-width: 900px) {
  .post-detail__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .post-detail__dl,
  .post-detail__descriptions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .post-detail {
    padding-right: 12px;
    padding-left: 12px;
  }

  .post-detail__metrics,
  .post-detail__dl,
  .post-detail__descriptions {
    grid-template-columns: 1fr;
  }
}
</style>
