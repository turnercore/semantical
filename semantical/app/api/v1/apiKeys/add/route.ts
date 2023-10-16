import type { Database } from '@/types/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Init supabase
    const supabase = createRouteHandlerClient<Database>({ cookies })
    // Get logged in user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    //Make sure there is a user
    if (!user) {
      throw new Error('User not found')
    }

    //Get Key name from request body if it exists
    const { name } = JSON.parse(await req.text())

    // Add an API key to the database
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({ user_id: user.id, name })
      .select()
      .single()
    
    if (error) {
      throw error
    }

    return NextResponse.json({ apiKey }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}