require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPoleAssignment() {
  try {
    console.log('🧪 TEST D\'ASSIGNATION DES PÔLES');
    console.log('================================\n');

    // 1. Récupérer les pôles disponibles
    console.log('📋 1. Récupération des pôles disponibles...');
    const { data: poles, error: polesError } = await supabase
      .from('poles')
      .select('*')
      .order('name');

    if (polesError) {
      console.error('❌ Erreur lors de la récupération des pôles:', polesError);
      return;
    }

    console.log(`✅ ${poles.length} pôles trouvés`);
    poles.forEach(pole => {
      console.log(`   - ${pole.name}: ${pole.description}`);
    });

    // 2. Récupérer un utilisateur de test
    console.log('\n📋 2. Récupération d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Utilisateur de test: ${testUser.prenom} ${testUser.nom} (${testUser.email})`);

    // 3. Vérifier les affectations actuelles
    console.log('\n📋 3. Vérification des affectations actuelles...');
    const { data: currentAssignments, error: assignmentsError } = await supabase
      .from('user_poles')
      .select(`
        *,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', testUser.id);

    if (assignmentsError) {
      console.error('❌ Erreur lors de la récupération des affectations:', assignmentsError);
      return;
    }

    console.log(`✅ ${currentAssignments.length} affectations actuelles`);
    currentAssignments.forEach(assignment => {
      console.log(`   - ${assignment.poles.name}`);
    });

    // 4. Tester l'assignation d'un nouveau pôle
    if (poles.length > 0) {
      const poleToAssign = poles.find(p => p.name === 'IT'); // Essayer d'assigner le pôle IT
      if (poleToAssign) {
        console.log(`\n📋 4. Test d'assignation du pôle "${poleToAssign.name}"...`);
        
        const { data: newAssignment, error: assignError } = await supabase
          .from('user_poles')
          .insert({
            user_id: testUser.id,
            pole_id: poleToAssign.id
          })
          .select()
          .single();

        if (assignError) {
          if (assignError.code === '23505') {
            console.log('⚠️  L\'utilisateur est déjà affecté à ce pôle');
          } else {
            console.error('❌ Erreur lors de l\'assignation:', assignError);
          }
        } else {
          console.log('✅ Assignation réussie!');
          console.log('Nouvelle affectation:', newAssignment);
        }
      } else {
        console.log('\n📋 4. Pôle IT non trouvé, test d\'assignation du premier pôle disponible...');
        const poleToAssign = poles[0];
        
        const { data: newAssignment, error: assignError } = await supabase
          .from('user_poles')
          .insert({
            user_id: testUser.id,
            pole_id: poleToAssign.id
          })
          .select()
          .single();

        if (assignError) {
          if (assignError.code === '23505') {
            console.log(`⚠️  L'utilisateur est déjà affecté au pôle ${poleToAssign.name}`);
          } else {
            console.error('❌ Erreur lors de l\'assignation:', assignError);
          }
        } else {
          console.log(`✅ Assignation au pôle ${poleToAssign.name} réussie!`);
          console.log('Nouvelle affectation:', newAssignment);
        }
      }
    }

    // 5. Vérifier les affectations après assignation
    console.log('\n📋 5. Vérification des affectations après assignation...');
    const { data: updatedAssignments, error: updatedError } = await supabase
      .from('user_poles')
      .select(`
        *,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', testUser.id);

    if (updatedError) {
      console.error('❌ Erreur lors de la récupération des affectations:', updatedError);
      return;
    }

    console.log(`✅ ${updatedAssignments.length} affectations après assignation`);
    updatedAssignments.forEach(assignment => {
      console.log(`   - ${assignment.poles.name} (assigné le ${new Date(assignment.created_at).toLocaleDateString('fr-FR')})`);
    });

    // 6. Tester la fonction get_user_poles
    console.log('\n📋 6. Test de la fonction get_user_poles...');
    const { data: userPoles, error: userPolesError } = await supabase
      .rpc('get_user_poles', {
        p_user_id: testUser.id
      });

    if (userPolesError) {
      console.error('❌ Erreur lors de l\'appel à get_user_poles:', userPolesError);
    } else {
      console.log(`✅ ${userPoles.length} pôles récupérés via la fonction RPC`);
      userPoles.forEach(pole => {
        console.log(`   - ${pole.pole_name} (niveau ${pole.role_level})`);
        console.log(`     Lecture: ${pole.can_read ? '✅' : '❌'}`);
        console.log(`     Écriture: ${pole.can_write ? '✅' : '❌'}`);
        console.log(`     Gestion: ${pole.can_manage ? '✅' : '❌'}`);
      });
    }

    console.log('\n🎯 RÉSUMÉ');
    console.log('==========');
    console.log(`Pôles disponibles: ${poles.length}`);
    console.log(`Utilisateur testé: ${testUser.prenom} ${testUser.nom}`);
    console.log(`Affectations totales: ${updatedAssignments.length}`);
    console.log('✅ Test d\'assignation des pôles terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testPoleAssignment(); 