<template>
  <div class="element-size">
    <div class="element-size__box">
      <div class="element-size__unit-wrap">
        <GrowSelect
          v-model="marginUnit"
          class="element-size__unit-select"
          size="small"
          :options="[
            { label: 'px', value: 'px' },
            { label: '%', value: '%' },
            { label: 'vw/vh', value: 'vw/vh' },
          ]"
          @change="onMarginUnitChange"
        />
      </div>

      <div class="element-size__edge element-size__edge--margin-top">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--top">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['margin-top']) || ''"
            class="element-size__input element-size__input--block"
            @input="(event) => onMarginChange('margin-top', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--margin-right">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--side">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['margin-right']) || ''"
            class="element-size__input element-size__input--side"
            @input="(event) => onMarginChange('margin-right', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--margin-bottom">
        <span class="element-size__edge-label">Margin</span>
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--bottom">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['margin-bottom']) || ''"
            class="element-size__input element-size__input--bottom"
            @input="(event) => onMarginChange('margin-bottom', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--margin-left">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--side">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['margin-left']) || ''"
            class="element-size__input element-size__input--side"
            @input="(event) => onMarginChange('margin-left', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--padding-top">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--top">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['padding-top']) || ''"
            class="element-size__input element-size__input--block"
            @input="(event) => onMarginChange('padding-top', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--padding-right">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--side">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['padding-right']) || ''"
            class="element-size__input element-size__input--side"
            @input="(event) => onMarginChange('padding-right', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--padding-bottom">
        <span class="element-size__edge-label">Padding</span>
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--bottom">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['padding-bottom']) || ''"
            class="element-size__input element-size__input--bottom"
            @input="(event) => onMarginChange('padding-bottom', event)"
          />
        </span>
      </div>

      <div class="element-size__edge element-size__edge--padding-left">
        <span class="element-size__edge-input-wrap element-size__edge-input-wrap--side">
          <input
            placeholder="0"
            maxlength="3"
            autocomplete="off"
            :value="parseFloat(styleOption['padding-left']) || ''"
            class="element-size__input element-size__input--side"
            @input="(event) => onMarginChange('padding-left', event)"
          />
        </span>
      </div>
    </div>

    <div class="element-size__dimensions">
      <GrowInput
        class="element-size__dimension-input"
        size="small"
        placeholder="高度"
        :controls="false"
        :disabled="heightUnit === 'auto'"
        :model-value="dimensionValue('height')"
        @update:model-value="(v) => onDimensionChange('height', v)"
      >
        <template #append>
          <GrowSelect
            v-model="heightUnit"
            class="element-size__unit-append"
            size="small"
            :options="[
              { label: 'px', value: 'px' },
              { label: '%', value: '%' },
              { label: 'vh', value: 'vh' },
              { label: 'auto', value: 'auto' },
            ]"
            @update:model-value="(v) => onDimensionUnitChange('height', v)"
          />
        </template>
      </GrowInput>
      <GrowInput
        class="element-size__dimension-input element-size__dimension-input--last"
        size="small"
        placeholder="宽度"
        :controls="false"
        :disabled="widthUnit === 'auto'"
        :model-value="dimensionValue('width')"
        @update:model-value="(v) => onDimensionChange('width', v)"
      >
        <template #append>
          <GrowSelect
            v-model="widthUnit"
            class="element-size__unit-append"
            size="small"
            :options="[
              { label: 'px', value: 'px' },
              { label: '%', value: '%' },
              { label: 'vw', value: 'vw' },
              { label: 'auto', value: 'auto' },
            ]"
            @update:model-value="(v) => onDimensionUnitChange('width', v)"
          />
        </template>
      </GrowInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { useMargin } from './use/useMargin'

defineOptions({ name: 'ElementSize' })

const emits = defineEmits(['update:styleOption'])
const porps = defineProps({
  styleOption: {
    type: Object,
    default: () => ({}),
  },
})
const { styleOption } = toRefs(porps)

const { marginUnit, onMarginUnitChange, onMarginChange } = useMargin({
  styleOption,
  emits,
})

const widthUnit = ref('px')
const heightUnit = ref('px')

const parseUnit = (value: unknown, fallback = 'px') => {
  if (value == null || value === '') return fallback
  const str = String(value)
  if (str === 'auto') return 'auto'
  const matched = str.match(/(px|%|vh|vw)$/)
  return matched?.[1] || fallback
}

