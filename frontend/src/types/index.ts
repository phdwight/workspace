// Core application types
export interface User {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

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
  description?: string; // Optional for backward compatibility
  payer: string;
  amount: number;
  participants: string[];
  date: string;
  user_email: string;
  created_at: string;
}

export interface Balance {
  participant: string;
  balance: number;
  owes: { [key: string]: number };
  owed: { [key: string]: number };
}

export interface I18nTexts {
  tripCreation: {
    title: string;
    tripNameLabel: string;
    tripNamePlaceholder: string;
    participantsLabel: string;
    participantPlaceholder: (index: number) => string;
    addParticipant: string;
    removeParticipantAria: string;
    errorMinParticipants: string;
    submit: string;
    creating: string;
    success: string;
    createdTitle: string;
    createdName: string;
    createdParticipants: string;
  };
  tripsList: {
    title: string;
    loading: string;
    noTrips: string;
    participants: (n: number) => string;
    delete: string;
    deleting: string;
    deleteAria: (name: string) => string;
    confirmDelete: (name: string) => string;
    errorDelete: string;
    showActions: string;
    hideActions: string;
  };
  expenseForm: {
    title: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    amountLabel: string;
    amountPlaceholder: string;
    payerLabel: string;
    participantsLabel: string;
    dateLabel: string;
    submit: string;
    adding: string;
  };
  balanceSummary: {
    title: string;
    participant: string;
    balance: string;
    owes: string;
    owed: string;
    noExpenses: string;
  };
  settlements: {
    title: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
  };
}

export type Language = 'en' | 'es' | 'fil';

export type Page = 'trips' | 'expenses' | 'balances';

// Component props types
export interface BaseComponentProps {
  user: User | null;
  i18n: I18nTexts;
}

export interface TripCreationProps extends BaseComponentProps {
  setUser: (user: User | null) => void;
  onTripCreated?: (trip: Trip) => void;
  setPage: (page: Page) => void;
  setSelectedTrip: (trip: Trip) => void;
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  setRefreshKey?: (fn: (key: number) => number) => void;
}

export interface ExpenseFormProps {
  i18n: I18nTexts;
  trip: Trip;
  onExpenseAdded?: () => void;
  setRefreshKey?: (fn: (key: number) => number) => void;
}

// Remove user prop from BalanceSummaryProps in types
export interface BalanceSummaryProps {
  i18n: I18nTexts;
  trip: Trip;
  refreshKey?: number;
}
