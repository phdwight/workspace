import { useEffect, useState } from 'react';
import './App.css';
import en from './i18n/en';
import es from './i18n/es';
import fil from './i18n/fil';

// Types
import type { User, Trip, I18nTexts, Page } from './types';

// Components
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastProvider } from './components/shared/Toast';
import { TripCreation } from './components/TripCreation';
import { ExpenseForm } from './components/ExpenseForm';
import { BalanceSummary } from './components/BalanceSummary';

// Constants
const languages = { en, es, fil } as const;

function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [page, setPage] = useState<Page>('trips');
  const [language, setLanguage] = useState<keyof typeof languages>('en');
  const [theme, setTheme] = useState<'primary' | 'secondary'>('primary');

  const i18n: I18nTexts = languages[language];

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Listen for custom event from ExpenseForm to navigate to summary
  useEffect(() => {
    const handler = () => setPage('balances');
    window.addEventListener('navigateToSummary', handler);
    return () => window.removeEventListener('navigateToSummary', handler);
  }, []);

  useEffect(() => {
    const toSummary = () => setPage('balances');
    const toExpenses = () => setPage('expenses');
    const toTrips = () => setPage('trips');
    window.addEventListener('navigateToSummary', toSummary);
    window.addEventListener('navigateToExpenses', toExpenses);
    window.addEventListener('navigateToTrips', toTrips);
    return () => {
      window.removeEventListener('navigateToSummary', toSummary);
      window.removeEventListener('navigateToExpenses', toExpenses);
      window.removeEventListener('navigateToTrips', toTrips);
    };
  }, []);

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('primary', 'secondary');
    // Add the correct theme class
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'primary' ? 'secondary' : 'primary');
  };

  const forceReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const renderHeader = () => (
    <div className="header-theme" style={{
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '28px' }} role="img" aria-label="Bill splitter">💸</span>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          Bill Splitter
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language Selector */}
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as keyof typeof languages)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: 'white',
            padding: '6px 12px',
            fontSize: '14px',
            marginRight: 8
          }}
        >
          <option value="en">🇺🇸 EN</option>
          <option value="es">🇪🇸 ES</option>
          <option value="fil">🇵🇭 FIL</option>
        </select>
        {/* Theme Switcher Icon Button */}
        <button
          onClick={toggleTheme}
          title="Switch theme"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 20,
            cursor: 'pointer',
            marginLeft: 4,
            padding: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s, color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            width: 32,
            borderRadius: 16
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Switch theme"
        >
          {/* Theme icon changes for each theme */}
          {theme === 'primary' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 12.5A7.5 7.5 0 1 1 12.5 2.5a6 6 0 0 0 5 10z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
            </svg>
          )}
        </button>
        {/* Force reload icon button */}
        <button
          onClick={forceReload}
          title="Force reload app"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            marginLeft: 4,
            padding: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            width: 32,
            borderRadius: 16
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '1')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Force reload app"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2v2a6 6 0 1 1-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="2 8 4 10 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      </div>
    </div>
  );

  // Remove trips and setTrips props from TripCreation and ExpenseForm
  // Pass setPage as (page: Page) => void
  const renderContent = () => {
    switch (page) {
      case 'trips':
        return (
          <TripCreation
            i18n={i18n}
            setPage={setPage as (page: string) => void}
            setSelectedTrip={setSelectedTrip}
          />
        );
      case 'expenses':
        return selectedTrip ? (
          <ExpenseForm
            i18n={i18n}
            trip={selectedTrip}
            onExpenseAdded={() => {}}
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>{i18n.tripsList.noTrips}</p>
            <button onClick={() => setPage('trips')}>{i18n.tripsList.title}</button>
          </div>
        );
      case 'balances':
        return selectedTrip ? (
          <BalanceSummary
            i18n={i18n}
            trip={selectedTrip}
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p>{i18n.tripsList.noTrips}</p>
            <button onClick={() => setPage('trips')}>{i18n.tripsList.title}</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="App" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          {renderHeader()}
          <main style={{ padding: '0 16px' }}>
            {renderContent()}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
