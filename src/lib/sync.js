import { supabase } from './supabase';
import { db } from './db';

/**
 * Syncs data from Supabase to the local Dexie database.
 */
export const pullFromSupabase = async () => {
  try {
    console.log('Starting sync from Supabase...');

    // 1. Sync Categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) throw catError;
    if (categories) {
      await db.categories.clear();
      await db.categories.bulkAdd(categories);
    }

    // 2. Sync Products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*');
    
    if (prodError) throw prodError;
    if (products) {
      await db.products.clear();
      await db.products.bulkAdd(products);
    }

    // 3. Sync Customers
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*');
    
    if (custError) throw custError;
    if (customers) {
      await db.customers.clear();
      await db.customers.bulkAdd(customers);
    }

    console.log('Sync completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Sync failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Pushes a new sale to Supabase.
 * This should be called after a successful local sale.
 */
export const pushSaleToSupabase = async (sale, items) => {
  try {
    // 1. Insert Sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();
    
    if (saleError) throw saleError;

    // 2. Insert Sale Items
    const saleItemsWithId = items.map(item => ({
      ...item,
      sale_id: saleData.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsWithId);
    
    if (itemsError) throw itemsError;

    return { success: true, data: saleData };
  } catch (error) {
    console.error('Push sale failed:', error.message);
    return { success: false, error: error.message };
  }
};
