import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { Plus, Search, Filter, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    units_per_crate: 12,
    cost_price_per_bottle: 0,
    selling_price_crate: 0,
    selling_price_bottle: 0,
    current_stock_bottles: 0,
    low_stock_threshold: 12
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // 1. Add to local Dexie
      const id = await db.products.add(newProduct);
      
      // 2. Add to Supabase
      const { error } = await supabase.from('products').insert([{ ...newProduct, id }]);
      if (error) console.error('Supabase sync error:', error);

      setProducts([...products, { ...newProduct, id }]);
      setIsAdding(false);
      setNewProduct({
        name: '', sku: '', units_per_crate: 12, cost_price_per_bottle: 0,
        selling_price_crate: 0, selling_price_bottle: 0, current_stock_bottles: 0, low_stock_threshold: 12
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p className="text-muted">{products.length} Products listed</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {isAdding && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>New Product</h3>
            <button className="btn-ghost" onClick={() => setIsAdding(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label>Product Name</label>
              <input 
                className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>SKU</label>
              <input 
                className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Units per Crate</label>
              <input 
                type="number" className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                value={newProduct.units_per_crate} onChange={e => setNewProduct({...newProduct, units_per_crate: parseInt(e.target.value)})}
              />
            </div>
            <div className="input-group">
              <label>Selling Price (Crate)</label>
              <input 
                type="number" step="0.01" className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                value={newProduct.selling_price_crate} onChange={e => setNewProduct({...newProduct, selling_price_crate: parseFloat(e.target.value)})}
              />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Product</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="search-filter-bar">
        <div className="search-input glass-card">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost glass-card filter-btn">
          <Filter size={18} />
        </button>
      </div>

      <div className="grid-cols-auto">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={() => setProducts(products.filter(p => p.id !== product.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
