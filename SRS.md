# Software Requirements Specification (SRS)

## 1. Introduction
This document specifies the requirements for the Bill Splitter App, a modern, minimal, and local-first PWA for splitting bills among participants in a trip. The app is designed for simplicity, privacy, and offline use.

## 2. System Overview
- **Frontend:** React + Vite + TypeScript
- **Backend:** FastAPI (future, not required for local usage)
- **Database:** PostgreSQL (future, not required for local usage)
- **Storage:** Browser localStorage (current)
- **No authentication or user accounts**

## 3. Functional Requirements
- Users can create a trip and add participants
- Users can add expenses to a trip, specifying:
  - Description (with tooltip in list)
  - Amount
  - Payer (must be a participant)
  - Participants (checkboxes)
  - Date (default to today, editable)
- Users can view all expenses for a trip in a compact, modern table
- Users can view a balance summary for a trip, including:
  - Each participant's balance, total paid, and total owed
  - Suggested settlements
- Users can navigate between trip creation, expenses, and summary pages
- All data is stored locally in the browser (no backend required)

## 4. Non-Functional Requirements
- Modern, unified UI across all pages (compact, inline labels, white card, shadow)
- Responsive and mobile-friendly
- No authentication or external dependencies for core features
- PWA-ready (offline support)
- Type-safe, modular codebase
- No unused or legacy files

## 5. Out of Scope
- User authentication (Google or otherwise)
- Cloud sync or multi-device support
- Backend API and database (for now)

## 6. Future Enhancements
- Backend API and PostgreSQL integration
- User accounts and cloud sync (optional)
- Advanced reporting and analytics

## 7. Migration Notes
See `MIGRATION.md` for details on the removal of authentication and legacy code.

---

_Last updated: June 3, 2025_
