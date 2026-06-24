<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Create account' })

const { signUp } = useAuth()
const toast = useToast()

const form = reactive({ email: '', password: '', confirm: '' })
const loading = ref(false)
const done = ref(false)

const submit = async () => {
  if (form.password !== form.confirm) {
    toast.add({ title: 'Passwords do not match', color: 'error' })
    return
  }
  loading.value = true
  try {
    await signUp(form.email, form.password)
    done.value = true
  } catch (e) {
    toast.add({ title: 'Registration failed', description: (e as Error).message, color: 'error' })
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
          Create account
        </h1>
      </template>

      <div
        v-if="done"
        class="py-4 text-center space-y-2"
      >
        <UIcon
          name="i-lucide-mail-check"
          class="size-10 text-primary mx-auto"
        />
        <p class="font-medium">
          Check your email
        </p>
        <p class="text-sm text-muted">
          Confirm your address, then wait for an admin to approve your account.
        </p>
      </div>

      <UForm
        v-else
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
        <UFormField
          label="Confirm password"
          name="confirm"
        >
          <UInput
            v-model="form.confirm"
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
          Create account
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-center text-muted">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-primary font-medium hover:underline"
          >Sign in</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
