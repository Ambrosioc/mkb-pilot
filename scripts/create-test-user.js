require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isLocal: supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost')
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('🧪 Création d\'un utilisateur de test');
  console.log('=' .repeat(40));

  try {
    // 1. Créer un utilisateur de test
    console.log('1️⃣ Création de l\'utilisateur...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'test-notifications@mkb.com',
      password: 'test123456',
      options: {
        data: {
          prenom: 'Test',
          nom: 'Notifications'
        }
      }
    });

    if (error) {
      console.error('❌ Erreur lors de la création:', error.message);
      
      // Si l'utilisateur existe déjà, essayer de se connecter
      if (error.message.includes('already registered')) {
        console.log('🔄 Utilisateur existe déjà, tentative de connexion...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test-notifications@mkb.com',
          password: 'test123456'
        });
        
        if (signInError) {
          console.error('❌ Erreur de connexion:', signInError.message);
          return;
        }
        
        console.log('✅ Connexion réussie avec l\'utilisateur existant');
        console.log('📧 Email:', signInData.user.email);
        console.log('🆔 ID:', signInData.user.id);
        
        // Vérifier si l'utilisateur existe dans la table users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();
          
        if (userError || !userData) {
          console.log('⚠️ Utilisateur pas dans la table users, création...');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: signInData.user.id,
              email: signInData.user.email,
              prenom: 'Test',
              nom: 'Notifications'
            });
            
          if (insertError) {
            console.error('❌ Erreur insertion table users:', insertError.message);
          } else {
            console.log('✅ Utilisateur ajouté à la table users');
          }
        } else {
          console.log('✅ Utilisateur trouvé dans la table users');
        }
        
        return;
      }
      
      return;
    }

    console.log('✅ Utilisateur créé avec succès');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);

    // 2. Ajouter l'utilisateur à la table users
    console.log('\n2️⃣ Ajout à la table users...');
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        prenom: 'Test',
        nom: 'Notifications'
      });

    if (insertError) {
      console.error('❌ Erreur insertion table users:', insertError.message);
    } else {
      console.log('✅ Utilisateur ajouté à la table users');
    }

    console.log('\n🎉 Utilisateur de test créé !');
    console.log('📝 Identifiants:');
    console.log('   Email: test-notifications@mkb.com');
    console.log('   Mot de passe: test123456');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await supabase.auth.signOut();
    console.log('👋 Déconnexion');
  }
}

createTestUser(); 