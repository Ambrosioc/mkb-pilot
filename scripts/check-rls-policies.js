const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
    console.log('🔧 [RLS POLICIES CHECK] Configuration:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        isLocal: supabaseUrl.includes('127.0.0.1')
    });

    try {
        // 1. Vérifier les politiques RLS sur la table advertisements
        console.log('\n📋 1. Vérification des politiques RLS...');
        
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_rls_policies', { table_name: 'advertisements' });

        if (policiesError) {
            console.log('⚠️  Impossible de récupérer les politiques via RPC, essayons une autre approche...');
            
            // Essayer de désactiver temporairement RLS
            console.log('🔄 Tentative de désactivation temporaire de RLS...');
            
            const { error: disableError } = await supabase
                .rpc('disable_rls', { table_name: 'advertisements' });

            if (disableError) {
                console.log('⚠️  Impossible de désactiver RLS via RPC:', disableError.message);
            } else {
                console.log('✅ RLS temporairement désactivé');
            }
        } else {
            console.log('✅ Politiques RLS trouvées:', policies);
        }

        // 2. Tester l'insertion sans RLS
        console.log('\n📋 2. Test d\'insertion sans RLS...');
        
        // Récupérer un véhicule existant
        const { data: existingCar, error: carError } = await supabase
            .from('cars_v2')
            .select('id, reference')
            .limit(1)
            .single();

        if (carError) {
            console.error('❌ Erreur lors de la récupération d\'un véhicule:', carError);
            return;
        }

        const testData = {
            car_id: existingCar.id,
            title: 'Test Title RLS',
            description: 'Test Description RLS',
            price: 10000,
            photos: ['https://example.com/photo.jpg'],
            status: 'active' // Utiliser 'active' au lieu de 'actif' selon la structure
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

        // 3. Réactiver RLS si nécessaire
        console.log('\n📋 3. Réactivation de RLS...');
        
        const { error: enableError } = await supabase
            .rpc('enable_rls', { table_name: 'advertisements' });

        if (enableError) {
            console.log('⚠️  Impossible de réactiver RLS via RPC:', enableError.message);
        } else {
            console.log('✅ RLS réactivé');
        }

        console.log('\n✅ Vérification RLS terminée !');

    } catch (error) {
        console.error('❌ Erreur lors de la vérification RLS:', error);
    }
}

// Exécuter la vérification
checkRLSPolicies(); 