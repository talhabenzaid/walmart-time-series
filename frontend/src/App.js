import { TimeSeriesChart } from './TimeSeriesChart';
import { DataTables } from './DataTables';
import { useState, useEffect } from 'react';

const API = "http://localhost:8000";

function App() {
  const [stores, setStores] = useState([]);
  const [depts, setDepts] = useState([]);
  const [store, setStore] = useState(1);
  const [dept, setDept] = useState(1);

  useEffect(() => {
    fetch(`${API}/stores`).then(r => r.json()).then(d => {
      setStores(d.stores);
      setStore(d.stores[0]);
    });
    fetch(`${API}/depts`).then(r => r.json()).then(d => {
      setDepts(d.depts);
      setDept(d.depts[0]);
    });
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', 
      color: '#fff', 
      padding: '3rem 2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          marginBottom: '3rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            Walmart Sales Dashboard
          </h1>
          <p style={{ color: '#999', fontSize: '1.1rem' }}>AI-Powered Sales Forecasting & Analysis</p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.9rem',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Store Location
            </label>
            <select 
              value={store} 
              onChange={e => setStore(Number(e.target.value))} 
              style={{ 
                width: '100%',
                background: 'rgba(255,255,255,0.05)', 
                border: '2px solid rgba(59,130,246,0.3)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {stores.map(s => <option key={s} value={s} style={{ background: '#1a1a2e' }}>Store {s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.9rem',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Department
            </label>
            <select 
              value={dept} 
              onChange={e => setDept(Number(e.target.value))} 
              style={{ 
                width: '100%',
                background: 'rgba(255,255,255,0.05)', 
                border: '2px solid rgba(16,185,129,0.3)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {depts.map(d => <option key={d} value={d} style={{ background: '#1a1a2e' }}>Department {d}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <TimeSeriesChart store={store} dept={dept} />
        </div>
        
        <DataTables />
      </div>
    </div>
  );
}

export default App;