-- ============================================================
-- CARESYNC AI — INITIAL SCHEMA MIGRATION
-- Migration: 001
-- Engine:    PostgreSQL 15+
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ----------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
    'admin',
    'operator',
    'viewer'
);

CREATE TYPE inventory_status AS ENUM (
    'stable',
    'warning',
    'critical'
);

CREATE TYPE order_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'confirmed',
    'delivered',
    'cancelled'
);

CREATE TYPE alert_type AS ENUM (
    'shortage',
    'delay',
    'outbreak',
    'threshold'
);

CREATE TYPE alert_severity AS ENUM (
    'low',
    'moderate',
    'high',
    'critical'
);

CREATE TYPE alert_status AS ENUM (
    'open',
    'acknowledged',
    'resolved'
);

CREATE TYPE agent_type AS ENUM (
    'supply_intelligence',
    'procurement',
    'risk_analysis',
    'emergency_monitoring',
    'operations',
    'executive_reporting'
);

CREATE TYPE log_severity AS ENUM (
    'info',
    'warning',
    'error',
    'critical'
);

CREATE TYPE risk_level AS ENUM (
    'low',
    'moderate',
    'high',
    'critical'
);

CREATE TYPE message_role AS ENUM (
    'user',
    'assistant'
);

-- ----------------------------------------------------------------
-- TABLE: regions
-- Geographic groupings (Punjab, Delhi NCR, etc.)
-- ----------------------------------------------------------------
CREATE TABLE regions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL UNIQUE,
    country     TEXT        NOT NULL DEFAULT 'India',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: hospitals
