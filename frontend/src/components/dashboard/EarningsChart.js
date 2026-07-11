import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EarningsChart.css';

const EarningsChart = ({ data }) => {
  const hasData = data && data.some(item => item.earnings > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="earnings-chart__tooltip">
          <p className="earnings-chart__tooltip-label">{payload[0].payload.date}</p>
          <p className="earnings-chart__tooltip-value">
            Rs {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="earnings-chart">
      <div className="earnings-chart__header">
        <h3 className="earnings-chart__title">Earnings Over Time</h3>
        <p className="earnings-chart__subtitle">Last 7 days</p>
      </div>

      {hasData ? (
        <div className="earnings-chart__container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '0.75rem' }}
                tickFormatter={(value) => `Rs ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="earnings-chart__empty">
          <div className="earnings-chart__empty-icon">📊</div>
          <h4 className="earnings-chart__empty-title">No Earnings Yet</h4>
          <p className="earnings-chart__empty-text">
            Start listing items to see your earnings chart
          </p>
        </div>
      )}
    </div>
  );
};

export default EarningsChart;
