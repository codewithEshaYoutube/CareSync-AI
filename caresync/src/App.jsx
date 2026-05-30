import { useState, useEffect, useRef, useCallback } from 'react';

// --- 1. ENTERPRISE & HACKATHON STYLES ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  :root {
    --bg-body: #050b14;
    --bg-panel: rgba(20, 30, 48, 0.7);
    --bg-panel-solid: #0f172a;
    --bg-panel-light: #1e293b;
    
    --primary: #3b82f6;
    --primary-glow: rgba(59, 130, 246, 0.6);
    --accent: #8b5cf6;
    --accent-glow: rgba(139, 92, 246, 0.5);
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    
    --border: rgba(148, 163, 184, 0.1);
    --border-active: rgba(59, 130, 246, 0.5);
    --radius: 12px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; outline: none; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--bg-body); color: var(--text-main); font-family: var(--font-main); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
  @keyframes pulse-glow { 0% { box-shadow: 0 0 5px var(--danger); } 50% { box-shadow: 0 0 20px var(--danger); } 100% { box-shadow: 0 0 5px var(--danger); } }

  /* Layout */
  #app-root { display: flex; height: 100vh; width: 100vw; background: radial-gradient(circle at 10% 10%, #0f172a 0%, #020617 100%); }
  
  .sidebar {
    width: 260px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 1.5rem;
    z-index: 20;
  }
  
  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .topbar { height: 70px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(10px); }
  
  .dashboard-grid {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto auto 1fr;
    gap: 1.5rem;
    height: 100%; overflow-y: auto;
  }

  /* Cards with Glassmorphism */
  .panel {
    background: var(--bg-panel); 
    border: 1px solid var(--border); 
    border-radius: var(--radius);
    padding: 1.5rem; 
    display: flex; 
    flex-direction: column; 
    position: relative;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: var(--transition);
  }
  .panel:hover { border-color: var(--border-active); box-shadow: 0 0 15px rgba(59, 130, 246, 0.1); }

  .stat-card { grid-column: span 1; min-height: 140px; position: relative; overflow: hidden; }
  .stat-card::before { content:''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); opacity: 0.5; }
  
  .map-card { grid-column: span 3; grid-row: span 2; min-height: 500px; position: relative; }
  .chart-card { grid-column: span 1; grid-row: span 2; min-height: 500px; }
  .log-card { grid-column: span 4; height: 200px; }

  /* UI Elements */
  .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: var(--transition); display: inline-flex; align-items: center; gap: 8px; font-size: 0.9rem; position: relative; overflow: hidden; }
  .btn::after { content:''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: 0.5s; }
  .btn:hover::after { left: 100%; }
  .btn:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 0 15px var(--primary-glow); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid transparent; }
  .btn-ghost:hover { background: rgba(255,255,255,0.05); color: white; }
  .btn-danger { background: rgba(239, 68, 68, 0.2); border: 1px solid var(--danger); color: var(--danger); }
  .btn-danger:hover { background: var(--danger); color: white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
  
  .canvas-container { flex: 1; width: 100%; height: 100%; position: relative; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.2); border: 1px solid var(--border); }
  
  .log-container { font-family: var(--font-mono); font-size: 0.8rem; overflow-y: auto; color: var(--text-muted); }
  .log-entry { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 12px; align-items: center; }
  .log-entry:hover { background: rgba(255,255,255,0.02); }
  
  /* Modal System */
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg-panel-solid); border: 1px solid var(--border); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 16px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden; }
  .modal-overlay.open .modal { transform: scale(1); }
  .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
  .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
  .modal-footer { padding: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: rgba(255,255,255,0.02); }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .data-table th { text-align: left; color: var(--text-muted); padding: 10px; font-weight: 500; border-bottom: 1px solid var(--border); }
  .data-table td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-main); }
  .data-table tr:hover { background: rgba(255,255,255,0.02); }

  /* Form Elements */
  .form-group { margin-bottom: 1rem; }
  .form-label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem; }
  .form-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: white; padding: 10px 12px; border-radius: 6px; font-size: 0.9rem; transition: var(--transition); }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }

  /* Chat */
  .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; cursor: pointer; box-shadow: 0 10px 30px -5px rgba(59, 130, 246, 0.6); z-index: 50; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.1); }
  .ai-fab:hover { transform: scale(1.1) rotate(5deg); }
  .ai-panel { position: fixed; bottom: 100px; right: 30px; width: 400px; height: 600px; background: var(--bg-panel-solid); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(20px); opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 50; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
  .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; animation: fadeIn 0.3s ease; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
  .msg.ai { background: var(--bg-panel-light); align-self: flex-start; border-bottom-left-radius: 2px; border: 1px solid var(--border); }
  .msg.user { background: linear-gradient(135deg, var(--primary), var(--accent)); align-self: flex-end; border-bottom-right-radius: 2px; }
  .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 12px 14px; background: var(--bg-panel-light); border-radius: 12px; border-bottom-left-radius: 2px; align-self: flex-start; width: fit-content; }
  .typing-dot { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: typingBounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }

  /* Toast */
  .toast-container { position: fixed; top: 20px; right: 20px; z-index: 200; display: flex; flex-direction: column; gap: 10px; }
  .toast { background: var(--bg-panel-solid); border: 1px solid var(--border); padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px; min-width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease; }
  .toast.success { border-left: 4px solid var(--success); }
  .toast.error { border-left: 4px solid var(--danger); }
  
  /* Landing */
  #landing-page { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at top right, #1e293b 0%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; transition: opacity 0.8s ease; }
  .loader-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: var(--bg-body); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.5s; }
  .loader-overlay.active { opacity: 1; pointer-events: all; }
  .spinner { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Utilities */
  .text-primary { color: var(--primary); }
  .text-danger { color: var(--danger); }
  .text-success { color: var(--success); }
  .text-muted { color: var(--text-muted); }
  .badge { padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
  .badge.critical { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
  .badge.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge.stable { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
`;

// --- 2. UTILITY FUNCTIONS ---

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
    throw error;
  }
}

// --- 3. SUB-COMPONENTS ---

// A. Canvas Radar Map Component (Interactive)
const RadarMap = ({ hospitals, onSelectHospital }) => {
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

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Simple hit detection
      let hovered = false;
      ctx.canvas.style.cursor = 'default';
      
      hospitals.forEach(h => {
        // Backend sends position_x/y (0-1) or absolute. Assuming 0-1 relative for radar.
        // If backend sends absolute pixels, we need to normalize. 
        // Let's assume 0-100 coordinate space based on DB schema hint or normalize if needed.
        // For this demo, we normalize the provided coords to canvas size.
        const x = (h.position.x || 0.5) * canvas.width;
        const y = (h.position.y || 0.5) * canvas.height;
        const dist = Math.sqrt((mouseX - x)**2 + (mouseY - y)**2);
        
        if (dist < 15) {
          hovered = true;
          ctx.canvas.style.cursor = 'pointer';
        }
      });
      return hovered;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      hospitals.forEach(h => {
        const x = (h.position.x || 0.5) * canvas.width;
        const y = (h.position.y || 0.5) * canvas.height;
        const dist = Math.sqrt((mouseX - x)**2 + (mouseY - y)**2);
        
        if (dist < 15) {
          onSelectHospital(h);
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(cx, cy) * 0.9;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Circles
      for(let i=1; i<=4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, maxR * (i/4), 0, Math.PI * 2); ctx.stroke();
      }
      // Crosshairs
      ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
      
      // Radar Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createConicGradient(0, 0, 0);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      grad.addColorStop(0.1, 'rgba(59, 130, 246, 0.1)');
      grad.addColorStop(0.2, 'rgba(59, 130, 246, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, maxR, 0, Math.PI * 2); ctx.fill();
      
      // Leading Edge Line
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(maxR, 0); ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'; ctx.stroke();
      ctx.restore();
      angle += 0.008;

      // Draw Nodes (Hospitals)
      hospitals.forEach(h => {
        const x = (h.position.x || 0.5) * canvas.width;
        const y = (h.position.y || 0.5) * canvas.height;
        const status = h.status || 'stable';
        
        // Color Logic
        let color = '#10b981';
        let shadow = 'rgba(16, 185, 129, 0.5)';
        if (status === 'critical') { color = '#ef4444'; shadow = 'rgba(239, 68, 68, 0.6)'; }
        else if (status === 'warning') { color = '#f59e0b'; shadow = 'rgba(245, 158, 11, 0.6)'; }

        // Pulse Effect for Critical
        if (status === 'critical') {
          ctx.fillStyle = shadow;
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 200) * 0.4;
          ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Node
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = shadow;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(h.name, x, y + 20);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [hospitals, onSelectHospital]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

// B. Hospital Detail Modal
const HospitalDetailModal = ({ hospital, onClose, onOpenOrder }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const invData = await apiFetch(`/hospitals/${hospital.id}/inventory`);
        const alertData = await apiFetch(`/hospitals/${hospital.id}/alerts?status=active`);
        setDetails({ inventory: invData.inventory, alerts: alertData.alerts });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (hospital) fetchDetails();
  }, [hospital]);

  if (!hospital) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="font-bold text-xl">{hospital.name}</h2>
            <p className="text-muted text-sm flex items-center gap-2">
              <i className="fa-solid fa-location-dot"></i> {hospital.region || 'Unknown Region'}
              <span className={`badge ${hospital.status}`}>{hospital.status}</span>
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-xmark fa-lg"></i></button>
        </div>
        
        <div className="modal-body">
          {loading ? <div className="text-center text-muted">Loading telemetry...</div> : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-3 text-sm text-primary uppercase">Inventory Levels</h3>
                <table className="data-table">
                  <thead><tr><th>Resource</th><th>Level</th><th>Status</th></tr></thead>
                  <tbody>
                    {details?.inventory.map((item, i) => (
                      <tr key={i}>
                        <td>{item.resource}</td>
                        <td>{item.current_level} {item.unit}</td>
                        <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-sm text-danger uppercase">Active Alerts</h3>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {details?.alerts.length > 0 ? details.alerts.map((alert, i) => (
                    <div key={i} className="log-entry" style={{borderBottom: '1px solid var(--border)'}}>
                      <div className="text-danger"><i className="fa-solid fa-triangle-exclamation"></i></div>
                      <div>
                        <div className="text-sm font-bold">{alert.message}</div>
                        <div className="text-xs text-muted">{new Date(alert.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  )) : <div className="text-muted text-sm">No active alerts.</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button 
            className={`btn ${hospital.status === 'critical' ? 'btn-danger' : ''}`} 
            onClick={() => onOpenOrder(hospital)}
          >
            <i className="fa-solid fa-cart-plus"></i> Request Procurement
          </button>
        </div>
      </div>
    </div>
  );
};

// C. Procurement Form Modal
const ProcurementModal = ({ hospital, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    resource_name: 'Oxygen', // Default critical resource
    quantity: 50,
    supplier_id: 'mock-supplier-1', // Mock ID for demo, usually fetched from /suppliers
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Note: Using a mock supplier_id because the list endpoint wasn't provided in main.py
      // In a full app, we would fetch suppliers first.
      await apiFetch('/procurement/orders', {
        method: 'POST',
        body: JSON.stringify({
          hospital_id: hospital.id,
          supplier_id: formData.supplier_id,
          resource_name: formData.resource_name,
          quantity: parseInt(formData.quantity),
          notes: formData.notes
        })
      });
      onSuccess(`Order placed for ${formData.quantity} units of ${formData.resource_name}`);
      onClose();
    } catch (err) {
      alert("Failed to place order. Check console.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{maxWidth: '500px'}}>
        <div className="modal-header">
          <h2 className="font-bold">New Procurement Order</h2>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hospital</label>
              <input type="text" className="form-input" value={hospital.name} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Resource</label>
              <select 
                className="form-input" 
                value={formData.resource_name}
                onChange={e => setFormData({...formData, resource_name: e.target.value})}
              >
                <option value="Oxygen">Medical Oxygen</option>
                <option value="Ventilators">ICU Ventilators</option>
                <option value="PPE Kits">PPE Kits</option>
                <option value="Remdesivir">Antiviral Medication</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea 
                className="form-input" 
                rows="3"
                placeholder="Urgency details..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// D. Chat Panel
const ChatPanel = ({ isOpen, onClose, onSend, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
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
            placeholder={isLoading ? 'Agent is thinking...' : 'Ask about supply chain risks...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn" style={{padding: '10px'}} disabled={isLoading || !input.trim()}>
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

// --- 4. MAIN APP COMPONENT ---

export default function App() {
  // View State
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null); // For Detail Modal
  const [procurementTarget, setProcurementTarget] = useState(null); // For Order Modal

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "System online. Connected to regional inventory databases. I can assist with procurement analysis and risk mitigation." }
  ]);
  
  // Toast State
  const [toast, setToast] = useState(null);

  // Initialize Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Fetch Dashboard Data (Real Integration)
  useEffect(() => {
    if (view === 'dashboard') {
      const loadData = async () => {
        try {
          const data = await apiFetch('/dashboard/summary');
          setDashboardData(data);
        } catch (e) {
          console.error("Could not connect to Backend API", e);
          // Fallback for demo if backend isn't running
          setDashboardData({
            totals: { hospitals: 5, active_alerts: 2 },
            hospitals: [
              { id: '1', name: 'AIIMS Delhi', position: {x: 0.8, y: 0.25}, status: 'critical' },
              { id: '2', name: 'Apollo Mumbai', position: {x: 0.25, y: 0.75}, status: 'warning' },
              { id: '3', name: 'CMC Vellore', position: {x: 0.5, y: 0.5}, status: 'stable' },
            ],
            agent_logs: [
              { agent: 'Risk Agent', message: 'Delhi NCR oxygen consumption spiked 15%.', created_at: new Date().toISOString() }
            ]
          });
        }
      };
      loadData();
      // Poll every 10 seconds
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [view]);

  // Handlers
  const enterDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('dashboard');
    }, 1200);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChatSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          hospital_id: dashboardData?.hospitals[0]?.id || null,
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am having trouble connecting to the neural core (Backend). Please check if uvicorn is running.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Render Helpers
  const renderStatCard = (label, value, icon, color, isPercentage = false) => (
    <div className="panel stat-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-wider">{label}</p>
          <h1 className="font-bold" style={{fontSize: '2rem', color: color}}>
            {value}{isPercentage && '%'}
          </h1>
        </div>
        <div style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px'}}>
          <i className={`${icon} fa-lg`} style={{color: color}}></i>
        </div>
      </div>
      <div style={{height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: 'auto'}}>
        <div style={{height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: '2px', transition: 'width 1s'}}></div>
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle text-success' : 'fa-circle-exclamation text-danger'}`}></i>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loader-overlay active">
          <div className="spinner"></div>
          <h3 className="mt-4 font-bold">Initializing CareSync AI...</h3>
          <p className="text-muted text-sm">Establishing secure uplink</p>
        </div>
      )}

      {/* Landing Page */}
      {view === 'landing' && (
        <div id="landing-page">
          <div className="text-center" style={{maxWidth: '600px'}}>
            <div style={{width: '100px', height: '100px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 50px rgba(59, 130, 246, 0.4)'}}>
              <i className="fa-solid fa-heart-pulse fa-3x text-white"></i>
            </div>
            <h1 style={{fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              CareSync <span className="text-primary">AI</span>
            </h1>
            <p className="text-muted" style={{fontSize: '1.2rem', marginBottom: '3rem'}}>
              Autonomous Supply Chain Intelligence for Critical Care
            </p>
            <button className="btn" onClick={enterDashboard} style={{fontSize: '1.1rem', padding: '16px 48px', letterSpacing: '1px'}}>
              <i className="fa-solid fa-shield-halved"></i> ENTER COMMAND CENTER
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Application */}
      {view === 'dashboard' && (
        <div id="app-root">
          <aside className="sidebar">
            <div className="brand" style={{fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <i className="fa-solid fa-heart-pulse text-primary"></i>
              <span>CareSync<span className="text-primary">AI</span></span>
            </div>
            <nav style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                <i className="fa-solid fa-chart-line"></i> Dashboard
              </div>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'var(--transition)'}}>
                <i className="fa-solid fa-boxes-stacked"></i> Inventory
              </div>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'var(--transition)'}}>
                <i className="fa-solid fa-truck-fast"></i> Logistics
              </div>
              <div className="nav-item" style={{padding: '12px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'var(--transition)'}}>
                <i className="fa-solid fa-file-waveform"></i> Reports
              </div>
            </nav>
            
            <div style={{padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)'}}>
              <div className="text-xs text-muted uppercase font-bold mb-1">System Status</div>
              <div className="flex items-center gap-2 text-sm text-success">
                <div style={{width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)'}}></div>
                Operational
              </div>
            </div>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <div>
                <h2 className="font-bold text-lg">National Operations Center</h2>
                <p className="text-muted text-xs flex items-center gap-2">
                  <span style={{width:'6px', height:'6px', background:'var(--success)', borderRadius:'50%', display:'inline-block'}}></span> 
                  Live Feed • Global Monitoring
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div style={{textAlign: 'right'}}>
                  <div className="font-bold text-sm">Dr. Sarah Chen</div>
                  <div className="text-muted text-xs">Chief Medical Officer</div>
                </div>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)', overflow: 'hidden'}}>
                   <img src="https://picsum.photos/seed/doctor/100/100" alt="User" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
              </div>
            </header>

            <div className="dashboard-grid">
              {/* Dynamic Stats */}
              {renderStatCard('Active Alerts', dashboardData?.totals?.active_alerts || 0, 'fa-bell', 'var(--danger)')}
              {renderStatCard('Monitored Sites', dashboardData?.totals?.hospitals || 0, 'fa-hospital', 'var(--primary)')}
              {renderStatCard('Critical Inventory', dashboardData?.totals?.critical_inventory_items || 0, 'fa-triangle-exclamation', 'var(--warning)')}

              {/* Interactive Map */}
              <div className="panel map-card">
                <div className="flex justify-between items-center mb-4" style={{zIndex: 10, position: 'relative', pointerEvents: 'none'}}>
                  <div>
                    <h3 className="font-bold">Geospatial Intelligence</h3>
                    <p className="text-xs text-muted">Click a node to view hospital status</p>
                  </div>
                  <div className="flex gap-3 text-xs font-bold">
                    <span className="flex items-center gap-2"><div style={{width:'8px', height:'8px', borderRadius:'50%', background:'var(--danger)'}}></div> Critical</span>
                    <span className="flex items-center gap-2"><div style={{width:'8px', height:'8px', borderRadius:'50%', background:'var(--warning)'}}></div> Warning</span>
                    <span className="flex items-center gap-2"><div style={{width:'8px', height:'8px', borderRadius:'50%', background:'var(--success)'}}></div> Stable</span>
                  </div>
                </div>
                <RadarMap 
                  hospitals={dashboardData?.hospitals || []} 
                  onSelectHospital={setSelectedHospital}
                />
              </div>

              {/* Chart Placeholder (Visuals Only for Hackathon) */}
              <div className="panel chart-card">
                <h3 className="font-bold mb-4">Demand Forecast</h3>
                <div className="canvas-container flex items-center justify-center">
                    {/* Visual Mock for Chart since backend summary gives aggregates not time-series */}
                    <div className="text-center">
                       <i className="fa-solid fa-chart-area fa-3x text-primary mb-3" style={{opacity:0.5}}></i>
                       <p className="text-xs text-muted">Predictive Analysis Module</p>
                       <p className="text-xs text-muted">Based on aggregated regional data</p>
                    </div>
                </div>
              </div>

              {/* Live Logs */}
              <div className="panel log-card">
                <h3 className="font-bold text-sm mb-2 flex justify-between">
                  <span>Agent Activity Log</span>
                  <i className="fa-solid fa-satellite-dish text-success animate-pulse"></i>
                </h3>
                <div className="log-container">
                  {dashboardData?.agent_logs?.map((log, i) => (
                    <div key={i} className="log-entry">
                      <span className="text-muted" style={{minWidth:'80px'}}>
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span style={{color: 'var(--accent)', minWidth:'120px', fontWeight:'bold', textTransform:'uppercase', fontSize:'0.75rem'}}>
                        {log.agent}
                      </span>
                      <span className="text-sm">{log.message}</span>
                    </div>
                  ))}
                  {(!dashboardData?.agent_logs || dashboardData.agent_logs.length === 0) && (
                    <div className="text-muted text-center italic mt-4">Waiting for agent telemetry...</div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Chat Interface */}
          <ChatPanel
            isOpen={chatOpen}
            onClose={() => setChatOpen(!chatOpen)}
            onSend={handleChatSend}
            messages={messages}
            isLoading={chatLoading}
          />

          {/* Modals */}
          {selectedHospital && (
            <HospitalDetailModal 
              hospital={selectedHospital} 
              onClose={() => setSelectedHospital(null)}
              onOpenOrder={setProcurementTarget}
            />
          )}

          {procurementTarget && (
            <ProcurementModal 
              hospital={procurementTarget}
              onClose={() => setProcurementTarget(null)}
              onSuccess={(msg) => showToast(msg, 'success')}
            />
          )}

        </div>
      )}
    </>
  );
}