# CampusArchive Data Model & Firestore Architecture

## 1. Top-Level Collections

### `users`
- Path: `/users/{userId}`
- Fields:
  - `uid`: string (Firebase Auth UID)
  - `email`: string
  - `displayName`: string
  - `role`: `'principal' | 'iqac' | 'head' | 'faculty' | 'student'`
  - `department`: string
  - `prn`?: string
  - `badgeId`?: string
  - `committeeIds`?: string[] (assigned committees for heads)
  - `avatarIcon`?: string
  - `createdAt`?: string

### `committees`
- Path: `/committees/{committeeId}`
- Fields:
  - `id`: string (e.g. `com-cse-09`)
  - `code`: string (e.g. `COM-CSE-09`)
  - `name`: string
  - `categoryTag`: string
  - `categoryType`: `'iqac' | 'tech' | 'cultural' | 'outreach' | 'admin'`
  - `department`: string
  - `status`: `'active' | 'archived'`
  - `facultyInCharge`: `{ name, designation, signatureVerified, signatureUid, email }`
  - `activeMembersCount`: number (derived from active members subcollection)
  - `lastRevised`: string
  - `charter`: string
  - `naacCriterion`: string
  - `focusAreas`: `Array<{ title, description }>`
  - `leadership`: `Array<{ name, role, prn, program, initials, clearanceVerified }>`
  - `metrics`: `{ approvedEvents, footfall, sanctionedBudget, budgetNumeric, utilizedBudget, utilizedNumeric, utilizedPercent, grantId }`
  - `documents`: `Array<{ id, title, size, date, signedBy, type, url, sha256Hash }>`

---

## 2. Committee Subcollections

### `committees/{committeeId}/members`
- Path: `/committees/{committeeId}/members/{memberId}`
- Schema:
  - `id`: string (unique member ID)
  - `committeeId`: string (parent committee ID)
  - `name`: string (full name)
  - `email`: string (valid institutional collegiate email)
  - `prn`: string (collegiate Permanent Registration Number)
  - `department`: string (e.g. Computer Science & Engineering)
  - `designation`: string (e.g. Chairperson, Secretary, Member)
  - `role`: string (e.g. Executive, Volunteer, Faculty Advisor)
  - `tenureStart`: string (ISO date, e.g. `2024-07-01`)
  - `tenureEnd`: string (ISO date, e.g. `2025-06-30`)
  - `academicYear`: string (e.g. `AY 2024–25` or `AY 2023–24`)
  - `status`: `'active' | 'invited' | 'removed'`
  - `initials`?: string
  - `tenure`?: string
- Security Rules:
  - `read`: Allowed for all authenticated institutional users.
  - `create`, `update`, `delete`: Allowed only for:
    - The committee's designated Head (`isHeadOfCommittee(committeeId)` based on `request.auth.uid` user profile `committeeIds`)
    - IQAC Coordinators (`getUserRole() == 'iqac'`)
    - Principal / System Admins (`isAdmin()`)
    - Strictly prohibited for heads of other committees (cross-committee isolation enforced).

---

## 3. Other Core Collections

### `events`
- Path: `/events/{eventId}`
- Access: Published events readable by all students; draft/pending readable by staff; managed by committee head and convener.

### `enrolments`
- Path: `/enrolments/{enrolmentId}`
- Access: Students can enrol themselves; attendance managed by faculty convener and head.

### `certificates`
- Path: `/certificates/{certId}`
- Access: Cryptographic verification publicly accessible at `/verify/{certId}`.

### `audit_logs`
- Path: `/audit_logs/{logId}`
- Access: Immutable, append-only security log readable by institutional administrators.
