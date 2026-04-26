import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { generateReceipt } from '../lib/receiptGenerator';
import { Search, FileText, Download, Calendar, User } from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const allSales = await db.sales.orderBy('created_at').reverse().toArray();
      // Join with customer names
      const customers = await db.customers.toArray();
      const customerMap = customers.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
      
      const salesWithCustomers = allSales.map(s => ({
        ...s,
        customerName: customerMap[s.customer_id] || 'Unknown'
      }));
      
      setSales(salesWithCustomers);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const handlePrintReceipt = async (sale) => {
    const items = await db.sale_items.where('sale_id').equals(sale.id).toArray();
    const products = await db.products.toArray();
    const productMap = products.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
    
    const itemsWithNames = items.map(i => ({
      ...i,
      product_name: productMap[i.product_id]
    }));

    const customer = await db.customers.get(sale.customer_id);
    generateReceipt(sale, itemsWithNames, customer);
  };

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toString().includes(searchTerm)
  );

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h2>Sales History</h2>
          <p className="text-muted">{sales.length} transactions recorded</p>
        </div>
      </div>

      <div className="search-filter-bar">
        <div className="search-input glass-card">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by customer or receipt #..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>#{sale.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} className="text-muted" />
                    {new Date(sale.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} className="text-muted" />
                    {sale.customerName}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '700' }}>GH₵ {sale.total_amount.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${sale.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {sale.payment_status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn-ghost" onClick={() => handlePrintReceipt(sale)} title="Download Receipt">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSales.length === 0 && !isLoading && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p className="text-muted">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
