// assets/js/main.js

function prepararSesion() {
    const operador = document.getElementById('operador').value;
    const paciente = document.getElementById('paciente-id').value;
    const edad = document.getElementById('paciente-edad').value;

    if (!paciente) {
        alert("Por favor, ingrese al menos el nombre del paciente.");
        return;
    }

    const sesion = {
        operador: operador,
        paciente: paciente,
        edad: edad,
        fecha: new Date().toLocaleDateString(),
        id_sesion: Date.now()
    };

    // Guardamos la sesión activa
    localStorage.setItem('SesionClinica', JSON.stringify(sesion));
}
// FUNCIÓN PARA GENERAR EL REPORTE
function generarReporteConsolidado() {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    const historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];

    if (!sesion || !sesion.paciente) {
        alert("Primero debe ingresar los datos del paciente en el portal.");
        return;
    }

    const ventanaReporte = window.open('', '_blank');
    
    // Aquí definimos el diseño profesional del PDF/Informe
    ventanaReporte.document.write(`
        <html>
        <head>
            <title>Informe - ${sesion.paciente}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print { .no-print { display: none; } }
                body { background-color: white; padding: 2cm; }
            </style>
        </head>
        <body>
            <div class="max-w-4xl mx-auto border-2 border-slate-100 p-10 rounded-3xl">
                <div class="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 uppercase">Informe Dental Digital</h1>
                        <p class="text-blue-600 font-bold text-xs uppercase tracking-widest">Ecosistema DentalSuite</p>
                    </div>
                    <div class="text-right text-xs text-slate-400 font-mono">
                        <p>ID: ${sesion.id_sesion}</p>
                        <p>Fecha: ${sesion.fecha}</p>
                    </div>
                </div>

                <div class="bg-slate-50 p-6 rounded-2xl grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Paciente</p>
                        <p class="text-lg font-bold text-slate-800">${sesion.paciente}</p>
                        <p class="text-sm text-slate-500">Edad: ${sesion.edad} años</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Operador</p>
                        <p class="text-lg font-bold text-slate-800">${sesion.operador || 'No especificado'}</p>
                    </div>
                </div>

                <h3 class="text-sm font-black text-slate-900 uppercase mb-4 tracking-tighter">Resumen de Hallazgos</h3>
                <table class="w-full mb-10 border-collapse">
                    <thead>
                        <tr class="bg-slate-900 text-white text-[10px] uppercase">
                            <th class="p-3 text-left">Especialidad</th>
                            <th class="p-3 text-left">Pieza</th>
                            <th class="p-3 text-left">Hallazgo Detectado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historial.length > 0 ? historial.map(h => `
                            <tr class="border-b border-slate-100 text-sm">
                                <td class="p-3 font-bold text-blue-600">${h.tipo_app}</td>
                                <td class="p-3 font-mono">${h.diente}</td>
                                <td class="p-3 text-slate-600">${h.detalle}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="3" class="p-10 text-center text-slate-300 italic">No hay registros para mostrar</td></tr>'}
                    </tbody>
                </table>

                <div class="flex justify-between items-center mt-20 pt-10 border-t border-dashed">
                    <p class="text-[9px] text-slate-400 uppercase">Documento generado digitalmente vía Reconocimiento de Voz</p>
                    <button onclick="window.print()" class="no-print bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition">Imprimir Informe</button>
                </div>
            </div>
        </body>
        </html>
    `);
    ventanaReporte.document.close();
}
// Función para verificar si hay datos frescos de la ficha clínica
window.addEventListener('DOMContentLoaded', () => {
    // Intentamos leer si la app "Ficha Clínica" guardó datos nuevos
    const fichaReciente = JSON.parse(localStorage.getItem('SesionClinica'));
    
    if (fichaReciente) {
        // Rellenamos los campos del portal automáticamente si están vacíos
        const inputOperador = document.getElementById('operador');
        const inputPaciente = document.getElementById('paciente-id');
        const inputEdad = document.getElementById('paciente-edad');

        if (inputPaciente && !inputPaciente.value) inputPaciente.value = fichaReciente.paciente || '';
        if (inputEdad && !inputEdad.value) inputEdad.value = fichaReciente.edad || '';
        if (inputOperador && !inputOperador.value) inputOperador.value = fichaReciente.operador || '';
    }
});
