import { Package, AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../lib/db';
import './ProductCard.css';

const ProductCard = ({ product, onDelete }) => {
  const isLowStock = product.current_stock_bottles <= product.low_stock_threshold;
  
  const displayCrates = Math.floor(product.current_stock_bottles / product.units_per_crate);
  const displayBottles = product.current_stock_bottles % product.units_per_crate;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      await db.products.delete(product.id);
      if (onDelete) onDelete();
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
        <button className="delete-btn" onClick={handleDelete} title="Delete Product">
          <Trash2 size={18} />
        </button>
      </div>
      
      {/* ... rest of the card ... */}
      
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
        <button className="btn-ghost">
          <span>Manage</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
