import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const API = "http://localhost:8000";

export function TimeSeriesChart({ store, dept }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/sales/${store}/${dept}`);
      const result = await res.json();
      
      const chartData = result.dates.map((date, i) => ({
        week: `W${i + 1}`,
        date: date,
        actual: result.actual[i],
        predicted: result.predicted[i]
      }));
      
      setData(chartData);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [store, dept]);

  useEffect(() => {
    if (store && dept) {
      loadData();
    }
  }, [store, dept, loadData]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    try {
      const data = payload[0]?.payload;
      if (!data) return null;
      
      return (
        <div style={{
          background: 'rgba(20,20,30,0.95)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ color: '#999', marginBottom: '8px', fontSize: '0.85rem' }}>{data.date}</p>
          {data.actual !== null && data.actual !== undefined && (
            <p style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '4px' }}>
              Actual Sales: ${data.actual.toLocaleString()}
            </p>
          )}
          {data.predicted !== null && data.predicted !== undefined && (
            <p style={{ color: '#10b981', fontWeight: '600' }}>
              Predicted Sales: ${data.predicted.toLocaleString()}
            </p>
          )}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '3rem',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(59,130,246,0.2)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#999' }}>Loading forecast data...</p>
        </div>
      </div>
    );
  }

  const forecastIndex = Math.floor(data.length * 0.8);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '0.5rem',
        color: '#fff',
        fontWeight: '600'
      }}>
        Time Series Analysis - Actual vs Predicted Sales
      </h3>
      <p style={{ 
        color: '#999', 
        fontSize: '0.95rem', 
        marginBottom: '2rem' 
      }}>
        Weekly sales data showing training period and forecast predictions
      </p>
      
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#3b82f6',
            boxShadow: '0 0 10px rgba(59,130,246,0.5)'
          }}></div>
          <span style={{ fontSize: '0.9rem' }}>Actual Sales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#10b981',
            boxShadow: '0 0 10px rgba(16,185,129,0.5)'
          }}></div>
          <span style={{ fontSize: '0.9rem' }}>Predicted Sales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '2px', 
            background: '#ef4444',
            boxShadow: '0 0 10px rgba(239,68,68,0.5)'
          }}></div>
          <span style={{ fontSize: '0.9rem' }}>Forecast Period</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="week" 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            x={data[forecastIndex]?.week} 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ 
              value: 'Forecast Start', 
              position: 'top',
              fill: '#ef4444',
              fontSize: 12
            }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
            fill="url(#actualGradient)"
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={false}
            fill="url(#predictedGradient)"
            activeDot={{ r: 6, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}