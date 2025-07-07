const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testUploadComplete() {
  try {
    console.log('🧪 Test d\'upload complet via l\'API...\n');

    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return;
    }

    console.log('✅ Variables d\'environnement Supabase configurées');

    // Créer un fichier de test
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const testImageBuffer = Buffer.from('fake-jpeg-data', 'utf8');
    fs.writeFileSync(testImagePath, testImageBuffer);

    console.log('📄 Fichier de test créé:', testImagePath);

    // Créer un FormData avec le fichier de test
    const FormData = require('form-data');
    const formData = new FormData();
    
    const testFile = fs.createReadStream(testImagePath);
    formData.append('file', testFile, 'test-image.jpg');
    formData.append('reference', 'TEST001');
    formData.append('car_id', '999');

    console.log('📋 FormData préparé avec:');
    console.log('  - Fichier: test-image.jpg');
    console.log('  - Référence: TEST001');
    console.log('  - Car ID: 999');

    // Simuler une requête vers l'API
    console.log('\n🌐 Test de l\'API /api/upload...');
    console.log('⚠️  Note: Ce test nécessite que le serveur Next.js soit en cours d\'exécution');
    console.log('   Lancez "npm run dev" dans un autre terminal');

    // Instructions pour tester manuellement
    console.log('\n📝 Pour tester manuellement:');
    console.log('1. Lancez le serveur: npm run dev');
    console.log('2. Connectez-vous à l\'application');
    console.log('3. Allez dans Pricing → Angola');
    console.log('4. Ajoutez un véhicule et uploadez des images');
    console.log('5. Vérifiez les logs dans la console du serveur');

    // Nettoyer le fichier de test
    fs.unlinkSync(testImagePath);
    console.log('\n🗑️ Fichier de test supprimé');

    console.log('\n✅ Test préparé avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Configurez les variables SFTP dans .env.local');
    console.log('2. Testez la connexion SFTP: node scripts/test-sftp-connection.js');
    console.log('3. Testez l\'upload via l\'interface utilisateur');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testUploadComplete().catch(console.error); 