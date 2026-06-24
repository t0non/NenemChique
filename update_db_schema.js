const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSchema() {
  try {
    console.log('Adding missing columns to products table...');
    
    // Add is_best_seller column
    const { error: error1 } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    if (error1 && error1.message.includes('is_best_seller')) {
      console.log('Column is_best_seller is missing, adding it...');
      // This will fail, but we know the column is missing
    }
    
    // Try to execute raw SQL
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false; ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller_rank integer;'
      });
    
    if (error) {
      console.log('RPC method not available, trying alternative approach...');
      
      // Alternative: Try to select a product with the new columns to see if they exist
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, is_best_seller, best_seller_rank')
        .limit(1);
        
      if (testError && testError.message.includes('column')) {
        console.log('Columns are missing. You need to run the SQL manually:');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false;');
        console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller_rank integer;');
      } else {
        console.log('Columns already exist or were added successfully!');
      }
    } else {
      console.log('Schema updated successfully!');
    }
    
  } catch (err) {
    console.error('Error updating schema:', err.message);
  }
}

updateSchema();
