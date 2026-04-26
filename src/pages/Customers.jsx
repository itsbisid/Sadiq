import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Plus, Search, Phone, MapPin, DollarSign, UserPlus, X } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', balance: 0 });
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      const allCustomers = await db.customers.toArray();
      setCustomers(allCustomers);
    };
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const id = await db.customers.add(newCustomer);
    setCustomers([...customers, { ...newCustomer, id }]);
    setNewCustomer({ name: '', phone: '', address: '', balance: 0 });
    setIsAdding(false);
  };

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    // Fetch sales and potential future payment logs
    const sales = await db.sales.where('customer_id').equals(customer.id).toArray();
    setHistory(sales.sort((a, b) => b.created_at - a.created_at));
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (paymentAmount <= 0 || !selectedCustomer) return;

    const newBalance = (selectedCustomer.balance || 0) + parseFloat(paymentAmount);
    await db.customers.update(selectedCustomer.id, { balance: newBalance });
    
    // Update local state
    setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, balance: newBalance } : c));
    setSelectedCustomer({ ...selectedCustomer, balance: newBalance });
    setPaymentAmount(0);
    alert('Payment recorded successfully!');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h2>Customer Directory</h2>
          <p className="text-muted">{customers.length} Registered clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <UserPlus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-input glass-card">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isAdding && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>New Customer</h3>
          <form onSubmit={handleAddCustomer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <input 
              className="glass-card" style={{ padding: '0.75rem', border: '1px solid var(--border)' }}
              placeholder="Name" 
              required
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
            />
            <input 
              className="glass-card" style={{ padding: '0.75rem', border: '1px solid var(--border)' }}
              placeholder="Phone" 
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
            <input 
              className="glass-card" style={{ padding: '0.75rem', border: '1px solid var(--border)', gridColumn: 'span 2' }}
              placeholder="Address" 
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
            />
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Customer</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cols-auto">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="glass-card customer-card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleSelectCustomer(customer)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{customer.name}</h3>
                <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Phone size={14} /> <span>{customer.phone || 'No phone'}</span>
                </div>
              </div>
              <div className={`debt-badge ${customer.balance < 0 ? 'has-debt' : ''}`}>
                <DollarSign size={14} />
                <span>GH₵ {Math.abs(customer.balance || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCustomer && (
        <div className="customer-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="glass-card customer-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCustomer.name}'s Statement</h2>
              <button className="btn-ghost" onClick={() => setSelectedCustomer(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
              <div className="payment-section">
                <h3>Record Payment</h3>
                <form onSubmit={handleRecordPayment} style={{ marginTop: '1rem' }}>
                  <div className="input-group">
                    <label>Amount (GH₵)</label>
                    <input 
                      type="number" step="0.01" className="glass-card" 
                      style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                      value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Confirm Payment
                  </button>
                </form>
              </div>

              <div className="history-section">
                <h3>Recent Transactions</h3>
                <div className="mini-history" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {history.map(sale => (
                    <div key={sale.id} className="history-item" style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>Sale #{sale.id}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(sale.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontWeight: '700' }}>GH₵ {sale.total_amount.toFixed(2)}</div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-muted">No transactions found</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
