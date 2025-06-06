import React, { useState, useRef, useEffect } from 'react';
import { useTrips } from '../../hooks/useTrips';

interface TripCreationProps {
  i18n: any;
  onTripCreated?: (trip: any) => void;
  setPage?: (page: string) => void;
  setSelectedTrip?: (trip: any) => void;
}

export const TripCreation: React.FC<TripCreationProps> = ({ i18n, onTripCreated, setPage, setSelectedTrip }) => {
  const [tripName, setTripName] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tripNameRef = useRef<HTMLInputElement>(null);
  const { trips, createTrip, deleteTrip } = useTrips('local');

  useEffect(() => {
    if (tripNameRef.current) {
      tripNameRef.current.focus();
    }
    
    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
        e.preventDefault();
        if (tripName.trim()) {
          handleSubmit(e as any);
        }
      }
      
      // Ctrl+Plus or Cmd+Plus to add participant
      if ((e.ctrlKey || e.metaKey) && e.key === '+' && !loading) {
        e.preventDefault();
        if (participants.length < 10) {
          addParticipant();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tripName, loading, participants.length]);

  const validateParticipants = (participantList: string[]): string | null => {
    const normalized = participantList.map((p: string) => p.trim().toLowerCase());
    const hasDuplicate = normalized.some((p: string, i: number) => p && normalized.indexOf(p) !== i);
    if (hasDuplicate) {
      return i18n.tripCreation?.errorDuplicateParticipants || 'Duplicate participant names are not allowed.';
    }
    const validParticipants = participantList.filter((p: string) => p.trim());
    if (validParticipants.length < 2) {
      return i18n.tripCreation.errorMinParticipants;
    }
    if (validParticipants.length > 10) {
      return i18n.tripCreation?.errorMaxParticipants || 'You can only have up to 10 participants.';
    }
    return null;
  };

  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    const validationError = validateParticipants(updated);
    setError(validationError);
    setParticipants(updated);
  };

  const addParticipant = () => {
    if (participants.some((p: string) => !p.trim())) return;
    if (participants.length >= 10) return;
    const validationError = validateParticipants(participants);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setParticipants(prev => {
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.participant-row input[type="text"]');
        const lastInput = inputs[inputs.length - 1];
        lastInput?.focus();
      }, 0);
      return [...prev, ""];
    });
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, i) => i !== index));
    
    // Focus management after removal
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.participant-row input[type="text"]');
      if (inputs.length > 0) {
        const focusIndex = Math.min(index, inputs.length - 1);
        (inputs[focusIndex] as HTMLInputElement)?.focus();
      }
    }, 0);
  };

  // Rename handlers for harmony with UI
  const handleAddParticipant = addParticipant;
  const handleRemoveParticipant = removeParticipant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate trip name
    if (!tripName.trim()) {
      setError(i18n.tripCreation?.errorMissingName || 'Please enter an event name.');
      return;
    }
    
    const validationError = validateParticipants(participants);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const cleanParticipants = participants.map((p: string) => p.trim()).filter(Boolean);
      const newTrip = await createTrip(tripName.trim(), cleanParticipants);
      if (onTripCreated) {
        onTripCreated(newTrip);
      }
      setTripName("");
      setParticipants(["", ""]);
      setError(null);
      setTimeout(() => {
        tripNameRef.current?.focus();
      }, 0);
    } catch (err: any) {
      setError(err.message || i18n.tripCreation?.errorCreate || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripToDelete: any) => {
    const confirmed = await showConfirmDialog(
      i18n.tripsList?.confirmDelete?.(tripToDelete) || `Delete trip ${tripToDelete}?`
    );
    if (confirmed) {
      await deleteTrip(tripToDelete);
      setTimeout(() => {
        tripNameRef.current?.focus();
      }, 0);
    }
  };

  const showConfirmDialog = (message: string) => {
    return new Promise((resolve) => {
      const confirmDialog = document.createElement('div');
      confirmDialog.style.position = 'fixed';
      confirmDialog.style.top = '0';
      confirmDialog.style.left = '0';
      confirmDialog.style.width = '100vw';
      confirmDialog.style.height = '100vh';
      confirmDialog.style.background = 'rgba(0,0,0,0.4)';
      confirmDialog.style.display = 'flex';
      confirmDialog.style.alignItems = 'center';
      confirmDialog.style.justifyContent = 'center';
      confirmDialog.style.zIndex = '9999';
      confirmDialog.style.backdropFilter = 'blur(2px)';
      
      // Get theme colors from CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#213555';
      const dangerColor = computedStyle.getPropertyValue('--danger').trim() || '#d32f2f';
      const cardBg = computedStyle.getPropertyValue('--theme-card').trim() || '#fff';
      
      confirmDialog.innerHTML = `
        <div style="background: ${cardBg}; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); padding: 32px 24px; max-width: 90vw; min-width: 320px; text-align: center; animation: slideInScale 0.2s ease-out;">
          <div style="font-size: 1.2rem; color: ${dangerColor}; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span role='img' aria-label='Warning' style='font-size: 1.8em;'>⚠️</span>
            <span style="line-height: 1.3;">${message}</span>
          </div>
          <div style="display: flex; gap: 16px; justify-content: center; margin-top: 16px;">
            <button id="confirm-yes" style="background: linear-gradient(90deg, ${dangerColor} 0%, var(--danger) 100%); color: var(--theme-card); border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; padding: 12px 20px; cursor: pointer; box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3); transition: all 0.2s ease;">${i18n.tripsList?.delete || 'Delete'}</button>
            <button id="confirm-no" style="background: ${primaryColor}; color: var(--theme-card); border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; padding: 12px 20px; cursor: pointer; box-shadow: 0 2px 8px rgba(33, 53, 85, 0.3); transition: all 0.2s ease;">${i18n.common?.cancel || 'Cancel'}</button>
          </div>
        </div>
      `;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(confirmDialog);
      
      const cleanup = () => {
        document.body.removeChild(confirmDialog);
        document.head.removeChild(style);
      };
      
      const noBtn = confirmDialog.querySelector('#confirm-no');
      const yesBtn = confirmDialog.querySelector('#confirm-yes');
      
      // Add hover effects
      noBtn?.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        (e.target as HTMLElement).style.boxShadow = `0 4px 12px rgba(33, 53, 85, 0.4)`;
      });
      noBtn?.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.transform = 'none';
        (e.target as HTMLElement).style.boxShadow = `0 2px 8px rgba(33, 53, 85, 0.3)`;
      });
      
      yesBtn?.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
        (e.target as HTMLElement).style.boxShadow = `0 4px 12px rgba(211, 47, 47, 0.4)`;
      });
      yesBtn?.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.transform = 'none';
        (e.target as HTMLElement).style.boxShadow = `0 2px 8px rgba(211, 47, 47, 0.3)`;
      });
      
      noBtn?.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      yesBtn?.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
      
      // Close on escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    });
  };

  return (
    <div className="trip-creation-container">
      <h2>{i18n.tripCreation.title}</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        {error && (
          <div className="error-message" role="alert" id="error-message" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}
        {/* Event Name - inline label and input */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <label htmlFor="tripName" style={{ minWidth: 110, marginRight: 8, fontSize: '0.95rem' }}>
            {i18n.tripCreation.tripNameLabel}
          </label>
          <input
            ref={tripNameRef}
            id="tripName"
            type="text"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
            placeholder={i18n.tripCreation.tripNamePlaceholder}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
            maxLength={50}
            required
            aria-describedby={error ? "error-message" : undefined}
          />
        </div>
        {/* Participants - inline label, vertical checkboxes */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
          <label htmlFor="participants" style={{ minWidth: 110, marginRight: 8, marginTop: 2, fontSize: '0.95rem' }}>
            {i18n.tripCreation.participantsLabel}
          </label>
          <div style={{ flex: 1 }}>
            {participants.map((participant, idx) => (
              <div key={idx} className="participant-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 6 }}>
                <input
                  type="text"
                  value={participant}
                  onChange={e => handleParticipantChange(idx, e.target.value)}
                  placeholder={i18n.tripCreation.participantPlaceholder(idx)}
                  disabled={loading}
                  className="input"
                  style={{ flex: 1, marginBottom: 0 }}
                  maxLength={30}
                  aria-label={`${i18n.tripCreation.participantsLabel} ${idx + 1}`}
                />
                <button
                  type="button"
                  aria-label={`${i18n.tripCreation.removeParticipantAria} ${idx + 1}`}
                  onClick={() => handleRemoveParticipant(idx)}
                  disabled={loading || participants.length <= 2}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: participants.length <= 2 ? 'var(--theme-muted)' : 'var(--danger, #d32f2f)', 
                    fontWeight: 700, 
                    fontSize: 20, 
                    cursor: participants.length <= 2 ? 'not-allowed' : 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    minWidth: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={participants.length <= 2 ? i18n.tripCreation?.minParticipantsTooltip || 'Minimum 2 participants required' : undefined}
                >
                  &minus;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddParticipant}
              disabled={loading || participants.length >= 10}
              aria-label={i18n.tripCreation.addParticipant}
              style={{
                background: participants.length >= 10 ? 'var(--theme-muted)' : 'linear-gradient(90deg, var(--theme-primary, #213555) 60%, var(--theme-secondary, #3E5879) 100%)',
                color: 'var(--theme-card)',
                border: 'none',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: participants.length >= 10 ? 'none' : '0 2px 8px rgba(33, 53, 85, 0.3)',
                marginTop: 8,
                cursor: participants.length >= 10 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                padding: 0
              }}
              title={participants.length >= 10 ? i18n.tripCreation?.maxParticipantsTooltip || 'Maximum 10 participants allowed' : undefined}
            >
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>+</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexDirection: 'column' }}>
          <button
            type="submit"
            disabled={loading || !tripName.trim()}
            className="submit-btn"
            style={{ 
              flex: 1,
              opacity: loading || !tripName.trim() ? 0.6 : 1,
              cursor: loading || !tripName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" style={{ width: 16, height: 16 }}></span>
                {i18n.tripCreation.creating}
              </span>
            ) : (
              i18n.tripCreation.submit
            )}
          </button>
          
          {/* Keyboard shortcuts tip */}
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--theme-font, #213555)', 
            opacity: 0.7, 
            textAlign: 'center',
            marginTop: '8px'
          }}>
            💡 {i18n.tripCreation?.keyboardTip || 'Tip: Use Ctrl+Enter to submit, Ctrl+Plus to add participant'}
          </div>
        </div>
      </form>

      {/* Trips List */}
      {trips.length > 0 && (
        <div style={{ 
          marginTop: 32, 
          maxWidth: 520, 
          width: '100%', 
          boxSizing: 'border-box', 
          marginLeft: 'auto', 
          marginRight: 'auto' 
        }}>
          <h3 style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            fontSize: 18, 
            color: 'var(--theme-primary, #213555)',
            marginBottom: 16
          }}>
            <span role="img" aria-label="Events">🧳</span>
            {i18n.tripsList?.title || 'Your Events'}
          </h3>
          
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <table style={{ 
              width: '100%', 
              minWidth: 0, 
              borderCollapse: 'separate', 
              borderSpacing: 0, 
              background: 'var(--theme-card, #fff)', 
              borderRadius: 10, 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
              overflow: 'hidden', 
              fontSize: 13 
            }}>
              <thead>
                <tr style={{ 
                  background: 'var(--theme-accent, #D8C4B6)', 
                  color: 'var(--theme-primary, #213555)', 
                  fontWeight: 700, 
                  fontSize: 13 
                }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', borderTopLeftRadius: 10 }}>
                    {i18n.tripsList?.eventColumn || 'Event'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>
                    {i18n.tripsList?.participantsColumn || 'Participants'}
                  </th>
                  <th style={{ width: 40, padding: '12px 4px', textAlign: 'center' }}>
                    {i18n.tripsList?.actionsColumn || 'Actions'}
                  </th>
                  <th style={{ width: 100, borderTopRightRadius: 10, padding: '12px 8px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, idx) => (
                  <tr
                    key={trip.trip_name}
                    style={{
                      borderBottom: idx === trips.length - 1 ? 'none' : '1px solid var(--theme-muted)',
                      background: idx % 2 === 0 ? 'var(--theme-card, #fff)' : 'var(--theme-accent-light)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--theme-accent-lighter)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? 'var(--theme-card, #fff)' : 'var(--theme-accent-light)';
                    }}
                  >
                    <td style={{ 
                      padding: '12px 8px', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      color: 'var(--theme-font, #213555)', 
                      verticalAlign: 'middle' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <span style={{ marginRight: 8, fontSize: 16, display: 'flex', alignItems: 'center' }}>
                          🧳
                        </span>
                        <span style={{ display: 'block', lineHeight: 1.3, wordBreak: 'break-word' }}>
                          {trip.trip_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '12px 8px', 
                      color: 'var(--theme-font, #213555)', 
                      fontSize: 13, 
                      verticalAlign: 'middle', 
                      maxWidth: 140, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                      title={trip.participants.join(', ')}
                    >
                      {trip.participants.length > 2 
                        ? `${trip.participants.slice(0, 2).join(', ')} +${trip.participants.length - 2}`
                        : trip.participants.join(', ')
                      }
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        aria-label={i18n.tripsList?.deleteAria?.(trip.trip_name) || `Delete trip ${trip.trip_name}`}
                        style={{
                          background: 'none',
                          border: '1px solid var(--danger, #d32f2f)',
                          cursor: 'pointer',
                          color: 'var(--danger, #d32f2f)',
                          fontSize: 16,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 32,
                          width: 32,
                          borderRadius: 6,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--danger, #d32f2f)';
                          e.currentTarget.style.color = 'var(--theme-card)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--danger, #d32f2f)';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.trip_name);
                        }}
                      >
                        ×
                      </button>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        style={{
                          background: 'linear-gradient(90deg, var(--theme-primary, #213555) 60%, var(--theme-secondary, #3E5879) 100%)',
                          color: 'var(--theme-card)',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 53, 85, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => {
                          setSelectedTrip?.(trip);
                          setPage?.('expenses');
                        }}
                      >
                        {i18n.tripsList?.openButton || 'Open'}
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
};
