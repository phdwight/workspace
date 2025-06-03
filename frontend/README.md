# Bill Splitter App Frontend

This is a React + Vite + TypeScript Progressive Web App (PWA) for the Bill Splitter App.

## Development

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
   - Visit [http://localhost:5173](http://localhost:5173)

3. **Build for production:**
   ```sh
   npm run build
   ```

4. **Preview production build:**
   ```sh
   npm run preview
   ```

## Architecture
- **No Backend Required**: Uses browser localStorage for data persistence
- **Offline-First PWA**: Works without internet connection once loaded
- **Local Storage Service**: All data operations handled via `src/services/localStorage.ts`

## Features
- Responsive, mobile-friendly UI (min width 393px, max width 800px)
- Unified card/container styles for all main pages
- Internationalization (English, Spanish, Filipino)
- PWA support (manifest, service worker, offline capability)
- Google Sign-In authentication with data isolation
- Local storage for trips, expenses, and user data

---

For more details, see the main project README.
