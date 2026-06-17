# 1. Architecture Overview

## System Architecture
    Client          API Server            Timer System
    |                 |                      |
    | POST /monitors  |                      |
    |---------------> |                      |
    |                 | create monitor       |
    |                 | start 60s timer      |
    |                 |--------------------->|
    |                 |                      |
    |<--------------- | 201 Created          |
    |                 |                      |
    |                 |                      |
    | POST heartbeat  |                      |
    |---------------> |                      |
    |                 | reset timer          |
    |                 | stop old timer       |
    |                 | start new timer      |
    |                 |--------------------->|
    |<--------------- | 200 OK               |
    |                 |                      |
    |                 |                      |
    |   (no heartbeat received)              |
    |                 |                      |
    |                 | timer expires        |
    |                 |--------------------->|
    |                 | trigger ALERT        |
    |                 | console.log alert    | 

The system is a stateful monitoring service combining:
* SQLite (persistent state)
* In-memory timers (runtime state)
* Express API (control layer)

## Flow Diagram - Sequence Logic

1. ## Monitor Creation

    Client → POST /monitors
            ↓
    Validate request
            ↓
    Save monitor in SQLite (status = ACTIVE)
            ↓
    Start countdown timer (setTimeout)
            ↓
    Store timer in memory (timers[id])
            ↓
    Return 201 response


2. ## Heartbeat Reset

    Device → POST /monitors/:id/heartbeat
            ↓
    Fetch monitor from DB
            ↓
    If ACTIVE:
        - clear old timer
        - start new timer
        - reset countdown
            ↓
    Return 200 OK

3. ## Pause Monitoring

    Client → POST /monitors/:id/pause
            ↓
    Update DB status = PAUSED
            ↓
    Clear in-memory timer
            ↓
    No alerts will trigger

4. ## Failure Detection (Auto Alert)

    Timer expires (no heartbeat)
            ↓
    Trigger callback
            ↓
    Log ALERT
            ↓
    Update DB status = DOWN
            ↓
    Remove timer from memory

---

## 2. Setup Instruction

### Install dependencies
npm install

### Run server
npm start

### Environment
- Node.js (v16+ recommended)
- SQLite (file-based database: monitors.db)
- No external services required

---

## 3. API Documentation
## Create Monitor
**POST** /monitors 
- Creates a new monitoring device
```json
{
  "id": "device-123",
  "timeout": 60,
  "alert_email": "admin@critmon.com"
}
```

## Heartbeat
**POST** /monitors/:id/heartbeat 
- Resets the countdown timer for a device

Response:
```json
{
  "message": "Heartbeat received",
  "id": "device-123"
}
```
## Pause Monitor
**POST** /monitors/:id/pause 
- Stops monitoring temporarily. No alerts will be triggered.

---

## 4. Developer Choice Feature

### GET /monitors
Returns all monitored devices with status and timeout.

### Improvement
I added this endpoint to improve observability and debugging.

---

## 5. System Design Notes
- SQLite is used for persistent storage of monitor configurations and status
- In-memory timers (setTimeout) are used for real-time countdown tracking
- Timers are NOT stored in the database because they are runtime state
- If the server restarts, timers reset but database state remains intact
- This separation ensures reliability and simplicity

