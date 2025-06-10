const procesarDatos = (respuestas, preguntas, categorias = []) => {
    const respuestasConDetalles = respuestas.map(respuesta => {
        const pregunta = preguntas.find(p => p.id === respuesta.id);
        return { ...respuesta, pregunta };
    });

    // Crear un mapa de categorías por ID para fácil acceso
    const categoriaMap = {};
    categorias.forEach(cat => {
        categoriaMap[cat.id] = cat.nombre;
    });

    const categoriasUnicas = [...new Set(preguntas.map(p => p.categoria))];
    const categoriasAnalizadas = {};
    const puntajePorCategoria = [];
    
    function obtenerPesoMaximo(respuestas) {
        if (!respuestas) return 0;
        return Math.max(...Object.values(respuestas).filter(valor => typeof valor === 'number'));
    }

    function calcularCumplimiento(respuesta, respuestas, pesoTotal) {
        if (!respuestas || !pesoTotal) return 0;
        const valor = respuestas[respuesta] || 0;
        return (valor / pesoTotal) * 100;
    }

    function obtenerValorRespuesta(respuesta, pregunta) {
        if (pregunta.respuestas && pregunta.respuestas[respuesta] !== undefined) {
            return pregunta.respuestas[respuesta];
        }
        
        if (respuesta === "Sí" || respuesta === "Si") {
            return pregunta.peso;
        } else if (respuesta === "Parcialmente") {
            return pregunta.peso * 0.5;
        } else {
            return 0;
        }
    }

    categoriasUnicas.forEach(categoria => {
        const respuestasCat = respuestasConDetalles.filter(r => r.pregunta && r.pregunta.categoria === categoria);
        
        // Obtener el nombre de la categoría (puede ser ID o nombre)
        const nombreCategoria = categoriaMap[categoria] || categoria;

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
            } else if (r.respuesta === "No") {
                conteo.No++;
            } else if (r.respuesta === "No aplica") {
                conteo.NA++;
            } else if (r.respuesta === "Parcialmente") {
                conteo.Parcialmente++;
            }
            
            puntajeObtenido += obtenerValorRespuesta(r.respuesta, r.pregunta);
            
            const pesoMax = r.pregunta.peso || obtenerPesoMaximo(r.pregunta.respuestas);
            puntajePosible += pesoMax;

            preguntasCategoria.push({
                id: r.pregunta.id,
                texto: r.pregunta.texto,
                respuesta: r.respuesta,
                comentario: r.comentario || "",
                valorRespuesta: r.pregunta.respuestas?.[r.respuesta] || 0,
                pesoTotal: pesoMax,
                cumplimiento: calcularCumplimiento(r.respuesta, r.pregunta.respuestas, pesoMax)
            });
        });

        const porcentajeCumplimiento = puntajePosible > 0
            ? (puntajeObtenido / puntajePosible) * 100
            : 0;

        // Usar el nombre de la categoría como clave
        categoriasAnalizadas[nombreCategoria] = {
            total: puntajePosible,
            cumplimiento: puntajeObtenido,
            porcentaje: porcentajeCumplimiento,
            preguntas: preguntasCategoria,
            conteo: conteo,
            categoriaId: categoria // Mantener el ID por si se necesita
        };

        puntajePorCategoria.push({
            name: nombreCategoria,
            value: porcentajeCumplimiento,
            puntajeObtenido,
            puntajePosible,
            riesgo: porcentajeCumplimiento < 70,
            categoriaId: categoria
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
            puntajeTotal += obtenerValorRespuesta(r.respuesta, r.pregunta);
        
            const pesoMax = r.pregunta.peso || obtenerPesoMaximo(r.pregunta.respuestas);
            puntajeMaximo += pesoMax;
        }
    });

    const porcentajeGeneral = puntajeMaximo > 0
        ? (puntajeTotal / puntajeMaximo) * 100
        : 0;

    // Convertir áreas de riesgo para usar nombres en lugar de IDs
    const areasRiesgo = puntajePorCategoria
        .filter(cat => cat.riesgo)
        .map(cat => cat.name); // Ya usa el nombre

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