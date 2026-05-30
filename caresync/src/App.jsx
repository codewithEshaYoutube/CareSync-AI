import { useState, useEffect, useRef } from 'react';

// --- 1. STYLES (Enhanced for Technical Dashboard) ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  :root {
    --bg-dark: #030712;
    --bg-panel: rgba(17, 24, 39, 0.7);
    --bg-panel-solid: #111827;
    
    --primary: #3b82f6;
    --primary-glow: rgba(59, 130, 246, 0.4);
    --accent: #8b5cf6;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    --text-main: #f9fafb;
    --text-muted: #9ca3af;
    
    --border: rgba(255, 255, 255, 0.08);
    --radius: 12px;
    
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--bg-dark); color: var(--text-main); font-family: var(--font-main); }

  /* Tech Background Grid */
  body {
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 30px 30px;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

  @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }

  #app-root { display: flex; height: 100vh; width: 100vw; flex-direction: column; }
  
  .sidebar {
    width: 260px;
    background: rgba(10, 10, 15, 0.95);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 1.5rem;
    z-index: 20;
  }

  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .topbar { height: 60px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; background: rgba(3, 7, 18, 0.8); backdrop-filter: blur(10px); }

  .dashboard-grid {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-auto-rows: min-content;
    gap: 1.5rem;
    height: 100%; overflow-y: auto;
    padding-bottom: 80px; /* Space for mobile nav if needed */
  }

  /* Cards */
  .panel {
    background: var(--bg-panel); 
    border: 1px solid var(--border); 
    border-radius: var(--radius);
    padding: 1.25rem; 
    display: flex; flex-direction: column; 
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .map-card { grid-column: 1 / -1; min-height: 400px; }
  .analysis-card { grid-column: 1 / -1; }

  /* Status Badges */
  .badge { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px; }
  .badge.critical { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
  .badge.mild { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge.normal { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
  
  .dot { width: 6px; height: 6px; border-radius: 50%; }
  .dot.critical { background: var(--danger); animation: pulse-red 2s infinite; }

  /* Resource Grid */
  .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-top: 10px; }
  .resource-item { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid var(--border); text-align: center; transition: 0.2s; }
  .resource-item:hover { background: rgba(255,255,255,0.06); border-color: var(--primary); }
  .res-icon { font-size: 1.2rem; margin-bottom: 5px; color: var(--text-muted); }
  .res-val { font-weight: 700; font-size: 1.1rem; }
  .res-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }

  /* Forecast Chart Container */
  .forecast-chart { height: 200px; width: 100%; position: relative; margin-top: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.3s; padding: 20px; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg-panel-solid); border: 1px solid var(--border); width: 100%; max-width: 800px; max-height: 90vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); transition: 0.3s; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  .modal-overlay.open .modal { transform: scale(1); }
  .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
  .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
  .modal-footer { padding: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: rgba(255,255,255,0.02); }

  /* Chat */
  .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); z-index: 50; cursor: pointer; transition: transform 0.2s; }
  .ai-fab:hover { transform: scale(1.1); }
  .ai-panel { position: fixed; bottom: 100px; right: 30px; width: 400px; height: 600px; background: var(--bg-panel-solid); border: 1px solid var(--border); border-radius: 16px; display: flex; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 50; }
  .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; font-size: 0.9rem; white-space: pre-wrap; }
  .msg.ai { background: rgba(255,255,255,0.1); color: var(--text-main); align-self: flex-start; border-bottom-left-radius: 2px; }
  .msg.user { background: var(--primary); color: white; align-self: flex-end; border-bottom-right-radius: 2px; }

  /* Landing */
  #landing-page { position: absolute; inset: 0; background: radial-gradient(circle at center, #1e293b 0%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; transition: opacity 0.8s; }
  .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--primary); box-shadow: 0 0 20px var(--primary); animation: scan 3s linear infinite; opacity: 0.3; }
  
  /* Buttons */
  .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
  .btn:hover { background: #2563eb; transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text-muted); }
  .btn-ghost:hover { color: white; }
`;

// --- 2. MOCK DATA: CALIFORNIA HOSPITALS & FORECASTING ---
const DEMO_HOSPITALS = [
  {
    id: 'ca-cedars', name: 'Cedars-Sinai Medical', region: 'Los Angeles', 
    position: { x: 0.3, y: 0.6 }, status: 'warning',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 45, total: 50, unit: 'units', threshold: 10, type: 'bed' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 120, total: 200, unit: 'tanks', threshold: 50, type: 'gas' },
      { id: 'r3', name: 'Ventilators', current: 8, total: 30, unit: 'machines', threshold: 5, type: 'machine' },
      { id: 'r4', name: 'Pacemakers', current: 15, total: 20, unit: 'units', threshold: 5, type: 'device' }
    ],
    forecast: { 
      trend: 'increasing', 
      nextMonthDemand: { 'Oxygen Cylinders': 250, 'Pacemakers': 5 },
      projectedDeficit: { 'Oxygen Cylinders': 130 } // Current 120 vs Demand 250
    }
  },
  {
    id: 'ca-ucsf', name: 'UCSF Medical Center', region: 'San Francisco', 
    position: { x: 0.15, y: 0.35 }, status: 'critical',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 5, total: 60, unit: 'units', threshold: 10, type: 'bed' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 80, total: 150, unit: 'tanks', threshold: 40, type: 'gas' },
      { id: 'r3', name: 'BP Monitors', current: 12, total: 100, unit: 'machines', threshold: 20, type: 'machine' },
      { id: 'r4', name: 'Dialysis Machines', current: 2, total: 15, unit: 'machines', threshold: 5, type: 'machine' }
    ],
    forecast: {
      trend: 'surge',
      nextMonthDemand: { 'ICU Beds': 80, 'Dialysis Machines': 10 },
      projectedDeficit: { 'ICU Beds': 75 } // Critical Deficit
    }
  },
  {
    id: 'ca-stanford', name: 'Stanford Hospital', region: 'Palo Alto', 
    position: { x: 0.25, y: 0.4 }, status: 'stable',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 55, total: 60, unit: 'units', threshold: 10, type: 'bed' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 300, total: 300, unit: 'tanks', threshold: 50, type: 'gas' },
      { id: 'r3', name: 'MRI Machines', current: 3, total: 3, unit: 'machines', threshold: 1, type: 'machine' }
    ],
    forecast: {
      trend: 'stable',
      nextMonthDemand: {},
      projectedDeficit: {}
    }
  }
];

// --- 3. COMPONENTS ---

const ForecastCanvas = ({ forecastData }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const w = canvasRef.width = canvasRef.parentElement.clientWidth;
    const h = canvasRef.height = canvasRef.parentElement.clientHeight;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(30, h-30); ctx.lineTo(w, h-30); ctx.stroke(); // X axis
    ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(30, h-30); ctx.stroke(); // Y axis
    
    // Simulated Data for Demo: Supply (Blue) vs Demand (Red dashed)
    const drawLine = (dataPoints, color, dashed = false) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if(dashed) ctx.setLineDash([5, 5]);
      dataPoints.forEach((val, i) => {
        const x = 30 + (i * (w - 40) / (dataPoints.length - 1));
        const y = (h - 30) - (val / 400) * (h - 30); // Scale 0-400
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    // Mocking 30 days trend
    const supplyTrend = Array.from({length: 10}, (_, i) => forecastData.current + (Math.random()*20 - 10));
    const demandTrend = Array.from({length: 10}, (_, i) => forecastData.current * 0.8 + (i * 15) + (Math.random()*10));
    
    drawLine(supplyTrend, '#3b82f6');
    drawLine(demandTrend, '#ef4444', true);
    
    // Legend
    ctx.font = '10px Inter';
    ctx.fillStyle = '#3b82f6'; ctx.fillText('Current Supply', 40, 20);
    ctx.fillStyle = '#ef4444'; ctx.fillText('Projected Demand', 120, 20);
    
  }, [forecastData]);
  
  return <canvas ref={canvasRef} className="forecast-chart" />;
};

const ResourceCard = ({ item }) => {
  // Determine Criticality
  const isCritical = item.current < item.threshold;
  const isMild = item.current < item.threshold * 2;
  
  let statusClass = 'normal';
  if (isCritical) statusClass = 'critical';
  else if (isMild) statusClass = 'mild';

  const getIcon = (type) => {
    if (type === 'bed') return 'fa-bed-pulse';
    if (type === 'gas') return 'fa-wind';
    if (type === 'device') return 'fa-heart-pulse';
    return 'fa-microchip'; // machine
  };

  return (
    <div className="resource-item">
      <div className="res-icon">
        <i className={`fa-solid ${getIcon(item.type)}`} style={{color: isCritical ? 'var(--danger)' : 'var(--primary)'}}></i>
      </div>
      <div className="res-val">{item.current}<span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>/{item.total}</span></div>
      <div className="res-label">{item.name}</div>
      <span className={`badge ${statusClass}`} style={{marginTop: '8px', fontSize: '0.6rem'}}>
        {statusClass}
      </span>
    </div>
  );
};

const HospitalModal = ({ hospital, onClose, onProcure }) => {
  const [activeTab, setActiveTab] = useState('inventory');

  if (!hospital) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="font-bold text-xl">{hospital.name}</h2>
            <p className="text-sm text-muted">{hospital.region} • ID: {hospital.id.toUpperCase()}</p>
          </div>
          <button className="btn-ghost" onClick={onClose}><i className="fa-solid fa-xmark fa-lg"></i></button>
        </div>
        
        <div className="flex border-b border-white/10 px-6">
          <button 
            className={`py-3 px-4 text-sm font-medium ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('inventory')}
          >Live Inventory</button>
          <button 
            className={`py-3 px-4 text-sm font-medium ${activeTab === 'forecast' ? 'text-primary border-b-2 border-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('forecast')}
          >AI Forecasting</button>
        </div>

        <div className="modal-body">
          {activeTab === 'inventory' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Operational Assets</h3>
                <span className={`badge ${hospital.status}`}>
                  <div className={`dot ${hospital.status}`}></div> {hospital.status}
                </span>
              </div>
              <div className="resource-grid">
                {hospital.inventory.map((item, i) => <ResourceCard key={i} item={item} />)}
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg mb-4">
                <h4 className="text-primary font-bold mb-1"><i className="fa-solid fa-brain mr-2"></i>AI Predictive Analysis</h4>
                <p className="text-xs text-muted">Based on 30-day consumption trends and regional flu outbreak data.</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-sm mb-2">Projected Deficit (Next 30 Days)</h4>
                {Object.keys(hospital.forecast.projectedDeficit).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(hospital.forecast.projectedDeficit).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded">
                        <span className="font-medium text-sm">{key}</span>
                        <span className="text-danger font-bold">-{val} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No significant deficits projected.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2">Trend Visualization</h4>
                <ForecastCanvas forecastData={{ current: hospital.inventory[0].current }} />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={() => onProcure(hospital)}>
            <i className="fa-solid fa-cart-plus"></i> Initiate Procurement
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ isOpen, onClose, onSend, messages, isLoading }) => {
  const [input, setInput] = useState('');
  
  const submit = (e) => {
    e.preventDefault();
    if(!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <>
      <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
        <div className="modal-header" style={{padding: '1rem'}}>
          <span className="font-bold text-primary"><i className="fa-solid fa-robot mr-2"></i>CareSync AI Agent</span>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-chevron-down"></i></button>
        </div>
        <div className="modal-body flex flex-col">
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
            ))}
            {isLoading && <div className="msg ai"><i className="fa-solid fa-circle-notch fa-spin"></i></div>}
          </div>
        </div>
        <div className="modal-footer">
          <form onSubmit={submit} className="flex gap-2 w-full">
            <input className="w-full bg-black/30 border border-white/10 text-white px-3 py-2 rounded text-sm" placeholder="Ask about inventory..." value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit" className="btn px-3"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      <div className="ai-fab" onClick={() => onClose()}><i className="fa-solid fa-robot"></i></div>
    </>
  );
};

// --- 4. MAIN APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  
  // State
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [procurementTarget, setProcurementTarget] = useState(null);
  
  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{role: 'assistant', content: 'Hello. I am connected to the California hospital network. I can analyze inventory trends and predict machinery needs.'}]);
  const [chatLoading, setChatLoading] = useState(false);

  // Initialize Styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = styles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Load Data (Demo Mode)
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setHospitals(DEMO_HOSPITALS);
      setLoading(false);
      setView('dashboard');
    }, 1500);
  };

  // Agentic AI Logic (Simulated for Demo)
  const handleChat = async (text) => {
    setMessages(p => [...p, {role: 'user', content: text}]);
    setChatLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    let response = "";
    const lowerText = text.toLowerCase();

    // Context Awareness Logic
    if (lowerText.includes('pacemaker')) {
      const stanford = hospitals.find(h => h.id === 'ca-stanford');
      if (stanford) {
        const pacs = stanford.inventory.find(i => i.name === 'Pacemakers');
        response = `Stanford Hospital currently has ${pacs.current}/${pacs.total} Pacemakers. Status: ${pacs.current < pacs.threshold ? 'CRITICAL' : 'NORMAL'}. Demand is stable.`;
      } else {
        response = "I couldn't find specific Pacemaker data in the current dataset.";
      }
    } else if (lowerText.includes('oxygen') || lowerText.includes('cedars')) {
      const cedars = hospitals.find(h => h.id === 'ca-cedars');
      const oxy = cedars.inventory.find(i => i.name === 'Oxygen Cylinders');
      response = `Cedars-Sinai Oxygen levels are at ${oxy.current} tanks. AI Forecast predicts a deficit of ${cedars.forecast.projectedDeficit['Oxygen Cylinders']} tanks next month based on current consumption. I recommend placing an order now.`;
    } else if (lowerText.includes('ucsf') || lowerText.includes('bed')) {
      const ucsf = hospitals.find(h => h.id === 'ca-ucsf');
      const bed = ucsf.inventory.find(i => i.name === 'ICU Beds');
      response = `UCSF is in CRITICAL condition. ICU Bed capacity is at ${bed.current}/${bed.total}. Projected demand is 80 beds next month. Immediate intervention required.`;
    } else {
      response = "I can provide analysis on Bed Counts, Oxygen Levels, and Machinery (Pacemakers, Ventilators) for Cedars-Sinai, UCSF, and Stanford. Please specify a resource.";
    }

    setMessages(p => [...p, {role: 'assistant', content: response}]);
    setChatLoading(false);
  };

  return (
    <>
      {loading && (
        <div style={{position:'fixed', inset:0, background:'var(--bg-dark)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{width:'50px', height:'50px', border:'3px solid rgba(59,130,246,0.3)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
          <h3 className="mt-4 font-bold text-primary">Loading California Network...</h3>
        </div>
      )}

      {view === 'landing' && (
        <div id="landing-page">
          <div className="scan-line"></div>
          <div style={{textAlign:'center', zIndex:10}}>
            <h1 className="font-bold" style={{fontSize:'3.5rem', marginBottom:'0.5rem', background:'linear-gradient(to right, #fff, #3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
              CareSync <span className="text-primary">Ops</span>
            </h1>
            <p className="text-muted mb-8 text-lg">Autonomous Hospital Operations & Predictive Logistics</p>
            <button className="btn" onClick={loadData} style={{padding:'16px 48px', fontSize:'1.2rem', borderRadius:'12px'}}>
              <i className="fa-solid fa-satellite-dish"></i> Initialize Dashboard
            </button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div id="app-root">
          <aside className="sidebar">
            <div className="mb-8 flex items-center gap-2">
              <i className="fa-solid fa-heart-pulse text-primary fa-lg"></i>
              <span className="font-bold text-xl">CareSync</span>
            </div>
            <nav className="flex flex-col gap-2">
              <div className="p-3 rounded bg-white/5 text-white font-medium flex items-center gap-3 border border-white/10"><i className="fa-solid fa-chart-line text-primary"></i> Dashboard</div>
              <div className="p-3 rounded text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3"><i className="fa-solid fa-hospital"></i> Facilities</div>
              <div className="p-3 rounded text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3"><i className="fa-solid fa-boxes-stacked"></i> Inventory</div>
            </nav>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <h2 className="font-bold">California Operations Center</h2>
              <div className="flex items-center gap-4">
                <span className="text-xs text-primary border border-primary/30 px-2 py-1 rounded">LIVE</span>
                <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-500"></div>
              </div>
            </header>

            <div className="dashboard-grid">
              {/* Summary Stats */}
              {hospitals.map(h => (
                <div key={h.id} className="panel" onClick={() => setSelectedHospital(h)} style={{cursor:'pointer'}}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{h.name}</h3>
                    <span className={`badge ${h.status}`}><div className={`dot ${h.status}`}></div></span>
                  </div>
                  <p className="text-sm text-muted mb-4">{h.region}</p>
                  <div className="text-xs text-primary font-mono">View Analysis &rarr;</div>
                </div>
              ))}

              {/* Detailed Analysis Panel */}
              <div className="panel analysis-card">
                <h3 className="font-bold mb-4 border-b border-white/10 pb-2">Network Forecasting Analysis (Next 30 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hospitals.map(h => (
                    <div key={h.id} className="bg-white/5 p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">{h.name}</span>
                        <i className={`fa-solid fa-arrow-trend-${h.forecast.trend === 'increasing' ? 'up text-warning' : (h.forecast.trend === 'surge' ? 'up text-danger' : 'right text-success')}`}></i>
                      </div>
                      {Object.keys(h.forecast.projectedDeficit).length > 0 ? (
                        <div className="text-danger text-sm">
                          {Object.entries(h.forecast.projectedDeficit).map(([k,v]) => (
                            <div key={k} className="mb-1"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {k}: -{v}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-success text-sm"><i className="fa-solid fa-check mr-1"></i> Stable</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(!chatOpen)} onSend={handleChat} messages={messages} isLoading={chatLoading} />
          {selectedHospital && <HospitalModal hospital={selectedHospital} onClose={() => setSelectedHospital(null)} onProcure={setProcurementTarget} />}
          {procurementTarget && (
            <div className="modal-overlay open" onClick={() => setProcurementTarget(null)}>
              <div className="modal" style={{maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
                <div className="modal-header"><h3 className="font-bold">Procurement Order</h3></div>
                <div className="modal-body">
                  <p className="text-sm text-muted mb-4">Creating order for <strong>{procurementTarget.name}</strong>.</p>
                  <button className="btn w-full justify-center" onClick={() => {alert('Order Request Sent to Supplier API'); setProcurementTarget(null)}}>Confirm Request</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}