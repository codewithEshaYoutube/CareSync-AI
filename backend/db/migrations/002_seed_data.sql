-- ============================================================
-- CARESYNC AI — SEED DATA
-- Migration: 002
-- Populates: regions, hospitals, resources, agents, users,
--            suppliers, supplier_resources, inventory, alerts
-- ============================================================
-- NOTE: All UUIDs are fixed so this script is idempotent.
-- Run after 001_init_schema.sql.
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- REGIONS
-- Matches frontend node names exactly.
-- ----------------------------------------------------------------
INSERT INTO regions (id, name, country) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Punjab',       'India'),
    ('a1000000-0000-0000-0000-000000000002', 'Delhi NCR',    'India'),
    ('a1000000-0000-0000-0000-000000000003', 'Central Hub',  'India'),
    ('a1000000-0000-0000-0000-000000000004', 'Mumbai',       'India'),
    ('a1000000-0000-0000-0000-000000000005', 'Chennai',      'India')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- HOSPITALS
-- position_x / position_y match frontend canvas node coordinates.
-- Punjab:       x=0.15, y=0.18
-- Delhi NCR:    x=0.50, y=0.25
-- Central Hub:  x=0.48, y=0.50
-- Mumbai:       x=0.25, y=0.72
-- Chennai:      x=0.60, y=0.82
-- ----------------------------------------------------------------
INSERT INTO hospitals (id, name, region_id, position_x, position_y, contact_email) VALUES
    ('b1000000-0000-0000-0000-000000000001',
     'PGIMER Chandigarh',
     'a1000000-0000-0000-0000-000000000001',
     0.15, 0.18,
     'ops@pgimer.edu.in'),

    ('b1000000-0000-0000-0000-000000000002',
     'AIIMS New Delhi',
     'a1000000-0000-0000-0000-000000000002',
     0.50, 0.25,
     'ops@aiims.edu'),

    ('b1000000-0000-0000-0000-000000000003',
     'Central Medical Hub',
     'a1000000-0000-0000-0000-000000000003',
     0.48, 0.50,
     'ops@centralhub.gov.in'),

    ('b1000000-0000-0000-0000-000000000004',
     'Tata Memorial Hospital Mumbai',
     'a1000000-0000-0000-0000-000000000004',
     0.25, 0.72,
     'ops@tatamemorial.gov.in'),

    ('b1000000-0000-0000-0000-000000000005',
     'Government General Hospital Chennai',
     'a1000000-0000-0000-0000-000000000005',
     0.60, 0.82,
     'ops@gghchennai.gov.in')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- RESOURCES
-- Core healthcare resource types tracked by the platform.
-- Thresholds mirror the frontend card color logic:
--   critical ≤ 40%, warning ≤ 70%, stable > 70%
-- ----------------------------------------------------------------
INSERT INTO resources (id, name, unit, warning_threshold, critical_threshold, description) VALUES
    ('c1000000-0000-0000-0000-000000000001',
     'oxygen',         'percentage', 70.0, 40.0,
     'Medical oxygen supply capacity across hospital infrastructure'),

    ('c1000000-0000-0000-0000-000000000002',
     'icu_beds',       'percentage', 75.0, 50.0,
     'ICU bed occupancy as percentage of total available beds'),

    ('c1000000-0000-0000-0000-000000000003',
     'pharmaceuticals','percentage', 70.0, 40.0,
     'Essential pharmaceutical stock level as percentage of baseline requirement'),

    ('c1000000-0000-0000-0000-000000000004',
     'blood_supply',   'percentage', 65.0, 35.0,
     'Blood bank inventory across all blood groups'),

    ('c1000000-0000-0000-0000-000000000005',
     'ventilators',    'percentage', 70.0, 40.0,
     'Ventilator availability as percentage of total fleet')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- AGENTS
-- One row per AI agent type.
-- ----------------------------------------------------------------
INSERT INTO agents (id, name, agent_type, status) VALUES
    ('d1000000-0000-0000-0000-000000000001',
     'Supply Intelligence Agent', 'supply_intelligence', 'active'),

    ('d1000000-0000-0000-0000-000000000002',
     'Procurement Agent',         'procurement',         'active'),

    ('d1000000-0000-0000-0000-000000000003',
     'Risk Analysis Agent',       'risk_analysis',       'active'),

    ('d1000000-0000-0000-0000-000000000004',
     'Emergency Monitoring Agent','emergency_monitoring', 'active'),

    ('d1000000-0000-0000-0000-000000000005',
     'Operations Agent',          'operations',          'active'),

    ('d1000000-0000-0000-0000-000000000006',
     'Executive Reporting Agent', 'executive_reporting', 'active')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- USERS
