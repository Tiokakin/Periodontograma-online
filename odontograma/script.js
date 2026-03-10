/**
 * [PUNTO DE REFERENCIA 1: CONFIGURACIÓN GLOBAL]
 * Definición de constantes y estados iniciales
 */
const APP_NAME = "Odontograma_Digital";
const piezasDentales = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, // Superiores
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38  // Inferiores
];

/**
 * [PUNTO DE REFERENCIA 2: CARGA DE SESIÓN CLÍNICA]
 * Al iniciar, leemos los datos del paciente desde el portal principal
 */
document.addEventListener('DOMContentLoaded', () => {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    
    if (sesion) {
        document.getElementById('nombre-paciente').innerText = sesion.paciente;
        document.getElementById('id-sesion').innerText = `Sesión: #${sesion.id_sesion}`;
    } else {
        document.getElementById('nombre-paciente').innerText = "Sin Paciente Seleccionado";
        console.warn("No se detectó una SesionClinica activa.");
    }

    generarInterfazOdontograma();
});

/**
 * [PUNTO DE REFERENCIA 3: GENERACIÓN DINÁMICA DE DIENTES]
 * Crea los elementos visuales en el grid de la aplicación
 */
function generarInterfazOdontograma() {
    const grid = document.getElementById('odontograma-grid');
    grid.innerHTML = '';

    piezasDentales.forEach(num => {
        const div = document.createElement('div');
        div.className = "group border border-slate-200 p-2 rounded-lg bg-white text-center hover:border-indigo-400 transition-all cursor-pointer";
        div.id = `pieza-${num}`;
        div.innerHTML = `
            <span class="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">${num}</span>
            <div class="corona-visual w-full h-8 bg-slate-100 rounded-sm mt-1 transition-colors border border-transparent"></div>
        `;
        grid.appendChild(div);
    });
}

/**
 * [PUNTO DE REFERENCIA 4: LÓGICA DE RECONOCIMIENTO DE VOZ]
 * Escucha comandos y los traduce a hallazgos clínicos
 */
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-CL';
recognition.continuous = false;

document.getElementById('btn-voz').onclick = () => {
    recognition.start();
    document.getElementById('feedback').innerText = "Escuchando pieza y hallazgo...";
};

recognition.onresult = (event) => {
    const comando = event.results[0][0].transcript.toLowerCase();
    document.getElementById('feedback').innerText = `Dijiste: "${comando}"`;
    
    interpretarComandoVoz(comando);
};

function interpretarComandoVoz(texto) {
    // Buscamos el número de pieza dental en el texto
    const coincidenciaPieza = texto.match(/\d+/);
    
    if (coincidenciaPieza) {
        const nDiente = parseInt(coincidenciaPieza[0]);
        let hallazgo = "";
        let colorClase = "";

        // Diccionario de hallazgos
        if (texto.includes("caries")) { 
            hallazgo = "Caries dental"; 
            colorClase = "bg-red-500"; 
        } else if (texto.includes("ausente") || texto.includes("faltante")) { 
            hallazgo = "Pieza ausente"; 
            colorClase = "bg-slate-800"; 
        } else if (texto.includes("resina") || texto.includes("obturado")) { 
            hallazgo = "Restauración resina"; 
            colorClase = "bg-blue-400"; 
        } else if (texto.includes("sano") || texto.includes("limpio")) {
            hallazgo = "Sano";
            colorClase = "bg-slate-100";
        }

        if (hallazgo && piezasDentales.includes(nDiente)) {
            actualizarDienteVisual(nDiente, colorClase);
            registrarEnHistorial(nDiente, hallazgo);
        }
    }
}

/**
 * [PUNTO DE REFERENCIA 5: ACTUALIZACIÓN VISUAL]
 * Cambia el color del diente en pantalla
 */
function actualizarDienteVisual(numero, claseColor) {
    const corona = document.querySelector(`#pieza-${numero} .corona-visual`);
    if (corona) {
        // Limpiamos colores anteriores
        corona.className = `corona-visual w-full h-8 rounded-sm mt-1 transition-colors border border-transparent ${claseColor}`;
    }
}

/**
 * [PUNTO DE REFERENCIA 6: INTEGRACIÓN CON REPORTE GLOBAL]
 * Guarda silenciosamente en localStorage para que el Portal Principal lo lea
 */
function registrarEnHistorial(diente, hallazgo) {
    try {
        // 1. Leer historial existente
        let historialGlobal = JSON.parse(localStorage.getItem('HistorialClinico')) || [];

        // 2. Crear objeto de hallazgo con la estructura requerida
        const nuevoHallazgo = {
            tipo_app: APP_NAME,
            diente: diente,
            detalle: hallazgo,
            fecha: new Date().toLocaleString()
        };

        // 3. Guardar en el array global
        historialGlobal.push(nuevoHallazgo);
        localStorage.setItem('HistorialClinico', JSON.stringify(historialGlobal));

        // 4. Actualizar lista visual en la app (Punto de referencia 5 del HTML)
        actualizarListaHistorialLocal(nuevoHallazgo);

        console.log(`[Suite Dental] Sincronizado: Pieza ${diente} - ${hallazgo}`);
    } catch (error) {
        console.error("Error al sincronizar con el Historial Clínico:", error);
    }
}

function actualizarListaHistorialLocal(hallazgo) {
    const lista = document.getElementById('lista-historial');
    const item = document.createElement('li');
    item.className = "px-6 py-2 text-[11px] flex justify-between bg-white border-b border-slate-50";
    item.innerHTML = `
        <span><strong>Piza ${hallazgo.diente}:</strong> ${hallazgo.detalle}</span>
        <span class="text-slate-400 font-mono italic">${hallazgo.fecha.split(',')[1]}</span>
    `;
    lista.prepend(item);
}
