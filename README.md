# Bill Splitter App

This is a monorepo for a Bill Splitter App with:
- **Frontend:** React + Vite + TypeScript
- **Backend:** FastAPI (Python, conda env)
- **Database:** PostgreSQL (via Docker)
- **Containerized** with Docker and orchestrated using Docker Compose

## Prerequisites
- [Node.js](https://nodejs.org/) (for frontend dev)
- [Conda](https://docs.conda.io/) (for backend dev)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for full stack/dev DB)

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd bill-splitter-app/workspace
```

### 2. Start with Docker Compose (Recommended for full stack)
This will start frontend (production build), backend, and PostgreSQL database:
```sh
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

### 3. Local Development (Hot Reload)
#### Frontend (Vite + React)
```sh
cd frontend
npm install
npm run dev
```
- Visit [http://localhost:5173](http://localhost:5173) for the dev UI.

#### Backend (FastAPI, Python 3.13 via conda)
```sh
cd backend
conda create -n bill-splitter-py313 python=3.13 -y
conda activate bill-splitter-py313
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Visit [http://localhost:8000](http://localhost:8000) for the API root.
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Project Structure
- `frontend/` - React app (Vite, TypeScript)
- `backend/` - FastAPI app (Python)
- `db/` - Database volume/config
- `docker-compose.yml` - Orchestrates all services

### 5. Features Implemented
- Trip creation with participant entry (frontend + backend)
- CORS enabled for local dev and Docker
- Modern, compact, internationalized UI (English, Spanish, Filipino)
- Google Sign-In authentication
- User-specific trip and expense data
- Add, view, and delete expenses per trip
- Per-trip summary page (shows balances and settlements, including clear "who owes whom" summary)
- All navigation is now via page buttons: Trip, Expenses, and Summary (top navigation menu removed; Settlements and All Trips pages have been removed)
- Responsive, accessible, and visually appealing design
- Compact trips list/table with improved alignment and no horizontal scroll (max width 520px)
- Participants in trips list shown as plain text with tooltips for full visibility on hover
- Trash icon and trip name in trips list aligned with other controls
- Trip name input field in trip creation form fixed for width and alignment
- Navigation links order unified: Trip, Expenses, Summary

---

For more details, see the SRS or ask for specific setup instructions.
