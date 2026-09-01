import { computed, reactive, ref } from 'vue'
import type { SearchBarField } from '@grow-admin-rock/components/search-bar'
import { useMsg } from '@grow-admin-rock/components'
import type { EChartsOption } from 'echarts'
import { fetchSystemDeptTree, fetchSystemDeptRelated, getSystemDeptDetail } from '../../../api/systemDept'
import { fetchSystemOrgChart } from '../../../api/systemOrgChart'
import { getSystemPersonDetail } from '../../../api/systemPerson'
import { fetchSystemPosts, getSystemPostDetail } from '../../../api/systemPost'
import { EMPLOYEE_STATUS_OPTIONS } from '../../../types/systemPerson'
import type { SystemPersonDetail } from '../../../types/systemPerson'
import type { SystemDeptDetail, SystemDeptNode, SystemDeptRelated } from '../../../types/systemDept'
import type { SystemPostDetail } from '../../../types/systemPost'
import {
  ORG_CHART_MODE_OPTIONS,
  type OrgChartDept,
  type OrgChartLink,
  type OrgChartMode,
  type OrgChartNode,
  type OrgChartPerson,
  type OrgChartPost,
  type OrgChartResult,
} from '../../../types/systemOrgChart'
import { parseFlag, toMessage, ORG_CHART_COLORS } from './helpers'

type TreeOption = {
  id: string
  title: string
  children?: TreeOption[]
}

const FLAG_OPTIONS = [
  { label: '否', value: 'false' },
  { label: '是', value: 'true' },
]

function unwrapOrgChart(data: unknown): OrgChartResult | null {
  if (!data || typeof data !== 'object') return null
  const rec = data as Record<string, unknown>
  const inner = (Array.isArray((rec as OrgChartResult).nodes)
    ? rec
    : rec.data && typeof rec.data === 'object'
      ? rec.data
      : rec.result && typeof rec.result === 'object'
        ? rec.result
        : null) as OrgChartResult | null
  if (!inner || !Array.isArray(inner.nodes)) return null
  return {
    mode: inner.mode === 'report' || inner.mode === 'mixed' ? inner.mode : 'dept',
    nodes: inner.nodes,
    links: Array.isArray(inner.links) ? inner.links : [],
    depts: Array.isArray(inner.depts) ? inner.depts : [],
    people: Array.isArray(inner.people) ? inner.people : [],
    posts: Array.isArray(inner.posts) ? inner.posts : [],
  }
}

function mapDeptTree(nodes: SystemDeptNode[] | unknown): TreeOption[] {
  if (!Array.isArray(nodes)) return []
  return nodes.map((node) => ({
    id: node.id,
    title: node.name,
    children: node.children?.length ? mapDeptTree(node.children) : undefined,
  }))
}

function collectDescendants(rootId: string, nodes: OrgChartNode[]) {
  const ids = new Set<string>([rootId])
  let added = true
  while (added) {
    added = false
    for (const node of nodes) {
      if (ids.has(node.id) || !ids.has(node.parentId)) continue
      ids.add(node.id)
      added = true
    }
  }
  ids.delete(rootId)
  return ids
}

function statusText(status?: string) {
  return EMPLOYEE_STATUS_OPTIONS.find((item) => item.value === status)?.label || status || ''
}

