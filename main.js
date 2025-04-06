// ============================================================
// main.js - PRUEBA ULTRA-MÍNIMA (Filtro y Tema)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando PRUEBA ULTRA-MÍNIMA...");

    // --- OBTENER SOLO ELEMENTOS NECESARIOS PARA ESTA PRUEBA ---
    let filterStatusSelect, themeToggleButton, body;
    try {
        filterStatusSelect = document.getElementById('filter-status');
        themeToggleButton = document.getElementById('theme-toggle');
        body = document.body;

        if (!filterStatusSelect || !themeToggleButton || !body) {
            throw new Error("No se encontró filtro, botón de tema o body.");
        }
        console.log("Prueba Ultra-Mínima: Elementos básicos encontrados.");

    } catch (error) {
        console.error("Error fatal obteniendo elementos:", error);
        alert(`Error crítico inicial: ${error.message}`);
        if (document.body) { document.body.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>No se pudo iniciar la prueba: ${error.message}.</p>`; }
        return;
    }

    // --- CONSTANTES ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];

    // --- FUNCIÓN PARA POBLAR FILTRO (Simplificada) ---
    function populateStatusFilter_Test() {
        console.log("Intentando poblar filtro...");
        try {
            // Limpiar (solo por si acaso)
            while (filterStatusSelect.options.length > 1) {
                filterStatusSelect.remove(1);
            }
            // Añadir estados
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    filterStatusSelect.appendChild(option);
                }
            });
            console.log("Filtro poblado con éxito (aparentemente).");
            alert("Prueba Ultra-Mínima: Filtro rellenado."); // Alerta de éxito
        } catch (error) {
            console.error("Error en populateStatusFilter_Test:", error);
            alert(`Error al rellenar el filtro: ${error.message}`); // Alerta de error
        }
    }

    // --- FUNCIÓN PARA CAMBIAR TEMA (Simplificada) ---
    function toggleTheme_Test() {
        try {
            console.log("Cambiando tema...");
            body.classList.toggle('dark-mode');
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            themeToggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            console.log(`Tema cambiado a ${newTheme}`);
            alert(`Prueba Ultra-Mínima: Tema cambiado a ${newTheme}`); // Alerta de éxito
        } catch (error) {
            console.error("Error en toggleTheme_Test:", error);
            alert(`Error al cambiar tema: ${error.message}`); // Alerta de error
        }
    }


    // --- INICIALIZACIÓN ULTRA-MÍNIMA ---
    try {
        console.log("Iniciando initApp Ultra-Mínimo...");
        alert("Prueba Ultra-Mínima: Iniciando...");

        // 1. Cargar tema (sabemos que esto funcionaba)
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        themeToggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        alert("Prueba Ultra-Mínima: Tema cargado.");

        // 2. Intentar poblar el filtro
        populateStatusFilter_Test(); // Llama a la función de poblar filtro

        // 3. Añadir SOLO listener de tema y filtro (opcional)
         alert("Prueba Ultra-Mínima: Añadiendo listener de tema...");
        themeToggleButton.addEventListener('click', toggleTheme_Test);
        // Opcional: Añadir listener al filtro para ver si responde
        // filterStatusSelect.addEventListener('change', () => {
        //     alert(`Filtro cambiado a: ${filterStatusSelect.value}`);
        // });
        alert("Prueba Ultra-Mínima: Listener de tema añadido.");


        alert("Prueba Ultra-Mínima: Finalizada. Revisa el filtro y prueba el botón de tema.");
        console.log("Inicialización ultra-mínima completada.");

    } catch (error) {
         console.error("Error CRÍTICO durante initApp Ultra-Mínimo:", error);
         alert(`Error crítico: ${error.message}`);
         if(body) body.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>${error.message}</p>`;
     }

}); // Fin DOMContentLoaded

console.log("main.js (Prueba Ultra-Mínima): Script parseado completamente.");
