<template>
  <div class="person-profile-form">
    <component :is="bare ? 'div' : PersonSection" v-if="show('基本信息')" title="基本信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="姓名" prop="name">
            <GrowInput v-model="model.name" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="工号" prop="employeeNo">
            <GrowInput v-model="model.employeeNo" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="手机号" prop="mobile">
            <SensitiveInput v-model="model.mobile" maxlength="11" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="邮箱" prop="email">
            <GrowInput v-model="model.email" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="员工类型" prop="employeeType">
            <GrowSelect
              v-model="model.employeeType"
              :options="EMPLOYEE_TYPE_OPTIONS"
              label="label"
              value="value"
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="人员状态" prop="employeeStatus">
            <GrowSelect
              v-model="model.employeeStatus"
              :options="isCreate ? CREATE_STATUS_OPTIONS : EMPLOYEE_STATUS_OPTIONS"
              label="label"
              value="value"
              placeholder="请选择"
              :disabled="!isCreate"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="入职时间" prop="entryDate">
            <GrowDatePicker
              v-model="model.entryDate"
              value-format="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem>
            <template #label>
              <span>司龄（系统计算）</span>
              <GrowTooltip content="根据入职时间自动计算，离职后截止到离职日" placement="top">
                <GrowIconify class="person-profile-form__info" icon="ant-design:info-circle-outlined" :size="14" />
              </GrowTooltip>
            </template>
            <GrowInput :model-value="tenureText" disabled />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('任职与上下级')" title="任职与上下级">
      <AssignmentEditor
        :model-value="model.assignments"
        :dept-tree="deptTree || []"
        :readonly="false"
        :lock-assignment="lockAssignment"
        :supervisor-options="supervisorOptions"
        @update:model-value="emit('update:assignments', $event)"
      />
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('工作信息')" title="工作信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="分机号" prop="extension">
            <GrowInput v-model="model.extension" maxlength="16" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="办公地点" prop="officeLocation">
            <GrowInput v-model="model.officeLocation" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="试用期开始" prop="probationStart">
            <GrowDatePicker v-model="model.probationStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="试用期结束" prop="probationEnd">
            <GrowDatePicker v-model="model.probationEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="试用期" prop="probationMonths">
            <GrowInput v-model="model.probationMonths" maxlength="8" clearable placeholder="如 3 个月" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem prop="actualConfirmDate">
            <template #label>
              <span>实际转正日期</span>
              <GrowTooltip content="试用期满后的实际转正日，也可在列表中通过「转正」写入" placement="top">
                <GrowIconify class="person-profile-form__info" icon="ant-design:info-circle-outlined" :size="14" />
              </GrowTooltip>
            </template>
            <GrowDatePicker
              v-model="model.actualConfirmDate"
              value-format="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem prop="plannedConfirmDate">
            <template #label>
              <span>计划转正日期</span>
              <GrowTooltip content="按入职日与试用期推算的计划转正日" placement="top">
                <GrowIconify class="person-profile-form__info" icon="ant-design:info-circle-outlined" :size="14" />
              </GrowTooltip>
            </template>
            <GrowDatePicker
              v-model="model.plannedConfirmDate"
              value-format="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="退休日期" prop="retireDate">
            <GrowDatePicker v-model="model.retireDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" disabled />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('个人信息')" title="个人信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="证件类型" prop="idType">
            <GrowSelect
              v-model="model.idType"
              :options="ID_TYPE_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="身份证姓名" prop="idName">
            <GrowInput v-model="model.idName" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="证件号码" prop="idNumber">
            <SensitiveInput v-model="model.idNumber" maxlength="18" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="出生日期" prop="birthDate">
            <GrowDatePicker
              v-model="model.birthDate"
              value-format="YYYY-MM-DD"
              placeholder="可由身份证带出"
              style="width: 100%"
              @focus="emit('id-number-blur')"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem>
            <template #label>
              <span>年龄（系统计算）</span>
            </template>
            <GrowInput :model-value="ageText" disabled />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="性别" prop="gender">
            <GrowSelect
              v-model="model.gender"
              :options="GENDER_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="民族" prop="ethnicity">
            <GrowSelect
              v-model="model.ethnicity"
              :options="ETHNICITY_OPTIONS"
              label="label"
              value="value"
              filterable
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="12">
          <GrowFormItem label="身份证地址" prop="idAddress">
            <GrowInput v-model="model.idAddress" maxlength="120" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="证件有效期起" prop="idValidFrom">
            <GrowDatePicker v-model="model.idValidFrom" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="证件有效期止" prop="idValidTo">
            <GrowDatePicker v-model="model.idValidTo" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="婚姻状况" prop="maritalStatus">
            <GrowSelect
              v-model="model.maritalStatus"
              :options="MARITAL_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="首次参加工作时间" prop="firstWorkDate">
            <GrowDatePicker v-model="model.firstWorkDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="工龄（系统计算）">
            <GrowInput :model-value="workYearsText" disabled />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="户籍类型" prop="hukouType">
            <GrowSelect
              v-model="model.hukouType"
              :options="HUKOU_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="12">
          <GrowFormItem label="住址" prop="address">
            <GrowInput v-model="model.address" maxlength="120" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="政治面貌" prop="politicalStatus">
            <GrowSelect
              v-model="model.politicalStatus"
              :options="POLITICAL_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="个人社保账号" prop="socialSecurityNo">
            <SensitiveInput v-model="model.socialSecurityNo" maxlength="32" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="个人公积金账号" prop="providentFundNo">
            <SensitiveInput v-model="model.providentFundNo" maxlength="32" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="家乡" prop="hometown">
            <GrowInput v-model="model.hometown" maxlength="32" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('学历信息')" title="学历信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="学历" prop="education">
            <GrowSelect
              v-model="model.education"
              :options="EDUCATION_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="毕业院校" prop="school">
            <GrowInput v-model="model.school" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="毕业时间" prop="graduateDate">
            <GrowDatePicker v-model="model.graduateDate" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="所学专业" prop="major">
            <GrowInput v-model="model.major" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('合同信息')" title="合同信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="合同公司" prop="contractCompany">
            <GrowInput v-model="model.contractCompany" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="合同类型" prop="contractType">
            <GrowSelect
              v-model="model.contractType"
              :options="CONTRACT_TYPE_OPTIONS"
              label="label"
              value="value"
              clearable
              placeholder="请选择"
            />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="首次合同起始日" prop="firstContractStart">
            <GrowDatePicker v-model="model.firstContractStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="首次合同到期日" prop="firstContractEnd">
            <GrowDatePicker v-model="model.firstContractEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="现合同起始日" prop="currentContractStart">
            <GrowDatePicker v-model="model.currentContractStart" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="现合同到期日" prop="currentContractEnd">
            <GrowDatePicker v-model="model.currentContractEnd" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="合同期限" prop="contractTerm">
            <GrowInput v-model="model.contractTerm" maxlength="16" clearable placeholder="如 3年" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="续签次数" prop="renewCount">
            <GrowInput v-model="model.renewCount" maxlength="8" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('银行卡信息')" title="银行卡信息">
      <GrowRow :gutter="16">
        <GrowCol :span="6">
          <GrowFormItem label="银行卡号" prop="bankCardNo">
            <SensitiveInput v-model="model.bankCardNo" maxlength="32" placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
        <GrowCol :span="6">
          <GrowFormItem label="开户行" prop="bankName">
            <GrowInput v-model="model.bankName" maxlength="64" clearable placeholder="请输入" />
          </GrowFormItem>
        </GrowCol>
      </GrowRow>
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('紧急联系人')" title="紧急联系人">
      <EmergencyEditor
        :model-value="model.emergencyContacts"
        @update:model-value="emit('update:emergency', $event)"
      />
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('家庭信息')" title="家庭信息">
      <FamilyEditor :model-value="model.familyMembers" @update:model-value="emit('update:family', $event)" />
    </component>

    <component :is="bare ? 'div' : PersonSection" v-if="show('个人材料')" title="个人材料">
      <MaterialUpload :model-value="model.materials" @update:model-value="emit('update:materials', $event)" />
    </component>
  </div>
