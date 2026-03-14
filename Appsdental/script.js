/**
 * PeriodontoVoice Pro - v0.0203 
 * SISTEMA DE DIAGNÓSTICO ACTIVO
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnVoz = document.getElementById('btn-voz');
    const btnPdf = document.getElementById('btn-pdf');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');

    // --- TEST DE LIBRERÍAS ---
    console.log("Chequeando jsPDF...");
    if (!window.jspdf) {
        status.innerText = "❌ ERROR: Librería PDF no cargada.";
    }

    // --- CONFIGURACIÓN DE VOZ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        status.innerText = "❌ ERROR: Navegador no soporta voz.";
    } else {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CL';
        recognition.continuous = true;
        recognition.interimResults = false;

        // ACCIÓN DEL BOTÓN VOZ
        btnVoz.onclick = () => {
            status.innerText = "⏳ Intentando activar micrófono...";
            try {
                recognition.start();
            } catch (err) {
                status.innerText = "❌ Error al iniciar: " + err.message;
                console.error(err);
                // Si ya estaba iniciado, lo detenemos
                recognition.stop();
            }
        };

        recognition.onstart = () => {
            status.innerText = "🎤 MICRÓFONO ACTIVO - Hable ahora";
            btnVoz.style.backgroundColor = "#dc2626"; // Rojo (Tailwind red-600)
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            status.innerText = "Escuché: " + transcript;
            
            // Lógica simple de prueba: si dices "Diente", que cambie el label
            if (transcript.includes("diente")) {
                const num = transcript.match(/\d+/);
                if(num) dienteLabel.innerText = "Diente: " + num[0];
            }
        };

        recognition.onerror = (event) => {
            status.innerText = "❌ Error de Micro: " + event.error;
            if(event.error === 'not-allowed') {
                alert("Bloqueado: Ve a los ajustes del candado en la URL y permite el micrófono.");
            }
        };

        recognition.onend = () => {
            status.innerText = "Micrófono cerrado.";
            btnVoz.style.backgroundColor = "#4f46e5"; // Indigo (Tailwind)
        };
    }

    // --- ACCIÓN DEL BOTÓN PDF ---
    btnPdf.onclick = () => {
        status.innerText = "⏳ Generando PDF...";
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("TEST DE REPORTE CLINICO", 20, 20);
            doc.text("Paciente: " + (document.getElementById('nombre-paciente-display').innerText), 20, 40);
            doc.save("test_suite_dental.pdf");
            status.innerText = "✅ PDF Descargado";
        } catch (err) {
            status.innerText = "❌ Error PDF: " + err.message;
            alert("Error al crear PDF: " + err.message);
        }
    };
});
