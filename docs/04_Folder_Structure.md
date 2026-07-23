# ReConnect AI — Folder Structure
Version 1.0 — Draft for Approval

Three independently deployable codebases (separate repos or a monorepo with clear boundaries — monorepo recommended for now given team size, with clean package separation for future extraction).

```
reconnect-ai/
├── frontend/                      # React (Vite)
├── backend/                       # Node.js + Express
├── ai-service/                    # Python FastAPI
├── docs/                          # Architecture docs (these files)
└── docker-compose.yml             # Local dev orchestration (optional)
```

## 1. Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── api/                       # Axios instance + endpoint modules (missingPersons.api.js, auth.api.js...)
│   ├── assets/
│   ├── components/
│   │   ├── common/                # Buttons, Modals, Inputs, shared UI
│   │   ├── maps/                  # Leaflet map components
│   │   ├── charts/                # Chart.js wrappers
│   │   └── forms/                 # React Hook Form + Zod schemas per form
│   ├── features/                  # Feature-first organization (aligns with Clean Architecture)
│   │   ├── auth/
│   │   ├── missingPersons/
│   │   │   ├── components/
│   │   │   ├── hooks/             # useMissingPersonQuery, useCreateMissingPerson (React Query)
│   │   │   └── pages/
│   │   ├── foundPersons/
│   │   ├── sightings/
│   │   ├── matches/                # AI match review UI, explainability breakdown
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── admin/
│   ├── hooks/                     # Cross-cutting hooks (useAuth, useSocket)
│   ├── layouts/                   # RoleBasedLayout, DashboardLayout
│   ├── lib/                       # queryClient config, socket client setup
│   ├── routes/                    # React Router route definitions per role
│   ├── schemas/                   # Shared Zod validation schemas
│   ├── store/                     # Lightweight global state (if needed beyond React Query)
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 2. Backend (`/backend`) — Clean Architecture Layering

```
backend/
├── src/
│   ├── config/                    # db.js, redis.js, cloudinary.js, env.js
│   ├── modules/                   # Feature-first, each with its own layers
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── missingPersons/
│   │   │   ├── missingPersons.routes.js
│   │   │   ├── missingPersons.controller.js
│   │   │   ├── missingPersons.service.js     # business logic
│   │   │   ├── missingPersons.repository.js  # Mongoose queries isolated here
│   │   │   └── missingPersons.validation.js
│   │   ├── foundPersons/
│   │   ├── sightings/
│   │   ├── matches/                # AI result review, weight config
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── auditLogs/
│   ├── jobs/                       # BullMQ queue definitions + workers
│   │   ├── queues/embedAndMatch.queue.js
│   │   └── workers/embedAndMatch.worker.js
│   ├── integrations/
│   │   ├── aiService/              # HTTP client for FastAPI, service-JWT signing
│   │   └── cloudinary/
│   ├── models/                     # Mongoose schemas (one file per collection)
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── upload.middleware.js    # Multer + file validation
│   ├── sockets/                    # Socket.IO server, room management, event emitters
│   ├── utils/
│   ├── app.js                      # Express app assembly
│   └── server.js                   # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── Dockerfile
└── package.json
```

**Layering rule:** routes → controller (HTTP concerns only) → service (business logic) → repository (data access). Services never import Mongoose models directly — only repositories do. This is what makes the AI-service swap-out or a future database migration low-risk.

## 3. AI Service (`/ai-service`)

```
ai-service/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── embed_routes.py
│   │       ├── match_routes.py
│   │       └── health_routes.py
│   ├── core/
│   │   ├── config.py               # env settings via pydantic BaseSettings
│   │   └── security.py             # service JWT verification middleware
│   ├── models/                     # Pydantic request/response schemas
│   ├── services/
│   │   ├── face_service.py         # ArcFace / FaceNet wrappers
│   │   ├── text_service.py         # Sentence Transformers wrapper
│   │   ├── clothing_service.py     # YOLOv8 wrapper
│   │   └── matching_service.py     # combines raw similarity, returns per-factor scores
│   ├── index/
│   │   ├── faiss_manager.py        # incremental upsert, regional shard routing
│   │   └── shards/                 # persisted FAISS index files per region
│   ├── utils/
│   └── main.py                     # FastAPI app entrypoint
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 4. Cross-Cutting Notes

- **Config isolation:** all secrets (JWT secrets, Cloudinary keys, Mongo URI, service-to-service signing key) via environment variables, never committed — `.env.example` in each service documents required vars without values.
- **Testing:** Jest + Supertest for backend integration tests; Vitest + React Testing Library for frontend; Pytest for AI service.
- **Docker Compose (local dev):** spins up Mongo, Redis, backend, ai-service, frontend together for local integration testing without needing Atlas/Render access.

## 5. Open Decisions for Sign-Off

1. Monorepo (single Git repo, three folders) vs. three separate repos — monorepo recommended for now given shared documentation and easier atomic changes across service contracts; revisit if teams split later.
2. Confirm whether `ai-service/app/index/shards/` (FAISS index files) should persist to a mounted volume on Render or sync to cloud storage (e.g., S3-compatible) for durability across deploys — local disk on Render is ephemeral by default.
