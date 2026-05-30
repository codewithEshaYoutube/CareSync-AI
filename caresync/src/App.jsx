
import { useState, useEffect, useRef } from 'react';

// --- 1. STYLES GENERATOR ---
const createStyles = (isDarkMode) => {
  const darkVars = `
    --bg-dark: #0a0e27;
    --bg-darker: #050812;
    --bg-panel: rgba(20, 28, 50, 0.6);
    --bg-panel-solid: #1a2244;
    --bg-card: rgba(25, 35, 60, 0.5);
    --bg-sidebar: rgba(26, 34, 68, 0.8);
    --primary: #00d4ff;
    --primary-dark: #0099cc;
    --primary-glow: rgba(0, 212, 255, 0.3);
    --accent: #6366f1;
    --accent-light: #a78bfa;
    --success: #10b981;
    --success-light: #6ee7b7;
    --warning: #f59e0b;
    --danger: #ff3860;
    --danger-light: #ff6b7a;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --border: rgba(148, 163, 184, 0.12);
    --border-light: rgba(148, 163, 184, 0.2);
    --bg-input: rgba(15, 20, 40, 0.5);
  `;
  
  const lightVars = `
    --bg-dark: #f8fafc;
    --bg-darker: #ffffff;
    --bg-panel: rgba(226, 232, 240, 0.6);
    --bg-panel-solid: #f1f5f9;
    --bg-card: rgba(241, 245, 249, 0.8);
    --bg-sidebar: rgba(248, 250, 252, 0.95);
    --primary: #0084d9;
    --primary-dark: #0066a3;
    --primary-glow: rgba(0, 132, 217, 0.2);
    --accent: #7c3aed;
    --accent-light: #a78bfa;
    --success: #059669;
    --success-light: #10b981;
    --warning: #d97706;
    --danger: #dc2626;
    --danger-light: #ef4444;
    --text-main: #0f172a;
    --text-muted: #475569;
    --text-dim: #64748b;
    --border: rgba(30, 41, 59, 0.1);
    --border-light: rgba(30, 41, 59, 0.2);
    --bg-input: rgba(226, 232, 240, 0.5);
  `;

  const bgStyle = isDarkMode 
    ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)';

  const landingBg = isDarkMode
    ? 'radial-gradient(circle at 30% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0a0e27 0%, #050812 100%)'
    : 'radial-gradient(circle at 30% 50%, rgba(0, 132, 217, 0.08) 0%, transparent 50%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';

  const topbarBg = isDarkMode
    ? 'linear-gradient(90deg, rgba(26, 34, 68, 0.4) 0%, rgba(20, 28, 50, 0.2) 100%)'
    : 'linear-gradient(90deg, rgba(241, 245, 249, 0.5) 0%, rgba(226, 232, 240, 0.3) 100%)';

  const mapBg = isDarkMode
    ? 'linear-gradient(135deg, rgba(15, 20, 40, 0.8) 0%, rgba(20, 28, 50, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(226, 232, 240, 0.6) 100%)';

  const shadowValues = isDarkMode
    ? { sm: '0 2px 8px rgba(0, 0, 0, 0.3)', md: '0 8px 24px rgba(0, 0, 0, 0.4)', lg: '0 20px 48px rgba(0, 0, 0, 0.5)' }
    : { sm: '0 2px 8px rgba(0, 0, 0, 0.08)', md: '0 8px 24px rgba(0, 0, 0, 0.12)', lg: '0 20px 48px rgba(0, 0, 0, 0.15)' };

  return `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  :root {
    ${isDarkMode ? darkVars : lightVars}
    --radius: 16px;
    --radius-lg: 20px;
    --font-main: 'Sora', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --shadow-sm: ${shadowValues.sm};
    --shadow-md: ${shadowValues.md};
    --shadow-lg: ${shadowValues.lg};
  }

  * { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; min-height: 100vh; background: var(--bg-dark); color: var(--text-main); font-family: var(--font-main); transition: background-color 0.3s, color 0.3s; }

  body {
    background: ${bgStyle};
    background-attachment: fixed;
  }

  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 5px; opacity: 0.5; }
  ::-webkit-scrollbar-thumb:hover { opacity: 1; }

  @keyframes glow { 0%, 100% { box-shadow: 0 0 20px var(--primary-glow); } 50% { box-shadow: 0 0 40px var(--primary-glow); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
  @keyframes pulse-danger { 0% { box-shadow: 0 0 0 0 ${isDarkMode ? 'rgba(255, 56, 96, 0.8)' : 'rgba(220, 38, 38, 0.8)'}; } 70% { box-shadow: 0 0 0 12px ${isDarkMode ? 'rgba(255, 56, 96, 0)' : 'rgba(220, 38, 38, 0)'}; } 100% { box-shadow: 0 0 0 0 ${isDarkMode ? 'rgba(255, 56, 96, 0)' : 'rgba(220, 38, 38, 0)'}; } }
  @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }

  #app-root { display: flex; height: 100vh; width: 100vw; flex-direction: row; overflow: hidden; }
  
  .sidebar {
    width: 280px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 2rem 1.5rem;
    z-index: 20;
    backdrop-filter: blur(10px);
    overflow-y: auto;
    transition: all 0.3s;
  }

  .logo { font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo i { color: var(--primary); -webkit-text-fill-color: unset; }

  .sidebar nav { display: flex; flex-direction: column; gap: 8px; }
  .nav-item { padding: 12px 14px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.3s; color: var(--text-muted); font-weight: 500; font-size: 0.95rem; }
  .nav-item:hover { background: rgba(0, 132, 217, 0.1); color: var(--primary); transform: translateX(4px); }
  .nav-item.active { background: rgba(0, 132, 217, 0.15); color: var(--primary); border-left: 3px solid var(--primary); padding-left: 11px; }

  .theme-toggle { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(0, 132, 217, 0.05); cursor: pointer; font-size: 0.9rem; color: var(--text-muted); transition: all 0.3s; }
  .theme-toggle:hover { background: rgba(0, 132, 217, 0.12); color: var(--primary); }

  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  
  .topbar { 
    height: 70px; 
    border-bottom: 1px solid var(--border); 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 0 2rem; 
    background: ${topbarBg};
    backdrop-filter: blur(12px);
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }

  .topbar h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }

  .status-bar { display: flex; align-items: center; gap: 20px; }
  .status-indicator { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.85rem; color: var(--success-light); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); animation: glow 2s infinite; }

  .dashboard-grid {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: auto;
    gap: 2rem;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    align-content: start;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      padding: 1.5rem;
      gap: 1.5rem;
    }
    .sidebar { width: 250px; padding: 1.5rem 1rem; }
  }

  @media (max-width: 768px) {
    #app-root { flex-direction: column; }
    .sidebar { width: 100%; height: auto; padding: 1rem; max-height: 30vh; overflow-y: auto; }
    .main-content { flex: 1; }
    .dashboard-grid { grid-template-columns: 1fr; padding: 1rem; gap: 1rem; }
    .topbar { padding: 0 1rem; height: 60px; }
    .topbar h2 { font-size: 1.2rem; }
  }

  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(16px);
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: slide-in 0.5s ease-out forwards;
  }

  .panel:hover {
    border-color: var(--border-light);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 132, 217, 0.3), transparent);
  }
  
  .map-card { grid-column: 1 / -1; min-height: 450px; max-height: 600px; }
  .analysis-card { grid-column: 1 / -1; }
  .stats-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }

  .badge { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; transition: all 0.2s; }
  .badge.critical { background: rgba(255, 56, 96, 0.15); color: var(--danger-light); border: 1px solid rgba(255, 56, 96, 0.3); }
  .badge.warning { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
  .badge.stable { background: rgba(16, 185, 129, 0.15); color: var(--success-light); border: 1px solid rgba(16, 185, 129, 0.3); }
  
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot.critical { background: var(--danger); animation: pulse-danger 2s infinite; }
  .dot.warning { background: var(--warning); }
  .dot.stable { background: var(--success); animation: glow 2s infinite; }

  .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-top: 1rem; }
  .resource-item {
    background: linear-gradient(135deg, rgba(0, 132, 217, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
  }
  .resource-item:hover {
    background: linear-gradient(135deg, rgba(0, 132, 217, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%);
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  .res-icon { font-size: 1.4rem; margin-bottom: 8px; color: var(--primary); }
  .res-val { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; }
  .res-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: ${mapBg};
  }

  .hospital-marker {
    position: absolute;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hospital-marker:hover {
    transform: scale(1.2);
  }

  .marker-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid ${isDarkMode ? 'white' : 'var(--text-main)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: white;
    font-weight: 700;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .marker-dot.critical {
    background: linear-gradient(135deg, var(--danger), var(--danger-light));
    animation: pulse-danger 1.5s infinite;
  }

  .marker-dot.warning {
    background: linear-gradient(135deg, var(--warning), #ffb700);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
  }

  .marker-dot.stable {
    background: linear-gradient(135deg, var(--success), var(--success-light));
  }

  .hospital-tooltip {
    position: absolute;
    background: var(--bg-panel-solid);
    border: 1px solid var(--border-light);
    border-radius: 10px;
    padding: 12px;
    font-size: 0.85rem;
    z-index: 100;
    pointer-events: none;
    white-space: nowrap;
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
  }

  .forecast-chart { height: 220px; width: 100%; position: relative; margin-top: 1rem; background: var(--bg-input); border-radius: 12px; border: 1px solid var(--border); }

  .stat-card {
    background: linear-gradient(135deg, var(--bg-card) 0%, ${isDarkMode ? 'rgba(25, 35, 60, 0.3)' : 'rgba(226, 232, 240, 0.4)'} 100%);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s;
  }

  .stat-card:hover {
    border-color: var(--primary);
    box-shadow: 0 0 20px rgba(0, 132, 217, 0.15);
    transform: translateY(-2px);
  }

  .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-size: 1.8rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--accent-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
  .stat-change { font-size: 0.8rem; color: var(--success-light); display: flex; align-items: center; gap: 4px; }
  .stat-change.down { color: var(--danger-light); }

  .modal-overlay { position: fixed; inset: 0; background: ${isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'}; backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.3s; padding: 20px; overflow-y: auto; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg-panel-solid); border: 1px solid var(--border-light); width: 100%; max-width: 900px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); transition: 0.3s; box-shadow: var(--shadow-lg); }
  .modal-overlay.open .modal { transform: scale(1); }
  .modal-header { padding: 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: ${isDarkMode ? 'linear-gradient(90deg, rgba(0,0,0,0.2), transparent)' : 'linear-gradient(90deg, rgba(0,0,0,0.05), transparent)'}; }
  .modal-body { padding: 2rem; overflow-y: auto; flex: 1; max-height: calc(90vh - 200px); }
  .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: ${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)'}; }

  .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; box-shadow: var(--shadow-lg); z-index: 50; cursor: pointer; transition: all 0.3s; border: 2px solid rgba(0, 132, 217, 0.3); }
  .ai-fab:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(0, 132, 217, 0.4); }
  .ai-panel { position: fixed; bottom: 100px; right: 30px; width: 420px; height: 620px; background: var(--bg-panel-solid); border: 1px solid var(--border-light); border-radius: 20px; display: flex; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 50; box-shadow: var(--shadow-lg); }
  .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .msg { max-width: 85%; padding: 12px 16px; border-radius: 12px; margin-bottom: 12px; font-size: 0.9rem; white-space: pre-wrap; line-height: 1.4; }
  .msg.ai { background: var(--bg-input); color: var(--text-main); align-self: flex-start; border: 1px solid var(--border-light); border-bottom-left-radius: 4px; }
  .msg.user { background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(0, 132, 217, 0.3); }

  #landing-page { position: absolute; inset: 0; background: ${landingBg}; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; transition: opacity 0.8s; }
  .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); box-shadow: 0 0 20px var(--primary); animation: scan 3s linear infinite; opacity: 0.5; }
  
  .btn { background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; font-size: 0.95rem; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 132, 217, 0.3); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
  .btn-ghost:hover { background: rgba(0, 132, 217, 0.05); color: var(--primary); border-color: var(--primary); }

  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .w-full { width: 100%; }
  .mt-4 { margin-top: 1rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-4 { margin-bottom: 1rem; }
  .font-bold { font-weight: 700; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-muted { color: var(--text-muted); }
  .text-dim { color: var(--text-dim); }
  .text-primary { color: var(--primary); }
  .text-danger { color: var(--danger); }
  .bg-transparent { background: transparent; }
`;
};

