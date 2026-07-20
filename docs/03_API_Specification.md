# ReConnect AI — API Specification
Version 1.0 — Draft for Approval
Style: RESTful JSON APIs, versioned under `/api/v1`

## 1. Conventions

- Auth: `Authorization: Bearer <JWT>` on all routes except `/auth/*`
- All list endpoints support `?page=&limit=&sort=`
- All responses: `{ success: Boolean, data: Object|Array, error: Object|null, meta: Object }`
- RBAC enforced via middleware reading `req.user.role.permissions`
- Rate limits noted per route where relevant

## 2. Auth & Users — `/api/v1/auth`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register family/citizen account |
| POST | `/register/organization` | Public | Register org account (police/hospital/ngo/shelter) — goes to `pending_verification` |
| POST | `/login` | Public (rate-limited) | Returns access + refresh JWT |
| POST | `/refresh-token` | Public | Rotate access token |
| POST | `/logout` | Authenticated | Invalidate refresh token (Redis) |
| POST | `/forgot-password` | Public (rate-limited) | Send reset link |
| POST | `/reset-password` | Public | Reset via token |
| GET | `/me` | Authenticated | Current user profile |

## 3. Users & Organizations — `/api/v1/users`, `/api/v1/organizations`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List/search users |
| GET | `/users/:id` | Admin, Self | User detail |
| PATCH | `/users/:id` | Admin, Self (limited fields) | Update profile |
| PATCH | `/users/:id/suspend` | Admin | Suspend account |
| GET | `/organizations` | Admin | List organizations |
| POST | `/organizations/:id/verify` | Admin | Approve org verification |
| POST | `/organizations/:id/reject` | Admin | Reject org verification |

## 4. Missing Persons — `/api/v1/missing-persons`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Family | Create case (multipart: photos + fields) |
| GET | `/` | Family (own), Police, Admin | List/search cases |
| GET | `/:id` | Owner, Police, Admin | Case detail |
| PATCH | `/:id` | Owner, Police, Admin | Update case info |
| POST | `/:id/photos` | Owner, Police, Admin | Add additional photo (triggers re-embedding job) |
| GET | `/:id/matches` | Owner, Police, Admin | Ranked AI matches with explainability breakdown |
| GET | `/:id/timeline` | Owner, Police, Admin | Full case history/audit view |
| DELETE | `/:id` | Owner, Admin | Soft delete |

## 5. Found Persons — `/api/v1/found-persons`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Hospital, NGO, Shelter, Police | Register unidentified/rescued person |
| GET | `/` | Registering org, Police, Admin | List/search |
| GET | `/:id` | Registering org, Police, Admin | Detail |
| PATCH | `/:id` | Registering org, Police, Admin | Update status (medical/rehab) |
| GET | `/:id/matches` | Registering org, Police, Admin | Ranked AI matches |

## 6. Sightings — `/api/v1/sightings`

| Method | Route | Access | Rate limit |
|---|---|---|---|
| POST | `/` | Citizen (auth or anonymous token) | 5/hour per IP |
| GET | `/` | Police, Admin | — |
| GET | `/nearby?lat=&lng=&radius=` | Police, Admin, Family (own case only) | — |
| POST | `/:id/verify` | Police | — |
| POST | `/:id/mark-false` | Police | — |

## 7. AI Matching — `/api/v1/matches`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/pending` | Police, Admin | Queue of unreviewed AI matches, sorted by confidence |
| GET | `/:id` | Police, Admin | Full factor breakdown for one match |
| POST | `/:id/approve` | Police, Admin | Approve → triggers family notification + audit log |
| POST | `/:id/reject` | Police, Admin | Reject with reason |
| GET | `/weights` | Admin | Current scoring weight configuration |
| PATCH | `/weights` | Admin | Update weight configuration (versioned in `Settings`) |

## 8. Internal — Node ↔ FastAPI (not exposed to frontend)

Base: internal network only, e.g. `http://ai-service.internal:8000/internal/v1`
Auth: short-lived service JWT signed by Node, verified by FastAPI middleware

| Method | Route | Description |
|---|---|---|
| POST | `/embed/face` | `{ imageUrl, region }` → `{ vectorId }`, upserts into regional FAISS shard |
| POST | `/embed/text` | `{ text, region }` → `{ vectorId }` |
| POST | `/embed/clothing` | `{ imageUrl }` → detected clothing attributes + vector |
| POST | `/match/search` | `{ vectorId, vectorType, region, topK }` → ranked candidate list with per-factor raw similarity scores |
| DELETE | `/embed/:vectorId` | Remove vector on record deletion |
| GET | `/health` | Liveness/readiness probe |

## 9. Notifications — `/api/v1/notifications`

| Method | Route | Access |
|---|---|---|
| GET | `/` | Authenticated (own notifications) |
| PATCH | `/:id/read` | Authenticated (own) |
| WebSocket event `new_notification` | Pushed via Socket.IO room `user:<id>` |

## 10. Maps & Analytics — `/api/v1/analytics`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/map/sightings` | Police, Admin | GeoJSON of recent sightings |
| GET | `/map/organizations` | Public (limited fields) | Hospitals/shelters/police station locations |
| GET | `/dashboard/summary` | Police, Admin | Case counts, match rates, resolution time |
| GET | `/dashboard/hotspots` | Police, Admin | Location clustering of sightings/cases |

## 11. Audit Logs — `/api/v1/audit-logs`

| Method | Route | Access |
|---|---|---|
| GET | `/` | Admin only |
| GET | `/entity/:type/:id` | Admin only |

## 12. Error Codes (standardized)

| Code | Meaning |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | Login failure |
| `AUTH_TOKEN_EXPIRED` | Refresh required |
| `RBAC_FORBIDDEN` | Role lacks permission |
| `ORG_NOT_VERIFIED` | Org account not yet approved |
| `VALIDATION_ERROR` | Zod/Joi schema failure, with field-level detail |
| `UPLOAD_INVALID_FILE` | Failed Multer/type/size validation |
| `AI_SERVICE_UNAVAILABLE` | FastAPI unreachable — job re-queued |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## 13. Open Decisions for Sign-Off

1. Confirm whether anonymous citizen reports get a session-scoped token (to allow follow-up without exposing identity) or are fully stateless.
2. Confirm pagination default/max limits for case lists (e.g., default 20, max 100).
3. Confirm whether `/map/organizations` should be public at all, or require at least citizen-level auth (recommend the latter to reduce scraping risk).
