// delete_route.ts
import type { Database } from '@/types/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    console.log('attempting to delete api key')

    // Get logged in user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    // Ensure a user is logged in
    if (!user) {
      throw new Error('User not found')
    }

    // Retrieve API key ID from request body
    const { id: apiKeyId } = JSON.parse(await req.text())

    console.log('deleting key with id: ', apiKeyId)

    // Delete the API key from the database
    const { data: deletedData, error } = await supabase
      .from('api_keys')
      .delete()
      .match({ id: apiKeyId, user_id: user.id })
      .single()

    // Handle errors from Supabase
    if (error) {
      throw error
    }

    // Send successful response
    return NextResponse.json({ deletedData }, { status: 200 })
  } catch (error) {
    // Send error response
    return NextResponse.json({ error }, { status: 500 })
  }
}
