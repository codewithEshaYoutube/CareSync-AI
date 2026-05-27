
import React, { useState, useEffect, useRef } from 'react';

// --- STYLES (EMBEDDED CSS) ---
const styles = `
  /* Import a clean system font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

  :root{
    --bg-body: #f5f7fb;
    --bg-panel: #ffffff;
    --panel-elev: rgba(16,24,40,0.04);
    --border-color: #e6edf3;

    --primary: #2563eb;
    --primary-600: #1d4ed8;
    --accent: #7c3aed;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;

    --text-main: #0f172a;
    --text-muted: #5b6b7a;

    --radius: 12px;
    --transition: 240ms ease;
  }

  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    background: linear-gradient(180deg, var(--bg-body) 0%, #f8fbff 100%);
    color:var(--text-main);
    display:flex;overflow:hidden;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  }

  /* Layout */
  .sidebar{
    width:280px;background:var(--bg-panel);border-right:1px solid var(--border-color);
    display:flex;flex-direction:column;padding:1.5rem;gap:1rem;z-index:12;
    box-shadow: 6px 0 18px var(--panel-elev);
  }
  .main-content{flex:1;display:flex;flex-direction:column;overflow:hidden}

  header{
    height:72px;background:transparent;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid var(--border-color);backdrop-filter: blur(4px);
  }

  /* Cards */
  .card{background:var(--bg-panel);border-radius:var(--radius);padding:1.5rem;border:1px solid transparent;box-shadow:0 6px 18px rgba(15,23,42,0.04);transition:all var(--transition)}
  .card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(15,23,42,0.06);border-color:rgba(37,99,235,0.06)}

  .dashboard-container{padding:1.75rem;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));grid-auto-rows:minmax(120px,auto);gap:1.25rem;height:100%}

  .map-section{grid-column:span 2;min-height:420px}
  .chart-section{min-height:260px}
  .logs-section{min-height:200px}

  #intelligenceMap{width:100%;height:100%;border-radius:10px;border:1px solid var(--border-color);background:linear-gradient(180deg,#fbfdff 0%, #f7fbff 100%);position:relative;overflow:hidden}

  /* Nodes */
  .map-node{position:absolute;width:14px;height:14px;border-radius:50%;background:var(--primary);box-shadow:0 6px 18px rgba(37,99,235,0.12);cursor:pointer;transition:transform 180ms}
  .map-node:hover{transform:scale(1.4);z-index:20}
  .map-node.critical{background:var(--danger);box-shadow:0 8px 20px rgba(239,68,68,0.12)}
  .map-label{font-size:11px;padding:4px 8px;background:rgba(255,255,255,0.95);border-radius:8px;border:1px solid var(--border-color);transform:translate(-50%,-150%);white-space:nowrap}

  /* Buttons & badges */
  .btn{padding:10px 18px;border-radius:10px;border:0;font-weight:700;cursor:pointer}
  .btn-primary{background:var(--primary);color:#fff;box-shadow:0 8px 18px rgba(37,99,235,0.12)}
  .btn-primary:hover{background:var(--primary-600)}

  .status-badge{padding:6px 12px;border-radius:999px;font-size:0.8rem;font-weight:700;display:inline-flex;align-items:center;gap:8px}
  .status-badge.live{background:linear-gradient(90deg,#ecfdf5,#dcfce7);color:var(--success);border:1px solid rgba(16,185,129,0.12)}

  .metric-value{font-size:1.9rem;font-weight:800}
  .card-title{font-size:0.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.6px}

  .progress-bar-bg{background:#eef6fb;height:8px;border-radius:999px;margin-top:10px}
  .progress-bar-fill{height:100%;border-radius:999px;transition:width 900ms cubic-bezier(.2,.9,.4,1)}

  /* Copilot */
  .copilot-fab{position:fixed;right:32px;bottom:32px;width:64px;height:64px;border-radius:999px;background:linear-gradient(180deg,var(--primary),var(--primary-600));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 18px 40px rgba(37,99,235,0.18);border:0;cursor:pointer;z-index:140}
  .copilot-panel{position:fixed;right:32px;bottom:110px;width:360px;height:520px;background:var(--bg-panel);border-radius:14px;border:1px solid var(--border-color);box-shadow:0 30px 60px rgba(2,6,23,0.12);display:none;flex-direction:column;overflow:hidden}
  .copilot-panel.open{display:flex}
  .chat-area{flex:1;padding:1rem;overflow:auto;display:flex;flex-direction:column;gap:10px;background:linear-gradient(180deg,#fbfcff,#ffffff)}
  .chat-msg{max-width:78%;padding:10px 14px;border-radius:14px;font-size:0.95rem}
  .chat-msg.ai{background:#f8fafc;border:1px solid var(--border-color);align-self:flex-start;color:var(--text-main)}
  .chat-msg.user{background:var(--primary);color:#fff;align-self:flex-end}

  /* Logs */
  .logs-section pre{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace;font-size:0.9rem;color:var(--text-muted)}

  /* Utilities */
  .brand{font-size:1.15rem;font-weight:800;display:flex;align-items:center;gap:10px}
  .nav-link{display:flex;align-items:center;gap:12px;padding:0.75rem 1rem;color:var(--text-muted);border-radius:10px;text-decoration:none;cursor:pointer}
  .nav-link.active{background:#f0f6ff;color:var(--primary)}

  @media (max-width:980px){
    .sidebar{display:none}
    .map-section{grid-column:span 1}
    .dashboard-container{padding:1rem}
  }
`;

