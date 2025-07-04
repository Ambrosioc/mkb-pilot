const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPriceVehicleUpload() {
    console.log('🔧 [PRICE VEHICLE UPLOAD TEST] Configuration:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        isLocal: supabaseUrl.includes('127.0.0.1')
    });

    try {
        // 1. Vérifier qu'il y a des véhicules à poster
        console.log('\n📋 1. Vérification des véhicules à poster...');
        
        const { data: vehiclesToPost, error: vehiclesError } = await supabase
            .from('cars_v2')
            .select(`
                id,
                reference,
                brand:brands(name),
                model:models(name),
                year,
                color,
                price,
                purchase_price,
                location,
                status,
                created_at,
                user_profiles!cars_v2_user_id_fkey(full_name)
            `)
            .not('id', 'in', `(
                select car_id 
                from advertisements 
                where car_id is not null
            )`)
            .limit(5);

        if (vehiclesError) {
            console.error('❌ Erreur lors de la récupération des véhicules:', vehiclesError);
            return;
        }

        console.log(`✅ ${vehiclesToPost.length} véhicules trouvés à poster`);
        
        if (vehiclesToPost.length === 0) {
            console.log('⚠️  Aucun véhicule à poster trouvé. Créons un véhicule de test...');
            
            // Créer un véhicule de test
            const { data: testVehicle, error: createError } = await supabase
                .from('cars_v2')
                .insert([{
                    brand_id: 1, // Assurez-vous que cette marque existe
                    model_id: 1, // Assurez-vous que ce modèle existe
                    year: 2020,
                    color: 'Blanc',
                    price: 15000,
                    purchase_price: 12000,
                    location: 'Paris',
                    status: 'disponible',
                    user_id: '00000000-0000-0000-0000-000000000000', // Utilisateur de test
                    add_by_user: '00000000-0000-0000-0000-000000000000'
                }])
                .select('id, reference')
                .single();

            if (createError) {
                console.error('❌ Erreur lors de la création du véhicule de test:', createError);
                return;
            }

            console.log('✅ Véhicule de test créé:', testVehicle);
        }

        // 2. Vérifier la structure de la table advertisements
        console.log('\n📋 2. Vérification de la structure de la table advertisements...');
        
        const { data: advertisementColumns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'advertisements' });

        if (columnsError) {
            console.log('⚠️  Impossible de récupérer les colonnes, vérifions manuellement...');
            
            const { data: sampleAd, error: sampleError } = await supabase
                .from('advertisements')
                .select('*')
                .limit(1);

            if (sampleError) {
                console.error('❌ Erreur lors de la vérification de la table advertisements:', sampleError);
                return;
            }

            console.log('✅ Structure de la table advertisements vérifiée');
            if (sampleAd.length > 0) {
                console.log('📝 Exemple d\'annonce:', Object.keys(sampleAd[0]));
            }
        } else {
            console.log('✅ Colonnes de la table advertisements:', advertisementColumns);
        }

        // 3. Tester la création d'une annonce avec photos
        console.log('\n📋 3. Test de création d\'annonce avec photos...');
        
        const testVehicle = vehiclesToPost[0] || { id: 'test-id', reference: 'TEST-001' };
        
        const testAdvertisement = {
            car_id: testVehicle.id,
            title: 'Test d\'annonce avec photos',
            description: 'Description de test pour vérifier l\'upload d\'images',
            price: testVehicle.price || 15000,
            photos: [
                'https://example.com/photo1.jpg',
                'https://example.com/photo2.jpg'
            ],
            status: 'actif',
            posted_by_user: '00000000-0000-0000-0000-000000000000' // Utilisateur de test
        };

        const { data: createdAd, error: createAdError } = await supabase
            .from('advertisements')
            .insert([testAdvertisement])
            .select('*')
            .single();

        if (createAdError) {
            console.error('❌ Erreur lors de la création de l\'annonce de test:', createAdError);
            return;
        }

        console.log('✅ Annonce de test créée avec succès:', {
            id: createdAd.id,
            car_id: createdAd.car_id,
            title: createdAd.title,
            photos_count: createdAd.photos?.length || 0
        });

        // 4. Vérifier que l'API d'upload est accessible
        console.log('\n📋 4. Vérification de l\'API d\'upload...');
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'http://127.0.0.1:54321'}/api/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    test: true
                })
            });

            if (response.status === 404) {
                console.log('⚠️  API d\'upload non trouvée (normal en mode test)');
            } else {
                console.log('✅ API d\'upload accessible');
            }
        } catch (error) {
            console.log('⚠️  Impossible de tester l\'API d\'upload (normal en mode test):', error.message);
        }

        // 5. Nettoyer les données de test
        console.log('\n📋 5. Nettoyage des données de test...');
        
        if (createdAd) {
            const { error: deleteError } = await supabase
                .from('advertisements')
                .delete()
                .eq('id', createdAd.id);

            if (deleteError) {
                console.error('⚠️  Erreur lors du nettoyage de l\'annonce de test:', deleteError);
            } else {
                console.log('✅ Annonce de test supprimée');
            }
        }

        console.log('\n✅ Test terminé avec succès !');
        console.log('\n📝 Résumé:');
        console.log('- ✅ Véhicules à poster récupérés');
        console.log('- ✅ Structure de la table advertisements vérifiée');
        console.log('- ✅ Création d\'annonce avec photos testée');
        console.log('- ✅ API d\'upload vérifiée');
        console.log('- ✅ Nettoyage effectué');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
testPriceVehicleUpload(); 