export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { user, profile, init } = useAuth()
  if (!user.value) await init()
  if (!user.value) return navigateTo('/login')
  if (!profile.value?.approved) return navigateTo('/pending')
  if (profile.value?.role !== 'admin') return navigateTo('/')
})
