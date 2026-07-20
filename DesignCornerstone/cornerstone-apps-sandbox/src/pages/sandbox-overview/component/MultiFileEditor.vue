<template>
  <div class="multi-file-editor flex h-full min-h-0 flex-col overflow-hidden">
    <div
      class="multi-file-editor__bar flex shrink-0 items-center gap-2 border-b border-solid border-border px-2"
    >
      <GrowTabs
        v-model="activeFile"
        type="card"
        class="multi-file-editor__tabs min-w-0 flex-1"
        @tab-change="onTabChange"
        @tab-remove="onClose"
      >
        <GrowTabPane
          v-for="name in tabOrder"
          :key="name"
          :name="name"
          :label="name"
          :closable="name !== entry"
        >
          <template #label>
            <span class="inline-flex items-center gap-1" @dblclick.stop="onRename(name)">
              <span>{{ name }}</span>
              <span
                v-if="name === entry"
                class="rounded bg-component px-1 text-[10px] text-text-secondary"
              >入口</span>
            </span>
          </template>
        </GrowTabPane>
      </GrowTabs>
      <GrowDropdown
        trigger="click"
        placement="bottom-end"
        :show-arrow="false"
        class="shrink-0"
        @command="onFileMenuCommand"
      >
        <GrowButton size="small" type="primary" circle title="文件操作" aria-label="文件操作">
          <GrowIconify icon="ant-design:setting-outlined" :size="14" />
        </GrowButton>
        <template #dropdown>
          <GrowDropdownMenu>
            <GrowDropdownItem command="add">新建文件</GrowDropdownItem>
            <GrowDropdownItem
              command="rename"
              :disabled="activeFile === entry"
            >
              重命名
            </GrowDropdownItem>
          </GrowDropdownMenu>
        </template>
      </GrowDropdown>
    </div>
    <GrowCodeEditor
      ref="editorRef"
      v-model="activeCode"
      :default-language="languageOf(activeFile)"
      :language-switchable="false"
      class="min-h-0 flex-1 overflow-hidden"
      :options="editorOptions"
    />

    <GrowDialog
      v-model="fileDialogVisible"
      :title="fileDialogTitle"
      width="420px"
      append-to-body
      destroy-on-close
    >
      <div class="flex flex-col gap-2 py-1">
        <div class="flex items-center gap-2">
          <GrowInput
            v-model="fileNameInput"
            class="min-w-0 flex-1"
            placeholder="例如 Comp 或 components/Foo"
            clearable
            @keyup.enter="confirmFileDialog"
          />
          <div class="w-20 shrink-0">
            <GrowSelect
              v-model="fileExt"
              class="w-full"
              :options="fileExtOptions"
            />
          </div>
        </div>
        <p v-if="dialogError" class="m-0 text-sm text-error">{{ dialogError }}</p>
      </div>
      <template #footer>
        <GrowSpace>
          <GrowButton @click="fileDialogVisible = false">取消</GrowButton>
          <GrowButton type="primary" @click="confirmFileDialog">确定</GrowButton>
        </GrowSpace>
      </template>
    </GrowDialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  GrowCodeEditor,
  type CodeEditorLanguage,
  type CodeEditorOptions,
} from '@grow-admin-rock/code-sandbox'
import { normalizeSandboxPath } from '@grow-admin-rock/code-sandbox'

defineOptions({
  name: 'SandboxMultiFileEditor',
})

const props = withDefaults(
  defineProps<{
    files: Record<string, string>
    entry?: string
    editorOptions?: CodeEditorOptions
  }>(),
  {
    entry: 'App.vue',
    editorOptions: () => ({ theme: 'auto' }),
  },
)

const emit = defineEmits<{
  'update:files': [value: Record<string, string>]
}>()

const entry = computed(() => normalizeSandboxPath(props.entry || 'App.vue'))
const editorRef = ref<InstanceType<typeof GrowCodeEditor> | null>(null)

const tabOrder = ref<string[]>([])
const activeFile = ref('')

type FileDialogMode = 'add' | 'rename'
type FileExt = '.vue' | '.js'

const fileDialogVisible = ref(false)
const fileDialogMode = ref<FileDialogMode>('add')
const renameFrom = ref('')
const fileNameInput = ref('')
const fileExt = ref<FileExt>('.vue')
const dialogError = ref('')

const fileExtOptions = [
  { label: '.vue', value: '.vue' },
  { label: '.js', value: '.js' },
]

const fileDialogTitle = computed(() =>
  fileDialogMode.value === 'add' ? '新建文件' : '重命名',
)

function syncTabsFromFiles() {
  const names = Object.keys(props.files).map(normalizeSandboxPath)
  const entryName = entry.value
  const rest = names.filter((n) => n !== entryName).sort()
  const nextOrder = names.includes(entryName) ? [entryName, ...rest] : rest
  tabOrder.value = nextOrder
  if (!activeFile.value || !(activeFile.value in props.files)) {
    activeFile.value = nextOrder[0] || entryName
  }
}

