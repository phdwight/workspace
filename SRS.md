# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
The Bill Splitter App is a web application that allows users to create trips, add participants, record shared expenses, and view per-participant balances and settlements. The app is designed for groups who need to track and settle shared expenses in a modern, internationalized, and user-friendly way.

### 1.2 Scope
- Multi-trip, multi-user bill splitting
- Google Sign-In authentication
- User-specific data (trips and expenses)
- Modern, compact, and internationalized UI (English, Spanish, Filipino)
- RESTful API backend (FastAPI)
- PostgreSQL database (to be implemented; currently in-memory)
- Dockerized deployment

### 1.3 Definitions, Acronyms, and Abbreviations
- **Trip**: A collection of participants and expenses for a specific event or journey
- **Expense**: A monetary entry specifying payer, amount, date, and involved participants
- **Settlement**: The calculation of who owes whom, based on all expenses in a trip
- **UI**: User Interface
- **i18n**: Internationalization

## 2. Overall Description

### 2.1 Product Perspective
- Frontend: React + Vite + TypeScript
- Backend: FastAPI (Python)
- Database: PostgreSQL (planned)
- Containerized with Docker Compose

### 2.2 Product Functions
- User authentication via Google Sign-In
- Create, view, and delete trips (with participant entry)
- Add, view, and delete expenses per trip
- View per-trip summary: participant balances and settlements
- Language switcher (English, Spanish, Filipino)
- Responsive, accessible, and visually appealing UI

### 2.3 User Classes and Characteristics
- **Authenticated Users**: Can create trips, add expenses, and view summaries
- **Unauthenticated Users**: Prompted to sign in with Google

### 2.4 Operating Environment
- Web browser (latest Chrome, Firefox, Safari, Edge)
- Node.js, Python 3.13, Docker, Conda (for development)

### 2.5 Design and Implementation Constraints
- All backend endpoints require user_email for data isolation
- UI and API must support i18n
- Data persistence in PostgreSQL is planned (currently in-memory)

### 2.6 User Documentation
- See README.md for setup and usage

## 3. System Features

### 3.1 User Authentication
- Google Sign-In (OAuth2)
- User session management (frontend only; backend token verification planned)

### 3.2 Trip Management
- Create trip with name and participants (min 2)
- View all trips for the signed-in user
- Delete trip (removes all related expenses)

### 3.3 Expense Management
- Add expense: payer, amount, participants, date
- View all expenses for a selected trip
- Delete expense

### 3.4 Summary
- View per-participant balances for a trip
- View settlements (who owes whom)
- All settlements logic is shown on the Summary page

### 3.5 Internationalization
- UI supports English, Spanish, and Filipino
- Language switcher in the UI

### 3.6 UI/UX
- Modern, compact, and accessible design
- Responsive layout for desktop and mobile
- Feedback messages for actions (success/error)

## 4. External Interface Requirements

### 4.1 User Interfaces
- Web UI (React, Vite)
- Google Sign-In button
- Forms for trip and expense entry
- Tables for trips and expenses
- Summary view for balances and settlements

### 4.2 Hardware Interfaces
- None (web-based)

### 4.3 Software Interfaces
- RESTful API (FastAPI)
- Google OAuth2
- PostgreSQL (planned)

### 4.4 Communications Interfaces
- HTTP/HTTPS

## 5. Other Nonfunctional Requirements

### 5.1 Performance
- Should support typical group usage (up to 20 participants per trip)

### 5.2 Security
- Google ID token verification on backend (planned)
- User data isolation by email

### 5.3 Portability
- Dockerized for easy deployment

### 5.4 Maintainability
- Monorepo structure for frontend and backend
- TypeScript and Python best practices

### 5.5 Internationalization
- All UI strings externalized for translation

## 6. Future Enhancements
- Persist trips and expenses in PostgreSQL
- Backend Google ID token verification
- Expense history and advanced filtering
- More languages and theme switching
- Improved session management

---

_Last updated: June 3, 2025_