// --- 2. MOCK DATA ---
const DEMO_HOSPITALS = [
  {
    id: 'ca-cedars', name: 'Cedars-Sinai Medical', region: 'Los Angeles', 
    position: { x: 0.32, y: 0.62 }, status: 'warning',
    occupancy: 78,
    efficiency: 92,
    lastUpdate: '2 mins ago',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 45, total: 50, unit: 'units', threshold: 10, type: 'bed', trend: 'up' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 120, total: 200, unit: 'tanks', threshold: 50, type: 'gas', trend: 'down' },
      { id: 'r3', name: 'Ventilators', current: 28, total: 30, unit: 'machines', threshold: 5, type: 'machine', trend: 'stable' },
      { id: 'r4', name: 'Pacemakers', current: 15, total: 20, unit: 'units', threshold: 5, type: 'device', trend: 'up' }
    ],
    forecast: { 
      trend: 'increasing', 
      nextMonthDemand: { 'Oxygen Cylinders': 250, 'Pacemakers': 5 },
      projectedDeficit: { 'Oxygen Cylinders': 130 },
      confidence: 94
    }
  },
  {
    id: 'ca-ucsf', name: 'UCSF Medical Center', region: 'San Francisco', 
    position: { x: 0.18, y: 0.38 }, status: 'critical',
    occupancy: 95,
    efficiency: 76,
    lastUpdate: '1 min ago',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 5, total: 60, unit: 'units', threshold: 10, type: 'bed', trend: 'down' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 80, total: 150, unit: 'tanks', threshold: 40, type: 'gas', trend: 'down' },
      { id: 'r3', name: 'BP Monitors', current: 12, total: 100, unit: 'machines', threshold: 20, type: 'machine', trend: 'up' },
      { id: 'r4', name: 'Dialysis Machines', current: 2, total: 15, unit: 'machines', threshold: 5, type: 'machine', trend: 'down' }
    ],
    forecast: {
      trend: 'surge',
      nextMonthDemand: { 'ICU Beds': 80, 'Dialysis Machines': 10 },
      projectedDeficit: { 'ICU Beds': 75, 'Dialysis Machines': 8 },
      confidence: 98
    }
  },
  {
    id: 'ca-stanford', name: 'Stanford Hospital', region: 'Palo Alto', 
    position: { x: 0.28, y: 0.43 }, status: 'stable',
    occupancy: 62,
    efficiency: 98,
    lastUpdate: '3 mins ago',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 55, total: 60, unit: 'units', threshold: 10, type: 'bed', trend: 'stable' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 300, total: 300, unit: 'tanks', threshold: 50, type: 'gas', trend: 'stable' },
      { id: 'r3', name: 'MRI Machines', current: 3, total: 3, unit: 'machines', threshold: 1, type: 'machine', trend: 'stable' }
    ],
    forecast: {
      trend: 'stable',
      nextMonthDemand: {},
      projectedDeficit: {},
      confidence: 87
    }
  },
  {
    id: 'ca-kaiser', name: 'Kaiser Permanente', region: 'San Diego', 
    position: { x: 0.35, y: 0.8 }, status: 'stable',
    occupancy: 71,
    efficiency: 95,
    lastUpdate: '4 mins ago',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 42, total: 50, unit: 'units', threshold: 10, type: 'bed', trend: 'stable' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 180, total: 200, unit: 'tanks', threshold: 50, type: 'gas', trend: 'up' }
    ],
    forecast: {
      trend: 'stable',
      nextMonthDemand: {},
      projectedDeficit: {},
      confidence: 89
    }
  }
];

