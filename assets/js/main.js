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
