/**
 * PeriodontoVoice Pro - Versión 0.0009
 * Funcionalidad: Guardar y Siguiente Diente
 */

const btnVoz = document.getElementById('btn-voz');
const btnGuardar = document.getElementById('btn-guardar');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');
const listaHistorial = document.getElementById('lista-historial');

// Secuencia clínica (FDI) - Puedes editar este orden
const secuenciaDientes = [
    "1.8", "1.7", "1.6", "1.5", "1.4", "1.3", "1.2", "1.1",
    "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8"
];
let indiceActual = 0;
let memoriaPacientes = [];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'es-CL';
recognition.continuous = true;

// --- BOTONES ---
btnVoz.onclick = () => {
    try { recognition.start(); } catch (e) { recognition.stop(); }
};

btnGuardar.onclick = () => { guardarDienteActual(); };

recognition.onstart = () => {
    status.innerText = "🎤 ESCUCHANDO...";
    btnVoz.style.background = "#dc3545";
};

recognition.onend = () => {
    btnVoz.style.background = "#28a745";
    status.innerText = "Micrófono apagado.";
};

// --- PROCESAMIENTO ---
recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    status.innerText = "Escuché: " + transcript;

    // COMANDO: "Guardar" o "Siguiente"
    if (transcript.includes("guardar") || transcript.includes("siguiente")) {
        guardarDienteActual();
        return;
    }

    // Reconocer Cara y Números (Igual que antes)
    let cara = transcript.includes("vestibular") ? "v" : (transcript.includes("palatino") || transcript.includes("lingual") ? "p" : null);
    
    if (cara) {
        const partes = transcript.split(/vestibular|palatino|lingual/);
        const numeros = partes[1].match(/\d/g);
        if (numeros && numeros.length >= 6) {
            asignarDatos(cara, 'd', numeros[0], numeros[3]);
            asignarDatos(cara, 'm', numeros[1], numeros[4]);
            asignarDatos(cara, 'mes', numeros[2], numeros[5]);
            actualizarGraficoLateral(cara);
        }
    }
};

function guardarDienteActual() {
    const diente = secuenciaDientes[indiceActual];
    
    // Capturamos todos los valores de la tabla para este diente
    const registro = {
        diente: diente,
        v: {
            d: { nic: document.getElementById('v-d-nic').value, ps: document.getElementById('v-d-ps').value, ss: document.getElementById('v-d-ss').checked },
            m: { nic: document.getElementById('v-m-nic').value, ps: document.getElementById('v-m-ps').value, ss: document.getElementById('v-m-ss').checked },
            mes: { nic: document.getElementById('v-mes-nic').value, ps: document.getElementById('v-mes-ps').value, ss: document.getElementById('v-mes-ss').checked }
        },
        p: {
            d: { nic: document.getElementById('p-d-nic').value, ps: document.getElementById('p-d-ps').value, ss: document.getElementById('p-d-ss').checked },
            m: { nic: document.getElementById('p-m-nic').value, ps: document.getElementById('p-m-ps').value, ss: document.getElementById('p-m-ss').checked },
            mes: { nic: document.getElementById('p-mes-nic').value, ps: document.getElementById('p-mes-mes').value, ss: document.getElementById('p-mes-ss').checked }
        }
    };

    memoriaPacientes.push(registro);
    
    // (Aquí sigue tu lógica de actualizar lista visual y pasar al siguiente diente...)
    actualizarListaVisual(diente);
    indiceActual++;
    // ...
}

    // 3. Crear el nuevo elemento de la lista
    const li = document.createElement('li');
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid #eee";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    
    // Obtenemos un resumen rápido (ej: NIC del punto medio vestibular)
    const nicMedio = document.getElementById('v-m-nic').value || "0";
    
    li.innerHTML = `
        <span><strong>Diente ${diente}</strong></span>
        <span style="color: #28a745;">Registrado ✅ (NIC: ${nicMedio}mm)</span>
    `;

    // 4. Agregar al inicio de la lista
    lista.prepend(li);

    // 5. Guardar en la memoria interna
    memoriaPacientes.push({ diente: diente, fecha: new Date().toLocaleTimeString() });

    // 6. Pasar al siguiente diente de la secuencia
    indiceActual++;
    if (indiceActual < secuenciaDientes.length) {
        dienteLabel.innerText = "Diente: " + secuenciaDientes[indiceActual];
        limpiarTabla();
        status.innerText = "Diente " + diente + " guardado. Pasando al " + secuenciaDientes[indiceActual];
    } else {
        alert("¡Has completado todos los dientes de la secuencia!");
    }
}
function limpiarTabla() {
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = 0);
    document.querySelectorAll('.rec-val').forEach(td => td.innerText = "0");
    document.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = false);
    // Resetear gráfico
    document.getElementById('linea-recesion').setAttribute('points', "50,85 150,85 250,85");
    document.getElementById('linea-sondaje').setAttribute('points', "50,85 150,85 250,85");
}

function asignarDatos(c, p, nic, ps) {
    const inputNic = document.getElementById(`${c}-${p}-nic`);
    const inputPs = document.getElementById(`${c}-${p}-ps`);
    const tdRec = document.getElementById(`${c}-${p}-rec`);

    if (inputNic && inputPs) {
        inputNic.value = nic;
        inputPs.value = ps;
        const rec = parseInt(nic) - parseInt(ps);
        tdRec.innerText = rec;
    }
}

function actualizarGraficoLateral(cara) {
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



