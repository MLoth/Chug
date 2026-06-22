export type LogType = 'feeding' | 'diaper' | 'temperature' | 'comment'

export interface Baby {
  id: string
  name: string
  birth_date: string | null
  avatar_url: string | null
  created_at: string
}

export interface Log {
  id: string
  baby_id: string
  type: LogType
  logged_at: string
  amount_offered: number | null
  amount_drunk: number | null
  poop: boolean | null
  pee: boolean | null
  temperature: number | null
  comment: string | null
  created_at: string
}

export const useLogs = () => {
  const baby = useState<Baby | null>('baby', () => null)
  const logs = useState<Log[]>('logs', () => [])
  const { user } = useAuth()

  const fetchBaby = async () => {
    const supabase = useSupabase()
    const { data } = await supabase.from('babies').select('*').limit(1).single()
    baby.value = data
    return data as Baby | null
  }

  const fetchLogs = async (babyId: string) => {
    const supabase = useSupabase()
    const { data } = await supabase
      .from('logs')
      .select('*')
      .eq('baby_id', babyId)
      .order('logged_at', { ascending: false })
      .limit(100)
    logs.value = (data ?? []) as Log[]
  }

  const addLog = async (payload: Omit<Log, 'id' | 'created_at'>) => {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('logs')
      .insert({ ...payload, created_by: user.value?.id })
      .select()
      .single()
    if (error) throw error
    logs.value = [data as Log, ...logs.value]
    return data as Log
  }

  const uploadAvatar = async (babyId: string, file: File): Promise<string> => {
    const supabase = useSupabase()
    const ext = file.name.split('.').pop()
    const path = `${babyId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const updateBaby = async (id: string, patch: Partial<Pick<Baby, 'name' | 'birth_date' | 'avatar_url'>>) => {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('babies')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    baby.value = data as Baby
    return data as Baby
  }

  return { baby, logs, fetchBaby, fetchLogs, addLog, updateBaby, uploadAvatar }
}
