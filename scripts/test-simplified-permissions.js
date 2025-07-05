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

console.log('🧪 TEST DU SYSTÈME DE PERMISSIONS SIMPLIFIÉ');
console.log('============================================\n');

async function testSimplifiedPermissions() {
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

    // 2. Vérifier le rôle hiérarchique
    console.log('\n📋 2. Rôle hiérarchique...');
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          nom,
          niveau,
          description
        )
      `)
      .eq('user_id', user.auth_user_id)
      .single();

    if (roleError) {
      console.error('❌ Erreur lors de la récupération du rôle:', roleError);
      return;
    }

    console.log('📊 Rôle hiérarchique:');
    console.log(`   - Rôle: ${userRole.roles.nom}`);
    console.log(`   - Niveau: ${userRole.roles.niveau}`);
    console.log(`   - Description: ${userRole.roles.description}`);

    // 3. Vérifier les affectations aux pôles
    console.log('\n📋 3. Affectations aux pôles...');
    const { data: poleAssignments, error: poleError } = await supabase
      .from('user_poles')
      .select(`
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id);

    if (poleError) {
      console.error('❌ Erreur lors de la récupération des pôles:', poleError);
      return;
    }

    console.log('📊 Pôles affectés:');
    poleAssignments.forEach(assignment => {
      console.log(`   - ${assignment.poles.name}: ${assignment.poles.description}`);
    });

    // 4. Tester la nouvelle fonction get_user_pole_access
    console.log('\n📋 4. Test de get_user_pole_access...');
    const { data: poleAccess, error: accessError } = await supabase
      .rpc('get_user_pole_access', {
        p_user_id: user.auth_user_id,
        p_pole_name: 'Stock'
      });

    if (accessError) {
      console.error('❌ Erreur lors du test de get_user_pole_access:', accessError);
      return;
    }

    if (poleAccess && poleAccess.length > 0) {
      const access = poleAccess[0];
      console.log('📊 Accès au pôle Stock:');
      console.log(`   - Niveau: ${access.role_level}`);
      console.log(`   - Lecture: ${access.can_read ? '✅' : '❌'}`);
      console.log(`   - Écriture: ${access.can_write ? '✅' : '❌'}`);
      console.log(`   - Gestion: ${access.can_manage ? '✅' : '❌'}`);
    } else {
      console.log('❌ Aucun accès trouvé pour le pôle Stock');
    }

    // 5. Tester la fonction get_user_poles
    console.log('\n📋 5. Test de get_user_poles...');
    const { data: userPoles, error: polesError } = await supabase
      .rpc('get_user_poles', {
        p_user_id: user.auth_user_id
      });

    if (polesError) {
      console.error('❌ Erreur lors du test de get_user_poles:', polesError);
      return;
    }

    console.log('📊 Tous les pôles avec permissions:');
    userPoles.forEach(pole => {
      console.log(`   - ${pole.pole_name}:`);
      console.log(`     Niveau: ${pole.role_level}`);
      console.log(`     Lecture: ${pole.can_read ? '✅' : '❌'}`);
      console.log(`     Écriture: ${pole.can_write ? '✅' : '❌'}`);
      console.log(`     Gestion: ${pole.can_manage ? '✅' : '❌'}`);
    });

    // 6. Tester la fonction has_pole_access
    console.log('\n📋 6. Test de has_pole_access...');
    const { data: hasStockAccess, error: hasAccessError } = await supabase
      .rpc('has_pole_access', {
        p_user_id: user.auth_user_id,
        p_pole_name: 'Stock'
      });

    if (hasAccessError) {
      console.error('❌ Erreur lors du test de has_pole_access:', hasAccessError);
      return;
    }

    console.log(`📊 Accès au pôle Stock: ${hasStockAccess ? '✅' : '❌'}`);

    // 7. Tester la fonction get_user_access_level
    console.log('\n📋 7. Test de get_user_access_level...');
    const { data: accessLevel, error: levelError } = await supabase
      .rpc('get_user_access_level', {
        p_user_id: user.auth_user_id
      });

    if (levelError) {
      console.error('❌ Erreur lors du test de get_user_access_level:', levelError);
      return;
    }

    console.log(`📊 Niveau d'accès global: ${accessLevel}`);

    // 8. Résumé final
    console.log('\n🎯 RÉSUMÉ FINAL');
    console.log('================');
    console.log(`Rôle hiérarchique: ${userRole.roles.nom} (Niveau ${userRole.roles.niveau})`);
    console.log(`Niveau d'accès global: ${accessLevel}`);
    console.log(`Pôles affectés: ${poleAssignments.length}`);
    
    const stockAccess = userPoles.find(p => p.pole_name === 'Stock');
    if (stockAccess) {
      console.log('\n✅ Permissions Stock:');
      console.log(`   - Lecture: ${stockAccess.can_read ? '✅' : '❌'}`);
      console.log(`   - Écriture: ${stockAccess.can_write ? '✅' : '❌'}`);
      console.log(`   - Gestion: ${stockAccess.can_manage ? '✅' : '❌'}`);
      
      if (stockAccess.can_write) {
        console.log('\n✅ Vous pouvez maintenant:');
        console.log('   - Créer des véhicules');
        console.log('   - Modifier des véhicules');
        console.log('   - Créer des devis/factures');
        console.log('   - Envoyer des emails');
      }
    }

    console.log('\n🧪 POUR TESTER:');
    console.log('   1. Reconnectez-vous à l\'application');
    console.log('   2. Allez dans Stock');
    console.log('   3. Vérifiez que les boutons de création sont maintenant visibles');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testSimplifiedPermissions(); 