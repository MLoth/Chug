<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'
import type { LogType } from '~/composables/useLogs'

const { baby } = useLogs()
const { profile } = useAuth()

const open = ref(false)
const logModalOpen = ref(false)
const logType = ref<LogType>('feeding')

const openLog = (type: LogType) => {
  logType.value = type
  open.value = false
  logModalOpen.value = true
}

const go = (path: string) => {
  open.value = false
  navigateTo(path)
}

const jumpToDate = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const iso = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
  go(`/log?date=${iso}`)
}

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'log',
    label: 'Log',
    items: [
      { label: 'Log feeding', icon: 'i-lucide-droplets', onSelect: () => openLog('feeding') },
      { label: 'Log diaper', icon: 'i-lucide-baby', onSelect: () => openLog('diaper') },
      { label: 'Log temperature', icon: 'i-lucide-thermometer', onSelect: () => openLog('temperature') },
      { label: 'Log note', icon: 'i-lucide-message-square', onSelect: () => openLog('comment') },
    ],
  },
  {
    id: 'date',
    label: 'Jump to date',
    items: [
      { label: 'Today', icon: 'i-lucide-calendar', onSelect: () => jumpToDate(0) },
      { label: 'Yesterday', icon: 'i-lucide-calendar', onSelect: () => jumpToDate(-1) },
    ],
  },
  {
    id: 'navigate',
    label: 'Navigate',
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', onSelect: () => go('/') },
      { label: 'Log', icon: 'i-lucide-calendar-days', onSelect: () => go('/log') },
      { label: 'Settings', icon: 'i-lucide-settings', onSelect: () => go('/settings') },
      ...(profile.value?.role === 'admin'
        ? [{ label: 'Users', icon: 'i-lucide-users', onSelect: () => go('/admin/users') }]
        : []),
    ],
  },
])

const handleKey = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'p-0 overflow-hidden gap-0' }">
    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search or log…"
        @update:open="open = $event"
      />
    </template>
  </UModal>

  <LogModal
    v-if="baby"
    v-model:open="logModalOpen"
    :baby-id="baby.id"
    :initial-type="logType"
  />
</template>
