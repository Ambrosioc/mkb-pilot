import { createClient } from '@supabase/supabase-js';

/**
 * Uploads a single image to the server
 * @param file The file to upload
 * @param reference The vehicle reference (used for folder name)
 * @param car_id The vehicle ID in the database
 * @returns Promise with the upload result
 */
export async function uploadImageToServer(
  file: File,
  reference: string,
  car_id: number
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('reference', reference);
  formData.append('car_id', car_id.toString());

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      filePath: data.filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Uploads multiple images to the server
 * @param files Array of files to upload
 * @param reference The vehicle reference
 * @param car_id The vehicle ID in the database
 * @returns Promise with the upload results
 */
export async function uploadMultipleImages(
  files: File[],
  reference: string,
  car_id: number
): Promise<{ success: boolean; filePaths: string[]; errors: string[] }> {
  const results = await Promise.all(
    files.map(file => uploadImageToServer(file, reference, car_id))
  );

  const filePaths = results
    .filter(result => result.success && result.filePath)
    .map(result => result.filePath as string);

  const errors = results
    .filter(result => !result.success && result.error)
    .map(result => result.error as string);

  return {
    success: errors.length === 0,
    filePaths,
    errors
  };
}

/**
 * Uploads a profile photo to Supabase Storage
 * @param file The image file to upload
 * @param userId The user ID
 * @returns Promise with the upload result
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    console.log('Starting profile photo upload...', { userId, fileName: file.name, fileSize: file.size });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Supabase client created with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
    const filePath = fileName; // Store directly in the profile bucket root

    console.log('Generated file path:', filePath);

    // Upload to Supabase Storage using the profile bucket
    console.log('Attempting to upload to bucket "profile"...');
    const { data, error } = await supabase.storage
      .from('profile')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      
      // Check if it's an RLS error
      if (error.message.includes('row-level security policy') || error.message.includes('Unauthorized')) {
        return {
          success: false,
          error: 'Erreur de permissions. Le bucket "profile" nécessite une configuration des politiques de sécurité dans Supabase.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Upload successful, data:', data);

    // Get the public URL
    console.log('Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('profile')
      .getPublicUrl(filePath);

    console.log('Public URL data:', urlData);

    return {
      success: true,
      filePath: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error in uploadProfilePhoto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}