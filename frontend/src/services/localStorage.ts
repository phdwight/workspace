// Local Storage Service for Bill Splitter PWA
// Replaces the backend API with browser local storage

export interface Event {
  id: string;
  event_name: string;
  user_email: string;
  participants: string[];
  created_at: string;
}

export interface Expense {
  id: string;
  event_id: string;
  event_name: string;
  payers: { name: string; amount: number }[];
  participants: string[];
  date: string;
  user_email: string;
  created_at: string;
  description?: string; // <-- add description field
  category?: string; // <-- add category field
}

class LocalStorageService {
  private EVENTS_KEY = 'bill_splitter_events';
  private EXPENSES_KEY = 'bill_splitter_expenses';

  // Helper methods for storage
  private getEvents(): Event[] {
    try {
      const data = localStorage.getItem(this.EVENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading events from localStorage:', error);
      return [];
    }
  }

  private saveEvents(events: Event[]): void {
    try {
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
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

  // Event Management
  async getEventsForUser(userEmail: string): Promise<Event[]> {
    const events = this.getEvents();
    return events.filter(event => event.user_email === userEmail);
  }

  async createEvent(eventName: string, participants: string[], userEmail: string): Promise<Event> {
    if (!eventName || !participants.length || !userEmail) {
      throw new Error('Missing required fields');
    }

    // Check for duplicate event names for this user
    const existingEvents = await this.getEventsForUser(userEmail);
    if (existingEvents.some(event => event.event_name === eventName)) {
      throw new Error('Event name already exists');
    }

    const newEvent: Event = {
      id: this.generateId(),
      event_name: eventName,
      user_email: userEmail,
      participants: participants.filter(p => p.trim()),
      created_at: new Date().toISOString()
    };

    const events = this.getEvents();
    events.push(newEvent);
    this.saveEvents(events);

    return newEvent;
  }

  async deleteEvent(eventName: string, userEmail: string): Promise<void> {
    const events = this.getEvents();
    const eventIndex = events.findIndex(
      event => event.event_name === eventName && event.user_email === userEmail
    );

    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const eventId = events[eventIndex].id;

    // Remove the event
    events.splice(eventIndex, 1);
    this.saveEvents(events);

    // Remove all expenses for this event
    const expenses = this.getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.event_id !== eventId);
    this.saveExpenses(filteredExpenses);
  }

  // Expense Management
  async getExpensesForEvent(eventName: string, userEmail: string): Promise<Expense[]> {
    const events = await this.getEventsForUser(userEmail);
    const event = events.find(e => e.event_name === eventName);
    
    if (!event) {
      return [];
    }

    const expenses = this.getExpenses();
    return expenses
      .filter(expense => expense.event_id === event.id && expense.user_email === userEmail)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createExpense(
    eventName: string,
    payers: { name: string; amount: number }[],
    participants: string[],
    date: string,
    userEmail: string,
    description?: string, // <-- add description param
    category?: string // <-- add category param
  ): Promise<Expense> {
    if (!eventName || !payers.length || !participants.length || !userEmail) {
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
    // Find the event
    const events = await this.getEventsForUser(userEmail);
    const event = events.find(e => e.event_name === eventName);
    if (!event) {
      throw new Error('Event not found');
    }
    const newExpense: Expense = {
      id: this.generateId(),
      event_id: event.id,
      event_name: eventName,
      payers: uniquePayers,
      participants: participants.filter(p => p.trim()),
      date: date || new Date().toISOString().split('T')[0],
      user_email: userEmail,
      created_at: new Date().toISOString(),
      description: description || '',
      category: category || ''
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
  async exportData(userEmail: string): Promise<{ events: Event[]; expenses: Expense[] }> {
    const events = await this.getEventsForUser(userEmail);
    const allExpenses = this.getExpenses();
    const eventIds = events.map(e => e.id);
    const expenses = allExpenses.filter(e => 
      eventIds.includes(e.event_id) && e.user_email === userEmail
    );

    return { events, expenses };
  }

  async importData(data: { events: Event[]; expenses: Expense[] }, userEmail: string): Promise<void> {
    if (!data.events || !data.expenses) {
      throw new Error('Invalid data format');
    }

    // Filter data to only include user's data
    const userEvents = data.events.filter(e => e.user_email === userEmail);
    const userExpenses = data.expenses.filter(e => e.user_email === userEmail);

    // Get existing data
    const existingEvents = this.getEvents();
    const existingExpenses = this.getExpenses();

    // Remove old data for this user
    const otherEvents = existingEvents.filter(e => e.user_email !== userEmail);
    const otherExpenses = existingExpenses.filter(e => e.user_email !== userEmail);

    // Add imported data
    this.saveEvents([...otherEvents, ...userEvents]);
    this.saveExpenses([...otherExpenses, ...userExpenses]);
  }

  async clearUserData(userEmail: string): Promise<void> {
    const events = this.getEvents();
    const expenses = this.getExpenses();

    const filteredEvents = events.filter(e => e.user_email !== userEmail);
    const filteredExpenses = expenses.filter(e => e.user_email !== userEmail);

    this.saveEvents(filteredEvents);
    this.saveExpenses(filteredExpenses);
  }
}

// Create and export singleton instance
export const localStorageService = new LocalStorageService();

// Export default for convenience
export default localStorageService;
