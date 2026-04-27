import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import StatCard from '../components/StatCard';
import { ShoppingCart, Users, AlertCircle, TrendingUp, Plus, DollarSign, Package, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalDebt: 0,
    lowStockCount: 0,
    activeCustomers: 0,
    transactionCount: 0,
    netProfit: 0,
    stockHealthPercentage: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Fetch Products for Stock Health
      const products = await db.products.toArray();
      const lowStockCount = products.filter(p => p.current_stock_bottles <= p.low_stock_threshold).length;
      const totalProducts = products.length;
      const healthyProducts = products.filter(p => p.current_stock_bottles > p.low_stock_threshold).length;
      const stockHealthPercentage = totalProducts > 0 ? Math.round((healthyProducts / totalProducts) * 100) : 0;
      
      // 2. Fetch Customers for Debt
      const customers = await db.customers.toArray();
      const debt = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
      
      // 3. Fetch Sales & Expenses for Today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sales = await db.sales.toArray();
      const todaySales = sales.filter(s => new Date(s.created_at) >= today);
      const todayTotal = todaySales.reduce((acc, s) => acc + s.total_amount, 0);
      
      const expenses = await db.expenses.toArray();
      const todayExpenses = expenses
        .filter(e => new Date(e.created_at) >= today)
        .reduce((acc, e) => acc + parseFloat(e.amount), 0);

      // 4. Calculate Chart Data for last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const daySales = sales
          .filter(s => {
            const sd = new Date(s.created_at);
            sd.setHours(0,0,0,0);
            return sd.getTime() === d.getTime();
          })
          .reduce((acc, s) => acc + s.total_amount, 0);

        const dayExpenses = expenses
          .filter(e => {
            const ed = new Date(e.created_at);
            ed.setHours(0,0,0,0);
            return ed.getTime() === d.getTime();
          })
          .reduce((acc, e) => acc + parseFloat(e.amount), 0);

        days.push({
          name: dayLabel,
          sales: daySales,
          expenses: dayExpenses
        });
      }
      
      setStats({
        todaySales: todayTotal,
        totalDebt: debt,
        lowStockCount: lowStockCount,
        activeCustomers: customers.length,
        transactionCount: todaySales.length,
        netProfit: todayTotal - todayExpenses,
        stockHealthPercentage,
        chartData: days
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layout className="text-primary" size={28} />
            Business Overview
          </h2>
          <p className="text-muted">Welcome back, Sadiq. Here's what's happening today.</p>
        </div>
        <Link to="/sales" className="btn btn-primary shadow-lg" style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}>
          <Plus size={20} />
          <span>New Sale</span>
        </Link>
      </div>

      <div className="grid-cols-auto">
        <StatCard 
          title="Today's Sales" 
          value={`GH₵ ${stats.todaySales.toFixed(2)}`} 
          subtext={`${stats.transactionCount} transactions today`} 
          icon={TrendingUp} 
          color="green" 
        />
        <StatCard 
          title="Customer Debt" 
          value={`GH₵ ${stats.totalDebt.toFixed(2)}`} 
          subtext="Owed by customers" 
          icon={Users} 
          color="orange" 
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStockCount} 
          subtext="Items need reorder" 
          icon={AlertCircle} 
          color="red" 
        />
        <StatCard 
          title="Today's Profit" 
          value={`GH₵ ${stats.netProfit.toFixed(2)}`} 
          subtext="After today's expenses" 
          icon={DollarSign} 
          color="blue" 
        />
      </div>

      <div className="dashboard-charts" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        {/* REVENUE VS EXPENSES */}
        <div className="glass-card" style={{ padding: '1.5rem', minHeight: '380px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Revenue vs Expenses</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                <span className="text-muted">Sales</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }} />
                <span className="text-muted">Expenses</span>
              </div>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" stroke="var(--danger)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STOCK HEALTH */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Package className="text-primary" size={20} />
            <h3>Stock Health</h3>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.5rem' }}>
            <div className="health-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span className="text-muted" style={{ fontWeight: '500' }}>Overall Availability</span>
                <span className="text-primary font-bold" style={{ fontSize: '1.1rem' }}>{stats.stockHealthPercentage}%</span>
              </div>
              <div style={{ height: '12px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div 
                  className="animate-width"
                  style={{ width: `${stats.stockHealthPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #818cf8)', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
              </div>
            </div>
            
            <div className="health-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span className="text-muted" style={{ fontWeight: '500' }}>Low Stock Intensity</span>
                <span className="text-warning font-bold" style={{ fontSize: '1.1rem' }}>{stats.lowStockCount} items</span>
              </div>
              <div style={{ height: '12px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div 
                  className="animate-width"
                  style={{ width: `${stats.lowStockCount > 0 ? Math.min(100, (stats.lowStockCount / Math.max(1, stats.activeCustomers) * 100)) : 0}%`, height: '100%', background: 'var(--warning)', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
              </div>
            </div>
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1.25rem', 
              background: 'rgba(99, 102, 241, 0.05)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} className="text-primary" style={{ marginTop: '0.1rem' }} />
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {stats.lowStockCount > 0 
                  ? `Critical: ${stats.lowStockCount} items have reached their reorder point. replenishment is recommended to avoid stockouts.` 
                  : "Excellent! All inventory levels are currently above thresholds. No immediate action needed."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS GRID */}
      <div className="dashboard-sections" style={{ marginTop: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Command Center</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <Link to="/sales" className="quick-action-card glass-card group">
              <div className="action-icon-bg"><ShoppingCart size={24} /></div>
              <div className="action-text">
                <span className="action-title">Sales Portal</span>
                <span className="action-desc">Record a new transaction</span>
              </div>
            </Link>
            <Link to="/products" className="quick-action-card glass-card group">
              <div className="action-icon-bg"><Plus size={24} /></div>
              <div className="action-text">
                <span className="action-title">Inventory</span>
                <span className="action-desc">Add or adjust stock levels</span>
              </div>
            </Link>
            <Link to="/customers" className="quick-action-card glass-card group">
              <div className="action-icon-bg"><Users size={24} /></div>
              <div className="action-text">
                <span className="action-title">Client CRM</span>
                <span className="action-desc">Manage customer accounts</span>
              </div>
            </Link>
            <Link to="/expenses" className="quick-action-card glass-card group">
              <div className="action-icon-bg"><DollarSign size={24} /></div>
              <div className="action-text">
                <span className="action-title">Finance</span>
                <span className="action-desc">Track business expenses</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border: 1px solid var(--border);
        }
        .quick-action-card:hover {
          transform: translateY(-5px);
          background: rgba(99, 102, 241, 0.08);
          border-color: var(--primary);
        }
        .action-icon-bg {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          transition: all 0.3s ease;
        }
        .quick-action-card:hover .action-icon-bg {
          background: var(--primary);
          color: white;
        }
        .action-text {
          display: flex;
          flex-direction: column;
        }
        .action-title {
          font-weight: 700;
          font-size: 1rem;
        }
        .action-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .animate-width {
          animation: slideWidth 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes slideWidth {
          from { width: 0; }
        }
      `}} />
    </div>
  );
};

export default Dashboard;
