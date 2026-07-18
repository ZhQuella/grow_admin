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
        <GrowInput v-model="model.name" placeholder="请输入" clearable />
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
          placeholder="请输入请求地址"
        />
      </GrowFormItem>

      <GrowFormItem label="请求方法" prop="method">
        <GrowRadioButtonGroup v-model="model.method" size="small" :options="methodOptions" />
      </GrowFormItem>

      <GrowFormItem prop="params">
        <template #label>
          <span class="inline-flex items-center gap-1">
            请求参数
            <GrowTooltip content="请求时携带的参数，可配置静态键值对" placement="top">
              <GrowIconify
                icon="carbon:help"
                :size="14"
                class="cursor-help text-text-secondary"
              />
            </GrowTooltip>
          </span>
        </template>

        <div class="w-full">
          <div
            v-for="(row, index) in model.params"
            :key="index"
            class="mb-2 flex items-center gap-1.5"
          >
            <GrowInput v-model="row.key" class="min-w-0 flex-1" placeholder="key" clearable />
            <GrowInput
              v-model="row.value"
              class="min-w-0 flex-1"
              placeholder="value"
              clearable
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
import type { DesignerApiFormModel } from './types'
import ApiProcessors from './ApiProcessors.vue'
import ApiDefaultData from './ApiDefaultData.vue'

defineOptions({ name: 'ApiForm' })

const props = defineProps<{
  model: DesignerApiFormModel
  rules: Record<string, any>
}>()

const formRef = ref()

defineExpose({
  validate: () => driverRef(formRef)?.validate(),
})

const onAddParam = () => {
  props.model.params.push({ key: '', value: '' })
}

const onRemoveParam = (index: number) => {
  props.model.params.splice(index, 1)
}
</script>
