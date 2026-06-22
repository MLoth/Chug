<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { baby, fetchBaby, updateBaby, uploadAvatar } = useLogs()
const toast = useToast()

onMounted(async () => {
  if (!baby.value) await fetchBaby()
})

const form = reactive({ name: '', birth_date: '' })

watch(baby, (b) => {
  if (b) {
    form.name = b.name
    form.birth_date = b.birth_date ?? ''
  }
}, { immediate: true })

const loading = ref(false)
const avatarLoading = ref(false)
const avatarFile = ref<File | null>(null)

const save = async () => {
  if (!baby.value) return
  loading.value = true
  try {
    await updateBaby(baby.value.id, {
      name: form.name,
      birth_date: form.birth_date || null
    })
    toast.add({ title: 'Saved', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Failed to save', description: (e as Error).message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const onAvatarChange = async (file: File | null) => {
  if (!file || !baby.value) return
  avatarLoading.value = true
  try {
    const url = await uploadAvatar(baby.value.id, file)
    await updateBaby(baby.value.id, { avatar_url: url })
    avatarFile.value = null
    toast.add({ title: 'Photo updated', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Upload failed', description: (e as Error).message, color: 'error' })
  } finally {
    avatarLoading.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <div class="max-w-xl p-4 space-y-6 mx-auto">
        <!-- Avatar -->
        <UCard>
          <template #header>
            <p class="font-medium">
              Photo
            </p>
          </template>

          <div class="flex items-center gap-6">
            <UAvatar
              :src="baby?.avatar_url ?? undefined"
              :alt="baby?.name"
              size="3xl"
              icon="i-lucide-baby"
            />
            <div class="flex-1 min-w-0">
              <UFileUpload
                v-model="avatarFile"
                accept="image/*"
                variant="button"
                label="Choose photo"
                :preview="false"
                @update:model-value="onAvatarChange"
              />
              <p class="text-xs text-muted mt-2">
                JPG, PNG or WebP · max 5 MB
              </p>
            </div>
            <UIcon
              v-if="avatarLoading"
              name="i-lucide-loader-circle"
              class="size-5 animate-spin text-muted"
            />
          </div>
        </UCard>

        <!-- Details -->
        <UCard>
          <template #header>
            <p class="font-medium">
              Baby details
            </p>
          </template>

          <div class="space-y-4">
            <UFormField label="Name">
              <UInput
                v-model="form.name"
                placeholder="Baby's name"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Date of birth">
              <UInput
                v-model="form.birth_date"
                type="date"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                :loading="loading"
                @click="save"
              >
                Save
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
