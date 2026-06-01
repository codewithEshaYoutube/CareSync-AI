import { useState, useEffect, useRef } from 'react';

// --- 1. COMPLETE STYLES GENERATOR ---
const createStyles = (isDarkMode) => {
  const darkVars = `
    --bg-dark: #0a0e27;
    --bg-darker: #050812;
    --bg-panel: rgba(20, 28, 50, 0.6);
    --bg-panel-solid: #1a2244;
    --bg-card: rgba(25, 35, 60, 0.5);
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
    ? 'rgba(10, 14, 39, 0.85)'
    : 'rgba(255, 255, 255, 0.85)';

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
    --header-height: 80px;
  }

  * { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: var(--bg-dark); color: var(--text-main); font-family: var(--font-main); transition: background-color 0.3s, color 0.3s; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  body {
    background: ${bgStyle};
    background-attachment: absolute;
  }

  h1, h2, h3, h4, h5, h6 { margin: 0; font-weight: 700; letter-spacing: -0.5px; }
  p { margin: 0; }
  a { text-decoration: none; color: inherit; transition: color 0.2s; }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; opacity: 0.6; }
  ::-webkit-scrollbar-thumb:hover { opacity: 0.9; background: var(--accent); }

  @keyframes glow { 
    0%, 100% { box-shadow: 0 0 20px var(--primary-glow); } 
    50% { box-shadow: 0 0 40px var(--primary-glow); } 
  }
  @keyframes float { 
    0%, 100% { transform: translateY(0px); } 
    50% { transform: translateY(-8px); } 
  }
  @keyframes pulse-danger { 
    0% { box-shadow: 0 0 0 0 ${isDarkMode ? 'rgba(255, 56, 96, 0.8)' : 'rgba(220, 38, 38, 0.8)'}; } 
    70% { box-shadow: 0 0 0 12px ${isDarkMode ? 'rgba(255, 56, 96, 0)' : 'rgba(220, 38, 38, 0)'}; } 
    100% { box-shadow: 0 0 0 0 ${isDarkMode ? 'rgba(255, 56, 96, 0)' : 'rgba(220, 38, 38, 0)'}; } 
  }
  @keyframes slide-in { 
    from { opacity: 0; transform: translateY(20px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes scan { 
    0% { transform: translateY(-100%); } 
    100% { transform: translateY(100vh); } 
  }
  @keyframes spin { 
    100% { transform: rotate(360deg); } 
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  /* --- LAYOUT --- */
  #app-root { 
    display: flex; 
    flex-direction: column; 
    min-height: 100vh; 
    width: 100%; 
  }

  .top-navbar {
    position: sticky;
    top: 0;
    width: 100%;
    height: var(--header-height);
    background: ${topbarBg};
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    box-shadow: var(--shadow-sm);
    gap: 12px;
    position: relative;
  }

  .nav-left { display: flex; align-items: center; gap: 1rem; z-index: 20; flex: 0 0 auto; }

  .nav-center { display: flex; align-items: center; justify-content: center; gap: 6px; flex: 1; z-index: 10; }
  
  .logo { font-size: 1.35rem; font-weight: 700; display: flex; align-items: center; gap: 10px; margin: 0; padding: 6px 10px; border-radius: 10px; background: var(--bg-panel-solid); color: var(--primary); letter-spacing: -0.5px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); white-space: nowrap; }
  .logo i { color: var(--primary); margin-right: 6px; }

  .nav-menu { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; scroll-behavior: smooth; }
  
  .nav-item { 
    padding: 8px 12px; 
    border-radius: 8px; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    transition: all 0.3s; 
    color: var(--text-muted); 
    font-weight: 500; 
    font-size: 0.9rem;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    flex: 0 0 auto;
  }
  .nav-item:hover { 
    background: rgba(0, 132, 217, 0.08); 
    color: var(--primary); 
  }
  .nav-item.active { 
    background: rgba(0, 132, 217, 0.12); 
    color: var(--primary); 
    border-bottom: 2px solid var(--primary); 
    font-weight: 600;
  }

  .nav-right { display: flex; align-items: center; gap: 12px; z-index: 20; flex: 0 0 auto; }
  
  .status-indicator { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.22); border-radius: 6px; font-size: 0.75rem; color: var(--success-light); min-width: 60px; justify-content: center; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: glow 2s infinite; }

  .theme-toggle-nav { 
    padding: 8px; 
    border-radius: 8px; 
    background: rgba(0, 132, 217, 0.05); 
    color: var(--text-muted); 
    cursor: pointer; 
    transition: all 0.2s;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
  }
  .theme-toggle-nav:hover { background: rgba(0, 132, 217, 0.15); color: var(--primary); }
  
  .user-avatar { 
    width: 40px; height: 40px; 
    border-radius: 50%; 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1rem; 
    cursor: pointer;
  }

  .main-content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    overflow-y: auto; 
    overflow-x: hidden;
    width: 100%;
    background: transparent;
  }

  .content-wrapper {
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: auto;
    gap: 2rem;
    align-content: start;
  }

  .page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-auto-rows: auto;
    gap: 2rem;
    align-content: start;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: var(--bg-panel);
  }

  .table-container table {
    width: 100%;
    border-collapse: collapse;
  }

  .table-container th {
    background: linear-gradient(90deg, rgba(0, 132, 217, 0.12), rgba(99, 102, 241, 0.12));
    padding: 1.2rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--primary);
    border-bottom: 2px solid var(--border-light);
    white-space: nowrap;
  }

  .table-container td {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .table-container tr:hover {
    background: rgba(0, 132, 217, 0.08);
  }

  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    backdrop-filter: blur(16px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: slide-in 0.5s ease-out forwards;
  }

  .panel:hover {
    border-color: var(--border-light);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
    transform: translateY(-4px);
  }

  .panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 132, 217, 0.4), transparent);
    opacity: 0.8;
  }
  
  .map-card { grid-column: 1 / -1; min-height: 450px; max-height: 600px; }
  .analysis-card { grid-column: 1 / -1; }
  .stats-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }

  .badge { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .badge.critical { 
    background: rgba(255, 56, 96, 0.15); 
    color: var(--danger-light); 
    border: 1px solid rgba(255, 56, 96, 0.3); 
    box-shadow: 0 0 12px rgba(255, 56, 96, 0.15);
  }
  .badge.warning { 
    background: rgba(245, 158, 11, 0.15); 
    color: #fcd34d; 
    border: 1px solid rgba(245, 158, 11, 0.3);
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
  }
  .badge.stable { 
    background: rgba(16, 185, 129, 0.15); 
    color: var(--success-light); 
    border: 1px solid rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
  }
  
  .dot { 
    width: 8px; 
    height: 8px; 
    border-radius: 50%; 
    box-shadow: inset 0 -1px 3px rgba(0,0,0,0.2);
  }
  .dot.critical { 
    background: var(--danger); 
    animation: pulse-danger 2s infinite;
    box-shadow: 0 0 8px rgba(255, 56, 96, 0.6), inset 0 -1px 3px rgba(0,0,0,0.2);
  }
  .dot.warning { 
    background: var(--warning);
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.5), inset 0 -1px 3px rgba(0,0,0,0.2);
  }
  .dot.stable { 
    background: var(--success); 
    animation: glow 2s infinite;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4), inset 0 -1px 3px rgba(0,0,0,0.1);
  }

  .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-top: 1rem; }
  .resource-item {
    background: linear-gradient(135deg, rgba(0, 132, 217, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    text-align: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .resource-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s;
    pointer-events: none;
  }

  .resource-item:hover {
    background: linear-gradient(135deg, rgba(0, 132, 217, 0.16) 0%, rgba(124, 58, 237, 0.16) 100%);
    border-color: var(--primary);
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 132, 217, 0.2);
  }

  .resource-item:hover::before {
    transform: translateX(100%);
  }

  .res-icon { font-size: 1.6rem; margin-bottom: 10px; color: var(--primary); display: inline-block; }
  .res-val { font-weight: 700; font-size: 1.2rem; margin-bottom: 6px; }
  .res-label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; }

  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: ${mapBg};
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .hospital-marker {
    position: absolute;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .hospital-marker:hover {
    transform: scale(1.3);
    filter: drop-shadow(0 4px 16px rgba(0, 132, 217, 0.4));
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

  .forecast-chart { 
    height: 220px; 
    width: 100%; 
    position: relative; 
    margin-top: 1rem; 
    background: linear-gradient(135deg, rgba(0, 132, 217, 0.05), rgba(99, 102, 241, 0.05)); 
    border-radius: 12px; 
    border: 1px solid var(--border); 
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .stat-card {
    background: linear-gradient(135deg, var(--bg-card) 0%, ${isDarkMode ? 'rgba(25, 35, 60, 0.2)' : 'rgba(226, 232, 240, 0.3)'} 100%);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .stat-card:hover {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(0, 132, 217, 0.2);
    transform: translateY(-4px);
  }

  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.6px; }
  .stat-value { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--accent-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
  .stat-change { font-size: 0.8rem; color: var(--success-light); display: flex; align-items: center; gap: 4px; font-weight: 500; }
  .stat-change.down { color: var(--danger-light); }

  .modal-overlay { position: fixed; inset: 0; background: ${isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.55)'}; backdrop-filter: blur(12px); z-index: 200; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); padding: 20px; overflow-y: auto; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bg-panel-solid); border: 1px solid var(--border-light); width: 100%; max-width: 900px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95) translateY(20px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35); }
  .modal-overlay.open .modal { transform: scale(1) translateY(0); }
  .modal-header { padding: 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: ${isDarkMode ? 'linear-gradient(90deg, rgba(0,132,217,0.08), transparent)' : 'linear-gradient(90deg, rgba(0,132,217,0.08), transparent)'}; }
  .modal-body { padding: 2rem; overflow-y: auto; flex: 1; max-height: calc(90vh - 200px); }
  .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: ${isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'}; }

  .ai-fab { 
    position: fixed; 
    bottom: 30px; 
    right: 30px; 
    width: 64px; 
    height: 64px; 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: white; 
    font-size: 1.5rem; 
    box-shadow: 0 8px 24px rgba(0, 132, 217, 0.35); 
    z-index: 150; 
    cursor: pointer; 
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
    border: none;
    position: relative;
    overflow: hidden;
  }
  .ai-fab::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent);
    pointer-events: none;
  }
  .ai-fab:hover { 
    transform: scale(1.15);
    box-shadow: 0 12px 36px rgba(0, 132, 217, 0.45);
  }
  .ai-panel { 
    position: fixed; 
    bottom: 100px; 
    right: 30px; 
    width: 420px; 
    height: 620px; 
    background: var(--bg-panel-solid); 
    border: 1px solid var(--border-light); 
    border-radius: 20px; 
    display: flex; 
    flex-direction: column; 
    transform-origin: bottom right; 
    transform: scale(0.9) translateY(20px); 
    opacity: 0; 
    pointer-events: none; 
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
    z-index: 150; 
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .ai-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  .msg { 
    max-width: 85%; 
    padding: 12px 16px; 
    border-radius: 12px; 
    margin-bottom: 12px; 
    font-size: 0.9rem; 
    white-space: pre-wrap; 
    line-height: 1.4;
    animation: scale-in 0.3s ease-out;
  }
  .msg.ai { 
    background: var(--bg-input); 
    color: var(--text-main); 
    align-self: flex-start; 
    border: 1px solid var(--border-light); 
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .msg.user { 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    color: white; 
    align-self: flex-end; 
    border-bottom-right-radius: 4px; 
    box-shadow: 0 6px 16px rgba(0, 132, 217, 0.3);
    font-weight: 500;
  }

  #landing-page { position: fixed; inset: 0; background: ${landingBg}; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 300; transition: opacity 0.8s; }
  .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); box-shadow: 0 0 20px var(--primary); animation: scan 3s linear infinite; opacity: 0.5; }
  
  .btn { 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    color: white; 
    border: none; 
    padding: 12px 24px; 
    border-radius: 10px; 
    font-weight: 600; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
    font-size: 0.95rem; 
    box-shadow: 0 4px 16px rgba(0, 132, 217, 0.3); 
    position: relative;
    overflow: hidden;
  }
  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 132, 217, 0.4);
  }
  .btn:hover::before {
    left: 100%;
  }
  .btn:active { transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); box-shadow: none; padding: 10px 16px; border-radius: 8px; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer;}
  .btn-ghost:hover { background: rgba(0, 132, 217, 0.12); color: var(--primary); border-color: var(--primary); box-shadow: 0 4px 12px rgba(0, 132, 217, 0.15); transform: translateY(-2px); }

  input[type="text"], input[type="email"], input[type="password"], textarea, select {
    background: var(--bg-input);
    border: 1.5px solid var(--border);
    color: var(--text-main);
    padding: 11px 14px;
    border-radius: 8px;
    font-family: var(--font-main);
    font-size: 0.9rem;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    width: 100%;
  }

  input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus, textarea:focus, select:focus {
    border-color: var(--primary);
    background: rgba(0, 132, 217, 0.12);
    box-shadow: 0 0 16px rgba(0, 132, 217, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.05);
    outline: none;
  }

  input::placeholder {
    color: var(--text-dim);
    font-weight: 500;
  }

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
  
  /* --- FOOTER --- */
  .site-footer {
    background: var(--bg-panel-solid);
    border-top: 1px solid var(--border);
    padding: 4rem 2rem 2rem;
    margin-top: auto;
    width: 100%;
  }

  .footer-content {
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .footer-brand h3 { 
    font-size: 1.5rem; 
    background: linear-gradient(135deg, var(--primary), var(--accent)); 
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }
  .footer-brand p { color: var(--text-muted); line-height: 1.6; max-width: 350px; }

  .footer-col h4 { font-size: 1rem; margin-bottom: 1.2rem; color: var(--text-main); font-weight: 700; }
  .footer-links { display: flex; flex-direction: column; gap: 0.8rem; }
  .footer-links a { color: var(--text-muted); font-size: 0.9rem; transition: all 0.2s; }
  .footer-links a:hover { color: var(--primary); padding-left: 5px; }

  .social-links { display: flex; gap: 1rem; }
  .social-icon { 
    width: 40px; height: 40px; 
    border-radius: 50%; 
    background: var(--bg-input); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: var(--text-muted);
    transition: all 0.3s;
  }
  .social-icon:hover { background: var(--primary); color: white; transform: translateY(-4px); }

  .footer-bottom {
    max-width: 1600px;
    margin: 0 auto;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    color: var(--text-dim);
    font-size: 0.85rem;
  }
  .footer-credits span { color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  @media (max-width: 1024px) {
    .dashboard-grid, .page-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .footer-content { grid-template-columns: 1fr 1fr; gap: 2rem; }
  }

  @media (max-width: 768px) {
    #app-root { flex-direction: column; }
    .nav-menu { display: none; } /* Simplified for demo, would use burger menu in production */
    .main-content { flex: 1; }
    .dashboard-grid, .page-grid { grid-template-columns: 1fr; padding: 0; gap: 1rem; }
    .content-wrapper { padding: 1rem; }
    .top-navbar { padding: 0 1rem; }
    .footer-content { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; text-align: center; }
    #landing-page h1 { font-size: 2.5rem; }
  }
`;
};
    
