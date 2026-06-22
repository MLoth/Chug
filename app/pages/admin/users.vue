<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Profile } from '~/composables/useAuth'

definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const supabase = useSupabase()
const toast = useToast()

const profiles = ref<Profile[]>([])
const loading = ref(true)

const fetchProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    toast.add({ title: 'Failed to load users', description: error.message, color: 'error' })
  } else {
    profiles.value = (data ?? []) as Profile[]
  }
  loading.value = false
}

onMounted(fetchProfiles)

const toggleApproval = async (p: Profile) => {
  const { error } = await supabase
    .from('profiles')
    .update({ approved: !p.approved })
    .eq('id', p.id)
  if (error) {
    toast.add({ title: 'Update failed', description: error.message, color: 'error' })
  } else {
    p.approved = !p.approved
    toast.add({ title: p.approved ? 'User approved' : 'Approval revoked', color: 'success' })
  }
}

const setRole = async (p: Profile, role: 'user' | 'admin') => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', p.id)
  if (error) {
    toast.add({ title: 'Update failed', description: error.message, color: 'error' })
  } else {
    p.role = role
    toast.add({ title: 'Role updated', color: 'success' })
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const USelect = resolveComponent('USelect')

const roleItems = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
]

const columns: TableColumn<Profile>[] = [
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) =>
      h(USelect, {
        'modelValue': row.original.role,
        'items': roleItems,
        'size': 'xs',
        'onUpdate:modelValue': (v: string) => setRole(row.original, v as 'user' | 'admin')
      })
  },
  {
    accessorKey: 'approved',
    header: 'Status',
    cell: ({ row }) =>
      h(UBadge, {
        color: row.original.approved ? 'success' : 'warning',
        label: row.original.approved ? 'Approved' : 'Pending',
        variant: 'subtle'
      })
  },
  {
    accessorKey: 'created_at',
    header: 'Registered',
    cell: ({ row }) => formatDate(row.original.created_at)
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h(UButton, {
        color: row.original.approved ? 'error' : 'success',
        variant: 'ghost',
        size: 'xs',
        onClick: () => toggleApproval(row.original),
        default: () => (row.original.approved ? 'Revoke' : 'Approve')
      })
  }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Users">
        <template #trailing>
          <p class="text-sm text-muted hidden sm:block">
            Approve accounts and manage roles
          </p>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-6xl mx-auto p-4">
        <UTable
          :data="profiles"
          :columns="columns"
          :loading="loading"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
