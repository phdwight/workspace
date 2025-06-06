import { useState, useEffect, useCallback } from 'react';
import type { Event } from '../types';
import { localStorageService } from '../services/localStorage';
import { useToast } from '../components/shared/Toast';

export const useEvents = (userEmail: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadEvents = useCallback(async () => {
    if (!userEmail) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await localStorageService.getEventsForUser(userEmail);
      setEvents(data.reverse()); // Show newest event at the top
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail, addToast]);

  const createEvent = useCallback(async (eventName: string, participants: string[]) => {
    if (!userEmail) {
      throw new Error('User not authenticated');
    }

    if (events.length >= 5) {
      throw new Error('You can only have up to 5 events.');
    }

    setLoading(true);
    try {
      const newEvent = await localStorageService.createEvent(eventName, participants, userEmail);
      const eventWithParticipants: Event = {
        id: newEvent.id,
        event_name: newEvent.event_name,
        user_email: newEvent.user_email,
        participants: newEvent.participants,
        created_at: newEvent.created_at
      };
      setEvents(prev => [eventWithParticipants, ...prev]);
      addToast('Event created successfully!', 'success');
      return eventWithParticipants;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      addToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userEmail, events.length, addToast]);

  const deleteEvent = useCallback(async (eventName: string) => {
    if (!userEmail) return;

    try {
      await localStorageService.deleteEvent(eventName, userEmail);
      setEvents(prev => prev.filter(event => event.event_name !== eventName));
      addToast('Event deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      addToast(errorMessage, 'error');
    }
  }, [userEmail, addToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    deleteEvent,
    refreshEvents: loadEvents
  };
};
