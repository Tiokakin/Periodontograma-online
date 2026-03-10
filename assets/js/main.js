/**
 * Gestión de Sesión Clínica
 * Guarda los datos del operador y paciente en LocalStorage
 */

function prepararSesion() {
    const datos = {
        operador: document.getElementById('operador').value,
        paciente: document.getElementById('paciente-id').value,
        edad: document.getElementById('paciente-edad').value,
        timestamp: new Date().toLocaleString()
    };

    localStorage.setItem('sesionClinica', JSON.stringify(datos));
    console.log("Datos de sesión actualizados:", datos.paciente);
}

// Carga automática al iniciar el portal
window.addEventListener('DOMContentLoaded', () => {
    const guardados = JSON.parse(localStorage.getItem('sesionClinica'));
    if (guardados) {
        if(document.getElementById('operador')) document.getElementById('operador').value = guardados.operador || '';
        if(document.getElementById('paciente-id')) document.getElementById('paciente-id').value = guardados.paciente || '';
        if(document.getElementById('paciente-edad')) document.getElementById('paciente-edad').value = guardados.edad || '';
    }
});
