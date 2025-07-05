#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📚 GÉNÉRATION DE LA DOCUMENTATION');
console.log('==================================\n');

async function generateDocumentation() {
  try {
    // 1. Récupérer les pôles
    console.log('📋 1. Récupération des pôles...');
    const { data: poles, error: polesError } = await supabase
      .from('poles')
      .select('*')
      .order('name');

    if (polesError) {
      console.error('❌ Erreur lors de la récupération des pôles:', polesError);
      return;
    }

    console.log(`✅ ${poles.length} pôles trouvés`);

    // 2. Récupérer les affectations utilisateurs
    console.log('\n📋 2. Récupération des affectations utilisateurs...');
    const { data: userPoles, error: userPolesError } = await supabase
      .from('user_poles')
      .select(`
        role_level,
        poles (
          name,
          description
        ),
        users!user_poles_user_id_fkey (
          email,
          prenom,
          nom
        )
      `);

    if (userPolesError) {
      console.error('❌ Erreur lors de la récupération des affectations:', userPolesError);
      return;
    }

    console.log(`✅ ${userPoles.length} affectations trouvées`);

    // 3. Générer le rapport
    console.log('\n📋 3. Génération du rapport...');
    
    const report = generateReport(poles, userPoles);
    
    // 4. Sauvegarder le rapport
    const reportPath = path.join(__dirname, '../docs/REPORT_POLES.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Rapport généré: ${reportPath}`);

    // 5. Afficher un résumé
    console.log('\n📊 RÉSUMÉ');
    console.log('==========');
    console.log(`Pôles: ${poles.length}`);
    console.log(`Affectations: ${userPoles.length}`);
    console.log(`Utilisateurs uniques: ${new Set(userPoles.map(up => up.users?.email)).size}`);
    
    // Statistiques par niveau
    const levelStats = {};
    userPoles.forEach(up => {
      const level = up.role_level;
      levelStats[level] = (levelStats[level] || 0) + 1;
    });
    
    console.log('\nRépartition par niveau:');
    Object.entries(levelStats).forEach(([level, count]) => {
      const levelNames = {
        1: 'Administrateur',
        2: 'Manager', 
        3: 'Superviseur',
        4: 'Opérateur',
        5: 'Lecteur'
      };
      console.log(`  Niveau ${level} (${levelNames[level]}): ${count} affectations`);
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

function generateReport(poles, userPoles) {
  const now = new Date().toLocaleString('fr-FR');
  
  let report = `# Rapport des Pôles Métiers et Affectations

*Généré automatiquement le ${now}*

## 📊 Vue d'ensemble

- **Pôles métiers** : ${poles.length}
- **Affectations totales** : ${userPoles.length}
- **Utilisateurs uniques** : ${new Set(userPoles.map(up => up.users?.email)).size}

---

## 🏢 Pôles métiers

`;

  // Détails des pôles
  poles.forEach(pole => {
    const poleAssignments = userPoles.filter(up => up.poles?.name === pole.name);
    const uniqueUsers = new Set(poleAssignments.map(up => up.users?.email));
    
    report += `### ${pole.name}
- **Description** : ${pole.description || 'Aucune description'}
- **Utilisateurs affectés** : ${uniqueUsers.size}
- **Affectations totales** : ${poleAssignments.length}

`;

    // Répartition par niveau pour ce pôle
    const levelStats = {};
    poleAssignments.forEach(up => {
      const level = up.role_level;
      levelStats[level] = (levelStats[level] || 0) + 1;
    });

    if (Object.keys(levelStats).length > 0) {
      report += '**Répartition par niveau :**\n';
      Object.entries(levelStats).forEach(([level, count]) => {
        const levelNames = {
          1: 'Administrateur',
          2: 'Manager', 
          3: 'Superviseur',
          4: 'Opérateur',
          5: 'Lecteur'
        };
        report += `- Niveau ${level} (${levelNames[level]}): ${count}\n`;
      });
      report += '\n';
    }
  });

  report += `---

## 👥 Affectations détaillées

`;

  // Grouper par utilisateur
  const userGroups = {};
  userPoles.forEach(up => {
    const email = up.users?.email;
    if (email) {
      if (!userGroups[email]) {
        userGroups[email] = {
          name: `${up.users?.prenom} ${up.users?.nom}`,
          assignments: []
        };
      }
      userGroups[email].assignments.push({
        pole: up.poles?.name,
        level: up.role_level
      });
    }
  });

  Object.entries(userGroups).forEach(([email, user]) => {
    report += `### ${user.name} (${email})
`;
    
    user.assignments.forEach(assignment => {
      const levelNames = {
        1: 'Administrateur',
        2: 'Manager', 
        3: 'Superviseur',
        4: 'Opérateur',
        5: 'Lecteur'
      };
      report += `- **${assignment.pole}** : Niveau ${assignment.level} (${levelNames[assignment.level]})\n`;
    });
    
    report += '\n';
  });

  report += `---

## 📈 Statistiques

### Répartition globale par niveau
`;

  const globalLevelStats = {};
  userPoles.forEach(up => {
    const level = up.role_level;
    globalLevelStats[level] = (globalLevelStats[level] || 0) + 1;
  });

  Object.entries(globalLevelStats).forEach(([level, count]) => {
    const levelNames = {
      1: 'Administrateur',
      2: 'Manager', 
      3: 'Superviseur',
      4: 'Opérateur',
      5: 'Lecteur'
    };
    report += `- **Niveau ${level} (${levelNames[level]})** : ${count} affectations\n`;
  });

  report += `

### Pôles les plus populaires
`;

  const poleStats = {};
  userPoles.forEach(up => {
    const poleName = up.poles?.name;
    if (poleName) {
      poleStats[poleName] = (poleStats[poleName] || 0) + 1;
    }
  });

  Object.entries(poleStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([poleName, count]) => {
      report += `- **${poleName}** : ${count} affectations\n`;
    });

  report += `

---

## 🔧 Commandes utiles

### Vérifier les permissions d'un utilisateur
\`\`\`bash
node scripts/test-permissions-summary.js
\`\`\`

### Tester la protection des documents
\`\`\`bash
node scripts/test-document-protection.js
\`\`\`

### Régénérer ce rapport
\`\`\`bash
node scripts/generate-docs.js
\`\`\`

---

*Rapport généré automatiquement - Ne pas modifier manuellement*
`;

  return report;
}

generateDocumentation(); 