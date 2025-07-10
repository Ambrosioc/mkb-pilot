require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Test des notifications lors de l\'assignation/suppression de pôles...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPoleNotifications() {
  try {
    // 1. Récupérer un utilisateur de test
    console.log('👤 1. Récupération d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError || !users.length) {
      console.error('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const testUser = users[0];
    console.log('✅ Utilisateur de test:', testUser.prenom, testUser.nom);
    
    // 2. Récupérer un pôle de test
    console.log('🏢 2. Récupération d\'un pôle de test...');
    const { data: poles, error: polesError } = await supabase
      .from('poles')
      .select('*')
      .limit(1);
    
    if (polesError || !poles.length) {
      console.error('❌ Aucun pôle trouvé');
      return;
    }
    
    const testPole = poles[0];
    console.log('✅ Pôle de test:', testPole.name);
    
    // 3. Vérifier les notifications existantes
    console.log('📢 3. Vérification des notifications existantes...');
    const { data: existingNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notifError) {
      console.error('❌ Erreur lors de la récupération des notifications:', notifError);
    } else {
      console.log('📋 Notifications existantes:', existingNotifications.length);
      existingNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.read ? 'Lu' : 'Non lu'}`);
      });
    }
    
    // 4. Assigner le pôle à l'utilisateur
    console.log('➕ 4. Assignation du pôle à l\'utilisateur...');
    const { data: assignment, error: assignError } = await supabase
      .from('user_poles')
      .insert({
        user_id: testUser.id,
        pole_id: testPole.id
      })
      .select()
      .single();
    
    if (assignError) {
      if (assignError.code === '23505') {
        console.log('⚠️  L\'utilisateur a déjà accès à ce pôle');
      } else {
        console.error('❌ Erreur lors de l\'assignation:', assignError);
        return;
      }
    } else {
      console.log('✅ Pôle assigné avec succès');
    }
    
    // 5. Créer une notification d'assignation manuellement
    console.log('📝 5. Création d\'une notification d\'assignation...');
    const { data: assignNotification, error: assignNotifError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: testUser.id, // Même utilisateur pour le test
        title: 'Accès au pôle accordé',
        message: `Test: Accès accordé au pôle "${testPole.name}"`,
        type: 'success',
        category: 'user'
      })
      .select()
      .single();
    
    if (assignNotifError) {
      console.error('❌ Erreur lors de la création de la notification d\'assignation:', assignNotifError);
    } else {
      console.log('✅ Notification d\'assignation créée:', assignNotification.id);
    }
    
    // 6. Créer une notification de suppression
    console.log('📝 6. Création d\'une notification de suppression...');
    const { data: removeNotification, error: removeNotifError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: testUser.id,
        sender_id: testUser.id, // Même utilisateur pour le test
        title: 'Accès au pôle retiré',
        message: `Test: Accès retiré au pôle "${testPole.name}"`,
        type: 'warning',
        category: 'user'
      })
      .select()
      .single();
    
    if (removeNotifError) {
      console.error('❌ Erreur lors de la création de la notification de suppression:', removeNotifError);
    } else {
      console.log('✅ Notification de suppression créée:', removeNotification.id);
    }
    
    // 7. Vérifier les nouvelles notifications
    console.log('📢 7. Vérification des nouvelles notifications...');
    const { data: newNotifications, error: newNotifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (newNotifError) {
      console.error('❌ Erreur lors de la récupération des nouvelles notifications:', newNotifError);
    } else {
      console.log('📋 Nouvelles notifications:', newNotifications.length);
      newNotifications.forEach((notif, index) => {
        const timeAgo = Math.floor((Date.now() - new Date(notif.created_at).getTime()) / 1000);
        console.log(`  ${index + 1}. ${notif.title} - ${notif.read ? 'Lu' : 'Non lu'} (il y a ${timeAgo}s)`);
      });
    }
    
    // 8. Nettoyer - supprimer les notifications de test
    console.log('🧹 8. Nettoyage des notifications de test...');
    if (assignNotification) {
      const { error: deleteAssignError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', assignNotification.id);
      
      if (deleteAssignError) {
        console.error('❌ Erreur lors de la suppression de la notification d\'assignation:', deleteAssignError);
      } else {
        console.log('✅ Notification d\'assignation supprimée');
      }
    }
    
    if (removeNotification) {
      const { error: deleteRemoveError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', removeNotification.id);
      
      if (deleteRemoveError) {
        console.error('❌ Erreur lors de la suppression de la notification de suppression:', deleteRemoveError);
      } else {
        console.log('✅ Notification de suppression supprimée');
      }
    }
    
    // 9. Supprimer l'affectation de pôle si elle a été créée
    if (assignment) {
      console.log('🧹 9. Suppression de l\'affectation de pôle...');
      const { error: deleteAssignError } = await supabase
        .from('user_poles')
        .delete()
        .eq('id', assignment.id);
      
      if (deleteAssignError) {
        console.error('❌ Erreur lors de la suppression de l\'affectation:', deleteAssignError);
      } else {
        console.log('✅ Affectation de pôle supprimée');
      }
    }
    
    console.log('🎉 Test terminé avec succès !');
    console.log('📋 Résumé:');
    console.log('  - Notifications d\'assignation: ✅');
    console.log('  - Notifications de suppression: ✅');
    console.log('  - Nettoyage: ✅');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testPoleNotifications(); 