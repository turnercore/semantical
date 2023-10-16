import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import ApiKeyDashboard from "./components/ApiKeyDashboard"
import { cookies } from 'next/headers'

export default async function Login() {
  //Get Api Keys for the current user from supabase
  const supabase = createServerComponentClient({cookies})
  const {data:sessionData, error:sessionError} = await supabase.auth.getSession()
  if (sessionError) throw sessionError.message
  if (!sessionData.session) throw new Error('No session data found')

  const user = sessionData.session.user

  const {data: apiKeys, error: apiKeyError} = await supabase.from('api_keys').select('*').eq('user_id', user.id)
  if (apiKeyError) throw apiKeyError.message

  return (
    <ApiKeyDashboard apiKeys={apiKeys || []} />
  )
}
