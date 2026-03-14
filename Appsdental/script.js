/**
 * PeriodontoVoice Pro - v0.0204 
 * MÓDULO DE RECUPERACIÓN DE SESIÓN
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ANCLA: VARIABLES ---
    const btnVoz = document.getElementById('btn-voz');
    const status = document.getElementById('status');
    const nombreDisplay = document.getElementById('nombre-paciente-display');
    const dienteLabel = document.getElementById('diente-actual');

    // --- ANCLA: CARGA DE SESIÓN (MODIFICADA) ---
    const inicializarSesion = () => {
        const sesion = localStorage.getItem('SesionClinica');
        if (sesion) {
            const datos = JSON.parse(sesion);
            nombreDisplay.innerText = datos.paciente;
            console.log("Sesión cargada: " + datos.paciente);
        } else {
            // Si no hay sesión del portal, permitimos uso manual
            nombreDisplay.innerText = "Modo Invitado / Manual";
            console.warn("No se encontró SesionClinica. Trabajando en local.");
        }
    };

    // --- ANCLA: CONFIGURACIÓN DE VOZ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        status.innerText = "❌ ERROR: Navegador incompatible.";
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CL';
        recognition.continuous = true;

        btnVoz.onclick = () => {
            status.innerText = "⏳ Activando...";
            try {
                // Forzamos el reinicio si ya estaba activo
                recognition.stop(); 
                setTimeout(() => {
                    recognition.start();
                    console.log("Micrófono solicitado");
                }, 400);
            } catch (err) {
                recognition.start();
            }
        };

        recognition.onstart = () => {
            status.innerText = "🎤 ESCUCHANDO...";
            btnVoz.style.backgroundColor = "#dc2626"; // Rojo
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            status.innerText = "Escuché: " + transcript;
            // Aquí iría tu lógica de procesarTextoPeriodontal
        };

        recognition.onerror = (event) => {
            status.innerText = "❌ Error: " + event.error;
            if (event.error === 'not-allowed') {
                alert("Permiso denegado. Toca el candado en la barra de direcciones y permite el micrófono.");
            }
        };
    }

    // Inicializar todo
    inicializarSesion();
});
