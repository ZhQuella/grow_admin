import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMsg } from '@grow-admin-rock/components'
import { useRouteNavigate, useTabs } from '@grow-admin-rock/hooks'
import { getSystemPersonDetail } from '../../../api/systemPerson'
import {
  CONTRACT_TYPE_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  HUKOU_OPTIONS,
  MARITAL_OPTIONS,
  type PersonHistoryItem,
  type SystemPersonDetail,
  genderLabel,
} from '../../../types/systemPerson'
import {
  displayText,
  formatDate,
  maskAccount,
  maskBank,
  maskId,
  maskMobile,
  optionLabel,
  toMessage,
  yearsAndMonths,
  calcAge,
} from './helpers'

export type DetailField = {
  label: string
  value: string
  span?: number
  sensitive?: boolean
  raw?: string
  tag?: 'success' | 'warning' | 'info' | 'danger' | 'primary'
}

export type DetailSection = {
  title: string
  fields: DetailField[]
}

function statusTag(status?: string): DetailField['tag'] {
  if (status === 'formal') return 'success'
  if (status === 'probation') return 'warning'
  if (status === 'resigned') return 'info'
  return undefined
}

export function usePersonDetail() {
  const route = useRoute()
  const { go } = useRouteNavigate()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const detail = ref<SystemPersonDetail | null>(null)
  const personId = computed(() => String(route.params.id || ''))

  const historyRows = computed<PersonHistoryItem[]>(() => {
    const rows = detail.value?.history
    if (!Array.isArray(rows)) return []
    return [...rows].reverse()
  })

  const familyRows = computed(() => {
    const rows = detail.value?.familyMembers
    if (!rows?.length) {
      return [{
        id: 'empty',
        name: '-',
        relation: '-',
        gender: '-',
        birthday: '-',
        phone: '-',
      }]
    }
    return rows.map((row) => ({
      id: row.id,
      name: displayText(row.name),
      relation: displayText(row.relation),
      gender: genderLabel(row.gender),
      birthday: formatDate(row.birthday),
      phone: displayText(row.phone),
    }))
  })

  const sections = computed<DetailSection[]>(() => {
    const item = detail.value
    if (!item) return []
    const tenure = item.tenureText
      || yearsAndMonths(item.entryDate, item.employeeStatus === 'resigned' ? item.resignDate : undefined)
      || '-'
    const age = item.ageText || calcAge(item.birthDate) || '-'
    const workYears = item.workYearsText || yearsAndMonths(item.firstWorkDate) || '-'

    return [
      {
        title: '基本信息',
        fields: [
          { label: '姓名', value: displayText(item.name) },
          { label: '邮箱', value: displayText(item.email) },
          { label: '部门', value: displayText(item.deptName) },
          { label: '主部门', value: displayText(item.mainDeptName) },
          { label: '直属主管', value: displayText(item.supervisorName) },
          { label: '职位', value: displayText(item.post) },
          {
            label: '手机号',
            value: maskMobile(item.mobile),
            sensitive: true,
            raw: item.mobile,
          },
          { label: '工号', value: displayText(item.employeeNo) },
          { label: '分机号', value: displayText(item.extension) },
          { label: '办公地点', value: displayText(item.officeLocation) },
          { label: '备注', value: displayText(item.remark), span: 2 },
          { label: '入职时间', value: formatDate(item.entryDate) },
          { label: '司龄', value: tenure },
          { label: '岗位编码', value: displayText(item.jobCode) },
          { label: '岗位', value: displayText(item.jobTitle) },
        ],
      },
      {
        title: '工作信息',
        fields: [
          { label: '员工类型', value: optionLabel(EMPLOYEE_TYPE_OPTIONS, item.employeeType) },
          {
            label: '员工状态',
            value: optionLabel(EMPLOYEE_STATUS_OPTIONS, item.employeeStatus),
            tag: statusTag(item.employeeStatus),
          },
          { label: '试用期', value: displayText(item.probationMonths) },
          { label: '实际转正日期', value: formatDate(item.actualConfirmDate) },
          { label: '计划转正日期', value: formatDate(item.plannedConfirmDate) },
          { label: '岗位职级', value: displayText(item.jobGrade) },
        ],
      },
      {
        title: '个人信息',
        fields: [
          { label: '身份证姓名', value: displayText(item.idName) },
          {
            label: '证件号码',
            value: maskId(item.idNumber),
            sensitive: true,
            raw: item.idNumber,
          },
          { label: '出生日期', value: formatDate(item.birthDate) },
          { label: '年龄', value: age },
          { label: '性别', value: optionLabel(GENDER_OPTIONS, item.gender) },
          { label: '民族', value: displayText(item.ethnicity) },
          { label: '身份证地址', value: displayText(item.idAddress), span: 2 },
          { label: '证件有效期起', value: formatDate(item.idValidFrom) },
          { label: '证件有效期止', value: formatDate(item.idValidTo) },
          { label: '婚姻状况', value: optionLabel(MARITAL_OPTIONS, item.maritalStatus) },
          { label: '首次参加工作时间', value: formatDate(item.firstWorkDate) },
          { label: '工龄', value: workYears },
          { label: '户籍类型', value: optionLabel(HUKOU_OPTIONS, item.hukouType) },
          { label: '住址', value: displayText(item.address), span: 2 },
          { label: '政治面貌', value: displayText(item.politicalStatus) },
          {
            label: '个人社保账号',
            value: maskAccount(item.socialSecurityNo),
            sensitive: true,
            raw: item.socialSecurityNo,
          },
          {
            label: '个人公积金账号',
            value: maskAccount(item.providentFundNo),
            sensitive: true,
            raw: item.providentFundNo,
          },
          { label: '家乡', value: displayText(item.hometown) },
        ],
      },
      {
        title: '学历信息',
        fields: [
          { label: '学历', value: optionLabel(EDUCATION_OPTIONS, item.education) },
          { label: '毕业院校', value: displayText(item.school) },
          { label: '毕业时间', value: formatDate(item.graduateDate) },
          { label: '所学专业', value: displayText(item.major) },
        ],
      },
      {
        title: '银行卡信息',
        fields: [
          {
            label: '银行卡号',
            value: maskBank(item.bankCardNo),
            sensitive: true,
            raw: item.bankCardNo,
          },
          { label: '开户行', value: displayText(item.bankName) },
        ],
      },
      {
        title: '合同信息',
        fields: [
          { label: '合同公司', value: displayText(item.contractCompany) },
          { label: '合同类型', value: optionLabel(CONTRACT_TYPE_OPTIONS, item.contractType) },
          { label: '首次合同起始日', value: formatDate(item.firstContractStart) },
          { label: '首次合同到期日', value: formatDate(item.firstContractEnd) },
          { label: '现合同起始日', value: formatDate(item.currentContractStart) },
          { label: '现合同到期日', value: formatDate(item.currentContractEnd) },
          { label: '合同期限', value: displayText(item.contractTerm) },
          { label: '续签次数', value: displayText(item.renewCount) },
        ],
      },
      {
        title: '紧急联系人',
        fields: [
          { label: '紧急联系人姓名', value: displayText(item.emergencyName) },
          { label: '联系人关系', value: displayText(item.emergencyRelation) },
          { label: '联系人电话', value: displayText(item.emergencyPhone) },
        ],
      },
    ]
  })

  async function load() {
    if (!personId.value) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      const data = await getSystemPersonDetail(personId.value)
      detail.value = data || null
      setTab(detail.value?.name ? `详情-${detail.value.name}` : '人员详情')
    } catch (error) {
      detail.value = null
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onBack() {
    closeCurrent()
  }

  function openEdit() {
    if (!personId.value) return
    go(
      { name: 'PersonEdit', params: { id: personId.value } },
      { tabMode: 'stack', parentName: 'PersonManage' },
    )
  }

  watch(
    () => ({ name: String(route.name), id: personId.value }),
    ({ name }) => {
      if (name !== 'PersonDetail') return
      void load()
    },
    { immediate: true },
  )

  return {
    loading,
    detail,
    sections,
    familyRows,
    historyRows,
    onBack,
    openEdit,
  }
}
