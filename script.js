const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

// 1. Inicialización de Voz con compatibilidad
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "Error: Navegador no compatible con voz.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.continuous = true;
    recognition.interimResults = false;

    btnVoz.addEventListener('click', () => {
        try {
            recognition.start();
            status.innerText = "🎤 Escuchando... Di el diente y la cara.";
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
        console.log("Procesando:", transcript); // Para ver errores en F12
        procesarComando(transcript);
    };

    // 2. Procesamiento de Comandos
    function procesarComando(texto) {
        // Reconocer Diente
        const matchDiente = texto.match(/diente\s*(\d)[\s.]?(\d)/);
        if (matchDiente) {
            dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
        }

        // Reconocer Cara (V o P)
        let cara = texto.includes("vestibular") ? "v" : (texto.includes("palatino") || texto.includes("lingual") ? "p" : null);
        
        if (cara) {
            const partes = texto.split(/vestibular|palatino|lingual/);
            if (partes.length > 1) {
                const numeros = partes[1].match(/\d/g);
                const tieneSangrado = partes[1].includes("sangrado") || partes[1].includes("sangre");
                const tieneSupuracion = partes[1].includes("supuración") || partes[1].includes("pus");

                if (numeros && numeros.length >= 6) {
                    asignarDatos(cara, 'd', numeros[0], numeros[3], tieneSangrado, tieneSupuracion);
                    asignarDatos(cara, 'm', numeros[1], numeros[4], tieneSangrado, tieneSupuracion);
                    asignarDatos(cara, 'mes', numeros[2], numeros[5], tieneSangrado, tieneSupuracion);
                }
            }
        }
    }

    // 3. Inserción de Datos y Llamada al Gráfico
    function asignarDatos(cara, punto, nic, ps, ss, sup) {
        try {
            const inputNic = document.getElementById(`${cara}-${punto}-nic`);
            const inputPs = document.getElementById(`${cara}-${punto}-ps`);
            const tdRec = document.getElementById(`${cara}-${punto}-rec`);
            const checkSs = document.getElementById(`${cara}-${punto}-ss`);
            const checkSup = document.getElementById(`${cara}-${punto}-sup`);

            if (inputNic && inputPs) {
                inputNic.value = nic;
                inputPs.value = ps;
                
                // Fórmula: NIC = PS + REC -> REC = NIC - PS
                const recVal = parseInt(nic) - parseInt(ps);
                tdRec.innerText = recVal;

                if (checkSs) checkSs.checked = ss;
                if (checkSup) checkSup.checked = sup;

                inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
                
                // Actualizar el gráfico para la cara actual
                actualizarGrafico(cara);
            }
        } catch (err) {
            console.error("Error asignando datos:", err);
        }
    }

    // 4. Lógica del Gráfico SVG
    function actualizarGrafico(cara) {
        const puntos = ['d', 'm', 'mes'];
        let coordRec = "";
        let coordPs = "";

        puntos.forEach((p, index) => {
            const x = 50 + (index * 100);
            const psVal = parseInt(document.getElementById(`${cara}-${p}-ps`).value) || 0;
            const recVal = parseInt(document.getElementById(`${cara}-${p}-rec`).innerText) || 0;

            // Escala: 1mm = 7px. Base 0 en Y=85
            const yMargen = 85 + (recVal * 7); 
            const yBolsa = yMargen + (psVal * 7);

            coordRec += `${x},${yMargen} `;
            coordPs += `${x},${yBolsa} `;
        });

        const lineaRec = document.getElementById('linea-recesion');
        const lineaPs = document.getElementById('linea-sondaje');
        
        if (lineaRec && lineaPs) {
            lineaRec.setAttribute('points', coordRec.trim());
            lineaPs.setAttribute('points', coordPs.trim());
        }
    }
}


