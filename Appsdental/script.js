document.addEventListener('DOMContentLoaded', () => {

    // --- ANCLA: VARIABLES ---
    const btnVoz = document.getElementById('btn-voz');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnPdf = document.getElementById('btn-pdf');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');
    const listaHistorial = document.getElementById('lista-historial');

    const secuenciaDientes = ["1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"];
    let indiceActual = 0;
    let memoriaExamen = [];

    const palabrasANumeros = {'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'cero': 0};

    // --- ANCLA: VOZ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'es-CL';
        recognition.continuous = true;
        btnVoz.onclick = () => { try { recognition.start(); } catch (e) { recognition.stop(); } };

        recognition.onstart = () => { status.innerText = "🎤 Escuchando..."; btnVoz.style.background = "#dc3545"; };
        recognition.onend = () => { btnVoz.style.background = "#28a745"; };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            status.innerText = "Escuché: " + transcript;
            
            if (transcript.includes("guardar") || transcript.includes("siguiente")) {
                ejecutarGuardado();
            } else {
                procesarComandos(transcript);
            }
        };
    }

   // --- ANCLA: PROCESADOR (Versión 0.0117 con Tolerancia Fonética) ---
function procesarComandos(texto) {
    // 1. Detección de Diente (Igual que antes)
    const matchDiente = texto.match(/diente\s*(\d|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)[\s.]?(\d|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/);
    if (matchDiente) {
        const num = texto.match(/diente\s*[\d.]+/)[0].replace("diente ", "");
        dienteLabel.innerText = "Diente: " + num;
        actualizarSiluetaDiente(num);
    }

    // 2. Detección de Cara con Tolerancia Fonética
    let cara = null;
    
    // Lista de errores comunes para Vestibular
    const esVestibular = texto.includes("vestibular") || texto.includes("estibular") || texto.includes("testicular");
    
    // Lista de errores comunes para Palatino/Lingual
    const esPalatino = texto.includes("palatino") || texto.includes("latino") || 
                       texto.includes("platino") || texto.includes("lingual") || 
                       texto.includes("palatal");

    if (esVestibular) cara = "v";
    else if (esPalatino) cara = "p";

    if (cara) {
        // Usamos una expresión regular para separar el texto después de la palabra clave detectada
        const separador = cara === "v" ? /(vestibular|estibular|testicular)/ : /(palatino|latino|platino|lingual|palatal)/;
        let textoLimpio = texto.split(separador).pop(); 

        for (let [p, n] of Object.entries(palabrasANumeros)) { 
            textoLimpio = textoLimpio.replace(new RegExp(p, 'g'), n); 
        }
        
        const nums = textoLimpio.match(/\d/g);
        const ss = textoLimpio.includes("sangre") || textoLimpio.includes("sangrado");

        if (nums && nums.length >= 6) {
            asignarValores(cara, 'd', nums[0], nums[3], ss);
            asignarValores(cara, 'm', nums[1], nums[4], ss);
            asignarValores(cara, 'mes', nums[2], nums[5], ss);
            actualizarGrafico(cara);

            // AUTO-GUARDADO TRAS CARA INTERNA
            if (cara === 'p') {
                status.innerText = "✅ Cara interna detectada. Guardando...";
                setTimeout(ejecutarGuardado, 1500);
            }
        } else {
            status.innerText = "⚠️ Error: Escuché la cara pero solo " + (nums ? nums.length : 0) + " números.";
        }
    }
}

    // --- ANCLA: TABLA ---
    function asignarValores(c, p, nic, ps, ss) {
        document.getElementById(`${c}-${p}-nic`).value = nic;
        document.getElementById(`${c}-${p}-ps`).value = ps;
        const rec = parseInt(nic) - parseInt(ps);
        document.getElementById(`${c}-${p}-rec`).innerText = rec;
        document.getElementById(`${c}-${p}-ss`).checked = ss;
        document.getElementById(`${c}-${p}-nic`).style.backgroundColor = (nic >= 5) ? "#ffdce0" : "white";
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

    function actualizarSiluetaDiente(num) {
        const forma = document.getElementById('forma-diente');
        const seg = parseInt(num.split('.')[1]);
        if (seg <= 3) forma.setAttribute("d", "M100,50 Q100,20 150,20 Q200,20 200,50 L190,80 Q150,190 150,190 L110,80 Z");
        else forma.setAttribute("d", "M80,50 Q80,20 150,20 Q220,20 220,50 L220,80 Q220,150 180,180 L150,150 L120,180 Q80,150 80,80 Z");
    }

    // --- ANCLA: GUARDADO ---
    btnGuardar.onclick = ejecutarGuardado;
    function ejecutarGuardado() {
        const diente = secuenciaDientes[indiceActual];
        memoriaExamen.push({ 
            diente, 
            v: [document.getElementById('v-d-ps').value, document.getElementById('v-m-ps').value, document.getElementById('v-mes-ps').value],
            p: [document.getElementById('p-d-ps').value, document.getElementById('p-m-ps').value, document.getElementById('p-mes-ps').value]
        });
        
        if (memoriaExamen.length === 1) listaHistorial.innerHTML = "";
        const li = document.createElement('li');
        li.innerHTML = `<strong>Diente ${diente}</strong>: Ok ✅`;
        listaHistorial.prepend(li);

        indiceActual++;
        if (indiceActual < secuenciaDientes.length) {
            dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
            actualizarSiluetaDiente(secuenciaDientes[indiceActual]);
            document.querySelectorAll('input[type="number"]').forEach(i => i.value = 0);
            document.querySelectorAll('.rec-val').forEach(r => r.innerText = "0");
        }
    }

    // --- ANCLA: PDF ---
    btnPdf.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const nombre = document.getElementById('nombre-paciente').value || "Sin Nombre";
        doc.text(`Informe Periodontal: ${nombre}`, 20, 20);
        let y = 35;
        memoriaExamen.forEach(i => {
            doc.text(`Diente ${i.diente}: V(${i.v.join('-')}) P(${i.p.join('-')})`, 20, y);
            y += 10;
        });
        doc.save(`Examen_${nombre}.pdf`);
    };
});

