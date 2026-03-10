// Al cargar la app de Odontograma
window.addEventListener('load', () => {
    const datos = JSON.parse(localStorage.getItem('SesionClinica'));
    if (datos) {
        // Puedes crear un banner superior que diga el nombre del paciente
        console.log("Odontograma listo para: " + datos.paciente);
    }
});
const odontogramaGrid = document.getElementById('odontograma-grid');
const btnVoz = document.getElementById('btn-voz');
const feedback = document.getElementById('feedback');
const listaVersiones = document.getElementById('lista-versiones');

// Estado inicial del Odontograma
let estadoDientes = {};

// 1. Generar Odontograma (32 piezas estándar)
const piezas = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

function initOdontograma() {
    odontogramaGrid.innerHTML = '';
    piezas.forEach(num => {
        const div = document.createElement('div');
        div.id = `diente-${num}`;
        div.className = 'diente';
        div.innerHTML = `<span>${num}</span><div class="corona"></div>`;
        odontogramaGrid.appendChild(div);
        estadoDientes[num] = "sano";
    });
}

// 2. Reconocimiento de Voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-CL';

btnVoz.onclick = () => {
    recognition.start();
    feedback.innerText = "Escuchando pieza y hallazgo...";
    document.getElementById('indicador').classList.add('recording');
};

recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript.toLowerCase();
    feedback.innerText = `Registrado: "${texto}"`;
    document.getElementById('indicador').classList.remove('recording');
    procesarComando(texto);
};

function procesarComando(comando) {
    const num = comando.match(/\d+/);
    if (num && piezas.includes(parseInt(num[0]))) {
        const n = num[0];
        let estado = "";
        
        if (comando.includes("caries")) estado = "caries";
        if (comando.includes("ausente") || comando.includes("perdida")) estado = "ausente";
        if (comando.includes("obturado") || comando.includes("resina")) estado = "obturado";
        
        if (estado) {
            estadoDientes[n] = estado;
            const el = document.getElementById(`diente-${n}`);
            el.className = `diente estado-${estado}`;
        }
    }
}

// 3. Gestión de Versiones y Sincronización
function guardarVersion() {
    const nuevaVersion = {
        fecha: new Date().toLocaleString(),
        datos: { ...estadoDientes }
    };
    
    let historial = JSON.parse(localStorage.getItem('versiones_odontograma')) || [];
    historial.unshift(nuevaVersion); // Agregar al inicio
    localStorage.setItem('versiones_odontograma', JSON.stringify(historial));
    renderVersiones();
}

function renderVersiones() {
    const historial = JSON.parse(localStorage.getItem('versiones_odontograma')) || [];
    listaVersiones.innerHTML = historial.map((v, i) => 
        `<li><strong>V${historial.length - i}:</strong> ${v.fecha}</li>`
    ).join('');
}

document.getElementById('btn-guardar').onclick = guardarVersion;

// Iniciar app
initOdontograma();
renderVersiones();
