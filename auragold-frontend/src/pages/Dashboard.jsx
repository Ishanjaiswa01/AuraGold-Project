import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricCard from '../components/MetricCard';
import PriceChart from '../components/PriceChart';
import NewsFeed from '../components/NewsFeed';

// Accept timeframe as a prop
function Dashboard({ timeframe }) {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    const fetchMetrics = axios.get('http://localhost:3001/api/metrics');
    // Add the timeframe to the chart data API call
    const fetchChartData = axios.get(`http://localhost:3001/api/chartdata?days=${timeframe}`);
    const fetchNewsData = axios.get('http://localhost:3001/api/news');

    Promise.all([fetchMetrics, fetchChartData, fetchNewsData])
      .then(([metricsRes, chartRes, newsRes]) => {
        setMetrics(metricsRes.data);
        setChartData(chartRes.data);
        setNewsData(newsRes.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, [timeframe]); // Add timeframe to the dependency array

  // ... (the rest of the component remains the same)
  if (!metrics || !chartData || !newsData) {
    return <div>Loading dashboard...</div>;
  }
  // ... (return statement with JSX remains the same)
  return (
    <div className="dashboard">
      <div className="metrics-grid">
        <MetricCard title="Current Price" value={`$${metrics.currentPrice.value.toFixed(2)}`} change={metrics.currentPrice.change} />
        <MetricCard title="24-Hour Forecast" value={`$${metrics.forecast.value.toFixed(2)}`} change={metrics.forecast.change} />
        <MetricCard title="Model Accuracy" value={metrics.accuracy.value} change={metrics.accuracy.change} />
        <MetricCard title="Market Sentiment" value={metrics.sentiment.value} change={metrics.sentiment.change} />
      </div>
      <div className="chart-container">
        <h3>Gold Price (XAU/USD) Forecast</h3>
        <PriceChart chartData={chartData} />
      </div>
      <NewsFeed newsData={newsData} />
    </div>
  );
}

export default Dashboard;