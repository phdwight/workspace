import React, { useState, useRef, useEffect } from 'react';
import { useEvents } from '../../hooks/useEvents';

interface EventCreationProps {
  i18n: any;
  onEventCreated?: (event: any) => void;
  setPage?: (page: string) => void;
  setSelectedEvent?: (event: any) => void;
}

export const EventCreation: React.FC<EventCreationProps> = ({ i18n, onEventCreated, setPage, setSelectedEvent }) => {
  const [eventName, setEventName] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventNameRef = useRef<HTMLInputElement>(null);
  const { events, createEvent, deleteEvent } = useEvents('local');

  useEffect(() => {
    if (eventNameRef.current) {
      eventNameRef.current.focus();
    }
    // Mobile-first design - no keyboard shortcuts needed
  }, []);

  const validateParticipants = (participantList: string[]): string | null => {
    const normalized = participantList.map((p: string) => p.trim().toLowerCase());
    const hasDuplicate = normalized.some((p: string, i: number) => p && normalized.indexOf(p) !== i);
    if (hasDuplicate) {
      return i18n.eventCreation?.errorDuplicateParticipants || 'Duplicate participant names are not allowed.';
    }
    const validParticipants = participantList.filter((p: string) => p.trim());
    if (validParticipants.length < 2) {
      return i18n.eventCreation.errorMinParticipants;
    }
    if (validParticipants.length > 10) {
      return i18n.eventCreation?.errorMaxParticipants || 'You can only have up to 10 participants.';
    }
    return null;
  };

  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    // Clear any existing error when user starts typing
    if (error) {
      setError(null);
    }
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
    
    // Validate event name
    if (!eventName.trim()) {
      setError(i18n.eventCreation?.errorMissingName || 'Please enter an event name.');
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
      const newEvent = await createEvent(eventName.trim(), cleanParticipants);
      if (onEventCreated) {
        onEventCreated(newEvent);
      }
      setEventName("");
      setParticipants(["", ""]);
      setError(null);
      setTimeout(() => {
        eventNameRef.current?.focus();
      }, 0);
    } catch (err: any) {
      setError(err.message || i18n.eventCreation?.errorCreate || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventToDelete: any) => {
    const confirmed = await showConfirmDialog(
      i18n.eventsList?.confirmDelete?.(eventToDelete) || `Delete event ${eventToDelete}?`
    );
    if (confirmed) {
      await deleteEvent(eventToDelete);
      setTimeout(() => {
        eventNameRef.current?.focus();
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
            <button id="confirm-yes" style="background: linear-gradient(90deg, ${dangerColor} 0%, var(--danger) 100%); color: var(--theme-card); border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; padding: 12px 20px; cursor: pointer; box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3); transition: all 0.2s ease;">${i18n.eventsList?.delete || 'Delete'}</button>
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
      
      // Mobile-first design - no keyboard handlers needed
    });
  };

  return (
    <div className="event-creation-container">
      <h2>{i18n.eventCreation.title}</h2>
      <form onSubmit={handleSubmit} className="event-form">
        {error && (
          <div className="error-message" role="alert" id="error-message" style={{ 
            marginBottom: 16, 
            padding: '12px', 
            backgroundColor: 'var(--error-bg, #ffebee)', 
            borderRadius: '8px', 
            border: '1px solid var(--danger)', 
            color: 'var(--danger, #d32f2f)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
        {/* Event Name - inline label and input */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <label htmlFor="eventName" style={{ minWidth: 110, marginRight: 8, fontSize: '0.95rem' }}>
            {i18n.eventCreation.eventNameLabel}
          </label>
          <input
            ref={eventNameRef}
            id="eventName"
            type="text"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder={i18n.eventCreation.eventNamePlaceholder}
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
            {i18n.eventCreation.participantsLabel}
          </label>
          <div style={{ flex: 1 }}>
            {participants.map((participant, idx) => (
              <div key={idx} className="participant-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 6 }}>
                <input
                  type="text"
                  value={participant}
                  onChange={e => handleParticipantChange(idx, e.target.value)}
                  placeholder={i18n.eventCreation.participantPlaceholder(idx)}
                  disabled={loading}
                  className="input"
                  style={{ flex: 1, marginBottom: 0 }}
                  maxLength={30}
                  aria-label={`${i18n.eventCreation.participantsLabel} ${idx + 1}`}
                />
                <button
                  type="button"
                  aria-label={`${i18n.eventCreation.removeParticipantAria} ${idx + 1}`}
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
                  title={participants.length <= 2 ? i18n.eventCreation?.minParticipantsTooltip || 'Minimum 2 participants required' : undefined}
                >
                  &minus;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddParticipant}
              disabled={loading || participants.length >= 10}
              aria-label={i18n.eventCreation.addParticipant}
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
              title={participants.length >= 10 ? i18n.eventCreation?.maxParticipantsTooltip || 'Maximum 10 participants allowed' : undefined}
            >
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>+</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexDirection: 'column' }}>
          <button
            type="submit"
            disabled={loading || !eventName.trim()}
            className="submit-btn"
            style={{ 
              flex: 1,
              opacity: loading || !eventName.trim() ? 0.6 : 1,
              cursor: loading || !eventName.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" style={{ width: 16, height: 16 }}></span>
                {i18n.eventCreation.creating}
              </span>
            ) : (
              i18n.eventCreation.submit
            )}
          </button>
          
        </div>
      </form>

      {/* Events List */}
      {events.length > 0 && (
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
            {i18n.eventsList?.title || 'Your Events'}
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
                  <th style={{ padding: '12px 8px', textAlign: 'left', borderTopLeftRadius: 10, width: '50%' }}>
                    {i18n.eventsList?.eventColumn || 'Event'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', width: '35%' }}>
                    {i18n.eventsList?.participantsColumn || 'Participants'}
                  </th>
                  <th style={{ width: '15%', borderTopRightRadius: 10, padding: '12px 4px', textAlign: 'center' }}>
                    {i18n.eventsList?.actionsColumn || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr
                    key={event.event_name}
                    style={{
                      borderBottom: idx === events.length - 1 ? 'none' : '1px solid var(--theme-muted)',
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
                      fontSize: 15, 
                      color: 'var(--theme-font, #213555)', 
                      verticalAlign: 'middle',
                      width: '50%'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <span style={{ marginRight: 8, fontSize: 16, display: 'flex', alignItems: 'center' }}>
                          🧳
                        </span>
                        <span style={{ display: 'block', lineHeight: 1.3, wordBreak: 'break-word', fontWeight: 700 }}>
             {event.event_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '12px 8px', 
                      color: 'var(--theme-font, #213555)', 
                      fontSize: 13, 
                      verticalAlign: 'middle', 
                      width: '35%',
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                      title={event.participants.join(', ')}
                    >
                      {event.participants.length > 2 
                        ? `${event.participants.slice(0, 2).join(', ')} +${event.participants.length - 2}`
                        : event.participants.join(', ')
                      }
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '15%' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          type="button"
                          style={{
                            background: 'linear-gradient(90deg, var(--theme-primary, #213555) 60%, var(--theme-secondary, #3E5879) 100%)',
                            color: 'var(--theme-card)',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '50px'
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
                            setSelectedEvent?.(event);
                            setPage?.('expenses');
                          }}
                        >
                          {i18n.eventsList?.openButton || 'Open'}
                        </button>
                        <button
                          type="button"
                          aria-label={i18n.eventsList?.deleteAria?.(event.event_name) || `Delete event ${event.event_name}`}
                          style={{
                            background: 'none',
                            border: '1px solid var(--danger, #d32f2f)',
                            cursor: 'pointer',
                            color: 'var(--danger, #d32f2f)',
                            fontSize: 14,
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 28,
                            width: 28,
                            borderRadius: 4,
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
                            handleDeleteEvent(event.event_name);
                          }}
                        >
                          ×
                        </button>
                      </div>
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
