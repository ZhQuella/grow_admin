<template>
  <div class="px-3 py-3">
    <GrowForm
      ref="formRef"
      :model="model"
      :rules="rules"
      label-width="120px"
      label-position="left"
      size="small"
    >
      <GrowFormItem label="名称" prop="name">
        <GrowInput
          v-model="model.name"
          placeholder="如 getList，事件中可通过 apis.getList() 调用"
          clearable
        />
      </GrowFormItem>

      <GrowFormItem label="描述" prop="description">
        <GrowInput
          v-model="model.description"
          type="textarea"
          :rows="3"
          placeholder="请输入"
        />
      </GrowFormItem>

      <GrowFormItem label="自动加载" prop="autoLoad">
        <GrowSwitch v-model="model.autoLoad" />
      </GrowFormItem>

      <GrowFormItem label="加载方式" prop="loadType">
        <GrowRadioButtonGroup
          v-model="model.loadType"
          size="small"
          :options="loadTypeOptions"
        />
      </GrowFormItem>

      <GrowFormItem label="请求地址" prop="url">
        <GrowInput
          v-model="model.url"
          type="textarea"
          :rows="2"
          placeholder="支持路径占位，如 https://api.example.com/users/{id}/{userID?}"
        />
        <p class="mt-1 mb-0 text-xs leading-5 text-text-secondary">
          路径参数请用 &#123;key&#125; 或 &#123;key?&#125; 书写；&#123;key?&#125; 仅表示可选语义，未传时替换为空段。
        </p>
      </GrowFormItem>

      <GrowFormItem label="请求方法" prop="method">
        <GrowRadioButtonGroup v-model="model.method" size="small" :options="methodOptions" />
      </GrowFormItem>

      <GrowFormItem prop="pathParams">
        <template #label>
          <span class="inline-flex items-center gap-1">
            路径参数
            <GrowTooltip
              content="匹配 URL 中的 {key} / {key?}；key 与占位符名称对应，未传（含空字符串）时替换为空段"
              placement="top"
            >
              <GrowIconify
                icon="carbon:help"
                :size="14"
                class="cursor-help text-text-secondary"
              />
            </GrowTooltip>
          </span>
        </template>

        <div class="w-full">
          <p class="mb-2 mt-0 text-xs leading-5 text-text-secondary">
            用于替换地址中的路径占位，如 /users/&#123;id&#125;/posts/&#123;postId?&#125;
          </p>
          <div
            v-for="(row, index) in model.pathParams"
            :key="`path-${index}`"
            class="mb-2 flex items-center gap-1.5"
          >
            <GrowInput v-model="row.key" class="min-w-0 flex-1" placeholder="key" clearable />
            <PropVariableBind
              class="min-w-0 flex-1"
              v-model="row.value"
              v-model:bind-mode="row.bindMode"
              placeholder="value 或绑定变量"
            />
            <GrowButton text size="small" type="danger" @click.stop="onRemovePathParam(index)">
              <GrowIconify icon="carbon:close" :size="14" />
            </GrowButton>
          </div>
          <GrowButton class="w-full" size="small" @click.stop="onAddPathParam">
            <GrowIconify icon="carbon:add" :size="14" class="mr-1" />
            添加一项
          </GrowButton>
        </div>
      </GrowFormItem>

      <GrowFormItem prop="params">
        <template #label>
          <span class="inline-flex items-center gap-1">
            Query 参数
            <GrowTooltip
              content="拼接在 URL 后，如 ?a=1&b=2；value 可填固定值，或绑定数据源 / 属性计算"
              placement="top"
            >
              <GrowIconify
                icon="carbon:help"
                :size="14"
                class="cursor-help text-text-secondary"
              />
            </GrowTooltip>
          </span>
        </template>

        <div class="w-full">
          <p class="mb-2 mt-0 text-xs leading-5 text-text-secondary">
            作为查询字符串附加到请求地址后面
          </p>
          <div
            v-for="(row, index) in model.params"
            :key="`query-${index}`"
            class="mb-2 flex items-center gap-1.5"
          >
            <GrowInput v-model="row.key" class="min-w-0 flex-1" placeholder="key" clearable />
            <PropVariableBind
              class="min-w-0 flex-1"
              v-model="row.value"
              v-model:bind-mode="row.bindMode"
              placeholder="value 或绑定变量"
            />
            <GrowButton text size="small" type="danger" @click.stop="onRemoveParam(index)">
              <GrowIconify icon="carbon:close" :size="14" />
            </GrowButton>
          </div>
          <GrowButton class="w-full" size="small" @click.stop="onAddParam">
            <GrowIconify icon="carbon:add" :size="14" class="mr-1" />
            添加一项
          </GrowButton>
        </div>
      </GrowFormItem>

      <GrowFormItem v-if="model.method !== 'GET'" prop="body">
        <template #label>
          <span class="inline-flex items-center gap-1">
            Body 参数
            <GrowTooltip
              content="放入请求体（JSON）；GET 不可用；value 可填固定值，或绑定数据源 / 属性计算"
              placement="top"
            >
              <GrowIconify
                icon="carbon:help"
                :size="14"
                class="cursor-help text-text-secondary"
              />
            </GrowTooltip>
          </span>
        </template>

        <div class="w-full">
          <p class="mb-2 mt-0 text-xs leading-5 text-text-secondary">
            以 JSON 对象写入请求 body；GET 方法不可配置
          </p>
          <div
            v-for="(row, index) in model.body"
            :key="`body-${index}`"
            class="mb-2 flex items-center gap-1.5"
          >
            <GrowInput v-model="row.key" class="min-w-0 flex-1" placeholder="key" clearable />
            <PropVariableBind
              class="min-w-0 flex-1"
              v-model="row.value"
              v-model:bind-mode="row.bindMode"
              placeholder="value 或绑定变量"
            />
            <GrowButton text size="small" type="danger" @click.stop="onRemoveBodyParam(index)">
              <GrowIconify icon="carbon:close" :size="14" />
            </GrowButton>
          </div>
          <GrowButton class="w-full" size="small" @click.stop="onAddBodyParam">
            <GrowIconify icon="carbon:add" :size="14" class="mr-1" />
            添加一项
          </GrowButton>
        </div>
      </GrowFormItem>

      <GrowFormItem prop="shouldFetch">
        <template #label>
          <span class="inline-flex items-center gap-1">
            是否发送请求
            <GrowTooltip content="关闭后不会发起请求" placement="top">
              <GrowIconify
                icon="carbon:help"
                :size="14"
                class="cursor-help text-text-secondary"
              />
            </GrowTooltip>
          </span>
        </template>
        <GrowSwitch v-model="model.shouldFetch" />
      </GrowFormItem>
    </GrowForm>

    <ApiProcessors v-model="model.processors" />
    <ApiDefaultData v-model="model.defaultData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { driverRef } from '@grow-admin-rock/components'
