# Meridian Airways Demo Application

**Meridian Airways** is a full‑stack demo platform that showcases a modern airline booking workflow, a simulated AI‑agent driven AIOps control plane, and a rich UI built with React, TypeScript, Vite, and MUI v9.  The application is containerised with Docker Compose and uses a SQLite database (persisted in `/tmp/meridianairways.db` inside the backend container).

---

## Table of Contents

1. [Features & Capabilities](#features--capabilities)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Getting Started (Docker Compose)](#getting-started-docker-compose)
5. [Running Locally (without Docker)](#running-locally-without-docker)
6. [Database Seeding & Sample Data](#database-seeding--sample-data)
7. [User Interface Walk‑through](#user-interface-walk-through)
8. [API Reference](#api-reference)
9. [AI Agent & AIOps Documentation](#ai-agent--aiops-documentation)
10. [Testing & Debugging](#testing--debugging)
11. [Known Limitations & Next Steps](#known-limitations--next-steps)
12. [License & Attribution](#license--attribution)

---

## Features & Capabilities

- **Dynamic Popular Routes & Featured Flights** – dates are generated at runtime based on the current day, ensuring the UI always shows upcoming flights.
- **Full Booking Flow** – select a flight, choose cabin class, specify passenger count, review, “pay” (mocked), and receive a real PNR persisted to SQLite.
- **Cancellation & Refund Workflow** – `POST /api/bookings/{pnr}/cancel` creates a `RefundRequest` entry and logs the decision; supports automatic and human‑review paths based on cabin class and amount.
- **Database Viewer** – a tabular UI (`/db`) that displays Flights, Airports, Customers, Bookings (newest first) and Refund Reasons for cancelled or refund‑requested bookings.
- **AI Agent Center** (`/agents`) – a mock multi‑agent UI that visualises how specialized agents (Booking, Policy, Eligibility, Risk, Approval, Notification) would collaborate.
- **AIOps Console** (`/ops`) – a live audit‑log viewer that streams actions from the backend every 8 seconds; demonstrates observability for AI‑driven operations.
- **Passenger‑Count Pricing** – the checkout dialog now asks for the number of passengers and automatically multiplies the fare (including 2× multiplier for Business/First class).
- **Comprehensive Documentation** – `prompts.md` (system prompts for each agent) and `skills.md` (API/skill catalogue) are version‑controlled alongside the code.

---

## Architecture Overview

```
+----------------------+      +----------------------+      +----------------------+
|  Frontend (Vite)     | <--->|  API Gateway (FastAPI) | <--->|  SQLite ( /tmp )    |
|  React + MUI v9      |      |  Python 3.12           |      |  meridianairways.db |
+----------------------+      +----------------------+      +----------------------+
          ^                               ^
          |                               |
   Docker network (backend)      Docker network (frontend)
```

- **Frontend** runs on `http://localhost:3000` (or `http://frontend:3000` inside Docker).
- **Backend** exposes a REST API under `/api/*` and serves the UI in production mode.
- **Docker Compose** wires both services together; the backend uses `depends_on` to ensure the DB container is ready.

---

## Prerequisites

- **Docker Desktop** (or any Docker Engine) – version 20.10+.
- **Docker‑Compose** – v2 (included with Docker Desktop).
- **Git** – for cloning/pushing the repository.
- (Optional) **Node.js** ≥ 20 & **npm** ≥ 10 if you want to run the frontend without Docker.

---

## Getting Started (Docker Compose)

1. **Clone the repo** (if you haven’t already):
   ```bash
   git clone https://github.com/RCMPasha/airlinedemoapps.git
   cd airlinedemoapps
   ```
2. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```
   - Backend will be reachable at `http://localhost:8000` (internal), but the UI proxies to it automatically.
   - Frontend will be reachable at `http://localhost:3000`.
3. **Initial seeding** – the first container start runs `backend/seed.py`. It populates:
   - 76+ global and GCC airports.
   - 100+ synthetic flights and customers.
   - 100+ confirmed bookings (for cancellation/refund demos).
   - Sample `RefundRequest` entries.
4. **Open the UI** in a browser: `http://localhost:3000`.
   - **Home** – browse popular routes and featured flights.
   - **Customer Portal** – search, select a flight, go through the booking dialog.
   - **Database Viewer** – `/db` shows all data, including the newest bookings.
   - **AI Agent Center** – `/agents` illustrates the multi‑agent reasoning flow.
   - **AIOps Console** – `/ops` streams audit logs.
5. **Stop the stack** when you’re done:
   ```bash
   docker-compose down
   ```
   The SQLite file lives inside the container (`/tmp/meridianairways.db`) and will be removed on teardown unless you mount a persistent volume.

---

## Running Locally (without Docker)

> This is useful for developers who want hot‑module reloading.

1. **Backend**
   ```bash
   cd airlinesapp/backend
   python -m venv .venv
   source .venv/bin/activate   # on Windows: .\.venv\Scripts\activate
   pip install -r requirements.txt
   # Ensure the DB file is placed in /tmp (or edit database.py to a local path)
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
2. **Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev   # Vite dev server on http://localhost:5173 (proxy to backend)
   ```
3. The UI will proxy API calls to `http://localhost:8000` automatically (see `vite.config.ts`).

---

## Database Seeding & Sample Data

The `backend/seed.py` script is called automatically on **every backend startup** via a FastAPI startup event.

- It is **idempotent** – it checks if bookings already exist before inserting, so it is safe to restart containers without duplicating data.
- It creates:
  - **Airports** – 76 entries covering GCC, Saudi Arabia, and major global hubs.
  - **Flights** – realistic future dates, random aircraft, base prices.
  - **Customers** – 100 synthetic customers with loyalty tiers (Blue, Silver, Gold, Platinum).
  - **Bookings** – 109 bookings including 5 specific demo scenarios (Economy Flex, Business Class high‑value, Cancelled Flight, Fraud Risk, Medical Emergency).
  - **Refund Requests** – pre‑seeded for each demo scenario; new ones are created automatically when a booking is cancelled via the API.
  - **Audit Logs** – initial entries showing eligibility and approval agent decisions.

### Manual Seeding

To force‑seed (e.g., database is empty after a failed start):

```bash
# Run inside the backend container
docker-compose exec backend python -c "
from database import SessionLocal, engine, Base
import models, seed
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed.seed_db(db, force=True)
db.close()
print('Done')
"
```

### Policy Files

Policy documents are Markdown files stored in `backend/policy_files/`. They are served by the `/api/policy-files` endpoint and used by the AI Refund Agent to make decisions.

```bash
# List available policies
curl http://localhost:8000/api/policy-files

# Or view them directly
ls backend/policy_files/
```

To add a new policy, simply drop a `.md` file into `backend/policy_files/`. No restart needed – the endpoint reads from disk at request time.

### DB is Empty or Corrupt — Recovery Steps

The pre-seeded `backend/meridianairways.db` is committed to the repository. If the UI shows **0 records**, or if the database becomes corrupt, follow one of the recovery paths below.

#### Option A – Restore from Git (recommended)

This restores the exact known-good database that was committed with seed data.

```bash
# 1. Stop the containers
docker-compose down

# 2. Restore the DB file from git
git checkout -- backend/meridianairways.db

# 3. Restart (no rebuild needed)
docker-compose up -d

# 4. Verify
docker-compose exec backend python /app/check_db.py
# Expected: Bookings count: 109
```

#### Option B – Force Re-seed (when you want a fresh database)

Use this when you've deleted the DB file and want the seed script to recreate it.

```bash
# 1. Stop the containers
docker-compose down

# 2. Delete the stale / corrupt DB file
#    Windows PowerShell:
Remove-Item -Path "backend\meridianairways.db" -ErrorAction SilentlyContinue
#    Mac / Linux:
# rm backend/meridianairways.db

# 3. Rebuild and start (seed.py runs automatically on startup)
docker-compose up -d --build

# 4. Verify
docker-compose exec backend python /app/check_db.py
# Expected: Bookings count: 109
```

#### Option C – Force-seed without deleting the DB

Use this if the DB file exists but is empty (e.g., tables were created but data was never inserted).

```bash
docker-compose exec backend python -c "
from database import SessionLocal, engine, Base
import models, seed
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed.seed_db(db, force=True)
db.close()
print('Done — seeding complete')
"
```

#### Verify health at any time

```bash
docker-compose exec backend python /app/check_db.py
```

Expected output:

```
DB path: /app/meridianairways.db
Tables: [('airports',), ('customers',), ('audit_logs',), ('flights',), ('bookings',), ('refund_requests',)]
Bookings count: 109
```



---

## User Interface Walk‑through

| Page | What it Shows | Key Interactions |
|------|---------------|------------------|
| **Home** (`/`) | Popular Routes (dynamic dates) and Featured Flights. | Click **Select** → opens the **Booking Dialog**. |
| **Booking Dialog** | Review flight, choose cabin, passenger count, mock payment, confirmation. | After confirming, the backend creates a real `bookings` row; the PNR appears in the UI. |
| **Database Viewer** (`/db`) | Tabs for Flights, Airports, Customers, Bookings. | Bookings are sorted newest‑first; cancelled/refund‑requested rows show the *Refund Reason* column. |
| **AI Agent Center** (`/agents`) | Visualised multi‑agent flow for a given scenario. | Demonstrates how each agent contributes (policy, eligibility, risk, approval, notification). |
| **AIOps Console** (`/ops`) | Live audit‑log feed refreshed every 8 s. | Shows every action taken by the agents and the backend, perfect for observability demos. |

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Example Payload |
|--------|----------|-------------|-----------------|
| `GET` | `/api/flights?limit=500` | List flights (optional `limit`). | – |
| `GET` | `/api/customers?limit=500` | List customers. | – |
| `GET` | `/api/airports` | List all airports. | – |
| `GET` | `/api/bookings` | List all bookings (newest first). | – |
| `POST` | `/api/bookings` | Create a booking. | `{ "customer_id": 1, "flight_id": 42, "cabin_class": "Economy Flex", "passengers": 2 }` |
| `POST` | `/api/bookings/{pnr}/cancel` | Cancel a booking, create a `RefundRequest`. Optional query param `reason`. | – |
| `GET` | `/api/refunds` | List all refund requests. | – |
| `POST` | `/api/refunds/{refund_id}/approve` | Approve a pending refund (human‑review). | `{ "comments": "Approved by supervisor" }` |
| `POST` | `/api/refunds/{refund_id}/reject` | Reject a pending refund. | `{ "comments": "Rejected – fraud risk" }` |
| `GET` | `/api/audit-logs` | Retrieve ordered audit‑log entries (used by AIOps Console). | – |
| `GET` | `/api/policy-files` | Retrieve all airline cancellation/refund policy documents (Markdown content). | – |


---

## AI Agent & AIOps Documentation

- **`prompts.md`** – system prompts that define each agent’s persona and policy rules.
- **`skills.md`** – catalogue of functions/APIs the agents can call (e.g., `get_booking_details`, `update_booking_status`, `log_audit_trail`).  These are the “skills” the future LLM‑orchestrator would invoke.
- The **AI Agent Center** UI uses hard‑coded mock data to illustrate the flow, but the prompts/skills are ready for a real LLM integration.

---

## Testing & Debugging

- **Unit tests** – none are shipped in the demo, but you can add `pytest` tests in `backend/tests/`.
- **Live logs** – run `docker logs airlinesapp-backend-1` to see FastAPI request logs.
- **Database inspection** – open SQLite client inside the container:
  ```bash
  docker exec -it airlinesapp-backend-1 bash
  sqlite3 /app/meridianairways.db
  ```
  Then you can run `SELECT * FROM bookings ORDER BY id DESC LIMIT 10;`.
- **Quick DB health check**:
  ```bash
  docker-compose exec backend python /app/check_db.py
  ```
- **Frontend hot‑reload** – when running with `npm run dev`, changes to `.tsx` files refresh automatically.

---

## Known Limitations & Next Steps

| Limitation | Current Work‑around | Planned Improvement |
|------------|---------------------|----------------------|
| **AI Agent prompt execution** – UI is mock only. | Demonstrates reasoning visually. | Integrate an LLM (e.g., LangGraph, AutoGen) and wire the `skills` functions. |
| **Payment gateway** – mock payment UI. | No real transaction. | Plug in Stripe/PayPal sandbox for real payment flow. |
| **Large Docker images** – Vite build > 500 KB chunks. | Acceptable for demo. | Code‑split with dynamic imports, enable chunk‑size limit tuning. |
| **Pydantic V2 warnings** – `orm_mode` deprecated. | Warnings suppressed or displayed at startup. | Migrate Pydantic models to V2 config system (`model_config = ConfigDict(from_attributes=True)`). |


---

## License & Attribution

This demo repository is released under the **MIT License**. It uses the following open‑source components:
- **FastAPI** – https://fastapi.tiangolo.com/
- **SQLAlchemy** – https://www.sqlalchemy.org/
- **MUI v9** – https://mui.com/
- **Vite** – https://vitejs.dev/
- **date‑fns** – https://date-fns.org/

Feel free to fork, extend, or adapt the project for your own demo or production‑grade use case.

---

**Happy demoing!** 🚀
