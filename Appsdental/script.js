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

    // --- ANCLA: GUARDADO CENTRALIZADO ---
    btnGuardar.onclick = ejecutarGuardado;

    function ejecutarGuardado() {
        const diente = secuenciaDientes[indiceActual];
        const detalle = `PS Vest[${document.getElementById('v-d-ps').value}-${document.getElementById('v-m-ps').value}-${document.getElementById('v-mes-ps').value}]`;
        
        // GUARDAR EN HISTORIAL CENTRAL (localStorage)
        actualizarHistorialCentral(diente, detalle);

        // Actualizar UI Local
        const badge = document.createElement('div');
        badge.className = "bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold py-2 px-3 rounded-lg text-center animate-pulse";
        badge.innerText = `Diente ${diente}`;
        listaHistorial.prepend(badge);

        // Siguiente diente
        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            limpiarCampos();
        }
    }

    function limpiarCampos() {
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
        document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
    }

    // Inicializar al cargar
    cargarSesion();
});
