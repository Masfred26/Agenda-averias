// ============================================================
// main.js - PRUEBA MÍNIMA DE FUNCIONALIDAD
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando PRUEBA MÍNIMA...");
    alert("Prueba Mínima: DOM Cargado. Intentando iniciar..."); // Alerta inicial

    // --- OBTENER ELEMENTOS ESENCIALES ---
    let themeToggleButton, body;
    try {
        themeToggleButton = document.getElementById('theme-toggle');
        body = document.body;

        if (!themeToggleButton || !body) {
            throw new Error("No se encontró el botón de tema o el body.");
        }
        console.log("Prueba Mínima: Elementos básicos encontrados.");
        alert("Prueba Mínima: Botón de tema encontrado."); // Confirmación

    } catch (error) {
        console.error("Error fatal obteniendo elementos básicos:", error);
        alert(`Error crítico inicial: ${error.message}`);
        return; // Detener si falla aquí
    }

    // --- FUNCIÓN PARA CAMBIAR TEMA (Simplificada) ---
    function toggleTheme() {
        try {
            alert("Prueba Mínima: ¡Botón de Tema Clickeado!"); // ¿Llega aquí?
            body.classList.toggle('dark-mode');
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
             // Actualizar texto/icono del botón
             themeToggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            alert(`Prueba Mínima: Tema cambiado a ${newTheme}`); // ¿Se completó?
        } catch (error) {
            console.error("Error en toggleTheme:", error);
            alert(`Error al cambiar tema: ${error.message}`);
        }
    }

    // --- INICIALIZACIÓN MÍNIMA ---
    try {
        console.log("Iniciando initApp Mínimo...");
        alert("Prueba Mínima: Iniciando Inicialización...");

        // 1. Cargar y aplicar tema inicial
        alert("Prueba Mínima: Cargando tema...");
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        // Actualizar texto/icono del botón de tema
        themeToggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        alert(`Prueba Mínima: Tema cargado (${savedTheme})`);

        // 2. Añadir SOLO el listener del botón de tema
        alert("Prueba Mínima: Añadiendo listener al botón de tema...");
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
            alert("Prueba Mínima: Listener añadido con éxito (aparentemente).");
        } else {
             alert("Prueba Mínima: ERROR - No se pudo añadir listener porque el botón no existe (esto no debería pasar).");
        }

        alert("Prueba Mínima: Inicialización mínima completada. Prueba el botón de tema.");
        console.log("Inicialización mínima completada.");

    } catch (error) {
        console.error("Error CRÍTICO durante initApp Mínimo:", error);
        alert(`Error crítico en la inicialización mínima: ${error.message}`);
        if(body) body.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>No se pudo iniciar la prueba mínima: ${error.message}</p>`;
    }

}); // Fin DOMContentLoaded

console.log("main.js (Prueba Mínima): Script parseado completamente.");
