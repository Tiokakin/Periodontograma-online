/**
 * PeriodontoVoice Pro - Versión 0.0201
 * SUITE DENTAL COMPATIBLE
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- ANCLA: VARIABLES GLOBALES ---
    const btnVoz = document.getElementById('btn-voz');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnPdf = document.getElementById('btn-pdf');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');
    const listaHistorial = document.getElementById('lista-historial');

    const secuenciaDientes = ["1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"];
    let indiceActual = 0;
    let memoriaExamen = []; // Almacén interno para el PDF
    let sesionActiva = { operador: 'Francisco Mendez', paciente: 'Paciente Prueba' };

    // --- ANCLA: CARGAR SESION ---
    const cargarSesionPortal = () => {
        const sesion = localStorage.getItem('SesionClinica');
        if (sesion) {
            sesionActiva = JSON.parse(sesion);
            document.getElementById('nombre-paciente-display').innerText = sesionActiva.paciente;
        }
    };

    // --- ANCLA: INTEGRACION GLOBAL (SILENCIOSA) ---
    function registrarEnHistorial(diente, hallazgo) {
        let historialGlobal = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
        historialGlobal.push({
            tipo_app: 'Periodoncia',
            diente: diente,
            detalle: hallazgo,
            fecha: new Date().toLocaleString()
        });
        localStorage.setItem('HistorialClinico', JSON.stringify(historialGlobal));
    }

    // --- ANCLA: VOZ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        status.innerText = "Navegador no compatible con voz.";
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CL';
        recognition.continuous = true;

        btnVoz.onclick = () => {
            try { recognition.start(); } catch (e) { recognition.stop(); }
        };

        recognition.onstart = () => {
            status.innerText = "🎤 Escuchando...";
            btnVoz.classList.replace('bg-indigo-600', 'bg-red-600');
        };

        recognition.onend = () => {
            btnVoz.classList.replace('bg-red-600', 'bg-indigo-600');
            status.innerText = "Micrófono apagado.";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            status.innerText = "Escuché: " + transcript;
            procesarComandos(transcript);
        };
    }

    // --- ANCLA: PROCESADOR ---
    function procesarComandos(texto) {
        // Tolerancia fonética para Palatino
        let cara = texto.includes("vestibular") ? "v" : (/(palatino|latino|platino|lingual)/.test(texto) ? "p" : null);
        
        if (cara) {
            const numeros = texto.match(/\d/g);
            if (numeros && numeros.length >= 6) {
                asignar(cara, 'd', numeros[0], numeros[3]);
                asignar(cara, 'm', numeros[1], numeros[4]);
                asignar(cara, 'mes', numeros[2], numeros[5]);
                actualizarGrafico(cara);
                if (cara === 'p') setTimeout(ejecutarGuardado, 1500);
            }
        }
    }

    function asignar(c, p, nic, ps) {
        const iNic = document.getElementById(`${c}-${p}-nic`);
        const iPs = document.getElementById(`${c}-${p}-ps`);
        const tRec = document.getElementById(`${c}-${p}-rec`);
        if (iNic && iPs) {
            iNic.value = nic; iPs.value = ps;
            tRec.innerText = parseInt(nic) - parseInt(ps);
        }
    }

    // --- ANCLA: GRAFICO ---
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

    // --- ANCLA: GUARDADO ---
    btnGuardar.onclick = ejecutarGuardado;

    function ejecutarGuardado() {
        const diente = secuenciaDientes[indiceActual];
        const v_ps = [document.getElementById('v-d-ps').value, document.getElementById('v-m-ps').value, document.getElementById('v-mes-ps').value].join('-');
        const p_ps = [document.getElementById('p-d-ps').value, document.getElementById('p-m-ps').value, document.getElementById('p-mes-ps').value].join('-');
        
        const resumen = `V:[${v_ps}] P:[${p_ps}]`;

        // 1. Integración Global
        registrarEnHistorial(diente, resumen);

        // 2. Registro Local
        memoriaExamen.push({ diente, resumen });
        const badge = document.createElement('div');
        badge.className = "bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm";
        badge.innerText = `${diente}`;
        listaHistorial.prepend(badge);

        // Salto
        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
            document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
        }
    }

    // --- ANCLA: GENERAR INFORME ---
    btnPdf.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pac = sesionActiva.paciente;
        
        doc.setFontSize(20);
        doc.text("Informe de Periodoncia Pro", 20, 20);
        doc.setFontSize(12);
        doc.text(`Paciente: ${pac}`, 20, 30);
        doc.line(20, 32, 190, 32);

        let y = 45;
        memoriaExamen.forEach(item => {
            doc.text(`Diente ${item.diente}: Profundidades de Sondaje ${item.resumen}`, 20, y);
            y += 10;
            if (y > 270) { doc.addPage(); y = 20; }
        });

        doc.save(`Periodoncia_${pac}.pdf`);
    };

    cargarSesionPortal();
});
