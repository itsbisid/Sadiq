import React, { useState } from 'react';
import { Package, AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../lib/db';

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
    
    try {
      const id = Number(product.id);
      await db.products.delete(id);
      if (onDelete) onDelete(id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setShowConfirmDelete(false);
    }
  };

  // Inline styles for production reliability
  const cardStyle = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    transition: 'all 0.3s ease',
    border: isLowStock ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    minHeight: '220px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const infoGroupStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  const iconBgStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: isLowStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isLowStock ? '#f87171' : '#818cf8'
  };

  const nameStyle = {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0
  };

  const skuStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const stockGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    gap: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '1rem',
    borderRadius: '12px',
    alignItems: 'center'
  };

  const stockItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const stockValueStyle = {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)'
  };

  const stockLabelStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  };

  const deleteBtnStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    background: showConfirmDelete ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
    color: showConfirmDelete ? 'white' : 'var(--text-muted)'
  };

  return (
    <div className="glass-card product-card-hover" style={cardStyle}>
      <div style={headerStyle}>
        <div style={infoGroupStyle}>
          <div style={iconBgStyle}>
            <Package size={22} />
          </div>
          <div>
            <h3 style={nameStyle}>{product.name}</h3>
            <span style={skuStyle}>{product.sku}</span>
          </div>
        </div>
        <button 
          style={deleteBtnStyle} 
          onClick={handleDelete}
        >
          {showConfirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
        </button>
      </div>
      
      <div style={stockGridStyle}>
        <div style={stockItemStyle}>
          <span style={stockValueStyle}>{displayCrates}</span>
          <span style={stockLabelStyle}>Crates</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={stockItemStyle}>
          <span style={stockValueStyle}>{displayBottles}</span>
          <span style={stockLabelStyle}>Bottles</span>
        </div>
      </div>
      
      <div style={footerStyle}>
        {isLowStock ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', fontSize: '0.8rem', fontWeight: '600' }}>
            <AlertTriangle size={14} />
            <span>Low Stock</span>
          </div>
        ) : <div />}
        
        <button 
          className="btn-ghost" 
          onClick={() => onManage(product)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
        >
          <span>Manage</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .product-card-hover:hover {
          transform: translateY(-5px);
          border-color: var(--primary) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
      `}} />
    </div>
  );
};

export default ProductCard;
