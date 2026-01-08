// Método para validar si un turno cruza la medianoche
function crucaMedianoche(horaInicio, horaFin) {
  // Convertir strings de hora a objetos Date
  const inicio = new Date(`2000-01-01T${horaInicio}`);
  const fin = new Date(`2000-01-01T${horaFin}`);
  
  // Si la hora de fin es menor o igual que la hora de inicio, cruza medianoche
  return fin <= inicio;
}

// Método alternativo con más información detallada
function validarTurno(horaInicio, horaFin) {
  const inicio = new Date(`2000-01-01T${horaInicio}`);
  const fin = new Date(`2000-01-01T${horaFin}`);
  
  const cruza = fin <= inicio;
  
  return {
    cruzaMedianoche: cruza,
    horaInicio: horaInicio,
    horaFin: horaFin,
    mensaje: cruza 
      ? 'El turno cruza la medianoche (pasa al día siguiente)' 
      : 'El turno se completa en el mismo día'
  };
}

// Método con fechas completas
function validarTurnoConFechas(fechaHoraInicio, fechaHoraFin) {
  const inicio = new Date(fechaHoraInicio);
  const fin = new Date(fechaHoraFin);
  
  // Extraer solo las fechas (sin hora)
  const fechaInicio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const fechaFin = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
  
  const diasDiferencia = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  
  return {
    cruzaMedianoche: diasDiferencia > 0,
    diasTranscurridos: diasDiferencia,
    fechaInicio: inicio.toLocaleString(),
    fechaFin: fin.toLocaleString(),
    mensaje: diasDiferencia === 0 
      ? 'El turno se completa en el mismo día' 
      : `El turno cruza ${diasDiferencia} día(s)`
  };
}

// Ejemplos de uso:
console.log('=== Ejemplos con formato de hora (HH:MM:SS) ===');
console.log(crucaMedianoche('20:00:00', '19:00:00')); // true - cruza medianoche
console.log(crucaMedianoche('08:00:00', '16:00:00')); // false - mismo día
console.log(crucaMedianoche('23:00:00', '23:30:00')); // false - mismo día
console.log(crucaMedianoche('23:30:00', '00:30:00')); // true - cruza medianoche

console.log('\n=== Ejemplos con validación detallada ===');
console.log(validarTurno('22:00:00', '06:00:00'));
console.log(validarTurno('09:00:00', '17:00:00'));

console.log('\n=== Ejemplos con fechas completas ===');
console.log(validarTurnoConFechas('2025-10-03T22:00:00', '2025-10-04T06:00:00'));
console.log(validarTurnoConFechas('2025-10-03T08:00:00', '2025-10-03T16:00:00'));



