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
};

function asignarDatos(cara, punto, nic, ps, ss, sup) {
    const inputNic = document.getElementById(`${cara}-${punto}-nic`);
    const inputPs = document.getElementById(`${cara}-${punto}-ps`);
    const checkSs = document.getElementById(`${cara}-${punto}-ss`);
    const checkSup = document.getElementById(`${cara}-${punto}-sup`);
    const tdRec = document.getElementById(`${cara}-${punto}-rec`);

    if (inputNic && inputPs) {
        // Insertar valores numéricos
        inputNic.value = nic;
        inputPs.value = ps;
        
        // Calcular Recesión (NIC - PS)
        const rec = parseInt(nic) - parseInt(ps);
        tdRec.innerText = rec;

        // Marcar Sangrado y Supuración (Checkboxes)
        if (checkSs) checkSs.checked = ss;
        if (checkSup) checkSup.checked = sup;

        // Alerta visual de severidad (NIC >= 5mm)
        inputNic.style.backgroundColor = (nic >= 5) ? "#ffdce0" : "#ffffff";
        
        // Resaltar fila si hay sangrado activo
        inputNic.parentElement.parentElement.style.backgroundColor = ss ? "#fff0f0" : "transparent";
    }
}
