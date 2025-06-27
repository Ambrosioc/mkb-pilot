import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configuration pour forcer le mode dynamique
export const dynamic = 'force-dynamic';

// Types pour la sécurité
interface UploadRequest {
  file: File;
  ref_auto: string;
  car_id: number;
}

interface InfomaniakUploadResponse {
  success: boolean;
  filePath?: string;
  message: string;
  error?: string;
}

// Validation des types de fichiers autorisés
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Fonction de validation de sécurité
function validateFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Type de fichier non autorisé: ${file.type}. Types autorisés: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
    };
  }

  // Vérifier l'extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: `Extension de fichier non autorisée. Extensions autorisées: ${ALLOWED_EXTENSIONS.join(', ')}` 
    };
  }

  // Vérifier la taille (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Fichier trop volumineux. Taille maximale: 10MB` 
    };
  }

  return { valid: true };
}

// Fonction d'authentification Supabase
async function authenticateUser(authHeader: string | null): Promise<{ user: any; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Token d\'authentification manquant' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Token d\'authentification invalide' };
    }

    return { user };
  } catch (error) {
    return { user: null, error: 'Erreur d\'authentification' };
  }
}

// Fonction d'upload vers Infomaniak
async function uploadToInfomaniak(
  file: File, 
  ref_auto: string, 
  fileName: string
): Promise<InfomaniakUploadResponse> {
  try {
    const token = process.env.INFOMANIAK_TOKEN;
    if (!token) {
      return { 
        success: false, 
        error: 'Token Infomaniak non configuré',
        message: 'Token Infomaniak non configuré'
      };
    }

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Créer le FormData pour Infomaniak
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: file.type }), fileName);
    
    // Ajouter les métadonnées si nécessaire
    formData.append('path', `/var/www/mkbautomobile/uploads/${ref_auto}`);
    formData.append('overwrite', 'true');

    // Appel à l'API Infomaniak
    const response = await fetch('https://api.infomaniak.com/1/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Infomaniak:', response.status, errorText);
      return { 
        success: false, 
        error: `Erreur lors de l'upload vers Infomaniak: ${response.status}`,
        message: errorText
      };
    }

    const result = await response.json();
    
    // Construire l'URL publique
    const publicUrl = `https://www.mkbautomobile.com/uploads/${ref_auto}/${fileName}`;
    
    return {
      success: true,
      filePath: publicUrl,
      message: 'Image uploadée avec succès'
    };

  } catch (error) {
    console.error('Erreur upload Infomaniak:', error);
    return { 
      success: false, 
      error: 'Erreur lors de l\'upload vers Infomaniak',
      message: error instanceof Error ? error.message : 'Erreur lors de l\'upload vers Infomaniak'
    };
  }
}

// Fonction de mise à jour Supabase
async function updateSupabasePhotos(
  car_id: number, 
  newPhotoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variables d\'environnement Supabase manquantes:', {
        url: !!supabaseUrl,
        key: !!supabaseKey
      });
      return { success: false, error: 'Configuration Supabase manquante' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer l'annonce existante
    const { data: existingAd, error: fetchError } = await supabase
      .from('advertisements')
      .select('id, photos')
      .eq('car_id', car_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { success: false, error: `Erreur lors de la récupération de l'annonce: ${fetchError.message}` };
    }

    let photos: string[] = [];
    let adId: number | null = null;

    if (existingAd) {
      // Mettre à jour l'annonce existante
      photos = existingAd.photos || [];
      adId = existingAd.id;
    } else {
      // Créer une nouvelle annonce
      const { data: newAd, error: createError } = await supabase
        .from('advertisements')
        .insert([{ car_id, photos: [] }])
        .select('id')
        .single();

      if (createError) {
        return { success: false, error: `Erreur lors de la création de l'annonce: ${createError.message}` };
      }
      adId = newAd.id;
    }

    // Ajouter la nouvelle photo si elle n'existe pas déjà
    if (!photos.includes(newPhotoUrl)) {
      photos.push(newPhotoUrl);

      // Mettre à jour l'annonce
      const { error: updateError } = await supabase
        .from('advertisements')
        .update({ photos })
        .eq('id', adId);

      if (updateError) {
        return { success: false, error: `Erreur lors de la mise à jour des photos: ${updateError.message}` };
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Erreur mise à jour Supabase:', error);
    return { success: false, error: 'Erreur lors de la mise à jour de Supabase' };
  }
}

// Endpoint principal
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentification
    const authHeader = request.headers.get('authorization');
    const { user, error: authError } = await authenticateUser(authHeader);
    
    if (authError) {
      return NextResponse.json(
        { success: false, error: authError },
        { status: 401 }
      );
    }

    // 2. Récupération des données du formulaire
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ref_auto = formData.get('ref_auto') as string;
    const car_id = parseInt(formData.get('car_id') as string);

    // 3. Validation des données
    if (!file || !ref_auto || !car_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes: file, ref_auto et car_id sont requis' 
        },
        { status: 400 }
      );
    }

    // 4. Validation du fichier
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, error: fileValidation.error },
        { status: 400 }
      );
    }

    // 5. Déterminer le nom du fichier (photo-1.jpg, photo-2.jpg, etc.)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Récupérer le nombre de photos existantes pour déterminer le numéro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existingAd } = await supabase
      .from('advertisements')
      .select('photos')
      .eq('car_id', car_id)
      .single();

    const existingPhotos = existingAd?.photos || [];
    const photoNumber = existingPhotos.length + 1;
    const fileName = `image-${photoNumber}.${fileExtension}`;

    // 6. Upload vers Infomaniak
    const uploadResult = await uploadToInfomaniak(file, ref_auto, fileName);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    // 7. Mise à jour Supabase
    const updateResult = await updateSupabasePhotos(car_id, uploadResult.filePath!);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: updateResult.error },
        { status: 500 }
      );
    }

    // 8. Réponse de succès
    return NextResponse.json({
      success: true,
      filePath: uploadResult.filePath,
      message: uploadResult.message,
      photoNumber
    });

  } catch (error) {
    console.error('Erreur endpoint upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur' 
      },
      { status: 500 }
    );
  }
}

// Endpoint OPTIONS pour CORS (si nécessaire)
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}