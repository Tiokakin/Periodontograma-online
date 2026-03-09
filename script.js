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
        status.innerText = "🎤 Escuchando... Di el diente y la cara (ej: 'Vestibular 3 2 3 4 1 4 con sangrado')";
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
    
    // 1. PROCESAR EL DIENTE
    const matchDiente = transcript.match(/diente\s*(\d)[\s.]?(\d)/);
    if (matchDiente) {
        dienteLabel.innerText = `Diente: ${matchDiente[1]}.${matchDiente[2]}`;
    }

    // 2. DETECTAR CARA (Vestibular o Palatino/Lingual)
    let cara = null;
    if (transcript.includes("vestibular")) cara = "v";
    else if (transcript.includes("palatino") || transcript.includes("lingual")) cara = "p";
    
    if (cara) {
        // Separamos el texto para analizar solo lo que viene después de la cara mencionada
        const parteCara = transcript.split(/vestibular|palatino|lingual/)[1];
        const numeros = parteCara.match(/\d/g);

        // Lógica de Sangrado y Supuración (Presencia por mención)
        const tieneSangrado = parteCara.includes("sangrado") || parteCara.includes("sangre");
        const tieneSupuracion = parteCara.includes("supuración") || parteCara.includes("supuracion") || parteCara.includes("pus");

        if (numeros && numeros.length >= 6) {
            // Asignamos a los 3 puntos: Distal, Medio y Mesial
            asignarDatos(cara, 'd', numeros[0], numeros[3], tieneSangrado, tieneSupuracion);
            asignarDatos(cara, 'm', numeros[1], numeros[4], tieneSangrado, tieneSupuracion);
            asignarDatos(cara, 'mes', numeros[2], numeros[5], tieneSangrado, tieneSupuracion);
        }
    }
}function asignarDatos(cara, punto, nic, ps, ss, sup) {
    const inputNic = document.getElementById(`${cara}-${punto}-nic`);
    const inputPs = document.getElementById(`${cara}-${punto}-ps`);
    const tdRec = document.getElementById(`${cara}-${punto}-rec`);

    if (inputNic && inputPs) {
        inputNic.value = nic;
        inputPs.value = ps;
        
        const rec = parseInt(nic) - parseInt(ps);
        tdRec.innerText = rec;

        // --- NUEVA LÓGICA DE DIBUJO ---
        actualizarGrafico();
        
        // Alerta visual de severidad
        inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
    }
}

function actualizarGrafico() {
    // Obtenemos los valores de los 3 puntos de la cara actual (ej: Vestibular)
    const puntos = ['d', 'm', 'mes'];
    let puntosRec = "";
    let puntosPs = "";

    puntos.forEach((p, index) => {
        const x = 50 + (index * 100); // Coordenada X (Distal, Medio, Mesial)
        
        // Obtenemos valores de la web (si están vacíos, usamos 0)
        const vPs = parseInt(document.getElementById(`v-${p}-ps`).value) || 0;
        const vRec = parseInt(document.getElementById(`v-${p}-rec`).innerText) || 0;

        // Calculamos la altura Y (50 es la base, sumamos para bajar la línea)
        const yRec = 50 + (vRec * 5); 
        const yPs = 50 + ((vRec + vPs) * 5); // El sondaje empieza donde termina la recesión

        puntosRec += `${x},${yRec} `;
        puntosPs += `${x},${yPs} `;
    });

    // Actualizamos las líneas del dibujo SVG
    document.getElementById('linea-recesion').setAttribute('points', puntosRec);
    document.getElementById('linea-sondaje').setAttribute('points', puntosPs);
}


    }
}