-- Individual facilities plotted on the intelligence map.
-- position_x / position_y are normalized (0–1) canvas coordinates
-- matching the frontend node layout.
-- ----------------------------------------------------------------
CREATE TABLE hospitals (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    region_id     UUID        NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    position_x    FLOAT       NOT NULL CHECK (position_x >= 0 AND position_x <= 1),
    position_y    FLOAT       NOT NULL CHECK (position_y >= 0 AND position_y <= 1),
    contact_email TEXT,
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hospitals_region_id ON hospitals(region_id);

-- ----------------------------------------------------------------
-- TABLE: users
-- Authenticated staff members with hospital affiliation.
-- hospital_id is nullable for system-level admins.
-- ----------------------------------------------------------------
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    title           TEXT,
    email           TEXT        NOT NULL UNIQUE,
    hashed_password TEXT        NOT NULL,
    role            user_role   NOT NULL DEFAULT 'viewer',
    hospital_id     UUID        REFERENCES hospitals(id) ON DELETE SET NULL,
    avatar_url      TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_hospital_id ON users(hospital_id);

-- ----------------------------------------------------------------
-- TABLE: resources
-- Resource type catalog — each row is a category of supply.
-- Thresholds define when status flips to warning/critical.
-- ----------------------------------------------------------------
CREATE TABLE resources (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT    NOT NULL UNIQUE,   -- e.g. 'oxygen', 'icu_beds'
    unit                TEXT    NOT NULL,           -- e.g. 'percentage', 'beds', 'units'
    warning_threshold   FLOAT   NOT NULL DEFAULT 70.0  CHECK (warning_threshold >= 0 AND warning_threshold <= 100),
    critical_threshold  FLOAT   NOT NULL DEFAULT 40.0  CHECK (critical_threshold >= 0 AND critical_threshold <= 100),
    description         TEXT
);

-- ----------------------------------------------------------------
-- TABLE: inventory
-- Current stock level per hospital per resource.
-- One row per (hospital, resource) pair — updated in place.
-- trend: -1 = declining, 0 = stable, 1 = improving
-- ----------------------------------------------------------------
CREATE TABLE inventory (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID                NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    resource_id     UUID                NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    current_level   FLOAT               NOT NULL CHECK (current_level >= 0 AND current_level <= 100),
    capacity_total  INTEGER             NOT NULL CHECK (capacity_total > 0),
    status          inventory_status    NOT NULL DEFAULT 'stable',
    trend           SMALLINT            NOT NULL DEFAULT 0 CHECK (trend IN (-1, 0, 1)),
    last_updated_at TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    UNIQUE (hospital_id, resource_id)
);

CREATE INDEX idx_inventory_hospital_id ON inventory(hospital_id);
CREATE INDEX idx_inventory_status      ON inventory(status);

-- ----------------------------------------------------------------
-- TABLE: inventory_history
-- Append-only time-series of inventory readings.
-- Candidate for TimescaleDB hypertable on recorded_at.
-- ----------------------------------------------------------------
CREATE TABLE inventory_history (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID       NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    hospital_id  UUID       NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    resource_id  UUID       NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    value        FLOAT       NOT NULL CHECK (value >= 0 AND value <= 100),
    recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_hist_hospital_resource_time
    ON inventory_history(hospital_id, resource_id, recorded_at DESC);
CREATE INDEX idx_inv_hist_recorded_at
    ON inventory_history(recorded_at DESC);

-- ----------------------------------------------------------------
-- TABLE: suppliers
-- Vendor registry used for procurement evaluation.
-- ----------------------------------------------------------------
CREATE TABLE suppliers (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT        NOT NULL,
    reliability_score   FLOAT       NOT NULL DEFAULT 0.0
                            CHECK (reliability_score >= 0 AND reliability_score <= 100),
    lead_time_days      INTEGER     CHECK (lead_time_days > 0),
    contact_email       TEXT,
    country             TEXT,
    logistics_risk_score FLOAT      NOT NULL DEFAULT 0.0
                            CHECK (logistics_risk_score >= 0 AND logistics_risk_score <= 100),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: supplier_resources
-- What each supplier can provide, with pricing.
-- ----------------------------------------------------------------
CREATE TABLE supplier_resources (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id         UUID            NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    resource_id         UUID            NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    unit_price          NUMERIC(10, 2)  NOT NULL CHECK (unit_price >= 0),
    available_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (supplier_id, resource_id)
);

CREATE INDEX idx_supplier_resources_supplier_id ON supplier_resources(supplier_id);
CREATE INDEX idx_supplier_resources_resource_id ON supplier_resources(resource_id);

-- ----------------------------------------------------------------
-- TABLE: procurement_orders
-- Purchase orders raised by hospital staff or the Procurement Agent.
-- total_cost is a generated column (quantity × unit_price).
-- ----------------------------------------------------------------
CREATE TABLE procurement_orders (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID            NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    supplier_id         UUID            NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    resource_id         UUID            NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    quantity            INTEGER         NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(10, 2)  NOT NULL CHECK (unit_price >= 0),
    total_cost          NUMERIC(12, 2)  GENERATED ALWAYS AS (quantity * unit_price) STORED,
    status              order_status    NOT NULL DEFAULT 'draft',
    created_by          UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    estimated_delivery  DATE,
    delivered_at        TIMESTAMPTZ,
    notes               TEXT
);

CREATE INDEX idx_procurement_hospital_id ON procurement_orders(hospital_id);
CREATE INDEX idx_procurement_status      ON procurement_orders(status);
CREATE INDEX idx_procurement_created_at  ON procurement_orders(created_at DESC);

-- ----------------------------------------------------------------
-- TABLE: alerts
-- Shortage, delay, outbreak, and threshold breach notifications.
-- resource_id is nullable for region-level/hospital-level alerts.
-- ----------------------------------------------------------------
CREATE TABLE alerts (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID            NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    resource_id UUID            REFERENCES resources(id) ON DELETE SET NULL,
    alert_type  alert_type      NOT NULL,
    severity    alert_severity  NOT NULL,
    message     TEXT            NOT NULL,
    status      alert_status    NOT NULL DEFAULT 'open',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID            REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_alerts_hospital_id ON alerts(hospital_id);
CREATE INDEX idx_alerts_status      ON alerts(status);
CREATE INDEX idx_alerts_severity    ON alerts(severity);
CREATE INDEX idx_alerts_created_at  ON alerts(created_at DESC);

-- ----------------------------------------------------------------
-- TABLE: agents
-- Registry of the 6 AI agents in the system.
-- ----------------------------------------------------------------
CREATE TABLE agents (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    agent_type  agent_type  NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'active',
    last_run_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: agent_logs
-- Structured activity logs from AI agents (relational side).
-- Unstructured / full-text content goes to MongoDB agent_intelligence.
-- metadata JSONB stores agent-specific context (region, resource, etc.)
-- ----------------------------------------------------------------
CREATE TABLE agent_logs (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id    UUID            NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    hospital_id UUID            REFERENCES hospitals(id) ON DELETE SET NULL,
    severity    log_severity    NOT NULL DEFAULT 'info',
    message     TEXT            NOT NULL,
    metadata    JSONB           NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_agent_id    ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_hospital_id ON agent_logs(hospital_id);
CREATE INDEX idx_agent_logs_severity    ON agent_logs(severity);
CREATE INDEX idx_agent_logs_created_at  ON agent_logs(created_at DESC);

-- GIN index for JSONB metadata queries
CREATE INDEX idx_agent_logs_metadata ON agent_logs USING GIN (metadata);

-- ----------------------------------------------------------------
-- TABLE: chat_sessions
-- One session per user conversation with the AI Copilot.
-- hospital_id scopes the context to a specific facility.
-- ----------------------------------------------------------------
CREATE TABLE chat_sessions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID        REFERENCES hospitals(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ----------------------------------------------------------------
-- TABLE: chat_messages
-- Individual messages within a session.
-- tokens_used is populated by the AI backend after each response.
-- ----------------------------------------------------------------
CREATE TABLE chat_messages (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID            NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        message_role    NOT NULL,
    content     TEXT            NOT NULL,
    tokens_used INTEGER,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ----------------------------------------------------------------
-- TABLE: risk_scores
-- Computed risk scores per hospital, generated by the Risk Analysis
-- Agent. contributing_factors holds a JSONB breakdown by resource.
-- ----------------------------------------------------------------
CREATE TABLE risk_scores (
    id                   UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id          UUID       NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    score                FLOAT      NOT NULL CHECK (score >= 0 AND score <= 100),
    risk_level           risk_level NOT NULL,
    contributing_factors JSONB      NOT NULL DEFAULT '{}',
    calculated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_hospital_id    ON risk_scores(hospital_id);
CREATE INDEX idx_risk_scores_calculated_at  ON risk_scores(calculated_at DESC);

COMMIT;
