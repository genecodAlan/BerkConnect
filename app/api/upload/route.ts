import { NextRequest, NextResponse } from 'next/server'

// POST /api/upload - Handle image uploads
// NOTE: File uploads disabled on Vercel (read-only filesystem)
// TODO: Implement cloud storage (Cloudinary, Vercel Blob, or AWS S3)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // TEMPORARY: Return placeholder until cloud storage is set up
    // In production, you would upload to Cloudinary, Vercel Blob, or S3 here
    const placeholderUrl = `/placeholder.svg?key=upload-${Date.now()}`

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        url: placeholderUrl,
        size: file.size,
        type: file.type
      },
      message: 'File upload temporarily disabled. Using placeholder image.'
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
