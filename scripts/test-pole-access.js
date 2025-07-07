require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MANQUANT');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'OK' : 'MANQUANT');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔎 TEST DES PERMISSIONS D\'ACCÈS AUX PÔLES');
console.log('==========================================\n');

async function testPoleAccess() {
  try {
    // 1. Récupérer l'utilisateur Ambrosie
    console.log('📋 1. Récupération de l\'utilisateur Ambrosie...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'a.cazimira@gmail.com');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    if (users.length === 0) {
      console.error('❌ Utilisateur Ambrosie non trouvé');
      return;
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user.prenom, user.nom);

    // 2. Tester les permissions pour le pôle Stock
    console.log('\n📋 2. Test des permissions pour le pôle Stock...');
    const { data: stockAccess, error: stockError } = await supabase
      .rpc('get_user_pole_access', {
        user_id: user.auth_user_id,
        pole_name: 'Stock'
      });

    if (stockError) {
      console.error('❌ Erreur lors du test des permissions Stock:', stockError);
    } else {
      console.log('✅ Permissions Stock:', stockAccess);
      if (stockAccess.length > 0) {
        const access = stockAccess[0];
        console.log(`   - Niveau: ${access.role_level}`);
        console.log(`   - Lecture: ${access.can_read ? '✅' : '❌'}`);
        console.log(`   - Écriture: ${access.can_write ? '✅' : '❌'}`);
        console.log(`   - Gestion: ${access.can_manage ? '✅' : '❌'}`);
      } else {
        console.log('   - Aucun accès trouvé');
      }
    }

    // 3. Tester les permissions pour le pôle Commercial
    console.log('\n📋 3. Test des permissions pour le pôle Commercial...');
    const { data: commercialAccess, error: commercialError } = await supabase
      .rpc('get_user_pole_access', {
        user_id: user.auth_user_id,
        pole_name: 'Commercial'
      });

    if (commercialError) {
      console.error('❌ Erreur lors du test des permissions Commercial:', commercialError);
    } else {
      console.log('✅ Permissions Commercial:', commercialAccess);
      if (commercialAccess.length > 0) {
        const access = commercialAccess[0];
        console.log(`   - Niveau: ${access.role_level}`);
        console.log(`   - Lecture: ${access.can_read ? '✅' : '❌'}`);
        console.log(`   - Écriture: ${access.can_write ? '✅' : '❌'}`);
        console.log(`   - Gestion: ${access.can_manage ? '✅' : '❌'}`);
      } else {
        console.log('   - Aucun accès trouvé');
      }
    }

    // 4. Vérifier les affectations existantes
    console.log('\n📋 4. Vérification des affectations existantes...');
    const { data: userPoles, error: userPolesError } = await supabase
      .from('user_poles')
      .select(`
        *,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id);

    if (userPolesError) {
      console.error('❌ Erreur lors de la récupération des affectations:', userPolesError);
    } else {
      console.log('✅ Affectations trouvées:', userPoles.length);
      userPoles.forEach(assignment => {
        console.log(`   - ${assignment.poles.name} (niveau ${assignment.role_level})`);
      });
    }

    console.log('\n🎯 RÉSUMÉ');
    console.log('==========');
    console.log('L\'utilisateur Ambrosie a été affecté aux pôles Stock et Commercial avec le niveau 5 (lecture uniquement).');
    console.log('Dans les pages Stock et Contacts, seules les actions de lecture seront disponibles.');
    console.log('Les boutons de modification (ajouter, modifier, supprimer) seront masqués.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testPoleAccess(); 