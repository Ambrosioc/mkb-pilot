import { supabase } from '@/lib/supabase';

/**
 * Uploads an image to the server via Infomaniak API
 * @param file The file to upload
 * @param ref_auto The vehicle reference (used for folder name)
 * @param car_id The vehicle ID in the database
 * @returns Promise with the upload result
 */
export async function uploadImageToServer(
  file: File,
  ref_auto: string,
  car_id: number
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Get authentication token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ref_auto', ref_auto);
    formData.append('car_id', car_id.toString());

    // Send request to API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Upload error:', result);
      return { 
        success: false, 
        error: result.error || 'Failed to upload image' 
      };
    }

    return { 
      success: true, 
      filePath: result.filePath 
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Uploads multiple images to the server
 * @param files Array of files to upload
 * @param ref_auto The vehicle reference
 * @param car_id The vehicle ID in the database
 * @returns Promise with the upload results
 */
export async function uploadMultipleImages(
  files: File[],
  ref_auto: string,
  car_id: number
): Promise<{ success: boolean; filePaths: string[]; errors: string[] }> {
  const results = await Promise.all(
    files.map(file => uploadImageToServer(file, ref_auto, car_id))
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