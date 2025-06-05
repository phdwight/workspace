import React, { useState, useRef, useEffect } from 'react';
import type { ExpenseFormProps } from '../../types';
import { useToast } from '../shared/Toast';
import { localStorageService } from '../../services/localStorage';

const ExpensesList: React.FC<{ tripName: string; refreshKey: number }> = ({ tripName, refreshKey }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    localStorageService.getExpensesForTrip(tripName, 'local')
      .then(setExpenses)
      .catch(err => setError(err.message || 'Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [tripName, refreshKey]);

  if (loading) return <div style={{ margin: '16px 0' }}>Loading expenses...</div>;
  if (error) return <div style={{ color: 'red', margin: '16px 0' }}>{error}</div>;
  if (!expenses.length) return <div style={{ margin: '16px 0' }}>No expenses yet.</div>;

  return (
    <div style={{ margin: '24px 0' }}>
      <h3 style={{ marginBottom: 8 }}>All Expenses</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f7ead9' }}>
            <th style={{ padding: 6, textAlign: 'left' }}>Description</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Payers</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Participants</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp: any, idx: number) => {
            const desc = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : '(No description)';
            const payersStr = Array.isArray(exp.payers)
              ? exp.payers.map((p: any) => `${p.name} (${Number(p.amount).toFixed(2)})`).join(', ')
              : '-';
            return (
              <tr key={exp.id || idx} style={{ background: idx % 2 ? '#fff' : '#f9f5f0' }}>
                <td style={{ padding: 6, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={desc}>
                  {desc}
                </td>
                <td style={{ padding: 6 }}>{payersStr}</td>
                <td style={{ padding: 6 }}>{Array.isArray(exp.participants) ? exp.participants.join(', ') : '-'}</td>
                <td style={{ padding: 6 }}>{exp.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const ExpenseForm: React.FC<Omit<ExpenseFormProps, 'user'>> = ({
  i18n,
  trip,
  onExpenseAdded
}) => {
  const [description, setDescription] = useState("");
  const [payers, setPayers] = useState<{ name: string; amount: string }[]>([{ name: "", amount: "" }]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSelectedParticipants(trip.participants);
  }, [trip.participants]);

  const handleParticipantToggle = (participant: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participant)
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    );
  };

  const handlePayerChange = (idx: number, field: 'name' | 'amount', value: string) => {
    setPayers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addPayer = () => setPayers(prev => [...prev, { name: "", amount: "" }]);
  const removePayer = (idx: number) => setPayers(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const validateForm = (): string | null => {
    if (!description.trim()) {
      return "Description is required";
    }
    if (payers.length === 0) {
      return "At least one payer is required";
    }
    let total = 0;
    for (const p of payers) {
      if (!p.name.trim()) return "Payer name is required for each payer";
      if (!trip.participants.includes(p.name.trim())) return "Each payer must be a trip participant";
      const amt = parseFloat(p.amount);
      if (!p.amount || isNaN(amt) || amt <= 0) return "Each payer must have a valid amount > 0";
      total += amt;
    }
    if (total <= 0) return "Total paid must be greater than 0";
    if (selectedParticipants.length === 0) {
      return "Please select at least one participant";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await localStorageService.createExpense(
        trip.trip_name,
        payers.map(p => ({ name: p.name.trim(), amount: parseFloat(p.amount) })),
        selectedParticipants,
        date,
        'local',
        description
      );
      addToast(`Expense "${description}" added successfully!`, 'success');
      setDescription("");
      setPayers([{ name: "", amount: "" }]);
      setSelectedParticipants(trip.participants);
      setDate(new Date().toISOString().split('T')[0]);
      if (onExpenseAdded) onExpenseAdded();
      setRefreshKey(k => k + 1);
      if (descriptionRef.current) descriptionRef.current.focus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add expense';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trip-creation-container">
      <h2>{i18n.expenseForm.title}</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        {error && (
          <div className="error-message" role="alert">{error}</div>
        )}
        {/* Date */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="date" style={{ minWidth: 110, marginRight: 8 }}>{i18n.expenseForm.dateLabel}</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className="input"
            max={new Date().toISOString().split('T')[0]}
            style={{ flex: 1 }}
          />
        </div>
        {/* Description */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="description" style={{ minWidth: 110, marginRight: 8 }}>{i18n.expenseForm.descriptionLabel}</label>
          <input
            ref={descriptionRef}
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={i18n.expenseForm.descriptionPlaceholder}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          />
        </div>
        {/* Payers */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ minWidth: 110, marginRight: 8 }}>{i18n.expenseForm.payerLabel}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {payers.map((payer, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={payer.name}
                  onChange={e => handlePayerChange(idx, 'name', e.target.value)}
                  disabled={loading}
                  className="input"
                  style={{ flex: 2 }}
                >
                  <option value="">Select payer</option>
                  {trip.participants.map((participant) => (
                    <option key={participant} value={participant}>{participant}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={payer.amount}
                  onChange={e => handlePayerChange(idx, 'amount', e.target.value)}
                  placeholder={i18n.expenseForm.amountPlaceholder}
                  disabled={loading}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removePayer(idx)} disabled={loading || payers.length === 1} style={{ fontSize: 18, color: '#BB3E00', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Remove payer">×</button>
              </div>
            ))}
            <button type="button" onClick={addPayer} disabled={loading} style={{ marginTop: 4, fontSize: 14, color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>+ Add another payer</button>
          </div>
        </div>
        {/* Participants */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
          <label style={{ minWidth: 110, marginRight: 8, marginTop: 2 }}>{i18n.expenseForm.participantsLabel}</label>
          <div style={{ marginTop: '0', flex: 1 }}>
            {trip.participants.map((participant) => (
              <label 
                key={participant}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '4px',
                  cursor: 'pointer' 
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(participant)}
                  onChange={() => handleParticipantToggle(participant)}
                  disabled={loading}
                />
                <span>{participant}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{ flex: 1 }}
          >
            {loading ? i18n.expenseForm.adding : i18n.expenseForm.submit}
          </button>
        </div>
      </form>
      <ExpensesList tripName={trip.trip_name} refreshKey={refreshKey} />
      {/* Add link to summary/balances page */}
      <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          type="button"
          className="submit-btn"
          style={{ minWidth: 120, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToSummary'));
            }
          }}
        >
          View Balance Summary
        </button>
        <button
          type="button"
          className="add-btn"
          style={{ minWidth: 120, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToTrips'));
            }
          }}
        >
          Back to Create Trip
        </button>
      </div>
    </div>
  );
};
