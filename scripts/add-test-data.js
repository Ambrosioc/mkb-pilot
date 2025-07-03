const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function addTestData() {
  try {
    console.log('=== Adding Test Data ===');
    
    // Add some test cars
    const testCars = [
      {
        reference: 'TEST001',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        purchase_price: 15000,
        mileage: 50000,
        status: 'disponible',
        created_at: new Date().toISOString()
      },
      {
        reference: 'TEST002',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        purchase_price: 14000,
        mileage: 60000,
        status: 'disponible',
        created_at: new Date().toISOString()
      },
      {
        reference: 'TEST003',
        brand: 'Ford',
        model: 'Focus',
        year: 2021,
        purchase_price: 16000,
        mileage: 40000,
        status: 'prêt à poster',
        created_at: new Date().toISOString()
      }
    ];
    
    const { data, error } = await supabase
      .from('cars_v2')
      .insert(testCars)
      .select();
    
    if (error) {
      console.error('Error inserting test data:', error);
    } else {
      console.log('Test data inserted successfully:', data);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

addTestData(); 