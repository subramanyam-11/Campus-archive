# CampusArchive (CCEAS Portal) - Comprehensive System Audit (Phase 0)

Date: 2026-10-26  
Status: Phase 0 Audit Complete (No application code modified yet)

---

## 1. Build, Type, and Lint Results

### 1.1 `npm install`
- **Status**: Completed successfully.
- **Findings**: 579 packages audited; 10 vulnerabilities flagged by npm (2 moderate, 7 high, 1 critical). Post-install script warnings for `@firebase/util`, `protobufjs`, and `unrs-resolver`.
- **Missing Dependencies Needed for Architecture**:
  - `zod` (runtime schema validation and single source of truth)
  - `pdf-lib` (programmatic certificate & dossier PDF generation)
  - `qrcode` and `@types/qrcode` (cryptographic QR verification passes & certificates)
  - `@firebase/rules-unit-testing` (dev dependency for security rules verification)
  - `firebase-tools` (local emulator orchestration)

### 1.2 `npx tsc --noEmit`
- **Status**: Exit code 0 (passes under current loose typing).
- **Findings**:
  - `src/tsconfig.json` excludes `cceas-portal-archive` and `stitch_export`, but allows `any` in application code.
  - Multiple instances of explicit `any` and missing type guards violate Phase 1 strict TypeScript standards.

### 1.3 `npm run lint`
- **Status**: **FAILED** with 51 problems (22 errors, 29 warnings).
- **Direct Application Errors in `src/`**:
  - `src/components/AppContext.tsx:119:51`: Unexpected `any` in event state handler.
  - `src/components/RegisterCommitteeModal.tsx:119:49`: Unexpected `any` in form handler.
  - `src/views/ArchiveSearchView.tsx:301:17`, `301:42`, `548:55`, `548:65`: Unescaped quote entities in JSX (`"` should be `&quot;`).
  - `src/views/RosterView.tsx:192:47`: Unexpected `any` in table render.
- **Direct Application Warnings in `src/`**:
  - `src/views/EventDetailView.tsx:344:21`, `497:15`: Missing Next.js `<Image />` optimization (`@next/next/no-img-element`).
  - Unused variables across components: `setTargetDelegates` (`NewEventModal.tsx:24`), `setFacultyDesignation` (`RegisterCommitteeModal.tsx:21`), `ArchiveRecord` (`ArchiveSearchView.tsx:2`), `onSelectEvent` & `committeeEvents` (`CommitteeDetailView.tsx:16, 38`), `onNavigate` (`UploadDataView.tsx:10`).
- **Legacy Duplicate Directory Errors**:
  - ESLint checks `cceas-portal-archive/` and `stitch_export/` because `eslint.config.mjs` only ignores `.next/`, `out/`, and `build/`. These duplicated directories trigger 18 errors and 16 warnings.

### 1.4 `npm run build`
- **Status**: Builds static routes, but only because all pages in `app/(main)/*` are client components with mock data fallbacks.
- **Findings**: No static generation errors, but routes lack server-side data fetching, streaming, and error boundaries.

---

## 2. Architecture & File Integrity Audit

### 2.1 Broken Imports & 0-Byte Placeholder Files
The following critical backend and integration files exist in the tree as completely empty (0 bytes):
- `firestore.rules` (0 bytes) - **CRITICAL SECURITY RISK**
- `storage.rules` (0 bytes) - **CRITICAL SECURITY RISK**
- `lib/firebase/firestore.ts` (0 bytes) - Database client abstraction missing
- `lib/firebase/storage.ts` (0 bytes) - Storage client abstraction missing
- `lib/pdf/generateEventReport.ts` (0 bytes) - PDF generator missing
- `functions/src/generateReportPdf.ts` (0 bytes) - Cloud Function missing
- `functions/src/onEventStatusChange.ts` (0 bytes) - Cloud Function missing
- Missing `firebase.json` in root - Emulators cannot start without configuration.
- Missing `functions/package.json` and `functions/tsconfig.json` - Cloud functions directory is unconfigured.

### 2.2 Missing `"use client"` Directives
The following components use React hooks (`useState`, `useEffect`, `useRef`), event handlers, or browser APIs, but omit the required `'use client'` directive. They only execute because their caller in `app/` is marked client-side:
- **Views**:
  - `src/views/ArchiveSearchView.tsx`
  - `src/views/CommitteeDetailView.tsx`
  - `src/views/CommitteesView.tsx`
  - `src/views/DashboardView.tsx`
  - `src/views/EventDetailView.tsx`
  - `src/views/EventsView.tsx`
  - `src/views/ReportsView.tsx`
  - `src/views/RosterView.tsx`
  - `src/views/SettingsView.tsx`
  - `src/views/UploadDataView.tsx`
