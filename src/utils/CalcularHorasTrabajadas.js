class CalcularHorasTrabajadas {

  calcular(horaInicio, horaFin, minutosDescanso = 0) {
    const [hIni, mIni] = horaInicio.split(":").map(Number);
    const [hFin, mFin] = horaFin.split(":").map(Number);

    let inicio = hIni + mIni / 60;
    let fin = hFin + mFin / 60;

    // Si el turno termina al día siguiente
    if (fin < inicio) fin += 24;

    const totalHoras = fin - inicio - minutosDescanso / 60;
    return totalHoras;
  }
}

module.exports = CalcularHorasTrabajadas;
