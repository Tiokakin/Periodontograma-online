const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "Navegador no soporta voz.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.continuous = true;

    btnVoz.onclick = () => {
        try {
            recognition.start();
            status.innerText = "🎤 Escuchando...";
            btnVoz.style.background = "#dc3545";
            btnVoz.innerText = "🛑 Detener";
        } catch (e) {
            recognition.stop();
            btnVoz.style.background = "#28a745";
            btnVoz.innerText = "🎤 Iniciar Dictado";
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        status.innerText = "Escuché: " + transcript;
        procesarComando(transcript);
    };

    function procesarComando(texto) {
        // DIENTE
        const matchDiente = texto.match(/diente\s*(\d)[\s.]?(\d)/);
        if (matchDiente) {
            dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
        }

        // CARA
        let cara = texto.includes("vestibular") ? "v" : (texto.includes("palatino") || texto.includes("lingual") ? "p" : null);
        
        if (cara) {
            const parteCara = texto.split(/vestibular|palatino|lingual/)[1];
            const numeros = parteCara.match(/\d/g);
            const ss = parteCara.includes("sangre") || parteCara.includes("sangrado");
            const sup = parteCara.includes("pus") || parteCara.includes("supuración");

            if (numeros && numeros.length >= 6) {
                asignar(cara, 'd', numeros[0], numeros[3], ss, sup);
                asignar(cara, 'm', numeros[1], numeros[4], ss, sup);
                asignar(cara, 'mes', numeros[2], numeros[5], ss, sup);
                actualizarGrafico(cara);
            }
        }
    }

    function asignar(c, p, nic, ps, ss, sup) {
        document.getElementById(`${c}-${p}-nic`).value = nic;
        document.getElementById(`${c}-${p}-ps`).value = ps;
        const rec = parseInt(nic) - parseInt(ps);
        document.getElementById(`${c}-${p}-rec`).innerText = rec;
        document.getElementById(`${c}-${p}-ss`).checked = ss;
        document.getElementById(`${c}-${p}-sup`).checked = sup;
        
        document.getElementById(`${c}-${p}-nic`).style.backgroundColor = (nic >= 5) ? "#ffdce0" : "white";
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
}
