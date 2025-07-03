import { createClient } from '@supabase/supabase-js';

/**
 * Uploads a single image to the Infomaniak server via SFTP
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
    // Get the current session token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      return {
        success: false,
        error: 'Token d\'authentification manquant. Veuillez vous reconnecter.',
      };
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
 * Uploads multiple images to the Infomaniak server via SFTP
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
 * Automatically deletes the previous profile photo to ensure only one photo per user
 * @param file The image file to upload
 * @param userId The user ID
 * @param supabaseClient The Supabase client instance (optional, will create one if not provided)
 * @returns Promise with the upload result
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  supabaseClient?: any
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  
  try {
    const supabase = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // First, delete any existing profile photos for this user
    try {
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profile')
        .list(userId, {
          limit: 100,
          offset: 0,
          search: 'profile-'
        });

      if (!listError && existingFiles && existingFiles.length > 0) {
        // Delete all existing profile photos
        const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from('profile')
          .remove(filesToDelete);

        if (deleteError) {
          console.warn('Warning: Could not delete previous profile photos:', deleteError);
          // Continue anyway, don't fail the upload
        } else {
          console.log(`Deleted ${filesToDelete.length} previous profile photo(s) for user ${userId}`);
        }
      }
    } catch (deleteError) {
      console.warn('Warning: Error while trying to delete previous profile photos:', deleteError);
      // Continue anyway, don't fail the upload
    }

    // Generate a unique filename in user's folder (for RLS policies)
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`; // Store in user's folder

    // Upload to Supabase Storage using the profile bucket
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

    // Return the file path in the bucket (not the public URL)
    // The public URL can be generated later when needed
    return {
      success: true,
      filePath: filePath
    };
  } catch (error) {
    console.error('Error in uploadProfilePhoto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}