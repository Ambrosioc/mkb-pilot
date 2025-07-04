const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdvertisementsSchema() {
    console.log('🔧 [ADVERTISEMENTS SCHEMA CHECK] Configuration:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        isLocal: supabaseUrl.includes('127.0.0.1')
    });

    try {
        // 1. Vérifier la structure de la table advertisements
        console.log('\n📋 1. Structure de la table advertisements...');
        
        const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'advertisements' });

        if (columnsError) {
            console.log('⚠️  Impossible de récupérer les colonnes via RPC, essayons une autre approche...');
            
            // Essayer de récupérer un exemple d'annonce pour voir la structure
            const { data: sampleAd, error: sampleError } = await supabase
                .from('advertisements')
                .select('*')
                .limit(1);

            if (sampleError) {
                console.error('❌ Erreur lors de la récupération d\'un exemple d\'annonce:', sampleError);
                return;
            }

            if (sampleAd.length > 0) {
                console.log('✅ Structure de la table advertisements (basée sur un exemple):');
                Object.keys(sampleAd[0]).forEach(key => {
                    console.log(`  - ${key}: ${typeof sampleAd[0][key]} (${sampleAd[0][key]})`);
                });
            } else {
                console.log('⚠️  Aucune annonce trouvée dans la table');
            }
        } else {
            console.log('✅ Colonnes de la table advertisements:', columns);
        }

        // 2. Vérifier les contraintes et les types
        console.log('\n📋 2. Vérification des contraintes...');
        
        // Essayer d'insérer une annonce de test pour voir les erreurs
        const testData = {
            car_id: '00000000-0000-0000-0000-000000000000', // UUID de test
            title: 'Test Title',
            description: 'Test Description',
            price: 10000,
            photos: ['https://example.com/photo.jpg'],
            status: 'active'
        };

        console.log('📝 Tentative d\'insertion avec ces données:', testData);

        const { data: testInsert, error: insertError } = await supabase
            .from('advertisements')
            .insert([testData])
            .select('*')
            .single();

        if (insertError) {
            console.error('❌ Erreur d\'insertion de test:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
        } else {
            console.log('✅ Insertion de test réussie:', testInsert);
            
            // Nettoyer l'insertion de test
            const { error: deleteError } = await supabase
                .from('advertisements')
                .delete()
                .eq('id', testInsert.id);

            if (deleteError) {
                console.error('⚠️  Erreur lors du nettoyage:', deleteError);
            } else {
                console.log('✅ Données de test nettoyées');
            }
        }

        // 3. Vérifier les relations
        console.log('\n📋 3. Vérification des relations...');
        
        // Vérifier la relation avec cars_v2
        const { data: carsSample, error: carsError } = await supabase
            .from('cars_v2')
            .select('id, reference')
            .limit(1);

        if (carsError) {
            console.error('❌ Erreur lors de la vérification de cars_v2:', carsError);
        } else if (carsSample.length > 0) {
            console.log('✅ Relation cars_v2 disponible:', carsSample[0]);
        }

        // Vérifier la relation avec user_profiles
        const { data: usersSample, error: usersError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .limit(1);

        if (usersError) {
            console.error('❌ Erreur lors de la vérification de user_profiles:', usersError);
        } else if (usersSample.length > 0) {
            console.log('✅ Relation user_profiles disponible:', usersSample[0]);
        }

        console.log('\n✅ Vérification terminée !');

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    }
}

// Exécuter la vérification
checkAdvertisementsSchema(); 