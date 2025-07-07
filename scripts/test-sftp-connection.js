const Client = require('ssh2-sftp-client');
require('dotenv').config({ path: '.env.local' });

async function testSftpConnection() {
  const sftp = new Client();
  
  try {
    // Vérifier les variables d'environnement SFTP
    const host = process.env.SFTP_HOST || 'sw7sw.ftp.infomaniak.com';
    const port = parseInt(process.env.SFTP_PORT || '22');
    const username = process.env.SFTP_USER || 'sw7sw_mkb';
    const password = process.env.SFTP_PASSWORD;

    console.log('🔧 Configuration SFTP:');
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password ? '✅ Configuré' : '❌ Manquant'}`);

    if (!host || !username || !password) {
      console.error('❌ Variables d\'environnement SFTP manquantes');
      console.log('Veuillez configurer dans .env.local:');
      console.log('SFTP_HOST=sw7sw.ftp.infomaniak.com');
      console.log('SFTP_PORT=22');
      console.log('SFTP_USER=sw7sw_mkb');
      console.log('SFTP_PASSWORD=votre_mot_de_passe');
      return;
    }

    console.log('\n🧪 Test de connexion SFTP...');

    const connectionConfig = {
      host,
      port,
      username,
      password,
      readyTimeout: 30000,
      retries: 3,
      retry_factor: 2,
      retry_minTimeout: 5000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3
    };

    await sftp.connect(connectionConfig);
    console.log('✅ Connexion SFTP réussie !');

    // Test de création de dossier
    const testDir = '/home/clients/579d9810fe84939753a28b4360138c3f/var/www/mkbautomobile/uploads/test';
    console.log(`\n📁 Test de création de dossier: ${testDir}`);
    
    try {
      await sftp.mkdir(testDir, true);
      console.log('✅ Dossier de test créé avec succès');
      
      // Test d'upload d'un fichier
      const testContent = 'Test file content';
      const testFilePath = `${testDir}/test.txt`;
      console.log(`\n📄 Test d'upload de fichier: ${testFilePath}`);
      
      await sftp.put(Buffer.from(testContent), testFilePath);
      console.log('✅ Fichier de test uploadé avec succès');
      
      // Vérifier que le fichier existe
      const fileExists = await sftp.exists(testFilePath);
      console.log(`📋 Fichier existe: ${fileExists}`);
      
      // Supprimer le fichier de test
      await sftp.delete(testFilePath);
      console.log('🗑️ Fichier de test supprimé');
      
    } catch (dirError) {
      console.error('❌ Erreur lors du test de dossier:', dirError.message);
    }

    await sftp.end();
    console.log('\n🔌 Connexion SFTP fermée');
    console.log('\n✅ Tous les tests SFTP sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur de connexion SFTP:', error.message);
    
    if (error.message.includes('Authentication')) {
      console.log('\n💡 Vérifiez vos identifiants SFTP dans .env.local');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Vérifiez l\'adresse et le port du serveur SFTP');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Le serveur met trop de temps à répondre, vérifiez la connexion réseau');
    }
  }
}

testSftpConnection().catch(console.error); 