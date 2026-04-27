import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  // Use inline styles to ensure layout works perfectly in production bundles
  const cardStyle = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const contentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  };

  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  };

  const valueStyle = {
    fontSize: '1.8rem',
    fontWeight: 800,
    margin: '0.1rem 0',
    letterSpacing: '-0.025em',
    color: 'var(--text-main)'
  };

  const subtextStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  };

  const iconWrapperStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  // Color mapping for inline backgrounds
  const colorMap = {
    blue: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' },
    green: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    orange: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    red: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' }
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card" style={cardStyle}>
      <div style={contentStyle}>
        <div style={textContainerStyle}>
          <span style={titleStyle}>{title}</span>
          <h2 style={valueStyle}>{value}</h2>
          <span style={subtextStyle}>{subtext}</span>
        </div>
        <div style={{ ...iconWrapperStyle, background: activeColor.bg, color: activeColor.text }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