- **Components**:
  - `src/components/Header.tsx`
  - `src/components/Sidebar.tsx`
  - `src/components/NewEventModal.tsx`
  - `src/components/RegisterCommitteeModal.tsx`
  - `src/components/DossierModal.tsx`
  - `src/components/LoginScreen.tsx`

### 2.3 Unsafe Browser API Use in Server Components / SSR
- Direct `document.createElement('a')` and `document.body.appendChild()` for CSV and text report exports in `CommitteesView.tsx`, `RosterView.tsx`, `EventsView.tsx`, and `EventDetailView.tsx`.
- Direct `document.createElement('input')` for file dialog triggers in `UploadDataView.tsx` and `CommitteeDetailView.tsx`.
- Direct `window.print()` in `DossierModal.tsx`.
- Direct `window.confirm()` in `RosterView.tsx`.
- Window/document event listeners in `Header.tsx` without SSR guards.

### 2.4 Hydration Mismatches & Non-Deterministic Renders
- `Math.random()` and `Date.now()` are called inside render/state initialization routines (e.g., `RosterView.tsx:53` generating random student PRN `2023BTECS00...`, `AppContext.tsx:108` generating random event code numbers).
- In `app/layout.tsx`, external stylesheets for Google Fonts (`Inter`) and Google Material Symbols are linked directly inside `<head>` rather than managed via `next/font` or CSS imports, causing potential FOUC and hydration font mismatch warnings.
- Dynamic fallback route logic (`events.find(...) || selectedEvent || events[0]`) causes silent mismatch on invalid URLs instead of triggering HTTP 404.

### 2.5 Dead Code and Redundant Duplication
- `src/components/LoginScreen.tsx`: Completely dead code in the App Router; never imported by any active page.
- `cceas-portal-archive/` and `stitch_export/`: 100% duplicate copies of old Vite/AI Studio code sitting in repository root, polluting search, linting, and git history.
- Thin wrapper duplication: Every route in `app/(main)/*` is currently an identical 10-line wrapper that imports a component from `src/views/` and injects global context.

### 2.6 Hardcoded & Mock Data Dependency
- Runtime depends entirely on `src/data/mockData.ts` (33KB) loaded into client memory via `AppContext.tsx`.
- Any page refresh or direct URL navigation resets modifications.
- Authentication is simulated via a hardcoded `USER_PERSONAS` array in `mockData.ts` switched via a dropdown in `Header.tsx`.

### 2.7 Insecure Firestore and Storage Rules
- `firestore.rules` is completely empty (0 bytes).
- `storage.rules` is completely empty (0 bytes).
- No role-based access control, no field validations, no token claims enforcement.

### 2.8 Missing Loading, Error, and Empty States
- Zero `loading.tsx` files across all routes.
- Zero `error.tsx` files across all routes.
- Zero `not-found.tsx` files across all routes.
- No root error boundary (`global-error.tsx`).
- Empty states (zero events, zero search results, zero documents) are either unhandled or fall back to default mock data items.

### 2.9 Accessibility (a11y) Issues
- Unoptimized `<img>` tags missing responsive srcset and lazy loading in `EventDetailView.tsx`.
- Modals (`NewEventModal`, `RegisterCommitteeModal`, `DossierModal`) lack ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), focus trapping, and keyboard Escape listeners.
- Tab controls lack ARIA tab patterns (`role="tablist"`, `role="tab"`, `aria-selected`).
- Low-contrast text styles (`text-outline`, `text-[10px] text-on-surface-variant`).
- Upload dropzones in `UploadDataView.tsx` lack keyboard focus indicators and screen-reader upload instructions.

### 2.10 Fake Features
- **Hardcoded SHA-256 Ledger Hashes**:
  - `src/components/DossierModal.tsx:195`: Hardcoded string `SHA-256 Ledger Hash: 4f98d1a8e032b49c71650e28a9b23f81e01`.
  - `src/data/mockData.ts:792, 818`: Hardcoded strings `'SHA: 8e41a...c72'` and `'SHA-256 Validated'`.
  - No actual cryptographic hashing of uploaded or archived documents is performed.
- **Hardcoded AI Confidence Scores**:
  - `src/types.ts:136`: `confidence: 'High (94%)' | 'High (98%)' | 'Medium (76%)'` as a fixed string union.
  - `src/views/UploadDataView.tsx:96`: Fixed `'High (94%)'` assigned to every uploaded file.
  - `src/views/UploadDataView.tsx:588`: Fake terminal log simulating OCR text extraction.
- **Fake PDF Generation**:
  - `lib/pdf/generateEventReport.ts` is empty; export triggers `window.print()` instead of true binary PDF synthesis.
