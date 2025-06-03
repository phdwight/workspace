# Bill Splitter App

A modern, minimal, and fully local Bill Splitter PWA. No authentication required. Built with React + Vite + TypeScript frontend, FastAPI backend, and PostgreSQL (future). All data is stored in browser localStorage for now.

## Features
- Create trips and add participants
- Add expenses with description, amount, payer, participants, and date
- View all expenses for a trip in a compact, modern table
- View balance summary and suggested settlements
- Seamless navigation between trip creation, expenses, and summary
- Modern, unified UI across all pages
- No Google authentication or user accounts
- Fully offline/local-first (PWA-ready)

## Usage
1. Create a trip and add participants
2. Add expenses for the trip
3. View all expenses and the balance summary
4. Navigate freely between trip creation, expenses, and summary

## Tech Stack
- React + Vite + TypeScript (frontend)
- FastAPI (backend, not required for local usage)
- PostgreSQL (future, not required for local usage)
- Docker (for deployment)

## Development
- Run `npm install` in `frontend/`
- Start dev server: `npm run dev` in `frontend/`

## Clean Codebase
- All legacy/auth code removed
- No unused files or test stubs
- All UI is modular, type-safe, and i18n-ready

See `SRS.md` for requirements and `MIGRATION.md` for migration notes.
