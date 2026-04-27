import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import ProductCard from '../components/ProductCard';
import ManageProductModal from '../components/ManageProductModal';
import { supabase } from '../lib/supabase';
import { Plus, Search, Filter, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    // Also update selectedProduct if it's currently open to keep data in sync
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
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
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Add New Product</h3>
            <button className="btn-ghost" onClick={() => setIsAdding(false)} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}><X size={20} /></button>
          </div>
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Product Name</label>
              <input 
                className="glass-card" 
                style={{ padding: '0.85rem 1rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', outline: 'none', color: 'var(--text-main)' }}
                placeholder="e.g. Coca Cola 1.5L"
                required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>SKU / Barcode</label>
              <input 
                className="glass-card" 
                style={{ padding: '0.85rem 1rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', outline: 'none', color: 'var(--text-main)' }}
                placeholder="e.g. COKE-1.5L"
                value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Units per Crate</label>
              <input 
                type="number" className="glass-card" 
                style={{ padding: '0.85rem 1rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', outline: 'none', color: 'var(--text-main)' }}
                value={newProduct.units_per_crate} onChange={e => setNewProduct({...newProduct, units_per_crate: parseInt(e.target.value)})}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Selling Price (Crate)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>GH₵</span>
                <input 
                  type="number" step="0.01" className="glass-card" 
                  style={{ padding: '0.85rem 1rem 0.85rem 3rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', outline: 'none', color: 'var(--text-main)' }}
                  value={newProduct.selling_price_crate} onChange={e => setNewProduct({...newProduct, selling_price_crate: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>Save Product</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Discard Changes</button>
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
            onDelete={handleDeleteProduct}
            onManage={setSelectedProduct}
          />
        ))}
      </div>

      {selectedProduct && (
        <ManageProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  );
};

export default Products;
