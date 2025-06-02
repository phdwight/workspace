# Bill Splitter App

This is a monorepo for a Bill Splitter App with:
- **Frontend:** React + Vite + TypeScript
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Containerized** with Docker and orchestrated using Docker Compose

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Running the App

1. Build and start all services:
   ```sh
   docker-compose up --build
   ```
2. Frontend: [http://localhost:3000](http://localhost:3000)
3. Backend: [http://localhost:8000](http://localhost:8000)

### Development
- Frontend code: `frontend/`
- Backend code: `backend/`
- Database config: `db/`

## Project Structure
- `frontend/` - React app (Vite, TypeScript)
- `backend/` - FastAPI app (Python)
- `db/` - Database volume/config
- `docker-compose.yml` - Orchestrates all services

---

For more details, see the SRS or ask for specific setup instructions.
