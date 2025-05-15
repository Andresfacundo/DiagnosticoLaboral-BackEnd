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
    auxilioDeTransporte
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
    auxilioDeTransporte
  });

  res.json(result);
};

module.exports = {
  calculateSalary
};