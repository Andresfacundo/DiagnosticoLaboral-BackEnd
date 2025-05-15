
const constants = {
    salarioMinimo: 1423500,
    auxilioDeTransporte: 200000
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
    auxilioDeTransporte
  }) => {
    
    const auxilioTransporte =   auxilioDeTransporte === "Si" && salario + otrosPagosSalariales <= (constants.salarioMinimo * 2)
    ? constants.auxilioDeTransporte 
    : 0;
    const totalIngresos = salario + auxilioTransporte + otrosPagosSalariales + otrosPagosNoSalariales;

    const totalRemuneracion = calculateTotalRemuneracion(tipoSalario, salario, otrosPagosSalariales, otrosPagosNoSalariales, );
    const cuarentaPorciento = totalRemuneracion * 0.4;
    const excedente = calculateExcedente(otrosPagosNoSalariales, cuarentaPorciento);
    const ibc = calculateIBC(tipoSalario, salario, otrosPagosSalariales, excedente);
    const aportesSena = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.02 : 0) : (exonerado == 'No' ? 0.02 : 0);
    const aportesIcbf = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.03 : 0) : (exonerado == 'No' ? 0.03 : 0);
    const tasaSaludEmpleador = exonerado == 'Si' ? (ibc >= constants.salarioMinimo * 10 ? 0.085 : 0) : (exonerado == 'No' ? 0.085 : 0);
    const seguridadSocial = calculateSeguridadSocial(ibc, salario, otrosPagosSalariales, pensionado,excedente,tasaSaludEmpleador,aportesSena,aportesIcbf,claseRiesgo);
    const prestacionesSociales = calculatePrestacionesSociales(tipoSalario, salario, otrosPagosSalariales, auxilioTransporte);
    const proyecciones = calculateProyecciones(seguridadSocial, prestacionesSociales, salario, otrosPagosSalariales, otrosPagosNoSalariales, auxilioTransporte,deducciones,retencionFuente);
    return {
        totalRemuneracion,
        cuarentaPorciento,
        seguridadSocial,
        prestacionesSociales,
        proyecciones,
      calculations : {
        totalIngresos,
        tipoSalario,
        salario,
        otrosPagosSalariales,
        otrosPagosNoSalariales,
        pensionado,
        deducciones ,
        retencionFuente,
        exonerado,
        claseRiesgo,
        auxilioDeTransporte

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
  
  function calculateSeguridadSocial(ibc, salario, otrosPagosSalariales, pensionado,excedente,tasaSaludEmpleador, aportesSena,aportesIcbf,claseRiesgo) {
    const diezSMLMV = constants.salarioMinimo * 10;
    const porcentajeFSP = calculateFSPPercentage(ibc);

    const riesgoLaboralPorcentaje = getRiesgoLaboralPorcentaje(claseRiesgo);
  
   const seguridadSocial = roundValues({
      saludTrabajador: ibc * 0.04,
      excedente,
      ibc,
      // saludEmpleador: Math.round(salario + otrosPagosSalariales >= diezSMLMV ? 0.085 * ibc : 0) * tasaSaludEmpleador
      saludEmpleador: ibc * tasaSaludEmpleador,
      pensionTrabajador: pensionado === 'No' ? ibc * 0.04 : 0,
      pensionEmpleador: pensionado === 'No' ? ibc * 0.12 : 0,
      FSP: pensionado === 'No' ? ibc * porcentajeFSP : 0,
      riesgosLaborales: Math.ceil(ibc * riesgoLaboralPorcentaje),
      
      // sena: (salario + otrosPagosSalariales) >= diezSMLMV ? (salario + otrosPagosSalariales) * 0.02 : 0,
      sena: (ibc * aportesSena),
      // icbf: (salario + otrosPagosSalariales) >= diezSMLMV ? (salario + otrosPagosSalariales) * 0.03 : 0,
      icbf: (ibc * aportesIcbf),
      // cajaCompensacion: (salario + otrosPagosSalariales) * 0.04
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
    seguridadSocial.pensionTrabajador ;
 

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
      return 0.06960 ;    
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
  
  function calculateProyecciones(seguridadSocial, prestacionesSociales, salario, otrosPagosSalariales, otrosPagosNoSalariales, auxilioTransporte,deducciones, retencionFuente) {
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
  
    // const aportesTrabajador = 
    //   seguridadSocial.saludTrabajador +
    //   seguridadSocial.pensionTrabajador +
    //   seguridadSocial.FSP;

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
  
    // const totalPagar = pagoNetoTrabajador + aportesTrabajador + aportesEmpleador;
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
      retencionFuente,
      auxilioTransporte
    };
  }
  
  module.exports = {
    calculateSalaryDetails
  };