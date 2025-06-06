import React, { useState, useEffect } from 'react';
import type { BalanceSummaryProps } from '../../types';
import { localStorageService } from '../../services/localStorage';

interface ParticipantSummary {
  participant: string;
  totalPaid: number;
  totalOwes: number;
  balance: number;
  owesToOthers: { name: string; amount: number }[];
}

export const BalanceSummary: React.FC<Omit<BalanceSummaryProps, 'user'>> = ({
  i18n,
  event
}) => {
  const [participantSummaries, setParticipantSummaries] = useState<ParticipantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple currency formatter
  const formatCurrency = (amount: number): string => {
    return `¤${amount.toFixed(2)}`;
  };

  useEffect(() => {
    calculateParticipantSummaries();
  }, [event]);

  const calculateParticipantSummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventExpenses = await localStorageService.getExpensesForEvent(
        event.event_name,
        'local'
      );

      if (eventExpenses.length === 0) {
        setParticipantSummaries([]);
        setLoading(false);
        return;
      }

      // Calculate each participant's totals
      const participantTotals: Record<string, { paid: number; owes: number }> = {};

      // Initialize all participants
      event.participants.forEach(participant => {
        participantTotals[participant] = { paid: 0, owes: 0 };
      });

      // Process each expense
      eventExpenses.forEach(expense => {
        const { payers, participants } = expense;
        const totalAmount = Array.isArray(payers) ? payers.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
        const amountPerPerson = totalAmount / participants.length;

        // Add to each payer's total paid
        if (Array.isArray(payers)) {
          payers.forEach(payerObj => {
            if (participantTotals[payerObj.name]) {
              participantTotals[payerObj.name].paid += Number(payerObj.amount);
            }
          });
        }

        // Add to each participant's total owes
        participants.forEach(participant => {
          if (participantTotals[participant]) {
            participantTotals[participant].owes += amountPerPerson;
          }
        });
      });

      // Calculate balances and settlements
      const balances = Object.entries(participantTotals).map(([name, totals]) => ({
        participant: name,
        totalPaid: totals.paid,
        totalOwes: totals.owes,
        balance: totals.paid - totals.owes
      }));

      // Calculate who owes what to whom using a simple debt settlement algorithm
      const summaries: ParticipantSummary[] = balances.map(balance => {
        const owesToOthers: { name: string; amount: number }[] = [];

        if (balance.balance < 0) {
          // This person owes money, distribute debt proportionally to creditors
          const amountOwed = Math.abs(balance.balance);
          const creditors = balances.filter(b => b.balance > 0);
          const totalCredit = creditors.reduce((sum, c) => sum + c.balance, 0);

          if (totalCredit > 0) {
            creditors.forEach(creditor => {
              const proportion = creditor.balance / totalCredit;
              const paymentAmount = amountOwed * proportion;
              
              if (paymentAmount > 0.01) { // Only show amounts > 1 cent
                owesToOthers.push({
                  name: creditor.participant,
                  amount: paymentAmount
                });
              }
            });
          }
        }

        return {
          participant: balance.participant,
          totalPaid: balance.totalPaid,
          totalOwes: balance.totalOwes,
          balance: balance.balance,
          owesToOthers
        };
      });

      setParticipantSummaries(summaries);
      setLoading(false);
    } catch (err) {
      console.error('Error calculating participant summaries:', err);
      setError('Failed to calculate balances');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: 'var(--theme-font)'
      }}>
{i18n.common.loading}...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--theme-error)',
        backgroundColor: 'var(--theme-surface)',
        borderRadius: '8px',
        border: '1px solid var(--theme-border)'
      }}>
        {error}
      </div>
    );
  }

  if (participantSummaries.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--theme-font-secondary)',
        backgroundColor: 'var(--theme-surface)',
        borderRadius: '8px',
        border: '1px solid var(--theme-border)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>No expenses yet</div>
        <div>Add some expenses to see the balance summary</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--theme-surface)',
      borderRadius: '8px',
      border: '1px solid var(--theme-border)'
    }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--theme-font)',
        textAlign: 'center'
      }}>
        💰 Balance Summary
      </h2>

      <div style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {participantSummaries.map((summary) => (
          <div
            key={summary.participant}
            style={{
              padding: '20px',
              backgroundColor: 'var(--theme-background)',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Participant Name */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--theme-font)',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {summary.participant}
            </div>

            {/* Contribution Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--theme-surface)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--theme-font-secondary)', marginBottom: '4px' }}>
                  Paid
                </div>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--theme-success)'
                }}>
                  {formatCurrency(summary.totalPaid)}
                </div>
              </div>
              
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--theme-surface)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--theme-font-secondary)', marginBottom: '4px' }}>
                  Share
                </div>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--theme-font)'
                }}>
                  {formatCurrency(summary.totalOwes)}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div style={{
              padding: '12px',
              backgroundColor: summary.balance >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              textAlign: 'center',
              marginBottom: summary.owesToOthers.length > 0 ? '16px' : '0'
            }}>
              <div style={{ 
                color: 'var(--theme-font-secondary)', 
                fontSize: '14px',
                marginBottom: '4px' 
              }}>
                Balance
              </div>
              <div style={{ 
                fontSize: '18px',
                fontWeight: '700',
                color: summary.balance >= 0 ? 'var(--theme-success)' : 'var(--theme-error)'
              }}>
                {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: 'var(--theme-font-secondary)',
                marginTop: '4px'
              }}>
                {summary.balance >= 0 ? 'Gets back' : 'Owes'}
              </div>
            </div>

            {/* Payment Obligations */}
            {summary.owesToOthers.length > 0 && (
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--theme-font)',
                  marginBottom: '8px'
                }}>
                  💳 Payments due:
                </div>
                {summary.owesToOthers.map((debt, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'var(--theme-surface)',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ color: 'var(--theme-font)' }}>
                      Pay {debt.name}
                    </span>
                    <span style={{ 
                      fontWeight: '600',
                      color: 'var(--theme-error)'
                    }}>
                      {formatCurrency(debt.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