watch(
  styleOption,
  (styles) => {
    widthUnit.value = parseUnit(styles?.width, widthUnit.value)
    heightUnit.value = parseUnit(styles?.height, heightUnit.value)
  },
  { immediate: true, deep: true },
)

const dimensionValue = (key: 'width' | 'height') => {
  const value = styleOption.value?.[key]
  if (value == null || value === '' || value === 'auto') return ''
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : ''
}

const onDimensionChange = (key: 'width' | 'height', raw: string | number | null) => {
  const result = { ...styleOption.value }
  const unit = key === 'width' ? widthUnit.value : heightUnit.value
  if (raw === null || raw === undefined || raw === '') {
    Reflect.deleteProperty(result, key)
  } else if (unit === 'auto') {
    result[key] = 'auto'
  } else {
    result[key] = `${raw}${unit}`
  }
  emits('update:styleOption', result)
}

const onDimensionUnitChange = (key: 'width' | 'height', unit: string) => {
  const result = { ...styleOption.value }
  if (unit === 'auto') {
    result[key] = 'auto'
    emits('update:styleOption', result)
    return
  }
  const current = result[key]
  if (current != null && current !== '' && current !== 'auto') {
    const num = parseFloat(current)
    if (Number.isFinite(num)) {
      result[key] = `${num}${unit}`
      emits('update:styleOption', result)
    }
  }
}
</script>

<style lang="scss" scoped>
$edge-color: var(--color-primary-a16);

.element-size {
  padding: 5px 10px;
}

.element-size__box {
  position: relative;
  width: 100%;
  height: 150px;
}

.element-size__unit-wrap {
  padding: 60px;
}

.element-size__unit-select {
  width: 100%;
}

.element-size__edge {
  position: absolute;
  pointer-events: none;

  input {
    pointer-events: auto;
  }
}

.element-size__edge--margin-top {
  top: 0;
  left: 0;
  right: 0;
  border-top: 20px solid $edge-color;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}

.element-size__edge--margin-right {
  top: 5px;
  bottom: 5px;
  right: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-right: 20px solid $edge-color;
}

.element-size__edge--margin-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 20px solid $edge-color;
}

.element-size__edge--margin-left {
  top: 5px;
  bottom: 5px;
  left: 0;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid $edge-color;
}

.element-size__edge--padding-top {
  top: 25px;
  left: 25px;
  right: 25px;
  border-top: 20px solid $edge-color;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}

.element-size__edge--padding-right {
  top: 30px;
  bottom: 30px;
  right: 25px;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-right: 20px solid $edge-color;
}

.element-size__edge--padding-bottom {
  bottom: 25px;
  left: 25px;
  right: 25px;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 20px solid $edge-color;
}

.element-size__edge--padding-left {
  top: 30px;
  bottom: 30px;
  left: 25px;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid $edge-color;
}

.element-size__edge-input-wrap {
  position: absolute;
  background: transparent;

  &--top {
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
  }

  &--side {
    top: 0;
    bottom: 0;
    width: 20px;
    margin: auto;
  }

  &--bottom {
    left: 0;
    right: 0;
    bottom: 0;
    height: 20px;
  }
}

.element-size__edge--margin-right .element-size__edge-input-wrap--side {
  right: -20px;
}

.element-size__edge--margin-left .element-size__edge-input-wrap--side {
  left: -20px;
}

.element-size__edge--padding-right .element-size__edge-input-wrap--side {
  right: -20px;
}

.element-size__edge--padding-left .element-size__edge-input-wrap--side {
  left: -20px;
}

.element-size__edge-label {
  float: left;
  margin-left: -10px;
  margin-top: -5px;
  transform: scale(0.65);
  color: var(--text-color-secondary);
}

.element-size__input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  text-align: center;

  &--block {
    display: block;
    width: 100%;
    height: 20px;
    padding: 0;
    line-height: 20px;
  }

  &--side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20px;
    height: 20px;
    margin: auto;
    line-height: 20px;
    padding: 0 8px;
  }

  &--bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -20px;
    height: 20px;
  }
}

.element-size__dimensions {
  display: flex;
  padding-top: 5px;
}

.element-size__dimension-input {
  flex: 1;
  margin-right: 4px;

  &--last {
    margin-right: 0;
    margin-left: 4px;
  }
}

.element-size__unit-append {
  width: 70px;
}
</style>
