import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if environment variables are set
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials not configured',
        hasUrl,
        hasKey
      })
    }

    // Try to list buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hasUrl,
        hasKey
      })
    }

    // Check if club-images bucket exists
    const clubImagesBucket = buckets?.find(b => b.name === 'club-images')

    return NextResponse.json({
      success: true,
      hasUrl,
      hasKey,
      bucketsCount: buckets?.length || 0,
      buckets: buckets?.map(b => b.name),
      hasClubImagesBucket: !!clubImagesBucket,
      message: clubImagesBucket 
        ? 'Supabase Storage is configured correctly!' 
        : 'club-images bucket not found. Please create it in Supabase Dashboard.'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
