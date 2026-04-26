import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { pushSaleToSupabase } from '../lib/sync';
import { ShoppingCart, Plus, Minus, Search, User, CreditCard, CheckCircle, Scan, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './Sales.css';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const p = await db.products.toArray();
      const c = await db.customers.toArray();
      setProducts(p);
      setCustomers(c);
      if (c.length > 0) setSelectedCustomer(c[0]);
    };
    loadData();
  }, []);

  const addToCart = (product, unitType) => {
    const existing = cart.find(item => item.id === product.id && item.unitType === unitType);
    if (existing) {
      setCart(cart.map(item => 
        (item.id === product.id && item.unitType === unitType) 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        unitType, 
        quantity: 1, 
        price: unitType === 'crate' ? product.selling_price_crate : product.selling_price_bottle 
      }]);
    }
  };

  const removeFromCart = (id, unitType) => {
    const existing = cart.find(item => item.id === id && item.unitType === unitType);
    if (existing.quantity === 1) {
      setCart(cart.filter(item => !(item.id === id && item.unitType === unitType)));
    } else {
      setCart(cart.map(item => 
        (item.id === id && item.unitType === unitType) 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      // 1. Create Sale Record
      const saleId = await db.sales.add({
        customer_id: selectedCustomer.id,
        total_amount: cartTotal,
        amount_paid: cartTotal, // Assume full payment for now
        payment_status: 'paid',
        created_at: new Date()
      });

      // 2. Add Sale Items and Update Stock
      for (const item of cart) {
        await db.sale_items.add({
          sale_id: saleId,
          product_id: item.id,
          unit_type: item.unitType,
          quantity: item.quantity,
          unit_price: item.price
        });

        const totalBottles = item.unitType === 'crate' 
          ? item.quantity * item.units_per_crate 
          : item.quantity;

        await db.products.update(item.id, {
          current_stock_bottles: item.current_stock_bottles - totalBottles
        });
      }

      // 3. Push to Supabase (Async/Background)
      const saleRecord = {
        customer_id: selectedCustomer.id,
        total_amount: cartTotal,
        amount_paid: cartTotal,
        payment_status: 'paid'
      };
      
      const saleItems = cart.map(item => ({
        product_id: item.id,
        unit_type: item.unitType,
        quantity: item.quantity,
        unit_price: item.price
      }));

      pushSaleToSupabase(saleRecord, saleItems);

      setShowSuccess(true);
      setCart([]);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Checkout failed!');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        const product = products.find(p => p.sku === decodedText);
        if (product) {
          addToCart(product, 'bottle');
          setIsScanning(false);
          scanner.clear();
        }
      }, (error) => {
        // console.warn(error);
      });
      return () => scanner.clear();
    }
  }, [isScanning, products]);

  return (
    <div className="sales-page">
      <div className="page-header">
        <h2>Sales Terminal</h2>
        {selectedCustomer && (
          <div className="customer-badge glass-card">
            <User size={16} />
            <span>{selectedCustomer.name}</span>
          </div>
        )}
      </div>

      <div className="sales-layout">
        <div className="products-selection">
          <div className="search-input glass-card" style={{ marginBottom: '1.5rem' }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-ghost" onClick={() => setIsScanning(true)}>
              <Scan size={18} />
            </button>
          </div>

          {isScanning && (
            <div className="glass-card animate-fade-in" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <div id="reader" style={{ width: '100%' }}></div>
              <button 
                className="btn-ghost" 
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                onClick={() => setIsScanning(false)}
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="products-grid">
            {filteredProducts.map(p => (
              <div key={p.id} className="glass-card product-item-mini">
                <div className="p-info">
                  <h4>{p.name}</h4>
                  <span className="stock-info">{Math.floor(p.current_stock_bottles / p.units_per_crate)} Crates left</span>
                </div>
                <div className="p-actions">
                  <button className="btn-small" onClick={() => addToCart(p, 'crate')}>+ Crate</button>
                  <button className="btn-small" onClick={() => addToCart(p, 'bottle')}>+ Bottle</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-panel glass-card">
          <div className="cart-header">
            <h3>Current Order</h3>
            <ShoppingCart size={20} />
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p className="text-muted">No items in cart</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={`${item.id}-${item.unitType}`} className="cart-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-unit">{item.unitType}</span>
                  </div>
                  <div className="item-qty">
                    <button onClick={() => removeFromCart(item.id, item.unitType)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => addToCart(item, item.unitType)}><Plus size={14} /></button>
                  </div>
                  <div className="item-price">
                    GH₵ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-row">
              <span>Total</span>
              <span className="total-amount">GH₵ {cartTotal.toFixed(2)}</span>
            </div>
            <button 
              className={`btn btn-primary checkout-btn ${isProcessing ? 'loading' : ''}`}
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
            >
              {showSuccess ? <CheckCircle size={20} /> : <CreditCard size={20} />}
              <span>{showSuccess ? 'Success!' : isProcessing ? 'Processing...' : 'Complete Sale'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
