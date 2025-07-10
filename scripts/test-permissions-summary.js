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

console.log('🔎 RÉSUMÉ DES PERMISSIONS - UTILISATEUR AMBROSIE');
console.log('================================================\n');

async function testPermissionsSummary() {
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

    // 2. Récupérer le rôle de l'utilisateur
    console.log('\n📋 2. Récupération du rôle utilisateur...');
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (
          id,
          nom,
          niveau,
          description
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.error('❌ Erreur lors de la récupération du rôle:', roleError);
      return;
    }

    const role = userRole?.roles;
    console.log(`✅ Rôle: ${role?.nom} (Niveau ${role?.niveau})`);

    // 3. Vérifier les affectations de pôles
    console.log('\n📋 3. Affectations de pôles...');
    const { data: userPoles, error: userPolesError } = await supabase
      .from('user_poles')
      .select(`
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.id);

    if (userPolesError) {
      console.error('❌ Erreur lors de la récupération des affectations:', userPolesError);
      return;
    }

    console.log('✅ Pôles assignés:', userPoles.length);
    userPoles.forEach(assignment => {
      const pole = assignment.poles;
      console.log(`   - ${pole.name}: ${pole.description}`);
    });

    // 4. Utiliser la fonction RPC pour obtenir les permissions détaillées
    console.log('\n📋 4. Permissions détaillées par pôle...');
    const { data: detailedPoles, error: detailedError } = await supabase
      .rpc('get_user_poles', {
        p_user_id: user.id
      });

    if (detailedError) {
      console.error('❌ Erreur lors de la récupération des permissions détaillées:', detailedError);
    } else {
      console.log(`✅ ${detailedPoles.length} pôles avec permissions détaillées`);
      detailedPoles.forEach(pole => {
        console.log(`   - ${pole.pole_name}:`);
        console.log(`     Niveau: ${pole.role_level}`);
        console.log(`     Lecture: ${pole.can_read ? '✅' : '❌'}`);
        console.log(`     Écriture: ${pole.can_write ? '✅' : '❌'}`);
        console.log(`     Gestion: ${pole.can_manage ? '✅' : '❌'}`);
      });
    }

    // 5. Résumé des accès par page
    console.log('\n📋 5. Résumé des accès par page...');
    
    const pages = [
      { name: 'Stock', pole: 'Stock', url: '/dashboard/stock' },
      { name: 'Contacts', pole: 'Commercial', url: '/dashboard/contacts' },
      { name: 'Pricing Angola', pole: 'Pricing', url: '/dashboard/pricing/angola' },
      { name: 'Direction', pole: 'Direction', url: '/dashboard/direction' },
      { name: 'Création véhicule', pole: 'Stock', url: '/dashboard/stock/new' }
    ];

    pages.forEach(page => {
      const poleAccess = detailedPoles?.find(p => p.pole_name === page.pole);
      if (poleAccess) {
        console.log(`   ${page.name} (${page.url}):`);
        console.log(`     - Accès: ✅`);
        console.log(`     - Lecture: ${poleAccess.can_read ? '✅' : '❌'}`);
        console.log(`     - Écriture: ${poleAccess.can_write ? '✅' : '❌'}`);
        console.log(`     - Gestion: ${poleAccess.can_manage ? '✅' : '❌'}`);
      } else {
        console.log(`   ${page.name} (${page.url}): ❌ Aucun accès`);
      }
    });

    // 6. Résumé final
    console.log('\n🎯 RÉSUMÉ FINAL');
    console.log('===============');
    console.log(`Utilisateur: ${user.prenom} ${user.nom}`);
    console.log(`Rôle: ${role?.nom} (Niveau ${role?.niveau})`);
    console.log(`Pôles assignés: ${userPoles.length}`);
    
    if (userPoles.length > 0) {
      console.log('✅ Pages accessibles:');
      userPoles.forEach(assignment => {
        const poleName = assignment.poles.name;
        const poleAccess = detailedPoles?.find(p => p.pole_name === poleName);
        if (poleAccess) {
          console.log(`   - ${poleName}: Lecture ${poleAccess.can_read ? '✅' : '❌'}, Écriture ${poleAccess.can_write ? '✅' : '❌'}, Gestion ${poleAccess.can_manage ? '✅' : '❌'}`);
        }
      });
    } else {
      console.log('❌ Aucun pôle assigné - accès limité');
    }

    console.log('\n📝 Actions disponibles selon le niveau:');
    if (role?.niveau <= 5) {
      console.log('   - ✅ Voir les listes et détails');
      console.log('   - ✅ Rechercher et filtrer');
      console.log('   - ✅ Voir les statistiques');
    }
    if (role?.niveau <= 4) {
      console.log('   - ✅ Ajouter/modifier des éléments');
      console.log('   - ✅ Créer des devis/factures');
    }
    if (role?.niveau <= 3) {
      console.log('   - ✅ Supprimer des éléments');
      console.log('   - ✅ Gérer les utilisateurs');
      console.log('   - ✅ Envoyer des emails groupés');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testPermissionsSummary(); 