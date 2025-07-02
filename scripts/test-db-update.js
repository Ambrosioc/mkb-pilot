const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testDbUpdate() {
  try {
    console.log('=== Test Database Update ===');
    
    // 1. Récupérer un utilisateur
    console.log('\n1. Récupération d\'un utilisateur:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, prenom, nom, email, photo_url, auth_user_id')
      .limit(1);
    
    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('Aucun utilisateur trouvé');
      return;
    }
    
    const user = users[0];
    console.log('Utilisateur trouvé:', user);
    
    // 2. Tester la mise à jour avec un chemin de fichier
    console.log('\n2. Test de mise à jour de photo_url:');
    const testFilePath = `${user.auth_user_id}/test-profile-123.jpg`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ photo_url: testFilePath })
      .eq('id', user.id)
      .select();
    
    console.log('Résultat de la mise à jour:', { data: updateData, error: updateError });
    
    // 3. Vérifier la mise à jour
    console.log('\n3. Vérification après mise à jour:');
    const { data: updatedUser, error: checkError } = await supabase
      .from('users')
      .select('id, prenom, nom, photo_url')
      .eq('id', user.id)
      .single();
    
    console.log('Utilisateur après mise à jour:', updatedUser);
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

testDbUpdate(); 