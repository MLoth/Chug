<script setup lang="ts">
import type { Log, LogType } from '~/composables/useLogs'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { baby, logs, fetchBaby, fetchLogs } = useLogs()

useHead(computed(() => ({ title: baby.value?.name ?? 'Dashboard' })))

const modalOpen = ref(false)
const modalType = ref<LogType>('feeding')

const openModal = (type: LogType) => {
  modalType.value = type
  modalOpen.value = true
}

onMounted(async () => {
  const b = await fetchBaby()
  if (b) await fetchLogs(b.id)
})

// ── Stats ────────────────────────────────────────────────
const startOfToday = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const todayLogs = computed(() =>
  logs.value.filter(l => new Date(l.logged_at) >= startOfToday.value)
)

const feedingsToday = computed(() => todayLogs.value.filter(l => l.type === 'feeding'))
const mlToday = computed(() => feedingsToday.value.reduce((s, l) => s + (l.amount_drunk ?? 0), 0))
const diapersToday = computed(() => todayLogs.value.filter(l => l.type === 'diaper'))
const lastTemp = computed(() => logs.value.find(l => l.type === 'temperature'))

const stats = computed(() => [
  {
    label: 'Feedings today',
    value: feedingsToday.value.length,
    sub: feedingsToday.value.length ? `${mlToday.value} ml total` : null
  },
  {
    label: 'Diapers today',
    value: diapersToday.value.length,
    sub: null
  },
  {
    label: 'Last temperature',
    value: lastTemp.value ? `${lastTemp.value.temperature} °C` : '—',
    sub: lastTemp.value ? fmtRelative(lastTemp.value.logged_at) : null
  }
])

// ── Action cards ─────────────────────────────────────────
const actions: { type: LogType, label: string, icon: string, color: string }[] = [
  { type: 'feeding', label: 'Feeding', icon: 'i-lucide-droplets', color: 'text-blue-500' },
  { type: 'diaper', label: 'Diaper', icon: 'i-lucide-baby', color: 'text-yellow-500' },
  { type: 'temperature', label: 'Temperature', icon: 'i-lucide-thermometer', color: 'text-red-500' },
  { type: 'comment', label: 'Note', icon: 'i-lucide-message-square', color: 'text-neutral-400' }
]

const lastOf = (type: LogType) => logs.value.find(l => l.type === type)

// ── Recent activity ───────────────────────────────────────
const logIcon: Record<LogType, string> = {
  feeding: 'i-lucide-droplets',
  diaper: 'i-lucide-baby',
  temperature: 'i-lucide-thermometer',
  comment: 'i-lucide-message-square'
}

const logColor: Record<LogType, string> = {
  feeding: 'text-blue-500',
  diaper: 'text-yellow-500',
  temperature: 'text-red-500',
  comment: 'text-neutral-400'
}

const logSummary = (log: Log): string => {
  if (log.type === 'feeding') {
    const parts: string[] = []
    if (log.amount_drunk != null) parts.push(`${log.amount_drunk} ml drunk`)
    if (log.amount_offered != null) parts.push(`of ${log.amount_offered} ml`)
    return parts.join(' ') || 'Feeding'
  }
  if (log.type === 'diaper') {
    const parts: string[] = []
    if (log.pee) parts.push('pee')
    if (log.poop) parts.push('poop')
    return parts.length ? parts.join(' + ') : 'Diaper'
  }
  if (log.type === 'temperature') return `${log.temperature} °C`
  if (log.type === 'comment') return log.comment ?? ''
  return ''
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const grouped = computed(() => {
  const groups: { dateKey: string, label: string, items: Log[] }[] = []
  for (const log of logs.value.slice(0, 60)) {
    const key = new Date(log.logged_at).toDateString()
    let g = groups.find(g => g.dateKey === key)
    if (!g) {
      g = { dateKey: key, label: fmtDate(log.logged_at), items: [] }
      groups.push(g)
    }
    g.items.push(log)
  }
  return groups
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="baby?.name ?? 'Dashboard'" />
    </template>

    <template #body>
      <div class="p-6 space-y-8 max-w-4xl mx-auto">
        <!-- Log actions -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <UCard
            v-for="action in actions"
            :key="action.type"
            :ui="{ body: 'p-4' }"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-start justify-between">
                <UIcon
                  :name="action.icon"
                  class="size-5"
                  :class="action.color"
                />
                <span class="text-xs text-muted">
                  {{ lastOf(action.type) ? fmtRelative(lastOf(action.type)!.logged_at) : 'No entries' }}
                </span>
              </div>
              <div class="flex items-end justify-between gap-2">
                <p class="text-sm font-medium leading-tight">
                  {{ action.label }}
                </p>
                <UButton
                  size="xs"
                  variant="soft"
                  leading-icon="i-lucide-plus"
                  @click="openModal(action.type)"
                >
                  Log
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <UCard
            v-for="stat in stats"
            :key="stat.label"
            :ui="{ body: 'p-4' }"
          >
            <p class="text-2xl font-bold">
              {{ stat.value }}
            </p>
            <p class="text-xs text-muted mt-1">
              {{ stat.label }}
            </p>
            <p
              v-if="stat.sub"
              class="text-xs text-muted mt-0.5"
            >
              {{ stat.sub }}
            </p>
          </UCard>
        </div>

        <!-- Recent activity -->
        <div class="space-y-6">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">
            Recent activity
          </p>

          <div
            v-if="grouped.length === 0"
            class="text-center text-muted py-10 text-sm"
          >
            No entries yet.
          </div>

          <div
            v-for="group in grouped"
            :key="group.dateKey"
            class="space-y-1.5"
          >
            <p class="text-xs font-medium text-muted capitalize">
              {{ group.label }}
            </p>
            <UCard
              v-for="log in group.items"
              :key="log.id"
              :ui="{ body: 'py-2.5 px-4' }"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="logIcon[log.type]"
                  class="size-4 shrink-0"
                  :class="logColor[log.type]"
                />
                <span class="flex-1 text-sm">{{ logSummary(log) }}</span>
                <span class="text-xs text-muted tabular-nums">{{ fmtTime(log.logged_at) }}</span>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <LogModal
        v-if="baby"
        v-model:open="modalOpen"
        :baby-id="baby.id"
        :initial-type="modalType"
      />
    </template>
  </UDashboardPanel>
</template>
