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

console.log('🔎 SUPPRESSION DE L\'ACCÈS AU PÔLE PRICING');
console.log('==========================================\n');

async function removePricingAccess() {
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

    // 2. Récupérer le pôle Pricing
    console.log('\n📋 2. Récupération du pôle Pricing...');
    const { data: poles, error: polesError } = await supabase
      .from('poles')
      .select('*')
      .eq('name', 'Pricing');

    if (polesError) {
      console.error('❌ Erreur lors de la récupération du pôle Pricing:', polesError);
      return;
    }

    if (poles.length === 0) {
      console.error('❌ Pôle Pricing non trouvé');
      return;
    }

    const pricingPole = poles[0];
    console.log('✅ Pôle Pricing trouvé:', pricingPole.name);

    // 3. Supprimer l'affectation au pôle Pricing
    console.log('\n📋 3. Suppression de l\'affectation au pôle Pricing...');
    const { data: deletedAssignment, error: deleteError } = await supabase
      .from('user_poles')
      .delete()
      .eq('user_id', user.auth_user_id)
      .eq('pole_id', pricingPole.id)
      .select()
      .single();

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        console.log('⚠️  Aucune affectation au pôle Pricing trouvée');
      } else {
        console.error('❌ Erreur lors de la suppression:', deleteError);
        return;
      }
    } else {
      console.log('✅ Affectation au pôle Pricing supprimée avec succès');
      console.log('Affectation supprimée:', deletedAssignment);
    }

    // 4. Vérifier les affectations restantes
    console.log('\n📋 4. Vérification des affectations restantes...');
    const { data: remainingAssignments, error: remainingError } = await supabase
      .from('user_poles')
      .select(`
        *,
        poles (
          name,
          description
        )
      `)
      .eq('user_id', user.auth_user_id);

    if (remainingError) {
      console.error('❌ Erreur lors de la récupération des affectations restantes:', remainingError);
    } else {
      console.log('✅ Affectations restantes:', remainingAssignments.length);
      if (remainingAssignments.length === 0) {
        console.log('   - Aucune affectation restante');
      } else {
        remainingAssignments.forEach(assignment => {
          console.log(`   - ${assignment.poles.name} (niveau ${assignment.role_level})`);
        });
      }
    }

    console.log('\n🎯 RÉSUMÉ');
    console.log('==========');
    console.log('L\'affectation au pôle Pricing a été supprimée.');
    console.log('Vous ne devriez plus pouvoir accéder à la page Pricing Angola.');
    console.log('Seules les pages Stock et Contacts devraient être accessibles (niveau 5).');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

removePricingAccess(); 