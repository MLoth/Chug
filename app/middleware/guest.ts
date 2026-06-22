export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { user, profile, init } = useAuth()
  if (!user.value) await init()
  if (!user.value) return
  if (!profile.value?.approved) return navigateTo('/pending')
  return navigateTo('/')
})
