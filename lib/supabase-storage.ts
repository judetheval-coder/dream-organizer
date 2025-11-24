import { supabase } from './supabase'

const BUCKET_NAME = 'dream-images'

// Initialize storage bucket (run this once in Supabase dashboard or via API)
export async function createBucket() {
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  })
  
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating bucket:', error)
    throw error
  }
  
  return data
}

// Upload image from data URL
export async function uploadImageFromDataURL(
  dataURL: string,
  userId: string,
  dreamId: string,
  panelNumber: number
): Promise<string> {
  try {
    // Convert data URL to blob
    const response = await fetch(dataURL)
    const blob = await response.blob()
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${userId}/${dreamId}/panel-${panelNumber}-${timestamp}.png`
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, blob, {
        contentType: 'image/png',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      throw error
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)
    
    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Upload image from Blob
export async function uploadImageBlob(
  blob: Blob,
  userId: string,
  dreamId: string,
  panelNumber: number
): Promise<string> {
  const timestamp = Date.now()
  const filename = `${userId}/${dreamId}/panel-${panelNumber}-${timestamp}.png`
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, blob, {
      contentType: 'image/png',
      upsert: false
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename)
  
  return publicUrl
}

// Delete image
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts.slice(pathParts.indexOf(BUCKET_NAME) + 1).join('/')
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename])
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

// Delete all images for a dream
export async function deleteDreamImages(userId: string, dreamId: string): Promise<void> {
  try {
    const folderPath = `${userId}/${dreamId}/`
    
    // List all files in the dream folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath)
    
    if (listError) throw listError
    if (!files || files.length === 0) return
    
    // Delete all files
    const filePaths = files.map(file => `${folderPath}${file.name}`)
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)
    
    if (deleteError) throw deleteError
  } catch (error) {
    console.error('Error deleting dream images:', error)
    throw error
  }
}
