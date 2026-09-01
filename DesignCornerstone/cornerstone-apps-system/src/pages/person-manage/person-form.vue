<template>
  <div class="person-form">
    <div class="person-form__body">
      <GrowScrollbar height="100%">
        <div v-if="loading" class="person-form__loading">加载中…</div>
        <GrowForm
          v-else
          ref="formRef"
          class="person-form__form"
          :model="formModel"
          :rules="formRules"
          label-position="top"
        >
          <PersonProfileForm
            :model="formModel"
            is-create
            :dept-tree="deptTree"
            :supervisor-options="supervisorOptions"
            :tenure-text="tenureText"
            :age-text="ageText"
            :work-years-text="workYearsText"
            @update:assignments="onAssignmentsChange"
            @update:emergency="onEmergencyChange"
            @update:family="onFamilyChange"
            @update:materials="onMaterialsChange"
            @id-number-blur="onIdNumberBlur"
          />
        </GrowForm>
      </GrowScrollbar>
    </div>

    <div class="person-form__bar">
      <GrowSpace>
        <GrowButton @click="onBack">返回</GrowButton>
        <GrowButton type="primary" :loading="saving" @click="submit">保存</GrowButton>
      </GrowSpace>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PersonProfileForm from './components/PersonProfileForm.vue'
import { usePersonForm } from './use/usePersonForm'

defineOptions({ name: 'PersonFormPage' })

const {
  loading,
  saving,
  formRef,
  formModel,
  formRules,
  deptTree,
  supervisorOptions,
  tenureText,
  ageText,
  workYearsText,
  onAssignmentsChange,
  onIdNumberBlur,
  onEmergencyChange,
  onFamilyChange,
  onMaterialsChange,
  submit,
  onBack,
} = usePersonForm()
</script>

<style scoped>
.person-form {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 10px;
  background: var(--layout-container-background-color);
}

.person-form__bar {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid var(--layout-border-color);
  border-radius: 0 0 8px 8px;
  background: var(--component-background-color);
}

.person-form__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--component-background-color);
}

.person-form__loading {
  padding: 48px;
  color: var(--text-color-secondary);
  text-align: center;
}

.person-form__form {
  padding: 8px 20px 32px;
}
</style>
