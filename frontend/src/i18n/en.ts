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
    signInPrompt: "Please sign in with Google to create a trip.",
    tripNameLabel: "Trip Name",
    tripNamePlaceholder: "e.g. Bali Vacation",
    participantsLabel: "Participants",
    participantPlaceholder: (i: number) => `Participant ${i + 1}`,
    addParticipant: "+ Add Participant",
    removeParticipantAria: "Remove participant",
    errorNotSignedIn: "You must be signed in to create a trip.",
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
    signInPrompt: "Please sign in with Google to view your trips.",
    loading: "Loading trips...",
    noTrips: "No trips found.",
    participants: (n: number) => `(${n} participants)`,
    delete: "Delete",
    deleting: "Deleting...",
    deleteAria: (name: string) => `Delete trip ${name}`,
    confirmDelete: (name: string) => `Are you sure you want to delete the trip: ${name}?`,
    errorNotSignedIn: "You must be signed in to view your trips.",
    errorDelete: "Failed to delete trip",
    showActions: "Show Actions",
    hideActions: "Hide Actions",
  },
  expenseForm: {
    title: "Add Expense",
    todo: "Expense entry form (payer, amount, participants, date) will go here."
  },
  expenseHistory: {
    title: "Expense History",
    todo: "List of all expenses in the trip will go here."
  },
  balanceSummary: {
    title: "Balance Summary",
    todo: "Summary of balances and required payments will go here."
  },
  settlements: {
    title: "Settlements",
    todo: "Breakdown of payments to balance debts will go here."
  },
  auth: {
    signedInAs: "Signed in as",
    signOut: "Sign Out"
  }
};

export default en;
