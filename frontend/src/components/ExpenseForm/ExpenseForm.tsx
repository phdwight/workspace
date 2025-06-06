import React, { useState, useRef, useEffect } from 'react';
import type { ExpenseFormProps } from '../../types';
import { useToast } from '../shared/Toast';
import { localStorageService } from '../../services/localStorage';

const ExpensesList: React.FC<{ tripName: string; refreshKey: number; i18n: any }> = ({ tripName, refreshKey, i18n }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const { addToast } = useToast();

  const categories = [
    { value: 'food', label: i18n.expenseForm.categories?.food || 'Food & Dining' },
    { value: 'transportation', label: i18n.expenseForm.categories?.transportation || 'Transportation' },
    { value: 'accommodation', label: i18n.expenseForm.categories?.accommodation || 'Accommodation' },
    { value: 'entertainment', label: i18n.expenseForm.categories?.entertainment || 'Entertainment' },
    { value: 'shopping', label: i18n.expenseForm.categories?.shopping || 'Shopping' },
    { value: 'utilities', label: i18n.expenseForm.categories?.utilities || 'Utilities' },
    { value: 'other', label: i18n.expenseForm.categories?.other || 'Other' }
  ];

  useEffect(() => {
    setLoading(true);
    localStorageService.getExpensesForTrip(tripName, 'local')
      .then(setExpenses)
      .catch(err => setError(err.message || 'Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [tripName, refreshKey]);

  useEffect(() => {
    let filtered = expenses.filter(exp => {
      const matchesSearch = !searchTerm || 
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.payers?.some((p: any) => p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exp.participants?.some((p: string) => p.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !categoryFilter || exp.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          const totalA = Array.isArray(a.payers) ? a.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0) : 0;
          const totalB = Array.isArray(b.payers) ? b.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0) : 0;
          return totalB - totalA;
        case 'description':
          return (a.description || '').localeCompare(b.description || '');
        default:
          return 0;
      }
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, sortBy]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm((i18n.expenseForm as any).confirmDeleteExpense || 'Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await localStorageService.deleteExpense(expenseId, 'local');
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      addToast((i18n.expenseForm as any).expenseDeleted || 'Expense deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete expense', 'error');
    }
  };

  const handleExportExpenses = () => {
    if (expenses.length === 0) {
      addToast('No expenses to export', 'error');
      return;
    }

    const csvContent = [
      ['Date', 'Description', 'Category', 'Payers', 'Amount', 'Participants'].join(','),
      ...expenses.map(exp => [
        exp.date,
        `"${exp.description || ''}"`,
        exp.category || '',
        `"${Array.isArray(exp.payers) ? exp.payers.map((p: any) => `${p.name}: $${p.amount}`).join('; ') : ''}"`,
        Array.isArray(exp.payers) ? exp.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toFixed(2) : '0.00',
        `"${Array.isArray(exp.participants) ? exp.participants.join(', ') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripName}-expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast((i18n.expenseForm as any).expensesExported || 'Expenses exported successfully!', 'success');
  };

  const calculateTotal = () => {
    return filteredExpenses.reduce((total, exp) => {
      const expenseTotal = Array.isArray(exp.payers) 
        ? exp.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0) 
        : 0;
      return total + expenseTotal;
    }, 0);
  };

  if (loading) return <div style={{ margin: '16px 0', textAlign: 'center', color: 'var(--theme-muted)' }}>{(i18n.expenseForm as any).loadingExpenses || 'Loading expenses...'}</div>;
  if (error) return <div style={{ color: 'var(--danger, #d32f2f)', margin: '16px 0', textAlign: 'center', padding: '12px', backgroundColor: 'var(--error-bg, #ffebee)', borderRadius: '4px' }}>{error}</div>;

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>{(i18n.expenseForm as any).expensesList || 'Expenses List'}</h3>
        {expenses.length > 0 && (
          <button
            onClick={handleExportExpenses}
            className="export-btn"
          >
            {(i18n.expenseForm as any).exportExpenses || 'Export CSV'}
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="expense-empty-state">
          {(i18n.expenseForm as any).noExpenses || 'No expenses yet.'}
        </div>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <div className="expense-filter-controls">
            <input
              type="text"
              placeholder={(i18n.expenseForm as any).searchPlaceholder || 'Search expenses...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="expense-search-input"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">{(i18n.expenseForm as any).filterByCategory || 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">{(i18n.expenseForm as any).sortBy || 'Sort by'}: Date</option>
              <option value="amount">{(i18n.expenseForm as any).sortBy || 'Sort by'}: Amount</option>
              <option value="description">{(i18n.expenseForm as any).sortBy || 'Sort by'}: Description</option>
            </select>
          </div>

          {/* Total Amount Display */}
          <div className="expense-total-display">
            {(i18n.expenseForm as any).totalAmount || 'Total Amount'}: ${calculateTotal().toFixed(2)}
            {filteredExpenses.length !== expenses.length && (
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--theme-muted)', marginLeft: '8px' }}>
                (Showing {filteredExpenses.length} of {expenses.length} expenses)
              </span>
            )}
          </div>

          {/* Expenses Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredExpenses.map((exp: any, idx: number) => {
              const desc = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : '(No description)';
              const totalAmount = Array.isArray(exp.payers) 
                ? exp.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0) 
                : 0;
              const categoryLabel = categories.find(cat => cat.value === exp.category)?.label || exp.category || 'Other';
              
              return (
                <div 
                  key={exp.id || idx} 
                  className="expense-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{desc}</h4>
                        {exp.category && (
                          <span className="expense-category-tag">
                            {categoryLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)', marginBottom: '4px' }}>
                        <strong>Date:</strong> {exp.date}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)', marginBottom: '4px' }}>
                        <strong>Payers:</strong> {Array.isArray(exp.payers) 
                          ? exp.payers.map((p: any) => `${p.name} ($${Number(p.amount).toFixed(2)})`).join(', ')
                          : '-'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)' }}>
                        <strong>Participants:</strong> {Array.isArray(exp.participants) ? exp.participants.join(', ') : '-'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div className="expense-amount-display">
                        ${totalAmount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="delete-btn"
                      >
                        {(i18n.expenseForm as any).deleteExpense || 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const ExpenseForm: React.FC<Omit<ExpenseFormProps, 'user'>> = ({
  i18n,
  trip,
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
  const { addToast } = useToast();

  // Categories for expenses
  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.focus();
    }
    // Mobile-first design - no keyboard shortcuts needed
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

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(trip.participants);
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
        `Amount per person: $${amountPerPerson.toFixed(2)}`,
        'success'
      );
    }
  };

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
        description,
        category
      );
      addToast(`Expense "${description}" added successfully!`, 'success');
      setDescription("");
      setCategory("");
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

  // Add participant to trip
  const handleAddParticipantToTrip = async () => {
    const newParticipant = prompt('Enter the name of the new participant:');
    if (!newParticipant || !newParticipant.trim()) return;
    if (trip.participants.includes(newParticipant.trim())) {
      addToast('Participant already exists in this event.', 'error');
      return;
    }
    // Update trip in localStorage
    const trips = JSON.parse(localStorage.getItem('bill_splitter_trips') || '[]');
    const tripIdx = trips.findIndex((t: any) => t.id === trip.id);
    if (tripIdx === -1) return;
    trips[tripIdx].participants.push(newParticipant.trim());
    localStorage.setItem('bill_splitter_trips', JSON.stringify(trips));
    // Update UI
    trip.participants.push(newParticipant.trim());
    setSelectedParticipants([...trip.participants]);
    addToast('Participant added!', 'success');
  };

  return (
    <div className="trip-creation-container">
      <h2>{i18n.expenseForm.title}</h2>
      
      {/* Feature Overview */}
      <div style={{ 
        background: 'var(--theme-card)', 
        border: '1px solid var(--theme-accent)', 
        borderRadius: '6px', 
        padding: '12px', 
        marginBottom: '16px',
        fontSize: '14px',
        color: 'var(--theme-font)'
      }}>
        <strong>💡 Enhanced Features:</strong> 
        <span style={{ marginLeft: '8px' }}>
          Category selection • Participant helpers • Real-time calculations • Export/Import • Search & filter
        </span>
      </div>
      
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
        
        {/* Category */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="category" style={{ minWidth: 110, marginRight: 8 }}>{(i18n.expenseForm as any).categoryLabel || "Category"}</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          >
            <option value="">{(i18n.expenseForm as any).categoryPlaceholder || "Select category"}</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {(i18n.expenseForm as any).categories?.[cat.value] || cat.label}
              </option>
            ))}
          </select>
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
                <button type="button" onClick={() => removePayer(idx)} disabled={loading || payers.length === 1} style={{ fontSize: 18, color: 'var(--danger, #d32f2f)', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Remove payer">×</button>
              </div>
            ))}
            <button type="button" onClick={addPayer} disabled={loading} style={{ marginTop: 4, fontSize: 14, color: 'var(--theme-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>+ Add another payer</button>
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
              <span style={{ fontSize: 12, color: 'var(--theme-muted)' }}>|</span>
              <button 
                type="button" 
                onClick={handleDeselectAllParticipants} 
                disabled={loading}
                className="participant-helper-btn"
              >
                {(i18n.expenseForm as any).deselectAllParticipants || "Deselect All"}
              </button>
              <span style={{ fontSize: 12, color: 'var(--theme-muted)' }}>|</span>
              <button 
                type="button" 
                onClick={calculateSplitEqually} 
                disabled={loading || selectedParticipants.length === 0}
                className="participant-helper-btn"
              >
                {(i18n.expenseForm as any).splitEqually || "Split Equally"}
              </button>
            </div>
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
            <button type="button" onClick={handleAddParticipantToTrip} disabled={loading} style={{ marginTop: 6, fontSize: 14, color: 'var(--theme-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>+ {(i18n.expenseForm as any).addParticipantToEvent || "Add participant to event"}</button>
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
            <button
              type="button"
              onClick={() => {
                addToast((i18n.expenseForm as any).receiptAdded || 'Receipt attachment feature coming soon!', 'info');
              }}
              disabled={loading}
              className="add-btn"
              style={{ padding: '12px 16px', fontSize: '14px' }}
            >
              📷 Receipt
            </button>
          </div>
        </div>
      </form>
      <ExpensesList tripName={trip.trip_name} refreshKey={refreshKey} i18n={i18n} />
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
          className="add-btn"
          style={{ minWidth: 120, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToTrips'));
            }
          }}
        >
          {i18n.expenseForm.backToCreateEvent || 'Back to Create Event'}
        </button>
      </div>
    </div>
  );
};
