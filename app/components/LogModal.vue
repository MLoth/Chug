<script setup lang="ts">
import type { LogType } from '~/composables/useLogs'

const props = defineProps<{
  babyId: string
  initialType?: LogType
}>()

const emit = defineEmits<{ saved: [] }>()
const isOpen = defineModel<boolean>('open', { required: true })

const { addLog } = useLogs()
const toast = useToast()

const types: { value: LogType, label: string, icon: string }[] = [
  { value: 'feeding', label: 'Feed', icon: 'i-lucide-droplets' },
  { value: 'diaper', label: 'Diaper', icon: 'i-lucide-baby' },
  { value: 'temperature', label: 'Temp', icon: 'i-lucide-thermometer' },
  { value: 'comment', label: 'Note', icon: 'i-lucide-message-square' }
]

const logType = ref<LogType>(props.initialType ?? 'feeding')
const loading = ref(false)

const localNow = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const loggedAt = ref(localNow())
const amountOffered = ref<number | null>(null)
const amountDrunk = ref<number>(0)
const pee = ref(false)
const poop = ref(false)
const temperature = ref<number>(37.0)
const comment = ref('')

const reset = () => {
  loggedAt.value = localNow()
  amountOffered.value = null
  amountDrunk.value = 0
  pee.value = false
  poop.value = false
  temperature.value = 37.0
  comment.value = ''
}

watch(() => props.initialType, (v) => {
  if (v) logType.value = v
})
watch(amountOffered, (max) => {
  if (max !== null && amountDrunk.value > max) amountDrunk.value = max
})
watch(isOpen, (v) => {
  if (v) reset()
})

const save = async () => {
  loading.value = true
  try {
    await addLog({
      baby_id: props.babyId,
      type: logType.value,
      logged_at: new Date(loggedAt.value).toISOString(),
      amount_offered: logType.value === 'feeding' ? amountOffered.value : null,
      amount_drunk: logType.value === 'feeding' ? amountDrunk.value : null,
      poop: logType.value === 'diaper' ? poop.value : null,
      pee: logType.value === 'diaper' ? pee.value : null,
      temperature: logType.value === 'temperature' ? temperature.value : null,
      comment: logType.value === 'comment' ? comment.value || null : null
    })
    toast.add({ title: 'Saved', color: 'success' })
    isOpen.value = false
    emit('saved')
  } catch (e) {
    toast.add({ title: 'Failed to save', description: (e as Error).message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Add entry"
  >
    <template #body>
      <div class="space-y-5">
        <div class="grid grid-cols-4 gap-2">
          <UButton
            v-for="t in types"
            :key="t.value"
            :variant="logType === t.value ? 'solid' : 'soft'"
            :color="logType === t.value ? 'primary' : 'neutral'"
            :leading-icon="t.icon"
            class="flex-col h-auto py-3 text-xs gap-1"
            @click="logType = t.value"
          >
            {{ t.label }}
          </UButton>
        </div>

        <UFormField label="Time">
          <UInput
            v-model="loggedAt"
            type="datetime-local"
            class="w-full"
          />
        </UFormField>

        <template v-if="logType === 'feeding'">
          <UFormField label="Bottle size (ml)">
            <UInput
              v-model.number="amountOffered"
              type="number"
              min="0"
              step="10"
              placeholder="150"
              class="w-full"
            />
          </UFormField>
          <UFormField>
            <template #label>
              <span>Amount drunk — <span class="font-semibold">{{ amountDrunk }} ml</span></span>
            </template>
            <USlider
              v-model="amountDrunk"
              :min="0"
              :max="amountOffered ?? 250"
              :step="5"
              tooltip
              class="mt-1"
            />
          </UFormField>
        </template>

        <template v-if="logType === 'diaper'">
          <div class="flex gap-8">
            <UCheckbox
              v-model="pee"
              label="Pee"
            />
            <UCheckbox
              v-model="poop"
              label="Poop"
            />
          </div>
        </template>

        <template v-if="logType === 'temperature'">
          <UFormField>
            <template #label>
              <span>Temperature — <span class="font-semibold">{{ temperature.toFixed(1) }} °C</span></span>
            </template>
            <USlider
              v-model="temperature"
              :min="35"
              :max="42"
              :step="0.1"
              tooltip
              class="mt-1"
            />
          </UFormField>
        </template>

        <template v-if="logType === 'comment'">
          <UFormField label="Note">
            <UTextarea
              v-model="comment"
              placeholder="Write a note…"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          :loading="loading"
          @click="save"
        >
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>
