
import { useState, useEffect, useRef, useCallback } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  :root {
    --bg-body: #020617;
    --bg-panel: rgba(30, 41, 59, 0.6);
    --bg-panel-solid: #0f172a;
    --bg-panel-light: #1e293b;
    
    --primary: #3b82f6;
    --primary-glow: rgba(59, 130, 246, 0.6);
    --accent: #8b5cf6;
    --accent-glow: rgba(139, 92, 246, 0.5);
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    
    --border: rgba(148, 163, 184, 0.1);
    --border-active: rgba(59, 130, 246, 0.5);
    --radius: 16px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --header-height: 60px;
    --nav-width: 240px;
    --nav-height-mobile: 70px;
  }

  * { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--bg-body); color: var(--text-main); font-family: var(--font-main); }

  /* Background Grid Pattern */
  body::before {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: -1;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
  @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

  /* Layout */
  #app-root { display: flex; height: 100vh; width: 100vw; background: radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 60%); overflow: hidden; }
  
  /* Sidebar (Desktop) / Bottom Nav (Mobile) */
  .sidebar {
    width: var(--nav-width);
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 1.5rem;
    z-index: 30;
    transition: var(--transition);
  }

  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  
  .topbar { 
    height: var(--header-height); 
    border-bottom: 1px solid var(--border); 
    display: flex; align-items: center; justify-content: space-between; 
    padding: 0 1.5rem; 
    background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(10px); 
  }

  /* Responsive Grid */
  .dashboard-grid {
    padding: 1.5rem;
    display: grid;
    /* Auto-fit makes it responsive automatically */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-auto-rows: min-content;
    gap: 1.5rem;
    height: 100%; 
    overflow-y: auto; 
    padding-bottom: 100px; /* Space for mobile nav */
  }

  /* Special Grid Spans */
  .stat-card { grid-column: span 1; }
  .map-card { grid-column: 1 / -1; min-height: 400px; } /* Full width on all screens */
  .chart-card { grid-column: span 1; min-height: 300px; }
  .log-card { grid-column: 1 / -1; height: 250px; }

  @media (min-width: 1024px) {
    .map-card { grid-column: span 3; min-height: 500px; }
    .chart-card { grid-column: span 1; min-height: 500px; }
    .log-card { grid-column: span 4; }
  }

  /* Cards with Glassmorphism */
  .panel {
    background: var(--bg-panel); 
    border: 1px solid var(--border); 
    border-radius: var(--radius);
    padding: 1.25rem; 
    display: flex; 
    flex-direction: column; 
    position: relative;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: var(--transition);
  }
  .panel:hover { border-color: var(--border-active); transform: translateY(-2px); }

  .canvas-container { flex: 1; width: 100%; min-height: 250px; position: relative; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.2); border: 1px solid var(--border); }
  
  /* UI Elements */
  .btn { 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    color: white; border: none; padding: 12px 24px; border-radius: 12px; 
    font-weight: 600; cursor: pointer; transition: var(--transition); 
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; 
    font-size: 0.95rem; position: relative; overflow: hidden; 
    box-shadow: 0 4px 15px var(--primary-glow);
  }
  .btn:active { transform: scale(0.96); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid transparent; }
  .btn-ghost:hover { background: rgba(255,255,255,0.05); color: white; }
  .btn-danger { background: rgba(239, 68, 68, 0.2); border: 1px solid var(--danger); color: var(--danger); box-shadow: none; }
  .btn-danger:hover { background: var(--danger); color: white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
  
  /* Navigation Items */
  .nav-item {
    padding: 14px; margin-bottom: 4px; border-radius: 12px; 
    display: flex; align-items: center; gap: 12px; 
    color: var(--text-muted); transition: var(--transition); cursor: pointer;
  }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
  .nav-item.active { background: rgba(59, 130, 246, 0.15); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.2); }
  .nav-item i { font-size: 1.1rem; width: 24px; text-align: center; }
  
  /* Tables */
  .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 400px; }
  .data-table th { text-align: left; color: var(--text-muted); padding: 12px; font-weight: 600; border-bottom: 1px solid var(--border); white-space: nowrap; }
  .data-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-main); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; padding: 20px; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg-panel-solid); border: 1px solid var(--border); width: 100%; max-width: 600px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); transition: transform 0.3s; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  .modal-overlay.open .modal { transform: scale(1); }
  .modal-header { padding: 1.25rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
  .modal-footer { padding: 1.25rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: rgba(255,255,255,0.02); }

  /* Form */
  .form-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: white; padding: 12px; border-radius: 10px; font-size: 1rem; margin-bottom: 1rem; transition: var(--transition); }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }

  /* Chat */
  .ai-fab { position: fixed; bottom: 90px; right: 20px; width: 56px; height: 56px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 50; transition: var(--transition); border: 2px solid rgba(255,255,255,0.1); }
  .ai-fab:hover { transform: scale(1.1) rotate(10deg); }
  .ai-panel { position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; max-width: 400px; max-height: 80vh; background: var(--bg-panel-solid); border: 1px solid var(--border); border-radius: 20px 20px 0 0; display: flex; flex-direction: column; transform: translateY(110%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 60; box-shadow: 0 -10px 40px rgba(0,0,0,0.5); margin: 10px; }
  .ai-panel.open { transform: translateY(0); }
  
  @media (min-width: 768px) {
    .ai-panel { position: fixed; bottom: 100px; right: 30px; width: 380px; height: 550px; border-radius: 16px; margin: 0; transform: scale(0.9) translateY(20px); opacity: 0; }
    .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; }
    .ai-fab { bottom: 30px; right: 30px; }
  }

  .msg { max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 0.95rem; animation: fadeIn 0.3s ease; line-height: 1.5; white-space: pre-wrap; margin-bottom: 8px; }
  .msg.ai { background: var(--bg-panel-light); align-self: flex-start; border-bottom-left-radius: 4px; color: var(--text-main); border: 1px solid var(--border); }
  .msg.user { background: var(--primary); align-self: flex-end; border-bottom-right-radius: 4px; color: white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }

  /* Landing Page - Winner Level */
  #landing-page { 
    position: absolute; inset: 0; 
    background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #020617);
    background-size: 400% 400%;
    animation: bg-pan 15s ease infinite;
    display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; 
  }
  
  .scan-line {
    position: absolute; top: 0; left: 0; width: 100%; height: 5px;
    background: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 20px var(--primary), 0 0 60px var(--primary);
    animation: scan 3s linear infinite;
    z-index: 101; opacity: 0.5;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 24px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    max-width: 90%;
    width: 500px;
    animation: float 6s ease-in-out infinite;
  }

  .logo-pulse {
    width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--accent));
    border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 2rem;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    animation: pulse-ring 2s infinite;
  }

  /* Utilities */
  .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge.critical { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
  .badge.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge.stable { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .items-center { align-items: center; }
  .font-bold { font-weight: 700; }
  .text-muted { color: var(--text-muted); }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }

  /* --- MOBILE RESPONSIVENESS OVERRIDES --- */
  @media (max-width: 768px) {
    #app-root { flex-direction: column; }
    
    /* Sidebar becomes Bottom Nav */
    .sidebar {
      width: 100%; height: var(--nav-height-mobile);
      flex-direction: row; justify-content: space-around;
      padding: 0; border-right: none; border-top: 1px solid var(--border);
      position: fixed; bottom: 0; left: 0;
      background: rgba(15, 23, 42, 0.95);
    }
    
    /* Hide brand on mobile nav, show icons only */
    .sidebar .brand { display: none; }
    .sidebar nav { display: flex; flex-direction: row; width: 100%; justify-content: space-around; align-items: center; }
    .nav-item { flex-direction: column; padding: 8px; gap: 4px; margin: 0; background: transparent !important; border: none !important; color: var(--text-muted); }
    .nav-item span { font-size: 0.7rem; display: block; }
    .nav-item.active { color: var(--primary); background: transparent !important; }
    .nav-item.active i { transform: scale(1.2); transition: 0.2s; }

    /* Adjust main content for bottom nav */
    .main-content { height: calc(100vh - var(--nav-height-mobile)); }
    .dashboard-grid { padding-bottom: 90px; } /* Extra padding */
    
    /* Typography scaling */
    h1 { font-size: 1.5rem !important; }
    h2 { font-size: 1.25rem !important; }
    
    /* Modals */
    .modal { width: 100%; height: 100%; max-height: none; border-radius: 0; }
    .modal-overlay { padding: 0; }
  }
`;

// --- 2. API HELPERS ---
const API_BASE = 'http://localhost:8000/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("API Fetch Failed:", error);
    // Return null to allow fallback UI to handle it gracefully
    return null; 
  }
}

// --- 3. COMPONENTS ---

// Radar Map
const RadarMap = ({ hospitals, onSelectHospital }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let angle = 0;

    // Resize handler
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Draw Loop
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(cx, cy) * 0.85;

      // Draw Grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for(let i=1; i<=4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, maxR * (i/4), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
      
      // Radar Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createConicGradient(0, 0, 0);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      grad.addColorStop(0.1, 'rgba(59, 130, 246, 0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, maxR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      angle += 0.01;

      // Nodes
      hospitals.forEach(h => {
        const x = (h.position?.x || 0.5) * width;
        const y = (h.position?.y || 0.5) * height;
        const status = h.status || 'stable';
        
        let color = '#10b981';
        if (status === 'critical') color = '#ef4444';
        else if (status === 'warning') color = '#f59e0b';

        // Critical Pulse
        if (status === 'critical') {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 300) * 0.3;
          ctx.beginPath(); ctx.arc(x, y, 15 + Math.sin(Date.now()/200)*5, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(h.name, x, y + 18);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Click Handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      hospitals.forEach(h => {
        const x = (h.position?.x || 0.5) * canvas.width;
        const y = (h.position?.y || 0.5) * canvas.height;
        const dist = Math.sqrt((mouseX - x)**2 + (mouseY - y)**2);
        
        if (dist < 20) { // Larger touch target for mobile
          onSelectHospital(h);
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [hospitals, onSelectHospital]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

// Modals
const HospitalDetailModal = ({ hospital, onClose, onOpenOrder }) => {
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    if (!hospital) return;
    const fetchDetails = async () => {
      const [invData, alertData] = await Promise.all([
        apiFetch(`/hospitals/${hospital.id}/inventory`),
        apiFetch(`/hospitals/${hospital.id}/alerts?status=active`)
      ]);
      setDetails({ 
        inventory: invData?.inventory || [], 
        alerts: alertData?.alerts || [] 
      });
    };
    fetchDetails();
  }, [hospital]);

  if (!hospital) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="font-bold">{hospital.name}</h2>
            <p className="text-xs text-muted flex items-center gap-2 mt-1">
              <span className={`badge ${hospital.status}`}>{hospital.status}</span>
              {hospital.region}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-xmark fa-lg"></i></button>
        </div>
        <div className="modal-body">
          <div className="flex gap-4 flex-col lg:flex-row">
            <div style={{flex: 1}}>
              <h3 className="font-bold text-sm text-primary mb-3">INVENTORY</h3>
              {details?.inventory.length ? (
                <table className="data-table">
                  <thead><tr><th>Item</th><th>Lvl</th></tr></thead>
                  <tbody>
                    {details.inventory.slice(0, 5).map((item, i) => (
                      <tr key={i}>
                        <td>{item.resource}</td>
                        <td><span className={`badge ${item.status}`}>{item.current_level}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-muted text-sm">No data available.</p>}
            </div>
            <div style={{flex: 1}}>
              <h3 className="font-bold text-sm text-danger mb-3">ALERTS</h3>
              {details?.alerts.length ? details.alerts.map((alert, i) => (
                <div key={i} className="p-2 mb-2 bg-white/5 rounded border border-white/5 text-xs">
                  <div className="font-bold text-danger mb-1">{alert.message}</div>
                  <div className="text-muted">{new Date(alert.created_at).toLocaleTimeString()}</div>
                </div>
              )) : <p className="text-muted text-sm">No active alerts.</p>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => onOpenOrder(hospital)}>
            <i className="fa-solid fa-cart-plus"></i> Procure Supplies
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcurementModal = ({ hospital, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    try {
      await apiFetch('/procurement/orders', {
        method: 'POST',
        body: JSON.stringify({
          hospital_id: hospital.id,
          supplier_id: 'mock-supplier-1',
          resource_name: formData.get('resource'),
          quantity: parseInt(formData.get('quantity')),
          notes: formData.get('notes')
        })
      });
      onSuccess('Order created successfully');
      onClose();
    } catch (err) {
      alert("Error creating order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="font-bold">New Order</h2>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label className="text-xs text-muted uppercase font-bold">Resource</label>
            <select name="resource" className="form-input">
              <option>Medical Oxygen</option>
              <option>ICU Ventilators</option>
              <option>PPE Kits</option>
            </select>
            
            <label className="text-xs text-muted uppercase font-bold">Quantity</label>
            <input name="quantity" type="number" className="form-input" defaultValue="50" required />
            
            <label className="text-xs text-muted uppercase font-bold">Notes</label>
            <input name="notes" type="text" className="form-input" placeholder="Urgency level..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Chat
const ChatPanel = ({ isOpen, onClose, onSend, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submit = (e) => {
    e.preventDefault();
    if(!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <>
      <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
        <div className="modal-header">
          <span className="font-bold flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-accent"></i> AI Agent
          </span>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-chevron-down"></i></button>
        </div>
        <div className="modal-body flex flex-col">
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
            ))}
            {isLoading && <div className="msg ai"><i className="fa-solid fa-circle-notch fa-spin"></i></div>}
            <div ref={endRef} />
          </div>
        </div>
        <div className="modal-footer">
          <form onSubmit={submit} className="flex gap-2 w-full">
            <input 
              className="form-input" style={{marginBottom: 0}} 
              placeholder="Ask AI..." value={input} onChange={e => setInput(e.target.value)} 
            />
            <button type="submit" className="btn" style={{padding: '0 16px'}}><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      <div className="ai-fab" onClick={() => onClose()}>
        <i className="fa-solid fa-robot"></i>
      </div>
    </>
  );
};

// --- 4. MAIN APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [procurementTarget, setProcurementTarget] = useState(null);
  
  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([{role: 'assistant', content: 'System Ready. How can I assist with logistics?'}]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = styles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (view === 'dashboard') {
      const load = async () => {
        const res = await apiFetch('/dashboard/summary');
        if (res) setData(res);
        else {
           // Fallback Mock Data for demo if backend is off
           setData({
             totals: { hospitals: 4, active_alerts: 1 },
             hospitals: [
               { id: '1', name: 'AIIMS Delhi', position: {x:0.8, y:0.3}, status: 'critical' },
               { id: '2', name: 'Kokilaben', position: {x:0.2, y:0.7}, status: 'warning' }
             ],
             agent_logs: [{agent: 'System', message: 'Mock mode active', created_at: new Date().toISOString()}]
           });
        }
      };
      load();
      const int = setInterval(load, 15000);
      return () => clearInterval(int);
    }
  }, [view]);

  const handleChat = async (txt) => {
    setMessages(p => [...p, {role: 'user', content: txt}]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: txt, history: messages, hospital_id: data?.hospitals[0]?.id })
      });
      const json = await res.json();
      setMessages(p => [...p, {role: 'assistant', content: json.response}]);
    } catch (e) {
      setMessages(p => [...p, {role: 'assistant', content: 'Backend unreachable. Ensure FastAPI is running on port 8000.'}]);
    }
    setChatLoading(false);
  };

  const enterDashboard = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setView('dashboard'); }, 1500);
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{position: 'fixed', top: 20, right: 20, background: 'var(--success)', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 200, animation: 'fadeIn 0.3s'}}>
          {toast}
        </div>
      )}

      {loading && (
        <div style={{position: 'fixed', inset: 0, background: 'var(--bg-body)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <i className="fa-solid fa-circle-notch fa-spin fa-3x text-primary mb-4"></i>
          <h3 className="font-bold">Authenticating...</h3>
        </div>
      )}

      {/* Landing Page */}
      {view === 'landing' && (
        <div id="landing-page">
          <div className="scan-line"></div>
          <div className="glass-card">
            <div className="logo-pulse">
              <i className="fa-solid fa-heart-pulse fa-2x text-white"></i>
            </div>
            <h1 className="font-bold" style={{fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white', lineHeight: 1.1}}>
              CareSync <span style={{color: 'var(--primary)'}}>AI</span>
            </h1>
            <p className="text-muted mb-8">Autonomous Healthcare Intelligence Infrastructure</p>
            <button className="btn" onClick={enterDashboard} style={{width: '100%', padding: '16px'}}>
              INITIALIZE SYSTEM
            </button>
            <p className="text-xs text-muted mt-4">v2.0.4 • Secure Connection</p>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {view === 'dashboard' && (
        <div id="app-root">
          <aside className="sidebar">
            <div className="brand" style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'white'}}>
              <i className="fa-solid fa-heart-pulse text-primary"></i>
              CareSync
            </div>
            <nav>
              <div className="nav-item active">
                <i className="fa-solid fa-grid-2"></i>
                <span>Dashboard</span>
              </div>
              <div className="nav-item">
                <i className="fa-solid fa-map"></i>
                <span>Map</span>
              </div>
              <div className="nav-item">
                <i className="fa-solid fa-box-open"></i>
                <span>Inventory</span>
              </div>
              <div className="nav-item">
                <i className="fa-solid fa-user-doctor"></i>
                <span>Staff</span>
              </div>
            </nav>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <h2 className="font-bold text-lg">Command Center</h2>
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="font-bold text-sm">Dr. Chen</div>
                  <div className="text-xs text-muted">CMO</div>
                </div>
                <div style={{width: '36px', height: '36px', borderRadius: '50%', background: '#334155', overflow:'hidden'}}>
                  <img src="https://picsum.photos/seed/doc/100/100" alt="Profile" style={{width:'100%', height:'100%'}} />
                </div>
              </div>
            </header>

            <div className="dashboard-grid">
              {/* Stat Cards */}
              <div className="panel stat-card">
                <div className="flex justify-between items-start">
                  <div><p className="text-muted text-xs uppercase">Active Alerts</p><h1 className="font-bold text-2xl text-danger">{data?.totals?.active_alerts || 0}</h1></div>
                  <i className="fa-solid fa-triangle-exclamation text-danger"></i>
                </div>
              </div>
              <div className="panel stat-card">
                <div className="flex justify-between items-start">
                  <div><p className="text-muted text-xs uppercase">Facilities</p><h1 className="font-bold text-2xl text-primary">{data?.totals?.hospitals || 0}</h1></div>
                  <i className="fa-solid fa-hospital text-primary"></i>
                </div>
              </div>
              
              {/* Map */}
              <div className="panel map-card">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">LIVE SATELLITE FEED</h3>
                  <span className="badge stable">ONLINE</span>
                </div>
                <RadarMap hospitals={data?.hospitals || []} onSelectHospital={setSelectedHospital} />
              </div>

              {/* Logs */}
              <div className="panel log-card">
                <h3 className="font-bold text-sm mb-3">SYSTEM LOGS</h3>
                <div style={{overflowY: 'auto', flex: 1}}>
                  {data?.agent_logs?.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-white/5">
                      <span className="text-primary font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                      <span className="text-accent font-bold">[{log.agent || 'SYS'}]</span>
                      <span className="text-muted truncate">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(!chatOpen)} onSend={handleChat} messages={messages} isLoading={chatLoading} />
          
          {selectedHospital && <HospitalDetailModal hospital={selectedHospital} onClose={() => setSelectedHospital(null)} onOpenOrder={setProcurementTarget} />}
          {procurementTarget && <ProcurementModal hospital={procurementTarget} onClose={() => setProcurementTarget(null)} onSuccess={setToast} />}
        </div>
      )}
    </>
  );
}
