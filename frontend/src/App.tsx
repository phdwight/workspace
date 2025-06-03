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

  const handleLogout = () => {
    setUser(null);
    setSelectedTrip(null);
    setPage('trips');
  };

  const renderHeader = () => (
    <div style={{
      background: 'linear-gradient(135deg, #BB3E00 0%, #F7AD45 100%)',
      color: 'white',
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
          onChange={(e) => setLanguage(e.target.value as keyof typeof languages)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: 'white',
            padding: '6px 10px',
            fontSize: '14px'
          }}
        >
          <option value="en" style={{ color: 'black' }}>🇺🇸 EN</option>
          <option value="es" style={{ color: 'black' }}>🇪🇸 ES</option>
          <option value="fil" style={{ color: 'black' }}>🇵🇭 FIL</option>
        </select>

        {/* Navigation */}
        {user && selectedTrip && (
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage('trips')}
              style={{
                background: page === 'trips' ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Trips
            </button>
            <button
              onClick={() => setPage('expenses')}
              style={{
                background: page === 'expenses' ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Expenses
            </button>
            <button
              onClick={() => setPage('balances')}
              style={{
                background: page === 'balances' ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Balances
            </button>
          </nav>
        )}

        {/* User Info & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              />
            )}
            <span style={{ fontSize: '14px', opacity: 0.9 }}>
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        )}
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
            <p>No trip selected</p>
            <button onClick={() => setPage('trips')}>Go to Trips</button>
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
            <p>No trip selected</p>
            <button onClick={() => setPage('trips')}>Go to Trips</button>
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
