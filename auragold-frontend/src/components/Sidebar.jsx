import React from 'react';

// Accept timeframe and setTimeframe as props
function Sidebar({ timeframe, setTimeframe }) {
  return (
    <div className="sidebar">
      <h2>AuraGold</h2>
      <nav>
        <ul>
          <li>Dashboard</li>
          <li>Market News</li>
          <li>Analysis</li>
          <li>Settings</li>
        </ul>
      </nav>
      
      {/* Prediction Controls Section */}
      <div className="sidebar-controls">
        <h4>Prediction Controls</h4>
        <label htmlFor="timeframe">Forecast Horizon: <strong>{timeframe} Days</strong></label>
        <input
          type="range"
          id="timeframe"
          min="7"
          max="30"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="slider"
        />
      </div>
    </div>
  );
}

export default Sidebar;