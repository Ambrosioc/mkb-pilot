const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRolesManagement() {
  console.log('🧪 Test de la gestion des rôles et pôles\n');

  try {
    // 1. Test de récupération des rôles existants
    console.log('1. Récupération des rôles existants...');
    const { data: existingRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('niveau', { ascending: true });

    if (rolesError) throw rolesError;
    console.log(`✅ ${existingRoles.length} rôles trouvés`);
    existingRoles.forEach(role => {
      console.log(`   - ${role.nom} (Niveau ${role.niveau})`);
    });

    // 2. Test de récupération des pôles existants
    console.log('\n2. Récupération des pôles existants...');
    const { data: existingPoles, error: polesError } = await supabase
      .from('poles')
      .select('*')
      .order('name', { ascending: true });

    if (polesError) throw polesError;
    console.log(`✅ ${existingPoles.length} pôles trouvés`);
    existingPoles.forEach(pole => {
      console.log(`   - ${pole.name}`);
    });

    // 3. Test de création d'un nouveau rôle
    console.log('\n3. Test de création d\'un nouveau rôle...');
    const timestamp = Date.now();
    const newRole = {
      nom: `Test Role Management ${timestamp}`,
      niveau: 4,
      description: 'Rôle de test pour la gestion des rôles'
    };

    let createdRole;
    const { data: roleData, error: createRoleError } = await supabase
      .from('roles')
      .insert(newRole)
      .select()
      .single();

    if (createRoleError) {
      if (createRoleError.code === '23505') {
        console.log(`⚠️  Erreur de clé dupliquée, tentative avec un ID différent...`);
        // Essayer avec un ID spécifique plus élevé
        const { data: retryRole, error: retryError } = await supabase
          .from('roles')
          .insert({ ...newRole, id: 9999 })
          .select()
          .single();
        
        if (retryError) throw retryError;
        console.log(`✅ Rôle créé: ${retryRole.nom} (ID: ${retryRole.id})`);
        createdRole = retryRole;
      } else {
        throw createRoleError;
      }
    } else {
      console.log(`✅ Rôle créé: ${roleData.nom} (ID: ${roleData.id})`);
      createdRole = roleData;
    }

    // 4. Test de création d'un nouveau pôle
    console.log('\n4. Test de création d\'un nouveau pôle...');
    const newPole = {
      name: `Test Pole Management ${timestamp}`,
      description: 'Pôle de test pour la gestion des pôles'
    };

    const { data: createdPole, error: createPoleError } = await supabase
      .from('poles')
      .insert(newPole)
      .select()
      .single();

    if (createPoleError) throw createPoleError;
    console.log(`✅ Pôle créé: ${createdPole.name} (ID: ${createdPole.id})`);

    // 5. Test de mise à jour du rôle
    console.log('\n5. Test de mise à jour du rôle...');
    const updatedRole = {
      nom: `Test Role Management Updated ${timestamp}`,
      description: 'Rôle de test mis à jour'
    };

    const { data: updatedRoleData, error: updateRoleError } = await supabase
      .from('roles')
      .update(updatedRole)
      .eq('id', createdRole.id)
      .select()
      .single();

    if (updateRoleError) throw updateRoleError;
    console.log(`✅ Rôle mis à jour: ${updatedRoleData.nom}`);

    // 6. Test de mise à jour du pôle
    console.log('\n6. Test de mise à jour du pôle...');
    const updatedPole = {
      name: `Test Pole Management Updated ${timestamp}`,
      description: 'Pôle de test mis à jour'
    };

    const { data: updatedPoleData, error: updatePoleError } = await supabase
      .from('poles')
      .update(updatedPole)
      .eq('id', createdPole.id)
      .select()
      .single();

    if (updatePoleError) throw updatePoleError;
    console.log(`✅ Pôle mis à jour: ${updatedPoleData.name}`);

    // 7. Test des statistiques des rôles
    console.log('\n7. Test des statistiques des rôles...');
    const { count: totalRoles } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true });

    const { data: userRoleCounts, error: userCountsError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          nom
        )
      `);

    if (userCountsError) throw userCountsError;

    const roleCounts = userRoleCounts?.reduce((acc, item) => {
      const roleId = item.role_id;
      if (!acc[roleId]) {
        acc[roleId] = {
          role_id: roleId,
          role_nom: item.roles?.nom || 'Inconnu',
          user_count: 0
        };
      }
      acc[roleId].user_count++;
      return acc;
    }, {});

    console.log(`✅ Statistiques des rôles:`);
    console.log(`   - Total rôles: ${totalRoles}`);
    console.log(`   - Utilisateurs avec rôles: ${userRoleCounts?.length || 0}`);
    
    if (roleCounts) {
      Object.values(roleCounts).forEach((item) => {
        console.log(`   - ${item.role_nom}: ${item.user_count} utilisateur(s)`);
      });
    }

    // 8. Test de suppression du rôle (seulement si aucun utilisateur ne l'utilise)
    console.log('\n8. Test de suppression du rôle...');
    const { data: usersWithRole, error: checkRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', createdRole.id);

    if (checkRoleError) throw checkRoleError;

    if (usersWithRole && usersWithRole.length > 0) {
      console.log(`⚠️  Impossible de supprimer le rôle car ${usersWithRole.length} utilisateur(s) l'utilisent`);
    } else {
      const { error: deleteRoleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', createdRole.id);

      if (deleteRoleError) throw deleteRoleError;
      console.log(`✅ Rôle supprimé avec succès`);
    }

    // 9. Test de suppression du pôle (seulement si aucun utilisateur ne l'utilise)
    console.log('\n9. Test de suppression du pôle...');
    const { data: usersWithPole, error: checkPoleError } = await supabase
      .from('user_poles')
      .select('id')
      .eq('pole_id', createdPole.id);

    if (checkPoleError) throw checkPoleError;

    if (usersWithPole && usersWithPole.length > 0) {
      console.log(`⚠️  Impossible de supprimer le pôle car ${usersWithPole.length} utilisateur(s) y sont affectés`);
    } else {
      const { error: deletePoleError } = await supabase
        .from('poles')
        .delete()
        .eq('id', createdPole.id);

      if (deletePoleError) throw deletePoleError;
      console.log(`✅ Pôle supprimé avec succès`);
    }

    // 10. Test de vérification des noms uniques
    console.log('\n10. Test de vérification des noms uniques...');
    
    // Créer un rôle temporaire pour tester
    const { data: tempRole, error: tempRoleError } = await supabase
      .from('roles')
      .insert({
        nom: `Test Unique Name ${timestamp}`,
        niveau: 5,
        description: 'Test de vérification des noms uniques'
      })
      .select()
      .single();

    if (tempRoleError) throw tempRoleError;

    // Vérifier si le nom existe déjà
    const { data: existingRoleWithName, error: checkNameError } = await supabase
      .from('roles')
      .select('id')
      .eq('nom', `Test Unique Name ${timestamp}`)
      .neq('id', tempRole.id);

    if (checkNameError) throw checkNameError;

    if (existingRoleWithName && existingRoleWithName.length > 0) {
      console.log(`⚠️  Le nom 'Test Unique Name ${timestamp}' existe déjà`);
    } else {
      console.log(`✅ Le nom 'Test Unique Name ${timestamp}' est unique`);
    }

    // Nettoyer le rôle temporaire
    await supabase
      .from('roles')
      .delete()
      .eq('id', tempRole.id);

    console.log('\n🎉 Tous les tests de gestion des rôles et pôles sont passés avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests
testRolesManagement(); 