// --- 3. COMPONENTS ---

const CaliforniaMap = ({ hospitals, selectedHospital, onHospitalSelect }) => {
  const canvasRef = useRef(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw simplified CA outline
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 80);
    ctx.lineTo(120, 100);
    ctx.lineTo(150, 150);
    ctx.lineTo(160, 250);
    ctx.lineTo(170, 350);
    ctx.lineTo(160, 450);
    ctx.lineTo(140, 500);
    ctx.lineTo(80, 480);
    ctx.lineTo(40, 400);
    ctx.lineTo(30, 300);
    ctx.lineTo(25, 200);
    ctx.lineTo(35, 120);
    ctx.closePath();
    ctx.stroke();

    // Add background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.02)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hospitals.forEach((h) => {
      const markerX = h.position.x * rect.width;
      const markerY = h.position.y * rect.height;
      const distance = Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2);
      if (distance < 30) {
        onHospitalSelect(h);
      }
    });
  };

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ width: '100%', height: '100%', display: 'block' }} />
      {hospitals.map((h) => (
        <div
          key={h.id}
          className="hospital-marker"
          style={{
            left: `${h.position.x * 100}%`,
            top: `${h.position.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={() => setHoveredMarker(h.id)}
          onMouseLeave={() => setHoveredMarker(null)}
          onClick={() => onHospitalSelect(h)}
        >
          <div className={`marker-dot ${h.status}`}>
            <i className="fa-solid fa-hospital"></i>
          </div>
          {hoveredMarker === h.id && (
            <div className="hospital-tooltip">
              <strong>{h.name}</strong>
              <br />
              <small>{h.region}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ForecastCanvas = ({ forecastData }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement || document.body;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = parent.clientWidth;
    const h = canvas.height = parent.clientHeight;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    ctx.beginPath(); ctx.moveTo(40, h-30); ctx.lineTo(w, h-30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(40, h-30); ctx.stroke();
    
    // Draw Lines
    const drawLine = (dataPoints, color, dashed = false) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      if(dashed) ctx.setLineDash([5, 5]);
      dataPoints.forEach((val, i) => {
        const x = 40 + (i * (w - 60) / (dataPoints.length - 1));
        const y = (h - 30) - (val / 400) * (h - 60);
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    const supplyTrend = Array.from({length: 10}, (_, i) => (forecastData?.current || 100) + (Math.random()*30 - 15));
    const demandTrend = Array.from({length: 10}, (_, i) => (forecastData?.current || 100) * 0.7 + (i * 20) + (Math.random()*15));
    
    drawLine(supplyTrend, 'rgba(0, 212, 255, 0.8)');
    drawLine(demandTrend, 'rgba(255, 56, 96, 0.6)', true);
    
    // Legend
    ctx.font = 'bold 12px Sora';
    ctx.fillStyle = 'rgba(0, 212, 255, 0.8)'; ctx.fillText('Current Supply', 50, 25);
    ctx.fillStyle = 'rgba(255, 56, 96, 0.6)'; ctx.fillText('Projected Demand', 180, 25);
    
  }, [forecastData]);
  
  return <canvas ref={canvasRef} className="forecast-chart" />;
};

const ResourceCard = ({ item }) => {
  const isCritical = item.current < item.threshold;
  const isMild = item.current < item.threshold * 2;
  
  let statusClass = 'stable';
  if (isCritical) statusClass = 'critical';
  else if (isMild) statusClass = 'warning';

  const getIcon = (type) => {
    if (type === 'bed') return 'fa-bed-pulse';
    if (type === 'gas') return 'fa-wind';
    if (type === 'device') return 'fa-heart-pulse';
    return 'fa-microchip';
  };

  const percentUsed = Math.round((item.current / item.total) * 100);

  return (
    <div className="resource-item">
      <div className="res-icon">
        <i className={`fa-solid ${getIcon(item.type)}`}></i>
      </div>
      <div className="res-val">{item.current}<span style={{fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'500'}}>/{item.total}</span></div>
      <div className="res-label">{item.name}</div>
      <div style={{marginTop:'8px', width:'100%', height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', overflow:'hidden'}}>
        <div style={{height:'100%', width:`${percentUsed}%`, background:isCritical?'var(--danger)':isMild?'var(--warning)':'var(--success)', borderRadius:'2px'}}></div>
      </div>
      <span className={`badge ${statusClass}`} style={{marginTop: '8px', fontSize: '0.6rem'}}>
        {statusClass.toUpperCase()}
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
            <h2 className="font-bold" style={{fontSize:'1.5rem', marginBottom:'4px'}}>{hospital.name}</h2>
            <p className="text-sm text-muted">{hospital.region} • Last Updated: {hospital.lastUpdate}</p>
          </div>
          <button className="btn-ghost" onClick={onClose}><i className="fa-solid fa-xmark fa-lg"></i></button>
        </div>
        
        <div className="flex border-b border-white/10 px-6 gap-0">
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === 'inventory' ? 'text-primary border-primary' : 'text-muted border-transparent'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <i className="fa-solid fa-boxes-stacked mr-2"></i>Live Inventory
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === 'forecast' ? 'text-primary border-primary' : 'text-muted border-transparent'}`}
            onClick={() => setActiveTab('forecast')}
          >
            <i className="fa-solid fa-brain mr-2"></i>AI Forecasting
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === 'analytics' ? 'text-primary border-primary' : 'text-muted border-transparent'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fa-solid fa-chart-line mr-2"></i>Analytics
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'inventory' ? (
            <div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <h3 className="font-bold text-lg">Operational Assets</h3>
                <span className={`badge ${hospital.status}`}>
                  <div className={`dot ${hospital.status}`}></div> {hospital.status.toUpperCase()}
                </span>
              </div>
              <div className="resource-grid">
                {hospital.inventory.map((item, i) => <ResourceCard key={i} item={item} />)}
              </div>
            </div>
          ) : activeTab === 'forecast' ? (
            <div>
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg mb-4">
                <h4 className="text-primary font-bold mb-1"><i className="fa-solid fa-brain mr-2"></i>AI Predictive Analysis</h4>
                <p className="text-xs text-muted">Based on 30-day consumption trends and regional outbreak data. Confidence: {hospital.forecast.confidence}%</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Projected Deficit (Next 30 Days)</h4>
                {Object.keys(hospital.forecast.projectedDeficit).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(hospital.forecast.projectedDeficit).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <span className="font-medium text-sm">{key}</span>
                        <span className="text-danger font-bold">-{val} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-success"><i className="fa-solid fa-check mr-2"></i>No significant deficits projected.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm mb-3">Trend Visualization</h4>
                <ForecastCanvas forecastData={hospital.inventory[0]} />
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="stat-card">
                  <div className="stat-label">Occupancy Rate</div>
                  <div className="stat-value">{hospital.occupancy}%</div>
                  <div className={hospital.occupancy > 80 ? 'stat-change down' : 'stat-change'}><i className={`fa-solid fa-arrow-trend-${hospital.occupancy > 80 ? 'up' : 'down'}`}></i> {hospital.occupancy > 80 ? 'High' : 'Normal'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Operational Efficiency</div>
                  <div className="stat-value">{hospital.efficiency}%</div>
                  <div className="stat-change"><i className="fa-solid fa-arrow-trend-up"></i> Excellent</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-sm mb-3">Resource Utilization</h4>
                <div className="space-y-3">
                  {hospital.inventory.map((item) => {
                    const usage = (item.current / item.total) * 100;
                    return (
                      <div key={item.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-muted">{Math.round(usage)}%</span>
                        </div>
                        <div style={{width:'100%', height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px', overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${usage}%`, background:`linear-gradient(90deg, var(--primary), var(--accent))`, borderRadius:'3px'}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Close</button>
          <button className="btn" onClick={() => onProcure(hospital)}>
            <i className="fa-solid fa-cart-plus"></i> Procure Now
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ isOpen, onClose, onSend, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const submit = (e) => {
    e.preventDefault();
    if(!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <>
      <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
        <div className="modal-header" style={{padding: '1.2rem'}}>
          <span className="font-bold text-primary"><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>CareSync AI Agent</span>
          <button onClick={onClose} className="btn-ghost"><i className="fa-solid fa-chevron-down"></i></button>
        </div>
        <div className="modal-body flex flex-col" style={{padding:'0'}}>
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap:'10px', padding:'1.5rem 1.2rem'}}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
            ))}
            {isLoading && <div className="msg ai"><i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing...</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="modal-footer">
          <form onSubmit={submit} className="flex gap-2 w-full">
            <input className="w-full bg-black/30 border border-white/10 text-white px-3 py-2 rounded text-sm focus:border-primary" placeholder="Ask about inventory..." value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit" className="btn px-3"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      <div className="ai-fab" onClick={() => onClose()}><i className="fa-solid fa-wand-magic-sparkles"></i></div>
    </>
  );
};

// --- 4. MAIN APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // State
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [procurementTarget, setProcurementTarget] = useState(null);
  
  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{role: 'assistant', content: '👋 Hello! I\'m CareSync AI. I monitor the California hospital network in real-time. Ask me about inventory levels, forecasts, or critical alerts.'}]);
  const [chatLoading, setChatLoading] = useState(false);

  // Initialize Styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerText = createStyles(isDarkMode);
    document.head.appendChild(style);
    return () => style.remove();
  }, [isDarkMode]);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('caresync-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Load Data (Demo Mode)
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setHospitals(DEMO_HOSPITALS);
      setLoading(false);
      setView('dashboard');
    }, 2000);
  };

  // Keyboard shortcut: Enter to initialize from landing
  useEffect(() => {
    if (view !== 'landing') return;
    const onKey = (e) => { if (e.key === 'Enter') loadData(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  // Calculate Network Stats
  const getNetworkStats = () => {
    if (hospitals.length === 0) return { critical: 0, warning: 0, stable: 0, total: 0, avgOccupancy: 0 };
    
    const stats = {
      critical: hospitals.filter(h => h.status === 'critical').length,
      warning: hospitals.filter(h => h.status === 'warning').length,
      stable: hospitals.filter(h => h.status === 'stable').length,
      total: hospitals.length,
      avgOccupancy: Math.round(hospitals.reduce((a, h) => a + h.occupancy, 0) / hospitals.length)
    };
    return stats;
  };

  // Enhanced Chat Logic
  const handleChat = async (text) => {
    setMessages(p => [...p, {role: 'user', content: text}]);
    setChatLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    let response = "";
    const lowerText = text.toLowerCase();

    if (lowerText.includes('status') || lowerText.includes('summary')) {
      const stats = getNetworkStats();
      response = `📊 Network Status: ${stats.stable} stable, ${stats.warning} warning, ${stats.critical} critical. Average occupancy: ${stats.avgOccupancy}%. All hospitals are operational.`;
    } else if (lowerText.includes('pacemaker')) {
      const stanford = hospitals.find(h => h.id === 'ca-stanford');
      const pacs = stanford?.inventory.find(i => i.name === 'Pacemakers');
      response = pacs ? `Stanford Hospital: ${pacs.current}/${pacs.total} Pacemakers available. Status: ${pacs.current < pacs.threshold ? '🔴 CRITICAL' : '✅ NORMAL'}.` : "No pacemaker data found.";
    } else if (lowerText.includes('oxygen')) {
      const cedars = hospitals.find(h => h.id === 'ca-cedars');
      const oxy = cedars?.inventory.find(i => i.name === 'Oxygen Cylinders');
      response = oxy ? `Cedars-Sinai: ${oxy.current}/${oxy.total} oxygen tanks. ⚠️ Forecast warns of ${cedars.forecast.projectedDeficit['Oxygen Cylinders']} unit deficit next month. Recommend immediate procurement.` : "No data.";
    } else if (lowerText.includes('ucsf') || lowerText.includes('critical')) {
      const ucsf = hospitals.find(h => h.id === 'ca-ucsf');
      response = ucsf ? `🚨 UCSF Medical Center CRITICAL: Only ${ucsf.inventory[0].current}/${ucsf.inventory[0].total} ICU beds available. Occupancy: ${ucsf.occupancy}%. Immediate action required.` : "No data.";
    } else {
      response = "I can help with: Network status, Hospital details (Cedars, UCSF, Stanford, Kaiser), Resource levels (Beds, Oxygen, Pacemakers), and Forecasts. What would you like to know?";
    }

    setMessages(p => [...p, {role: 'assistant', content: response}]);
    setChatLoading(false);
  };

  const stats = getNetworkStats();

  return (
    <>
      {loading && (
        <div style={{position:'fixed', inset:0, background:'var(--bg-dark)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div style={{width:'60px', height:'60px', border:'3px solid rgba(0, 132, 217, 0.2)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
          <h3 className="mt-6 font-bold text-primary">Initializing CareSync Network...</h3>
          <p className="text-muted text-sm mt-2">Connecting to 4 facilities</p>
        </div>
      )}

      {view === 'landing' && (
        <div id="landing-page">
          <div className="scan-line" style={{opacity:0.25}}></div>
          <div style={{textAlign:'center', zIndex:10, maxWidth:'680px', padding:'0 20px'}}>
            <h1 className="font-bold" style={{fontSize:'3.6rem', marginBottom:'0.5rem', background:'linear-gradient(135deg, #0084d9, #a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:'1.05'}}>
              CareSync AI
            </h1>
            <h2 className="text-primary" style={{marginBottom:'1rem', fontSize:'1.1rem', fontWeight:600}}>Command Center — National Operations</h2>
            <p className="text-muted mb-6 text-lg">Autonomous hospital operations, predictive logistics, and real-time alerts for critical care.</p>

            <div style={{display:'flex', justifyContent:'center', gap:12, marginBottom:'1.25rem', flexWrap:'wrap'}}>
              <button className="btn" onClick={loadData} style={{padding:'14px 44px', fontSize:'1.05rem', borderRadius:'12px'}}>
                <i className="fa-solid fa-shield-halved"></i> Enter Command Center
              </button>
              <button className="btn btn-ghost" onClick={() => { setIsDarkMode(!isDarkMode); }} style={{padding:'12px 22px'}}>
                <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i> Toggle Theme
              </button>
            </div>

            <div style={{display:'flex', justifyContent:'center', gap:24, color:'var(--text-dim)', fontSize:'0.9rem'}}>
              <div><i className="fa-solid fa-wifi text-primary" style={{marginRight:8}}></i> Live Telemetry</div>
              <div><i className="fa-solid fa-truck-fast text-primary" style={{marginRight:8}}></i> Predictive Logistics</div>
              <div><i className="fa-solid fa-shield-halved text-primary" style={{marginRight:8}}></i> Risk Insights</div>
            </div>
            <p className="text-xs text-dim mt-6">Tip: Press <strong>Enter</strong> to quickly open the Command Center.</p>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div id="app-root">
          <aside className="sidebar">
            <div className="logo">
              <i className="fa-solid fa-heart-pulse fa-lg"></i>
              <span>CareSync</span>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
                { id: 'facilities', label: 'Facilities', icon: 'fa-hospital' },
                { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
                { id: 'alerts', label: 'Alerts', icon: 'fa-bell' }
              ].map(item => (
                <div
                  key={item.id}
                  className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.label}
                </div>
              ))}
            </nav>
            
            <div style={{marginTop:'auto', paddingTop:'1.5rem', borderTop:'1px solid var(--border)'}}>
              <p className="text-xs text-muted font-bold mb-3">NETWORK STATUS</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Facilities</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Stable</span>
                  <span className="font-bold text-green-400">{stats.stable}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Warning</span>
                  <span className="font-bold text-yellow-400">{stats.warning}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</span>
                  <span className="font-bold text-red-400">{stats.critical}</span>
                </div>
              </div>

              <div className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <h2 className="font-bold">California Operations Center</h2>
              <div className="status-bar">
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  LIVE NETWORK
                </div>
                <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', cursor:'pointer'}}>
                  <i className="fa-solid fa-user"></i>
                </div>
              </div>
            </header>

            <div className="dashboard-grid">
              {/* Map Card */}
              <div className="panel map-card">
                <div style={{marginBottom:'1rem'}}>
                  <h3 className="font-bold text-lg mb-1">California Hospital Network</h3>
                  <p className="text-sm text-muted">Real-time facility monitoring and status</p>
                </div>
                <CaliforniaMap hospitals={hospitals} selectedHospital={selectedHospital} onHospitalSelect={setSelectedHospital} />
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label"><i className="fa-solid fa-hospital mr-2"></i>Total Facilities</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-change"><i className="fa-solid fa-check-circle"></i> All operational</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label"><i className="fa-solid fa-percentage mr-2"></i>Avg Occupancy</div>
                  <div className="stat-value">{stats.avgOccupancy}%</div>
                  <div className={stats.avgOccupancy > 80 ? "stat-change down" : "stat-change"}><i className={`fa-solid fa-arrow-trend-${stats.avgOccupancy > 80 ? 'up' : 'down'}`}></i> {stats.avgOccupancy > 80 ? 'High demand' : 'Optimal'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label"><i className="fa-solid fa-triangle-exclamation mr-2"></i>Critical Items</div>
                  <div className="stat-value" style={{color: stats.critical > 0 ? 'var(--danger)' : 'var(--success)'}}>{hospitals.reduce((count, h) => count + h.inventory.filter(i => i.current < i.threshold).length, 0)}</div>
                  <div className={stats.critical > 0 ? "stat-change down" : "stat-change"}><i className={`fa-solid fa-${stats.critical > 0 ? 'exclamation' : 'check'}-circle`}></i> {stats.critical > 0 ? 'Immediate action' : 'No issues'}</div>
                </div>
              </div>

              {/* Hospital Cards */}
              <div style={{gridColumn:'1 / -1'}}>
                <h3 className="font-bold text-lg mb-4" style={{paddingLeft:'0.5rem'}}>Facility Overview</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem'}}>
                  {hospitals.map(h => (
                    <div 
                      key={h.id} 
                      className="panel" 
                      onClick={() => setSelectedHospital(h)} 
                      style={{cursor:'pointer', position:'relative'}}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold">{h.name}</h4>
                          <p className="text-xs text-muted">{h.region}</p>
                        </div>
                        <span className={`badge ${h.status}`}>
                          <div className={`dot ${h.status}`}></div>
                        </span>
                      </div>
                      
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border)'}}>
                        <div>
                          <p className="text-xs text-muted mb-1">Occupancy</p>
                          <p className="text-lg font-bold text-primary">{h.occupancy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Efficiency</p>
                          <p className="text-lg font-bold text-success">{h.efficiency}%</p>
                        </div>
                      </div>

                      <p className="text-xs text-dim">
                        <i className="fa-solid fa-circle-check text-primary mr-1"></i>
                        {h.inventory.filter(i => i.current >= i.threshold).length}/{h.inventory.length} resources normal
                      </p>
                      <div className="text-xs text-primary font-mono mt-3">View Details →</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Analytics */}
              <div className="panel analysis-card">
                <h3 className="font-bold text-lg mb-4 border-b border-white/10 pb-3">
                  <i className="fa-solid fa-brain mr-2 text-primary"></i>
                  AI Predictive Analytics (Next 30 Days)
                </h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1.5rem'}}>
                  {hospitals.map(h => (
                    <div key={h.id} className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-primary/30 transition-all">
                      <div className="flex justify-between mb-3">
                        <span className="font-bold text-sm">{h.name}</span>
                        <i className={`fa-solid fa-arrow-trend-${h.forecast.trend === 'increasing' ? 'up text-warning' : (h.forecast.trend === 'surge' ? 'up text-danger' : 'right text-success')}`}></i>
                      </div>
                      <div className="text-xs mb-3 p-2 bg-white/5 rounded border border-white/10">
                        <span className="text-muted">Confidence: </span>
                        <span className="font-bold text-primary">{h.forecast.confidence}%</span>
                      </div>
                      {Object.keys(h.forecast.projectedDeficit).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(h.forecast.projectedDeficit).map(([k,v]) => (
                            <div key={k} className="text-xs flex justify-between items-center">
                              <span className="text-muted">{k}:</span>
                              <span className="text-danger font-bold">-{v} units</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-success"><i className="fa-solid fa-check mr-1"></i> Stable forecast</div>
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
              <div className="modal" style={{maxWidth:'450px'}} onClick={e=>e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="font-bold flex items-center gap-2"><i className="fa-solid fa-cart-plus"></i>Create Procurement Order</h3>
                  <button onClick={() => setProcurementTarget(null)} className="btn-ghost"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="modal-body">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                    <p className="text-sm"><strong>Facility:</strong> {procurementTarget.name}</p>
                  </div>
                  <p className="text-sm text-muted mb-6">Initiating smart procurement workflow. The system will automatically identify critical shortages and suggest optimal suppliers.</p>
                  <button className="btn w-full justify-center" onClick={() => {alert('✅ Procurement order submitted!\n\nOrder ID: ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()); setProcurementTarget(null)}}>
                    <i className="fa-solid fa-check"></i> Confirm Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
