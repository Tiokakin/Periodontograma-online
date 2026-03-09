const btnVoz = document.getElementById('btn-voz');
const statusDiv = document.getElementById('status');

const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new Reconocimiento();
recog.lang = 'es-CL';
recog.continuous = true; // No se detiene entre comandos

recog.onresult = (event) => {
    const texto = event.results[event.results.length - 1][0].transcript.toLowerCase();
    statusDiv.innerText = "Escuché: " + texto;
    procesarComando(texto);
};

function procesarComando(texto) {
    // 1. Identificar el diente (ej: "1.6" o "16")
    const matchDiente = texto.match(/diente\s*(\d[.]?\d)/);
    if (matchDiente) {
        document.getElementById('diente-actual').innerText = "Diente: " + matchDiente[1];
    }

    // 2. Capturar caras y números
    // Buscamos la palabra 'vestibular' o 'palatino' seguida de números
    const cara = texto.includes("vestibular") ? "v" : (texto.includes("palatino") || texto.includes("lingual") ? "p" : null);
    
    if (cara) {
        // Extraemos todos los números después de la palabra de la cara
        const numeros = texto.match(/\d/g); 
        
        if (numeros && numeros.length >= 6) {
            // Según tu orden: Los primeros 3 son NIC, los siguientes 3 son PS
            // Para Distal, Medio, Mesial
            asignarValores(cara, 'd', numeros[0], numeros[3]); // Distal
            asignarValores(cara, 'm', numeros[1], numeros[4]); // Medio
            asignarValores(cara, 'mes', numeros[2], numeros[5]); // Mesial
        }
    }

    if (texto.includes("siguiente")) {
        statusDiv.innerText = "Listo para el siguiente diente...";
        limpiarCampos();
    }
}

function asignarValores(cara, punto, nic, ps) {
    const idNic = `${cara}-${punto}-nic`;
    const idPs = `${cara}-${punto}-ps`;
    const idRec = `${cara}-${punto}-rec`;

    if (document.getElementById(idNic)) {
        document.getElementById(idNic).value = nic;
        document.getElementById(idPs).value = ps;
        
        // Cálculo automático de Recesión: REC = NIC - PS
        const recCalc = parseInt(nic) - parseInt(ps);
        document.getElementById(idRec).innerText = recCalc;
    }
}

function limpiarCampos() {
    // Aquí podrías guardar los datos en una base de datos antes de limpiar
    document.querySelectorAll('input').forEach(input => input.value = "");
    document.querySelectorAll('[id$="-rec"]').forEach(td => td.innerText = "0");
}

btnVoz.onclick = () => {
    recog.start();
    statusDiv.innerText = "🎤 Sistema activo. Dicta cara y valores...";
};