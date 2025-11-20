import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
}

/**
 * Compress an image file to reduce size
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 0.4, // Target 400KB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    fileType: file.type,
  }

  const compressionOptions = { ...defaultOptions, ...options }

  try {
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    
    const compressedFile = await imageCompression(file, compressionOptions)
    
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%')
    
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    // If compression fails, return original file
    return file
  }
}

/**
 * Validate and compress an image file
 * @param file - The file to validate and compress
 * @returns Compressed file or null if invalid
 */
export async function validateAndCompressImage(file: File): Promise<File | null> {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return null
  }

  // Check original file size (max 10MB before compression)
  const maxOriginalSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxOriginalSize) {
    alert('Image is too large. Please select an image under 10MB.')
    return null
  }

  // Compress the image
  try {
    const compressedFile = await compressImage(file, {
      maxSizeMB: 0.4, // 400KB target
      maxWidthOrHeight: 1920,
    })

    return compressedFile
  } catch (error) {
    console.error('Error processing image:', error)
    alert('Failed to process image. Please try another image.')
    return null
  }
}
