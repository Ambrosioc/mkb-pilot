
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