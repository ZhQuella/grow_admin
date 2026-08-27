import { computed, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { fetchSystemDeptTree, fetchSystemPersons } from '../../../api/systemRole'
import {
  createSystemPerson,
  getSystemPersonDetail,
  updateSystemPerson,
  fetchSystemRoleOptions,
} from '../../../api/systemPerson'
import type { SystemDeptTreeNode, SystemPerson } from '../../../types/systemRole'
import type {
  PersonFamilyMember,
  PersonMaterials,
  SystemPersonSavePayload,
} from '../../../types/systemPerson'
import { calcAge, parseIdCard, todayText, toMessage, yearsAndMonths } from './helpers'

type FormModel = SystemPersonSavePayload & {
  userId?: string
}

function emptyForm(): FormModel {
  return {
    name: '',
    email: '',
    employeeNo: '',
    mobile: '',
    deptId: '',
    mainDeptId: '',
    supervisorId: '',
    post: '',
    extension: '',
    officeLocation: '',
    remark: '',
    entryDate: todayText(),
    resignDate: '',
    jobCode: '',
    jobTitle: '',
    employeeType: 'full_time',
    employeeStatus: 'formal',
    probationMonths: '3',
    actualConfirmDate: '',
    plannedConfirmDate: '',
    jobGrade: '',
    roleIds: [],
    idName: '',
    idNumber: '',
    birthDate: '',
    gender: '',
    ethnicity: '汉族',
    idAddress: '',
    idValidFrom: '',
    idValidTo: '',
    maritalStatus: '',
    firstWorkDate: '',
    hukouType: '',
    address: '',
    politicalStatus: '',
    socialSecurityNo: '',
    providentFundNo: '',
    hometown: '',
    education: '',
    school: '',
    graduateDate: '',
    major: '',
    bankCardNo: '',
    bankName: '',
    contractCompany: '',
    contractType: '',
    firstContractStart: '',
    firstContractEnd: '',
    currentContractStart: '',
    currentContractEnd: '',
    contractTerm: '',
    renewCount: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    familyMembers: [],
    materials: {},
  }
}

function snapshotOf(model: FormModel) {
  return JSON.stringify(model)
}

export function usePersonForm() {
  const route = useRoute()
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const saving = ref(false)
  const formRef = ref<{ validate?: () => Promise<boolean> } | null>(null)
  const formModel = reactive<FormModel>(emptyForm())
  const deptTree = ref<SystemDeptTreeNode[]>([])
  const persons = ref<SystemPerson[]>([])
  const roleOptions = ref<Array<{ id: string; name: string; code: string }>>([])
  const snapshot = ref('')

  const isCreate = computed(() => String(route.name) === 'PersonCreate')
  const personId = computed(() => String(route.params.id || ''))

  const formRules = {
    name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
    email: [{ required: true, message: '请填写邮箱', trigger: 'blur' }],
    deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
    mainDeptId: [{ required: true, message: '请选择主部门', trigger: 'change' }],
    employeeNo: [{ required: true, message: '请填写工号', trigger: 'blur' }],
    entryDate: [{ required: true, message: '请选择入职时间', trigger: 'change' }],
    employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
    employeeStatus: [{ required: true, message: '请选择员工状态', trigger: 'change' }],
  }

  const supervisorOptions = computed(() =>
    persons.value
      .filter((item) => item.userId !== formModel.userId)
      .map((item) => ({
        value: item.userId,
        label: `${item.name}（${item.deptName}）`,
      })),
  )

  const roleSelectOptions = computed(() =>
    roleOptions.value.map((item) => ({
      value: item.id,
      label: item.name,
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
  const dirty = computed(() => snapshot.value !== '' && snapshotOf(formModel) !== snapshot.value)
  let skipLeaveConfirm = false

  function leaveToList() {
    skipLeaveConfirm = true
    closeCurrent()
  }

  function applyDetail(detail: Recordable<any>) {
    Object.assign(formModel, emptyForm(), {
      userId: detail.userId,
      name: detail.name || '',
      email: detail.email || '',
      employeeNo: detail.employeeNo || '',
      mobile: detail.mobile || '',
      deptId: detail.deptId || '',
      mainDeptId: detail.mainDeptId || detail.deptId || '',
      supervisorId: detail.supervisorId || '',
      post: detail.post || '',
      extension: detail.extension || '',
      officeLocation: detail.officeLocation || '',
      remark: detail.remark || '',
      entryDate: detail.entryDate || '',
      resignDate: detail.resignDate || '',
      jobCode: detail.jobCode || '',
      jobTitle: detail.jobTitle || '',
      employeeType: detail.employeeType || 'full_time',
      employeeStatus: detail.employeeStatus || 'formal',
      probationMonths: detail.probationMonths || '',
      actualConfirmDate: detail.actualConfirmDate || '',
      plannedConfirmDate: detail.plannedConfirmDate || '',
      jobGrade: detail.jobGrade || '',
      roleIds: Array.isArray(detail.roleIds) ? [...detail.roleIds] : [],
      idName: detail.idName || '',
      idNumber: detail.idNumber || '',
      birthDate: detail.birthDate || '',
      gender: detail.gender || '',
      ethnicity: detail.ethnicity || '',
      idAddress: detail.idAddress || '',
      idValidFrom: detail.idValidFrom || '',
      idValidTo: detail.idValidTo || '',
      maritalStatus: detail.maritalStatus || '',
      firstWorkDate: detail.firstWorkDate || '',
      hukouType: detail.hukouType || '',
      address: detail.address || '',
      politicalStatus: detail.politicalStatus || '',
      socialSecurityNo: detail.socialSecurityNo || '',
      providentFundNo: detail.providentFundNo || '',
      hometown: detail.hometown || '',
      education: detail.education || '',
      school: detail.school || '',
      graduateDate: detail.graduateDate || '',
      major: detail.major || '',
      bankCardNo: detail.bankCardNo || '',
      bankName: detail.bankName || '',
      contractCompany: detail.contractCompany || '',
      contractType: detail.contractType || '',
      firstContractStart: detail.firstContractStart || '',
      firstContractEnd: detail.firstContractEnd || '',
      currentContractStart: detail.currentContractStart || '',
      currentContractEnd: detail.currentContractEnd || '',
      contractTerm: detail.contractTerm || '',
      renewCount: detail.renewCount || '',
      emergencyName: detail.emergencyName || '',
      emergencyRelation: detail.emergencyRelation || '',
      emergencyPhone: detail.emergencyPhone || '',
      familyMembers: Array.isArray(detail.familyMembers) ? detail.familyMembers : [],
      materials: detail.materials && typeof detail.materials === 'object' ? { ...detail.materials } : {},
    })
  }

  async function loadMeta() {
    const [depts, people, roles] = await Promise.all([
      fetchSystemDeptTree(),
      fetchSystemPersons(),
      fetchSystemRoleOptions(),
    ])
    deptTree.value = Array.isArray(depts) ? depts : []
    persons.value = Array.isArray(people) ? people : []
    roleOptions.value = Array.isArray(roles) ? roles : []
  }

  async function load() {
    loading.value = true
    try {
      await loadMeta()
      if (isCreate.value) {
        Object.assign(formModel, emptyForm())
        snapshot.value = snapshotOf(formModel)
        setTab('新增人员')
        return
      }
      const detail = await getSystemPersonDetail(personId.value)
      applyDetail(detail || {})
      snapshot.value = snapshotOf(formModel)
      setTab(formModel.name ? `编辑-${formModel.name}` : '编辑人员')
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onDeptChange(value: unknown) {
    const id = String(value || '')
    formModel.deptId = id
    if (!formModel.mainDeptId) formModel.mainDeptId = id
  }

  function onIdNumberBlur() {
    const parsed = parseIdCard(formModel.idNumber || '')
    if (!parsed) return
    if (!formModel.birthDate) formModel.birthDate = parsed.birthDate
    if (!formModel.gender) formModel.gender = parsed.gender
    if (!formModel.idName) formModel.idName = formModel.name
  }

  function onFamilyChange(value: PersonFamilyMember[]) {
    formModel.familyMembers = value
  }

  function onMaterialsChange(value: PersonMaterials) {
    formModel.materials = value
  }

  async function submit() {
    try {
      await formRef.value?.validate?.()
    } catch {
      message.warning('请先完善必填信息')
      return
    }
    saving.value = true
    try {
      const payload: SystemPersonSavePayload = { ...formModel }
      if (isCreate.value) {
        await createSystemPerson(payload)
        message.success('新增成功')
      } else {
        await updateSystemPerson(personId.value, payload)
        message.success('保存成功')
      }
      snapshot.value = snapshotOf(formModel)
      leaveToList()
    } catch (error) {
      message.error(toMessage(error, '保存失败'))
    } finally {
      saving.value = false
    }
  }

  function onBack() {
    if (!isCreate.value && dirty.value && !window.confirm('有未保存的修改，确定离开？')) return
    leaveToList()
  }

  onBeforeRouteLeave((_to, _from, next) => {
    if (skipLeaveConfirm || isCreate.value) {
      skipLeaveConfirm = false
      next()
      return
    }
    if (dirty.value && !window.confirm('有未保存的修改，确定离开？')) {
      next(false)
      return
    }
    next()
  })

  watch(
    () => formModel.idNumber,
    (value) => {
      if (String(value || '').trim().length >= 18) onIdNumberBlur()
    },
  )

  watch(
    () => ({ name: String(route.name), id: personId.value }),
    ({ name }) => {
      if (name !== 'PersonCreate' && name !== 'PersonEdit') return
      void load()
    },
    { immediate: true },
  )

  return {
    loading,
    saving,
    isCreate,
    formRef,
    formModel,
    formRules,
    deptTree,
    supervisorOptions,
    roleSelectOptions,
    tenureText,
    ageText,
    workYearsText,
    onDeptChange,
    onIdNumberBlur,
    onFamilyChange,
    onMaterialsChange,
    submit,
    onBack,
  }
}
