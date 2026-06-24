<script setup lang="ts">
import {
  today,
  getLocalTimeZone,
  parseDate,
  type DateValue,
} from '@internationalized/date'
import type { TimelineItem } from '@nuxt/ui'
import type { Log, LogType } from '~/composables/useLogs'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Log' })

const { baby, logs, fetchBaby, fetchLogs } = useLogs()

onMounted(async () => {
  const b = baby.value ?? (await fetchBaby())
  if (b && logs.value.length === 0) await fetchLogs(b.id)
})

const route = useRoute()

const selectedDate = shallowRef(
  route.query.date ? parseDate(route.query.date as string) : today(getLocalTimeZone()),
)

watch(
  () => route.query.date,
  (v) => { if (v) selectedDate.value = parseDate(v as string) },
)

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const datesWithLogs = computed(() => {
  const set = new Set<string>()
  for (const log of logs.value) {
    const d = new Date(log.logged_at)
    set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
  }
  return set
})

const isDateHighlightable = (date: DateValue): boolean =>
  datesWithLogs.value.has(`${date.year}-${date.month - 1}-${date.day}`)

const selectedDayLogs = computed<Log[]>(() => {
  if (!selectedDate.value) return []
  const { year, month, day } = selectedDate.value
  const jsDate = new Date(year, month - 1, day)
  return logs.value
    .filter(l => sameDay(new Date(l.logged_at), jsDate))
    .sort(
      (a, b) =>
        new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
    )
})

const logIcon: Record<LogType, string> = {
  feeding: 'i-lucide-droplets',
  diaper: 'i-lucide-baby',
  temperature: 'i-lucide-thermometer',
  comment: 'i-lucide-message-square',
}

const logColor: Record<LogType, string> = {
  feeding: 'text-blue-500',
  diaper: 'text-yellow-500',
  temperature: 'text-red-500',
  comment: 'text-neutral-400',
}

const logTitle: Record<LogType, string> = {
  feeding: 'Feeding',
  diaper: 'Diaper',
  temperature: 'Temperature',
  comment: 'Note',
}

const logSummary = (log: Log): string => {
  if (log.type === 'feeding') {
    const parts: string[] = []
    if (log.amount_drunk != null) parts.push(`${log.amount_drunk} ml drunk`)
    if (log.amount_offered != null) parts.push(`of ${log.amount_offered} ml`)
    return parts.join(' ') || ''
  }
  if (log.type === 'diaper') {
    const parts: string[] = []
    if (log.pee) parts.push('pee')
    if (log.poop) parts.push('poop')
    return parts.join(' + ')
  }
  if (log.type === 'temperature') return `${log.temperature} °C`
  return log.comment ?? ''
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('nl-BE', {
    hour: '2-digit',
    minute: '2-digit',
  })

const fmtSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const { year, month, day } = selectedDate.value
  return new Date(year, month - 1, day).toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const timelineItems = computed<TimelineItem[]>(() =>
  selectedDayLogs.value.map(log => ({
    date: fmtTime(log.logged_at),
    title: logTitle[log.type],
    description: logSummary(log) || undefined,
    icon: logIcon[log.type],
    ui: { indicator: logColor[log.type] },
  })),
)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Log" />
    </template>

    <template #body>
      <div class="flex flex-col lg:flex-row gap-0 h-full max-w-6xl mx-auto">
        <div class="flex justify-center p-6">
          <UCalendar v-model="selectedDate">
            <template #day="{ day }">
              <div class="flex flex-col items-center gap-0.5">
                <span>{{ day.day }}</span>
                <span
                  v-if="isDateHighlightable(day)"
                  class="size-1 rounded-full bg-primary block"
                />
                <span v-else class="size-1 block" />
              </div>
            </template>
          </UCalendar>
        </div>

        <div class="flex-1 p-6 min-w-0">
          <p class="text-sm font-medium mb-4 capitalize">
            {{ fmtSelectedDate }}
          </p>

          <UTimeline v-if="timelineItems.length" :items="timelineItems" />

          <p v-else class="text-sm text-muted">No events on this day.</p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
