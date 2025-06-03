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
  }, []);

  const validateParticipants = (participantList: string[]): string | null => {
    const normalized = participantList.map((p: string) => p.trim().toLowerCase());
    const hasDuplicate = normalized.some((p: string, i: number) => p && normalized.indexOf(p) !== i);
    if (hasDuplicate) {
      return 'Duplicate participant names are not allowed.';
    }
    const validParticipants = participantList.filter((p: string) => p.trim());
    if (validParticipants.length < 2) {
      return i18n.tripCreation.errorMinParticipants;
    }
    if (validParticipants.length > 10) {
      return 'You can only have up to 10 participants.';
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
  };

  // Rename handlers for harmony with UI
  const handleAddParticipant = addParticipant;
  const handleRemoveParticipant = removeParticipant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validateParticipants(participants);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const cleanParticipants = participants.map((p: string) => p.trim()).filter(Boolean);
      const newTrip = await createTrip(tripName, cleanParticipants);
      if (onTripCreated) {
        onTripCreated(newTrip);
      }
      setTripName("");
      setParticipants(["", ""]);
      setTimeout(() => {
        tripNameRef.current?.focus();
      }, 0);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
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
      confirmDialog.style.background = 'rgba(0,0,0,0.25)';
      confirmDialog.style.display = 'flex';
      confirmDialog.style.alignItems = 'center';
      confirmDialog.style.justifyContent = 'center';
      confirmDialog.style.zIndex = '9999';
      
      confirmDialog.innerHTML = `
        <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 32px #0003; padding: 32px 24px; max-width: 90vw; min-width: 280px; text-align: center;">
          <div style="font-size: 1.1rem; color: #BB3E00; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span role='img' aria-label='Warning' style='font-size: 1.5em;'>⚠️</span>
            ${message}
          </div>
          <div style="display: flex; gap: 16px; justify-content: center; margin-top: 10px;">
            <button id="confirm-yes" style="background: linear-gradient(90deg, #BB3E00 60%, #F7AD45 100%); color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; padding: 10px 18px; cursor: pointer; box-shadow: 0 2px 8px #BB3E0088;">Yes, Delete</button>
            <button id="confirm-no" style="background: #A2B9A7; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; padding: 10px 18px; cursor: pointer; box-shadow: 0 2px 8px #A2B9A788;">Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(confirmDialog);
      
      const cleanup = () => {
        document.body.removeChild(confirmDialog);
      };
      
      confirmDialog.querySelector('#confirm-no')?.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      confirmDialog.querySelector('#confirm-yes')?.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
    });
  };

  return (
    <div className="trip-creation-container">
      <h2>{i18n.tripCreation.title}</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        {/* Trip Name - inline label and input */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label htmlFor="tripName" style={{ minWidth: 110, marginRight: 8 }}>{i18n.tripCreation.tripNameLabel}</label>
          <input
            id="tripName"
            type="text"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
            placeholder={i18n.tripCreation.tripNamePlaceholder}
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          />
        </div>
        {/* Participants - inline label, vertical checkboxes */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
          <label htmlFor="participants" style={{ minWidth: 110, marginRight: 8, marginTop: 2 }}>{i18n.tripCreation.participantsLabel}</label>
          <div style={{ flex: 1 }}>
            {participants.map((participant, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                <input
                  type="text"
                  value={participant}
                  onChange={e => handleParticipantChange(idx, e.target.value)}
                  placeholder={i18n.tripCreation.participantPlaceholder(idx)}
                  disabled={loading}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  aria-label={i18n.tripCreation.removeParticipantAria}
                  onClick={() => handleRemoveParticipant(idx)}
                  disabled={loading || participants.length <= 2}
                  style={{ background: 'none', border: 'none', color: '#BB3E00', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
                >
                  &minus;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddParticipant}
              disabled={loading}
              className="add-btn"
              style={{ marginTop: 6 }}
            >
              {i18n.tripCreation.addParticipant}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{ flex: 1 }}
          >
            {loading ? i18n.tripCreation.creating : i18n.tripCreation.submit}
          </button>
        </div>
      </form>

      {/* Trips List */}
      {trips.length > 0 && (
        <div style={{ 
          marginTop: 24, 
          maxWidth: 520, 
          width: '100%', 
          boxSizing: 'border-box', 
          marginLeft: 'auto', 
          marginRight: 'auto' 
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            marginBottom: 12, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 6, 
            fontSize: 18, 
            color: '#BB3E00' 
          }}>
            <span role="img" aria-label="Trips">🧳</span>
            {i18n.tripsList?.title || 'Your Trips'}
          </h3>
          
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <table style={{ 
              width: '100%', 
              minWidth: 0, 
              borderCollapse: 'separate', 
              borderSpacing: 0, 
              background: '#fff', 
              borderRadius: 10, 
              boxShadow: '0 2px 8px #0001', 
              overflow: 'hidden', 
              fontSize: 13 
            }}>
              <thead>
                <tr style={{ 
                  background: '#f7ead9', 
                  color: '#BB3E00', 
                  fontWeight: 700, 
                  fontSize: 13 
                }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', borderTopLeftRadius: 10 }}>
                    Trip
                  </th>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>
                    Participants
                  </th>
                  <th style={{ width: 32 }}></th>
                  <th style={{ width: 120, borderTopRightRadius: 10 }}></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, idx) => (
                  <tr
                    key={trip.trip_name}
                    style={{
                      borderBottom: idx === trips.length - 1 ? 'none' : '1px solid #eee',
                      background: idx % 2 === 0 ? '#fff' : '#f7ead9',
                      transition: 'background 0.12s',
                    }}
                  >
                    <td style={{ 
                      padding: '8px 6px', 
                      fontWeight: 600, 
                      fontSize: 13, 
                      color: '#2d1a0b', 
                      verticalAlign: 'middle' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
                        <span style={{ marginRight: 6, fontSize: 15, display: 'flex', alignItems: 'center' }}>
                          🧳
                        </span>
                        <span style={{ display: 'block', lineHeight: 1.2 }}>
                          {trip.trip_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '8px 6px', 
                      color: '#555', 
                      fontSize: 13, 
                      verticalAlign: 'middle', 
                      maxWidth: 120, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                      title={trip.participants.join(', ')}
                    >
                      {trip.participants.join(', ')}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        aria-label={`Delete trip ${trip.trip_name}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#d32f2f',
                          fontSize: 18,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 28,
                          width: 28,
                          borderRadius: 5,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.trip_name);
                        }}
                      >
                        ×
                      </button>
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        style={{
                          background: 'linear-gradient(90deg, #BB3E00 60%, #F7AD45 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSelectedTrip?.(trip);
                          setPage?.('expenses');
                        }}
                      >
                        Open
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
