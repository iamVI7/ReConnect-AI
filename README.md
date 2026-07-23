# ReConnect AI

**Connecting Missing Lives with Their Families.**

ReConnect AI unifies families, citizens, police, hospitals, NGOs, and shelters on one
platform, using an explainable, multi-factor AI matching engine to help identify and
reunite missing persons faster — without any single family ever being contacted by
an algorithm. Every AI-suggested match is reviewed and verified by a person before
anyone is notified.

> **Project status:** early scaffold. Architecture, database design, and API
> specification are approved (see `/docs`). Feature implementation is in progress,
> following the development order below.

---

## Repository layout

```
reconnect-ai/
├── frontend/        React (Vite) — the web application
├── backend/         Node.js + Express — the only service with database access
├── ai-service/       Python FastAPI — internal-only inference microservice
├── docs/             Approved architecture, database, and API design documents
└── docker-compose.yml
```

Read `/docs` first — it's the source of truth for every architectural decision in
this codebase:

1. `01_System_Architecture.md` — service boundaries, workflows, deployment topology
2. `02_Database_Design.md` — MongoDB collections, indexes, access control
3. `03_API_Specification.md` — every REST route, by role
4. `04_Folder_Structure.md` — Clean Architecture layering for all three codebases

## Architecture, in one sentence

`React → Node.js (auth, business logic, all DB writes) → MongoDB / Cloudinary`, and
separately `Node.js → FastAPI (stateless inference + FAISS index) → results back to Node`.
The AI service is never publicly reachable and never touches MongoDB directly.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, TanStack Query, Framer Motion, React Hook Form + Zod, Leaflet, Chart.js |
| Backend | Node.js, Express, MongoDB Atlas + Mongoose, JWT, bcrypt, Multer, Cloudinary, Socket.IO, Redis + BullMQ |
| AI service | Python, FastAPI, PyTorch, ArcFace, FaceNet, Sentence Transformers, FAISS, YOLOv8 |
| Deployment | Vercel (frontend), Render (backend + AI service), MongoDB Atlas, Cloudinary |

## Getting started (local development)

### Prerequisites
- Node.js ≥ 20
- Python ≥ 3.11
- MongoDB (local or Atlas connection string)
- Redis (local or hosted)
- A Cloudinary account (for image uploads)

### Option A — Docker Compose (recommended for first run)
```bash
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
cp frontend/.env.example frontend/.env
# fill in real values (Cloudinary keys, JWT secrets) in each .env file

docker compose up --build
```
This starts MongoDB, Redis, the backend (`:5000`), the AI service (`:8000`), and the
frontend (`:5173`) together.

### Option B — Run each service manually

**1. Backend**
```bash
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev            # http://localhost:5000
```

**2. AI service**
```bash
cd ai-service
cp .env.example .env
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

**3. Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Once all three are running, visiting `http://localhost:5173` loads the landing page,
which links through to sign-up/sign-in. Feature pages (case registration, match
review, dashboards) are implemented incrementally per the API Specification.

## Design direction (frontend)

The UI intentionally avoids a "startup SaaS" or "government form" look — this is a
platform people use during one of the worst moments of their lives, so it aims for
calm, minimal, and trustworthy rather than flashy:

- **Palette:** warm paper-white background, deep slate-teal for institutional trust,
  a warm amber accent used sparingly for the moments that matter (a found match),
  sage green for verified states.
- **Type:** Fraunces (serif display) paired with Inter (body) and IBM Plex Mono for
  case IDs and timestamps.
- **Motion:** a single signature animation — a pulsing "beacon" representing the AI
  continuously scanning records — plus quiet scroll reveals and hover
  micro-interactions elsewhere. All animation respects `prefers-reduced-motion`.
- **Responsive:** mobile-first Tailwind breakpoints throughout; verify at 375px,
  768px, and 1280px+ as new pages are added.

## Development order

Per the approved plan, implementation proceeds in this sequence:

1. ~~System Architecture~~ ✅
2. ~~Folder Structure~~ ✅
3. ~~Database Design~~ ✅
4. ~~API Specification~~ ✅
5. Authentication & RBAC
6. Backend implementation (feature modules)
7. Frontend implementation (feature pages)
8. AI service (real model integration)
9. AI integration (Node ↔ FastAPI job pipeline)
10. Real-time notifications
11. Maps & analytics
12. Testing
13. Deployment
14. Documentation

## Security notes

- The AI service is **never** publicly exposed — only Node.js can call it, using a
  short-lived signed service token.
- Browsers **never** talk to Cloudinary directly — all uploads proxy through Node so
  they can be validated first.
- Raw biometric data (face images/vectors) is never stored in MongoDB — only
  Cloudinary URLs and FAISS vector *references*.

## License

Proprietary — all rights reserved (update if this changes).
=======
# ReConnect-AI
