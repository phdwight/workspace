// English UI strings for Bill Splitter App
const en = {
  appTitle: "Bill Splitter App",
  nav: {
    trip: "Trip",
    trips: "All Trips",
    expense: "Add Expense",
    history: "History",
    summary: "Summary",
    settlements: "Settlements"
  },
  tripCreation: {
    title: "Create a Trip",
    tripNameLabel: "Trip Name",
    tripNamePlaceholder: "e.g. Bali Vacation",
    participantsLabel: "Participants",
    participantPlaceholder: (i: number) => `Participant ${i + 1}`,
    addParticipant: "+ Add Participant",
    removeParticipantAria: "Remove participant",
    errorMinParticipants: "Please enter at least 2 participants.",
    submit: "Create Trip",
    creating: "Creating...",
    success: "Trip created successfully!",
    createdTitle: "🎉 Trip Created!",
    createdName: "Name:",
    createdParticipants: "Participants:",
  },
  tripsList: {
    title: "All Trips",
    loading: "Loading trips...",
    noTrips: "No trips found.",
    participants: (n: number) => `(${n} participants)`,
    delete: "Delete",
    deleting: "Deleting...",
    deleteAria: (name: string) => `Delete trip ${name}`,
    confirmDelete: (name: string) => `Are you sure you want to delete the trip: ${name}?`,
    errorDelete: "Failed to delete trip",
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
    todo: "Expense entry form (payer, amount, participants, date) will go here."
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
