import { ref, computed, onMounted, type Ref } from 'vue'
import { AtomicComponent, BaseComponent, BusinessComponent } from '../../../static/moduleMap'

export const useInit = () => {
  const currentUse = ref({})
  const activeName = ref('BaseComponent')
  const collapseModel: Ref<string[]> = ref([])

  const drageMap = computed(() => {
    const drageConfig: Record<string, Map<string, any>> = {
      BaseComponent,
      AtomicComponent,
      BusinessComponent,
    }
    return drageConfig[activeName.value] || new Map()
  })

  const onTableChange = () => {
    collapseModel.value = [...drageMap.value.keys()]
  }

  onMounted(() => {
    onTableChange()
  })

  return {
    currentUse,
    activeName,
    drageMap,
    collapseModel,
    onTableChange,
  }
}
