import React, { useState } from 'react';
import { X, Save, Plus, Minus, AlertCircle, History, Package } from 'lucide-react';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';

const ManageProductModal = ({ product, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'stock'
  const [formData, setFormData] = useState({ ...product });
  const [adjustment, setAdjustment] = useState({ amount: 0, type: 'add', reason: 'Restock' });
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Saving details for:', product.id, formData);
      await db.products.update(product.id, formData);
      onUpdate({ ...formData });

      // Background sync - wrapped in async to avoid then/catch issues
      (async () => {
        try {
          const { error } = await supabase
            .from('products')
            .update(formData)
            .eq('id', product.id);
          if (error) console.error('Supabase sync error:', error);
          else console.log('Supabase sync successful');
        } catch (err) {
          console.error('Supabase sync exception:', err);
        }
      })();
      
      alert('Product updated successfully!');
      onClose();
    } catch (err) {
      console.error('Local update failed:', err);
      alert('Failed to update product details locally');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (adjustment.amount <= 0) return;
    
    setLoading(true);
    try {
      const adjustmentBottles = adjustment.type === 'add' ? adjustment.amount : -adjustment.amount;
      const newStock = product.current_stock_bottles + adjustmentBottles;
      
      if (newStock < 0) {
        alert('Cannot reduce stock below zero');
        return;
      }

      await db.products.update(product.id, { current_stock_bottles: newStock });
      await db.inventory_log.add({
        product_id: product.id,
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason,
        created_at: new Date().toISOString()
      });

      onUpdate({ ...product, current_stock_bottles: newStock });
      setAdjustment({ amount: 0, type: 'add', reason: 'Restock' });

      // Background sync
      (async () => {
        try {
          await supabase
            .from('products')
            .update({ current_stock_bottles: newStock })
            .eq('id', product.id);
          
          await supabase
            .from('inventory_log')
            .insert([{
              product_id: product.id,
              type: adjustment.type,
              amount: adjustment.amount,
              reason: adjustment.reason,
              created_at: new Date().toISOString()
            }]);
        } catch (err) {
          console.error('Supabase stock sync exception:', err);
        }
      })();

      alert('Stock adjusted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to adjust stock locally');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    console.log('Final confirmation to delete product:', product.id);
    setLoading(true);
    try {
      const id = Number(product.id);
      await db.products.delete(id);
      console.log('Product removed from Dexie:', id);
      
      // Background sync
      (async () => {
        try {
          await supabase.from('products').delete().eq('id', id);
          console.log('Supabase sync: Delete successful');
        } catch (err) {
          console.error('Supabase sync: Delete failed', err);
        }
      })();

      onDelete(id);
      onClose();
    } catch (err) {
      console.error('CRITICAL: Delete failed:', err);
      alert('Failed to delete product from local database');
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="customer-modal-overlay animate-fade-in">
      <div className="customer-modal glass-card" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="product-icon" style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{product.name}</h3>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>{product.sku}</span>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button 
            className={`btn-ghost ${activeTab === 'details' ? 'active-tab' : ''}`} 
            style={{ flex: 1, padding: '1rem', borderRadius: 0, borderBottom: activeTab === 'details' ? '2px solid var(--primary)' : 'none' }}
            onClick={() => setActiveTab('details')}
          >
            Product Details
          </button>
          <button 
            className={`btn-ghost ${activeTab === 'stock' ? 'active-tab' : ''}`} 
            style={{ flex: 1, padding: '1rem', borderRadius: 0, borderBottom: activeTab === 'stock' ? '2px solid var(--primary)' : 'none' }}
            onClick={() => setActiveTab('stock')}
          >
            Stock Management
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'details' ? (
            <form onSubmit={handleSaveDetails} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Product Name</label>
                  <input 
                    className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>SKU</label>
                  <input 
                    className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Selling Price (Crate)</label>
                  <input 
                    type="number" step="0.01" className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.selling_price_crate} onChange={e => setFormData({...formData, selling_price_crate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Selling Price (Bottle)</label>
                  <input 
                    type="number" step="0.01" className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.selling_price_bottle} onChange={e => setFormData({...formData, selling_price_bottle: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Units Per Crate</label>
                  <input 
                    type="number" className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.units_per_crate} onChange={e => setFormData({...formData, units_per_crate: parseInt(e.target.value)})}
                  />
                </div>
                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Low Stock Threshold</label>
                  <input 
                    type="number" className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className={`btn ${showConfirmDelete ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={handleDelete} 
                  style={{ color: showConfirmDelete ? 'white' : 'var(--danger)', backgroundColor: showConfirmDelete ? 'var(--danger)' : '' }}
                >
                  {showConfirmDelete ? 'Confirm Permanent Delete?' : 'Delete Product'}
                </button>
                {showConfirmDelete && (
                  <button type="button" className="btn-ghost" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                )}
                {!showConfirmDelete && (
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="text-muted">Current Stock</span>
                  <span style={{ fontWeight: 'bold' }}>{product.current_stock_bottles} Bottles</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.floor(product.current_stock_bottles / product.units_per_crate)}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Crates</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.current_stock_bottles % product.units_per_crate}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Bottles</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`btn ${adjustment.type === 'add' ? 'btn-primary' : 'btn-ghost'}`} 
                    style={{ flex: 1 }}
                    onClick={() => setAdjustment({...adjustment, type: 'add'})}
                  >
                    <Plus size={18} /> Add
                  </button>
                  <button 
                    className={`btn ${adjustment.type === 'remove' ? 'btn-primary' : 'btn-ghost'}`} 
                    style={{ flex: 1, backgroundColor: adjustment.type === 'remove' ? 'var(--danger)' : '' }}
                    onClick={() => setAdjustment({...adjustment, type: 'remove'})}
                  >
                    <Minus size={18} /> Remove
                  </button>
                </div>

                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Amount (Bottles)</label>
                  <input 
                    type="number" className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                    value={adjustment.amount} onChange={e => setAdjustment({...adjustment, amount: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="input-group">
                  <label className="text-muted" style={{ fontSize: '0.85rem' }}>Reason</label>
                  <select 
                    className="glass-card" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                    value={adjustment.reason} onChange={e => setAdjustment({...adjustment, reason: e.target.value})}
                  >
                    <option>Restock</option>
                    <option>Manual Adjustment</option>
                    <option>Damage/Broken</option>
                    <option>Expired</option>
                    <option>Return</option>
                  </select>
                </div>

                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAdjustStock} disabled={loading || adjustment.amount <= 0}>
                  Confirm Adjustment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProductModal;
