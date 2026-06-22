<script setup lang="ts">
const { user, profile, signOut, init } = useAuth()

onMounted(async () => {
  if (!user.value) await init()
  if (!user.value) return navigateTo('/login')
  if (profile.value?.approved) return navigateTo('/')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-sm text-center">
      <div class="py-6 space-y-4">
        <UIcon
          name="i-lucide-clock"
          class="size-12 text-warning mx-auto"
        />
        <div class="space-y-1">
          <h1 class="text-xl font-semibold">
            Awaiting approval
          </h1>
          <p class="text-sm text-muted">
            Your account is pending admin approval. You'll be able to access the app once an admin approves you.
          </p>
        </div>
        <UButton
          variant="ghost"
          size="sm"
          @click="signOut"
        >
          Sign out
        </UButton>
      </div>
    </UCard>
  </div>
</template>
