const constants = {
  salarioMinimo: 1423500,
  auxilioDeTransporte: 200000,
  UVT: 49799
};

const calculateSalaryDetails = ({
  tipoSalario,
  salario,
  otrosPagosSalariales,
  otrosPagosNoSalariales,
  pensionado,
  deducciones = 0,
  retencionFuente = 0,
  exonerado,
  claseRiesgo,
  auxilioDeTransporte,
  calcularRetencion = true, 
  ingresosNoConstitutivos = 0
}) => {
  
  const auxilioTransporte = auxilioDeTransporte === "Si" && salario + otrosPagosSalariales <= (constants.salarioMinimo * 2)
  ? constants.auxilioDeTransporte 
  : 0;
  const totalIngresos = salario + auxilioTransporte + otrosPagosSalariales + otrosPagosNoSalariales;

  const totalRemuneracion = calculateTotalRemuneracion(tipoSalario, salario, otrosPagosSalariales, otrosPagosNoSalariales);
  const cuarentaPorciento = totalRemuneracion * 0.4;
  const excedente = calculateExcedente(otrosPagosNoSalariales, cuarentaPorciento);
  const ibc = calculateIBC(tipoSalario, salario, otrosPagosSalariales, excedente);
  const aportesSena = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.02 : 0) : (exonerado == 'No' ? 0.02 : 0);
  const aportesIcbf = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.03 : 0) : (exonerado == 'No' ? 0.03 : 0);
  const tasaSaludEmpleador = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.085 : 0) : (exonerado == 'No' ? 0.085 : 0);
  const seguridadSocial = calculateSeguridadSocial(ibc, salario, otrosPagosSalariales, pensionado, excedente, tasaSaludEmpleador, aportesSena, aportesIcbf, claseRiesgo);
  const prestacionesSociales = calculatePrestacionesSociales(tipoSalario, salario, otrosPagosSalariales, auxilioTransporte);

  // Calculamos los ingresos no constitutivos de renta (aportes obligatorios del trabajador)
  const ingresosNoConstitutivosCalculados = seguridadSocial.pensionTrabajador + seguridadSocial.FSP + seguridadSocial.saludTrabajador + ingresosNoConstitutivos;

  // Si se solicitó cálculo automático de retención, calculamos la retención en la fuente
  let retencionCalculada = retencionFuente;
  if (calcularRetencion) {
    retencionCalculada = calcularRetencionFuente2025({
      totalPagos: salario + otrosPagosSalariales + otrosPagosNoSalariales,
      ingresosNoConstitutivos: ingresosNoConstitutivosCalculados,
      deducciones: deducciones
    });
  }

  const proyecciones = calculateProyecciones(seguridadSocial, prestacionesSociales, salario, otrosPagosSalariales, otrosPagosNoSalariales, auxilioTransporte, deducciones, retencionCalculada);
  return {
    totalRemuneracion,
    cuarentaPorciento,
    seguridadSocial,
    prestacionesSociales,
    proyecciones,
    calculations: {
      totalIngresos,
      tipoSalario,
      salario,
      otrosPagosSalariales,
      otrosPagosNoSalariales,
      pensionado,
      deducciones,
      retencionFuente: retencionCalculada,
      exonerado,
      claseRiesgo,
      auxilioDeTransporte,
      ingresosNoConstitutivos: ingresosNoConstitutivosCalculados // Agregamos este valor para referencia
    }
  };
};

function roundValues(obj) {
  return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, Math.round(value)])
  );
}

function calculateTotalRemuneracion(tipoSalario, salario, otrosPagosSalariales, otrosPagosNoSalariales) {
  return tipoSalario === 'Integral'
    ? otrosPagosSalariales + otrosPagosNoSalariales + (salario * 0.7)
    : salario + otrosPagosNoSalariales + otrosPagosSalariales;
}

function calculateExcedente(otrosPagosNoSalariales, cuarentaPorciento) {
  return otrosPagosNoSalariales - cuarentaPorciento > 0
    ? otrosPagosNoSalariales - cuarentaPorciento
    : 0;
}

function calculateIBC(tipoSalario, salario, otrosPagosSalariales, excedente) {
  if (tipoSalario === 'Ordinario') {
    return otrosPagosSalariales + salario + excedente;
  } else if (tipoSalario === 'Integral') {
    return ((salario + otrosPagosSalariales) * 0.7) + excedente;
  } else if (tipoSalario === 'Medio tiempo') {
    return constants.salarioMinimo;
  }
  return 0;
}

function calculateFSPPercentage(ibc) {
  const ratio = ibc / constants.salarioMinimo;
  if (ratio >= 4 && ratio < 16) return 0.01;
  if (ratio >= 16 && ratio <= 17) return 0.012;
  if (ratio > 17 && ratio <= 18) return 0.014;
  if (ratio > 18 && ratio <= 19) return 0.016;
  if (ratio > 19 && ratio <= 20) return 0.018;
  if (ratio > 20) return 0.02;
  return 0;
}

