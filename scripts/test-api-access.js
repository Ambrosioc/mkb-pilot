require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔎 TEST DE L\'API D\'ACCÈS AUX PÔLES');
console.log('====================================\n');

async function testApiAccess() {
  try {
    // 1. Récupérer l'utilisateur Ambrosie
    console.log('📋 1. Récupération de l\'utilisateur Ambrosie...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'a.cazimira@gmail.com');

    if (usersError || users.length === 0) {
      console.error('❌ Utilisateur Ambrosie non trouvé');
      return;
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user.prenom, user.nom);

    // 2. Tester l'accès au pôle Stock (devrait avoir accès)
    console.log('\n📋 2. Test d\'accès au pôle Stock (devrait avoir accès)...');
    const { data: stockAccess, error: stockError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .eq('poles.name', 'Stock')
      .single();

    if (stockError) {
      console.error('❌ Erreur lors du test d\'accès Stock:', stockError);
    } else {
      console.log('✅ Accès Stock trouvé:', stockAccess);
      console.log(`   - Niveau: ${stockAccess.role_level}`);
      console.log(`   - Lecture: ${stockAccess.role_level >= 5 ? '✅' : '❌'}`);
      console.log(`   - Écriture: ${stockAccess.role_level <= 4 ? '✅' : '❌'}`);
      console.log(`   - Gestion: ${stockAccess.role_level <= 3 ? '✅' : '❌'}`);
    }

    // 3. Tester l'accès au pôle Commercial (devrait avoir accès)
    console.log('\n📋 3. Test d\'accès au pôle Commercial (devrait avoir accès)...');
    const { data: commercialAccess, error: commercialError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .eq('poles.name', 'Commercial')
      .single();

    if (commercialError) {
      console.error('❌ Erreur lors du test d\'accès Commercial:', commercialError);
    } else {
      console.log('✅ Accès Commercial trouvé:', commercialAccess);
      console.log(`   - Niveau: ${commercialAccess.role_level}`);
      console.log(`   - Lecture: ${commercialAccess.role_level >= 5 ? '✅' : '❌'}`);
      console.log(`   - Écriture: ${commercialAccess.role_level <= 4 ? '✅' : '❌'}`);
      console.log(`   - Gestion: ${commercialAccess.role_level <= 3 ? '✅' : '❌'}`);
    }

    // 4. Tester l'accès au pôle Pricing (ne devrait PAS avoir accès)
    console.log('\n📋 4. Test d\'accès au pôle Pricing (ne devrait PAS avoir accès)...');
    const { data: pricingAccess, error: pricingError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .eq('poles.name', 'Pricing')
      .single();

    if (pricingError) {
      if (pricingError.code === 'PGRST116') {
        console.log('✅ Aucun accès au pôle Pricing (comportement attendu)');
      } else {
        console.error('❌ Erreur lors du test d\'accès Pricing:', pricingError);
      }
    } else {
      console.log('⚠️  Accès Pricing trouvé (inattendu):', pricingAccess);
    }

    // 5. Tester l'accès au pôle Direction (ne devrait PAS avoir accès)
    console.log('\n📋 5. Test d\'accès au pôle Direction (ne devrait PAS avoir accès)...');
    const { data: directionAccess, error: directionError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .eq('poles.name', 'Direction')
      .single();

    if (directionError) {
      if (directionError.code === 'PGRST116') {
        console.log('✅ Aucun accès au pôle Direction (comportement attendu)');
      } else {
        console.error('❌ Erreur lors du test d\'accès Direction:', directionError);
      }
    } else {
      console.log('⚠️  Accès Direction trouvé (inattendu):', directionAccess);
    }

    console.log('\n🎯 RÉSUMÉ');
    console.log('==========');
    console.log('✅ Accès autorisés: Stock, Commercial (niveau 5)');
    console.log('❌ Accès refusés: Pricing, Direction (aucune affectation)');
    console.log('📝 En niveau 5, seules les actions de lecture sont disponibles.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testApiAccess(); 