</template>

<script lang="ts" setup>
import {
  CONTRACT_TYPE_OPTIONS,
  CREATE_STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  HUKOU_OPTIONS,
  ID_TYPE_OPTIONS,
  MARITAL_OPTIONS,
  POLITICAL_OPTIONS,
  type PersonAssignment,
  type PersonEmergencyContact,
  type PersonFamilyMember,
  type PersonMaterials,
} from '../../../types/systemPerson'
import type { SystemDeptTreeNode } from '../../../types/systemRole'
import type { PersonFormModel } from '../use/personFormModel'
import AssignmentEditor from './AssignmentEditor.vue'
import EmergencyEditor from './EmergencyEditor.vue'
import FamilyEditor from './FamilyEditor.vue'
import MaterialUpload from './MaterialUpload.vue'
import PersonSection from './PersonSection.vue'
import SensitiveInput from './SensitiveInput.vue'

defineOptions({ name: 'PersonProfileForm' })

const props = defineProps<{
  model: PersonFormModel
  section?: string
  bare?: boolean
  isCreate?: boolean
  lockAssignment?: boolean
  deptTree?: SystemDeptTreeNode[]
  supervisorOptions?: Array<{ label: string; value: string }>
  tenureText?: string
  ageText?: string
  workYearsText?: string
}>()

const emit = defineEmits<{
  'update:assignments': [value: PersonAssignment[]]
  'update:emergency': [value: PersonEmergencyContact[]]
  'update:family': [value: PersonFamilyMember[]]
  'update:materials': [value: PersonMaterials]
  'id-number-blur': []
}>()

function show(title: string) {
  return !props.section || props.section === title
}
</script>

<style scoped>
.person-profile-form__info {
  margin-left: 4px;
  color: var(--text-color-secondary);
  vertical-align: -2px;
}

.person-profile-form :deep(.el-input),
.person-profile-form :deep(.el-select),
.person-profile-form :deep(.el-tree-select),
.person-profile-form :deep(.el-date-editor) {
  width: 100%;
}

.person-profile-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.person-profile-form :deep(.el-form-item__label) {
  display: inline-flex;
  align-items: center;
}
</style>
