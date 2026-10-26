# CampusArchive (CCEAS Portal)

**Centralized College Committee & Event Archival System (CCEAS)**  
*Engineered for institutional governance, NAAC/NBA/IQAC accreditation compliance, cryptographic dossier management, and tamper-proof credential issuance.*

---

## 🏛️ System Architecture Overview

CampusArchive is built with modern web architecture adhering to strict statutory compliance mandates (NAAC Criteria 1, 2, 3, 5, 6 and NBA Criteria 3.3):

- **Frontend & App Framework**: Next.js 16 (App Router + Turbopack) with React 19 and Tailwind CSS v4.
- **Role-Based Access Control (RBAC)**: Secure multi-tier authentication via Firebase Auth, Firestore Security Rules, and Next.js middleware with route protection.
- **Cryptographic Document Integrity**: SHA-256 digest computation using the native Web Crypto API for all uploaded PDFs, financial utilization certificates, and photo dossiers.
- **Automated Credentialing**: Real-time PDF generation using `pdf-lib` and dynamic verification QR barcodes using `qrcode`.
- **Backend & Cloud Functions**: Firebase Functions v2 (`firebase-functions/v2`) triggers for lifecycle status monitoring, overdue ATR reminders, background PDF compilation, and custom claim role assignment.

---

## 🧭 Role-Based Portal Routing

| Role | Route Scope | Primary Functionality |
| :--- | :--- | :--- |
| **Principal / Executive Admin** | `/dashboard`, `/events`, `/committees`, `/archive`, `/settings` | Institutional KPI overview, budget sanction oversight, statutory accreditation export, ledger audit. |
| **Committee Head** | `/head`, `/head/events/create`, `/head/events/[id]/manage`, `/head/events/[id]/post-event` | 4-step event proposal wizard, delegate roster & PRN check-in desk, post-event ATR synthesis, photo evidence gallery. |
| **Faculty Convener** | `/faculty`, `/faculty/inbox/[id]`, `/faculty/calendar` | Proposal scrutiny, date/venue clash detection, Approve/Reject/Request Changes workflows with mandatory remarks. |
| **Student** | `/student`, `/student/events/[id]`, `/student/my-events`, `/student/certificates` | Event discovery, transactional seat enrolment/waitlist, digital entry QR pass, cryptographic PDF certificate retrieval. |
| **Public Verifier** | `/verify/[certId]` | Publicly accessible tamper-proof certificate authenticity validation with SHA-256 ledger integrity verification. |

---

## ⚙️ Prerequisites & Environment Setup

- **Node.js**: `v20+` or `v22+` (tested and validated on Node v26)
- **Package Manager**: `npm`
- **Java**: JRE 11+ (required for Firebase Local Emulator Suite)

### 1. Environment Variables Configuration

Create `.env.local` in the project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="demo-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="demo-campus-archive.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-campus-archive"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="demo-campus-archive.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:demoabcdef123456"

# Emulator Ports
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="true"
NEXT_PUBLIC_EMULATOR_AUTH_PORT="9099"
NEXT_PUBLIC_EMULATOR_FIRESTORE_PORT="8080"
NEXT_PUBLIC_EMULATOR_STORAGE_PORT="9199"
```

---

## 🚀 Running the Local Environment

### 1. Install Dependencies

```bash
# Install root web app dependencies
npm install

# Install Cloud Functions dependencies
npm --prefix functions install
```

### 2. Start Firebase Local Emulators

```bash
npx firebase emulators:start
```

Emulators will start on the following endpoints:
- **Emulator UI**: `http://localhost:4000`
- **Auth Emulator**: `http://localhost:9099`
- **Firestore Emulator**: `http://localhost:8080`
- **Storage Emulator**: `http://localhost:9199`
- **Functions Emulator**: `http://localhost:5001`

### 3. Seed Institutional Database

Populate realistic mock committees, users across all roles, and events with complete lifecycle statuses:

```bash
npm run seed
```

### 4. Run Next.js Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Testing & Quality Gates

The codebase enforces strict zero-error quality gates across static analysis, security rules, Cloud Functions, and production compilation:

### 1. TypeScript Static Typecheck
```bash
npx tsc --noEmit
```
*Zero type errors across all client components, hooks, and data layers.*

### 2. ESLint Code Standards
```bash
npm run lint
```
*Zero lint errors and zero warnings under Next.js 16 core web vitals and React 19 rules.*

### 3. Firestore Security Rules Unit Tests
```bash
npx firebase emulators:exec --only firestore "npm run test:rules"
```
*Validates 12 distinct security rules covering unauthenticated isolation, student privilege separation, self-approval prevention, and administrative governance.*

### 4. Cloud Functions Build & Unit Tests
```bash
npm --prefix functions run build
npm --prefix functions test
```
*Tests callable validation, security authorization, and input sanitization.*

### 5. Next.js Production Build
```bash
npm run build
```
*Compiles all 24 static and dynamic routes successfully.*

---

## 📋 End-to-End User Journey Walkthrough

1. **Committee Head Proposal Creation**:
   - Navigate to `/head` &rarr; Click **+ New Proposal** (`/head/events/create`).
   - Fill 4-step wizard: Basic Details &rarr; Venue & Date &rarr; Budget Allocation &rarr; NAAC Criteria Mapping.
   - Click **Submit Proposal for Sanction**; status transitions to `Pending`.

2. **Faculty Convener Scrutiny & Approval**:
   - Switch role to Faculty Convener &rarr; Navigate to `/faculty`.
   - Inspect pending event proposal in `/faculty/inbox/[eventId]`.
   - Review conflict matrix (venue/date clashes) and budget viability.
   - Enter convener approval notes and click **Approve & Sanction Event**.

3. **Student Discovery & Enrolment**:
   - Switch role to Student &rarr; Navigate to `/student`.
   - Browse approved events &rarr; Click **Enrol Now** (`/student/events/[eventId]`).
   - View digital enrolment pass with QR barcode in `/student/my-events`.

4. **Event Execution & Attendance Desk**:
   - Switch role to Committee Head &rarr; Navigate to `/head/events/[eventId]/manage`.
   - Use the **Rapid PRN Check-In Desk** or scan student QR passes to mark attendance.

5. **Action Taken Report (ATR) & Certificate Generation**:
   - Navigate to `/head/events/[eventId]/post-event`.
   - Upload geo-tagged photo evidence, input actual expenditure, and generate full A4 PDF dossier.
   - Click **Issue Verified Credentials (QR)** to generate tamper-proof PDF certificates.

6. **Public Verification**:
   - Student downloads certificate from `/student/certificates`.
   - Scan embedded QR barcode or open `/verify/[certId]`.
   - Ledger validates certificate ID, student PRN, event details, and SHA-256 cryptographic signature.

---

## 🔒 Security & Cryptographic Integrity

- **Deterministic Hash Chains**: Every document and certificate carries a SHA-256 digest recorded in the institutional ledger.
- **Tamper Detection**: The `/verify/[certId]` route verifies the ledger record against cryptographic digests, immediately flagging unauthorized modifications.
- **Zero Placeholder UI**: All actions, file uploads, filters, and PDF generation modules execute live client-side or cloud logic.
