import { NextRequest, NextResponse } from 'next/server'

// POST /api/debug/test-sync - Test the user sync functionality
export async function POST(request: NextRequest) {
  try {
    const testUser = {
      email: 'test@berkeleyprep.org',
      name: 'Test User',
      role: 'student'
    }

    // Call the sync API
    const syncResponse = await fetch(`${request.nextUrl.origin}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })

    const syncResult = await syncResponse.json()

    return NextResponse.json({
      success: true,
      syncResponse: {
        status: syncResponse.status,
        ok: syncResponse.ok,
        data: syncResult
      },
      message: 'Sync test completed'
    })
  } catch (error) {
    console.error('Error testing sync:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to test sync' },
      { status: 500 }
    )
  }
}