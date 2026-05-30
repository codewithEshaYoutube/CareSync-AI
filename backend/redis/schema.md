# CareSync AI — Redis Schema

Redis serves two purposes:
1. **Sub-second metric reads** — cache latest hospital metrics so dashboards never block on PostgreSQL.
2. **Pub/Sub fan-out** — broadcast metric changes to WebSocket clients in real time.

---

## Connection

```
REDIS_URL=redis://localhost:6379/0
```

---

## Key Reference

### Hospital Metrics (Hash)

**Key:** `hospital:{hospital_uuid}:metrics`
**Type:** Hash
**TTL:** 30 seconds
**Updated by:** Operations Agent, Supply Intelligence Agent on every metric write

| Field        | Type   | Example            | Description                          |
|--------------|--------|--------------------|--------------------------------------|
| `oxygen`     | float  | `"84.5"`           | Oxygen capacity %                    |
| `icu`        | float  | `"92.1"`           | ICU occupancy %                      |
| `pharma`     | float  | `"78.2"`           | Pharmaceutical stock %               |
| `risk_score` | float  | `"45.0"`           | Latest computed risk score (0–100)   |
| `risk_level` | string | `"moderate"`       | `low/moderate/high/critical`         |
| `updated_at` | int    | `"1717000000"`     | Unix timestamp of last update        |

**Write pattern:**
```python
pipe = redis.pipeline()
pipe.hset(f"hospital:{hospital_id}:metrics", mapping={
    "oxygen": 84.5, "icu": 92.1, "pharma": 78.2,
    "risk_score": 45.0, "risk_level": "moderate",
    "updated_at": int(time.time())
})
pipe.expire(f"hospital:{hospital_id}:metrics", 30)
pipe.execute()
```

---

### Inventory History Sliding Window (Sorted Set)

**Key:** `hospital:{hospital_uuid}:{resource_name}:history`
**Type:** Sorted Set
**TTL:** 86400 seconds (24 hours)
**Member:** JSON string `{"value": 84.5, "status": "stable"}`
**Score:** Unix timestamp (float)

Supports efficient range queries for chart data:

```python
# Last 48 readings
now = time.time()
entries = redis.zrangebyscore(
    f"hospital:{hospital_id}:oxygen:history",
    now - 3600, now,  # last hour
    withscores=True
)
```

---

### Active Alerts (Set)

**Key:** `alerts:active`
**Type:** Set
**TTL:** None (managed explicitly)
**Members:** Alert UUID strings

```python
redis.sadd("alerts:active", str(alert_id))
redis.srem("alerts:active", str(alert_id))   # on resolve
count = redis.scard("alerts:active")
```

---

### Agent Status (Hash)

**Key:** `agents:status`
**Type:** Hash
**TTL:** 60 seconds
**Updated by:** Each agent on every run

| Field (agent name)          | Value         |
|-----------------------------|---------------|
| `supply_intelligence`       | `"active"`    |
| `procurement`               | `"active"`    |
| `risk_analysis`             | `"active"`    |
| `emergency_monitoring`      | `"idle"`      |
| `operations`                | `"active"`    |
| `executive_reporting`       | `"idle"`      |

---

### User Sessions (String)

**Key:** `session:{session_uuid}`
**Type:** String (JSON)
**TTL:** 86400 seconds (24 hours)

```json
{
  "user_id": "uuid",
  "email": "sarah.chen@caresync.gov.in",
  "role": "admin",
  "hospital_id": null,
  "issued_at": 1717000000
}
```

---

### Chat Rate Limiter (String)

**Key:** `ratelimit:{user_uuid}:chat`
**Type:** String (integer counter)
**TTL:** 60 seconds (sliding window)

```python
count = redis.incr(f"ratelimit:{user_id}:chat")
if count == 1:
    redis.expire(f"ratelimit:{user_id}:chat", 60)
if count > 20:
    raise RateLimitExceeded
```

---

## Pub/Sub Channels

### `metrics:updates`

Published by the metric writer whenever any hospital metric changes.
WebSocket handler subscribes and fans out to connected dashboard clients.

**Message format (JSON):**
```json
{
  "hospital_id": "b1000000-0000-0000-0000-000000000002",
  "hospital_name": "AIIMS New Delhi",
  "region": "Delhi NCR",
  "metrics": {
    "oxygen": 24.0,
    "icu": 92.1,
    "pharma": 61.0,
    "risk_score": 78.0,
    "risk_level": "high"
  },
  "timestamp": 1717000000
}
```

### `alerts:new`

Published when a new alert is created by any agent.

**Message format (JSON):**
```json
{
  "alert_id": "uuid",
  "hospital_id": "uuid",
  "hospital_name": "AIIMS New Delhi",
  "alert_type": "shortage",
  "severity": "critical",
  "message": "Oxygen supply at AIIMS New Delhi has dropped to 24%.",
  "created_at": "2026-05-27T10:00:00Z"
}
```

---

## Key Naming Conventions

- Separator: `:` (colon)
- UUIDs: full lowercase hyphenated UUID strings
- Resource names: lowercase snake_case matching `resources.name` column
- No spaces in keys

## TTL Policy

| Pattern                             | TTL        | Rationale                               |
|-------------------------------------|------------|-----------------------------------------|
| `hospital:*:metrics`                | 30s        | Dashboard feels live; auto-clears stale |
| `hospital:*:*:history`              | 24h        | Chart range covers last 48h             |
| `alerts:active`                     | None       | Managed explicitly on resolve           |
| `agents:status`                     | 60s        | Agent heartbeat; stale = agent down     |
| `session:*`                         | 24h        | Sliding auth session                    |
| `ratelimit:*`                       | 60s window | Per-minute rate limit                   |
