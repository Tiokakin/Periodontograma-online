document.addEventListener('DOMContentLoaded', () => {
    const btnVoz = document.getElementById('btn-voz');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnPdf = document.getElementById('btn-pdf');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');
    const listaHistorial = document.getElementById('lista-historial');

    const secuenciaDientes = ["1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"];
    let indiceActual = 0;
    let memoriaPacientes = [];

    // --- CONFIGURACIÓN DE VOZ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'es-CL';
        recognition.continuous = true;

        btnVoz.onclick = () => {
            try { recognition.start(); } catch (e) { recognition.stop(); }
        };

        recognition.onstart = () => {
            status.innerText = "🎤 Escuchando...";
            btnVoz.style.background = "#dc3545";
            btnVoz.innerText = "🛑 Detener Dictado";
        };

        recognition.onend = () => {
            status.innerText = "Micrófono apagado.";
            btnVoz.style.background = "#28a745";
            btnVoz.innerText = "🎤 Iniciar Dictado";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            status.innerText = "Escuché: " + transcript;
            
            if (transcript.includes("guardar") || transcript.includes("siguiente")) {
                guardarDienteActual();
            } else {
                procesarTextoPeriodontal(transcript);
            }
        };
    }

    // --- LÓGICA DE GUARDADO ---
    btnGuardar.onclick = guardarDienteActual;

    function guardarDienteActual() {
        const diente = secuenciaDientes[indiceActual];
        
        // Captura de datos completa
        const registro = {
            diente: diente,
            v: obtenerDatosCara('v'),
            p: obtenerDatosCara('p')
        };

        memoriaPacientes.push(registro);
        actualizarListaVisual(diente);

        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            limpiarCampos();
        } else {
            alert("Examen finalizado. Ya puede generar el PDF.");
        }
    }

    function obtenerDatosCara(c) {
        return {
            d: { nic: document.getElementById(`${c}-d-nic`).value, ps: document.getElementById(`${c}-d-ps`).value },
            m: { nic: document.getElementById(`${c}-m-nic`).value, ps: document.getElementById(`${c}-m-ps`).value },
            mes: { nic: document.getElementById(`${c}-mes-nic`).value, ps: document.getElementById(`${c}-mes-ps`).value }
        };
    }

    function actualizarListaVisual(diente) {
        if (memoriaPacientes.length === 1) listaHistorial.innerHTML = "";
        const li = document.createElement('li');
        li.style.padding = "5px";
        li.innerHTML = `<strong>Diente ${diente}:</strong> Registrado ✅`;
        listaHistorial.prepend(li);
    }

    function limpiarCampos() {
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
        document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
    }

    // --- GENERAR PDF ---
    btnPdf.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Informe Periodontal - Dictado por Voz", 20, 20);
        
        let y = 35;
        memoriaPacientes.forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`DIENTE ${item.diente}:`, 20, y);
            y += 7;
            doc.text(`  Vestibular: D(${item.v.d.ps}) M(${item.v.m.ps}) Mes(${item.v.mes.ps})`, 25, y);
            y += 6;
            doc.text(`  Palatino: D(${item.p.d.ps}) M(${item.p.m.ps}) Mes(${item.p.mes.ps})`, 25, y);
            y += 10;
        });
        doc.save("periodontograma.pdf");
    };
});


