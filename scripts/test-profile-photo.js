const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfilePhoto() {
  try {
    console.log('=== Test Profile Photo ===');
    
    // 1. Vérifier les utilisateurs avec photo_url
    console.log('\n1. Utilisateurs avec photo_url:');
    const { data: usersWithPhoto, error: usersError } = await supabase
      .from('users')
      .select('id, prenom, nom, email, photo_url, auth_user_id')
      .not('photo_url', 'is', null);
    
    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
    } else {
      console.table(usersWithPhoto);
    }
    
    // 2. Vérifier le contenu du bucket profile
    console.log('\n2. Contenu du bucket profile:');
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('profile')
      .list('', { limit: 100 });
    
    if (bucketError) {
      console.error('Erreur lors de la récupération des fichiers du bucket:', bucketError);
    } else {
      console.log('Fichiers dans le bucket:', bucketFiles);
    }
    
    // 3. Vérifier les politiques RLS sur le bucket
    console.log('\n3. Politiques RLS sur le bucket profile:');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'profile');
    
    if (policiesError) {
      console.error('Erreur lors de la récupération des politiques:', policiesError);
    } else {
      console.log('Politiques RLS:', policies);
    }
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

testProfilePhoto(); 