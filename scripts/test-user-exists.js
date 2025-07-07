const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testUserExists() {
  try {
    const authUserId = 'bf0414b2-5bef-4364-8a9f-ff053acc2920';
    
    console.log('=== Test User Exists ===');
    console.log('Looking for user with auth_user_id:', authUserId);
    
    // Test avec auth_user_id
    const { data: userByAuthId, error: errorByAuthId } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    
    console.log('\n1. Recherche par auth_user_id:');
    console.log('Data:', userByAuthId);
    console.log('Error:', errorByAuthId);
    
    // Test avec id
    const { data: userById, error: errorById } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();
    
    console.log('\n2. Recherche par id:');
    console.log('Data:', userById);
    console.log('Error:', errorById);
    
    // Lister tous les utilisateurs
    console.log('\n3. Tous les utilisateurs:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, auth_user_id, prenom, nom, email');
    
    console.log('All users:', allUsers);
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

testUserExists(); 