document.addEventListener('DOMContentLoaded', () => {

    // --- ANCLA: CONFIGURACIÓN SUITE DENTAL ---
    const TIPO_APP = 'Periodontograma_Voz';
    let sesionActiva = { operador: 'Desconocido', paciente: 'Paciente Genérico' };

    const cargarSesion = () => {
        const datos = localStorage.getItem('SesionClinica');
        if (datos) {
            sesionActiva = JSON.parse(datos);
            document.getElementById('nombre-paciente-display').innerText = sesionActiva.paciente;
            document.getElementById('operador-display').innerText = `Dr. ${sesionActiva.operador}`;
            document.getElementById('banner-paciente').classList.remove('hidden');
        }
    };

    const actualizarHistorialCentral = (diente, detalle) => {
        let historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
        const nuevoRegistro = {
            paciente: sesionActiva.paciente,
            diente: diente,
            detalle: detalle,
            fecha: new Date().toLocaleString(),
            tipo_app: TIPO_APP,
            id_sesion: sesionActiva.id_sesion || 0
        };
        historial.push(nuevoRegistro);
        localStorage.setItem('HistorialClinico', JSON.stringify(historial));
    };

    // --- ANCLA: VARIABLES DE INTERFAZ ---
    const btnVoz = document.getElementById('btn-voz');
    const btnGuardar = document.getElementById('btn-guardar');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');
    const listaHistorial = document.getElementById('lista-historial');

    const secuenciaDientes = ["1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"];
    let indiceActual = 0;

    // --- ANCLA: LÓGICA DE VOZ (Tolerante) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'es-CL';
        recognition.continuous = true;
        btnVoz.onclick = () => { try { recognition.start(); } catch (e) { recognition.stop(); } };

        recognition.onstart = () => { 
            status.innerText = "🎤 Escuchando..."; 
            btnVoz.classList.replace('bg-indigo-600', 'bg-red-600');
        };
        recognition.onend = () => { 
            btnVoz.classList.replace('bg-red-600', 'bg-indigo-600');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            procesarComandos(transcript);
        };
    }

    function procesarComandos(texto) {
        // Tolerancia fonética: Palatino, Latino, Platino, Lingual...
        let cara = texto.includes("vestibular") ? "v" : (/(palatino|latino|platino|lingual)/.test(texto) ? "p" : null);
        
        if (cara) {
            const numeros = texto.match(/\d/g);
            if (numeros && numeros.length >= 6) {
                asignarValores(cara, 'd', numeros[0], numeros[3]);
                asignarValores(cara, 'm', numeros[1], numeros[4]);
                asignarValores(cara, 'mes', numeros[2], numeros[5]);
                actualizarGrafico(cara);
                if (cara === 'p') setTimeout(ejecutarGuardado, 1500);
            }
        }
    }

    // --- ANCLA: TABLA Y GRAFICO ---
    function asignarValores(c, p, nic, ps) {
        document.getElementById(`${c}-${p}-nic`).value = nic;
        document.getElementById(`${c}-${p}-ps`).value = ps;
        document.getElementById(`${c}-${p}-rec`).innerText = parseInt(nic) - parseInt(ps);
    }

    function actualizarGrafico(cara) {
        const pts = ['d', 'm', 'mes'];
        let cR = "", cP = "";
        pts.forEach((p, i) => {
            const x = 50 + (i * 100);
            const ps = parseInt(document.getElementById(`${cara}-${p}-ps`).value) || 0;
            const rec = parseInt(document.getElementById(`${cara}-${p}-rec`).innerText) || 0;
            const yR = 85 + (rec * 7);
            const yP = yR + (ps * 7);
            cR += `${x},${yR} `; cP += `${x},${yP} `;
        });
        document.getElementById('linea-recesion').setAttribute('points', cR);
        document.getElementById('linea-sondaje').setAttribute('points', cP);
    }
// --- ANCLA: INTEGRACION GLOBAL (Generador de Reportes) ---
function registrarEnHistorial(diente, hallazgo) {
    try {
        // 1. Leer el historial existente o crear uno nuevo
        let historialGlobal = JSON.parse(localStorage.getItem('HistorialClinico')) || [];

        // 2. Crear el objeto con la estructura solicitada
        const nuevoHallazgo = {
            tipo_app: 'Periodoncia_Pro', // Identificador único para el generador
            diente: diente,
            detalle: hallazgo,
            fecha: new Date().toLocaleString()
        };

        // 3. Empujar y guardar
        historialGlobal.push(nuevoHallazgo);
        localStorage.setItem('HistorialClinico', JSON.stringify(historialGlobal));
        
        console.log(`✅ Hallazgo del diente ${diente} sincronizado con el Portal Global.`);
    } catch (error) {
        console.error("Error al sincronizar con el Historial Global:", error);
    }
}
    // --- ANCLA: GUARDADO (Actualizado para Integración Global) ---
function ejecutarGuardado() {
    const diente = secuenciaDientes[indiceActual];
    
    // Formateamos el "hallazgo" para que sea legible en el reporte global
    // Ejemplo: "PS V[3-2-3] P[2-2-4] | SS: Distal"
    const v_ps = [document.getElementById('v-d-ps').value, document.getElementById('v-m-ps').value, document.getElementById('v-mes-ps').value].join('-');
    const p_ps = [document.getElementById('p-d-ps').value, document.getElementById('p-m-ps').value, document.getElementById('p-mes-ps').value].join('-');
    
    const resumenHallazgo = `PS Vest[${v_ps}] Palat[${p_ps}]`;

    // 1. REGISTRO SILENCIOSO PARA EL PORTAL GLOBAL
    registrarEnHistorial(diente, resumenHallazgo);

    // 2. Lógica interna de la App (Memoria local para el PDF propio)
    memoriaExamen.push({ diente, detalle: resumenHallazgo });
    
    // Actualización de la interfaz (Lista visual)
    if (memoriaExamen.length === 1) listaHistorial.innerHTML = "";
    const badge = document.createElement('div');
    badge.className = "bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold py-2 px-3 rounded-lg text-center shadow-sm";
    badge.innerText = `Diente ${diente} ✅`;
    listaHistorial.prepend(badge);

    // Salto al siguiente diente
    indiceActual++;
    if (indiceActual < secuenciaDientes.length) {
        dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
        actualizarSiluetaDiente(secuenciaDientes[indiceActual]);
        limpiarCampos();
    } else {
        status.innerText = "🏁 Examen Periodontal Finalizado";
        alert("Has completado el registro de todos los dientes.");
    }
}

    function limpiarCampos() {
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
        document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
    }

    // Inicializar al cargar
    cargarSesion();
});

