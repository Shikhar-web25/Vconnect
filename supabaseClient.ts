import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://irynthwuqvzaogdrhvkn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeW50aHd1cXZ6YW9nZHJodmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjc5MDMsImV4cCI6MjA4NDg0MzkwM30.gkDJ5l4UTVwjS0L3V3o8TmL2fwJctkubOG3c_qmllQQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
