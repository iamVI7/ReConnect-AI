# ReConnect AI — Database Design Document
Version 1.0 — Draft for Approval
Database: MongoDB Atlas (single database, referenced collections)

## 1. Design Principles

- One MongoDB database; organization-specific data separated logically via references, not physical database separation
- Store embedding **references** (FAISS vector IDs), never raw embedding vectors, in MongoDB
- Every collection that represents a state-changing entity carries `createdBy`, `createdAt`, `updatedAt`, `isDeleted` (soft delete)
- Indexes specified explicitly for query patterns expected at scale

## 2. Collections

### 2.1 `Users`
```
{
  _id: ObjectId,
  fullName: String,
  email: String (unique, indexed),
  phone: String,
  passwordHash: String,
  role: ObjectId (ref: Roles),
  organizationId: ObjectId (ref: Organizations, nullable — null for Family/Citizen),
  isVerified: Boolean,          // org-affiliated accounts require admin verification
  trustScore: Number,           // default 100, adjusted based on report accuracy
  isAnonymousReporter: Boolean,
  status: Enum['active','suspended','pending_verification'],
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
Indexes: { email: 1 } unique, { organizationId: 1 }, { role: 1 }
```

### 2.2 `Roles`
```
{
  _id: ObjectId,
  name: Enum['family','citizen','police','hospital','ngo','shelter','admin'],
  permissions: [String]   // e.g. 'case:create', 'match:approve', 'user:manage'
}
```

### 2.3 `Organizations`
```
{
  _id: ObjectId,
  name: String,
  type: Enum['police_station','hospital','ngo','shelter'],
  registrationNumber: String,
  address: { street, city, state, country, pincode },
  location: { type: 'Point', coordinates: [lng, lat] },  // geospatial index
  verificationStatus: Enum['pending','verified','rejected'],
  verifiedBy: ObjectId (ref: Users, admin),
  verifiedAt: Date,
  contactPerson: { name, phone, email },
  createdAt: Date
}
Indexes: { location: '2dsphere' }, { type: 1, verificationStatus: 1 }
```

### 2.4 `MissingPersons`
```
{
  _id: ObjectId,
  reportedBy: ObjectId (ref: Users),
  fullName: String,
  age: Number,
  gender: Enum['male','female','other','unknown'],
  height: Number,           // cm
  photos: [{ url: String, cloudinaryId: String, uploadedAt: Date }],
  identifyingMarks: [String],       // scars, tattoos, birthmarks — free text tags
  clothingDescription: String,
  descriptionText: String,          // free-form narrative, embedded for semantic search
  lastKnownLocation: { type: 'Point', coordinates: [lng, lat], address: String },
  lastSeenAt: Date,
  region: String,                   // e.g. state/city code — used for FAISS shard routing
  embeddingRefs: {
    faceVectorId: String,           // FAISS vector ID, not the vector itself
    textVectorId: String,
    clothingVectorId: String
  },
  status: Enum['pending_embedding','active','matched','closed','cold'],
  linkedCaseId: ObjectId (ref: PoliceStations case, nullable),
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: { lastKnownLocation: '2dsphere' }, { region: 1, status: 1 }, { reportedBy: 1 }
```

### 2.5 `FoundPersons`
Mirrors `MissingPersons` structure for unidentified/rescued individuals registered by hospitals, NGOs, shelters, or police.
```
{
  _id: ObjectId,
  registeredBy: ObjectId (ref: Users),
  registeringOrgId: ObjectId (ref: Organizations),
  approximateAge: Number,
  gender: Enum,
  height: Number,
  photos: [...],
  identifyingMarks: [String],
  clothingDescription: String,
  descriptionText: String,
  foundLocation: { type: 'Point', coordinates: [lng, lat], address: String },
  foundAt: Date,
  medicalStatus: String,        // hospital-specific, access-restricted field
  rehabilitationStatus: String, // NGO/shelter-specific
  region: String,
  embeddingRefs: { faceVectorId, textVectorId, clothingVectorId },
  status: Enum['pending_embedding','active','matched','closed'],
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: { foundLocation: '2dsphere' }, { region: 1, status: 1 }, { registeringOrgId: 1 }
```

### 2.6 `Sightings`
```
{
  _id: ObjectId,
  reportedBy: ObjectId (ref: Users, nullable if anonymous),
  isAnonymous: Boolean,
  relatedMissingPersonId: ObjectId (ref: MissingPersons, nullable),
  description: String,
  photos: [{ url, cloudinaryId }],
  location: { type: 'Point', coordinates: [lng, lat] },
  sightedAt: Date,
  verificationStatus: Enum['unverified','verified','false_report'],
  verifiedBy: ObjectId (ref: Users, police),
  createdAt: Date
}
Indexes: { location: '2dsphere' }, { relatedMissingPersonId: 1 }
```