export function useOrgChart() {
  const message = useMsg() as any
  const loading = ref(false)
  const snapshot = ref<OrgChartResult | null>(null)
  const deptOptions = reactive<TreeOption[]>([])
  const deptId = ref('')
  const collapsed = ref<Set<string>>(new Set())
  const selectedId = ref('')
  const selectedPostId = ref('')
  const detailLoading = ref(false)
  const deptDetail = ref<SystemDeptDetail | null>(null)
  const deptRelated = ref<SystemDeptRelated | null>(null)
  const personDetail = ref<SystemPersonDetail | null>(null)
  const postDetail = ref<SystemPostDetail | null>(null)
  let detailSeq = 0
  const query = ref<Recordable<any>>({
    mode: 'mixed',
    deptId: '',
    includeResigned: 'false',
    includeRetired: 'false',
    includeDisabledPeople: 'false',
    includeDisabledDepts: 'false',
  })
  const postOptions = reactive<Array<{ label: string; value: string }>>([])

  const searchList: SearchBarField[] = [
    {
      labelText: '部门',
      elType: 'GrowTreeSelect',
      isDefault: true,
      model: 'deptId',
      placeholder: '全部部门',
      clearable: true,
      filterable: true,
      checkStrictly: true,
      defaultExpandAll: true,
      data: deptOptions,
      props: { label: 'title', value: 'id', children: 'children' },
    },
    {
      labelText: '人员',
      placeholder: '姓名或工号',
      elType: 'GrowInput',
      isDefault: true,
      model: 'personKeyword',
      noDelete: true,
      clearable: true,
    },
    {
      labelText: '岗位',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'postId',
      label: 'label',
      value: 'value',
      placeholder: '请选择岗位',
      clearable: true,
      filterable: true,
      options: postOptions,
    },
    {
      labelText: '人员状态',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'employeeStatus',
      label: 'label',
      value: 'value',
      placeholder: '全部',
      clearable: true,
      options: EMPLOYEE_STATUS_OPTIONS.map((item) => ({ label: item.label, value: item.value })),
    },
    {
      labelText: '展示离职人员',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'includeResigned',
      label: 'label',
      value: 'value',
      options: FLAG_OPTIONS,
    },
    {
      labelText: '展示退休人员',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'includeRetired',
      label: 'label',
      value: 'value',
      options: FLAG_OPTIONS,
    },
    {
      labelText: '展示停用人员',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'includeDisabledPeople',
      label: 'label',
      value: 'value',
      options: FLAG_OPTIONS,
    },
    {
      labelText: '展示停用部门',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'includeDisabledDepts',
      label: 'label',
      value: 'value',
      options: FLAG_OPTIONS,
    },
    {
      labelText: '展示模式',
      elType: 'GrowSelect',
      isDefault: true,
      model: 'mode',
      noDelete: true,
      label: 'label',
      value: 'value',
      options: ORG_CHART_MODE_OPTIONS.map((item) => ({ label: item.label, value: item.value })),
    },
  ]

  const mode = computed<OrgChartMode>(() => {
    const value = query.value.mode
    return value === 'report' || value === 'mixed' ? value : 'dept'
  })

  const hiddenIds = computed(() => {
    const nodes = snapshot.value?.nodes || []
    const hidden = new Set<string>()
    collapsed.value.forEach((id) => {
      collectDescendants(id, nodes).forEach((item) => hidden.add(item))
    })
    return hidden
  })

  const visibleNodes = computed(() => (snapshot.value?.nodes || []).filter((item) => !hiddenIds.value.has(item.id)))
  const visibleLinks = computed(() => (snapshot.value?.links || []).filter((item) =>
    !hiddenIds.value.has(item.source) && !hiddenIds.value.has(item.target)
    && visibleNodes.value.some((node) => node.id === item.source)
    && visibleNodes.value.some((node) => node.id === item.target)))

  const deptById = computed(() => new Map((snapshot.value?.depts || []).map((item) => [item.id, item])))
  const personById = computed(() => new Map((snapshot.value?.people || []).map((item) => [item.id, item])))
  const postById = computed(() => new Map((snapshot.value?.posts || []).map((item) => [item.id, item])))

  const selectedDept = computed<OrgChartDept | null>(() => {
    if (!selectedId.value.startsWith('dept:')) return null
    return deptById.value.get(selectedId.value.slice(5)) || null
  })
  const selectedPerson = computed<OrgChartPerson | null>(() => {
    if (selectedPostId.value || !selectedId.value.startsWith('person:')) return null
    return personById.value.get(selectedId.value.slice(7)) || null
  })
  const selectedPost = computed<OrgChartPost | null>(() => {
    if (!selectedPostId.value) return null
    return postById.value.get(selectedPostId.value) || null
  })

  const chartOption = computed<EChartsOption>(() => {
    const reportCount = new Map<string, number>()
    visibleLinks.value.forEach((item) => {
      if (item.kind === 'report') {
        reportCount.set(item.source, (reportCount.get(item.source) || 0) + 1)
      }
    })

    const categoryIds: string[] = []
    const categoryIndex = new Map<string, number>()
    const takeCategory = (key: string) => {
      const current = categoryIndex.get(key)
      if (current != null) return current
      const index = categoryIds.length
      categoryIds.push(key)
      categoryIndex.set(key, index)
      return index
    }

    const nodes = visibleNodes.value.map((item) => {
      const dept = item.kind === 'dept' ? deptById.value.get(item.refId) : undefined
      const person = item.kind === 'person' ? personById.value.get(item.refId) : undefined
      const categoryKey = item.kind === 'dept' ? item.refId : (person?.deptId || '_none')
      const collapsedNode = collapsed.value.has(item.id)
      const tooltip = item.kind === 'dept'
        ? [
          `${item.name}（部门）`,
          `负责人：${dept?.managerName || '未设负责人'}`,
          `人员 ${dept?.personCount || 0} · 岗位 ${dept?.postCount || 0}`,
          collapsedNode ? '已收起下级' : '',
        ].filter(Boolean).join('\n')
        : [
          `${item.name}（人员）`,
          `岗位：${person?.postName || '-'}`,
          `部门：${person?.deptName || '-'}`,
          `状态：${statusText(person?.employeeStatus)}`,
        ].join('\n')
      return {
        id: item.id,
        name: item.name,
        category: takeCategory(categoryKey),
        symbol: 'circle',
        symbolSize: item.kind === 'dept'
          ? Math.min(56, 26 + Math.max(dept?.personCount || 0, 1) * 3)
          : Math.min(28, 12 + (reportCount.get(item.id) || 0) * 3),
        itemStyle: {
          ...(item.disabled ? { color: '#94a3b8' } : {}),
          borderColor: '#fff',
          borderWidth: 1,
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontSize: item.kind === 'dept' ? 13 : 11,
          fontWeight: item.kind === 'dept' ? 600 : 400,
        },
        tooltip,
      }
    })

    const usedNames = new Set<string>()
    const categories = categoryIds.map((id, index) => {
      const raw = id === '_none' ? '未分配' : (deptById.value.get(id)?.name || id)
      const name = usedNames.has(raw) ? `${raw}·${id}` : raw
      usedNames.add(name)
      return {
        name,
        itemStyle: { color: ORG_CHART_COLORS[index % ORG_CHART_COLORS.length] },
      }
    })

    const links = visibleLinks.value.map((item: OrgChartLink) => ({
      source: item.source,
      target: item.target,
      lineStyle: {
        type: item.kind === 'collab' ? 'dashed' : 'solid',
        width: item.kind === 'report' ? 1.4 : 1,
        curveness: item.kind === 'collab' ? 0.28 : 0.2,
        opacity: item.kind === 'collab' ? 0.45 : 0.65,
      },
    }))

    const count = nodes.length
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params?.dataType === 'edge') return ''
          return params?.data?.tooltip || params?.data?.name || ''
        },
      },
      legend: categories.length ? {
        type: 'scroll',
        orient: 'vertical',
        left: 12,
        top: 'middle',
        data: categories.map((item) => item.name),
        textStyle: { fontSize: 12 },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
      } : undefined,
      animationDuration: 800,
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        zoom: 1,
        scaleLimit: { min: 0.35, max: 3 },
        categories,
        data: nodes,
        links,
        lineStyle: {
          color: 'source',
          curveness: 0.2,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2.4, opacity: 1 },
        },
        force: {
          repulsion: count > 24 ? 160 : 280,
          gravity: 0.08,
          edgeLength: count > 24 ? [36, 96] : 88,
          friction: 0.6,
        },
      }],
    }
  })

  async function loadOptions() {
    const [tree, posts] = await Promise.all([
      fetchSystemDeptTree(true),
      fetchSystemPosts(),
    ])
    deptOptions.splice(0, deptOptions.length, ...mapDeptTree(tree))
    postOptions.splice(0, postOptions.length, ...(Array.isArray(posts) ? posts : []).map((item) => ({
      label: item.name,
      value: item.id,
    })))
  }

  async function loadChart() {
    loading.value = true
    try {
      snapshot.value = unwrapOrgChart(await fetchSystemOrgChart({
        deptId: deptId.value,
        personKeyword: query.value.personKeyword,
        postId: query.value.postId,
        employeeStatus: query.value.employeeStatus,
        includeResigned: parseFlag(query.value.includeResigned),
        includeRetired: parseFlag(query.value.includeRetired),
        includeDisabledPeople: parseFlag(query.value.includeDisabledPeople),
        includeDisabledDepts: parseFlag(query.value.includeDisabledDepts),
        mode: mode.value,
      }))
      collapsed.value = new Set()
      selectedId.value = ''
      selectedPostId.value = ''
      resetDetails()
      locateFromQuery()
      if (selectedId.value) void loadDetail()
    } catch (error) {
      message.error(toMessage(error, '加载组织架构失败'))
    } finally {
      loading.value = false
    }
  }

  function locateFromQuery() {
    const personKeyword = String(query.value.personKeyword || '').trim()
    if (personKeyword) {
      const person = (snapshot.value?.people || []).find((item) =>
        item.name.includes(personKeyword) || item.employeeNo.includes(personKeyword))
      if (person) {
        selectedId.value = `person:${person.id}`
        selectedPostId.value = ''
        expandAncestors(selectedId.value)
        return
      }
    }
  }

  function resetDetails() {
    deptDetail.value = null
    deptRelated.value = null
    personDetail.value = null
    postDetail.value = null
  }

  async function loadDetail() {
    const seq = ++detailSeq
    const postId = selectedPostId.value
    const nodeId = selectedId.value
    resetDetails()
    if (!postId && !nodeId) {
      detailLoading.value = false
      return
    }
    detailLoading.value = true
    try {
      if (postId) {
        const detail = await getSystemPostDetail(postId)
        if (seq !== detailSeq) return
        postDetail.value = detail
      } else if (nodeId.startsWith('dept:')) {
        const id = nodeId.slice(5)
        const [detail, related] = await Promise.all([
          getSystemDeptDetail(id),
          fetchSystemDeptRelated(id),
        ])
        if (seq !== detailSeq) return
        deptDetail.value = detail
        deptRelated.value = related
      } else if (nodeId.startsWith('person:')) {
        const detail = await getSystemPersonDetail(nodeId.slice(7))
        if (seq !== detailSeq) return
        personDetail.value = detail
      }
    } catch (error) {
      if (seq === detailSeq) message.error(toMessage(error, '加载详情失败'))
    } finally {
      if (seq === detailSeq) detailLoading.value = false
    }
  }

  function expandAncestors(nodeId: string) {
    const nodes = snapshot.value?.nodes || []
    const next = new Set(collapsed.value)
    let cursor = nodes.find((item) => item.id === nodeId)
    while (cursor?.parentId) {
      next.delete(cursor.parentId)
      cursor = nodes.find((item) => item.id === cursor?.parentId)
    }
    collapsed.value = next
  }

  function selectNode(id: string) {
    selectedId.value = id
    selectedPostId.value = ''
    void loadDetail()
  }

  function toggleCollapse(id: string) {
    const node = snapshot.value?.nodes?.find((item) => item.id === id)
    if (node?.kind !== 'dept') return
    const next = new Set(collapsed.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    collapsed.value = next
  }

  function selectPost(postId: string) {
    selectedPostId.value = postId
    void loadDetail()
  }

  function clearSelection() {
    detailSeq += 1
    selectedId.value = ''
    selectedPostId.value = ''
    detailLoading.value = false
    resetDetails()
  }

  function onSearch(payload: Recordable<any>) {
    query.value = {
      ...query.value,
      ...payload,
      mode: payload.mode || query.value.mode || 'mixed',
    }
    deptId.value = String(payload.deptId || '')
    void loadChart()
  }

  async function bootstrap() {
    try {
      await loadOptions()
    } catch (error) {
      message.error(toMessage(error, '加载筛选失败'))
    }
    await loadChart()
  }

  const detailVisible = computed(() => Boolean(selectedId.value || selectedPostId.value))

  return {
    loading,
    searchList,
    query,
    chartOption,
    selectedDept,
    selectedPerson,
    selectedPost,
    selectedId,
    detailVisible,
    detailLoading,
    deptDetail,
    deptRelated,
    personDetail,
    postDetail,
    bootstrap,
    onSearch,
    selectNode,
    toggleCollapse,
    selectPost,
    clearSelection,
    loadChart,
  }
}
