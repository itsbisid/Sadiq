import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, DollarSign, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './NavbarLayout.css';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Explicit inline styles to override any production bundle issues
  const navContainerStyle = {
    backgroundColor: '#1e293b',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxSizing: 'border-box'
  };

  const navContentStyle = {
    width: '100%',
    maxWidth: '1300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyle = {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#6366f1',
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
    letterSpacing: '-0.5px'
  };

  const linksContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
    alignItems: 'center',
    margin: '0 2rem'
  };

  return (
    <nav style={navContainerStyle}>
      <div style={navContentStyle}>
        <div className="navbar-logo">
          <h1 style={logoStyle}>Sadiq Drinks</h1>
        </div>
        
        <div style={linksContainerStyle} className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>Sales</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>History</span>
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign size={18} />
            <span>Expenses</span>
          </NavLink>
        </div>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
