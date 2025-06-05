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

export const BalanceSummary: React.FC<Omit<BalanceSummaryProps, 'user'>> = ({
  i18n,
  trip
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setLoading(false);
        return;
      }

      const calculatedBalances = calculateBalances(tripExpenses);
      setBalances(calculatedBalances);
      
      const calculatedSettlements = calculateSettlements(calculatedBalances);
      setSettlements(calculatedSettlements);
      
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

  if (loading) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 480, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>{i18n.common.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 480, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div className="error-message" role="alert" style={{ marginBottom: 16 }}>{error}</div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="trip-creation-container unified-card" style={{ maxWidth: 480, margin: '32px auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
        <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{i18n.balanceSummary.noExpenses}</div>
      </div>
    );
  }

  return (
    <div className="balance-summary-container unified-card" style={{ background: 'white', borderRadius: 12, maxWidth: 480, margin: '32px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>{i18n.balanceSummary.title}</h2>
      {/* Error message if any */}
      {error && (
        <div className="error-message" role="alert" style={{ marginBottom: 16 }}>{error}</div>
      )}
      {/* Main summary table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, marginBottom: 20, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #0001' }}>
        <thead>
          <tr style={{ background: '#f7ead9', color: '#BB3E00', fontWeight: 700, fontSize: 14 }}>
            <th style={{ padding: 8, textAlign: 'left', borderTopLeftRadius: 8 }}>{i18n.balanceSummary.participant}</th>
            <th style={{ padding: 8, textAlign: 'left' }}>{i18n.balanceSummary.balance}</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Contribution</th>
            <th style={{ padding: 8, textAlign: 'left', borderTopRightRadius: 8 }}>Share</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((bal, idx) => (
            <tr key={bal.participant} style={{ background: idx % 2 ? '#fff' : '#f9f5f0' }}>
              <td style={{ padding: 8, fontWeight: 600, color: '#2d1a0b' }}>{bal.participant}</td>
              <td style={{ padding: 8, color: bal.balance < 0 ? '#d32f2f' : '#388e3c', fontWeight: 600 }}>{bal.balance.toFixed(2)}</td>
              <td style={{ padding: 8 }}>{bal.totalPaid.toFixed(2)}</td>
              <td style={{ padding: 8 }}>{bal.totalOwes.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Settlements section */}
      {settlements.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, margin: '16px 0 8px 0', color: '#BB3E00' }}>Suggested Settlements</h3>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {settlements.map((s, idx) => (
              <li key={idx} style={{ marginBottom: 4, fontSize: 15 }}>
                <span style={{ fontWeight: 500 }}>{s.from}</span> needs to pay <span style={{ fontWeight: 500 }}>{s.to}</span> the amount of <span style={{ color: '#BB3E00', fontWeight: 700 }}>{s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Back button */}
      <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          type="button"
          className="add-btn"
          style={{ minWidth: 120, fontWeight: 600 }}
          onClick={() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('navigateToExpenses'));
            }
          }}
        >
          {i18n.balanceSummary.backToExpenses}
        </button>
      </div>
    </div>
  );
};