### 2.7 `AIResults`
Explainability-first design — every factor stored individually, not just a final score.
```
{
  _id: ObjectId,
  sourcePersonId: ObjectId,        // MissingPersons or FoundPersons
  sourceType: Enum['MissingPerson','FoundPerson'],
  targetPersonId: ObjectId,
  targetType: Enum['MissingPerson','FoundPerson'],
  modelVersion: String,            // e.g. 'arcface-v2.1_st-v1.0'
  factorScores: {
    faceSimilarity: Number,
    descriptionSimilarity: Number,
    clothingSimilarity: Number,
    identifyingMarksSimilarity: Number,
    ageSimilarity: Number,
    genderMatch: Boolean,
    heightSimilarity: Number,
    locationProximity: Number,
    timelineSimilarity: Number,
    sightingCorroboration: Number
  },
  weightsUsed: Object,              // snapshot of weight config at time of scoring — audit trail
  overallConfidence: Number,        // weighted blend, computed in Node
  status: Enum['pending_review','approved','rejected'],
  reviewedBy: ObjectId (ref: Users, nullable),
  reviewedAt: Date,
  createdAt: Date
}
Indexes: { sourcePersonId: 1, targetPersonId: 1, modelVersion: 1 } UNIQUE (idempotency),
         { status: 1, overallConfidence: -1 }
```

### 2.8 `PoliceStations`, `Hospitals`, `ShelterHomes`, `NGOs`
Thin extension collections referencing `Organizations` for type-specific fields (jurisdiction area for police, bed capacity for shelters, specialty for hospitals, etc.) — kept separate from `Organizations` to avoid a bloated polymorphic schema, linked via `organizationId`.

### 2.9 `Notifications`
```
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  type: Enum['new_match','match_approved','case_update','new_sighting'],
  relatedEntityId: ObjectId,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
Indexes: { userId: 1, isRead: 1, createdAt: -1 }
```

### 2.10 `Messages`
In-app secure messaging between police/hospital/NGO/family on a specific case.
```
{
  _id: ObjectId,
  caseId: ObjectId,
  senderId: ObjectId (ref: Users),
  recipientId: ObjectId (ref: Users),
  body: String,
  attachments: [{ url }],
  createdAt: Date
}
Indexes: { caseId: 1, createdAt: 1 }
```

### 2.11 `AuditLogs`
```
{
  _id: ObjectId,
  actorId: ObjectId (ref: Users),
  action: String,               // 'match.approve', 'case.create', 'user.suspend', etc.
  entityType: String,
  entityId: ObjectId,
  beforeState: Object,
  afterState: Object,
  ipAddress: String,
  createdAt: Date
}
Indexes: { entityType: 1, entityId: 1 }, { actorId: 1, createdAt: -1 }
```

### 2.12 `Settings`
```
{
  _id: ObjectId,
  key: String (unique),          // e.g. 'ai_weights_v1'
  value: Object,                 // e.g. { faceSimilarity: 0.35, descriptionSimilarity: 0.15, ... }
  updatedBy: ObjectId (ref: Users, admin),
  updatedAt: Date
}
```

### 2.13 `ConsentRecords` (recommended addition)
```
{
  _id: ObjectId,
  personRecordId: ObjectId,       // MissingPersons or FoundPersons
  consentGivenBy: ObjectId (ref: Users),
  consentType: Enum['guardian','self','institutional_custody'],
  retentionPolicy: String,
  createdAt: Date
}
```

## 3. Relationships Summary

- `Users.role` → `Roles`
- `Users.organizationId` → `Organizations`
- `Organizations` → `PoliceStations` / `Hospitals` / `ShelterHomes` / `NGOs` (1:1 extension)
- `MissingPersons.reportedBy` → `Users`
- `FoundPersons.registeringOrgId` → `Organizations`
- `AIResults` links any `MissingPersons` ↔ `FoundPersons` pair
- `Sightings.relatedMissingPersonId` → `MissingPersons`
- `Notifications.userId` → `Users`
- `ConsentRecords.personRecordId` → `MissingPersons` / `FoundPersons`

## 4. Sensitive Field Access Control

| Field | Restricted to |
|---|---|
| `FoundPersons.medicalStatus` | Hospital staff, Police, Admin |
| `Users.trustScore` | Admin, Police only |
| `AIResults.factorScores` | Police, Admin (Families see overallConfidence + human-approved summary only, post-verification) |
| `AuditLogs.*` | Admin only |

## 5. Open Decisions for Sign-Off

1. Approve `ConsentRecords` as a new collection (not in your original list) — needed for legal defensibility around biometric/child data.
2. Confirm retention period defaults (e.g., auto-archive closed cases after N years, per applicable law).
3. Confirm whether `Messages` needs end-to-end encryption at rest (recommended given sensitive case content).
