import { useState, useEffect } from 'react';

const API = "http://localhost:8000";

export function DataTables() {
  const [activeTab, setActiveTab] = useState('best');
  const [bestPredictions, setBestPredictions] = useState([]);
  const [worstPredictions, setWorstPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesRes, deptsRes] = await Promise.all([
        fetch(`${API}/stores`),
        fetch(`${API}/depts`)
      ]);
      
      const storesData = await storesRes.json();
      const deptsData = await deptsRes.json();

      const allPredictions = [];
      
      for (let i = 0; i < Math.min(5, storesData.stores.length); i++) {
        for (let j = 0; j < Math.min(3, deptsData.depts.length); j++) {
          const store = storesData.stores[i];
          const dept = deptsData.depts[j];
          
          const res = await fetch(`${API}/sales/${store}/${dept}`);
          const data = await res.json();
          
          if (data.dates && data.dates.length > 0) {
            let lastActualIdx = data.actual.length - 1;
            for (let i = data.actual.length - 1; i >= 0; i--) {
              if (data.actual[i] !== null && data.actual[i] !== undefined) {
                lastActualIdx = i;
                break;
              }
            }
            
            const error = Math.abs(data.actual_full[lastActualIdx] - data.predicted[lastActualIdx]);

            allPredictions.push({
              store,
              dept,
              date: data.dates[lastActualIdx],
              actual: Math.round(data.actual_full[lastActualIdx]),
              predicted: Math.round(data.predicted[lastActualIdx]),
              error: Math.round(error)
            });
          }
        }
      }

      allPredictions.sort((a, b) => a.error - b.error);
      setBestPredictions(allPredictions.slice(0, 10));
      setWorstPredictions(allPredictions.slice(-10).reverse());
      
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'best', label: 'Top 10 Best Predictions'},
    { id: 'worst', label: 'Top 10 Worst Predictions'}
  ];

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(59,130,246,0.2)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#999' }}>Analyzing predictions...</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1.5rem',
          color: '#fff',
          fontWeight: '600'
        }}>
          Detailed Analysis
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#999',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontSize: '0.95rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Store</th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Dept</th>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Date</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Actual</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Predicted</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px 16px', 
                color: '#999',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'best' ? bestPredictions : worstPredictions).map((row, index) => (
              <tr
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <td style={{ 
                  padding: '16px', 
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                  fontWeight: '600'
                }}>{row.store}</td>
                <td style={{ padding: '16px', fontWeight: '600' }}>{row.dept}</td>
                <td style={{ padding: '16px', color: '#999', fontSize: '0.9rem' }}>{row.date}</td>
                <td style={{ 
                  padding: '16px', 
                  textAlign: 'right',
                  color: '#3b82f6',
                  fontWeight: '600'
                }}>${row.actual.toLocaleString()}</td>
                <td style={{ 
                  padding: '16px', 
                  textAlign: 'right',
                  color: '#10b981',
                  fontWeight: '600'
                }}>${row.predicted.toLocaleString()}</td>
                <td style={{ 
                  padding: '16px', 
                  textAlign: 'right',
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px'
                }}>
                  <span style={{
                    color:  '#ef4444',
                    fontWeight: '700',
                    padding: '4px 12px',
                    background: activeTab === 'best' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}>
                    ${row.error.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}