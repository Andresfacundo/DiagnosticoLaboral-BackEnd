function procesarDatos  (respuestas, preguntas) {
    const respuestasConDetalles = respuestas.map(respuesta => {
        const pregunta = preguntas.find(p => p.id === respuesta.id);
        return { ...respuesta, pregunta };
    });

    const categoriasUnicas = [...new Set(preguntas.map(p => p.categoria))];
    const categoriasAnalizadas = {};
    const puntajePorCategoria = [];

    categoriasUnicas.forEach(categoria => {
        const respuestasCat = respuestasConDetalles.filter(r => r.pregunta && r.pregunta.categoria === categoria);

        const conteo = {
            Si: 0,
            No: 0,
            NA: 0,
            Parcialmente: 0 
        };

        let puntajeObtenido = 0;
        let puntajePosible = 0;
        const preguntasCategoria = [];

        respuestasCat.forEach(r => {
            if (r.respuesta === "Sí" || r.respuesta === "Si") {
                conteo.Si++;
                puntajeObtenido += r.pregunta.respuestas?.Si || r.pregunta.peso;
            } else if (r.respuesta === "No") {
                conteo.No++;
                puntajeObtenido += r.pregunta.respuestas?.No || 0;
            } else if (r.respuesta === "No aplica") {
                conteo.NA++;
                puntajeObtenido += r.pregunta.respuestas?.["No aplica"] || 0;
            } else if (r.respuesta === "Parcialmente") {
                conteo.Parcialmente++;
                puntajeObtenido += (r.pregunta.respuestas?.Parcialmente || r.pregunta.peso * 0.5); 
            }

            puntajePosible += r.pregunta.respuestas?.Si || r.pregunta.peso;

            preguntasCategoria.push({
                id: r.pregunta.id,
                texto: r.pregunta.texto,
                respuesta: r.respuesta,
                comentario: r.comentario || "",
                valorRespuesta: r.respuesta === "Sí" || r.respuesta === "Si"
                    ? (r.pregunta.respuestas?.Si || r.pregunta.peso)
                    : (r.pregunta.respuestas?.[r.respuesta] || 0),
                pesoTotal: r.pregunta.respuestas?.Si || r.pregunta.peso,
                cumplimiento: r.respuesta === "Sí" || r.respuesta === "Si" ? 100 : r.respuesta === "Parcialmente" ? 50 : 0                            
            });
        });

        const porcentajeCumplimiento = puntajePosible > 0
            ? (puntajeObtenido / puntajePosible) * 100
            : 0;

        categoriasAnalizadas[categoria] = {
            total: puntajePosible,
            cumplimiento: puntajeObtenido,
            porcentaje: porcentajeCumplimiento,
            preguntas: preguntasCategoria,
            conteo: conteo
        };

        puntajePorCategoria.push({
            name: categoria,
            value: porcentajeCumplimiento,
            puntajeObtenido,
            puntajePosible,
            riesgo: porcentajeCumplimiento < 70
        });
    });

    const totalPreguntas = respuestas.length;
    const cumplimiento = respuestas.filter(r => r.respuesta === "Sí" || r.respuesta === "Si").length;
    const incumplimiento = respuestas.filter(r => r.respuesta === "No").length;
    const noAplica = respuestas.filter(r => r.respuesta === "No aplica").length;
    const parcialmente = respuestas.filter(r => r.respuesta === "Parcialmente").length;

    let puntajeTotal = 0;
    let puntajeMaximo = 0;

    respuestasConDetalles.forEach(r => {
        if (r.pregunta) {
            if (r.respuesta === "Sí" || r.respuesta === "Si") {
                puntajeTotal += r.pregunta.respuestas?.Si || r.pregunta.peso;
            } else if (r.respuesta === "No") {
                puntajeTotal += r.pregunta.respuestas?.No || 0;
            } else if (r.respuesta === "No aplica") {
                puntajeTotal += r.pregunta.respuestas?.["No aplica"] || 0;
            } else if (r.respuesta === "Parcialmente") {
                puntajeTotal += (r.pregunta.respuestas?.Parcialmente || r.pregunta.peso * 0.5);
            }

            puntajeMaximo += r.pregunta.respuestas?.Si || r.pregunta.peso;
        }
    });

    const porcentajeGeneral = puntajeMaximo > 0
        ? (puntajeTotal / puntajeMaximo) * 100
        : 0;

    const areasRiesgo = puntajePorCategoria
        .filter(cat => cat.riesgo)
        .map(cat => cat.name);

    return {
        totalPreguntas,
        cumplimiento,
        incumplimiento,
        noAplica,
        parcialmente,
        puntajeTotal,
        puntajeMaximo,
        porcentajeGeneral,
        areasRiesgo,
        categoriasAnalizadas,
        respuestasDetalladas: respuestasConDetalles
    };
};

module.exports = procesarDatos;