function calculateSeguridadSocial(ibc, salario, otrosPagosSalariales, pensionado, excedente, tasaSaludEmpleador, aportesSena, aportesIcbf, claseRiesgo) {
  const porcentajeFSP = calculateFSPPercentage(ibc);
  const riesgoLaboralPorcentaje = getRiesgoLaboralPorcentaje(claseRiesgo);

  const seguridadSocial = roundValues({
    saludTrabajador: ibc * 0.04,
    excedente,
    ibc,
    saludEmpleador: ibc * tasaSaludEmpleador,
    pensionTrabajador: pensionado === 'No' ? ibc * 0.04 : 0,
    pensionEmpleador: pensionado === 'No' ? ibc * 0.12 : 0,
    FSP: pensionado === 'No' ? ibc * porcentajeFSP : 0,
    riesgosLaborales: Math.ceil(ibc * riesgoLaboralPorcentaje),
    sena: (ibc * aportesSena),
    icbf: (ibc * aportesIcbf),
    cajaCompensacion: ibc * 0.04
  });

  seguridadSocial.totalEmpleador =
  seguridadSocial.saludEmpleador +
  seguridadSocial.cajaCompensacion +
  seguridadSocial.pensionEmpleador +
  seguridadSocial.sena +
  seguridadSocial.icbf +
  seguridadSocial.riesgosLaborales;
  
  seguridadSocial.totalTrabajador =
  seguridadSocial.FSP +
  seguridadSocial.saludTrabajador +
  seguridadSocial.pensionTrabajador;

  return seguridadSocial;
}

function getRiesgoLaboralPorcentaje(claseRiesgo) {
  switch (claseRiesgo) {
    case '1':
      return 0.00522;
    case '2':
      return 0.01044;
    case '3':
      return 0.02436; 
    case '4':
      return 0.04350;
    case '5':
      return 0.06960;    
    default:
      return 0.00522;
  }
}

function calculatePrestacionesSociales(tipoSalario, salario, otrosPagosSalariales, auxilioTransporte) {
  if (tipoSalario === 'Integral') {
    return roundValues({
      primaServicios: 0,
      cesantias: 0,
      interesesCesantias: 0,
      vacaciones: (salario + otrosPagosSalariales) * 0.0417
    });
  };
  
  const basePrestacional = salario + otrosPagosSalariales + auxilioTransporte;
  const cesantias = basePrestacional * 0.0833;

  return roundValues({
    primaServicios: basePrestacional * 0.0833,
    cesantias,
    interesesCesantias: cesantias * 0.12,
    vacaciones: (salario + otrosPagosSalariales) * 0.0417
  });
}

function calculateProyecciones(seguridadSocial, prestacionesSociales, salario, otrosPagosSalariales, otrosPagosNoSalariales, auxilioTransporte, deducciones, retencionFuente) {
  const provisionesPrestacionesSociales = Math.round(
    prestacionesSociales.primaServicios +
    prestacionesSociales.cesantias +
    prestacionesSociales.interesesCesantias +
    prestacionesSociales.vacaciones
  );

  const aportesEmpleador = Math.round(
    seguridadSocial.saludEmpleador +
    seguridadSocial.pensionEmpleador +
    seguridadSocial.riesgosLaborales +
    seguridadSocial.sena +
    seguridadSocial.icbf +
    seguridadSocial.cajaCompensacion
  );

  const aportesTrabajador = 
    seguridadSocial.saludTrabajador +
    seguridadSocial.pensionTrabajador +
    seguridadSocial.FSP;

  const pagoNetoTrabajador = 
    salario +
    otrosPagosSalariales +
    otrosPagosNoSalariales +
    auxilioTransporte -
    aportesTrabajador -
    retencionFuente -
    deducciones;

  const costoTotalEmpleador =
    salario +
    otrosPagosSalariales +
    otrosPagosNoSalariales +
    auxilioTransporte +
    provisionesPrestacionesSociales +
    aportesEmpleador;

  const totalPagar = costoTotalEmpleador - provisionesPrestacionesSociales;
  
  return {
    provisionesPrestacionesSociales,
    aportesEmpleador,
    aportesTrabajador,
    retencionFuente,
    pagoNetoTrabajador,
    costoTotalEmpleador,
    totalPagar,
    deducciones,
    auxilioTransporte
  };
}

function calcularRetencionFuente2025({totalPagos, ingresosNoConstitutivos, deducciones}) {
  // Valor UVT para 2025
  const UVT = constants.UVT;

  // Subtotal 
  const subtotal = totalPagos - ingresosNoConstitutivos - deducciones;

  // Renta exenta del 25% con tope de 790 UVT (anual)
  const rentaExenta25 = Math.min(subtotal * 0.25, (UVT * 790) / 12);
  
  // Base gravable
  const baseGravable = subtotal - rentaExenta25;
  
  // Si no hay base gravable no hay retefuente
  if (baseGravable <= 0) return 0;

  // Convertir base gravable a UVT
  const baseUVT = baseGravable / UVT;    
  
  let retencionUVT = 0;
  
  if (baseUVT <= 95) {
    retencionUVT = 0;
  } else if (baseUVT <= 150) {
    retencionUVT = (baseUVT - 95) * 0.19;
  } else if (baseUVT <= 360) {
    retencionUVT = ((baseUVT - 150) * 0.28) + 10;
  } else if (baseUVT <= 640) {
    retencionUVT = ((baseUVT - 360) * 0.33) + 69;
  } else if (baseUVT <= 945) {
    retencionUVT = ((baseUVT - 640) * 0.35) + 162;
  } else if (baseUVT <= 2300) {
    retencionUVT = ((baseUVT - 945) * 0.37) + 268;
  } else {
    retencionUVT = ((baseUVT - 2300) * 0.39) + 770;
  }    

  // Calcular en pesos y redondear al múltiplo de 1000 más cercano
  const retencionPesos = retencionUVT * UVT;
  const retencionRedondeada = Math.round(retencionPesos / 1000) * 1000;

  return retencionRedondeada;
}

module.exports = {
  calculateSalaryDetails,
  calcularRetencionFuente2025
};