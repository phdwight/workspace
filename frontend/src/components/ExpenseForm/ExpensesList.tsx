import React, { useState, useEffect } from 'react';
import { useToast } from '../shared/Toast';
import { localStorageService } from '../../services/localStorage';
import { formatCurrency } from '../../utils/currency';
import { EXPENSE_CATEGORIES } from '../../constants/expenseCategories';

interface ExpensesListProps {
  eventName: string;
  refreshKey: number;
  i18n: any;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ eventName, refreshKey, i18n }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const { addToast } = useToast();

  const categories = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    label: i18n.expenseForm.categories?.[cat.value] || cat.label
  }));

  useEffect(() => {
    setLoading(true);
    localStorageService.getExpensesForEvent(eventName, 'local')
      .then(setExpenses)
      .catch(err => setError(err.message || 'Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [eventName, refreshKey]);

  useEffect(() => {
    let filtered = expenses.filter(exp => {
      const matchesCategory = !categoryFilter || exp.category === categoryFilter;
      return matchesCategory;
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
  }, [expenses, categoryFilter, sortBy]);

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
        `"${Array.isArray(exp.payers) ? exp.payers.map((p: any) => `${p.name}: ${formatCurrency(p.amount)}`).join('; ') : ''}"`,
        Array.isArray(exp.payers) ? exp.payers.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toFixed(2) : '0.00',
        `"${Array.isArray(exp.participants) ? exp.participants.join(', ') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName}-expenses.csv`;
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
          {/* Filter Controls */}
          <div className="expense-filter-controls">
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
            {(i18n.expenseForm as any).totalAmount || 'Total Amount'}: {formatCurrency(calculateTotal())}
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
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{categoryLabel}</h4>
                        <span style={{ fontSize: '14px', color: 'var(--theme-muted)', fontWeight: 'normal' }}>
                          {desc}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)', marginBottom: '4px' }}>
                        <strong>Date:</strong> {exp.date}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)', marginBottom: '4px' }}>
                        <strong>Payers:</strong> {Array.isArray(exp.payers) 
                          ? exp.payers.map((p: any) => `${p.name} (${formatCurrency(Number(p.amount))})`).join(', ')
                          : '-'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-muted)' }}>
                        <strong>Participants:</strong> {Array.isArray(exp.participants) ? exp.participants.join(', ') : '-'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div className="expense-amount-display">
                        {formatCurrency(totalAmount)}
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
