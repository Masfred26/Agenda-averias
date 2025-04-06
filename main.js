// ============================================================
// main.js - PRUEBA MÁS SIMPLE (Solo Tema y Filtro)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando PRUEBA MÁS SIMPLE...");
    alert("Prueba Más Simple: Iniciando..."); // Alerta 1

    // --- OBTENER SOLO ELEMENTOS NECESARIOS ---
    let filterStatusSelect, themeToggleButton, body;
    try {
        filterStatusSelect = document.getElementById('filter-status');
        themeToggleButton = document.getElementById('theme-toggle'); // Necesario para tema
        body = document.body;

        if (!filterStatusSelect || !themeToggleButton || !body) {
            throw new Error("No se encontró filtro, botón de tema o body.");
        }
        alert("Prueba Más Simple: Elementos encontrados."); // Alerta 2

    } catch (error) {
        console.error("Error fatal obteniendo elementos:", error);
        alert(`Error crítico inicial: ${error.message}`);
        return; // Detener si falla aquí
    }

    // --- CONSTANTES ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];

    // --- FUNCIÓN PARA POBLAR FILTRO ---
    function populateStatusFilter_TestOnly() {
        console.log("Intentando poblar filtro...");
        try {
            // Limpiar (solo por si acaso, el HTML ya tiene "Todos")
            while (filterStatusSelect.options.length > 1) { filterStatusSelect.remove(1); }
            // Añadir estados
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") { // No añadir Cancelada al filtro
                    const option = document.createElement('option');
                    option.value = estado; option.textContent = estado;
                    filterStatusSelect.appendChild(option);
                }
            });
            console.log("Filtro poblado.");
            alert("Prueba Más Simple: Filtro rellenado (aparentemente)."); // Alerta 3
        } catch (error) {
            console.error("Error poblando filtro:", error);
            alert(`Error poblando filtro: ${error.message}`); // Alerta Error Filtro
        }
    }

    // --- FUNCIÓN PARA CAMBIAR TEMA (Necesaria para el listener) ---
    function toggleTheme_TestOnly() {
        try {
            console.log("Cambiando tema...");
            body.classList.toggle('dark-mode');
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            themeToggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            console.log(`Tema cambiado a ${newTheme}`);
            // Quitar alerta de aquí para no molestar en cada click
            // alert(`Prueba Más Simple: Tema cambiado a ${newTheme}`);
        } catch (error) {
            console.error("Error en toggleTheme_TestOnly:", error);
            alert(`Error al cambiar tema: ${error.message}`); // Alerta si falla el cambio
        }
    }

    // --- INICIALIZACIÓN MÍNIMA ---
    try {
        alert("Prueba Más Simple: Cargando tema..."); // Alerta 4
        // 1. Cargar tema
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        themeToggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        alert("Prueba Más Simple: Tema cargado."); // Alerta 5

        // 2. Poblar filtro
        populateStatusFilter_TestOnly(); // Llama a la función

        // 3. Añadir SOLO listener de tema
        alert("Prueba Más Simple: Añadiendo listener de tema..."); // Alerta 6
        themeToggleButton.addEventListener('click', toggleTheme_TestOnly);
        alert("Prueba Más Simple: Listener añadido."); // Alerta 7


        // NO cargar datos, NO renderizar lista, NO añadir otros listeners
        alert("Prueba Más Simple: Finalizada. Revisa estilos y filtro."); // Alerta 8
        console.log("Inicialización más simple completada.");

    } catch (error) {
        console.error("Error CRÍTICO en inicialización:", error);
        alert(`Error crítico: ${error.message}`); // Alerta Error Crítico
        if(body) body.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>${error.message}</p>`;
    }
});
console.log("main.js (Prueba Más Simple): Script parseado completamente.");