import { loadTypeOptions, methodOptions } from './constants'
import type { DesignerApiFormModel, DesignerApiParam } from './types'
import ApiProcessors from './ApiProcessors.vue'
import ApiDefaultData from './ApiDefaultData.vue'
import PropVariableBind from '../../optionComponent/PropVariableBind/index.vue'
import { PROP_BIND_MODE_TEXT } from '../../static/propBindModes'

defineOptions({ name: 'ApiForm' })

const props = defineProps<{
  model: DesignerApiFormModel
  rules: Record<string, any>
}>()

const formRef = ref()

defineExpose({
  validate: () => driverRef(formRef)?.validate(),
})

const createEmptyParam = (): DesignerApiParam => ({
  key: '',
  value: '',
  bindMode: PROP_BIND_MODE_TEXT,
})

const onAddParam = () => {
  props.model.params.push(createEmptyParam())
}

const onRemoveParam = (index: number) => {
  props.model.params.splice(index, 1)
}

const onAddBodyParam = () => {
  props.model.body.push(createEmptyParam())
}

const onRemoveBodyParam = (index: number) => {
  props.model.body.splice(index, 1)
}

const onAddPathParam = () => {
  props.model.pathParams.push(createEmptyParam())
}

const onRemovePathParam = (index: number) => {
  props.model.pathParams.splice(index, 1)
}
</script>
