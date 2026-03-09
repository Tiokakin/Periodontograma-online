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

    // Diccionario para convertir palabras a números (Acento Chileno)
    const palabrasANumeros = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'cero': 0
    };

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
            status.innerText = "🎤 ESCUCHANDO... Di la cara y los 6 números.";
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

    function procesarTextoPeriodontal(texto) {
        // 1. Detectar Diente (ej: "Diente 1.6" o "Diente uno seis")
        const matchDiente = texto.match(/diente\s*(\d|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)[\s.]?(\d|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/);
        if (matchDiente) {
            dienteLabel.innerText = "Diente: " + texto.match(/diente\s*[\d.]+/);
        }

        // 2. Detectar Cara
        let cara = null;
        if (texto.includes("vestibular")) cara = "v";
        else if (texto.includes("palatino") || texto.includes("lingual")) cara = "p";

        if (cara) {
            const partes = texto.split(/vestibular|palatino|lingual/);
            const contenido = partes[1];

            // Convertir palabras a números y limpiar el texto
            let textoLimpio = contenido;
            for (let [palabra, num] of Object.entries(palabrasANumeros)) {
                textoLimpio = textoLimpio.replace(new RegExp(palabra, 'g'), num);
            }

            const numeros = textoLimpio.match(/\d/g);
            const ss = contenido.includes("sangre") || contenido.includes("sangrado");
            const sup = contenido.includes("pus") || contenido.includes("supuración");

            if (numeros && numeros.length >= 6) {
                // NIC (Distal, Medio, Mesial) + PS (Distal, Medio, Mesial)
                asignar(cara, 'd', numeros[0], numeros[3], ss, sup);
                asignar(cara, 'm', numeros[1], numeros[4], ss, sup);
                asignar(cara, 'mes', numeros[2], numeros[5], ss, sup);
                actualizarGrafico(cara);
            } else {
                status.innerText = "⚠️ Error: Necesito 6 números (3 NIC y 3 PS). Escuché " + (numeros ? numeros.length : 0);
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
            // Cálculo: REC = NIC - PS
            const rec = parseInt(nic) - parseInt(ps);
            tRec.innerText = rec;
            if(cSs) cSs.checked = ss;
            if(cSup) cSup.checked = sup;

            // Alerta visual de severidad
            iNic.style.backgroundColor = (parseInt(nic) >= 5) ? "#ffdce0" : "white";
        }
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

    // --- FUNCIONES DE GUARDADO Y PDF (Igual que antes) ---
    btnGuardar.onclick = guardarDienteActual;

    function guardarDienteActual() {
        const diente = secuenciaDientes[indiceActual];
        const registro = {
            diente: diente,
            v: { d: document.getElementById('v-d-ps').value, m: document.getElementById('v-m-ps').value, mes: document.getElementById('v-mes-ps').value },
            p: { d: document.getElementById('p-d-ps').value, m: document.getElementById('p-m-ps').value, mes: document.getElementById('p-mes-ps').value }
        };
        memoriaPacientes.push(registro);
        
        if (memoriaPacientes.length === 1) listaHistorial.innerHTML = "";
        const li = document.createElement('li');
        li.innerHTML = `<strong>Diente ${diente}</strong>: Registrado ✅`;
        listaHistorial.prepend(li);

        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            limpiarCampos();
        }
    }

    function limpiarCampos() {
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
        document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    }

    btnPdf.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Reporte Periodontal Profesional", 20, 20);
        let y = 35;
        memoriaPacientes.forEach(item => {
            doc.text(`Diente ${item.diente}: V(${item.v.d}-${item.v.m}-${item.v.mes}) P(${item.p.d}-${item.p.m}-${item.p.mes})`, 20, y);
            y += 10;
        });
        doc.save("registro_investigacion.pdf");
    };
});
