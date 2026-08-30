import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { fetchSystemDeptTree, fetchSystemPersons } from '../../../api/systemRole'
import { getSystemPersonDetail, updateSystemPerson } from '../../../api/systemPerson'
import type { SystemDeptTreeNode, SystemPerson } from '../../../types/systemRole'
import {
  CONTRACT_TYPE_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  HUKOU_OPTIONS,
  MARITAL_OPTIONS,
  canPersonAction,
  genderLabel,
  idTypeLabel,
  type PersonAssignment,
  type PersonEmergencyContact,
  type PersonFamilyMember,
  type PersonHistoryItem,
  type PersonMaterials,
  type PersonSuperiorRef,
  type SystemPersonDetail,
} from '../../../types/systemPerson'
import {
  displayText,
  formatDate,
  maskAccount,
  maskBank,
  maskId,
  maskMobile,
  optionLabel,
  parseIdCard,
  toMessage,
  yearsAndMonths,
  calcAge,
  normalizeEmergencyContacts,
  validateGrowForm,
} from './helpers'
import {
  applyPersonDetail,
  buildPersonSavePayload,
  emptyPersonForm,
  setPersonMaterials,
  syncEmergencyToForm,
  syncPrimaryFromAssignments,
  type PersonFormModel,
} from './personFormModel'

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
  if (status === 'formal' || status === 'rehired') return 'success'
  if (status === 'probation' || status === 'pending') return 'warning'
  if (status === 'resigned' || status === 'retired' || status === 'disabled') return 'info'
  return undefined
}

