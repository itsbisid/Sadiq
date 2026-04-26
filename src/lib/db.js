import Dexie from 'dexie';

export const db = new Dexie('WDDMS_DB');

db.version(1).stores({
  products: '++id, name, sku, category_id, current_stock_bottles',
  categories: '++id, name',
  customers: '++id, name, phone',
  sales: '++id, customer_id, created_at',
  sale_items: '++id, sale_id, product_id',
  inventory_log: '++id, product_id, type, created_at',
  suppliers: '++id, name',
  purchases: '++id, supplier_id, created_at',
  purchase_items: '++id, purchase_id, product_id',
  expenses: '++id, category, created_at'
});

// Seed data for testing
export const seedDB = async () => {
  const productCount = await db.products.count();
  if (productCount === 0) {
    const categories = await db.categories.bulkAdd([
      { name: 'Soft Drinks' },
      { name: 'Alcohol' },
      { name: 'Water' },
      { name: 'Energy Drinks' }
    ], { allKeys: true });

    await db.products.bulkAdd([
      {
        name: 'Coca Cola 300ml',
        sku: 'COKE-300',
        category_id: categories[0],
        units_per_crate: 24,
        cost_price_per_bottle: 2.50,
        selling_price_crate: 72.00,
        selling_price_bottle: 3.50,
        current_stock_bottles: 480,
        low_stock_threshold: 120
      },
      {
        name: 'Club Beer 625ml',
        sku: 'CLUB-625',
        category_id: categories[1],
        units_per_crate: 12,
        cost_price_per_bottle: 8.00,
        selling_price_crate: 108.00,
        selling_price_bottle: 10.00,
        current_stock_bottles: 24,
        low_stock_threshold: 60
      },
      {
        name: 'Verna Water 500ml',
        sku: 'VERNA-500',
        category_id: categories[2],
        units_per_crate: 15,
        cost_price_per_bottle: 1.00,
        selling_price_crate: 18.00,
        selling_price_bottle: 1.50,
        current_stock_bottles: 300,
        low_stock_threshold: 75
      }
    ]);
    
    await db.customers.add({
      name: 'General Customer',
      phone: '0000000000',
      balance: 0
    });
  }
};
