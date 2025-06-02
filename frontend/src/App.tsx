import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useRef, useEffect, useState } from 'react';
import './App.css'
import en from './i18n/en';
import es from './i18n/es';
import fil from './i18n/fil';

function TripCreation({ user, setUser, i18n, onTripCreated }: { user: any, setUser: (u: any) => void, i18n: typeof en, onTripCreated?: (trip: { trip_name: string; participants: string[] }) => void }) {
  const [tripName, setTripName] = useState("");
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdTrip, setCreatedTrip] = useState<null | { trip_name: string; participants: string[] }>(null);
  const tripNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.email && tripNameRef.current) {
      tripNameRef.current.focus();
    }
  }, [user]);

  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, ""]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 2) return; // Require at least 2 participants
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedTrip(null);
    if (!user || !user.email) {
      setError(i18n.tripCreation.errorNotSignedIn);
      return;
    }
    if (participants.filter(p => p.trim()).length < 2) {
      setError(i18n.tripCreation.errorMinParticipants);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_name: tripName,
          participants: participants.map(p => p.trim()).filter(Boolean),
          user_email: user.email,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create trip");
      }
      const data = await response.json();
      setSuccess(data.message || "Trip created successfully!");
      setCreatedTrip({ trip_name: data.trip_name, participants: data.participants });
      if (onTripCreated) onTripCreated({ trip_name: data.trip_name, participants: data.participants });
      setTripName("");
      setParticipants(["", ""]);
    } catch (err: any) {
      setError(err.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trip-creation-container">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>{i18n.tripCreation.title}</h2>
      {!user || !user.email ? (
        <div style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>
          <b>{i18n.tripCreation.signInPrompt}</b>
          <div style={{ marginTop: 16 }}>
            <GoogleLogin
              onSuccess={credentialResponse => {
                const decoded = credentialResponse.credential
                  ? JSON.parse(atob(credentialResponse.credential.split('.')[1]))
                  : null;
                setUser(decoded);
                // focus will be handled by useEffect
              }}
              onError={() => alert('Google Sign-In failed')}
            />
          </div>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="tripName">{i18n.tripCreation.tripNameLabel}</label>
          <input
            id="tripName"
            type="text"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
            required
            className="input"
            placeholder={i18n.tripCreation.tripNamePlaceholder}
            ref={tripNameRef}
            disabled={!user || !user.email}
          />
        </div>
        <div className="form-group">
          <label>{i18n.tripCreation.participantsLabel}</label>
          {participants.map((p, i) => (
            <div key={i} className="participant-row">
              <input
                type="text"
                value={p}
                onChange={e => handleParticipantChange(i, e.target.value)}
                required
                placeholder={i18n.tripCreation.participantPlaceholder(i)}
                className="input"
                disabled={!user || !user.email}
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeParticipant(i)}
                disabled={participants.length <= 2 || !user || !user.email}
                aria-label={i18n.tripCreation.removeParticipantAria}
              >
                <span aria-hidden="true" style={{ color: '#d32f2f', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>×</span>
              </button>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addParticipant} disabled={!user || !user.email}>
            {i18n.tripCreation.addParticipant}
          </button>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <button type="submit" className="submit-btn" disabled={loading || !user || !user.email}>
          {loading ? i18n.tripCreation.creating : i18n.tripCreation.submit}
        </button>
      </form>
      {createdTrip && (
        <div className="created-trip-card">
          <h3>{i18n.tripCreation.createdTitle}</h3>
          <div className="created-trip-detail">
            <span className="created-trip-label">{i18n.tripCreation.createdName}</span>
            <span className="created-trip-value">{createdTrip.trip_name}</span>
          </div>
          <div className="created-trip-detail">
            <span className="created-trip-label">{i18n.tripCreation.createdParticipants}</span>
            <ul className="created-trip-list">
              {createdTrip.participants.map((p, i) => (
                <li key={i} className="created-trip-participant">👤 {p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ i18n, user, participants = [], tripName, onExpenseAdded }: { i18n: typeof en, user: any, participants?: string[], tripName?: string, onExpenseAdded?: () => void }) {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Improved: auto-select all participants by default
  useEffect(() => {
    if (participants.length > 0 && expenseParticipants.length === 0) {
      setExpenseParticipants([...participants]);
    }
  }, [participants]);

  // Improved: auto-select payer if only one participant
  useEffect(() => {
    if (participants.length === 1) {
      setPayer(participants[0]);
    }
  }, [participants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!payer) {
      setError('Please select a payer.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (expenseParticipants.length === 0) {
      setError('Please select at least one participant.');
      return;
    }
    if (!user || !user.email) {
      setError('You must be signed in.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer,
          amount: parseFloat(amount),
          participants: expenseParticipants,
          date: date || undefined,
          user_email: user.email,
          trip_name: tripName,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to add expense');
      }
      const data = await response.json();
      setSuccess(data.message || 'Expense added!');
      setPayer('');
      setAmount('');
      setExpenseParticipants([]);
      setDate('');
      if (onExpenseAdded) onExpenseAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
    }
  };

  return (
    <div className="expense-form-container" style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 18, color: '#BB3E00', fontWeight: 700, fontSize: 22 }}>{i18n.expenseForm.title}</h2>
      <form onSubmit={handleSubmit} className="expense-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#BB3E00', marginBottom: 4 }}>Payer</label>
          <select value={payer} onChange={e => setPayer(e.target.value)} required className="input" style={{ minHeight: 36 }}>
            <option value="">Select payer</option>
            {participants.map((p: string, i: number) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#BB3E00', marginBottom: 4 }}>Amount</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#A2B9A7', fontWeight: 700, fontSize: 18 }}>$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="input"
              style={{ flex: 1, minWidth: 0 }}
            />
          </div>
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#BB3E00', marginBottom: 4 }}>Participants</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {participants.map((p: string, i: number) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: expenseParticipants.includes(p) ? '#A2B9A7' : '#f7ead9', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={expenseParticipants.includes(p)}
                  onChange={e => {
                    if (e.target.checked) setExpenseParticipants([...expenseParticipants, p]);
                    else setExpenseParticipants(expenseParticipants.filter(x => x !== p));
                  }}
                  style={{ accentColor: '#BB3E00' }}
                />
                {p}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label style={{ fontWeight: 600, color: '#BB3E00', marginBottom: 4 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input"
            style={{ minHeight: 36 }}
          />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 6, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', marginBottom: 6, fontWeight: 600, textAlign: 'center' }}>{success}</div>}
        <button type="submit" className="submit-btn" style={{ marginTop: 8, fontSize: 16, fontWeight: 700, background: '#BB3E00', color: '#fff', minHeight: 40 }}>Add Expense</button>
      </form>
    </div>
  )
}

function ExpensesList({ tripName, user }: { tripName?: string, user: any }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!tripName || !user || !user.email) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:8000/expenses?trip_name=${encodeURIComponent(tripName)}&user_email=${encodeURIComponent(user.email)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setExpenses(data))
      .finally(() => setLoading(false));
  }, [tripName, user]);
  if (!tripName) return null;
  return (
    <div style={{ maxWidth: 500, margin: '18px auto 0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      <h3 style={{ color: '#BB3E00', margin: '0 0 10px 0', fontWeight: 700, fontSize: 18 }}>Expenses</h3>
      {loading ? <div>Loading...</div> : null}
      {expenses.length === 0 && !loading ? <div style={{ color: '#888' }}>No expenses yet.</div> : null}
      {expenses.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7ead9', color: '#BB3E00', fontWeight: 700 }}>
              <th style={{ padding: '6px 4px', textAlign: 'left', borderRadius: '6px 0 0 0', minWidth: 80 }}>Date</th>
              <th style={{ padding: '6px 4px', textAlign: 'left', minWidth: 120 }}>Payer</th>
              <th style={{ padding: '6px 4px', textAlign: 'left', minWidth: 80 }}>Amount</th>
              <th style={{ padding: '6px 4px', textAlign: 'left', minWidth: 120 }}>Participants</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 4px', color: '#A2B9A7', fontWeight: 500 }}>
                  {exp.date ? exp.date : <span style={{ color: '#bbb' }}>—</span>}
                </td>
                <td style={{ padding: '6px 4px', fontWeight: 500 }}>{exp.payer}</td>
                <td style={{ padding: '6px 4px', color: '#BB3E00', fontWeight: 700 }}>${exp.amount.toFixed(2)}</td>
                <td style={{ padding: '6px 4px', color: '#555' }}>{exp.participants.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function BalanceSummary({ i18n }: { i18n: typeof en }) {
  return (
    <div>
      <h2>{i18n.balanceSummary.title}</h2>
      <p>{i18n.balanceSummary.todo}</p>
    </div>
  )
}

function Settlements({ i18n }: { i18n: typeof en }) {
  return (
    <div>
      <h2>{i18n.settlements.title}</h2>
      <p>{i18n.settlements.todo}</p>
    </div>
  )
}

function TripsList({ user, i18n, onTripSelected, selectedTrip }: { user: any, setUser?: (u: any) => void, i18n: typeof en, onTripSelected?: (trip: { trip_name: string; participants: string[] } | null) => void, selectedTrip?: { trip_name: string; participants: string[] } }) {
  const [trips, setTrips] = useState<{ trip_name: string; participants: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.email) {
      setTrips([]);
      setError(i18n.tripsList.errorNotSignedIn);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:8000/trips?user_email=${encodeURIComponent(user.email)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch trips");
        return res.json();
      })
      .then(data => setTrips(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (tripName: string) => {
    if (!user || !user.email) return;
    if (!window.confirm(i18n.tripsList.confirmDelete(tripName))) return;
    setDeleting(tripName);
    try {
      const res = await fetch(`http://localhost:8000/trips/${encodeURIComponent(tripName)}?user_email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to delete trip');
      }
      setTrips(trips => trips.filter(t => t.trip_name !== tripName));
      if (onTripSelected && selectedTrip && selectedTrip.trip_name === tripName) {
        onTripSelected(null); // Deselect if deleted
      }
    } catch (err: any) {
      setError(err.message || i18n.tripsList.errorDelete);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="trips-list-container">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>{i18n.tripsList.title}</h2>
      {!user || !user.email ? (
        <div style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>
          <b>{i18n.tripsList.signInPrompt}</b>
        </div>
      ) : null}
      {loading && <div>{i18n.tripsList.loading}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {trips.length === 0 && !loading && user && user.email && <div>{i18n.tripsList.noTrips}</div>}
      <ul className="trips-list">
        {trips.map((trip, idx) => (
          <li
            key={idx}
            className="trips-list-item"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              listStyle: 'none',
              marginBottom: 18,
              boxShadow: 'none',
              cursor: onTripSelected ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (onTripSelected) {
                onTripSelected(trip);
                if (typeof window !== 'undefined') {
                  const evt = new CustomEvent('navigateToExpenses');
                  window.dispatchEvent(evt);
                }
              }
            }}
            tabIndex={onTripSelected ? 0 : -1}
            onKeyDown={e => {
              if (onTripSelected && (e.key === 'Enter' || e.key === ' ')) {
                onTripSelected(trip);
                if (typeof window !== 'undefined') {
                  const evt = new CustomEvent('navigateToExpenses');
                  window.dispatchEvent(evt);
                }
              }
            }}
            aria-selected={selectedTrip && selectedTrip.trip_name === trip.trip_name}
          >
            <div
              className={`created-trip-card${selectedTrip && selectedTrip.trip_name === trip.trip_name ? ' selected' : ''}`}
              style={{
                boxShadow: selectedTrip && selectedTrip.trip_name === trip.trip_name ? '0 2px 12px #A2B9A7' : undefined,
                border: selectedTrip && selectedTrip.trip_name === trip.trip_name ? '2px solid #A2B9A7' : undefined,
                transition: 'box-shadow 0.15s, border 0.15s',
                cursor: onTripSelected ? 'pointer' : 'default',
                margin: 0,
              }}
            >
              <div className="created-trip-detail">
                <span className="created-trip-label">{i18n.tripCreation.createdName}</span>
                <span className="created-trip-value">{trip.trip_name}</span>
              </div>
              <div className="created-trip-detail">
                <span className="created-trip-label">{i18n.tripCreation.createdParticipants}</span>
                <ul className="created-trip-list">
                  {trip.participants.map((p, i) => (
                    <li key={i} className="created-trip-participant">👤 {p}</li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  className="delete-btn"
                  style={{ color: 'white', background: '#d32f2f', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', opacity: deleting === trip.trip_name ? 0.6 : 1 }}
                  onClick={e => { e.stopPropagation(); handleDelete(trip.trip_name); }}
                  disabled={deleting === trip.trip_name}
                  aria-label={i18n.tripsList.deleteAria(trip.trip_name)}
                >
                  {deleting === trip.trip_name ? i18n.tripsList.deleting : i18n.tripsList.delete}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthSection({ user, setUser, setPage, i18n }: { user: any, setUser: (u: any) => void, setPage: (p: string) => void, i18n: typeof en }) {
  return (
    <div style={{ margin: '32px auto 0 auto', textAlign: 'center', fontSize: 15, color: '#444' }}>
      {user ? (
        <>
          <span>{i18n.auth.signedInAs} <b>{user.name || user.email}</b></span>
          <button
            onClick={() => { googleLogout(); setUser(null); setPage('trip'); }}
            style={{ marginLeft: 12, padding: '4px 14px', background: '#f44336', color: 'white', border: 'none', borderRadius: 5, fontWeight: 500, cursor: 'pointer', fontSize: 14 }}
          >
            {i18n.auth.signOut}
          </button>
        </>
      ) : null}
    </div>
  );
}

function App() {
  const [page, setPage] = useState('trip');
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'es' | 'fil'>('en');
  const [selectedTrip, setSelectedTrip] = useState<{ trip_name: string; participants: string[] } | null>(null);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);
  let i18n = en;
  if (lang === 'es') i18n = es;
  else if (lang === 'fil') i18n = fil;

  // Handler to update participants after trip creation
  const handleTripCreated = (trip: { trip_name: string; participants: string[] }) => {
    setSelectedTrip(trip); // auto-select newly created trip
  };

  // Handler to select a trip from TripsList
  const handleTripSelected = (trip: { trip_name: string; participants: string[] } | null) => {
    setSelectedTrip(trip);
  };

  useEffect(() => {
    const handler = () => setPage('expense');
    window.addEventListener('navigateToExpenses', handler);
    return () => window.removeEventListener('navigateToExpenses', handler);
  }, []);

  return (
    <GoogleOAuthProvider clientId="208283253035-c5421mojqmb0mqhboou7bdtqo2dfh3k2.apps.googleusercontent.com">
      <div className="App">
        <header style={{ marginBottom: 24, padding: '18px 0 0 0' }}>
          <h1 style={{ textAlign: 'center', margin: 0, fontWeight: 700, fontSize: 32, letterSpacing: 1 }}>{i18n.appTitle}</h1>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <select
              value={lang}
              onChange={e => setLang(e.target.value as 'en' | 'es' | 'fil')}
              style={{ fontSize: 15, padding: '4px 10px', borderRadius: 5, border: '1px solid #bbb', background: '#fff', color: '#333', minWidth: 80 }}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
        </header>
        {user && user.email && (
          <nav
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              marginBottom: 24,
              maxWidth: 420,
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
            }}
          >
            <button onClick={() => setPage('trip')}>{i18n.nav.trip}</button>
            <button onClick={() => setPage('trips')}>{i18n.nav.trips}</button>
            <button onClick={() => setPage('expense')}>{i18n.nav.expense}</button>
            <button onClick={() => setPage('summary')}>{i18n.nav.summary}</button>
            <button onClick={() => setPage('settlements')}>{i18n.nav.settlements}</button>
          </nav>
        )}
        {page === 'trip' && <TripCreation user={user} setUser={setUser} i18n={i18n} onTripCreated={handleTripCreated} />}
        {page === 'trips' && <TripsList user={user} i18n={i18n} onTripSelected={handleTripSelected} selectedTrip={selectedTrip ?? undefined} />}
        {page === 'expense' && (
          <>
            {selectedTrip && (
              <div style={{ textAlign: 'center', marginBottom: 12, fontWeight: 500 }}>
                {i18n.tripsList.title}: <span style={{ color: '#BB3E00' }}>{selectedTrip.trip_name}</span>
              </div>
            )}
            <ExpenseForm i18n={i18n} user={user} participants={selectedTrip ? selectedTrip.participants : []} tripName={selectedTrip?.trip_name} onExpenseAdded={() => setExpensesRefreshKey(k => k + 1)} />
            <ExpensesList tripName={selectedTrip?.trip_name} user={user} key={expensesRefreshKey} />
          </>
        )}
        {page === 'summary' && <BalanceSummary i18n={i18n} />}
        {page === 'settlements' && <Settlements i18n={i18n} />}
        <AuthSection user={user} setUser={setUser} setPage={setPage} i18n={i18n} />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
