import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useRef, useEffect, useState } from 'react';
import './App.css'
import en from './i18n/en';
import es from './i18n/es';
import fil from './i18n/fil';

function TripCreation({ user, setUser, i18n }: { user: any, setUser: (u: any) => void, i18n: typeof en }) {
  const [tripName, setTripName] = useState("");
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdTrip, setCreatedTrip] = useState<null | { trip_name: string; participants: string[] }>(null);
  const tripNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tripNameRef.current?.focus();
  }, []);

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

function ExpenseForm({ i18n }: { i18n: typeof en }) {
  return (
    <div>
      <h2>{i18n.expenseForm.title}</h2>
      <p>{i18n.expenseForm.todo}</p>
    </div>
  )
}

function ExpenseHistory({ i18n }: { i18n: typeof en }) {
  return (
    <div>
      <h2>{i18n.expenseHistory.title}</h2>
      <p>{i18n.expenseHistory.todo}</p>
    </div>
  )
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

function TripsList({ user, i18n }: { user: any, setUser?: (u: any) => void, i18n: typeof en }) {
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
          <li key={idx} className="trips-list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{trip.trip_name}</strong>
              <span style={{ marginLeft: 8, color: '#555' }}>
                {i18n.tripsList.participants(trip.participants.length)}
              </span>
              <ul style={{ margin: '4px 0 0 18px', fontSize: '0.97em' }}>
                {trip.participants.map((p, i) => (
                  <li key={i}>👤 {p}</li>
                ))}
              </ul>
            </div>
            <button
              className="delete-btn"
              style={{ marginLeft: 16, color: 'white', background: '#d32f2f', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', opacity: deleting === trip.trip_name ? 0.6 : 1 }}
              onClick={() => handleDelete(trip.trip_name)}
              disabled={deleting === trip.trip_name}
              aria-label={i18n.tripsList.deleteAria(trip.trip_name)}
            >
              {deleting === trip.trip_name ? i18n.tripsList.deleting : i18n.tripsList.delete}
            </button>
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
  let i18n = en;
  if (lang === 'es') i18n = es;
  else if (lang === 'fil') i18n = fil;

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
            <button onClick={() => setPage('history')}>{i18n.nav.history}</button>
            <button onClick={() => setPage('summary')}>{i18n.nav.summary}</button>
            <button onClick={() => setPage('settlements')}>{i18n.nav.settlements}</button>
          </nav>
        )}
        {page === 'trip' && <TripCreation user={user} setUser={setUser} i18n={i18n} />}
        {page === 'trips' && <TripsList user={user} i18n={i18n} />}
        {page === 'expense' && <ExpenseForm i18n={i18n} />}
        {page === 'history' && <ExpenseHistory i18n={i18n} />}
        {page === 'summary' && <BalanceSummary i18n={i18n} />}
        {page === 'settlements' && <Settlements i18n={i18n} />}
        <AuthSection user={user} setUser={setUser} setPage={setPage} i18n={i18n} />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
