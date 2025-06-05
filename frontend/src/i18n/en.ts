// English UI strings for Bill Splitter App
const en = {
  appTitle: "Bill Splitter App",
  nav: {
    trip: "Event",
    trips: "All Events",
    expense: "Add Expense",
    history: "History",
    summary: "Summary",
    settlements: "Settlements"
  },
  tripCreation: {
    title: "New Event",
    tripNameLabel: "Event Name",
    tripNamePlaceholder: "Enter event name",
    participantsLabel: "Participants",
    participantPlaceholder: (index: number) => `Participant ${index + 1}`,
    addParticipant: "Add Participant",
    removeParticipantAria: "Remove participant",
    errorMinParticipants: "At least 2 participants required",
    submit: "Create Event",
    creating: "Creating...",
    success: "Event created!",
    createdTitle: "Event Created",
    createdName: "Event Name",
    createdParticipants: "Participants",
  },
  tripsList: {
    title: "Your Events",
    loading: "Loading events...",
    noTrips: "No events found.",
    participants: (n: number) => `(${n} participants)`,
    delete: "Delete",
    deleting: "Deleting...",
    deleteAria: (name: string) => `Delete event ${name}`,
    confirmDelete: (name: string) => `Are you sure you want to delete the event: ${name}?`,
    errorDelete: "Failed to delete event",
    showActions: "Show Actions",
    hideActions: "Hide Actions",
  },
  expenseForm: {
    title: "Add Expense",
    descriptionLabel: "Description",
    descriptionPlaceholder: "What was this expense for?",
    amountLabel: "Amount",
    amountPlaceholder: "0.00",
    payerLabel: "Who paid?",
    participantsLabel: "Who participated?",
    dateLabel: "Date",
    submit: "Add Expense",
    adding: "Adding...",
    todo: "Expense entry form (payer, amount, participants, date) will go here.",
    viewBalanceSummary: "View Balance Summary",
    backToCreateEvent: "Back to Create Event",
  },
  expenseHistory: {
    title: "Expense History",
    todo: "List of all expenses in the trip will go here."
  },
  balanceSummary: {
    title: "Balance Summary",
    participant: "Participant",
    balance: "Balance",
    owes: "Owes",
    owed: "Owed",
    noExpenses: "No expenses recorded yet.",
    backToExpenses: "Back to Expenses",
  },
  settlements: {
    title: "Settlements",
    todo: "Breakdown of payments to balance debts will go here."
  },
  auth: {
    signedInAs: "Signed in as",
    signOut: "Sign Out"
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
  }
};

export default en;
