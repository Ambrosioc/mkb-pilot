require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

async function checkRealtimeConfig() {
  console.log('🔍 Vérification de la configuration Realtime\n');

  try {
    // 1. Vérifier les politiques RLS sur la table notifications
    console.log('1️⃣ Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'notifications');

    if (policiesError) {
      console.error('❌ Erreur lors de la récupération des politiques:', policiesError);
    } else {
      console.log(`✅ ${policies.length} politiques RLS trouvées:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    }

    // 2. Vérifier si la table notifications est publiée pour Realtime
    console.log('\n2️⃣ Vérification de la publication Realtime...');
    const { data: publications, error: pubError } = await supabase
      .rpc('get_realtime_publications');

    if (pubError) {
      console.log('⚠️ Impossible de vérifier les publications Realtime directement');
      console.log('   Vérifiez manuellement dans le dashboard Supabase:');
      console.log('   - Database > Replication > Publications');
      console.log('   - Assurez-vous que "supabase_realtime" inclut la table "notifications"');
    } else {
      console.log('✅ Publications Realtime:', publications);
    }

    // 3. Tester une requête simple sur la table notifications
    console.log('\n3️⃣ Test d\'accès à la table notifications...');
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur d\'accès à la table notifications:', testError);
    } else {
      console.log('✅ Accès à la table notifications OK');
    }

    // 4. Vérifier les permissions de l'utilisateur anonyme
    console.log('\n4️⃣ Vérification des permissions anonymes...');
    const { data: anonPerms, error: anonError } = await supabase
      .rpc('check_anon_permissions', { table_name: 'notifications' });

    if (anonError) {
      console.log('⚠️ Impossible de vérifier les permissions anonymes directement');
      console.log('   Vérifiez manuellement dans le dashboard Supabase:');
      console.log('   - Authentication > Policies');
      console.log('   - Assurez-vous que les politiques permettent l\'accès anonyme pour Realtime');
    } else {
      console.log('✅ Permissions anonymes:', anonPerms);
    }

    console.log('\n📋 Recommandations:');
    console.log('1. Vérifiez que Realtime est activé pour la table notifications');
    console.log('2. Assurez-vous que les politiques RLS permettent l\'accès anonyme');
    console.log('3. Vérifiez la publication "supabase_realtime" dans Database > Replication');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkRealtimeConfig(); 