-- Admin: Dr. Sarah Chen (CMO) — matches hardcoded frontend user.
-- Password hash is bcrypt of 'CareSync@2026' (for dev only).
-- ----------------------------------------------------------------
INSERT INTO users (id, name, title, email, hashed_password, role, hospital_id, avatar_url) VALUES
    ('e1000000-0000-0000-0000-000000000001',
     'Dr. Sarah Chen',
     'Chief Medical Officer',
     'sarah.chen@caresync.gov.in',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdbJE2RAlB.RVJm',  -- CareSync@2026
     'admin',
     NULL,
     'https://picsum.photos/seed/doctor/40/40'),

    ('e1000000-0000-0000-0000-000000000002',
     'Dr. Arjun Mehta',
     'Procurement Officer',
     'arjun.mehta@caresync.gov.in',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdbJE2RAlB.RVJm',
     'operator',
     'b1000000-0000-0000-0000-000000000002',
     NULL),

    ('e1000000-0000-0000-0000-000000000003',
     'Priya Sharma',
     'Supply Chain Analyst',
     'priya.sharma@caresync.gov.in',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdbJE2RAlB.RVJm',
     'viewer',
     'b1000000-0000-0000-0000-000000000004',
     NULL)
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------
-- SUPPLIERS
-- Three sample suppliers with different profiles.
-- ----------------------------------------------------------------
INSERT INTO suppliers (id, name, reliability_score, lead_time_days, contact_email, country, logistics_risk_score) VALUES
    ('f1000000-0000-0000-0000-000000000001',
     'AirSupply Corp',
     98.0, 2,
     'supply@airsupply.com',
     'India',
     5.0),

    ('f1000000-0000-0000-0000-000000000002',
     'MedStock India Ltd',
     87.5, 5,
     'orders@medstock.in',
     'India',
     18.0),

    ('f1000000-0000-0000-0000-000000000003',
     'PharmaLink Global',
     92.0, 3,
     'procurement@pharmalink.com',
     'Singapore',
     12.5)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- SUPPLIER RESOURCES
-- Each supplier's catalog with unit prices.
-- ----------------------------------------------------------------
INSERT INTO supplier_resources (id, supplier_id, resource_id, unit_price, available_quantity) VALUES
    -- AirSupply Corp → oxygen
    ('g1000000-0000-0000-0000-000000000001',
     'f1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001',
     4500.00, 10000),

    -- AirSupply Corp → ventilators
    ('g1000000-0000-0000-0000-000000000002',
     'f1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000005',
     285000.00, 50),

    -- MedStock India Ltd → pharmaceuticals
    ('g1000000-0000-0000-0000-000000000003',
     'f1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000003',
     1200.00, 50000),

    -- MedStock India Ltd → blood_supply
    ('g1000000-0000-0000-0000-000000000004',
     'f1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000004',
     3200.00, 5000),

    -- PharmaLink Global → pharmaceuticals
    ('g1000000-0000-0000-0000-000000000005',
     'f1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000003',
     1050.00, 80000),

    -- PharmaLink Global → oxygen
    ('g1000000-0000-0000-0000-000000000006',
     'f1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000001',
     4800.00, 8000)
ON CONFLICT (supplier_id, resource_id) DO NOTHING;

-- ----------------------------------------------------------------
-- INVENTORY
-- Initial readings matching frontend dashboard values:
--   oxygen: 84.5%  (stable)    → Punjab, Central Hub, Mumbai, Chennai
--   icu:    92.1%  (critical)  → Delhi NCR critical
--   pharma: 78.2%  (warning)   → Mumbai
-- ----------------------------------------------------------------
-- Punjab (PGIMER) — all stable/good
INSERT INTO inventory (id, hospital_id, resource_id, current_level, capacity_total, status, trend) VALUES
    ('h1000000-0000-0000-0000-000000000001',
     'b1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001',
     98.0, 5000, 'stable', 1),

    ('h1000000-0000-0000-0000-000000000002',
     'b1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000002',
     72.0, 300,  'stable', 0),

    ('h1000000-0000-0000-0000-000000000003',
     'b1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000003',
     85.0, 10000,'stable', 0),

-- Delhi NCR (AIIMS) — oxygen critical, ICU critical
    ('h1000000-0000-0000-0000-000000000004',
     'b1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000001',
     24.0, 8000, 'critical', -1),

    ('h1000000-0000-0000-0000-000000000005',
     'b1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000002',
     92.1, 500,  'critical', -1),

    ('h1000000-0000-0000-0000-000000000006',
     'b1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000003',
     61.0, 20000,'warning',  -1),

-- Central Hub — stable overall
    ('h1000000-0000-0000-0000-000000000007',
     'b1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000001',
     88.0, 12000,'stable',  0),

    ('h1000000-0000-0000-0000-000000000008',
     'b1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000002',
     68.0, 800,  'warning', -1),

    ('h1000000-0000-0000-0000-000000000009',
     'b1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000003',
     84.5, 30000,'stable',  0),

-- Mumbai (Tata Memorial) — pharma warning
    ('h1000000-0000-0000-0000-000000000010',
     'b1000000-0000-0000-0000-000000000004',
     'c1000000-0000-0000-0000-000000000001',
     65.0, 6000, 'warning', -1),

    ('h1000000-0000-0000-0000-000000000011',
     'b1000000-0000-0000-0000-000000000004',
     'c1000000-0000-0000-0000-000000000002',
     81.0, 450,  'stable',  1),

    ('h1000000-0000-0000-0000-000000000012',
     'b1000000-0000-0000-0000-000000000004',
     'c1000000-0000-0000-0000-000000000003',
     78.2, 25000,'warning', -1),

