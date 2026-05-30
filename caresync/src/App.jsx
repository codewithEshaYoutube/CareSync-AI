import { useState, useEffect, useRef } from 'react';

// --- 1. ENTERPRISE STYLES (CSS) ---
// In a real project, move this to a separate CSS file or GlobalStyles component.
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  :root {
    --bg-body: #0f172a;
    --bg-panel: #1e293b;
    --bg-panel-light: #334155;
    
    --primary: #3b82f6;
    --primary-glow: rgba(59, 130, 246, 0.5);
    --accent: #8b5cf6;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    
    --border: #334155;
    --radius: 16px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; outline: none; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--bg-body); color: var(--text-main); font-family: var(--font-main); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

  /* Layout */
  #app-root { display: flex; height: 100vh; width: 100vw; }
  
  .sidebar {
    width: 260px;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(12px);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 1.5rem;
    z-index: 20;
  }
  
  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .topbar { height: 70px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; background: rgba(15, 23, 42, 0.9); }
  
  .dashboard-grid {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto auto 1fr;
    gap: 1.5rem;
    height: 100%; overflow-y: auto;
  }

  /* Cards */
  .panel {
    background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.5rem; display: flex; flex-direction: column; position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .stat-card { grid-column: span 1; min-height: 140px; }
  .map-card { grid-column: span 3; grid-row: span 2; min-height: 500px; position: relative; }
  .chart-card { grid-column: span 1; grid-row: span 2; min-height: 500px; }
  .log-card { grid-column: span 4; height: 250px; }

  /* UI Elements */
  .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: var(--transition); display: inline-flex; align-items: center; gap: 8px; }
  .btn:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 12px var(--primary-glow); }
  .btn-ghost { background: transparent; color: var(--text-muted); }
  
  .canvas-container { flex: 1; width: 100%; height: 100%; position: relative; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.2); }
  
  .log-container { font-family: var(--font-mono); font-size: 0.85rem; overflow-y: auto; color: var(--text-muted); }
  .log-entry { padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px; }
  
  /* Chat */
  .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5); z-index: 50; transition: transform 0.2s; }
  .ai-fab:hover { transform: scale(1.1); }
  .ai-panel { position: fixed; bottom: 100px; right: 30px; width: 380px; height: 550px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 50; }
  .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; animation: fadeIn 0.3s ease; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
  .msg.ai { background: var(--bg-panel-light); align-self: flex-start; border-bottom-left-radius: 2px; }
  .msg.user { background: var(--primary); align-self: flex-end; border-bottom-right-radius: 2px; }
  .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 12px 14px; background: var(--bg-panel-light); border-radius: 12px; border-bottom-left-radius: 2px; align-self: flex-start; }
  .typing-dot { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: typingBounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
  .chat-send-btn { background: var(--primary); border: none; color: white; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: var(--transition); }
  .chat-send-btn:hover:not(:disabled) { background: #2563eb; }
  .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Landing */
  #landing-page { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; transition: opacity 0.8s ease; }
  .loader-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: var(--bg-body); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.5s; }
  .loader-overlay.active { opacity: 1; pointer-events: all; }
  .spinner { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Utilities */
  .text-primary { color: var(--primary); }
  .text-danger { color: var(--danger); }
  .text-success { color: var(--success); }
  .text-muted { color: var(--text-muted); }
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .items-center { align-items: center; }
  .gap-2 { gap: 0.5rem; }
  .font-bold { font-weight: 700; }
`;

const createInitialChartData = () => (
  Array.from({ length: 20 }, () => Math.random() * 40 + 40)
);

// --- 2. SUB-COMPONENTS (Modularized for Enterprise Structure) ---

// A. Canvas Radar Map Component
const RadarMap = ({ nodes }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let angle = 0;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      // Grid
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(cx, cy) * 0.9;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      
      for(let i=1; i<=4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, maxR * (i/4), 0, Math.PI * 2); ctx.stroke();
      }
      
      // Radar Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createConicGradient(0, 0, 0);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      grad.addColorStop(0.2, 'rgba(59, 130, 246, 0.4)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, maxR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      angle += 0.01;

      // Draw Nodes
      nodes.forEach(node => {
        const x = node.x * width;
        const y = node.y * height;
        const color = node.status === 'critical' ? '#ef4444' : (node.status === 'warning' ? '#f59e0b' : '#10b981');
        
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        
        // Pulse
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        const pulse = Math.sin(Date.now() / 300) * 3;
        ctx.arc(x, y, 10 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px Inter';
        ctx.fillText(node.name, x + 15, y + 4);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [nodes]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
      {/* Tooltip placeholder logic could be added here */}
    </div>
  );
};

// B. Canvas Chart Component
const PredictiveChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawChart();
    };
    
    window.addEventListener('resize', resize);
    resize();

    function drawChart() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const padding = 20;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;
      const stepX = chartW / (data.length - 1);

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = padding + chartH - (val / 100) * chartH;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(padding + chartW, height - padding);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = padding + chartH - (val / 100) * chartH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    
    // Redraw when data changes
    drawChart();

    return () => window.removeEventListener('resize', resize);
  }, [data]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

// C. Chat Panel Component
const ChatPanel = ({ isOpen, onClose, onSend, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Scroll to bottom whenever messages change or loading state toggles
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-header" style={{padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-sparkles" style={{color: 'var(--accent)'}}></i>
            AI Procurement Agent
          </span>
          <button className="btn-ghost" onClick={onClose} style={{border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem'}}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="chat-body" style={{flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          style={{padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center'}}
          onSubmit={handleSubmit}
        >
          <input
            style={{flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none'}}
            placeholder={isLoading ? 'Agent is thinking...' : 'Ask the procurement agent...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
      <div className="ai-fab" onClick={() => onClose()}>
        <i className="fa-solid fa-robot"></i>
      </div>
    </>
  );
};

// --- 3. MAIN APP COMPONENT ---

export default function App() {
  // State Management
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello Dr. Chen. I've analyzed the current inventory data. Oxygen levels in Delhi NCR are approaching critical thresholds. Shall I initiate automated procurement?" }
  ]);

  // Data State
  const [metrics, setMetrics] = useState({ oxygen: 84.5, icu: 92.1, pharma: 78.2 });
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState(createInitialChartData);
  
  // Static Map Data
  const [mapNodes] = useState([
    { id: 1, x: 0.2, y: 0.3, name: 'Punjab', status: 'stable', val: 98 },
    { id: 2, x: 0.8, y: 0.25, name: 'Delhi NCR', status: 'critical', val: 24 },
    { id: 3, x: 0.5, y: 0.5, name: 'Central', status: 'stable', val: 88 },
    { id: 4, x: 0.25, y: 0.75, name: 'Mumbai', status: 'warning', val: 65 },
    { id: 5, x: 0.75, y: 0.8, name: 'Chennai', status: 'stable', val: 91 }
  ]);

  // Effects
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (view !== 'dashboard') return;

    const interval = setInterval(() => {
      // Fluctuate Oxygen
      setMetrics(prev => ({
        ...prev,
        oxygen: Math.max(0, Math.min(100, prev.oxygen + (Math.random() - 0.6) * 2))
      }));

      // Update Chart
      setChartData(prev => {
        const next = [...prev.slice(1), prev[prev.length-1] + (Math.random()*10 - 5)];
        return next;
      });

      // Add Random Log
      if (Math.random() > 0.85) {
        const agents = ['Supply Agent', 'Risk Agent', 'Procurement AI'];
        const msgs = ['Inventory verified.', 'New supplier quote received.', 'Logistics delay detected in Sector 4.'];
        const time = new Date().toLocaleTimeString([], { hour12: false });
        setLogs(prev => [{ time, source: agents[Math.floor(Math.random()*agents.length)], msg: msgs[Math.floor(Math.random()*msgs.length)] }, ...prev].slice(0, 20));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [view]);

  // Handlers
  const enterDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('dashboard');
    }, 1500);
  };

  const handleChatSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          hospital_id: 'b1000000-0000-0000-0000-000000000002', // AIIMS Delhi (seeded)
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I encountered a connection error. Please ensure the backend server is running.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="loader-overlay active">
          <div className="spinner"></div>
          <h3 style={{marginTop: '20px', fontWeight: '500'}}>Establishing Secure Connection...</h3>
          <p className="text-muted" style={{marginTop: '5px'}}>Verifying Bright Data Infrastructure</p>
        </div>
      )}

      {/* Landing Page */}
      {view === 'landing' && (
        <div id="landing-page">
          <div style={{textAlign: 'center', maxWidth: '600px'}}>
            <div style={{width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem'}}>
              <i className="fa-solid fa-heart-pulse fa-2x text-primary"></i>
            </div>
            <h1 style={{fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              CareSync <span className="text-primary">AI</span>
            </h1>
            <p className="text-muted" style={{fontSize: '1.2rem', marginBottom: '3rem'}}>
              Autonomous Healthcare Intelligence Infrastructure
            </p>
            <button className="btn" onClick={enterDashboard} style={{fontSize: '1.1rem', padding: '15px 40px'}}>
              <i className="fa-solid fa-lock"></i> Secure Access
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Application */}
      {view === 'dashboard' && (
        <div id="app-root">
          <aside className="sidebar">
            <div className="brand" style={{fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <i className="fa-solid fa-heart-pulse text-primary"></i>
              <span>CareSync<span className="text-primary">AI</span></span>
            </div>
            <nav style={{flex: 1}}>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)'}}>
                <i className="fa-solid fa-grid-2"></i> Dashboard
              </div>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px'}}>
                <i className="fa-solid fa-map-location-dot"></i> Global Intel
              </div>
            </nav>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <div>
                <h2 className="font-bold">National Operations Center</h2>
                <p className="text-muted text-xs">Live Feed • Delhi NCR Sector</p>
              </div>
              <div className="flex items-center gap-4">
                <div style={{textAlign: 'right'}}>
                  <div className="font-bold text-sm">Dr. Sarah Chen</div>
                  <div className="text-muted text-xs">Chief Medical Officer</div>
                </div>
                <img src="https://picsum.photos/seed/doctor/40/40" alt="User" style={{width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border)'}} />
              </div>
            </header>

            <div className="dashboard-grid">
              {/* Metrics */}
              <div className="panel stat-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted text-xs font-bold uppercase">Oxygen</p>
                    <h1 className="font-bold" style={{fontSize: '2rem'}}>{metrics.oxygen.toFixed(1)}%</h1>
                  </div>
                  <i className="fa-solid fa-lungs text-primary fa-lg"></i>
                </div>
                <div style={{height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: 'auto'}}>
                  <div style={{height: '100%', width: `${metrics.oxygen}%`, background: 'var(--primary)', borderRadius: '2px', transition: 'width 1s'}}></div>
                </div>
              </div>

              <div className="panel stat-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-muted text-xs font-bold uppercase">ICU Occupancy</p>
                    <h1 className="font-bold" style={{fontSize: '2rem', color: 'var(--danger)'}}>{metrics.icu}%</h1>
                  </div>
                  <i className="fa-solid fa-bed-pulse text-danger fa-lg"></i>
                </div>
                <div style={{height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: 'auto'}}>
                  <div style={{height: '100%', width: `${metrics.icu}%`, background: 'var(--danger)', borderRadius: '2px'}}></div>
                </div>
              </div>

              {/* Map Section */}
              <div className="panel map-card">
                <div className="flex justify-between items-center mb-4" style={{zIndex: 10, position: 'relative'}}>
                  <h3 className="font-bold">Intelligence Map</h3>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-2"><div style={{width:'8px', height:'8px', borderRadius:'50%', background:'var(--danger)'}}></div> Critical</span>
                  </div>
                </div>
                <RadarMap nodes={mapNodes} />
              </div>

              {/* Chart Section */}
              <div className="panel chart-card">
                <h3 className="font-bold mb-4">Predictive Analytics</h3>
                <PredictiveChart data={chartData} />
              </div>

              {/* Logs */}
              <div className="panel log-card">
                <h3 className="font-bold text-sm mb-2">System Logs</h3>
                <div className="log-container">
                  {logs.map((log, i) => (
                    <div key={i} className="log-entry">
                      <span className="text-muted" style={{minWidth:'60px'}}>[{log.time}]</span>
                      <span style={{color: 'var(--accent)', minWidth:'120px', fontWeight:'bold'}}>{log.source}:</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <ChatPanel
            isOpen={chatOpen}
            onClose={() => setChatOpen(!chatOpen)}
            onSend={handleChatSend}
            messages={messages}
            isLoading={chatLoading}
          />
        </div>
      )}
    </>
  );
}
