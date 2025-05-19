const calculatorService = require('../services/calculatorService');

const calculateSalary = (req, res) => {
  const {
    tipoSalario,
    salario,
    otrosPagosSalariales,
    otrosPagosNoSalariales,
    pensionado,
    deducciones,
    retencionFuente,
    exonerado,
    claseRiesgo,
    auxilioDeTransporte,
    calcularRetencion,
    ingresosNoConstitutivos
  } = req.body;

  const result = calculatorService.calculateSalaryDetails({
    tipoSalario,
    salario,
    otrosPagosSalariales,
    otrosPagosNoSalariales,
    pensionado,
    deducciones,
    retencionFuente,
    exonerado,
    claseRiesgo,
    auxilioDeTransporte,
    calcularRetencion,
    ingresosNoConstitutivos
  });

  res.json(result);
};

const calcularRetencion = (req, res) => {
  const { totalPagos, ingresosNoConstitutivos, deducciones } = req.body;

  const retencion = calculatorService.calcularRetencionFuente2025({
    totalPagos,
    ingresosNoConstitutivos,
    deducciones
  });

  res.json({ retencion });
};

module.exports = {
  calculateSalary,
  calcularRetencion
};