-- Chennai (GGH) — stable
    ('h1000000-0000-0000-0000-000000000013',
     'b1000000-0000-0000-0000-000000000005',
     'c1000000-0000-0000-0000-000000000001',
     91.0, 7000, 'stable',  0),

    ('h1000000-0000-0000-0000-000000000014',
     'b1000000-0000-0000-0000-000000000005',
     'c1000000-0000-0000-0000-000000000002',
     74.5, 400,  'stable',  0),

    ('h1000000-0000-0000-0000-000000000015',
     'b1000000-0000-0000-0000-000000000005',
     'c1000000-0000-0000-0000-000000000003',
     88.0, 18000,'stable',  1)
ON CONFLICT (hospital_id, resource_id) DO NOTHING;

-- ----------------------------------------------------------------
-- ALERTS
-- Two active alerts reflecting the critical Delhi NCR readings.
-- ----------------------------------------------------------------
INSERT INTO alerts (id, hospital_id, resource_id, alert_type, severity, message, status) VALUES
    ('i1000000-0000-0000-0000-000000000001',
     'b1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000001',
     'shortage',
     'critical',
     'Oxygen supply at AIIMS New Delhi has dropped to 24% — immediate procurement required.',
     'open'),

    ('i1000000-0000-0000-0000-000000000002',
     'b1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000002',
     'threshold',
     'high',
     'ICU occupancy at AIIMS New Delhi has exceeded 90% — surge capacity protocols advised.',
     'open')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- INITIAL AGENT LOGS
-- Sample log entries to match the live log panel in the frontend.
-- ----------------------------------------------------------------
INSERT INTO agent_logs (id, agent_id, hospital_id, severity, message, metadata) VALUES
    ('j1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000001',  -- Supply Intelligence
     'b1000000-0000-0000-0000-000000000002',  -- AIIMS Delhi
     'critical',
     'Oxygen inventory at AIIMS New Delhi verified via Bright Data proxy — level: 24%.',
     '{"resource": "oxygen", "level": 24.0, "source": "bright_data"}'),

    ('j1000000-0000-0000-0000-000000000002',
     'd1000000-0000-0000-0000-000000000002',  -- Procurement Agent
     'b1000000-0000-0000-0000-000000000002',
     'warning',
     'New supplier quote received from AirSupply Corp — Reliability 98%. Awaiting approval.',
     '{"supplier": "AirSupply Corp", "reliability": 98.0, "resource": "oxygen"}'),

    ('j1000000-0000-0000-0000-000000000003',
     'd1000000-0000-0000-0000-000000000003',  -- Risk Analysis
     NULL,
     'info',
     'National risk score updated — Delhi NCR flagged as critical. Score: 78/100.',
     '{"risk_score": 78, "region": "Delhi NCR"}'),

    ('j1000000-0000-0000-0000-000000000004',
     'd1000000-0000-0000-0000-000000000004',  -- Emergency Monitoring
     NULL,
     'warning',
     'Logistics delay detected in Sector 4 supply route — estimated 18-hour impact.',
     '{"sector": 4, "delay_hours": 18, "route": "Delhi-Punjab"}'),

    ('j1000000-0000-0000-0000-000000000005',
     'd1000000-0000-0000-0000-000000000005',  -- Operations
     'b1000000-0000-0000-0000-000000000003',  -- Central Hub
     'info',
     'Patient load analysis updated — Central Hub operating at 68% ICU capacity.',
     '{"icu_occupancy": 68.0, "resource": "icu_beds"}')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- INITIAL RISK SCORES
-- ----------------------------------------------------------------
INSERT INTO risk_scores (id, hospital_id, score, risk_level, contributing_factors) VALUES
    ('k1000000-0000-0000-0000-000000000001',
     'b1000000-0000-0000-0000-000000000001',
     12.0, 'low',
     '{"oxygen": 2.0, "icu_beds": 5.0, "pharmaceuticals": 5.0}'),

    ('k1000000-0000-0000-0000-000000000002',
     'b1000000-0000-0000-0000-000000000002',
     78.0, 'high',
     '{"oxygen": 42.0, "icu_beds": 28.0, "pharmaceuticals": 8.0}'),

    ('k1000000-0000-0000-0000-000000000003',
     'b1000000-0000-0000-0000-000000000003',
     32.0, 'moderate',
     '{"oxygen": 10.0, "icu_beds": 14.0, "pharmaceuticals": 8.0}'),

    ('k1000000-0000-0000-0000-000000000004',
     'b1000000-0000-0000-0000-000000000004',
     45.0, 'moderate',
     '{"oxygen": 18.0, "icu_beds": 8.0, "pharmaceuticals": 19.0}'),

    ('k1000000-0000-0000-0000-000000000005',
     'b1000000-0000-0000-0000-000000000005',
     15.0, 'low',
     '{"oxygen": 4.0, "icu_beds": 6.0, "pharmaceuticals": 5.0}')
ON CONFLICT DO NOTHING;

COMMIT;
