const path = require('path');
const fs = require('fs');

// Toujours charger le .env.local ou .env depuis la racine du projet
const rootEnvLocal = path.resolve(process.cwd(), '.env.local');
const rootEnv = path.resolve(process.cwd(), '.env');
let dotenvPath = null;
if (fs.existsSync(rootEnvLocal)) {
  dotenvPath = rootEnvLocal;
} else if (fs.existsSync(rootEnv)) {
  dotenvPath = rootEnv;
}
if (dotenvPath) {
  require('dotenv').config({ path: dotenvPath });
}

console.log('🔎 DEBUG ENV:');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[OK]' : '[MISSING]');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL : '[MISSING]');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function assignUserToPole() {
  console.log('🔧 [ASSIGN USER TO POLE] Configuration:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    isLocal: supabaseUrl.includes('127.0.0.1')
  });

  try {
    // 1. Lister tous les utilisateurs
    console.log('\n📋 1. Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('auth_user_id, email, prenom, nom')
      .order('prenom');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`✅ ${users.length} utilisateurs trouvés`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.prenom} ${user.nom} (${user.email}) - ID: ${user.auth_user_id}`);
    });

    // 2. Lister tous les pôles
    console.log('\n📋 2. Récupération des pôles...');
    const { data: poles, error: polesError } = await supabase
      .from('poles')
      .select('id, name, description')
      .order('name');

    if (polesError) {
      console.error('❌ Erreur lors de la récupération des pôles:', polesError);
      return;
    }

    console.log(`✅ ${poles.length} pôles trouvés`);
    poles.forEach((pole, index) => {
      console.log(`${index + 1}. ${pole.name} - ${pole.description}`);
    });

    // 3. Lister les affectations existantes
    console.log('\n📋 3. Affectations existantes...');
    const { data: existingAssignments, error: assignmentsError } = await supabase
      .from('user_poles')
      .select(`
        id,
        user_id,
        pole_id,
        role_level,
        created_at,
        users!user_poles_user_id_fkey(prenom, nom, email),
        poles!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (assignmentsError) {
      console.error('❌ Erreur lors de la récupération des affectations:', assignmentsError);
      return;
    }

    console.log(`✅ ${existingAssignments.length} affectations existantes`);
    existingAssignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.users.prenom} ${assignment.users.nom} → ${assignment.poles.name} (niveau ${assignment.role_level})`);
    });

    // 4. Exemple d'affectation (à décommenter et modifier selon tes besoins)
    console.log('\n📋 4. Affectations aux pôles Stock et Contacts...');
    
    // Affecter l'utilisateur aux pôles Stock et Contacts avec niveau 5 (lecture seule)
    if (users.length > 0 && poles.length > 0) {
      const userToAssign = users[0]; // Ambrosie CAZIMIRA
      const stockPole = poles.find(p => p.name === 'Stock');
      const contactsPole = poles.find(p => p.name === 'Commercial'); // Contacts = Commercial
      
      // Affectation au pôle Stock
      if (stockPole) {
        console.log(`\n🔧 Affectation de ${userToAssign.prenom} ${userToAssign.nom} au pôle ${stockPole.name} avec niveau 5...`);
        
        const { data: stockAssignment, error: stockError } = await supabase
          .from('user_poles')
          .insert({
            user_id: userToAssign.auth_user_id,
            pole_id: stockPole.id,
            role_level: 5, // Collaborateur simple (lecture uniquement)
            granted_by: userToAssign.auth_user_id
          })
          .select()
          .single();

        if (stockError) {
          if (stockError.code === '23505') {
            console.log('⚠️  L\'utilisateur est déjà affecté au pôle Stock');
          } else {
            console.error('❌ Erreur lors de l\'affectation au Stock:', stockError);
          }
        } else {
          console.log('✅ Affectation au Stock réussie!');
          console.log('Affectation Stock:', stockAssignment);
        }
      }

      // Affectation au pôle Commercial (Contacts)
      if (contactsPole) {
        console.log(`\n🔧 Affectation de ${userToAssign.prenom} ${userToAssign.nom} au pôle ${contactsPole.name} avec niveau 5...`);
        
        const { data: contactsAssignment, error: contactsError } = await supabase
          .from('user_poles')
          .insert({
            user_id: userToAssign.auth_user_id,
            pole_id: contactsPole.id,
            role_level: 5, // Collaborateur simple (lecture uniquement)
            granted_by: userToAssign.auth_user_id
          })
          .select()
          .single();

        if (contactsError) {
          if (contactsError.code === '23505') {
            console.log('⚠️  L\'utilisateur est déjà affecté au pôle Commercial');
          } else {
            console.error('❌ Erreur lors de l\'affectation au Commercial:', contactsError);
          }
        } else {
          console.log('✅ Affectation au Commercial réussie!');
          console.log('Affectation Commercial:', contactsAssignment);
        }
      }
    }

    // 5. Tester la fonction RPC
    console.log('\n📋 5. Test de la fonction get_user_pole_access...');
    if (users.length > 0) {
      const testUser = users[0];
      const { data: accessData, error: accessError } = await supabase
        .rpc('get_user_pole_access', {
          p_user_id: testUser.auth_user_id,
          p_pole_name: 'Pricing'
        });

      if (accessError) {
        console.error('❌ Erreur lors du test de la fonction:', accessError);
      } else {
        console.log('✅ Test de la fonction réussi');
        console.log('Accès pour', testUser.prenom, 'au pôle Pricing:', accessData);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Instructions d'utilisation
console.log(`
🎯 SCRIPT D'AFFECTATION UTILISATEUR → PÔLE

Ce script permet de :
1. Lister tous les utilisateurs
2. Lister tous les pôles
3. Voir les affectations existantes
4. Créer une nouvelle affectation (exemple)
5. Tester la fonction RPC

Pour utiliser ce script :
1. Assurez-vous que les variables d'environnement sont configurées
2. Modifiez les paramètres d'affectation dans le script
3. Décommentez les lignes d'affectation souhaitées

Niveaux d'accès disponibles :
- 1: CEO (lecture, écriture, gestion)
- 2: G4 (lecture, écriture, gestion)
- 3: Responsable de Pôle (lecture, écriture, gestion)
- 4: Collaborateur confirmé (lecture, écriture)
- 5: Collaborateur simple (lecture uniquement)
`);

assignUserToPole(); 