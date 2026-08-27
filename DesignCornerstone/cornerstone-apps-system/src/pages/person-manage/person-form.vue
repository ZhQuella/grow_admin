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
          <PersonSection title="基本信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="姓名" prop="name">
                  <GrowInput v-model="formModel.name" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="邮箱" prop="email">
                  <GrowInput v-model="formModel.email" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="部门" prop="deptId">
                  <GrowTreeSelect
                    :model-value="formModel.deptId"
                    :data="deptTree"
                    :props="{ label: 'title', value: 'id', children: 'children' }"
                    check-strictly
                    filterable
                    default-expand-all
                    placeholder="请选择"
                    @update:model-value="onDeptChange"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="主部门" prop="mainDeptId">
                  <GrowTreeSelect
                    v-model="formModel.mainDeptId"
                    :data="deptTree"
                    :props="{ label: 'title', value: 'id', children: 'children' }"
                    check-strictly
                    filterable
                    default-expand-all
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem prop="supervisorId">
                  <template #label>
                    <span>直属主管</span>
                    <GrowTooltip content="用于组织汇报关系，后续也可作为审批人默认值" placement="top">
                      <GrowIconify class="person-form__info" icon="ant-design:info-circle-outlined" :size="14" />
                    </GrowTooltip>
                  </template>
                  <GrowSelect
                    v-model="formModel.supervisorId"
                    :options="supervisorOptions"
                    label="label"
                    value="value"
                    filterable
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="职位" prop="post">
                  <GrowInput v-model="formModel.post" maxlength="32" clearable autocomplete="off" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="手机号" prop="mobile">
                  <SensitiveInput v-model="formModel.mobile" maxlength="11" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="工号" prop="employeeNo">
                  <GrowInput v-model="formModel.employeeNo" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="分机号" prop="extension">
                  <GrowInput v-model="formModel.extension" maxlength="16" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="办公地点" prop="officeLocation">
                  <GrowInput v-model="formModel.officeLocation" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="备注" prop="remark">
                  <GrowInput v-model="formModel.remark" maxlength="200" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="入职时间" prop="entryDate">
                  <GrowDatePicker
                    v-model="formModel.entryDate"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem>
                  <template #label>
                    <span>司龄（系统计算）</span>
                    <GrowTooltip content="根据入职时间自动计算，离职后截止到离职日" placement="top">
                      <GrowIconify class="person-form__info" icon="ant-design:info-circle-outlined" :size="14" />
                    </GrowTooltip>
                  </template>
                  <GrowInput :model-value="tenureText" disabled />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="岗位编码" prop="jobCode">
                  <GrowInput v-model="formModel.jobCode" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="岗位" prop="jobTitle">
                  <GrowInput v-model="formModel.jobTitle" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="工作信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="员工类型" prop="employeeType">
                  <GrowSelect
                    v-model="formModel.employeeType"
                    :options="EMPLOYEE_TYPE_OPTIONS"
                    label="label"
                    value="value"
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="员工状态" prop="employeeStatus">
                  <GrowSelect
                    v-model="formModel.employeeStatus"
                    :options="EMPLOYEE_STATUS_OPTIONS"
                    label="label"
                    value="value"
                    placeholder="请选择"
                    :disabled="!isCreate && formModel.employeeStatus === 'resigned'"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="试用期" prop="probationMonths">
                  <GrowInput v-model="formModel.probationMonths" maxlength="8" clearable placeholder="如 3 个月" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem prop="actualConfirmDate">
                  <template #label>
                    <span>实际转正日期</span>
                    <GrowTooltip content="试用期满后的实际转正日，也可在列表中通过「转正」写入" placement="top">
                      <GrowIconify class="person-form__info" icon="ant-design:info-circle-outlined" :size="14" />
                    </GrowTooltip>
                  </template>
                  <GrowDatePicker
                    v-model="formModel.actualConfirmDate"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem prop="plannedConfirmDate">
                  <template #label>
                    <span>计划转正日期</span>
                    <GrowTooltip content="按入职日与试用期推算的计划转正日" placement="top">
                      <GrowIconify class="person-form__info" icon="ant-design:info-circle-outlined" :size="14" />
                    </GrowTooltip>
                  </template>
                  <GrowDatePicker
                    v-model="formModel.plannedConfirmDate"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="岗位职级" prop="jobGrade">
                  <GrowInput v-model="formModel.jobGrade" maxlength="16" clearable placeholder="如 P6" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="个人信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="身份证姓名" prop="idName">
                  <GrowInput v-model="formModel.idName" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="证件号码" prop="idNumber">
                  <SensitiveInput v-model="formModel.idNumber" maxlength="18" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="出生日期" prop="birthDate">
                  <GrowDatePicker
                    v-model="formModel.birthDate"
                    value-format="YYYY-MM-DD"
                    placeholder="可由身份证带出"
                    style="width: 100%"
                    @focus="onIdNumberBlur"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem>
                  <template #label>
                    <span>年龄（系统计算）</span>
                  </template>
                  <GrowInput :model-value="ageText" disabled />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="性别" prop="gender">
                  <GrowSelect
                    v-model="formModel.gender"
                    :options="GENDER_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="民族" prop="ethnicity">
                  <GrowSelect
                    v-model="formModel.ethnicity"
                    :options="ETHNICITY_OPTIONS"
                    label="label"
                    value="value"
                    filterable
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="8">
                <GrowFormItem label="身份证地址" prop="idAddress">
                  <GrowInput v-model="formModel.idAddress" maxlength="120" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="证件有效期起" prop="idValidFrom">
                  <GrowDatePicker
                    v-model="formModel.idValidFrom"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="证件有效期止" prop="idValidTo">
                  <GrowDatePicker
                    v-model="formModel.idValidTo"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="婚姻状况" prop="maritalStatus">
                  <GrowSelect
                    v-model="formModel.maritalStatus"
                    :options="MARITAL_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="首次参加工作时间" prop="firstWorkDate">
                  <GrowDatePicker
                    v-model="formModel.firstWorkDate"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="工龄（系统计算）">
                  <GrowInput :model-value="workYearsText" disabled />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="户籍类型" prop="hukouType">
                  <GrowSelect
                    v-model="formModel.hukouType"
                    :options="HUKOU_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="8">
                <GrowFormItem label="住址" prop="address">
                  <GrowInput v-model="formModel.address" maxlength="120" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="政治面貌" prop="politicalStatus">
                  <GrowSelect
                    v-model="formModel.politicalStatus"
                    :options="POLITICAL_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="个人社保账号" prop="socialSecurityNo">
                  <SensitiveInput v-model="formModel.socialSecurityNo" maxlength="32" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="个人公积金账号" prop="providentFundNo">
                  <SensitiveInput v-model="formModel.providentFundNo" maxlength="32" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="家乡" prop="hometown">
                  <GrowInput v-model="formModel.hometown" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="学历信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="学历" prop="education">
                  <GrowSelect
                    v-model="formModel.education"
                    :options="EDUCATION_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="毕业院校" prop="school">
                  <GrowInput v-model="formModel.school" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="毕业时间" prop="graduateDate">
                  <GrowDatePicker
                    v-model="formModel.graduateDate"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="所学专业" prop="major">
                  <GrowInput v-model="formModel.major" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="银行卡信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="银行卡号" prop="bankCardNo">
                  <SensitiveInput v-model="formModel.bankCardNo" maxlength="32" placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="开户行" prop="bankName">
                  <GrowInput v-model="formModel.bankName" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="合同信息">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="合同公司" prop="contractCompany">
                  <GrowInput v-model="formModel.contractCompany" maxlength="64" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="合同类型" prop="contractType">
                  <GrowSelect
                    v-model="formModel.contractType"
                    :options="CONTRACT_TYPE_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="首次合同起始日" prop="firstContractStart">
                  <GrowDatePicker v-model="formModel.firstContractStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="首次合同到期日" prop="firstContractEnd">
                  <GrowDatePicker v-model="formModel.firstContractEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="现合同起始日" prop="currentContractStart">
                  <GrowDatePicker v-model="formModel.currentContractStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="现合同到期日" prop="currentContractEnd">
                  <GrowDatePicker v-model="formModel.currentContractEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="合同期限" prop="contractTerm">
                  <GrowInput v-model="formModel.contractTerm" maxlength="16" clearable placeholder="如 3年" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="续签次数" prop="renewCount">
                  <GrowInput v-model="formModel.renewCount" maxlength="8" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="紧急联系人">
            <GrowRow :gutter="16">
              <GrowCol :span="4">
                <GrowFormItem label="紧急联系人姓名" prop="emergencyName">
                  <GrowInput v-model="formModel.emergencyName" maxlength="32" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="联系人关系" prop="emergencyRelation">
                  <GrowSelect
                    v-model="formModel.emergencyRelation"
                    :options="FAMILY_RELATION_OPTIONS"
                    label="label"
                    value="value"
                    clearable
                    placeholder="请选择"
                  />
                </GrowFormItem>
              </GrowCol>
              <GrowCol :span="4">
                <GrowFormItem label="联系人电话" prop="emergencyPhone">
                  <GrowInput v-model="formModel.emergencyPhone" maxlength="11" clearable placeholder="请输入" />
                </GrowFormItem>
              </GrowCol>
            </GrowRow>
          </PersonSection>

          <PersonSection title="家庭信息">
            <FamilyEditor :model-value="formModel.familyMembers" @update:model-value="onFamilyChange" />
          </PersonSection>

          <PersonSection title="个人材料">
            <MaterialUpload :model-value="formModel.materials" @update:model-value="onMaterialsChange" />
          </PersonSection>
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
import {
  CONTRACT_TYPE_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  ETHNICITY_OPTIONS,
  FAMILY_RELATION_OPTIONS,
  GENDER_OPTIONS,
  HUKOU_OPTIONS,
  MARITAL_OPTIONS,
  POLITICAL_OPTIONS,
} from '../../types/systemPerson'
import FamilyEditor from './components/FamilyEditor.vue'
import MaterialUpload from './components/MaterialUpload.vue'
import PersonSection from './components/PersonSection.vue'
import SensitiveInput from './components/SensitiveInput.vue'
import { usePersonForm } from './use/usePersonForm'

defineOptions({ name: 'PersonFormPage' })

const {
  loading,
  saving,
  isCreate,
  formRef,
  formModel,
  formRules,
  deptTree,
  supervisorOptions,
  tenureText,
  ageText,
  workYearsText,
  onDeptChange,
  onIdNumberBlur,
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

.person-form__hint {
  color: var(--text-color-secondary);
  font-size: 12px;
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

.person-form__info {
  margin-left: 4px;
  color: var(--text-color-secondary);
  vertical-align: -2px;
}

.person-form__form :deep(.el-select),
.person-form__form :deep(.el-tree-select),
.person-form__form :deep(.el-date-editor) {
  width: 100%;
}

.person-form__form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.person-form__form :deep(.el-form-item__label) {
  display: inline-flex;
  align-items: center;
}
</style>
