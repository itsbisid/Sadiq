import React, { useState } from 'react';
import { Package, AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../lib/db';
import './ProductCard.css';

const ProductCard = ({ product, onDelete, onManage }) => {
  const isLowStock = product.current_stock_bottles <= product.low_stock_threshold;
  
  const displayCrates = Math.floor(product.current_stock_bottles / product.units_per_crate);
  const displayBottles = product.current_stock_bottles % product.units_per_crate;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    
    console.log('Confirming delete for:', product.id);
    try {
      const id = Number(product.id);
      await db.products.delete(id);
      console.log('Successfully deleted from Dexie:', id);
      if (onDelete) onDelete(id);
    } catch (err) {
      console.error('CRITICAL: Delete failed:', err);
      alert('Could not delete product. Check console for details.');
    } finally {
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className={`glass-card product-card ${isLowStock ? 'warning-border' : ''}`}>
      <div className="product-header">
        <div className="product-info">
          <div className="product-icon">
            <Package size={24} className={isLowStock ? 'text-warning' : 'text-primary'} />
          </div>
          <div className="product-details">
            <h3>{product.name}</h3>
            <span className="sku">{product.sku}</span>
          </div>
        </div>
        <button 
          className={`delete-btn ${showConfirmDelete ? 'confirming' : ''}`} 
          onClick={handleDelete} 
          title={showConfirmDelete ? "Confirm Delete" : "Delete Product"}
          style={{ backgroundColor: showConfirmDelete ? 'var(--danger)' : '', color: showConfirmDelete ? 'white' : '' }}
        >
          {showConfirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
        </button>
      </div>
      
      <div className="product-stock">
        <div className="stock-values">
          <div className="stock-item">
            <span className="value">{displayCrates}</span>
            <span className="label">Crates</span>
          </div>
          <div className="stock-divider" />
          <div className="stock-item">
            <span className="value">{displayBottles}</span>
            <span className="label">Bottles</span>
          </div>
        </div>
        
        {isLowStock && (
          <div className="low-stock-badge">
            <AlertTriangle size={14} />
            <span>Low Stock</span>
          </div>
        )}
      </div>
      
      <div className="product-actions">
        <button className="btn-ghost" onClick={() => onManage(product)}>
          <span>Manage</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
