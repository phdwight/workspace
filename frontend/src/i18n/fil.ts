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
    signInPrompt: "Mag-sign in gamit ang Google para gumawa ng biyaahe.",
    tripNameLabel: "Pangalan ng Biyaahe",
    tripNamePlaceholder: "hal. Bakasyon sa Bali",
    participantsLabel: "Mga Kalahok",
    participantPlaceholder: (i: number) => `Kalahok ${i + 1}`,
    addParticipant: "+ Magdagdag ng Kalahok",
    removeParticipantAria: "Tanggalin ang kalahok",
    errorNotSignedIn: "Kailangan mong mag-sign in para gumawa ng biyaahe.",
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
    signInPrompt: "Mag-sign in gamit ang Google para makita ang iyong mga biyaahe.",
    loading: "Ikinakarga ang mga biyaahe...",
    noTrips: "Walang nahanap na biyaahe.",
    participants: (n: number) => `(${n} kalahok${n > 1 ? '' : ''})`,
    delete: "Tanggalin",
    deleting: "Tinatanggal...",
    deleteAria: (name: string) => `Tanggalin ang biyaahe ${name}`,
    confirmDelete: (name: string) => `Sigurado ka bang gusto mong tanggalin ang biyaahe: ${name}?`,
    errorNotSignedIn: "Kailangan mong mag-sign in para makita ang iyong mga biyaahe.",
    errorDelete: "Hindi natanggal ang biyaahe",
    showActions: "Ipakita ang mga Aksyon",
    hideActions: "Itago ang mga Aksyon",
  },
  expenseForm: {
    title: "Magdagdag ng Gastos",
    todo: "Dito ilalagay ang form para sa gastos (nagbayad, halaga, mga kalahok, petsa)."
  },
  expenseHistory: {
    title: "Kasaysayan ng Gastos",
    todo: "Dito ilalagay ang listahan ng lahat ng gastos sa biyaahe."
  },
  balanceSummary: {
    title: "Buod ng Balanse",
    todo: "Dito ilalagay ang buod ng balanse at kailangang bayaran.",
    note: "Ang buod na ito ay batay sa lahat ng gastos para sa napiling biyahe."
  },
  settlements: {
    title: "Bayaran",
    todo: "Dito ilalagay ang detalye ng mga bayaran para mabayaran ang utang."
  },
  auth: {
    signedInAs: "Naka-sign in bilang",
    signOut: "Mag-sign Out"
  }
};

export default fil;
