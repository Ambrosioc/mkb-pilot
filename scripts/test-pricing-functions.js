const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testPricingFunctions() {
  try {
    console.log('=== Test Pricing Functions ===');
    
    // Test direct SQL queries instead of RPC functions
    console.log('\n1. Testing average posts per user this month:');
    const { data: avgData, error: avgError } = await supabase
      .from('cars_v2')
      .select('created_by, created_at')
      .not('created_at', 'is', null)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    
    if (avgError) {
      console.error('Error fetching cars:', avgError);
    } else {
      // Calculate average manually
      const userPosts = {};
      avgData.forEach(car => {
        if (car.created_by) {
          userPosts[car.created_by] = (userPosts[car.created_by] || 0) + 1;
        }
      });
      
      const postCounts = Object.values(userPosts);
      const average = postCounts.length > 0 ? postCounts.reduce((a, b) => a + b, 0) / postCounts.length : 0;
      console.log('Average posts per user this month:', average);
    }
    
    console.log('\n2. Testing best pricer this month:');
    const { data: bestData, error: bestError } = await supabase
      .from('cars_v2')
      .select('created_by, created_at')
      .not('created_at', 'is', null)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    
    if (bestError) {
      console.error('Error fetching cars for best pricer:', bestError);
    } else {
      // Calculate best pricer manually
      const userPosts = {};
      bestData.forEach(car => {
        if (car.created_by) {
          userPosts[car.created_by] = (userPosts[car.created_by] || 0) + 1;
        }
      });
      
      const bestPricer = Object.entries(userPosts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (bestPricer) {
        console.log('Best pricer:', { user_id: bestPricer[0], total: bestPricer[1] });
      } else {
        console.log('No cars posted this month');
      }
    }
    
    // Test if functions exist
    console.log('\n3. Testing RPC functions:');
    try {
      const { data: avgRpc, error: avgRpcError } = await supabase
        .rpc('get_average_posts_per_user_this_month');
      console.log('RPC Average posts:', avgRpc, 'Error:', avgRpcError);
    } catch (e) {
      console.log('RPC function not available:', e.message);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testPricingFunctions(); 