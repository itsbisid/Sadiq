import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import StatCard from '../components/StatCard';
import { ShoppingCart, Users, AlertCircle, TrendingUp, Plus, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalDebt: 0,
    lowStockCount: 0,
    activeCustomers: 0,
    netProfit: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      const products = await db.products.toArray();
      const lowStock = products.filter(p => p.current_stock_bottles <= p.low_stock_threshold).length;
      
      const customers = await db.customers.toArray();
      const debt = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
      
      // Calculate Today's Sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sales = await db.sales
        .where('created_at')
        .above(today)
        .toArray();
      
      const todayTotal = sales.reduce((acc, s) => acc + s.total_amount, 0);
      
      const expenses = await db.expenses.toArray();
      const todayExpenses = expenses
        .filter(e => new Date(e.created_at).setHours(0,0,0,0) === today.getTime())
        .reduce((acc, e) => acc + parseFloat(e.amount), 0);

      // Simple chart data for last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      const chartData = last7Days.map(day => ({
        name: day,
        sales: Math.floor(Math.random() * 5000) + 1000, // Mock data for now
        expenses: Math.floor(Math.random() * 1000) + 200
      }));
      
      setStats({
        todaySales: todayTotal,
        totalDebt: debt,
        lowStockCount: lowStock,
        activeCustomers: customers.length,
        transactionCount: sales.length,
        netProfit: todayTotal - todayExpenses,
        chartData
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Business Overview</h2>
          <p className="text-muted">Welcome back, Sadiq.</p>
        </div>
        <Link to="/sales" className="btn btn-primary">
          <Plus size={20} />
          <span>New Sale</span>
        </Link>
      </div>

      <div className="grid-cols-auto">
        <StatCard 
          title="Today's Sales" 
          value={`GH₵ ${stats.todaySales.toFixed(2)}`} 
          subtext={`${stats.transactionCount || 0} transactions today`} 
          icon={TrendingUp} 
          color="green" 
        />
        <StatCard 
          title="Customer Debt" 
          value={`GH₵ ${stats.totalDebt}`} 
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

      <div className="dashboard-charts" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', height: '350px' }}>
          <h3>Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Area type="monotone" dataKey="sales" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fill="transparent" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Stock Health</h3>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="health-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>In Stock</span>
                <span className="text-primary">85%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
            <div className="health-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Low Stock</span>
                <span className="text-warning">{stats.lowStockCount} items</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: 'var(--warning)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections" style={{ marginTop: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/sales" className="btn btn-ghost glass-card" style={{ flexDirection: 'column', height: '100px', gap: '0.5rem' }}>
              <ShoppingCart size={24} />
              <span>Record Sale</span>
            </Link>
            <Link to="/products" className="btn btn-ghost glass-card" style={{ flexDirection: 'column', height: '100px', gap: '0.5rem' }}>
              <Plus size={24} />
              <span>Add Stock</span>
            </Link>
            <Link to="/customers" className="btn btn-ghost glass-card" style={{ flexDirection: 'column', height: '100px', gap: '0.5rem' }}>
              <Users size={24} />
              <span>Customers</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
