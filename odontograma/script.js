// Configuración de reconocimiento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-CL'; // Español de Chile
recognition.continuous = false;

const btnDictar = document.getElementById('btn-dictar');
const status = document.getElementById('status');
const listaVersiones = document.getElementById('lista-versiones');

// Estructura de datos del Odontograma
let odontogramaActual = {
    fecha: new Date().toLocaleString(),
    hallazgos: {} // Ejemplo: { "18": "caries", "21": "ausente" }
};

btnDictar.onclick = () => {
    recognition.start();
    status.innerText = "Estado: Escuchando...";
};

recognition.onresult = (event) => {
    const voz = event.results[0][0].transcript.toLowerCase();
    document.getElementById('transcripcion').innerText = `Dijo: "${voz}"`;
    procesarComando(voz);
};

function procesarComando(texto) {
    // Ejemplo de comando: "pieza 18 caries"
    const numeroDiente = texto.match(/\d+/); // Extrae el número
    if (numeroDiente) {
        const d = numeroDiente[0];
        if (texto.includes("caries")) {
            actualizarDiente(d, "caries");
        } else if (texto.includes("ausente")) {
            actualizarDiente(d, "ausente");
        } else if (texto.includes("sano")) {
            actualizarDiente(d, "sano");
        }
    }
    status.innerText = "Estado: Procesado.";
}

function actualizarDiente(id, estado) {
    odontogramaActual.hallazgos[id] = estado;
    console.log(`Diente ${id} actualizado a ${estado}`);
    // Aquí podrías cambiar el color del SVG del diente
}

// --- GESTIÓN DE VERSIONES ---
function guardarVersion() {
    let historial = JSON.parse(localStorage.getItem('historial_odontogramas')) || [];
    odontogramaActual.fecha = new Date().toLocaleString();
    historial.push({...odontogramaActual});
    localStorage.setItem('historial_odontogramas', JSON.stringify(historial));
    renderizarVersiones();
}

function renderizarVersiones() {
    const historial = JSON.parse(localStorage.getItem('historial_odontogramas')) || [];
    listaVersiones.innerHTML = historial.map((v, index) => 
        `<li>Versión ${index + 1}: ${v.fecha} - (${Object.keys(v.hallazgos).length} hallazgos)</li>`
    ).join('');
}

document.getElementById('btn-guardar').onclick = guardarVersion;
window.onload = renderizarVersiones;
