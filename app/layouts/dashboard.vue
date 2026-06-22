<script setup lang="ts">
const route = useRoute()
const { profile, signOut } = useAuth()
const { baby, fetchBaby } = useLogs()

onMounted(async () => {
  if (!baby.value) await fetchBaby()
})

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { to: '/log', label: 'Log', icon: 'i-lucide-calendar-days' },
  { to: '/settings', label: 'Settings', icon: 'i-lucide-settings' },
]

const adminItems = [
  { to: '/admin/users', label: 'Users', icon: 'i-lucide-users' },
]

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to)
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      resizable
      collapsible
      :min-size="15"
      :default-size="20"
      :max-size="30"
    >
      <template #header>
        <div class="flex items-center gap-2 px-2 py-1">
          <UAvatar
            :src="baby?.avatar_url ?? undefined"
            :alt="baby?.name"
            icon="i-lucide-baby"
            size="xs"
            class="shrink-0"
          />
          <span class="font-semibold truncate">{{ baby?.name ?? 'Chug' }}</span>
        </div>
      </template>

      <div class="flex flex-col gap-1 p-2">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :variant="isActive(item.to) ? 'soft' : 'ghost'"
          color="neutral"
          :leading-icon="item.icon"
          class="justify-start w-full"
        >
          {{ item.label }}
        </UButton>

        <USeparator v-if="profile?.role === 'admin'" class="my-1" />

        <template v-if="profile?.role === 'admin'">
          <UButton
            v-for="item in adminItems"
            :key="item.to"
            :to="item.to"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            color="neutral"
            :leading-icon="item.icon"
            class="justify-start w-full"
          >
            {{ item.label }}
          </UButton>
        </template>
      </div>

      <template #footer>
        <div class="flex items-center gap-2 justify-between w-full p-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted truncate">
              {{ profile?.email }}
            </p>
          </div>
          <UButton
            variant="ghost"
            color="error"
            leading-icon="i-lucide-log-out"
            size="xs"
            @click="signOut"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
