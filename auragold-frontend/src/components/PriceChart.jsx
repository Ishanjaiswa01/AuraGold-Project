import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function PriceChart({ chartData }) {
  const predictionPoint = chartData.labels.length - 3; // The last 3 points are predictions

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Historical Price',
        data: chartData.prices.slice(0, predictionPoint + 1), // Includes the connection point
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Predicted Price',
        data: [...Array(predictionPoint).fill(null), ...chartData.prices.slice(predictionPoint)], // Fills the start with nulls
        borderColor: '#4FACFE',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: '#8B949E' }, grid: { display: false } },
      y: { ticks: { color: '#8B949E' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
  };

  return <Line options={options} data={data} />;
}

export default PriceChart;