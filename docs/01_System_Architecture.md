# ReConnect AI — Software Architecture Document
Version 1.0 — Draft for Approval

## 1. Purpose

ReConnect AI is a multi-tenant, role-based platform connecting families, citizens, police, hospitals, and NGOs/shelters through a centralized case-management system powered by a multi-factor AI matching engine. This document defines the system architecture, service boundaries, and communication contracts prior to implementation.

## 2. Architectural Style

- **Pattern:** Microservice architecture with a single orchestrating backend
- **Principles:** Clean Architecture, SOLID, Domain-Driven folder boundaries, stateless services where possible
- **Communication:** REST over HTTPS between services; WebSocket (Socket.IO) for real-time client push; message queue (Redis + BullMQ) for async AI jobs

## 3. High-Level Components

```
┌─────────────────────┐
│   React (Vite) SPA   │
│  Tailwind / RQuery   │
└──────────┬───────────┘
           │ HTTPS (REST) + WebSocket
           ▼
┌──────────────────────────────────────────────┐
│           Node.js + Express API (Core)         │
│  Auth · RBAC · Business Logic · Orchestration  │
│  Notifications (Socket.IO) · Audit Logging     │
└───┬─────────────┬─────────────┬────────────────┘
    │             │             │
    ▼             ▼             ▼
┌─────────┐  ┌───────────┐  ┌────────────────────┐
│ MongoDB │  │ Cloudinary│  │  Redis              │
│  Atlas  │  │ (Media)   │  │  (Cache/Session/    │
│         │  │           │  │   BullMQ job queue) │
└─────────┘  └───────────┘  └─────────┬───────────┘
                                       │ job dispatch
                                       ▼
                        ┌───────────────────────────┐
                        │   Python FastAPI AI Service │
                        │   (Internal network only)   │
                        │  ArcFace · FaceNet · YOLOv8  │
                        │  Sentence Transformers · FAISS│
                        └───────────────────────────┘
```

## 4. Service Responsibilities

### 4.1 React Frontend
- Renders role-specific dashboards (Family, Citizen, Police, Hospital, NGO, Admin)
- Never talks directly to MongoDB, Cloudinary, or FastAPI
- All data access goes through the Node API only

### 4.2 Node.js + Express (Core Orchestrator)
Sole owner of:
- Authentication & RBAC
- All database reads/writes
- File upload proxying to Cloudinary (browser never uploads directly)
- Dispatching AI jobs to FastAPI (via queue, not direct blocking call)
- Persisting AI results returned from FastAPI
- Real-time notification delivery (Socket.IO)
- Audit logging of every state-changing action
- Rate limiting, input validation, security headers (Helmet)

### 4.3 Python FastAPI AI Service
- Stateless request/response layer, **except** for the FAISS index, which is its only persisted state
- Exposes internal-only endpoints (never public) protected by short-lived service JWTs issued by Node
- Responsibilities:
  - Generate face embeddings (ArcFace / FaceNet)
  - Generate text embeddings for descriptions (Sentence Transformers)
  - Detect/classify clothing and objects (YOLOv8)
  - Maintain and query FAISS index (sharded by region)
  - Compute per-factor similarity scores and return them — **not** a single blended number; Node (or a shared scoring module) applies configurable weights so the weighting logic isn't buried in the ML layer
- Never accesses MongoDB directly

### 4.4 MongoDB Atlas
- Single logical database, multiple collections, referential linking between organizations and records (see Database Design doc)

### 4.5 Cloudinary
- Stores all images/videos
- Access flow: Browser → Node → Cloudinary → URL stored in Mongo → URL passed to FastAPI for inference (FastAPI fetches the image from the URL to compute embeddings; it does not store it)

### 4.6 Redis
- Session/cache store
- BullMQ job queue for async AI embedding/matching jobs (recommended addition — see Section 7)

## 5. Key Workflows

