/**
 * PeriodontoVoice Pro - Versión 0.0008
 * DIAGNÓSTICO ACTIVO
 */

const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Tu navegador no soporta voz. Usa Chrome actualizado.");
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.continuous = true;
    recognition.interimResults = false;

    btnVoz.onclick = () => {
        try {
            recognition.start();
        } catch (e) {
            recognition.stop();
        }
    };

    recognition.onstart = () => {
        status.innerText = "🎤 ESCUCHANDO...";
        btnVoz.style.background = "#dc3545";
        btnVoz.innerText = "🛑 Detener";
    };

    recognition.onend = () => {
        status.innerText = "Micrófono apagado.";
        btnVoz.style.background = "#28a745";
        btnVoz.innerText = "🎤 Iniciar Dictado";
    };

    // --- EL MOMENTO DE LA VERDAD ---
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Esta alerta te confirmará si el celular te escuchó algo
        alert("El celular escuchó: " + transcript); 

        // Procesar Diente
        const matchDiente = transcript.match(/diente\s*(\d)[\s.]?(\d)/);
        if (matchDiente) {
            dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
        }

        // Procesar Caras
        let cara = transcript.includes("vestibular") ? "v" : (transcript.includes("palatino") || transcript.includes("lingual") ? "p" : null);
        
        if (cara) {
            const partes = transcript.split(/vestibular|palatino|lingual/);
            if (partes[1]) {
                const numeros = partes[1].match(/\d/g);
                if (numeros && numeros.length >= 6) {
                    asignarDatos(cara, 'd', numeros[0], numeros[3]);
                    asignarDatos(cara, 'm', numeros[1], numeros[4]);
                    asignarDatos(cara, 'mes', numeros[2], numeros[5]);
                    actualizarGraficoLateral(cara);
                } else {
                    alert("Encontré la cara, pero solo vi " + (numeros ? numeros.length : 0) + " números. Necesito 6.");
                }
            }
        }
    };
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
