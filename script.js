function procesarComando(texto) {
    // 1. Detectar el diente
    const matchDiente = texto.match(/diente\s*(\d[.]?\d)/);
    if (matchDiente) {
        document.getElementById('diente-actual').innerText = "Diente: " + matchDiente[1];
    }

    // 2. Determinar la cara (V para Vestibular, P para Palatino)
    let cara = null;
    if (texto.includes("vestibular")) cara = "v";
    else if (texto.includes("palatino") || texto.includes("lingual")) cara = "p";
    
    if (cara) {
        // Buscamos todos los números en el texto después de la palabra de la cara
        // Usamos una expresión regular para encontrar secuencias de números
        const numeros = texto.match(/\d/g); 
        
        if (numeros && numeros.length >= 6) {
            // Los primeros 3 son NIC (Distal, Medio, Mesial)
            // Los siguientes 3 son PS (Distal, Medio, Mesial)
            asignarValores(cara, 'd', numeros[0], numeros[3]); 
            asignarValores(cara, 'm', numeros[1], numeros[4]); 
            asignarValores(cara, 'mes', numeros[2], numeros[5]);
        }
    }

    if (texto.includes("siguiente")) {
        limpiarCampos();
    }
}

function asignarValores(cara, punto, nic, ps) {
    const idNic = `${cara}-${punto}-nic`;
    const idPs = `${cara}-${punto}-ps`;
    const idRec = `${cara}-${punto}-rec`;

    const elNic = document.getElementById(idNic);
    const elPs = document.getElementById(idPs);

    if (elNic && elPs) {
        elNic.value = nic;
        elPs.value = ps;
        
        // REC = NIC - PS
        const recCalc = parseInt(nic) - parseInt(ps);
        document.getElementById(idRec).innerText = recCalc;
        
        // Aplicar color de alerta si hay pérdida de inserción severa (NIC >= 5)
        elNic.style.backgroundColor = (nic >= 5) ? "#ffcccc" : "white";
    }
}
