// Script de test pour la connexion SFTP
// Usage: node scripts/test-sftp-connection.js

const Client = require('ssh2-sftp-client');
require('dotenv').config({ path: '.env.local' });

async function testSftpConnection() {
  console.log('🧪 Test de connexion SFTP...\n');
  
  const sftp = new Client();
  
  // Configuration de test
  const config = {
    host: 'sw7sw.ftp.infomaniak.com',
    port: 22, // Port SSH/SFTP
    username: 'sw7sw_mkb',
    password: process.env.SFTP_PASSWORD, // Utiliser le mot de passe depuis .env.local
    readyTimeout: 10000,
    retries: 2
  };
  
  console.log('Configuration de test:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Username: ${config.username}`);
  console.log(`Password: ${config.password ? '✅ Configuré' : '❌ Manquant'}`);
  console.log('');
  
  if (!config.password) {
    console.error('❌ Erreur: SFTP_PASSWORD manquant dans .env.local');
    console.log('Ajoutez SFTP_PASSWORD=votre_mot_de_passe dans .env.local');
    process.exit(1);
  }
  
  try {
    console.log('🔌 Tentative de connexion...');
    await sftp.connect(config);
    console.log('✅ Connexion SSH/SFTP réussie !');
    
    // Test direct du bon chemin Infomaniak
    console.log('\n📁 Test du chemin Infomaniak...');
    const infomaniakPath = '/home/clients/579d9810fe84939753a28b4360138c3f/var/www/mkbautomobile/uploads';
    
    try {
      const list = await sftp.list(infomaniakPath);
      console.log(`Contenu de ${infomaniakPath}:`);
      list.forEach(item => {
        console.log(`  ${item.type === 'd' ? '📁' : '📄'} ${item.name}`);
      });
    } catch (listError) {
      console.log(`⚠️  Impossible de lister ${infomaniakPath}: ${listError.message}`);
    }
    
    // Test de création de dossier
    console.log('\n📁 Test de création de dossier...');
    const testDir = `${infomaniakPath}/test-sftp`;
    try {
      await sftp.mkdir(testDir, true);
      console.log(`✅ Dossier créé: ${testDir}`);
      
      // Test d'upload d'un fichier
      console.log('\n📤 Test d\'upload...');
      const testContent = Buffer.from('Test SFTP connection - ' + new Date().toISOString());
      const testFile = `${testDir}/test.txt`;
      await sftp.put(testContent, testFile);
      console.log(`✅ Fichier uploadé: ${testFile}`);
      
      // Nettoyage
      await sftp.delete(testFile);
      await sftp.rmdir(testDir);
      console.log('🧹 Fichiers de test supprimés');
      
    } catch (dirError) {
      console.log(`⚠️  Impossible de créer le dossier de test: ${dirError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Authentication')) {
      console.log('\n💡 Suggestions:');
      console.log('- Vérifiez le nom d\'utilisateur et le mot de passe');
      console.log('- Assurez-vous que l\'accès SFTP est activé dans Infomaniak');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('- Vérifiez l\'adresse du serveur');
      console.log('- Vérifiez que le port 22 est ouvert');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Suggestions:');
      console.log('- Vérifiez votre connexion internet');
      console.log('- Le serveur peut être temporairement indisponible');
    }
  } finally {
    try {
      await sftp.end();
      console.log('\n🔌 Connexion fermée');
    } catch (closeError) {
      console.error('❌ Erreur fermeture:', closeError.message);
    }
  }
}

// Test avec différents ports
async function testMultiplePorts() {
  console.log('🔍 Test sur différents ports...\n');
  
  const ports = [22, 2222, 222, 21];
  const sftp = new Client();
  
  for (const port of ports) {
    try {
      console.log(`🧪 Test port ${port}...`);
      
      await sftp.connect({
        host: 'sw7sw.ftp.infomaniak.com',
        port,
        username: 'sw7sw_mkb',
        password: process.env.SFTP_PASSWORD,
        readyTimeout: 5000,
        retries: 1
      });
      
      console.log(`✅ Port ${port} fonctionne !`);
      await sftp.end();
      return port;
      
    } catch (error) {
      console.log(`❌ Port ${port} échoue: ${error.message}`);
      try {
        await sftp.end();
      } catch {}
    }
  }
  
  console.log('\n❌ Aucun port ne fonctionne');
  return null;
}

// Exécution des tests
async function runTests() {
  console.log('🚀 Démarrage des tests SFTP\n');
  
  // Test sur différents ports
  const workingPort = await testMultiplePorts();
  
  if (workingPort) {
    console.log(`\n🎯 Port fonctionnel trouvé: ${workingPort}`);
    console.log('\n📋 Configuration recommandée pour .env.local:');
    console.log(`SFTP_HOST=sw7sw.ftp.infomaniak.com`);
    console.log(`SFTP_PORT=${workingPort}`);
    console.log(`SFTP_USER=sw7sw_mkb`);
    console.log(`SFTP_PASSWORD=votre_mot_de_passe`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test complet
  await testSftpConnection();
}

runTests().catch(console.error); 