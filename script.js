const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "Error: Navegador no compatible con voz.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.continuous = true;

    btnVoz.addEventListener('click', () => {
        recognition.start();
        status.innerText = "🎤 Escuchando... di 'Diente 1.6', 'Vestibular 3 2 3 4 1 4'...";
        btnVoz.style.background = "#dc3545";
        btnVoz.innerText = "🛑 Detener Dictado";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        status.innerText = "Escuché: " + transcript;
        procesarComando(transcript);
    };

    function procesarComando(texto) {
        // Reconocer Diente
        const matchDiente = texto.match(/diente\s*(\d[.]?\d)/);
        if (matchDiente) {
            dienteLabel.innerText = "Diente: " + matchDiente[1];
        }

        // Reconocer Cara y Números
        let cara = texto.includes("vestibular") ? "v" : (texto.includes("palatino") || texto.includes("lingual") ? "p" : null);
        
        if (cara) {
            const numeros = texto.match(/\d/g);
            if (numeros && numeros.length >= 6) {
                // Primeros 3: NIC | Siguientes 3: PS
                asignarDatos(cara, 'd', numeros[0], numeros[3]);
                asignarDatos(cara, 'm', numeros[1], numeros[4]);
                asignarDatos(cara, 'mes', numeros[2], numeros[5]);
            }
        }
    }

    function asignarDatos(cara, punto, nic, ps) {
        const inputNic = document.getElementById(`${cara}-${punto}-nic`);
        const inputPs = document.getElementById(`${cara}-${punto}-ps`);
        const tdRec = document.getElementById(`${cara}-${punto}-rec`);

        if (inputNic && inputPs) {
            inputNic.value = nic;
            inputPs.value = ps;
            // Cálculo: REC = NIC - PS
            const rec = parseInt(nic) - parseInt(ps);
            tdRec.innerText = rec;

            // Alerta visual de severidad (AAP 2017)
            inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
        }
    }
}
