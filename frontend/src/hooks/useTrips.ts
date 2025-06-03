import { useState, useEffect, useCallback } from 'react';
import type { Trip } from '../types';
import { localStorageService } from '../services/localStorage';
import { useToast } from '../components/shared/Toast';

export const useTrips = (userEmail: string) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadTrips = useCallback(async () => {
    if (!userEmail) {
      setTrips([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await localStorageService.getTripsForUser(userEmail);
      setTrips(data.reverse()); // Show newest trip at the top
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trips';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail, addToast]);

  const createTrip = useCallback(async (tripName: string, participants: string[]) => {
    if (!userEmail) {
      throw new Error('User not authenticated');
    }

    if (trips.length >= 5) {
      throw new Error('You can only have up to 5 trips.');
    }

    setLoading(true);
    try {
      const newTrip = await localStorageService.createTrip(tripName, participants, userEmail);
      const tripWithParticipants: Trip = {
        id: newTrip.id,
        trip_name: newTrip.trip_name,
        user_email: newTrip.user_email,
        participants: newTrip.participants,
        created_at: newTrip.created_at
      };
      setTrips(prev => [tripWithParticipants, ...prev]);
      addToast('Trip created successfully!', 'success');
      return tripWithParticipants;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip';
      addToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userEmail, trips.length, addToast]);

  const deleteTrip = useCallback(async (tripName: string) => {
    if (!userEmail) return;

    try {
      await localStorageService.deleteTrip(tripName, userEmail);
      setTrips(prev => prev.filter(trip => trip.trip_name !== tripName));
      addToast('Trip deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trip';
      addToast(errorMessage, 'error');
    }
  }, [userEmail, addToast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  return {
    trips,
    loading,
    error,
    createTrip,
    deleteTrip,
    refreshTrips: loadTrips
  };
};