### 5.1 Registering a Missing Person (Family)
1. Family submits form (photos, description, last known location) → Node
2. Node validates input (Zod on frontend, express-validator/Joi on backend)
3. Node uploads photo(s) to Cloudinary → gets secure URL
4. Node writes `MissingPersons` document to MongoDB (status: `pending_embedding`)
5. Node enqueues an `embed_and_match` job on the Redis/BullMQ queue with the record ID, image URL(s), and metadata
6. Worker picks up job → calls FastAPI (`POST /internal/embed`) with a signed service token
7. FastAPI generates embeddings, upserts into the appropriate regional FAISS shard, computes candidate matches against `FoundPersons` embeddings, returns per-factor similarity scores for top-N candidates
8. Node computes the final weighted confidence score using the configurable weight table, writes results to `AIResults`, updates record status to `active`
9. If confidence exceeds the "notify" threshold, Node creates a `Notifications` entry and pushes via Socket.IO to relevant Police/Admin users for verification — **families are not notified until a human verifies the match** (per your original requirement)

### 5.2 Sighting Report (Citizen)
1. Citizen submits sighting (optionally anonymous) with photo/location → Node
2. Node applies rate limiting + CAPTCHA validation, computes a `trustScore` contribution
3. Same embed/match pipeline as above, tagged as a `Sightings` record linked to any matched `MissingPersons` case

### 5.3 Match Verification (Police/Admin)
1. Police views ranked `AIResults` with full factor breakdown (explainability)
2. Approves → triggers family notification + case status update + audit log entry
3. Rejects → match marked `dismissed`, feeds back into future model tuning data (optional future enhancement)

## 6. Real-Time Notifications
- Socket.IO server co-located with Node API, using Redis adapter for horizontal scaling across multiple Node instances
- Events: `new_match_suggested`, `match_verified`, `case_status_changed`, `new_sighting_nearby`

## 7. Recommended Additions to Your Original Design

| Area | Recommendation | Why |
|---|---|---|
| Node↔FastAPI coupling | Introduce Redis/BullMQ async queue instead of direct blocking HTTP calls | Avoids request timeouts at scale, gives retry/backoff for free |
| FAISS scaling | Shard index by region (state/city) | A single global index won't scale to "multiple states/government integration" |
| Service auth | Short-lived signed JWT per Node→FastAPI call, FastAPI deployed on private network only | Prevents the AI service from ever being publicly reachable |
| Sensitive data | Store only embedding references/IDs in MongoDB, never raw embeddings | Reduces breach blast radius, aligns with biometric data regulations |
| Idempotency | Unique compound index on (sourceId, targetId, modelVersion) in AIResults | Prevents duplicate results from retried jobs |
| Abuse prevention | CAPTCHA + rate limit + trust score on anonymous citizen reports | Public-facing endpoints are the highest-risk surface |
| Org onboarding | Admin-gated verification workflow before an org account can write data | Prevents fake police/hospital/NGO accounts from accessing case data |
| Observability | Correlation IDs propagated across Node→Queue→FastAPI | Debugging a 3-hop async pipeline without tracing is very painful at scale |

## 8. Deployment Topology

| Service | Platform | Notes |
|---|---|---|
| React frontend | Vercel | Static build, CDN-distributed |
| Node.js API | Render (Web Service) | Horizontally scalable, sticky sessions not required if Socket.IO uses Redis adapter |
| FastAPI AI service | Render (Private Service) | **Not** publicly routable; internal networking only |
| MongoDB | MongoDB Atlas | Multi-region read replicas as scale grows |
| Redis | Render/Upstash | Used for cache, sessions, and BullMQ |
| Cloudinary | Cloudinary managed | — |

## 9. Non-Functional Requirements

- **Security:** JWT auth, RBAC, Helmet, express-rate-limit, CORS allowlist, Multer + file-type/magic-byte validation, service-to-service auth for FastAPI
- **Scalability:** Stateless Node instances behind a load balancer, Redis-backed sessions/sockets, regionally sharded FAISS
- **Privacy:** Consent tracking, data retention policy, minimal biometric data at rest in MongoDB
- **Auditability:** Every state-changing action logged to `AuditLogs` with actor, action, before/after state, timestamp
- **Maintainability:** Clean Architecture layering (routes → controllers → services → repositories) in Node; modular routers in FastAPI

## 10. Open Decisions for Sign-Off

1. Approve async queue (BullMQ) addition, or keep synchronous Node→FastAPI calls for MVP simplicity?
2. Approve regional FAISS sharding now vs. single index for MVP with sharding as a fast-follow?
3. Confirm data retention period for unresolved/cold cases and for rejected AI matches.
