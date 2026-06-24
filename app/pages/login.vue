<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Sign in' })

const { signIn } = useAuth()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)

const submit = async () => {
  loading.value = true
  try {
    await signIn(form.email, form.password)
    await navigateTo('/')
  } catch (e) {
    toast.add({ title: 'Sign in failed', description: (e as Error).message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-xl font-semibold text-center">
          Sign in
        </h1>
      </template>

      <UForm
        :state="form"
        class="space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Password"
          name="password"
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          class="w-full justify-center"
          :loading="loading"
        >
          Sign in
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-center text-muted">
          No account?
          <NuxtLink
            to="/register"
            class="text-primary font-medium hover:underline"
          >Register</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
