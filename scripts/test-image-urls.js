const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testImageUrls() {
  try {
    console.log('🧪 Test des URLs d\'images après migration...\n');

    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return;
    }

    console.log('✅ Variables d\'environnement Supabase configurées');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer quelques annonces avec des photos
    console.log('\n📋 Récupération des annonces avec photos...');
    const { data: advertisements, error } = await supabase
      .from('advertisements')
      .select('id, car_id, photos, created_at')
      .not('photos', 'is', null)
      .limit(10);

    if (error) {
      console.error('❌ Erreur lors de la récupération des annonces:', error);
      return;
    }

    console.log(`✅ ${advertisements?.length || 0} annonces trouvées avec des photos`);

    if (advertisements && advertisements.length > 0) {
      console.log('\n📊 URLs des images:');
      
      advertisements.forEach((ad, index) => {
        console.log(`\nAnnonce ${index + 1} (ID: ${ad.id}):`);
        console.log(`  - Car ID: ${ad.car_id}`);
        console.log(`  - Date: ${ad.created_at}`);
        console.log(`  - Nombre de photos: ${ad.photos?.length || 0}`);
        
        if (ad.photos && ad.photos.length > 0) {
          ad.photos.forEach((photo, photoIndex) => {
            const isNewUrl = photo.includes('images.mkbautomobile.com');
            const status = isNewUrl ? '✅' : '❌';
            console.log(`    ${status} Photo ${photoIndex + 1}: ${photo}`);
          });
        }
      });

      // Vérifier les statistiques
      const totalPhotos = advertisements.reduce((total, ad) => total + (ad.photos?.length || 0), 0);
      const newUrls = advertisements.reduce((total, ad) => {
        return total + (ad.photos?.filter(photo => photo.includes('images.mkbautomobile.com')).length || 0);
      }, 0);
      const oldUrls = totalPhotos - newUrls;

      console.log('\n📈 Statistiques:');
      console.log(`  - Total photos: ${totalPhotos}`);
      console.log(`  - URLs mises à jour: ${newUrls}`);
      console.log(`  - URLs à mettre à jour: ${oldUrls}`);
      console.log(`  - Taux de mise à jour: ${totalPhotos > 0 ? ((newUrls / totalPhotos) * 100).toFixed(1) : 0}%`);

      if (oldUrls > 0) {
        console.log('\n⚠️ Certaines URLs utilisent encore l\'ancien format');
        console.log('💡 Exécutez la migration pour mettre à jour toutes les URLs');
      } else {
        console.log('\n✅ Toutes les URLs sont à jour !');
      }
    } else {
      console.log('⚠️ Aucune annonce avec des photos trouvée');
    }

    // Test de génération d'URL pour un nouveau véhicule
    console.log('\n🧪 Test de génération d\'URL pour nouveau véhicule:');
    const testReference = 'TEST001';
    const testFileName = 'photo-1.jpg';
    const testUrl = `https://images.mkbautomobile.com/photos/${testReference}/${testFileName}`;
    console.log(`  - Référence: ${testReference}`);
    console.log(`  - Fichier: ${testFileName}`);
    console.log(`  - URL générée: ${testUrl}`);

    console.log('\n✅ Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testImageUrls().catch(console.error); 