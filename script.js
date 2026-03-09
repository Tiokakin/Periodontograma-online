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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'es-CL';
        recognition.continuous = true;
        recognition.interimResults = false;

        btnVoz.onclick = () => {
            try { recognition.start(); } catch (e) { recognition.stop(); }
        };

        recognition.onstart = () => {
            status.innerText = "🎤 Escuchando... Di cara y números.";
            btnVoz.style.background = "#dc3545";
            btnVoz.innerText = "🛑 Detener Dictado";
        };

        recognition.onend = () => {
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

    // --- EL TRADUCTOR (La parte que estaba fallando) ---
    function procesarTextoPeriodontal(texto) {
        // 1. Detectar Diente
        const matchDiente = texto.match(/diente\s*(\d)[\s.]?(\d)/);
        if (matchDiente) {
            const nuevoDiente = `${matchDiente[1]}.${matchDiente[2]}`;
            dienteLabel.innerText = "Diente: " + nuevoDiente;
            // Opcional: buscar el índice en la secuencia
            const idx = secuenciaDientes.indexOf(nuevoDiente);
            if(idx !== -1) indiceActual = idx;
        }

        // 2. Detectar Cara
        let cara = null;
        if (texto.includes("vestibular")) cara = "v";
        else if (texto.includes("palatino") || texto.includes("lingual")) cara = "p";

        if (cara) {
            // Extraer solo los números después de la palabra de la cara
            const partes = texto.split(/vestibular|palatino|lingual/);
            const numeros = partes[1].match(/\d/g);
            
            const ss = partes[1].includes("sangre") || partes[1].includes("sangrado");
            const sup = partes[1].includes("pus") || partes[1].includes("supuración");

            if (numeros && numeros.length >= 6) {
                // Asignar: los 3 primeros son NIC, los otros 3 son PS
                asignar(cara, 'd', numeros[0], numeros[3], ss, sup);
                asignar(cara, 'm', numeros[1], numeros[4], ss, sup);
                asignar(cara, 'mes', numeros[2], numeros[5], ss, sup);
                actualizarGrafico(cara);
            }
        }
    }

    function asignar(c, p, nic, ps, ss, sup) {
        const iNic = document.getElementById(`${c}-${p}-nic`);
        const iPs = document.getElementById(`${c}-${p}-ps`);
        const tRec = document.getElementById(`${c}-${p}-rec`);
        const cSs = document.getElementById(`${c}-${p}-ss`);
        const cSup = document.getElementById(`${c}-${p}-sup`);

        if (iNic && iPs) {
            iNic.value = nic;
            iPs.value = ps;
            const rec = parseInt(nic) - parseInt(ps);
            tRec.innerText = rec;
            if(cSs) cSs.checked = ss;
            if(cSup) cSup.checked = sup;

            // Color de alerta NIC >= 5
            iNic.style.backgroundColor = (parseInt(nic) >= 5) ? "#ffdce0" : "white";
        }
    }

    // --- GRÁFICO ---
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

    // --- GUARDAR ---
    btnGuardar.onclick = guardarDienteActual;

    function guardarDienteActual() {
        const diente = secuenciaDientes[indiceActual];
        const registro = {
            diente: diente,
            v: {
                d: document.getElementById('v-d-ps').value,
                m: document.getElementById('v-m-ps').value,
                mes: document.getElementById('v-mes-ps').value
            },
            p: {
                d: document.getElementById('p-d-ps').value,
                m: document.getElementById('p-m-ps').value,
                mes: document.getElementById('p-mes-ps').value
            }
        };

        memoriaPacientes.push(registro);
        
        // Historial visual
        if (memoriaPacientes.length === 1) listaHistorial.innerHTML = "";
        const li = document.createElement('li');
        li.innerHTML = `<strong>Diente ${diente}</strong>: Registrado ✅`;
        listaHistorial.prepend(li);

        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            limpiarCampos();
        } else {
            alert("Sesión finalizada.");
        }
    }

    function limpiarCampos() {
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
        document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    }

    // --- PDF ---
    btnPdf.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Reporte Periodontal - Investigación", 20, 20);
        let y = 35;
        memoriaPacientes.forEach(item => {
            doc.text(`Diente ${item.diente}: Vest(${item.v.d}-${item.v.m}-${item.v.mes}) Palat(${item.p.d}-${item.p.m}-${item.p.mes})`, 20, y);
            y += 10;
            if (y > 270) { doc.addPage(); y = 20; }
        });
        doc.save("periodontograma_u_chile.pdf");
    };
});
