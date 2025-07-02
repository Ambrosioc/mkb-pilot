const { createClient } = require('@supabase/supabase-js');

// Configuration avec la clé service_role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  console.error('Please set the environment variable and try again');
  process.exit(1);
}

// Créer le client avec la clé service_role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupProfilePolicies() {
  console.log('🔧 Setting up profile bucket RLS policies...\n');

  try {
    // Vérifier que le bucket existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    const profileBucket = buckets.find(bucket => bucket.name === 'profile');
    if (!profileBucket) {
      console.error('❌ Profile bucket not found. Please create it first in Supabase Dashboard.');
      console.error('Go to Storage > New bucket > Name: profile > Public: Yes');
      return;
    }

    console.log('✅ Profile bucket found');

    // Créer les policies via l'API REST
    const policies = [
      {
        name: 'Users can upload their own profile photos',
        action: 'INSERT',
        target: 'authenticated',
        expression: "bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text"
      },
      {
        name: 'Users can update their own profile photos',
        action: 'UPDATE',
        target: 'authenticated',
        expression: "bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text"
      },
      {
        name: 'Users can delete their own profile photos',
        action: 'DELETE',
        target: 'authenticated',
        expression: "bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text"
      },
      {
        name: 'Public read access to profile photos',
        action: 'SELECT',
        target: 'public',
        expression: "bucket_id = 'profile'"
      }
    ];

    console.log('📋 Creating policies...');

    console.log('⚠️  Automated policy creation not available in local Supabase.');
    console.log('Please create the policies manually in Supabase Studio:');
    console.log('');
    console.log('1. Go to http://localhost:54323/project/default/storage/buckets/profile/policies');
    console.log('2. Click "New Policy" for each policy below:');
    console.log('');
    
    policies.forEach((policy, index) => {
      console.log(`${index + 1}. ${policy.name}`);
      console.log(`   Action: ${policy.action}`);
      console.log(`   Target: ${policy.target}`);
      console.log(`   Expression: ${policy.expression}`);
      console.log('');
    });
    
    console.log('Or copy-paste these SQL commands in the SQL Editor:');
    console.log('');
    console.log('-- Enable RLS on storage.objects if not already enabled');
    console.log('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
    console.log('');
    
    policies.forEach(policy => {
      console.log(`-- ${policy.name}`);
      console.log(`CREATE POLICY "${policy.name}" ON storage.objects FOR ${policy.action} TO ${policy.target}`);
      if (policy.action === 'UPDATE') {
        console.log(`USING (${policy.expression})`);
        console.log(`WITH CHECK (${policy.expression});`);
      } else {
        console.log(`${policy.action === 'SELECT' ? 'USING' : 'WITH CHECK'} (${policy.expression});`);
      }
      console.log('');
    });

    console.log('\n✅ Profile bucket policies setup completed!');
    console.log('You can now upload profile photos without RLS errors.');

  } catch (error) {
    console.error('❌ Error setting up policies:', error);
  }
}

// Exécuter le script
setupProfilePolicies(); 