const { Constants } = require('../models');

let memoryConstants = null;

async function loadConstantsFromDB() {
  await Constants.sync({ alter: true });
  let constants = await Constants.findOne();
  if (!constants) {
    constants = await Constants.create({});
  }
  memoryConstants = {
    salarioMinimo: constants.salarioMinimo,
    auxilioDeTransporte: constants.auxilioDeTransporte,
    UVT: constants.UVT
  };
}

const getConstants = () => memoryConstants;

const updateConstants = async ({ salarioMinimo, auxilioDeTransporte, UVT }) => {
  let constants = await Constants.findOne();
  if (!constants) {
    constants = await Constants.create({});
  }
  if (salarioMinimo) constants.salarioMinimo = salarioMinimo;
  if (auxilioDeTransporte) constants.auxilioDeTransporte = auxilioDeTransporte;
  if (UVT) constants.UVT = UVT;
  await constants.save();
  memoryConstants = {
    salarioMinimo: constants.salarioMinimo,
    auxilioDeTransporte: constants.auxilioDeTransporte,
    UVT: constants.UVT
  };
  return memoryConstants;
};

loadConstantsFromDB();

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
  const salarioIntegral = tipoSalario === 'Integral' ? salario * 0.7 : salario;
  const auxilioTransporte = auxilioDeTransporte === "Si" && salario + otrosPagosSalariales <= (memoryConstants.salarioMinimo * 2)
    ? memoryConstants.auxilioDeTransporte
    : 0;
  const totalIngresos = salario + auxilioTransporte + otrosPagosSalariales + otrosPagosNoSalariales;

  const totalRemuneracion = calculateTotalRemuneracion(tipoSalario, salario, otrosPagosSalariales, otrosPagosNoSalariales);
  const cuarentaPorciento = totalRemuneracion * 0.4;
  const excedente = calculateExcedente(otrosPagosNoSalariales, cuarentaPorciento);
  const ibcGeneral = calculateIBCGeneral(tipoSalario, salario, otrosPagosSalariales, excedente);
  const ibcParafiscales = calculateIBCParafiscales(tipoSalario, salario, otrosPagosSalariales);
  const aportesSena = exonerado == 'Si' ? (ibcParafiscales >= memoryConstants.salarioMinimo * 10 ? 0 : 0) : (exonerado == 'No' ? 0.02 : 0);
  const aportesIcbf = exonerado == 'Si' ? (ibcParafiscales >= memoryConstants.salarioMinimo * 10 ? 0 : 0) : (exonerado == 'No' ? 0.03 : 0);
  const tasaSaludEmpleador = exonerado == 'Si' ? (ibcGeneral >= memoryConstants.salarioMinimo * 10 ? 0 : 0) : (exonerado == 'No' ? 0.085 : 0);

  const seguridadSocial = calculateSeguridadSocial(
    ibcGeneral,
    ibcParafiscales,
    salario,
    otrosPagosSalariales,
    pensionado,
    excedente,
    tasaSaludEmpleador,
    aportesSena,
    aportesIcbf,
    claseRiesgo
  );

  const prestacionesSociales = calculatePrestacionesSociales(tipoSalario, salario, otrosPagosSalariales, auxilioTransporte);
  const ingresosNoConstitutivosCalculados = seguridadSocial.pensionTrabajador + seguridadSocial.FSP + seguridadSocial.saludTrabajador + ingresosNoConstitutivos;

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
      salarioIntegral,
      otrosPagosSalariales,
      otrosPagosNoSalariales,
      pensionado,
      deducciones,
      retencionFuente: retencionCalculada,
      exonerado,
      claseRiesgo,
      auxilioDeTransporte,
      ingresosNoConstitutivos: ingresosNoConstitutivosCalculados
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

function calculateIBCGeneral(tipoSalario, salario, otrosPagosSalariales, excedente) {
  if (tipoSalario === 'Ordinario') {
    return salario + otrosPagosSalariales + excedente;
  } else if (tipoSalario === 'Integral') {
    return ((salario + otrosPagosSalariales) * 0.7) + excedente;
  } else if (tipoSalario === 'Medio tiempo') {
    return memoryConstants.salarioMinimo;
  }
  return 0;
}

