import { occupyHeadcount } from '../../../types/systemPerson'
import type {
  PersonAssignment,
  PersonEmergencyContact,
  PersonFamilyMember,
  PersonMaterials,
  SystemPersonSavePayload,
} from '../../../types/systemPerson'
import {
  emptyAssignment,
  emptyEmergencyContact,
  emptyFamilyMember,
  hasAssignmentContent,
  hasEmergencyContent,
  hasFamilyContent,
  normalizeEmergencyContacts,
  todayText,
} from './helpers'

export type PersonFormModel = SystemPersonSavePayload & {
  userId?: string
}

export function emptyPersonForm(): PersonFormModel {
  return {
    name: '',
    email: '',
    employeeNo: '',
    mobile: '',
    deptId: '',
    mainDeptId: '',
    supervisorId: '',
    collaboratorIds: [],
    assignments: [emptyAssignment()],
    post: '',
    postId: '',
    idType: 'id_card',
    extension: '',
    officeLocation: '',
    remark: '',
    entryDate: todayText(),
    resignDate: '',
    retireDate: '',
    jobCode: '',
    jobTitle: '',
    employeeType: 'full_time',
    employeeStatus: 'pending',
    previousStatus: undefined,
    probationMonths: '3',
    probationStart: '',
    probationEnd: '',
    actualConfirmDate: '',
    plannedConfirmDate: '',
    jobGrade: '',
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
    emergencyContacts: [emptyEmergencyContact()],
    familyMembers: [emptyFamilyMember()],
    materials: {},
  }
}

export function applyPersonDetail(formModel: PersonFormModel, detail: Recordable<any>) {
  Object.assign(formModel, emptyPersonForm(), {
    userId: detail.userId,
    name: detail.name || '',
    email: detail.email || '',
    employeeNo: detail.employeeNo || '',
    mobile: detail.mobile || '',
    deptId: detail.deptId || '',
    mainDeptId: detail.mainDeptId || detail.deptId || '',
    supervisorId: detail.supervisorId || '',
    collaboratorIds: Array.isArray(detail.collaboratorIds) ? [...detail.collaboratorIds] : [],
    assignments: (() => {
      const rows = Array.isArray(detail.assignments)
        ? detail.assignments.map((item: PersonAssignment) => {
            const usePerson = item.type === 'primary' && item.status !== 'ended'
            return {
              ...item,
              jobCode: item.jobCode || (usePerson ? detail.jobCode : '') || '',
              jobTitle: item.jobTitle || (usePerson ? detail.jobTitle : '') || '',
              jobGrade: item.jobGrade || (usePerson ? detail.jobGrade : '') || '',
              supervisorId: item.supervisorId || (usePerson ? detail.supervisorId : '') || '',
              collaboratorIds: item.collaboratorIds?.length
                ? [...item.collaboratorIds]
                : (usePerson && Array.isArray(detail.collaboratorIds) ? [...detail.collaboratorIds] : []),
            }
          })
        : []
      return rows.some(hasAssignmentContent) ? rows : [emptyAssignment()]
    })(),
    post: detail.post || '',
    postId: detail.postId || '',
    idType: detail.idType || 'id_card',
    extension: detail.extension || '',
    officeLocation: detail.officeLocation || '',
    remark: detail.remark || '',
    entryDate: detail.entryDate || '',
    resignDate: detail.resignDate || '',
    retireDate: detail.retireDate || '',
    jobCode: detail.jobCode || '',
    jobTitle: detail.jobTitle || '',
    employeeType: detail.employeeType || 'full_time',
    employeeStatus: detail.employeeStatus || 'pending',
    previousStatus: detail.previousStatus,
    supervisorName: detail.supervisorName || '',
    probationMonths: detail.probationMonths || '',
    probationStart: detail.probationStart || '',
    probationEnd: detail.probationEnd || '',
    actualConfirmDate: detail.actualConfirmDate || '',
    plannedConfirmDate: detail.plannedConfirmDate || '',
    jobGrade: detail.jobGrade || '',
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
    emergencyContacts: (() => {
      const rows = normalizeEmergencyContacts(detail)
      return rows.some(hasEmergencyContent)
        ? rows.map((item) => ({ ...item }))
        : [emptyEmergencyContact()]
    })(),
    familyMembers: Array.isArray(detail.familyMembers) && detail.familyMembers.some(hasFamilyContent)
      ? detail.familyMembers.map((item: PersonFamilyMember) => ({ ...item }))
      : [emptyFamilyMember()],
    materials: detail.materials && typeof detail.materials === 'object' ? { ...detail.materials } : {},
  })
}

export function syncPrimaryFromAssignments(formModel: PersonFormModel, value: PersonAssignment[]) {
  formModel.assignments = value.map((item) => ({
    ...item,
    occupyHeadcount: occupyHeadcount(item.type),
  }))
  const primary = value.find((item) => item.type === 'primary' && item.status !== 'ended')
  formModel.deptId = primary?.deptId || ''
  formModel.mainDeptId = primary?.deptId || ''
  formModel.post = primary?.postName || ''
  formModel.postId = primary?.postId || ''
  formModel.jobCode = primary?.jobCode || ''
  formModel.jobTitle = primary?.jobTitle || primary?.postName || ''
  formModel.jobGrade = primary?.jobGrade || ''
  formModel.supervisorId = primary?.supervisorId || ''
  formModel.collaboratorIds = [...(primary?.collaboratorIds || [])]
}

export function syncEmergencyToForm(formModel: PersonFormModel, value: PersonEmergencyContact[]) {
  formModel.emergencyContacts = value
  const first = value[0]
  formModel.emergencyName = first?.name || ''
  formModel.emergencyRelation = first?.relation || ''
  formModel.emergencyPhone = first?.phone || ''
}

export function buildPersonSavePayload(formModel: PersonFormModel): SystemPersonSavePayload {
  const emergencyContacts = (formModel.emergencyContacts || []).filter(hasEmergencyContent)
  const first = emergencyContacts[0]
  return {
    ...formModel,
    emergencyContacts,
    emergencyName: first?.name || '',
    emergencyRelation: first?.relation || '',
    emergencyPhone: first?.phone || '',
    familyMembers: (formModel.familyMembers || []).filter(hasFamilyContent),
  }
}

export function setPersonMaterials(formModel: PersonFormModel, value: PersonMaterials) {
  formModel.materials = value
}
