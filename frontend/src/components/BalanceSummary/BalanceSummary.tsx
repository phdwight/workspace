import React, { useState, useEffect } from 'react';
import type { BalanceSummaryProps, Expense } from '../../types';
import { localStorageService } from '../../services/localStorage';

interface Balance {
  participant: string;
  totalPaid: number;
  totalOwes: number;
  balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface ParticipantExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
}

export const BalanceSummary: React.FC<Omit<BalanceSummaryProps, 'user'>> = ({
  i18n,
  trip
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState<'summary' | 'details' | 'settlements'>('summary');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [participantExpenses, setParticipantExpenses] = useState<Record<string, ParticipantExpense[]>>({});

  useEffect(() => {
    loadExpensesAndCalculateBalances();
  }, [trip]);

  const loadExpensesAndCalculateBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      const tripExpenses = await localStorageService.getExpensesForTrip(
        trip.trip_name,
        'local'
      );
      
      setExpenses(tripExpenses);
      
      if (tripExpenses.length === 0) {
        setBalances([]);
        setSettlements([]);
        setCategoryBreakdown({});
        setParticipantExpenses({});
        setLoading(false);
        return;
      }

      const calculatedBalances = calculateBalances(tripExpenses);
      setBalances(calculatedBalances);
      
      const calculatedSettlements = calculateSettlements(calculatedBalances);
      setSettlements(calculatedSettlements);
      
      // Calculate category breakdown
      const breakdown = calculateCategoryBreakdown(tripExpenses);
      setCategoryBreakdown(breakdown);
      
      // Calculate participant expense details
      const participantDetails = calculateParticipantExpenses(tripExpenses);
      setParticipantExpenses(participantDetails);
      
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (expenseList: Expense[]): Balance[] => {
    const participantBalances: Record<string, Balance> = {};

    // Initialize balances for all participants
    trip.participants.forEach(participant => {
      participantBalances[participant] = {
        participant,
        totalPaid: 0,
        totalOwes: 0,
        balance: 0
      };
    });

    // Process each expense
    expenseList.forEach(expense => {
      const { payers, participants } = expense;
      const totalAmount = Array.isArray(payers) ? payers.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
      const amountPerPerson = totalAmount / participants.length;

      // Add to each payer's total paid
      if (Array.isArray(payers)) {
        payers.forEach(payerObj => {
          if (participantBalances[payerObj.name]) {
            participantBalances[payerObj.name].totalPaid += Number(payerObj.amount);
          }
        });
      }

      // Add to each participant's total owes
      participants.forEach(participant => {
        if (participantBalances[participant]) {
          participantBalances[participant].totalOwes += amountPerPerson;
        }
      });
    });

    // Calculate final balances
    Object.values(participantBalances).forEach(balance => {
      balance.balance = balance.totalPaid - balance.totalOwes;
    });

    return Object.values(participantBalances).sort((a, b) => b.balance - a.balance);
  };

  const calculateSettlements = (balanceList: Balance[]): Settlement[] => {
    const settlements: Settlement[] = [];
    
    // Create copies for manipulation
    const creditors = balanceList
      .filter(b => b.balance > 0.01)
      .map(b => ({ name: b.participant, amount: b.balance }))
      .sort((a, b) => b.amount - a.amount);
    
    const debtors = balanceList
      .filter(b => b.balance < -0.01)
      .map(b => ({ name: b.participant, amount: -b.balance }))
      .sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const settlementAmount = Math.min(creditor.amount, debtor.amount);
      
      if (settlementAmount > 0.01) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: settlementAmount
        });
      }
      
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;
      
      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return settlements;
  };

  const calculateCategoryBreakdown = (expenseList: Expense[]): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    
    expenseList.forEach(expense => {
      const category = (expense as any).category || 'other';
      const totalAmount = Array.isArray(expense.payers) 
        ? expense.payers.reduce((sum, p) => sum + Number(p.amount), 0) 
        : 0;
      
      breakdown[category] = (breakdown[category] || 0) + totalAmount;
    });
    
    return breakdown;
  };

  const calculateParticipantExpenses = (expenseList: Expense[]): Record<string, ParticipantExpense[]> => {
    const participantExpenseMap: Record<string, ParticipantExpense[]> = {};
    
    // Initialize for all participants
    trip.participants.forEach(participant => {
      participantExpenseMap[participant] = [];
    });
    
    expenseList.forEach(expense => {
      // Add expenses where participant was a payer
      if (Array.isArray(expense.payers)) {
        expense.payers.forEach(payer => {
          if (participantExpenseMap[payer.name]) {
            participantExpenseMap[payer.name].push({
              id: expense.id,
              description: expense.description || 'No description',
              amount: Number(payer.amount),
              date: expense.date,
              category: (expense as any).category || 'other'
            });
          }
        });
      }
    });
    
    return participantExpenseMap;
  };

  const handleExportSummary = (format: 'csv' | 'detailed') => {
    if (format === 'csv') {
      exportBalanceCSV();
    } else {
      exportDetailedReport();
    }
    setShowExportOptions(false);
  };

  const exportBalanceCSV = () => {
    const headers = ['Participant', 'Total Paid', 'Total Owes', 'Balance'];
    const rows = balances.map(b => [
      b.participant,
      b.totalPaid.toFixed(2),
      b.totalOwes.toFixed(2),
      b.balance.toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.trip_name.replace(/\s+/g, '_')}_balance_summary.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDetailedReport = () => {
    const totalExpenses = expenses.reduce((sum, exp) => {
      const amount = Array.isArray(exp.payers) 
        ? exp.payers.reduce((s, p) => s + Number(p.amount), 0) 
        : 0;
      return sum + amount;
    }, 0);

    let report = `BALANCE SUMMARY REPORT\n`;
    report += `Trip: ${trip.trip_name}\n`;
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    report += `Number of Expenses: ${expenses.length}\n\n`;
    
    report += `PARTICIPANT BALANCES:\n`;
    balances.forEach(b => {
      report += `${b.participant}: $${b.balance.toFixed(2)} (Paid: $${b.totalPaid.toFixed(2)}, Owes: $${b.totalOwes.toFixed(2)})\n`;
    });
    
    if (settlements.length > 0) {
      report += `\nSUGGESTED SETTLEMENTS:\n`;
      settlements.forEach(s => {
        report += `${s.from} → ${s.to}: $${s.amount.toFixed(2)}\n`;
      });
    }
    
    report += `\nCATEGORY BREAKDOWN:\n`;
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      const categoryLabel = getCategoryLabel(category);
      report += `${categoryLabel}: $${amount.toFixed(2)}\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.trip_name.replace(/\s+/g, '_')}_detailed_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (category: string | undefined): string => {
    const categoryLabels: Record<string, string> = {
      food: 'Food & Dining',
      transportation: 'Transportation',
      accommodation: 'Accommodation',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      utilities: 'Utilities',
      other: 'Other'
    };
    return categoryLabels[category || 'other'] || category || 'Other';
  };

  if (loading) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 600, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <div>{i18n.common.loading}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 600, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div className="error-message" role="alert" style={{ marginBottom: 16, padding: '12px', backgroundColor: '#ffebee', borderRadius: '8px', color: '#d32f2f' }}>{error}</div>
        <button 
          onClick={loadExpensesAndCalculateBalances}
          className="add-btn"
          style={{ marginTop: '16px' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 600, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>{i18n.balanceSummary.noExpenses}</div>
          <div style={{ fontSize: '14px', marginBottom: '24px' }}>Add some expenses to see the balance summary</div>
          <button
            className="submit-btn"
            onClick={() => {
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('navigateToExpenses'));
              }
            }}
          >
            Add Expenses
          </button>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => {
    const amount = Array.isArray(exp.payers) 
      ? exp.payers.reduce((s, p) => s + Number(p.amount), 0) 
      : 0;
    return sum + amount;
  }, 0);

  return (
    <div className="balance-summary-container unified-card" style={{ background: 'white', borderRadius: 12, maxWidth: 600, margin: '32px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
      {/* Header with title and controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{i18n.balanceSummary.title}</h2>
        <div style={{ position: 'relative' }}>
          <button
            className="export-btn"
            onClick={() => setShowExportOptions(!showExportOptions)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            📊 Export
          </button>
          {showExportOptions && (
            <div className="export-options-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '150px',
              zIndex: 10
            }}>
              <button
                className="export-option"
                onClick={() => handleExportSummary('csv')}
                style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', borderRadius: '4px', fontSize: '14px' }}
              >
                📄 CSV Summary
              </button>
              <button
                className="export-option"
                onClick={() => handleExportSummary('detailed')}
                style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', borderRadius: '4px', fontSize: '14px' }}
              >
                📋 Detailed Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip Overview Stats */}
      <div className="summary-stats" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '16px', 
        marginBottom: 24,
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#BB3E00' }}>${totalExpenses.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Spent</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#BB3E00' }}>{expenses.length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Expenses</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#BB3E00' }}>{Object.keys(categoryBreakdown).length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Categories</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#BB3E00' }}>{settlements.length}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Settlements</div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="view-mode-tabs" style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid #e0e0e0' }}>
        {[
          { key: 'summary', label: 'Balance Summary', icon: '💰' },
          { key: 'details', label: 'Participant Details', icon: '👥' },
          { key: 'settlements', label: 'Settlements', icon: '💳' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key as any)}
            className={`view-mode-tab ${viewMode === tab.key ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'transparent',
              borderBottom: viewMode === tab.key ? '2px solid #BB3E00' : '2px solid transparent',
              color: viewMode === tab.key ? '#BB3E00' : '#666',
              fontWeight: viewMode === tab.key ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ marginRight: '4px' }}>{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Content based on view mode */}
      {viewMode === 'summary' && (
        <div className="balance-summary-view">
          {/* Balance Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 24 }}>
            {balances.map((bal, idx) => (
              <div 
                key={bal.participant} 
                className="balance-card"
                style={{
                  padding: '16px',
                  background: idx % 2 ? '#fff' : '#f9f5f0',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setSelectedParticipant(selectedParticipant === bal.participant ? null : bal.participant);
                  setViewMode('details');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#2d1a0b', marginBottom: '4px' }}>
                    {bal.participant}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Paid: ${bal.totalPaid.toFixed(2)} • Owes: ${bal.totalOwes.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: bal.balance < 0 ? '#d32f2f' : bal.balance > 0 ? '#388e3c' : '#666',
                    marginBottom: '4px'
                  }}>
                    {bal.balance >= 0 ? '+' : ''}${bal.balance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    {bal.balance < 0 ? 'Owes' : bal.balance > 0 ? 'Gets back' : 'Even'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category Breakdown */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <div className="category-breakdown" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#BB3E00' }}>
                📊 Spending by Category
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {Object.entries(categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = ((amount / totalExpenses) * 100);
                    return (
                      <div key={category} className="category-card" style={{
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                          {getCategoryLabel(category)}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#BB3E00', marginBottom: '4px' }}>
                          ${amount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'details' && (
        <div className="participant-details-view">
          {/* Participant Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              👤 Select Participant:
            </label>
            <select
              value={selectedParticipant || ''}
              onChange={(e) => setSelectedParticipant(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">View all participants</option>
              {balances.map(bal => (
                <option key={bal.participant} value={bal.participant}>
                  {bal.participant} (Balance: ${bal.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Participant Details */}
          {selectedParticipant ? (
            <div className="participant-detail">
              {(() => {
                const participant = balances.find(b => b.participant === selectedParticipant);
                const expenses = participantExpenses[selectedParticipant] || [];
                
                if (!participant) return null;
                
                return (
                  <>
                    <div className="participant-summary" style={{
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{selectedParticipant}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '14px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#388e3c' }}>Total Paid</div>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>${participant.totalPaid.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#d32f2f' }}>Total Owes</div>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>${participant.totalOwes.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: participant.balance >= 0 ? '#388e3c' : '#d32f2f' }}>Balance</div>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>
                            {participant.balance >= 0 ? '+' : ''}${participant.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {expenses.length > 0 && (
                      <div className="participant-expenses">
                        <h4 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#BB3E00' }}>
                          💳 Expenses Paid ({expenses.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {expenses
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(exp => (
                              <div key={exp.id} className="expense-detail-card" style={{
                                padding: '12px',
                                background: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                                    {exp.description}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    {getCategoryLabel(exp.category)} • {new Date(exp.date).toLocaleDateString()}
                                  </div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#BB3E00' }}>
                                  ${exp.amount.toFixed(2)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="all-participants-overview">
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#BB3E00' }}>
                👥 All Participants Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {balances.map(bal => (
                  <div key={bal.participant} 
                    className="participant-overview-card"
                    style={{
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedParticipant(bal.participant)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
                      {bal.participant}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      {(participantExpenses[bal.participant] || []).length} expenses paid
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: bal.balance < 0 ? '#d32f2f' : bal.balance > 0 ? '#388e3c' : '#666'
                    }}>
                      Balance: {bal.balance >= 0 ? '+' : ''}${bal.balance.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'settlements' && (
        <div className="settlements-view">
          {settlements.length > 0 ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#BB3E00' }}>
                  💳 Suggested Settlements ({settlements.length})
                </h3>
                <div className="settlements-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {settlements.map((s, idx) => (
                    <div key={idx} className="settlement-card" style={{
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{
                          background: '#ffebee',
                          color: '#d32f2f',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {s.from}
                        </div>
                        <div style={{ fontSize: '16px' }}>→</div>
                        <div style={{
                          background: '#e8f5e8',
                          color: '#388e3c',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {s.to}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#BB3E00',
                        padding: '8px 16px',
                        background: '#f7ead9',
                        borderRadius: '6px'
                      }}>
                        ${s.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Instructions */}
              <div className="settlement-instructions" style={{
                padding: '16px',
                background: '#e3f2fd',
                borderRadius: '8px',
                marginBottom: 20
              }}>
                <h4 style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#1976d2' }}>
                  💡 How to settle up:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1565c0' }}>
                  <li>Complete settlements in the order shown above</li>
                  <li>Each person who owes money pays the specified amount</li>
                  <li>Use your preferred payment method (cash, bank transfer, etc.)</li>
                  <li>Mark settlements as complete when payments are made</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="no-settlements" style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>All Settled Up!</div>
              <div style={{ fontSize: '14px' }}>Everyone has paid their fair share.</div>
            </div>
          )}
        </div>
      )}
      {/* Navigation buttons */}
      <div style={{ 
        marginTop: 32, 
        paddingTop: 24,
        borderTop: '1px solid #e0e0e0',
        display: 'flex', 
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          className="submit-btn"
          style={{ flex: 1, minWidth: 140, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToExpenses'));
            }
          }}
        >
          {i18n.balanceSummary.backToExpenses || 'Back to Expenses'}
        </button>
        <button
          type="button"
          className="add-btn"
          style={{ flex: 1, minWidth: 140, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToTrips'));
            }
          }}
        >
          Back to Events
        </button>
      </div>
    </div>
  );
};
