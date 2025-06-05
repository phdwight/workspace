// Filipino (Tagalog) UI strings for Bill Splitter App
const fil = {
  appTitle: "Bill Splitter App",
  nav: {
    trip: "Biyaahe",
    trips: "Lahat ng Biyaahe",
    expense: "Magdagdag ng Gastos",
    history: "Kasaysayan",
    summary: "Buod",
    settlements: "Bayaran"
  },
  tripCreation: {
    title: "Gumawa ng Biyaahe",
    tripNameLabel: "Pangalan ng Biyaahe",
    tripNamePlaceholder: "hal. Bakasyon sa Bali",
    participantsLabel: "Mga Kalahok",
    participantPlaceholder: (i: number) => `Kalahok ${i + 1}`,
    addParticipant: "+ Magdagdag ng Kalahok",
    removeParticipantAria: "Tanggalin ang kalahok",
    errorMinParticipants: "Maglagay ng hindi bababa sa 2 kalahok.",
    submit: "Gumawa ng Biyaahe",
    creating: "Ginagawa...",
    success: "Matagumpay na nagawa ang biyaahe!",
    createdTitle: "🎉 Naggawa ang Biyaahe!",
    createdName: "Pangalan:",
    createdParticipants: "Mga Kalahok:",
  },
  tripsList: {
    title: "Lahat ng Biyaahe",
    loading: "Ikinakarga ang mga biyaahe...",
    noTrips: "Walang nahanap na biyaahe.",
    participants: (n: number) => `(${n} kalahok${n > 1 ? '' : ''})`,
    delete: "Tanggalin",
    deleting: "Tinatanggal...",
    deleteAria: (name: string) => `Tanggalin ang biyaahe ${name}`,
    confirmDelete: (name: string) => `Sigurado ka bang gusto mong tanggalin ang biyaahe: ${name}?`,
    errorDelete: "Hindi natanggal ang biyaahe",
    showActions: "Ipakita ang mga Aksyon",
    hideActions: "Itago ang mga Aksyon",
  },
  expenseForm: {
    title: "Magdagdag ng Gastos",
    descriptionLabel: "Paglalarawan",
    descriptionPlaceholder: "Para saan ang gastong ito?",
    amountLabel: "Halaga",
    amountPlaceholder: "0.00",
    payerLabel: "Sino ang nagbayad?",
    participantsLabel: "Sino ang nakipaghati?",
    dateLabel: "Petsa",
    submit: "Idagdag ang Gastos",
    adding: "Dinadadagdag...",
    todo: "Dito ilalagay ang form para sa gastos (nagbayad, halaga, mga kalahok, petsa).",
    viewBalanceSummary: "Tingnan ang Buod ng Balanse",
    backToCreateEvent: "Bumalik sa Paglikha ng Event",
  },
  expenseHistory: {
    title: "Kasaysayan ng Gastos",
    todo: "Dito ilalagay ang listahan ng lahat ng gastos sa biyaahe."
  },
  balanceSummary: {
    title: "Buod ng Balanse",
    participant: "Kalahok",
    balance: "Balanse",
    owes: "Utang",
    owed: "Dapat Bayaran",
    noExpenses: "Wala pang naitaling gastos.",
    backToExpenses: "Bumalik sa Mga Gastos",
    suggestedSettlements: 'Mga Iminungkahing Bayaran',
    settlementInstruction: 'Kailangang bayaran ni {from} si {to} ng halagang {amount}',
  },
  settlements: {
    title: "Bayaran",
    todo: "Dito ilalagay ang detalye ng mga bayaran para mabayaran ang utang."
  },
  auth: {
    signedInAs: "Naka-sign in bilang",
    signOut: "Mag-sign Out"
  },
  common: {
    loading: "Naglo-load",
    error: "May Mali",
    success: "Tagumpay",
    cancel: "Kanselahin",
    save: "I-save",
    delete: "Tanggalin",
    edit: "I-edit"
  }
};

export default fil;
