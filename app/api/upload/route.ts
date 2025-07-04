import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';

// Configuration pour forcer le mode dynamique
export const dynamic = 'force-dynamic';

// Types pour la sécurité
interface UploadRequest {
  file: File;
  reference: string;
  car_id: number;
}

interface SftpUploadResponse {
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

// Fonction de test de connexion SFTP
async function testSftpConnection(host: string, username: string, password: string): Promise<{ port: number; success: boolean; error?: string }> {
  const testPorts = [22, 2222, 222, 21]; // Ports SFTP courants
  const sftp = new Client();
  
  for (const port of testPorts) {
    try {
      console.log(`🧪 Test de connexion SFTP sur le port ${port}...`);
      
      await sftp.connect({
        host,
        port,
        username,
        password,
        readyTimeout: 10000, // 10 secondes pour les tests
        retries: 1
      });
      
      console.log(`✅ Connexion SFTP réussie sur le port ${port}`);
      await sftp.end();
      return { port, success: true };
      
    } catch (error: any) {
      console.log(`❌ Échec sur le port ${port}: ${error.message}`);
      try {
        await sftp.end();
      } catch {}
    }
  }
  
  return { 
    port: 22, 
    success: false, 
    error: 'Aucun port SFTP fonctionnel trouvé. Ports testés: ' + testPorts.join(', ')
  };
}

// Fonction d'upload via SFTP
async function uploadViaSftp(
  file: File,
  reference: string,
  fileName: string
): Promise<SftpUploadResponse> {
  const sftp = new Client();
  
  try {
    // Vérifier les variables d'environnement SFTP
    const host = process.env.SFTP_HOST || 'sw7sw.ftp.infomaniak.com';
    const port = parseInt(process.env.SFTP_PORT || '22');
    const username = process.env.SFTP_USER || 'sw7sw_mkb';
    const password = process.env.SFTP_PASSWORD;

    if (!host || !username || !password) {
      return { 
        success: false, 
        error: 'Configuration SFTP manquante',
        message: 'Variables d\'environnement SFTP non configurées'
      };
    }

    console.log(`Configuration SFTP:`, {
      host,
      port,
      username,
      passwordLength: password?.length || 0
    });

    // Connexion SFTP directe (on sait que le port 22 fonctionne)
    const connectionConfig = {
      host,
      port,
      username,
      password,
      readyTimeout: 30000, // 30 secondes
      retries: 3,
      retry_factor: 2,
      retry_minTimeout: 5000,
      keepaliveInterval: 10000, // 10 secondes
      keepaliveCountMax: 3
    };

    console.log('Configuration de connexion:', JSON.stringify(connectionConfig, null, 2));

    await sftp.connect(connectionConfig);
    console.log('✅ Connexion SFTP établie avec succès');

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Taille du fichier: ${buffer.length} bytes`);

    // Chemin distant - Utiliser le chemin absolu correct pour Infomaniak
    const remoteDir = `/home/clients/579d9810fe84939753a28b4360138c3f/var/www/mkbautomobile/uploads/${reference}`;
    const remotePath = `${remoteDir}/${fileName}`;
    console.log(`Tentative d'upload vers: ${remotePath}`);

    // Vérifier si le dossier existe
    try {
      const dirExists = await sftp.exists(remoteDir);
      console.log(`Le dossier ${remoteDir} existe: ${dirExists}`);
      
      if (!dirExists) {
        console.log(`Tentative de création du dossier: ${remoteDir}`);
        await sftp.mkdir(remoteDir, true); // true = créer les parents si nécessaire
        console.log(`✅ Dossier créé: ${remoteDir}`);
      }
    } catch (dirError: any) {
      console.error(`Erreur lors de la vérification/création du dossier:`, dirError);
      // Continuer même si on ne peut pas créer le dossier
    }

    // Upload du fichier
    try {
      await sftp.put(buffer, remotePath);
      console.log(`✅ Fichier uploadé avec succès: ${remotePath}`);
    } catch (uploadError: any) {
      console.error(`❌ Erreur upload:`, uploadError);
      
      // Si le dossier n'existe pas, donner des instructions
      if (uploadError.message && uploadError.message.includes('No such file')) {
        throw new Error(`Le dossier ${remoteDir} n'existe pas. Veuillez le créer manuellement ou contacter l'administrateur Infomaniak pour activer les permissions.`);
      }
      
      throw uploadError;
    }

    // Construire l'URL publique correcte avec le sous-domaine images
    const publicUrl = `https://images.mkbautomobile.com/photos/${reference}/${fileName}`;
    console.log(`URL publique générée: ${publicUrl}`);
    
    return {
      success: true,
      filePath: publicUrl,
      message: 'Image uploadée avec succès via SFTP'
    };

  } catch (error) {
    console.error('❌ Erreur upload SFTP:', error);
    return { 
      success: false, 
      error: 'Erreur lors de l\'upload via SFTP',
      message: error instanceof Error ? error.message : 'Erreur lors de l\'upload via SFTP'
    };
  } finally {
    // Fermer la connexion SFTP
    try {
      await sftp.end();
      console.log('🔌 Connexion SFTP fermée');
    } catch (closeError) {
      console.error('❌ Erreur fermeture SFTP:', closeError);
    }
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
      .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur

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
        console.error('Erreur création annonce:', createError);
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
        console.error('Erreur mise à jour photos:', updateError);
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
    const reference = formData.get('reference') as string;
    const car_id = parseInt(formData.get('car_id') as string);

    // 3. Validation des données
    if (!file || !reference) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes: file et reference sont requis' 
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

    // 5. Utiliser le nom du fichier envoyé par le client
    const fileName = file.name; // Utiliser le nom original du fichier
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    console.log(`Début upload: ${fileName} pour reference: ${reference}`);

    // 6. Upload via SFTP
    const uploadResult = await uploadViaSftp(file, reference, fileName);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    // 7. Mise à jour Supabase (si car_id est fourni)
    if (car_id) {
      const updateResult = await updateSupabasePhotos(car_id, uploadResult.filePath!);
      
      if (!updateResult.success) {
        console.warn('Erreur mise à jour Supabase:', updateResult.error);
        // Ne pas échouer complètement si Supabase échoue
      }
    }

    // 8. Réponse de succès
    return NextResponse.json({
      success: true,
      filePath: uploadResult.filePath,
      message: uploadResult.message,
      photoNumber: fileName.split('-').pop()?.split('.')[0]
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