function calculateIBCParafiscales(tipoSalario, salario, otrosPagosSalariales) {
  if (tipoSalario === 'Ordinario') {
    return salario + otrosPagosSalariales;
  } else if (tipoSalario === 'Integral') {
    return (salario + otrosPagosSalariales) * 0.7;
  } else if (tipoSalario === 'Medio tiempo') {
    return memoryConstants.salarioMinimo;
  }
  return 0;
}

function calculateFSPPercentage(ibc) {
  const ratio = ibc / memoryConstants.salarioMinimo;
  if (ratio >= 4 && ratio < 16) return 0.01;
  if (ratio >= 16 && ratio <= 17) return 0.012;
  if (ratio > 17 && ratio <= 18) return 0.014;
  if (ratio > 18 && ratio <= 19) return 0.016;
  if (ratio > 19 && ratio <= 20) return 0.018;
  if (ratio > 20) return 0.02;
  return 0;
}

function calculateSeguridadSocial(ibcGeneral, ibcParafiscales, salario, otrosPagosSalariales, pensionado, excedente, tasaSaludEmpleador, aportesSena, aportesIcbf, claseRiesgo) {
  const porcentajeFSP = calculateFSPPercentage(ibcGeneral);
  const riesgoLaboralPorcentaje = getRiesgoLaboralPorcentaje(claseRiesgo);

  const seguridadSocial = roundValues({
    saludTrabajador: ibcGeneral * 0.04,
    excedente,
    ibcGeneral,
    ibcParafiscales,
    saludEmpleador: ibcGeneral * tasaSaludEmpleador,
    pensionTrabajador: pensionado === 'No' ? ibcGeneral * 0.04 : 0,
    pensionEmpleador: pensionado === 'No' ? ibcGeneral * 0.12 : 0,
    FSP: pensionado === 'No' ? ibcGeneral * porcentajeFSP : 0,
    riesgosLaborales: Math.ceil(ibcGeneral * riesgoLaboralPorcentaje),
    sena: ibcParafiscales * aportesSena,
    icbf: ibcParafiscales * aportesIcbf,
    cajaCompensacion: ibcParafiscales * 0.04
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
    case '1': return 0.00522;
    case '2': return 0.01044;
    case '3': return 0.02436;
    case '4': return 0.04350;
    case '5': return 0.06960;
    default: return 0.00522;
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
  }

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

function calcularRetencionFuente2025({ totalPagos, ingresosNoConstitutivos, deducciones }) {
  const UVT = memoryConstants.UVT;
  const subtotal = totalPagos - ingresosNoConstitutivos - deducciones;
  const rentaExenta25 = Math.min(subtotal * 0.25, UVT * 790);
  const baseGravable = subtotal - rentaExenta25;

  if (baseGravable <= 0) return 0;

  const baseUVT = baseGravable / UVT;
  let retencionUVT = 0;

  if (baseUVT <= 95) retencionUVT = 0;
  else if (baseUVT <= 150) retencionUVT = (baseUVT - 95) * 0.19;
  else if (baseUVT <= 360) retencionUVT = ((baseUVT - 150) * 0.28) + 10;
  else if (baseUVT <= 640) retencionUVT = ((baseUVT - 360) * 0.33) + 69;
  else if (baseUVT <= 945) retencionUVT = ((baseUVT - 640) * 0.35) + 162;
  else if (baseUVT <= 2300) retencionUVT = ((baseUVT - 945) * 0.37) + 268;
  else retencionUVT = ((baseUVT - 2300) * 0.39) + 770;

  const retencionPesos = retencionUVT * UVT;
  return Math.round(retencionPesos / 1000) * 1000;
}

module.exports = {
  calculateSalaryDetails,
  calcularRetencionFuente2025,
  getConstants,
  updateConstants,
};
