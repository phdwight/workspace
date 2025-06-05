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
    tripNameLabel: "Nombre del Viaje",
    tripNamePlaceholder: "p.ej. Vacaciones en Bali",
    participantsLabel: "Participantes",
    participantPlaceholder: (i: number) => `Participante ${i + 1}`,
    addParticipant: "+ Agregar Participante",
    removeParticipantAria: "Eliminar participante",
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
    loading: "Cargando viajes...",
    noTrips: "No se encontraron viajes.",
    participants: (n: number) => `(${n} participantes)`,
    delete: "Eliminar",
    deleting: "Eliminando...",
    deleteAria: (name: string) => `Eliminar viaje ${name}`,
    confirmDelete: (name: string) => `¿Seguro que deseas eliminar el viaje: ${name}?`,
    errorDelete: "No se pudo eliminar el viaje",
    showActions: "Mostrar acciones",
    hideActions: "Ocultar acciones",
  },
  expenseForm: {
    title: "Agregar Gasto",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "¿Para qué fue este gasto?",
    amountLabel: "Cantidad",
    amountPlaceholder: "0.00",
    payerLabel: "¿Quién pagó?",
    participantsLabel: "¿Quién participó?",
    dateLabel: "Fecha",
    submit: "Agregar Gasto",
    adding: "Agregando...",
    todo: "El formulario para agregar gastos (pagador, monto, participantes, fecha) irá aquí.",
    viewBalanceSummary: "Ver resumen de balances",
    backToCreateEvent: "Volver a Crear Evento",
  },
  expenseHistory: {
    title: "Historial de Gastos",
    todo: "La lista de todos los gastos del viaje irá aquí."
  },
  balanceSummary: {
    title: "Resumen de Saldos",
    participant: "Participante",
    balance: "Saldo",
    owes: "Debe",
    owed: "Se le debe",
    noExpenses: "Aún no se han registrado gastos.",
    backToExpenses: "Volver a Gastos",
    suggestedSettlements: 'Sugerencias de liquidación',
    settlementInstruction: '{from} debe pagar a {to} la cantidad de {amount}',
  },
  settlements: {
    title: "Liquidaciones",
    todo: "El desglose de pagos para saldar deudas irá aquí."
  },
  auth: {
    signedInAs: "Conectado como",
    signOut: "Cerrar Sesión"
  },
  common: {
    loading: "Cargando",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar"
  }
};

export default es;