export function usePersonDetail() {
  const route = useRoute()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const saving = ref(false)
  const formRef = ref()
  const detail = ref<SystemPersonDetail | null>(null)
  const formModel = reactive<PersonFormModel>(emptyPersonForm())
  const editingSection = ref('')
  const deptTree = ref<SystemDeptTreeNode[]>([])
  const persons = ref<SystemPerson[]>([])
  const boundPersonId = String(route.params.id || '')
  const personId = computed(() => boundPersonId)
  const canEdit = computed(() => canPersonAction(detail.value?.employeeStatus, 'edit'))

  const formRules = {
    name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
    email: [{ required: true, message: '请填写邮箱', trigger: 'blur' }],
    employeeNo: [{ required: true, message: '请填写工号', trigger: 'blur' }],
    entryDate: [{ required: true, message: '请选择入职时间', trigger: 'change' }],
    employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
  }

  const supervisorOptions = computed(() =>
    persons.value
      .filter((item) => item.userId !== personId.value)
      .map((item) => ({
        value: item.userId,
        label: `${item.name}（${item.deptName}）`,
      })),
  )

  const tenureText = computed(() =>
    yearsAndMonths(
      formModel.entryDate,
      formModel.employeeStatus === 'resigned' ? formModel.resignDate : undefined,
    ) || '系统计算',
  )
  const ageText = computed(() => calcAge(formModel.birthDate) || '系统计算')
  const workYearsText = computed(() => yearsAndMonths(formModel.firstWorkDate) || '系统计算')

  const historyRows = computed<PersonHistoryItem[]>(() => {
    const rows = detail.value?.history
    if (!Array.isArray(rows)) return []
    return [...rows].reverse()
  })

  const emergencyRows = computed(() => {
    const rows = normalizeEmergencyContacts(detail.value || {})
    if (!rows.length) {
      return [{ id: 'empty', name: '-', relation: '-', phone: '-' }]
    }
    return rows.map((row) => ({
      id: row.id,
      name: displayText(row.name),
      relation: displayText(row.relation),
      phone: displayText(row.phone),
    }))
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
          { label: '工号', value: displayText(item.employeeNo) },
          {
            label: '手机号',
            value: maskMobile(item.mobile),
            sensitive: true,
            raw: item.mobile,
          },
          { label: '邮箱', value: displayText(item.email) },
          { label: '员工类型', value: optionLabel(EMPLOYEE_TYPE_OPTIONS, item.employeeType) },
          {
            label: '人员状态',
            value: optionLabel(EMPLOYEE_STATUS_OPTIONS, item.employeeStatus),
            tag: statusTag(item.employeeStatus),
          },
          { label: '入职时间', value: formatDate(item.entryDate) },
          { label: '司龄', value: tenure },
        ],
      },
      {
        title: '工作信息',
        fields: [
          { label: '分机号', value: displayText(item.extension) },
          { label: '办公地点', value: displayText(item.officeLocation) },
          { label: '试用期开始', value: formatDate(item.probationStart) },
          { label: '试用期结束', value: formatDate(item.probationEnd) },
          { label: '试用期', value: displayText(item.probationMonths) },
          { label: '实际转正日期', value: formatDate(item.actualConfirmDate) },
          { label: '计划转正日期', value: formatDate(item.plannedConfirmDate) },
          { label: '退休日期', value: formatDate(item.retireDate) },
        ],
      },
      {
        title: '个人信息',
        fields: [
          { label: '证件类型', value: idTypeLabel(item.idType) },
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
    ]
  })

  async function loadMeta() {
    const [depts, people] = await Promise.all([
      fetchSystemDeptTree(),
      fetchSystemPersons(),
    ])
    deptTree.value = Array.isArray(depts) ? depts : []
    persons.value = Array.isArray(people) ? people : []
  }

  async function load(force = false) {
    if (!boundPersonId) {
      detail.value = null
      return
    }
    if (!force && detail.value && String(detail.value.userId) === boundPersonId) {
      setTab(detail.value.name ? `详情-${detail.value.name}` : '人员详情')
      return
    }
    loading.value = true
    try {
      const data = await getSystemPersonDetail(personId.value)
      detail.value = data || null
      if (detail.value) applyPersonDetail(formModel, detail.value)
      setTab(detail.value?.name ? `详情-${detail.value.name}` : '人员详情')
    } catch (error) {
      detail.value = null
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function startEdit(title: string) {
    if (!detail.value || !canEdit.value) return
    applyPersonDetail(formModel, detail.value)
    editingSection.value = title
  }

  function cancelEdit() {
    editingSection.value = ''
  }

  function onAssignmentsChange(value: PersonAssignment[]) {
    syncPrimaryFromAssignments(formModel, value)
  }

  function onEmergencyChange(value: PersonEmergencyContact[]) {
    syncEmergencyToForm(formModel, value)
  }

  function onFamilyChange(value: PersonFamilyMember[]) {
    formModel.familyMembers = value
  }

  function onMaterialsChange(value: PersonMaterials) {
    setPersonMaterials(formModel, value)
  }

  function onIdNumberBlur() {
    const parsed = parseIdCard(formModel.idNumber || '')
    if (!parsed) return
    if (!formModel.birthDate) formModel.birthDate = parsed.birthDate
    if (!formModel.gender) formModel.gender = parsed.gender
    if (!formModel.idName) formModel.idName = formModel.name
  }

  async function saveSection() {
    if (!personId.value) return
    if (editingSection.value === '基本信息') {
      try {
        await validateGrowForm(formRef)
      } catch {
        message.warning('请先完善必填信息')
        return
      }
    }
    if ((formModel.assignments || []).some((item) =>
      item.supervisorId && (item.collaboratorIds || []).includes(item.supervisorId),
    )) {
      message.warning('同一任职下协同上级不能与主上级重复')
      return
    }
    saving.value = true
    try {
      const data = await updateSystemPerson(personId.value, buildPersonSavePayload(formModel))
      if (data && typeof data === 'object' && data.userId) {
        detail.value = data
      } else {
        await load(true)
      }
      editingSection.value = ''
      message.success('保存成功')
      setTab(detail.value?.name ? `详情-${detail.value.name}` : '人员详情')
    } catch (error) {
      message.error(toMessage(error, '保存失败'))
    } finally {
      saving.value = false
    }
  }

  function onBack() {
    closeCurrent()
  }

  watch(
    () => formModel.idNumber,
    (value) => {
      if (editingSection.value === '个人信息' && String(value || '').trim().length >= 18) {
        onIdNumberBlur()
      }
    },
  )

  void Promise.all([load(), loadMeta()])

  return {
    loading,
    saving,
    canEdit,
    formRef,
    formModel,
    formRules,
    editingSection,
    deptTree,
    supervisorOptions,
    tenureText,
    ageText,
    workYearsText,
    detail,
    sections,
    emergencyRows,
    familyRows,
    historyRows,
    startEdit,
    cancelEdit,
    saveSection,
    onAssignmentsChange,
    onEmergencyChange,
    onFamilyChange,
    onMaterialsChange,
    onIdNumberBlur,
    assignmentRows: computed<PersonAssignment[]>(() => {
      const item = detail.value
      return (item?.assignments || []).map((row) => (
        row.type === 'primary'
          ? {
              ...row,
              jobCode: row.jobCode || item?.jobCode || '',
              jobTitle: row.jobTitle || item?.jobTitle || '',
              jobGrade: row.jobGrade || item?.jobGrade || '',
              supervisorId: row.supervisorId || item?.supervisorId || '',
              supervisorName: row.supervisorName || item?.supervisorName || '',
              collaboratorIds: row.collaboratorIds?.length ? row.collaboratorIds : (item?.collaboratorIds || []),
              collaboratorNames: row.collaboratorNames?.length
                ? row.collaboratorNames
                : (item?.collaborators || []).map((ref) => ref.name),
            }
          : row
      ))
    }),
    subordinates: computed<PersonSuperiorRef[]>(() => detail.value?.subordinates || []),
    onBack,
  }
}
