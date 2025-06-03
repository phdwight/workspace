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
            <th style={{ padding: 6, textAlign: 'left' }}>Amount</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Payer</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Participants</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => {
            // Fix: use exp.description, not just description
            const desc = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : '(No description)';
            return (
              <tr key={exp.id || idx} style={{ background: idx % 2 ? '#fff' : '#f9f5f0' }}>
                <td style={{ padding: 6, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={desc}>
                  {desc}
                </td>
                <td style={{ padding: 6 }}>{exp.amount?.toFixed(2)}</td>
                <td style={{ padding: 6 }}>{exp.payer}</td>
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
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
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
    // Auto-select all participants by default
    setSelectedParticipants(trip.participants);
  }, [trip.participants]);

  const handleParticipantToggle = (participant: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participant)
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    );
  };

  const validateForm = (): string | null => {
    if (!description.trim()) {
      return "Description is required";
    }
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return "Please enter a valid amount greater than 0";
    }
    
    if (!payer.trim()) {
      return "Please select who paid";
    }
    
    if (!trip.participants.includes(payer.trim())) {
      return "Payer must be one of the trip participants";
    }
    
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
        payer.trim(),
        parseFloat(amount),
        selectedParticipants,
        date,
        'local', // Always use 'local' for unauthenticated user
        description // pass description as last argument
      );

      addToast(`Expense "${description}" added successfully!`, 'success');
      
      // Reset form
      setDescription("");
      setAmount("");
      setPayer("");
      setSelectedParticipants(trip.participants);
      setDate(new Date().toISOString().split('T')[0]);
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
      setRefreshKey(k => k + 1); // trigger ExpensesList refresh
      
      // Focus back to description for next entry
      if (descriptionRef.current) {
        descriptionRef.current.focus();
      }
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
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Date field first, inline label and input */}
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

        {/* Amount */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="amount" style={{ minWidth: 110, marginRight: 8 }}>{i18n.expenseForm.amountLabel}</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={i18n.expenseForm.amountPlaceholder}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          />
        </div>

        {/* Payer */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="payer" style={{ minWidth: 110, marginRight: 8 }}>{i18n.expenseForm.payerLabel}</label>
          <select
            id="payer"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          >
            <option value="">Select who paid</option>
            {trip.participants.map((participant) => (
              <option key={participant} value={participant}>
                {participant}
              </option>
            ))}
          </select>
        </div>

        {/* Participants (checkboxes, keep vertical for clarity) */}
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