// --- COMPONENTS ---

const LandingPage = ({ onEnter }) => {
  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}>
          <i className="fa-solid fa-heart-pulse"></i>
        </div>
        <h1>CareSync <span style={{color: 'var(--primary)'}}>AI</span></h1>
        <p>Autonomous Healthcare Intelligence Infrastructure</p>
        <button className="btn btn-primary" onClick={onEnter} style={{fontSize: '1.1rem', padding: '15px 40px'}}>
          <i className="fa-solid fa-lock" style={{marginRight: '10px'}}></i> Access Operational Dashboard
        </button>
        <div style={{marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
          Secure Connection via Bright Data Network
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // State
  const [oxygen, setOxygen] = useState(84);
  const [icu, setIcu] = useState(92);
  const [meds, setMeds] = useState(78);
  const [logs, setLogs] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello Dr. Chen. I am your AI Procurement Agent. I\'ve detected a potential oxygen shortage in the Delhi NCR region.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [toasts, setToasts] = useState([]);

  // Refs for Canvas/DOM manipulation
  const chartRef = useRef(null);
  const mapRef = useRef(null);
  const logsEndRef = useRef(null);

  // --- EFFECTS ---

  // 1. Inject Styles into Head
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    // Cleanup on unmount
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  // 2. Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate Oxygen
      const change = (Math.random() - 0.6) * 1.5;
      setOxygen(prev => Math.max(0, Math.min(100, prev + change)));

      // Random Logs
      if (Math.random() > 0.9) {
        const agents = ['Supply Agent', 'Risk Agent', 'Procurement Agent', 'Web Unlocker'];
        const messages = [
          'Checked supplier inventory via Scraping Browser.',
          'Analyzed regional outbreak trends (SERP API).',
          'Recalculated delivery risk probability.',
          'Verified pharmaceutical pricing data.'
        ];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        addLog(randomAgent, randomMsg);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 3. Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 4. Chart Drawing
  useEffect(() => {
    drawChart();
  }, [oxygen]); // Redraw when oxygen changes

  // 5. Map Drawing (Only once on mount)
  useEffect(() => {
    if (mapRef.current) {
      drawMapConnections();
    }
  }, []);

  // --- HANDLERS ---

  const addLog = (agent, message) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' });
    setLogs(prev => [...prev, { time, agent, message }].slice(-20)); // Keep last 20
  };

  const drawChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 250;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 30;

    ctx.clearRect(0, 0, w, h);
    
    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<5; i++) {
      const y = padding + (h - 2*padding) * (i/4);
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
    }
    ctx.stroke();

    // Data Generation based on current Oxygen
    const dataPoints = 10;
    const stepX = (w - 2*padding) / (dataPoints - 1);
    const getY = (val) => h - padding - ((val / 100) * (h - 2*padding));

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb'; // Primary Blue
    ctx.lineWidth = 3;
    
    for(let i=0; i<dataPoints; i++) {
      // Simulate history + prediction mix
      const isPrediction = i > 6;
      const val = isPrediction ? Math.max(0, oxygen - ((i-6)*5)) : (oxygen + (Math.random()*10 - 5));
      
      const x = padding + i * stepX;
      const y = getY(val);
      
      if(i===0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      if (isPrediction) {
        ctx.fillStyle = '#7c3aed'; // Accent
        ctx.fillRect(x-3, y-3, 6, 6);
      }
    }
    ctx.stroke();
  };

  const drawMapConnections = () => {
    const svg = mapRef.current.querySelector('svg');
    if(!svg) return;

    const nodes = Array.from(mapRef.current.querySelectorAll('.map-node'));
    // Assuming center node is index 2
    const center = nodes[2];
    if(!center) return;
    
    const cx = center.offsetLeft + 6;
    const cy = center.offsetTop + 6;

    let linesHTML = '';
    nodes.forEach((node, idx) => {
      if(idx === 2) return;
      const x = node.offsetLeft + 6;
      const y = node.offsetTop + 6;
      linesHTML += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#cbd5e1" stroke-width="2" />`;
    });
    svg.innerHTML = linesHTML;
  };

  const toggleChat = () => setChatOpen(!chatOpen);
  
  const sendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Processing request via secure MCP connection...";
      if(userText.toLowerCase().includes('oxygen')) reply = "Found 3 suppliers. 'PureAir Logistics' has 98% reliability. Initiating procurement protocol?";
      else if(userText.toLowerCase().includes('ok') || userText.toLowerCase().includes('yes')) reply = "Order confirmed. Web Unlocker has accessed the supplier portal to automate the paperwork.";
      else reply = "I've updated the risk assessment based on current web intelligence.";
      
      setChatMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', text: reply }]);
    }, 1000);
  };

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- RENDER HELPERS ---

  const getStatusColor = (val) => {
    if (val < 40) return 'var(--danger)';
    if (val < 70) return 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <i className="fa-solid fa-heart-pulse" style={{color: 'var(--primary)'}}></i>
          CareSync <span>AI</span>
        </div>
        <div style={{flex: 1}}>
          <div className="nav-link active"><i className="fa-solid fa-table-columns"></i> Dashboard</div>
          <div className="nav-link"><i className="fa-solid fa-earth-americas"></i> Global Intel</div>
          <div className="nav-link"><i className="fa-solid fa-boxes-stacked"></i> Supply Chain</div>
          <div className="nav-link"><i className="fa-solid fa-file-medical"></i> Reports</div>
          <div className="nav-link"><i className="fa-solid fa-gear"></i> Settings</div>
        </div>
        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto'}}>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div>
            <h2 style={{fontSize: '1.1rem', fontWeight: 600}}>Operations Center</h2>
            <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>National Healthcare Intelligence Command</p>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <div className="status-badge live">
              <div className="pulse"></div> Live Agents Active
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.85rem', fontWeight: 600}}>Dr. Sarah Chen</div>
                <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Chief Medical Officer</div>
              </div>
              <div style={{width: '36px', height: '36px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                <i className="fa-solid fa-user"></i>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-container">
          {/* Metrics */}
          <div className="card">
            <div className="flex" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span className="card-title">Oxygen Levels</span>
              <i className="fa-solid fa-droplet" style={{color: 'var(--primary)'}}></i>
            </div>
            <div className="metric-value" style={{color: getStatusColor(oxygen)}}>{oxygen.toFixed(1)}%</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Regional Capacity</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: `${oxygen}%`, backgroundColor: getStatusColor(oxygen)}}></div>
            </div>
          </div>

          <div className="card">
            <div className="flex" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span className="card-title">ICU Occupancy</span>
              <i className="fa-solid fa-bed-pulse" style={{color: 'var(--danger)'}}></i>
            </div>
            <div className="metric-value" style={{color: 'var(--danger)'}}>{icu}%</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}><i className="fa-solid fa-arrow-up" style={{fontSize:'0.7rem'}}></i> High Load</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: `${icu}%`, backgroundColor: 'var(--danger)'}}></div>
            </div>
          </div>

          <div className="card">
            <div className="flex" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span className="card-title">Medicines</span>
              <i className="fa-solid fa-pills" style={{color: 'var(--warning)'}}></i>
            </div>
            <div className="metric-value" style={{color: 'var(--warning)'}}>{meds}%</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Stock Depleting</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: `${meds}%`, backgroundColor: 'var(--warning)'}}></div>
            </div>
          </div>

          <div className="card">
            <div className="flex" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span className="card-title">Risk Score</span>
              <i className="fa-solid fa-shield-halved" style={{color: 'var(--accent)'}}></i>
            </div>
            <div className="metric-value" style={{color: 'var(--accent)'}}>Mod</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>AI Analysis</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: '45%', backgroundColor: 'var(--accent)'}}></div>
            </div>
          </div>

          {/* Map */}
          <div className="card map-section">
            <div style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
              <span className="card-title">National Intelligence Map</span>
              <span style={{fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600}}>● Live</span>
            </div>
            <div id="intelligenceMap" ref={mapRef}>
              <svg style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}></svg>
              <div className="map-node" style={{top: '30%', left: '20%'}} onClick={() => addToast('Punjab: Status Normal')}>
                <span className="map-label">Punjab</span>
              </div>
              <div className="map-node critical" style={{top: '25%', left: '80%'}} onClick={() => addToast('Delhi NCR: Critical Oxygen Shortage')}>
                <span className="map-label">Delhi NCR</span>
              </div>
              <div className="map-node" style={{top: '50%', left: '50%'}} onClick={() => addToast('Central Region: Analyzing...')}>
                <span className="map-label">Central</span>
              </div>
              <div className="map-node" style={{top: '70%', left: '25%'}} onClick={() => addToast('Mumbai: Supply Chains Stable')}>
                <span className="map-label">Mumbai</span>
              </div>
              <div className="map-node critical" style={{top: '80%', left: '75%'}} onClick={() => addToast('Chennai: Logistics Delay Detected')}>
                <span className="map-label">Chennai</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card chart-section">
             <div style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
              <span className="card-title">Predictive Engine (Oxygen)</span>
              <span className="card-title" style={{color: 'var(--accent)'}}>AI Forecast</span>
            </div>
            <canvas ref={chartRef}></canvas>
          </div>

          {/* Logs */}
          <div className="card logs-section">
            <div style={{marginBottom: '10px'}}>
              <span className="card-title">AI Agent Activity</span>
            </div>
            <div style={{flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {logs.map((log, i) => (
                <div key={i} style={{display: 'flex', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px'}}>
                  <span style={{color: 'var(--text-muted)', minWidth: '60px'}}>[{log.time}]</span>
                  <span style={{color: 'var(--primary)', minWidth: '100px', fontWeight: 600}}>{log.agent}:</span>
                  <span style={{color: 'var(--text-main)'}}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Copilot FAB */}
      <button className="copilot-fab" onClick={toggleChat} title="AI Procurement Agent">
        <i className="fa-solid fa-robot" style={{color: 'white', fontSize: '1.5rem'}}></i>
      </button>

      {/* Copilot Panel */}
      <div className={`copilot-panel ${chatOpen ? 'open' : ''}`}>
        <div className="copilot-header">
          <h3 style={{fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
            <i className="fa-solid fa-sparkles" style={{color: 'var(--accent)'}}></i> AI Copilot
          </h3>
          <button onClick={toggleChat} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>&times;</button>
        </div>
        <div className="chat-area">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender === 'ai' ? 'ai' : 'user'}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form className="chat-input-area" onSubmit={sendChat}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask about suppliers..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" style={{background: 'var(--accent)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600}}>Send</button>
        </form>
      </div>

      {/* Toast Notifications */}
      <div style={{position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 200}}>
        {toasts.map(t => (
          <div key={t.id} style={{background: 'white', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minWidth: '300px', animation: 'slideUp 0.3s ease-out'}}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
};

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    // Simulate network/secure access delay
    setTimeout(() => {
      setLoading(false);
      setView('dashboard');
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{width: '100vw', height: '100vh', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'}}>
        <i className="fa-solid fa-circle-notch fa-spin fa-3x" style={{marginBottom: '20px'}}></i>
        <h2>Establishing Secure Connection...</h2>
        <p style={{color: 'var(--text-muted)'}}>Verifying Bright Data Infrastructure</p>
      </div>
    );
  }

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onEnter={handleEnter} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}