import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Plus, Search, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Rent', amount: 0, description: '', created_at: new Date() });

  const categories = ['Rent', 'Electricity', 'Transport', 'Wages', 'Maintenance', 'Other'];

  useEffect(() => {
    const fetchExpenses = async () => {
      const allExpenses = await db.expenses.orderBy('created_at').reverse().toArray();
      setExpenses(allExpenses);
    };
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const id = await db.expenses.add({ ...newExpense, created_at: new Date() });
    setExpenses([{ ...newExpense, id, created_at: new Date() }, ...expenses]);
    setNewExpense({ category: 'Rent', amount: 0, description: '', created_at: new Date() });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await db.expenses.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h2>Expense Tracking</h2>
          <p className="text-muted">Total recorded: GH₵ {totalExpenses.toFixed(2)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          <span>Record Expense</span>
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-input glass-card">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isAdding && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>New Expense</h3>
          <form onSubmit={handleAddExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="input-group">
              <label>Category</label>
              <select 
                className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Amount (GH₵)</label>
              <input 
                type="number" step="0.01" className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <input 
                className="glass-card" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}
                value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Expense</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Description</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{new Date(expense.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge" style={{ background: 'var(--glass-bg)' }}>{expense.category}</span>
                </td>
                <td style={{ padding: '1rem' }}>{expense.description || '-'}</td>
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--danger)' }}>GH₵ {parseFloat(expense.amount).toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn-ghost" onClick={() => handleDelete(expense.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
