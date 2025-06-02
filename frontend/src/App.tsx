import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useRef, useEffect, useState } from 'react';
import './App.css'
import en from './i18n/en';
import es from './i18n/es';
import fil from './i18n/fil';

function TripCreation({ user, setUser, i18n, onTripCreated, setPage, setSelectedTrip: _setSelectedTrip, trips, setTrips }: { user: any, setUser: (u: any) => void, i18n: typeof en, onTripCreated?: (trip: { trip_name: string; participants: string[] }) => void, setPage: (p: string) => void, setSelectedTrip: (t: { trip_name: string; participants: string[] }) => void, trips: { trip_name: string; participants: string[] }[], setTrips: (t: { trip_name: string; participants: string[] }[]) => void }) {
  const setSelectedTrip = _setSelectedTrip;
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

  useEffect(() => {
    if (!user || !user.email) {
      setTrips([]);
      return;
    }
    fetch(`http://localhost:8000/trips?user_email=${encodeURIComponent(user.email)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setTrips(data));
  }, [user, createdTrip]);

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
            style={{ width: '100%', boxSizing: 'border-box', maxWidth: 400 }}
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
      {/* Table of all trips for this user */}
      {user && user.email && trips.length > 0 && (
        <div style={{ marginTop: 24, maxWidth: 520, width: '100%', boxSizing: 'border-box', marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 18, color: '#BB3E00' }}>
            <span role="img" aria-label="Trips">🧳</span>
            {i18n.tripsList.title}
          </h3>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <table style={{ width: '100%', minWidth: 0, borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', overflow: 'hidden', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7ead9', color: '#BB3E00', fontWeight: 700, fontSize: 13 }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', borderTopLeftRadius: 10 }}>Trip</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>Participants</th>
                  <th style={{ width: 32 }}></th>
                  <th style={{ width: 120, borderTopRightRadius: 10 }}></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, idx) => (
                  <tr
                    key={trip.trip_name}
                    style={{
                      borderBottom: idx === trips.length - 1 ? 'none' : '1px solid #eee',
                      background: idx % 2 === 0 ? '#fff' : '#f7ead9',
                      transition: 'background 0.12s',
                    }}
                  >
                    <td style={{ padding: '8px 6px', fontWeight: 600, fontSize: 13, color: '#2d1a0b', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
                        <span style={{ marginRight: 6, fontSize: 15, display: 'flex', alignItems: 'center' }}>🧳</span>
                        <span style={{ display: 'block', lineHeight: 1.2 }}>{trip.trip_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 6px', color: '#555', fontSize: 13, verticalAlign: 'middle', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={trip.participants.join(', ')}
                    >
                      {trip.participants.join(', ')}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28 }}>
                        <button
                          type="button"
                          aria-label={i18n.tripsList.deleteAria ? i18n.tripsList.deleteAria(trip.trip_name) : `Delete trip ${trip.trip_name}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            fontSize: 18,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 28,
                            width: 28,
                            borderRadius: 5,
                            transition: 'color 0.15s',
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm(i18n.tripsList.confirmDelete ? i18n.tripsList.confirmDelete(trip.trip_name) : `Delete trip ${trip.trip_name}?`)) {
                              fetch(`http://localhost:8000/trips/${encodeURIComponent(trip.trip_name)}?user_email=${encodeURIComponent(user.email)}`, { method: 'DELETE' })
                                .then(res => {
                                  if (res.ok) {
                                    setTrips(trips.filter((t) => t.trip_name !== trip.trip_name));
                                  }
                                });
                            }
                          }}
                        >
                          <span role="img" aria-label="Delete" style={{ display: 'block', lineHeight: 1, fontSize: 18, margin: 0, padding: 0 }}>🗑️</span>
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        type="button"
                        style={{ background: '#BB3E00', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                        onClick={e => { e.stopPropagation(); setSelectedTrip(trip); setPage('addExpense'); }}
                      >
                        {i18n.nav.expense}
                      </button>
                      <button
                        type="button"
                        style={{ background: '#A2B9A7', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                        onClick={e => { e.stopPropagation(); setSelectedTrip(trip); setPage('summary'); }}
                      >
                        {i18n.nav.summary}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ i18n, user, participants = [], tripName, onExpenseAdded }: { i18n: typeof en, user: any, participants?: string[], tripName?: string, onExpenseAdded?: () => void }) {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseParticipants, setExpenseParticipants] = useState<string[]>(participants);
  const [date, setDate] = useState(() => {
    // Set default date to today in yyyy-mm-dd format
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Always select all participants by default when participants change
  useEffect(() => {
    setExpenseParticipants([...participants]);
    // If payer is not in new participants, reset payer
    if (payer && !participants.includes(payer)) {
      setPayer(participants.length === 1 ? participants[0] : '');
    }
  }, [participants]);

  // Improved: auto-select payer if only one participant
  useEffect(() => {
    if (participants.length === 1) {
      setPayer(participants[0]);
    } else if (participants.length > 1 && !participants.includes(payer)) {
      setPayer('');
    }
  }, [participants]);

  // Ensure payer is always a valid participant
  useEffect(() => {
    if (payer && !participants.includes(payer)) {
      setPayer('');
    }
  }, [participants, payer]);

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
    if (!date) {
      setError('Please select a date.');
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
      setExpenseParticipants([...participants]); // Reset to all participants
      setDate(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
      });
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
            <span style={{ color: '#A2B9A7', fontWeight: 700, fontSize: 18 }}>¤</span>
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
            required
          />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 6, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', marginBottom: 6, fontWeight: 600, textAlign: 'center' }}>{success}</div>}
        <button type="submit" className="submit-btn" style={{ marginTop: 8, fontSize: 16, fontWeight: 700, background: '#BB3E00', color: '#fff', minHeight: 40 }}>Add Expense</button>
      </form>
    </div>
  )
}

function ExpensesList({ tripName, user, refreshKey }: { tripName?: string, user: any, refreshKey?: number }) {
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
  }, [tripName, user, refreshKey]);

  const handleDelete = async (idx: number) => {
    const exp = expenses[idx];
    if (!window.confirm('Delete this expense?')) return;
    try {
      await fetch(`http://localhost:8000/expenses/${encodeURIComponent(exp.id ?? idx)}?user_email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });
      setExpenses(exps => exps.filter((_, i) => i !== idx));
    } catch (err) {
      alert('Failed to delete expense');
    }
  };
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
              <th style={{ width: 60, textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 4px', color: '#A2B9A7', fontWeight: 500 }}>
                  {exp.date ? exp.date : <span style={{ color: '#bbb' }}>—</span>}
                </td>
                <td style={{ padding: '6px 4px', fontWeight: 500 }}>{exp.payer}</td>
                <td style={{ padding: '6px 4px', color: '#BB3E00', fontWeight: 700 }}>¤{exp.amount.toFixed(2)}</td>
                <td style={{ padding: '6px 4px', color: '#555' }}>{exp.participants.join(', ')}</td>
                <td style={{ padding: '6px 4px', textAlign: 'center', display: 'flex', gap: 4 }}>
                  <button onClick={() => handleDelete(i)} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 18, cursor: 'pointer' }} title="Delete" aria-label="Delete"><span role="img" aria-label="Delete">🗑️</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function getSettlements(balances: Record<string, number | string>) {
  // Convert all balances to numbers and round to avoid floating point issues
  const entries: [string, number][] = Object.entries(balances).map(([p, b]) => [p, Math.round(Number(b) * 100) / 100]);
  // Filter out near-zero balances
  const filtered: [string, number][] = entries.filter(([_, b]) => Math.abs(b) > 0.009);
  // Sort debtors (negative) and creditors (positive)
  const debtors: [string, number][] = filtered.filter(([_, b]) => b < 0).sort((a, b) => a[1] - b[1]);
  const creditors: [string, number][] = filtered.filter(([_, b]) => b > 0).sort((a, b) => b[1] - a[1]);
  const settlements: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const [debtor, debt] = debtors[i];
    const [creditor, credit] = creditors[j];
    const amount = Math.min(-debt, credit);
    if (amount > 0.009) {
      settlements.push({ from: debtor, to: creditor, amount: Math.round(amount * 100) / 100 });
      debtors[i][1] = Math.round((debtors[i][1] + amount) * 100) / 100;
      creditors[j][1] = Math.round((creditors[j][1] - amount) * 100) / 100;
    }
    if (Math.abs(debtors[i][1]) < 0.009) i++;
    if (Math.abs(creditors[j][1]) < 0.009) j++;
  }
  return settlements;
}

function BalanceSummary({ i18n, user, trips, hideTitle }: { i18n: typeof en, user: any, trips: { trip_name: string; participants: string[] }[], hideTitle?: boolean }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.email) {
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8000/expenses?trip_name=${encodeURIComponent(trips[0]?.trip_name)}&user_email=${encodeURIComponent(user.email)}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        // Calculate balances
        const participants = trips[0]?.participants || [];
        const balances: Record<string, number> = {};
        participants.forEach(p => { balances[p] = 0; });
        data.forEach((exp: any) => {
          const share = exp.amount / exp.participants.length;
          exp.participants.forEach((p: string) => {
            balances[p] -= share;
          });
          balances[exp.payer] += exp.amount;
        });
        setSummary({ balances, expenses: data });
      })
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  }, [user, trips]);

  if (!user || !user.email) return null;
  return (
    <div style={{ maxWidth: 500, margin: '18px auto 0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16 }}>
      {/* Only show the title if hideTitle is not true */}
      {!hideTitle && (
        <h3 style={{ color: '#BB3E00', margin: '0 0 10px 0', fontWeight: 700, fontSize: 18 }}>{i18n.balanceSummary.title}</h3>
      )}
      {/* Removed trip dropdown because selectedTrip is already set in App */}
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {summary && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, marginTop: 10 }}>
            <thead>
              <tr style={{ background: '#f7ead9', color: '#BB3E00', fontWeight: 700 }}>
                <th style={{ padding: '6px 4px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Participant</th>
                <th style={{ padding: '6px 4px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.balances).map(([p, bal]) => {
                const balNum = typeof bal === 'number' ? bal : Number(bal);
                return (
                  <tr key={p}>
                    <td style={{ padding: '6px 4px', fontWeight: 500 }}>{p}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: balNum < 0 ? '#d32f2f' : '#388e3c', fontWeight: 700 }}>
                      {balNum < 0 ? '-' : ''}¤{Math.abs(balNum).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Who owes whom settlements */}
          <div style={{ marginTop: 18 }}>
            <h4 style={{ color: '#BB3E00', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Who owes whom</h4>
            {(() => {
              const settlements = getSettlements(summary.balances);
              if (settlements.length === 0) return <div style={{ color: '#388e3c' }}>All settled up!</div>;
              return (
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {settlements.map((s, i) => (
                    <li key={i} style={{ marginBottom: 4, color: '#444', fontSize: 15 }}>
                      <span style={{ fontWeight: 500 }}>{s.from}</span> needs to pay <span style={{ fontWeight: 500 }}>{s.to}</span> <span style={{ color: '#BB3E00', fontWeight: 700 }}>¤{s.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </>
      )}
      {!loading && !summary && <div style={{ color: '#888', marginTop: 12 }}>No data to summarize.</div>}
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
  const [trips, setTrips] = useState<{ trip_name: string; participants: string[] }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<{ trip_name: string; participants: string[] } | null>(null);
  let i18n = en;
  if (lang === 'es') i18n = es;
  else if (lang === 'fil') i18n = fil;
  useEffect(() => {
    if (!user || !user.email) {
      setTrips([]);
      return;
    }
    fetch(`http://localhost:8000/trips?user_email=${encodeURIComponent(user.email)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setTrips(data));
  }, [user]);
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
        {/* Removed top navigation menu (Trip, Expenses, Summary) */}
        {page === 'trip' && (
          <div className="main-card" style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #0002', padding: 28, marginTop: 24 }}>
            <h2 style={{ textAlign: 'center', color: '#BB3E00', marginBottom: 22, fontWeight: 800, fontSize: 26, letterSpacing: 0.5 }}>{i18n.tripCreation.title}</h2>
            <TripCreation user={user} setUser={setUser} i18n={i18n} onTripCreated={() => {}} setPage={setPage} setSelectedTrip={setSelectedTrip} trips={trips} setTrips={setTrips} />
          </div>
        )}
        {page === 'addExpense' && selectedTrip && (
          <div className="main-card" style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #0002', padding: 28, marginTop: 24 }}>
            <h2 style={{ textAlign: 'center', color: '#BB3E00', marginBottom: 22, fontWeight: 800, fontSize: 26, letterSpacing: 0.5 }}>{i18n.expenseForm.title.replace('Add Expense', 'Expenses')} <span style={{ fontWeight: 400, fontSize: 18, color: '#555' }}>– {selectedTrip.trip_name}</span></h2>
            <ExpenseForm
              i18n={i18n}
              user={user}
              participants={selectedTrip.participants}
              tripName={selectedTrip.trip_name}
              onExpenseAdded={() => setRefreshKey(k => k + 1)}
            />
            <ExpensesList tripName={selectedTrip.trip_name} user={user} refreshKey={refreshKey} />
            <div style={{ textAlign: 'center', marginTop: 22, display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
              <button
                type="button"
                style={{ background: '#BB3E00', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001', letterSpacing: 0.2 }}
                onClick={() => setPage('trip')}
              >
                {i18n.nav.trip}
              </button>
              <button
                type="button"
                style={{ background: '#A2B9A7', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001', letterSpacing: 0.2 }}
                onClick={() => setPage('summary')}
              >
                {i18n.nav.summary}
              </button>
            </div>
          </div>
        )}
        {page === 'summary' && selectedTrip && (
          <div className="main-card" style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #0002', padding: 28, marginTop: 24 }}>
            <h2 style={{ textAlign: 'center', color: '#BB3E00', marginBottom: 22, fontWeight: 800, fontSize: 26, letterSpacing: 0.5 }}>{i18n.balanceSummary.title} <span style={{ fontWeight: 400, fontSize: 18, color: '#555' }}>– {selectedTrip.trip_name}</span></h2>
            {/* Remove duplicate BalanceSummary title inside BalanceSummary component */}
            <BalanceSummary i18n={i18n} user={user} trips={[selectedTrip]} hideTitle />
            <div style={{ textAlign: 'center', marginTop: 22, display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
              <button
                type="button"
                style={{ background: '#BB3E00', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001', letterSpacing: 0.2 }}
                onClick={() => setPage('trip')}
              >
                {i18n.nav.trip}
              </button>
              <button
                type="button"
                style={{ background: '#A2B9A7', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001', letterSpacing: 0.2 }}
                onClick={() => setPage('addExpense')}
              >
                {i18n.nav.expense}
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: '#888' }}>
              {i18n.balanceSummary.note}
            </div>
          </div>
        )}
        <AuthSection user={user} setUser={setUser} setPage={setPage} i18n={i18n} />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
