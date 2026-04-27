import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  return (
    <div className="glass-card stat-card">
      <div className="stat-content">
        <div className="stat-text">
          <span className="stat-title">{title}</span>
          <h2 className="stat-value">{value}</h2>
          <span className="stat-subtext">{subtext}</span>
        </div>
        <div className={`stat-icon-wrapper ${color}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
