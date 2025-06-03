# Bill Splitter App

A Progressive Web App (PW### 5. Features Implemented
- **Full-stack PWA**: Mobile-friendly, responsive design (393px-800px width)
- **Trip Management**: Create, view, delete trips with participant lists
- **Expense Tracking**: Add detailed expenses with payer/participant selection
- **Smart Summaries**: Clear "who owes whom" breakdowns and settlement recommendations
- **Multi-language Support**: English, Spanish, Filipino
- **User Authentication**: Google Sign-In integration
- **Modern UI**: Unified card styles, accessible design, intuitive navigation
- **Local Storage**: All data stored in browser with automatic persistence
- **Offline Capability**: Works without internet connection once loaded

### 6. Development Workflow
Use VS Code tasks for easy development:
- **Start Development**: Use "Start Frontend (Vite)" task
- **Build PWA**: Use "Build Frontend" task
- **Preview Production**: Use "Preview Frontend" task

### 7. Migration from Server Version
If you're upgrading from the previous server-based version, see [MIGRATION.md](MIGRATION.md) for data migration instructions.bills and expenses among groups. This app works completely offline using browser local storage - no server required!

## Features
- **Offline-First PWA:** Works without internet connection
- **Local Storage:** All data stored in browser, no servers needed  
- **Trip Management:** Create trips with participants and manage expenses
- **Smart Calculations:** Automatic balance calculations and settlement suggestions
- **Multi-language:** English, Spanish, Filipino support
- **Mobile-Friendly:** Responsive design for all devices
- **Google Sign-In:** User authentication and data isolation

## Prerequisites
- [Node.js](https://nodejs.org/) (for development only)

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd bill-splitter-app/workspace
```

### 2. Start the Frontend
```sh
cd frontend
npm install
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173)

### 4. Project Structure
```
workspace/
├── frontend/         # React + Vite + TypeScript PWA
│   ├── src/
│   │   ├── App.tsx   # Main UI logic
│   │   ├── services/ # Local storage service
│   │   └── i18n/     # Internationalization
│   ├── public/       # PWA assets (manifest, service worker)
│   └── package.json
├── MIGRATION.md      # Guide for migrating from server version
└── README.md         # This file
```

### 5. Features Implemented
- **Full-stack PWA**: Mobile-friendly, responsive design (393px-800px width)
- **Trip Management**: Create, view, and delete trips with participant management
- **Expense Tracking**: Add, view, and delete expenses with automatic calculations
- **Smart Summaries**: Clear "who owes whom" breakdowns and settlement recommendations
- **Multi-language Support**: English, Spanish, Filipino
- **User Authentication**: Google Sign-In integration
- **Modern UI**: Unified card styles, accessible design, intuitive navigation
- **Local Storage**: All data stored in browser with automatic persistence
- **Offline Capability**: Works without internet connection once loaded

### 6. Development Workflow
Use VS Code tasks for easy development:
- **Start Development**: Use "Start Frontend (Vite)" task
- **Build PWA**: Use "Build Frontend" task
- **Preview Production**: Use "Preview Frontend" task

### 7. Migration from Server Version
If you're upgrading from the previous server-based version, see [MIGRATION.md](MIGRATION.md) for data migration instructions.

---

For more details, see the SRS or ask for specific setup instructions.
