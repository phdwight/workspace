// Local Storage Service for Bill Splitter PWA
// Replaces the backend API with browser local storage

export interface Trip {
  id: string;
  trip_name: string;
  user_email: string;
  participants: string[];
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  trip_name: string;
  payers: { name: string; amount: number }[];
  participants: string[];
  date: string;
  user_email: string;
  created_at: string;
  description?: string; // <-- add description field
}

class LocalStorageService {
  private TRIPS_KEY = 'bill_splitter_trips';
  private EXPENSES_KEY = 'bill_splitter_expenses';

  // Helper methods for storage
  private getTrips(): Trip[] {
    try {
      const data = localStorage.getItem(this.TRIPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading trips from localStorage:', error);
      return [];
    }
  }

  private saveTrips(trips: Trip[]): void {
    try {
      localStorage.setItem(this.TRIPS_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trips to localStorage:', error);
    }
  }

  private getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(this.EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading expenses from localStorage:', error);
      return [];
    }
  }

  private saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Trip Management
  async getTripsForUser(userEmail: string): Promise<Trip[]> {
    const trips = this.getTrips();
    return trips.filter(trip => trip.user_email === userEmail);
  }

  async createTrip(tripName: string, participants: string[], userEmail: string): Promise<Trip> {
    if (!tripName || !participants.length || !userEmail) {
      throw new Error('Missing required fields');
    }

    // Check for duplicate trip names for this user
    const existingTrips = await this.getTripsForUser(userEmail);
    if (existingTrips.some(trip => trip.trip_name === tripName)) {
      throw new Error('Trip name already exists');
    }

    const newTrip: Trip = {
      id: this.generateId(),
      trip_name: tripName,
      user_email: userEmail,
      participants: participants.filter(p => p.trim()),
      created_at: new Date().toISOString()
    };

    const trips = this.getTrips();
    trips.push(newTrip);
    this.saveTrips(trips);

    return newTrip;
  }

  async deleteTrip(tripName: string, userEmail: string): Promise<void> {
    const trips = this.getTrips();
    const tripIndex = trips.findIndex(
      trip => trip.trip_name === tripName && trip.user_email === userEmail
    );

    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }

    const tripId = trips[tripIndex].id;

    // Remove the trip
    trips.splice(tripIndex, 1);
    this.saveTrips(trips);

    // Remove all expenses for this trip
    const expenses = this.getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.trip_id !== tripId);
    this.saveExpenses(filteredExpenses);
  }

  // Expense Management
  async getExpensesForTrip(tripName: string, userEmail: string): Promise<Expense[]> {
    const trips = await this.getTripsForUser(userEmail);
    const trip = trips.find(t => t.trip_name === tripName);
    
    if (!trip) {
      return [];
    }

    const expenses = this.getExpenses();
    return expenses
      .filter(expense => expense.trip_id === trip.id && expense.user_email === userEmail)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createExpense(
    tripName: string,
    payers: { name: string; amount: number }[],
    participants: string[],
    date: string,
    userEmail: string,
    description?: string // <-- add description param
  ): Promise<Expense> {
    if (!tripName || !payers.length || !participants.length || !userEmail) {
      throw new Error('Missing required fields');
    }
    // Combine payers with the same name
    const payerMap = new Map<string, number>();
    for (const p of payers) {
      const key = p.name.trim();
      if (!key) continue;
      payerMap.set(key, (payerMap.get(key) || 0) + Number(p.amount));
    }
    const uniquePayers = Array.from(payerMap.entries()).map(([name, amount]) => ({ name, amount }));
    const totalAmount = uniquePayers.reduce((sum, p) => sum + p.amount, 0);
    if (totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }
    // Find the trip
    const trips = await this.getTripsForUser(userEmail);
    const trip = trips.find(t => t.trip_name === tripName);
    if (!trip) {
      throw new Error('Trip not found');
    }
    const newExpense: Expense = {
      id: this.generateId(),
      trip_id: trip.id,
      trip_name: tripName,
      payers: uniquePayers,
      participants: participants.filter(p => p.trim()),
      date: date || new Date().toISOString().split('T')[0],
      user_email: userEmail,
      created_at: new Date().toISOString(),
      description: description || ''
    };
    const expenses = this.getExpenses();
    expenses.push(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  }

  async deleteExpense(expenseId: string, userEmail: string): Promise<void> {
    const expenses = this.getExpenses();
    const expenseIndex = expenses.findIndex(
      expense => expense.id === expenseId && expense.user_email === userEmail
    );

    if (expenseIndex === -1) {
      throw new Error('Expense not found');
    }

    expenses.splice(expenseIndex, 1);
    this.saveExpenses(expenses);
  }

  // Utility methods
  async exportData(userEmail: string): Promise<{ trips: Trip[]; expenses: Expense[] }> {
    const trips = await this.getTripsForUser(userEmail);
    const allExpenses = this.getExpenses();
    const tripIds = trips.map(t => t.id);
    const expenses = allExpenses.filter(e => 
      tripIds.includes(e.trip_id) && e.user_email === userEmail
    );

    return { trips, expenses };
  }

  async importData(data: { trips: Trip[]; expenses: Expense[] }, userEmail: string): Promise<void> {
    if (!data.trips || !data.expenses) {
      throw new Error('Invalid data format');
    }

    // Filter data to only include user's data
    const userTrips = data.trips.filter(t => t.user_email === userEmail);
    const userExpenses = data.expenses.filter(e => e.user_email === userEmail);

    // Get existing data
    const existingTrips = this.getTrips();
    const existingExpenses = this.getExpenses();

    // Remove old data for this user
    const otherTrips = existingTrips.filter(t => t.user_email !== userEmail);
    const otherExpenses = existingExpenses.filter(e => e.user_email !== userEmail);

    // Add imported data
    this.saveTrips([...otherTrips, ...userTrips]);
    this.saveExpenses([...otherExpenses, ...userExpenses]);
  }

  async clearUserData(userEmail: string): Promise<void> {
    const trips = this.getTrips();
    const expenses = this.getExpenses();

    const filteredTrips = trips.filter(t => t.user_email !== userEmail);
    const filteredExpenses = expenses.filter(e => e.user_email !== userEmail);

    this.saveTrips(filteredTrips);
    this.saveExpenses(filteredExpenses);
  }
}

// Create and export singleton instance
export const localStorageService = new LocalStorageService();

// Export default for convenience
export default localStorageService;
