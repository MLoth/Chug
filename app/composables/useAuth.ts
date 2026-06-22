import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  role: 'user' | 'admin'
  approved: boolean
  created_at: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const profile = useState<Profile | null>('auth.profile', () => null)

  const fetchProfile = async (userId: string) => {
    const supabase = useSupabase()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    profile.value = data
  }

  const init = async () => {
    if (import.meta.server) return
    const supabase = useSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        profile.value = null
      }
    })
  }

  const signUp = async (email: string, password: string) => {
    const supabase = useSupabase()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const supabase = useSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      user.value = u
      await fetchProfile(u.id)
    }
  }

  const signOut = async () => {
    const supabase = useSupabase()
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    await navigateTo('/login')
  }

  return { user, profile, init, signUp, signIn, signOut, fetchProfile }
}
