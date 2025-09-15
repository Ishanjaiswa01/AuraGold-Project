import React from 'react';

function MetricCard({ title, value, change }) {
  return (
    <div className="metric-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{change}</p>
    </div>
  );
}

export default MetricCard;