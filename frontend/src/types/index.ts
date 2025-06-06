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
  description?: string; // Optional for backward compatibility
  category?: string; // Optional expense category
  payers: { name: string; amount: number }[]; // Multiple payers with amounts
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
  eventCreation: {
    title: string;
    eventNameLabel: string;
    eventNamePlaceholder: string;
    participantsLabel: string;
    participantPlaceholder: (index: number) => string;
    addParticipant: string;
    removeParticipantAria: string;
    errorMinParticipants: string;
    errorMaxParticipants?: string;
    errorDuplicateParticipants?: string;
    errorMissingName?: string;
    errorCreate?: string;
    minParticipantsTooltip?: string;
    maxParticipantsTooltip?: string;
    submit: string;
    creating: string;
    success: string;
    createdTitle: string;
    createdName: string;
    createdParticipants: string;
  };
  eventsList: {
    title: string;
    loading: string;
    noEvents: string;
    participants: (n: number) => string;
    delete: string;
    deleting: string;
    deleteAria: (name: string) => string;
    confirmDelete: (name: string) => string;
    errorDelete: string;
    showActions: string;
    hideActions: string;
    eventColumn?: string;
    participantsColumn?: string;
    actionsColumn?: string;
    openButton?: string;
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
    viewBalanceSummary?: string;
    backToCreateEvent?: string;
  };
  balanceSummary: {
    title: string;
    participant: string;
    balance: string;
    owes: string;
    owed: string;
    noExpenses: string;
    backToExpenses?: string;
    suggestedSettlements?: string;
    settlementInstruction?: string;
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

export type Page = 'events' | 'expenses' | 'balances';

// Component props types
export interface BaseComponentProps {
  user: User | null;
  i18n: I18nTexts;
}

export interface EventCreationProps extends BaseComponentProps {
  setUser: (user: User | null) => void;
  onEventCreated?: (event: Event) => void;
  setPage: (page: Page) => void;
  setSelectedEvent: (event: Event) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
  setRefreshKey?: (fn: (key: number) => number) => void;
}

export interface ExpenseFormProps {
  i18n: I18nTexts;
  event: Event;
  onExpenseAdded?: () => void;
  setRefreshKey?: (fn: (key: number) => number) => void;
}

// Remove user prop from BalanceSummaryProps in types
export interface BalanceSummaryProps {
  i18n: I18nTexts;
  event: Event;
  refreshKey?: number;
}
