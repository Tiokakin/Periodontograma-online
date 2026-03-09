const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'es-CL';
recognition.continuous = true;
recognition.interimResults = false;

btnVoz.addEventListener('click', () => {
    try {
        recognition.start();
        status.innerText = "🎤 Escuchando... Di el diente y luego la cara con sus 6 números.";
        btnVoz.style.background = "#dc3545";
        btnVoz.innerText = "🛑 Detener Dictado";
    } catch (e) {
        recognition.stop();
        btnVoz.style.background = "#28a745";
        btnVoz.innerText = "🎤 Iniciar Dictado";
    }
});

recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    status.innerText = "Escuché: " + transcript;
    
    // 1. PROCESAR EL DIENTE (Ej: "diente uno seis")
    const matchDiente = transcript.match(/diente\s*(\d)[\s.]?(\d)/);
    if (matchDiente) {
        dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
    }

    // 2. PROCESAR VESTIBULAR
    if (transcript.includes("vestibular")) {
        // Buscamos solo los números que aparecen DESPUÉS de la palabra "vestibular"
        const parteVestibular = transcript.split("vestibular")[1];
        const numerosV = parteVestibular.match(/\d/g);
        if (numerosV && numerosV.length >= 6) {
            asignarDatos('v', 'd', numerosV[0], numerosV[3]);
            asignarDatos('v', 'm', numerosV[1], numerosV[4]);
            asignarDatos('v', 'mes', numerosV[2], numerosV[5]);
        }
    }

    // 3. PROCESAR PALATINO
    if (transcript.includes("palatino") || transcript.includes("lingual")) {
        // Buscamos solo los números que aparecen DESPUÉS de la palabra "palatino"
        const partePalatina = transcript.split(/palatino|lingual/)[1];
        const numerosP = partePalatina.match(/\d/g);
        if (numerosP && numerosP.length >= 6) {
            asignarDatos('p', 'd', numerosP[0], numerosP[3]);
            asignarDatos('p', 'm', numerosP[1], numerosP[4]);
            asignarDatos('p', 'mes', numerosP[2], numerosP[5]);
        }
    }
};

function asignarDatos(cara, punto, nic, ps) {
    const inputNic = document.getElementById(`${cara}-${punto}-nic`);
    const inputPs = document.getElementById(`${cara}-${punto}-ps`);
    const tdRec = document.getElementById(`${cara}-${punto}-rec`);

    if (inputNic && inputPs) {
        inputNic.value = nic;
        inputPs.value = ps;
        const rec = parseInt(nic) - parseInt(ps);
        tdRec.innerText = rec;

        // Marcador visual para Periodontitis (NIC >= 5mm)
        inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
    }
}

