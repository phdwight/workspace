# Migration Guide: Server to PWA

## Overview

The Bill Splitter App has been converted from a server-based application to a Progressive Web App (PWA) that uses local storage. This means:

- ✅ **No server required** - The app runs entirely in your browser
- ✅ **Offline capable** - Works without internet connection
- ✅ **Faster performance** - Data is stored locally
- ✅ **Privacy focused** - Your data stays on your device

## Data Migration

### If you have existing data from the old server version:

1. **Export your data** from the old server version (if still available)
2. **Import to localStorage** using the browser's developer tools

### Manual Data Migration Steps:

1. Open the new PWA version in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Use these commands to add your data:

```javascript
// Add a trip
localStorageService.createTrip("Trip Name", ["Person1", "Person2"], "your-email@example.com");

// Add an expense
localStorageService.createExpense("your-email@example.com", "Trip Name", "Expense Description", 50.00, "Person1", ["Person1", "Person2"]);
```

### Data Storage Location

Your data is stored in your browser's localStorage under these keys:
- `billsplitter_trips_[email]` - Your trips
- `billsplitter_expenses_[email]` - Your expenses

### Backup Your Data

To backup your data:
1. Open Developer Tools → Application tab → Local Storage
2. Copy the data from the localStorage entries
3. Save to a text file for backup

### Restore Your Data

To restore data on a new device:
1. Copy your backup data
2. Open Developer Tools → Application tab → Local Storage
3. Paste the data back into the localStorage entries

## Benefits of the New PWA Version

- **No Setup Required**: No need to run a backend server
- **Always Available**: Works offline once loaded
- **Better Performance**: Instant data access from localStorage
- **Enhanced Privacy**: Data never leaves your device
- **Mobile Friendly**: Can be installed as a mobile app
- **Auto-Updates**: PWA updates automatically when available

## MIGRATION: Bill Splitter App

### Summary
- All Google authentication and user account logic has been removed.
- All user/email props and types have been removed from all components and services.
- All legacy, unused, and test files have been deleted.
- The app is now fully local, using browser localStorage for all data.
- The UI is unified, modern, and minimal across all pages.

### Key Changes
- No authentication or user accounts required
- All navigation is local and event-driven
- Expenses, trips, and balances are managed in localStorage
- All code is modular, type-safe, and i18n-ready
- No unused files or test stubs remain

### How to Use
- Create a trip, add participants, add expenses, and view balances—all locally
- No login or signup required

### For Developers
- See `README.md` and `SRS.md` for updated requirements and usage
- All code is in `frontend/src/`
- To start: `cd frontend && npm install && npm run dev`

## Support

If you need help with migration or have questions about the new PWA version, please check the README.md file or create an issue in the repository.
