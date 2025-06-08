import React, { useState, useRef, useEffect } from 'react';
import type { ExpenseFormProps } from '../../types';
import { useToast } from '../shared/Toast';
import { localStorageService } from '../../services/localStorage';
import { formatCurrency } from '../../utils/currency';
import { EXPENSE_CATEGORIES } from '../../constants/expenseCategories';
import { ExpensesList } from './ExpensesList';

export const ExpenseForm: React.FC<Omit<ExpenseFormProps, 'user'>> = ({
  i18n,
  event,
  onExpenseAdded
}) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [payers, setPayers] = useState<{ name: string; amount: string }[]>([{ name: "", amount: "" }]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (categoryRef.current) {
      categoryRef.current.focus();
    }
    // Mobile-first design - no keyboard shortcuts needed
  }, []);

  useEffect(() => {
    setSelectedParticipants(event.participants);
  }, [event.participants]);

  const handleParticipantToggle = (participant: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participant)
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    );
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(event.participants);
  };

  const handleDeselectAllParticipants = () => {
    setSelectedParticipants([]);
  };

  const handlePayerChange = (idx: number, field: 'name' | 'amount', value: string) => {
    setPayers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setError(null); // Clear error when user makes changes
  };

  const addPayer = () => {
    setPayers(prev => [...prev, { name: "", amount: "" }]);
    // Focus on the new payer's name field
    setTimeout(() => {
      const selects = document.querySelectorAll<HTMLSelectElement>('.payer-select');
      const lastSelect = selects[selects.length - 1];
      lastSelect?.focus();
    }, 0);
  };
  
  const removePayer = (idx: number) => {
    if (payers.length <= 1) return;
    setPayers(prev => prev.filter((_, i) => i !== idx));
    
    // Focus management after removal
    setTimeout(() => {
      const selects = document.querySelectorAll<HTMLSelectElement>('.payer-select');
      if (selects.length > 0) {
        const focusIndex = Math.min(idx, selects.length - 1);
        (selects[focusIndex] as HTMLSelectElement)?.focus();
      }
    }, 0);
  };

  const calculateSplitEqually = () => {
    const totalAmount = payers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    if (totalAmount > 0 && selectedParticipants.length > 0) {
      const amountPerPerson = totalAmount / selectedParticipants.length;
      addToast(
        `Amount per person: ${formatCurrency(amountPerPerson)}`,
        'success'
      );
    }
  };

  const validateForm = (): string | null => {
    if (!category.trim()) {
      return "Category is required";
    }
    if (payers.length === 0) {
      return "At least one payer is required";
    }
    let total = 0;
    for (const p of payers) {
      if (!p.name.trim()) return "Payer name is required for each payer";
      if (!event.participants.includes(p.name.trim())) return "Each payer must be an event participant";
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
        event.event_name,
        payers.map(p => ({ name: p.name.trim(), amount: parseFloat(p.amount) })),
        selectedParticipants,
        date,
        'local',
        description,
        category
      );
      const displayName = description.trim() || EXPENSE_CATEGORIES.find(cat => cat.value === category)?.label || category;
      addToast(`Expense "${displayName}" added successfully!`, 'success');
      setDescription("");
      setCategory("");
      setPayers([{ name: "", amount: "" }]);
      setSelectedParticipants(event.participants);
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

  // Add participant to event
  const handleAddParticipantToEvent = async () => {
    const newParticipant = prompt('Enter the name of the new participant:');
    if (!newParticipant || !newParticipant.trim()) return;
    if (event.participants.includes(newParticipant.trim())) {
      addToast('Participant already exists in this event.', 'error');
      return;
    }
    // Update event in localStorage
    const events = JSON.parse(localStorage.getItem('bill_splitter_events') || '[]');
    const eventIdx = events.findIndex((e: any) => e.id === event.id);
    if (eventIdx === -1) return;
    events[eventIdx].participants.push(newParticipant.trim());
    localStorage.setItem('bill_splitter_events', JSON.stringify(events));
    // Update UI
    event.participants.push(newParticipant.trim());
    setSelectedParticipants([...event.participants]);
    addToast('Participant added!', 'success');
  };

  return (
    <div className="event-creation-container">
      <h2>{i18n.expenseForm.title}</h2>
      
      <form onSubmit={handleSubmit} className="event-form">
        {error && (
          <div className="error-message" role="alert" style={{ 
            marginBottom: 16, 
            padding: '12px', 
            backgroundColor: 'var(--error-bg, #ffebee)', 
            borderRadius: '8px', 
            border: '1px solid var(--danger)', 
            color: 'var(--danger, #d32f2f)',
            fontSize: '14px',
            fontWeight: '500'
          }}>{error}</div>
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
        
        {/* Category */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="category" style={{ minWidth: 110, marginRight: 8 }}>{(i18n.expenseForm as any).categoryLabel || "Category"} *</label>
          <select
            ref={categoryRef}
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
            required
          >
            <option value="">{(i18n.expenseForm as any).categoryPlaceholder || "Select category"}</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {(i18n.expenseForm as any).categories?.[cat.value] || cat.label}
              </option>
            ))}
          </select>
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
              <div key={idx} className="payer-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={payer.name}
                  onChange={e => handlePayerChange(idx, 'name', e.target.value)}
                  disabled={loading}
                  className="input payer-select"
                  style={{ flex: 2 }}
                >
                  <option value="">Select payer</option>
                  {event.participants.map((participant) => (
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
                <button 
                  type="button" 
                  onClick={() => removePayer(idx)} 
                  disabled={loading || payers.length === 1} 
                  style={{ 
                    fontSize: 18, 
                    color: 'var(--danger, #d32f2f)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }} 
                  aria-label="Remove payer"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addPayer} 
              disabled={loading} 
              style={{ 
                marginTop: 4, 
                fontSize: 14, 
                color: 'var(--theme-primary)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left' 
              }}
            >
              + Add another payer
            </button>
          </div>
        </div>
        
        {/* Participants */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
          <label style={{ minWidth: 110, marginRight: 8, marginTop: 2 }}>{i18n.expenseForm.participantsLabel}</label>
          <div style={{ marginTop: '0', flex: 1 }}>
            <div className="participant-helpers">
              <button 
                type="button" 
                onClick={handleSelectAllParticipants} 
                disabled={loading}
                className="participant-helper-btn"
              >
                {(i18n.expenseForm as any).selectAllParticipants || "Select All"}
              </button>
              <button 
                type="button" 
                onClick={handleDeselectAllParticipants} 
                disabled={loading}
                className="participant-helper-btn"
              >
                {(i18n.expenseForm as any).deselectAllParticipants || "Deselect All"}
              </button>
              <button 
                type="button" 
                onClick={calculateSplitEqually} 
                disabled={loading || selectedParticipants.length === 0}
                className="participant-helper-btn"
              >
                {(i18n.expenseForm as any).splitEqually || "Split Equally"}
              </button>
            </div>
            {event.participants.map((participant) => (
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
            <button 
              type="button" 
              onClick={handleAddParticipantToEvent} 
              disabled={loading} 
              style={{ 
                marginTop: 6, 
                fontSize: 14, 
                color: 'var(--theme-primary)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left' 
              }}
            >
              + {(i18n.expenseForm as any).addParticipantToEvent || "Add participant to event"}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexDirection: 'column' }}>
          <div className="submit-button-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{ flex: 1, minWidth: '200px' }}
            >
              {loading ? i18n.expenseForm.adding : i18n.expenseForm.submit}
            </button>
          </div>
        </div>
      </form>
      
      <ExpensesList eventName={event.event_name} refreshKey={refreshKey} i18n={i18n} />
      
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
          {i18n.expenseForm.viewBalanceSummary || 'View Balance Summary'}
        </button>
        <button
          type="button"
          className="submit-btn"
          style={{ minWidth: 120, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToEvents'));
            }
          }}
        >
          {i18n.expenseForm.backToCreateEvent || 'Back to Create Event'}
        </button>
      </div>
    </div>
  );
};
