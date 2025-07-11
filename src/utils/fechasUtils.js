const XLSX = require('xlsx');

const parseFechaExcel = (valor) => {
    if (!valor) return null;

    if (typeof valor === 'number') {
        const fecha = XLSX.SSF.parse_date_code(valor);
        if (fecha) {
            return new Date(fecha.y, fecha.m - 1, fecha.d); // meses en js 0 a 11
        }
    }

    if (typeof valor === 'string') {
        const partes = valor.includes('/') ? valor.split('/') : valor.split('-');
        if (partes.length === 3) {
            const [d, m, y] = valor.includes('/') ? partes : [partes[2], partes[1], partes[0]];
            return new Date(+y, +m - 1, +d);
        }
    }

    return null;
};
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    if (isNaN(nacimiento.getTime())) return null;

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();
    const mesNacimiento = nacimiento.getMonth();
    const diaNacimiento = nacimiento.getDate();
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
        edad--;
    }

    return edad;
};

const calcularAntiguedad = (fechaContratacion, fechaRetiro, status) => {
    if (!fechaContratacion || !status) return null;

    const inicio = new Date(fechaContratacion);
    if (isNaN(inicio.getTime())) return null;

    let fin;

    if (status === 'Activo') {
        fin = new Date();
    } else if (status === 'Inactivo' && fechaRetiro) {
        fin = new Date(fechaRetiro);
    } else {
        return null;
    }

    const diferenciaMs = fin - inicio;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias;
};

module.exports = {
    parseFechaExcel,
    calcularEdad,
    calcularAntiguedad,
};