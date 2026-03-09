/**
 * PeriodontoVoice Pro - Versión 0.0007
 * Lógica: NIC = PS + REC | REC = NIC - PS
 */

const btnVoz = document.getElementById('btn-voz');
const status = document.getElementById('status');
const dienteLabel = document.getElementById('diente-actual');

// 1. Configuración del Reconocimiento de Voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "Error: Su navegador no soporta tecnología de voz. Use Chrome.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL'; // Español de Chile
    recognition.continuous = true;
    recognition.interimResults = false;

    // Control del Botón
    btnVoz.onclick = () => {
        if (btnVoz.innerText.includes("Iniciar")) {
            try {
                recognition.start();
            } catch (err) {
                console.error("Error al iniciar:", err);
            }
        } else {
            recognition.stop();
        }
    };

    // Eventos de Estado
    recognition.onstart = () => {
        status.innerText = "🎤 ESCUCHANDO... Di el diente y luego la cara con sus 6 números.";
        btnVoz.style.background = "#dc3545";
        btnVoz.innerText = "🛑 Detener Dictado";
    };

    recognition.onend = () => {
        status.innerText = "Micrófono desactivado.";
        btnVoz.style.background = "#28a745";
        btnVoz.innerText = "🎤 Iniciar Dictado";
    };

    recognition.onerror = (event) => {
        console.error("Error de reconocimiento:", event.error);
        status.innerText = "❌ Error: " + event.error;
    };

    // 2. Procesamiento de la Voz
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        status.innerText = "Escuché: " + transcript;
        
        // A. Reconocer el Diente (Ej: "diente uno punto seis")
        const matchDiente = transcript.match(/diente\s*(\d)[\s.]?(\d)/);
        if (matchDiente) {
            dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
        }

        // B. Reconocer Cara y Mediciones
        // Dividimos el texto para evitar que los números del diente ensucien las medidas
        let caraIdentificada = null;
        if (transcript.includes("vestibular")) caraIdentificada = "v";
        else if (transcript.includes("palatino") || transcript.includes("lingual")) caraIdentificada = "p";

        if (caraIdentificada) {
            const partes = transcript.split(/vestibular|palatino|lingual/);
            const datosPostCara = partes[1]; // Todo lo que se dijo después de la palabra de la cara
            
            const numeros = datosPostCara.match(/\d/g);
            const tieneSangrado = datosPostCara.includes("sangre") || datosPostCara.includes("sangrado");
            const tieneSupuracion = datosPostCara.includes("pus") || datosPostCara.includes("supuración") || datosPostCara.includes("supuracion");

            if (numeros && numeros.length >= 6) {
                // Según tu orden: 3 para NIC y 3 para PS (Distal, Medio, Mesial)
                asignarYCalcular(caraIdentificada, 'd', numeros[0], numeros[3], tieneSangrado, tieneSupuracion);
                asignarYCalcular(caraIdentificada, 'm', numeros[1], numeros[4], tieneSangrado, tieneSupuracion);
                asignarYCalcular(caraIdentificada, 'mes', numeros[2], numeros[5], tieneSangrado, tieneSupuracion);
                
                // Actualizar Gráfico
                actualizarGraficoLateral(caraIdentificada);
            }
        }
    };
}

// 3. Funciones de actualización de Interfaz
function asignarYCalcular(cara, punto, nic, ps, ss, sup) {
    try {
        const idBase = `${cara}-${punto}`;
        const inputNic = document.getElementById(`${idBase}-nic`);
        const inputPs = document.getElementById(`${idBase}-ps`);
        const tdRec = document.getElementById(`${idBase}-rec`);
        const checkSs = document.getElementById(`${idBase}-ss`);
        const checkSup = document.getElementById(`${idBase}-sup`);

        if (inputNic && inputPs) {
            inputNic.value = nic;
            inputPs.value = ps;
            
            // Cálculo clínico: REC = NIC - PS
            const recCalculado = parseInt(nic) - parseInt(ps);
            tdRec.innerText = recCalculado;

            // Checkboxes
            if (checkSs) checkSs.checked = ss;
            if (checkSup) checkSup.checked = sup;

            // Alertas visuales (AAP 2017)
            inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
            inputNic.parentElement.parentElement.style.backgroundColor = ss ? "#fff0f0" : "transparent";
        }
    } catch (err) {
        console.error("Error en asignación:", err);
    }
}

// 4. Dibujo Dinámico del Periodontograma (SVG)
function actualizarGraficoLateral(cara) {
    const puntosClave = ['d', 'm', 'mes'];
    let polyPointsRec = "";
    let polyPointsPs = "";

    puntosClave.forEach((p, i) => {
        const x = 50 + (i * 100); // Coordenadas X: 50, 150, 250
        
        const psVal = parseInt(document.getElementById(`${cara}-${p}-ps`).value) || 0;
        const recVal = parseInt(document.getElementById(`${cara}-${p}-rec`).innerText) || 0;

        // Escala visual: 1mm = 7 pixeles. Línea base 0 en Y=85
        const yMargen = 85 + (recVal * 7); 
        const yBolsa = yMargen + (psVal * 7);

        polyPointsRec += `${x},${yMargen} `;
        polyPointsPs += `${x},${yBolsa} `;
    });

    const lineaRec = document.getElementById('linea-recesion');
    const lineaPs = document.getElementById('linea-sondaje');

    if (lineaRec && lineaPs) {
        lineaRec.setAttribute('points', polyPointsRec.trim());
        lineaPs.setAttribute('points', polyPointsPs.trim());
    }
}
