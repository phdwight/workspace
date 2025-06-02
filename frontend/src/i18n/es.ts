// Spanish UI strings for Bill Splitter App
const es = {
  appTitle: "App de División de Gastos",
  nav: {
    trip: "Viaje",
    trips: "Todos los Viajes",
    expense: "Agregar Gasto",
    history: "Historial",
    summary: "Resumen",
    settlements: "Liquidaciones"
  },
  tripCreation: {
    title: "Crear un Viaje",
    signInPrompt: "Por favor, inicia sesión con Google para crear un viaje.",
    tripNameLabel: "Nombre del Viaje",
    tripNamePlaceholder: "p.ej. Vacaciones en Bali",
    participantsLabel: "Participantes",
    participantPlaceholder: (i: number) => `Participante ${i + 1}`,
    addParticipant: "+ Agregar Participante",
    removeParticipantAria: "Eliminar participante",
    errorNotSignedIn: "Debes iniciar sesión para crear un viaje.",
    errorMinParticipants: "Por favor, ingresa al menos 2 participantes.",
    submit: "Crear Viaje",
    creating: "Creando...",
    success: "¡Viaje creado exitosamente!",
    createdTitle: "🎉 ¡Viaje Creado!",
    createdName: "Nombre:",
    createdParticipants: "Participantes:",
  },
  tripsList: {
    title: "Todos los Viajes",
    signInPrompt: "Por favor, inicia sesión con Google para ver tus viajes.",
    loading: "Cargando viajes...",
    noTrips: "No se encontraron viajes.",
    participants: (n: number) => `(${n} participantes)`,
    delete: "Eliminar",
    deleting: "Eliminando...",
    deleteAria: (name: string) => `Eliminar viaje ${name}`,
    confirmDelete: (name: string) => `¿Seguro que deseas eliminar el viaje: ${name}?`,
    errorNotSignedIn: "Debes iniciar sesión para ver tus viajes.",
    errorDelete: "No se pudo eliminar el viaje",
  },
  expenseForm: {
    title: "Agregar Gasto",
    todo: "El formulario para agregar gastos (pagador, monto, participantes, fecha) irá aquí."
  },
  expenseHistory: {
    title: "Historial de Gastos",
    todo: "La lista de todos los gastos del viaje irá aquí."
  },
  balanceSummary: {
    title: "Resumen de Saldos",
    todo: "El resumen de saldos y pagos requeridos irá aquí."
  },
  settlements: {
    title: "Liquidaciones",
    todo: "El desglose de pagos para saldar deudas irá aquí."
  },
  auth: {
    signedInAs: "Conectado como",
    signOut: "Cerrar Sesión"
  }
};

export default es;
