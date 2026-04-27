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
// Seed data function - now empty for production
export const seedDB = async () => {
  // No mock data in production
};
