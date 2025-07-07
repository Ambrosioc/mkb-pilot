import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }



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
        }
      }
    } catch (deleteError) {
      console.warn('Warning: Error while trying to delete previous profile photos:', deleteError);
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update user profile in database
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ photo_url: filePath })
      .eq('auth_user_id', userId)
      .select();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }



    // Generate the public URL
    const { data: urlData } = supabase.storage
      .from('profile')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      filePath: filePath,
      publicUrl: urlData.publicUrl,
      user: updateData[0]
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 