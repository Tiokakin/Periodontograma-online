// --- CONFIGURACIÓN DE LA SUITE DENTAL ---
const APP_NAME = "OdontoVoice_Pro";
const piezas = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

// --- ELEMENTOS DEL DOM ---
const odontogramaGrid = document.getElementById('odontograma-grid');
const feedback = document.getElementById('feedback');
const btnVoz = document.getElementById('btn-voz');
const listaHistorial = document.getElementById('lista-historial');

// --- 1. INICIALIZACIÓN Y LECTURA DE SESIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    
    if (sesion) {
        document.getElementById('nombre-paciente').innerText = sesion.paciente;
        document.getElementById('id-sesion').innerText = `Sesión: #${sesion.id_sesion}`;
        document.getElementById('user-pill').classList.remove('hidden');
    } else {
        alert("Atención: No hay una sesión activa de paciente. Los datos no se guardarán correctamente.");
    }
    
    initOdontograma();
    cargarHistorialPrevio();
});

// --- 2. GENERACIÓN DE INTERFAZ ---
function initOdontograma() {
    odontogramaGrid.innerHTML = '';
    piezas.forEach(num => {
        const div = document.createElement('div');
        div.className = `diente-card p-2 border border-slate-200 rounded-lg text-center bg-white hover:border-indigo-300 transition-colors cursor-pointer group`;
        div.id = `diente-${num}`;
        div.innerHTML = `
            <span class="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500">${num}</span>
            <div class="w-full h-8 bg-slate-100 rounded mt-1 corona-visual"></div>
        `;
        odontogramaGrid.appendChild(div);
    });
}

// --- 3. RECONOCIMIENTO DE VOZ ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-CL';
recognition.continuous = false;

btnVoz.onclick = () => {
    recognition.start();
    btnVoz.classList.add('ring-4', 'ring-indigo-100');
    feedback.innerText = "Escuchando...";
};

recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript.toLowerCase();
    feedback.innerText = `Interpretado: "${texto}"`;
    procesarHallazgo(texto);
    btnVoz.classList.remove('ring-4', 'ring-indigo-100');
};

// --- 4. PERSISTENCIA EN HISTORIAL CLÍNICO ---
function procesarHallazgo(comando) {
    const numDiente = comando.match(/\d+/);
    let detalle = "";
    let colorClass = "";

    if (comando.includes("caries")) { detalle = "Caries dental"; colorClass = "bg-red-500"; }
    else if (comando.includes("ausente")) { detalle = "Pieza ausente"; colorClass = "bg-slate-800"; }
    else if (comando.includes("resina") || comando.includes("obturado")) { detalle = "Restauración resina"; colorClass = "bg-blue-400"; }

    if (numDiente && detalle) {
        const n = numDiente[0];
        actualizarUI(n, colorClass);
        guardarEnHistorialCentral(n, detalle);
    }
}

function actualizarUI(id, color) {
    const corona = document.querySelector(`#diente-${id} .corona-visual`);
    if (corona) {
        corona.className = `w-full h-8 rounded mt-1 corona-visual ${color}`;
    }
}

function guardarEnHistorialCentral(diente, detalle) {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica')) || { paciente: "Anónimo" };
    
    // Crear el objeto según tu especificación
    const nuevoRegistro = {
        paciente: sesion.paciente,
        diente: diente,
        detalle: detalle,
        fecha: new Date().toLocaleString(),
        tipo_app: APP_NAME
    };

    // Obtener array actual, añadir y guardar
    let historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
    historial.unshift(nuevoRegistro);
    localStorage.setItem('HistorialClinico', JSON.stringify(historial));

    renderizarFila(nuevoRegistro);
}

function renderizarFila(reg) {
    const li = document.createElement('li');
    li.className = "px-6 py-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors";
    li.innerHTML = `
        <div>
            <p class="text-sm font-bold text-slate-700">Pieza ${reg.diente}: <span class="text-indigo-600 font-normal">${reg.detalle}</span></p>
            <p class="text-[10px] text-slate-400">${reg.fecha}</p>
        </div>
        <span class="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">${reg.tipo_app}</span>
    `;
    listaHistorial.prepend(li);
    document.getElementById('count-registros').innerText = `${listaHistorial.children.length} registros`;
}

function cargarHistorialPrevio() {
    const historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
    // Filtrar solo los de esta app para la lista visual si se desea, o mostrar todos
    historial.reverse().forEach(reg => renderizarFila(reg));
}