syncTabsFromFiles()

watch(
  () => Object.keys(props.files).join('\0'),
  () => syncTabsFromFiles(),
)

const activeCode = computed({
  get: () => props.files[activeFile.value] ?? '',
  set: (value: string) => {
    emit('update:files', {
      ...props.files,
      [activeFile.value]: value,
    })
  },
})

function languageOf(name: string): CodeEditorLanguage {
  return /\.vue$/i.test(name) ? 'vue' : 'javascript'
}

async function selectFile(name: string) {
  if (!name || name === activeFile.value) return
  activeFile.value = name
  await nextTick()
  editorRef.value?.setLanguage(languageOf(name))
}

function onTabChange(name: string | number) {
  void selectFile(String(name))
}

function isValidFileName(name: string) {
  const normalized = normalizeSandboxPath(name)
  return /^[A-Za-z0-9_./-]+\.(vue|js)$/.test(normalized) && !normalized.includes('..')
}

function onFileMenuCommand(command: string | number) {
  const action = String(command)
  if (action === 'add') {
    openAddDialog()
    return
  }
  if (action === 'rename') {
    openRenameDialog(activeFile.value)
  }
}

function splitFileName(name: string): { base: string; ext: FileExt } {
  const normalized = normalizeSandboxPath(name)
  const match = normalized.match(/^(.*?)(\.(vue|js))$/i)
  if (!match) {
    return { base: normalized, ext: '.vue' }
  }
  return {
    base: match[1],
    ext: match[2].toLowerCase() as FileExt,
  }
}

function openAddDialog() {
  fileDialogMode.value = 'add'
  renameFrom.value = ''
  fileNameInput.value = 'Comp'
  fileExt.value = '.vue'
  dialogError.value = ''
  fileDialogVisible.value = true
}

function openRenameDialog(name: string) {
  if (!name || name === entry.value) return
  const { base, ext } = splitFileName(name)
  fileDialogMode.value = 'rename'
  renameFrom.value = name
  fileNameInput.value = base
  fileExt.value = ext
  dialogError.value = ''
  fileDialogVisible.value = true
}

function resolveDialogFileName() {
  const base = fileNameInput.value.trim().replace(/\.(vue|js)$/i, '')
  return normalizeSandboxPath(`${base}${fileExt.value}`)
}

function confirmFileDialog() {
  const name = resolveDialogFileName()
  if (!isValidFileName(name)) {
    dialogError.value = '文件名无效，仅支持 .vue / .js'
    return
  }

  if (fileDialogMode.value === 'add') {
    if (name in props.files) {
      dialogError.value = '文件已存在'
      return
    }
    const content = fileExt.value === '.vue'
      ? `<template>\n  <div>${name}</div>\n</template>\n\n` + '<script setup>\n</' + 'script>\n'
      : `export function hello() {\n  return 'hello from ${name}'\n}\n`
    emit('update:files', { ...props.files, [name]: content })
    fileDialogVisible.value = false
    void selectFile(name)
    return
  }

  const from = renameFrom.value
  if (!from || from === entry.value) return
  if (name === from) {
    fileDialogVisible.value = false
    return
  }
  if (name in props.files) {
    dialogError.value = '目标文件名已存在'
    return
  }
  const next = { ...props.files }
  next[name] = next[from]
  delete next[from]
  emit('update:files', next)
  fileDialogVisible.value = false
  void selectFile(name)
}

function onClose(name: string | number) {
  const fileName = String(name)
  if (fileName === entry.value) return
  if (!window.confirm(`关闭并删除 ${fileName}？`)) return
  const next = { ...props.files }
  delete next[fileName]
  emit('update:files', next)
  if (activeFile.value === fileName) {
    void selectFile(entry.value)
  }
}

function onRename(name: string) {
  openRenameDialog(name)
}

watch(activeFile, async (name) => {
  if (!name) return
  await nextTick()
  editorRef.value?.setLanguage(languageOf(name))
})
</script>

<style scoped>
.multi-file-editor__bar {
  min-height: 40px;
}

.multi-file-editor__tabs {
  :deep(.el-tabs__header),
  :deep(.n-tabs-nav),
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }

  /* 编辑器在 Tab 外单独渲染，隐藏面板内容区 */
  :deep(.el-tabs__content),
  :deep(.n-tab-pane),
  :deep(.ant-tabs-content) {
    display: none;
  }

  :deep(.el-tabs__item),
  :deep(.n-tabs-tab),
  :deep(.ant-tabs-tab) {
    height: 32px;
    font-size: 12px;
  }
}
</style>
