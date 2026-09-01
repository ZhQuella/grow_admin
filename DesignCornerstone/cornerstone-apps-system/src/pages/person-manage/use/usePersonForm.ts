import { computed, reactive, ref, watch } from 'vue'
import { useMsg } from '@grow-admin-rock/components'
import { useTabs } from '@grow-admin-rock/hooks'
import { fetchSystemDeptTree, fetchSystemPersons } from '../../../api/systemRole'
import { createSystemPerson } from '../../../api/systemPerson'
import type { SystemDeptTreeNode, SystemPerson } from '../../../types/systemRole'
import type {
  PersonAssignment,
  PersonEmergencyContact,
  PersonFamilyMember,
  PersonMaterials,
} from '../../../types/systemPerson'
import { calcAge, parseIdCard, toMessage, validateGrowForm, yearsAndMonths } from './helpers'
import {
  buildPersonSavePayload,
  emptyPersonForm,
  setPersonMaterials,
  syncEmergencyToForm,
  syncPrimaryFromAssignments,
  type PersonFormModel,
} from './personFormModel'

export function usePersonForm() {
  const { setTab, closeCurrent } = useTabs()
  const message = useMsg()

  const loading = ref(false)
  const saving = ref(false)
  const formRef = ref()
  const formModel = reactive<PersonFormModel>(emptyPersonForm())
  const deptTree = ref<SystemDeptTreeNode[]>([])
  const persons = ref<SystemPerson[]>([])

  const formRules = {
    name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
    email: [{ required: true, message: '请填写邮箱', trigger: 'blur' }],
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

  const tenureText = computed(() =>
    yearsAndMonths(
      formModel.entryDate,
      formModel.employeeStatus === 'resigned' ? formModel.resignDate : undefined,
    ) || '系统计算',
  )

  const ageText = computed(() => calcAge(formModel.birthDate) || '系统计算')
  const workYearsText = computed(() => yearsAndMonths(formModel.firstWorkDate) || '系统计算')

  async function load() {
    loading.value = true
    try {
      const [depts, people] = await Promise.all([
        fetchSystemDeptTree(),
        fetchSystemPersons(),
      ])
      deptTree.value = Array.isArray(depts) ? depts : []
      persons.value = Array.isArray(people) ? people : []
      Object.assign(formModel, emptyPersonForm())
      setTab('新增人员')
    } catch (error) {
      message.error(toMessage(error, '加载失败'))
    } finally {
      loading.value = false
    }
  }

  function onAssignmentsChange(value: PersonAssignment[]) {
    syncPrimaryFromAssignments(formModel, value)
  }

  function onIdNumberBlur() {
    const parsed = parseIdCard(formModel.idNumber || '')
    if (!parsed) return
    if (!formModel.birthDate) formModel.birthDate = parsed.birthDate
    if (!formModel.gender) formModel.gender = parsed.gender
    if (!formModel.idName) formModel.idName = formModel.name
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

  async function submit() {
    try {
      await validateGrowForm(formRef)
    } catch {
      message.warning('请先完善必填信息')
      return
    }
    const assignments = formModel.assignments || []
    const active = assignments.filter((item) => item.status !== 'ended')
    const primaries = active.filter((item) => item.type === 'primary')
    if (!active.length) {
      message.warning('请至少添加一条任职关系')
      return
    }
    if (primaries.length !== 1) {
      message.warning('必须且只能设置一条主职')
      return
    }
    if (active.some((item) => !item.deptId || !item.postId || !item.jobGrade)) {
      message.warning('请完善任职关系的部门、岗位和职级')
      return
    }
    if (active.some((item) => item.type === 'part_time' && !item.startDate)) {
      message.warning('请选择兼职开始日期')
      return
    }
    const keys = new Set<string>()
    for (const item of active) {
      const key = `${item.deptId}:${item.postId}`
      if (keys.has(key)) {
        message.warning('同一部门同一岗位不可重复添加有效任职')
        return
      }
      keys.add(key)
    }
    if (assignments.some((item) =>
      item.supervisorId && (item.collaboratorIds || []).includes(item.supervisorId),
    )) {
      message.warning('同一任职下协同上级不能与直属主管重复')
      return
    }
    saving.value = true
    try {
      await createSystemPerson(buildPersonSavePayload(formModel))
      message.success('新增成功')
      closeCurrent()
    } catch (error) {
      message.error(toMessage(error, '保存失败'))
    } finally {
      saving.value = false
    }
  }

  watch(
    () => formModel.idNumber,
    (value) => {
      if (String(value || '').trim().length >= 18) onIdNumberBlur()
    },
  )

  void load()

  return {
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
    onBack: closeCurrent,
  }
}