// --- DISCHARGE SUMMARY PAGE ---
const DischargeSummaryPage = ({ discharges = [] }) => {
  return (
    <div className="page-grid">
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h2 className="font-bold text-2xl mb-2">Discharge Summaries</h2>
        <p className="text-muted mb-4">Recent patient discharges and summaries across the network</p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Facility</th>
                <th>Discharge Date</th>
                <th>Summary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {discharges.length > 0 ? discharges.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.patient}</strong></td>
                  <td>{d.facility}</td>
                  <td>{d.date}</td>
                  <td className="text-sm text-dim">{d.summary}</td>
                  <td>
                    <button className="btn-ghost" style={{padding: '6px 10px', fontSize: '0.85rem'}}>View</button>
                    <button className="btn" style={{marginLeft:8, padding: '6px 10px', fontSize: '0.85rem'}}>Export</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{padding:'2rem', textAlign:'center', color:'var(--text-muted)'}}>No discharges available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
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
    id: 'ca-zsfg', name: 'Zuckerberg San Francisco General', region: 'San Francisco',
    position: { x: 0.185, y: 0.405 }, status: 'warning',
    occupancy: 88,
    efficiency: 85,
    lastUpdate: 'just now',
    inventory: [
      { id: 'r1', name: 'ICU Beds', current: 12, total: 40, unit: 'units', threshold: 8, type: 'bed', trend: 'down' },
      { id: 'r2', name: 'Oxygen Cylinders', current: 50, total: 120, unit: 'tanks', threshold: 30, type: 'gas', trend: 'down' },
      { id: 'r3', name: 'Ventilators', current: 6, total: 12, unit: 'machines', threshold: 3, type: 'machine', trend: 'stable' }
    ],
    forecast: {
      trend: 'increasing',
      nextMonthDemand: { 'ICU Beds': 30 },
      projectedDeficit: { 'ICU Beds': 18 },
      confidence: 92
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

// --- FACILITIES PAGE COMPONENT ---
const FacilitiesPage = ({ hospitals, stats }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="page-grid">
      {/* Page Header */}
      <div className="panel" style={{gridColumn: '1 / -1', background: `linear-gradient(135deg, rgba(0, 132, 217, 0.15), rgba(99, 102, 241, 0.1))`}}>
        <h2 className="font-bold text-2xl mb-2">Facilities Management</h2>
        <p className="text-muted">Monitor and manage all healthcare facilities across the network</p>
        <div className="flex gap-4 mt-4">
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted">Active Facilities</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-success">{stats.stable}</div>
            <div className="text-sm text-muted">Operational</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-warning">{stats.warning}</div>
            <div className="text-sm text-muted">Warnings</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-danger">{stats.critical}</div>
            <div className="text-sm text-muted">Critical</div>
          </div>
        </div>
      </div>

      {/* Facilities List */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold text-lg mb-4">All Facilities</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Region</th>
                <th>Occupancy</th>
                <th>Efficiency</th>
                <th>Status</th>
                <th>Resources</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id}>
                  <td><strong>{h.name}</strong></td>
                  <td>{h.region}</td>
                  <td><span className="font-medium">{h.occupancy}%</span></td>
                  <td><span className="text-success font-medium">{h.efficiency}%</span></td>
                  <td>
                    <span className={`badge ${h.status}`}>
                      <div className={`dot ${h.status}`}></div> {h.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-sm">{h.inventory.filter(i => i.current >= i.threshold).length}/{h.inventory.length} normal</td>
                  <td>
                    <button 
                      className="btn-ghost" 
                      onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                      style={{padding: '6px 12px', fontSize: '0.85rem'}}
                    >
                      {expandedId === h.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Expanded Details */}
        {expandedId && (
          <div style={{marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 132, 217, 0.08)', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
            {hospitals.map(h => expandedId === h.id && (
              <div key={h.id}>
                <h4 className="font-bold mb-4">{h.name} - Detailed Overview</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div className="stat-card">
                    <div className="stat-label">Total Beds</div>
                    <div className="stat-value" style={{fontSize: '2rem'}}>250</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">ICU Capacity</div>
                    <div className="stat-value" style={{fontSize: '2rem'}}>85%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Staff Count</div>
                    <div className="stat-value" style={{fontSize: '2rem'}}>450</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Equipment</div>
                    <div className="stat-value" style={{fontSize: '2rem'}}>{h.inventory.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Facility Performance Metrics */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold text-lg mb-4">Performance Metrics</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
          {hospitals.map(h => (
            <div key={h.id} style={{padding: '1.25rem', background: 'rgba(0, 132, 217, 0.08)', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
              <div className="font-bold mb-3">{h.name}</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Occupancy</span>
                    <span className="font-bold">{h.occupancy}%</span>
                  </div>
                  <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${h.occupancy}%`, background: h.occupancy > 85 ? 'var(--danger)' : h.occupancy > 70 ? 'var(--warning)' : 'var(--success)'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Efficiency</span>
                    <span className="font-bold">{h.efficiency}%</span>
                  </div>
                  <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${h.efficiency}%`, background: 'var(--success)'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- INVENTORY PAGE COMPONENT ---
const InventoryPage = ({ hospitals }) => {
  const [selectedFacility, setSelectedFacility] = useState(hospitals[0]?.id);
  const selected = hospitals.find(h => h.id === selectedFacility);

  // Calculate inventory stats
  const allItems = hospitals.flatMap(h => h.inventory);
  const criticalItems = allItems.filter(i => i.current < i.threshold);
  const lowItems = allItems.filter(i => i.current >= i.threshold && i.current < i.threshold * 1.5);

  return (
    <div className="page-grid">
      {/* Inventory Summary */}
      <div className="panel" style={{gridColumn: '1 / -1', background: `linear-gradient(135deg, rgba(0, 132, 217, 0.15), rgba(99, 102, 241, 0.1))`}}>
        <h2 className="font-bold text-2xl mb-2">Inventory Management</h2>
        <p className="text-muted mb-4">Track all medical supplies and equipment across facilities</p>
        <div className="flex gap-4">
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-success">{allItems.length}</div>
            <div className="text-sm text-muted">Total Items</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-warning">{lowItems.length}</div>
            <div className="text-sm text-muted">Low Stock</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-danger">{criticalItems.length}</div>
            <div className="text-sm text-muted">Critical</div>
          </div>
        </div>
      </div>

      {/* Facility Selector */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold mb-3">Select Facility</h3>
        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
          {hospitals.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedFacility(h.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: selectedFacility === h.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: selectedFacility === h.id ? 'rgba(0, 132, 217, 0.15)' : 'var(--bg-input)',
                color: selectedFacility === h.id ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: selectedFacility === h.id ? '600' : '500',
                transition: 'all 0.3s'
              }}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Facility Inventory */}
      {selected && (
        <>
          <div className="panel" style={{gridColumn: '1 / -1'}}>
            <h3 className="font-bold text-lg mb-4">{selected.name} - Inventory Details</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Current</th>
                    <th>Total</th>
                    <th>Usage</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.inventory.map((item) => {
                    const isCritical = item.current < item.threshold;
                    const usage = Math.round((item.current / item.total) * 100);
                    return (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.current}</td>
                        <td>{item.total}</td>
                        <td>
                          <div style={{width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                            <div style={{height: '100%', width: `${usage}%`, background: isCritical ? 'var(--danger)' : usage < 50 ? 'var(--warning)' : 'var(--success)'}}></div>
                          </div>
                        </td>
                        <td>{item.threshold}</td>
                        <td>
                          <span className={`badge ${isCritical ? 'critical' : usage < 60 ? 'warning' : 'stable'}`}>
                            {isCritical ? 'CRITICAL' : usage < 60 ? 'LOW' : 'OK'}
                          </span>
                        </td>
                        <td>
                          <i className={`fa-solid fa-arrow-trend-${item.trend === 'up' ? 'up text-warning' : item.trend === 'down' ? 'down text-danger' : 'right text-success'}`}></i>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory by Category */}
          <div className="panel" style={{gridColumn: '1 / -1'}}>
            <h3 className="font-bold text-lg mb-4">Categorized Inventory</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
              {Array.from(new Set(selected.inventory.map(i => i.type))).map(type => (
                <div key={type} style={{padding: '1.25rem', background: 'rgba(0, 132, 217, 0.08)', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
                  <div className="font-bold mb-3 capitalize">{type} Supplies</div>
                  <div className="space-y-2">
                    {selected.inventory.filter(i => i.type === type).map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <span className={item.current < item.threshold ? 'text-danger font-bold' : 'text-success'}>{item.current}/{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <div className="panel" style={{gridColumn: '1 / -1', background: 'rgba(255, 56, 96, 0.1)', borderColor: 'rgba(255, 56, 96, 0.3)'}}>
          <h3 className="font-bold text-lg mb-3 text-danger flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Critical Items Requiring Attention
          </h3>
          <div className="space-y-2">
            {criticalItems.map((item, idx) => {
              const hospital = hospitals.find(h => h.inventory.includes(item));
              return (
                <div key={idx} className="flex justify-between items-center p-2 bg-red-500/10 rounded border border-red-500/20">
                  <div>
                    <strong className="text-sm">{item.name}</strong>
                    <div className="text-xs text-muted">{hospital?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-danger font-bold">{item.current}/{item.total}</div>
                    <div className="text-xs text-danger">Below threshold: {item.threshold}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ALERTS PAGE COMPONENT ---
const AlertsPage = ({ hospitals, stats }) => {
  const [filterLevel, setFilterLevel] = useState('all');

  // Generate mock alerts
  const generateAlerts = () => {
    const alerts = [];
    hospitals.forEach(h => {
      // Critical resource alerts
      h.inventory.forEach(item => {
        if (item.current < item.threshold) {
          alerts.push({
            id: `${h.id}-${item.id}`,
            level: 'critical',
            type: 'Resource Critical',
            hospital: h.name,
            message: `${item.name} critically low: ${item.current}/${item.total} units`,
            time: '2 mins ago'
          });
        } else if (item.current < item.threshold * 1.5) {
          alerts.push({
            id: `${h.id}-${item.id}-low`,
            level: 'warning',
            type: 'Resource Low',
            hospital: h.name,
            message: `${item.name} running low: ${item.current}/${item.total} units`,
            time: '5 mins ago'
          });
        }
      });

      // Occupancy alerts
      if (h.occupancy > 90) {
        alerts.push({
          id: `${h.id}-occupancy`,
          level: 'critical',
          type: 'Capacity Alert',
          hospital: h.name,
          message: `Occupancy critical at ${h.occupancy}%`,
          time: '1 min ago'
        });
      } else if (h.occupancy > 80) {
        alerts.push({
          id: `${h.id}-occupancy-warn`,
          level: 'warning',
          type: 'Capacity Warning',
          hospital: h.name,
          message: `High occupancy at ${h.occupancy}%`,
          time: '3 mins ago'
        });
      }
    });

    // System alerts
    alerts.push({
      id: 'sys-1',
      level: 'info',
      type: 'System',
      hospital: 'Network',
      message: 'Backup sync completed successfully',
      time: '10 mins ago'
    });

    return alerts.sort((a, b) => {
      const levelPriority = { critical: 0, warning: 1, info: 2 };
      return levelPriority[a.level] - levelPriority[b.level];
    });
  };

  const allAlerts = generateAlerts();
  const filteredAlerts = filterLevel === 'all' ? allAlerts : allAlerts.filter(a => a.level === filterLevel);

  const alertCounts = {
    critical: allAlerts.filter(a => a.level === 'critical').length,
    warning: allAlerts.filter(a => a.level === 'warning').length,
    info: allAlerts.filter(a => a.level === 'info').length
  };

  return (
    <div className="page-grid">
      {/* Alerts Header */}
      <div className="panel" style={{gridColumn: '1 / -1', background: `linear-gradient(135deg, rgba(0, 132, 217, 0.15), rgba(99, 102, 241, 0.1))`}}>
        <h2 className="font-bold text-2xl mb-2">System Alerts</h2>
        <p className="text-muted mb-4">Real-time monitoring of critical incidents and warnings</p>
        <div className="flex gap-4">
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-danger">{alertCounts.critical}</div>
            <div className="text-sm text-muted">Critical</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-warning">{alertCounts.warning}</div>
            <div className="text-sm text-muted">Warnings</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold text-success">{alertCounts.info}</div>
            <div className="text-sm text-muted">Notices</div>
          </div>
          <div style={{flex: 1}}>
            <div className="text-3xl font-bold">{allAlerts.length}</div>
            <div className="text-sm text-muted">Total Alerts</div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold mb-3">Filter by Level</h3>
        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
          {['all', 'critical', 'warning', 'info'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: filterLevel === level ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filterLevel === level ? 'rgba(0, 132, 217, 0.15)' : 'var(--bg-input)',
                color: filterLevel === level ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: filterLevel === level ? '600' : '500',
                textTransform: 'capitalize',
                transition: 'all 0.3s'
              }}
            >
              {level === 'all' ? 'All Alerts' : `${level.charAt(0).toUpperCase()}${level.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold text-lg mb-4">Active Alerts ({filteredAlerts.length})</h3>
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const levelColor = alert.level === 'critical' ? '#ff3860' : alert.level === 'warning' ? '#f59e0b' : '#10b981';
              const levelBg = alert.level === 'critical' ? 'rgba(255, 56, 96, 0.1)' : alert.level === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
              return (
                <div
                  key={alert.id}
                  style={{
                    padding: '1rem',
                    background: levelBg,
                    border: `1px solid ${levelColor}33`,
                    borderRadius: '10px',
                    borderLeft: `4px solid ${levelColor}`
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div style={{flex: 1}}>
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fa-solid fa-${alert.level === 'critical' ? 'circle-exclamation' : alert.level === 'warning' ? 'triangle-exclamation' : 'circle-info'}`} style={{color: levelColor}}></i>
                        <strong style={{color: levelColor}}>{alert.type}</strong>
                        <span className="text-xs text-muted" style={{marginLeft: 'auto'}}>{alert.time}</span>
                      </div>
                      <div className="text-sm text-muted mb-1">
                        <strong>Facility:</strong> {alert.hospital}
                      </div>
                      <div className="text-sm">{alert.message}</div>
                    </div>
                    <button className="btn-ghost" style={{padding: '6px 12px', fontSize: '0.85rem', marginLeft: '1rem'}}>
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
              <i className="fa-solid fa-check-circle" style={{fontSize: '2rem', marginBottom: '0.5rem', display: 'block', color: 'var(--success)'}}></i>
              <p>No {filterLevel !== 'all' ? filterLevel : ''} alerts at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="panel" style={{gridColumn: '1 / -1'}}>
        <h3 className="font-bold text-lg mb-4">Alert Statistics</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
          <div style={{padding: '1.25rem', background: 'rgba(255, 56, 96, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 56, 96, 0.3)'}}>
            <div className="font-bold mb-3 text-danger">Critical Alerts</div>
            <div className="text-3xl font-bold text-danger mb-2">{alertCounts.critical}</div>
            <div className="text-sm text-muted">Require immediate action</div>
          </div>
          <div style={{padding: '1.25rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)'}}>
            <div className="font-bold mb-3 text-warning">Warning Alerts</div>
            <div className="text-3xl font-bold text-warning mb-2">{alertCounts.warning}</div>
            <div className="text-sm text-muted">Monitor closely</div>
          </div>
          <div style={{padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
            <div className="font-bold mb-3 text-success">Informational</div>
            <div className="text-3xl font-bold text-success mb-2">{alertCounts.info}</div>
            <div className="text-sm text-muted">System notices</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. FOOTER COMPONENT ---
const Footer = () => (
  <footer className="site-footer">
    <div className="footer-content">
      <div className="footer-brand">
        <h3>CareSync AI</h3>
        <p>Automate what slows you down. Hospital operations enterprise automation. Streamline your facility management with predictive AI.</p>
      </div>
      
      <div className="footer-col">
        <h4>Company</h4>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Partners</a>
          <a href="#">Press</a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Connect</h4>
        <div className="footer-links">
          <a href="#">Contact</a>
          <a href="mailto:hello@caresync.com">hello@caresync.com</a>
          <a href="#" className="text-primary font-bold">Book Free Audit</a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Social</h4>
        <div className="social-links">
          <a href="#" className="social-icon" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
          <a href="#" className="social-icon" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
          <a href="#" className="social-icon" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
          <a href="#" className="social-icon" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div>© 2026 CareSync. All rights reserved.</div>
      <div className="footer-credits">Built by <span>eeshatariq</span> and <span>aliza arshad</span></div>
    </div>
  </footer>
);

// --- 5. MAIN APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  // Sample discharges generated from hospitals (demo)
  const sampleDischarges = hospitals.length ? hospitals.map((h, i) => ({
    id: `d-${i}`,
    patient: `Patient ${i + 1}`,
    facility: h.name,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    summary: `Discharged after stabilization. Follow-up in 7 days at ${h.name}.`
  })) : [];

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
        <div style={{position:'fixed', inset:0, background:'var(--bg-dark)', zIndex:400, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
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
          {/* TOP NAVIGATION BAR */}
          <nav className="top-navbar">
            <div className="nav-left">
              <div className="logo">
                <i className="fa-solid fa-heart-pulse fa-lg"></i>
                <span>CareSync</span>
              </div>
            </div>

            <div className="nav-center">
              <div className="nav-menu">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
                  { id: 'facilities', label: 'Facilities', icon: 'fa-hospital' },
                  { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
                  { id: 'alerts', label: 'Alerts', icon: 'fa-bell' },
                  { id: 'discharge', label: 'Discharge Summary', icon: 'fa-file-medical' }
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
              </div>
            </div>
            
            <div className="nav-right">
              <div className="status-indicator">
                <div className="status-dot"></div>
                LIVE NETWORK
              </div>
              <div className="theme-toggle-nav" onClick={() => setIsDarkMode(!isDarkMode)}>
                <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </div>
              <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', cursor:'pointer'}}>
                <i className="fa-solid fa-user"></i>
              </div>
            </div>
          </nav>

          {/* SCROLLABLE MAIN CONTENT */}
          <main className="main-content">
            <div className="content-wrapper">
              
              {/* DASHBOARD VIEW */}
              {activeNav === 'dashboard' && (
                <div className="dashboard-grid">
                  {/* Map Card */}
                  <div className="panel map-card">
                    <div style={{marginBottom:'1rem'}}>
                      <h3 className="font-bold text-lg mb-1">California Hospital Network</h3>
                      <p className="text-sm text-muted">Real-time facility monitoring and status</p>
                    </div>
                    <CaliforniaMap hospitals={hospitals} selectedHospital={selectedHospital} onHospitalSelect={setSelectedHospital} />
                  </div>
                  <br />
                  <br />
                  <br />
                  <br />


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
              )}

              {/* FACILITIES PAGE */}
              {activeNav === 'facilities' && <FacilitiesPage hospitals={hospitals} stats={stats} />}

              {/* INVENTORY PAGE */}
              {activeNav === 'inventory' && <InventoryPage hospitals={hospitals} />}

              {/* ALERTS PAGE */}
              {activeNav === 'alerts' && <AlertsPage hospitals={hospitals} stats={stats} />}
              {/* DISCHARGE SUMMARY PAGE */}
              {activeNav === 'discharge' && <DischargeSummaryPage discharges={sampleDischarges} />}
            </div>
            
            <Footer />
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