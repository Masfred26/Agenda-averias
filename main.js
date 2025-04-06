// ============================================================
// main.js - PRUEBA SIN loadAverias()
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando PRUEBA SIN loadAverias()...");

    // --- OBTENER ELEMENTOS DEL DOM ---
    const elements = { /* ... (Obtener TODOS los elementos como en la versión #19/#23) ... */ };
    // --- INICIO OBTENER ELEMENTOS ---
    try {
        elements.app = document.getElementById('app');
        elements.newAveriaTitleInput = document.getElementById('new-averia-title');
        elements.newAveriaDescriptionInput = document.getElementById('new-averia-description');
        elements.addAveriaButton = document.getElementById('add-averia-button');
        elements.averiasListContainer = document.getElementById('averias-list');
        elements.filterStatusSelect = document.getElementById('filter-status');
        elements.themeToggleButton = document.getElementById('theme-toggle');
        elements.searchInput = document.getElementById('search-input');
        elements.clientSuggestionsDatalist = document.getElementById('client-suggestions');
        elements.exportButton = document.getElementById('export-button');
        elements.importButton = document.getElementById('import-button');
        elements.importFileInput = document.getElementById('import-file');
        elements.installPwaButton = document.getElementById('install-pwa-button');

        const essentialElements = ['app', 'newAveriaTitleInput', 'newAveriaDescriptionInput', 'addAveriaButton', 'averiasListContainer', 'filterStatusSelect', 'themeToggleButton', 'searchInput', 'clientSuggestionsDatalist'];
        for (const key of essentialElements) {
             if (!elements[key]) {
                 const optionalButtons = ['exportButton', 'importButton', 'importFileInput', 'installPwaButton'];
                 if (optionalButtons.includes(key) && document.getElementById(key)) { // Check if element exists even if optional list had typo
                     console.warn(`Elemento opcional no encontrado: #${key}. Continuando...`);
                 } else if (!optionalButtons.includes(key)) { // Only throw for non-optionals
                     throw new Error(`Falta elemento DOM esencial: #${key}`);
                 }
             }
        }
        console.log("Elementos del DOM obtenidos correctamente.");
    } catch (error) {
        console.error("Error fatal al obtener elementos DOM:", error);
        alert(`Error crítico al iniciar: ${error.message}`);
         try { document.body.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>No se pudo iniciar la aplicación: ${error.message}. Revisa los IDs en index.html.</p>`; } catch(e){}
        return;
    }
    // --- FIN OBTENER ELEMENTOS ---


    // --- CONSTANTES Y ESTADO ---
    const ESTADOS_AVERIA = [ /* ... (igual que antes) ... */ ];
    let averias = []; // Inicializar como array vacío SIEMPRE en esta prueba
    let currentSearchTerm = '';
    let deferredInstallPrompt = null;
     // --- INICIO CONSTANTES ---
     ESTADOS_AVERIA = [ "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido", "Recambio en almacén", "Solucionada", "Cancelada" ];
     // --- FIN CONSTANTES ---


    // --- FUNCIONES DE DATOS (localStorage) ---
    // *** loadAverias ESTÁ DEFINIDA PERO NO SE LLAMA EN initApp ***
    function loadAverias() { console.warn("loadAverias() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... (código completo de loadAverias) ... */ }
    function saveAverias() { /* ... (código completo de saveAverias) ... */ }
    // --- INICIO FUNCIONES DATOS ---
    function loadAverias() { console.warn("loadAverias() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); console.log("Cargando averías..."); let dataToLoad = []; const storedData = localStorage.getItem('averias'); if (storedData) { try { const parsedData = JSON.parse(storedData); if (Array.isArray(parsedData)) { dataToLoad = parsedData.map(item => ({ id: item.id || Date.now() + Math.random(), title: String(item.title || 'Sin Título').trim(), description: String(item.description || ''), createdAt: !isNaN(new Date(item.createdAt)) ? new Date(item.createdAt).getTime() : Date.now(), status: ESTADOS_AVERIA.includes(item.status) ? item.status : "Pendiente", comments: Array.isArray(item.comments) ? item.comments.map(c => ({ id: c.id || Date.now() + Math.random(), text: String(c.text || ''), createdAt: !isNaN(new Date(c.createdAt)) ? new Date(c.createdAt).getTime() : Date.now(), })).sort((a, b) => a.createdAt - b.createdAt) : [] })); console.log(`Datos parseados y validados. ${dataToLoad.length} averías.`); } else { console.warn("Los datos guardados no eran un array. Ignorando."); localStorage.removeItem('averias'); } } catch (error) { console.error("Error al parsear/validar datos de localStorage:", error); alert("Hubo un error al cargar los datos guardados. Se empezará con una lista vacía."); localStorage.removeItem('averias'); } } averias = dataToLoad; console.log(`Averías cargadas: ${averias.length}`); }
    function saveAverias() { try { localStorage.setItem('averias', JSON.stringify(averias)); } catch (error) { console.error("Error al guardar en localStorage:", error); alert("Error al guardar los datos. Es posible que el almacenamiento esté lleno o que los datos sean demasiado grandes."); } }
    // --- FIN FUNCIONES DATOS ---


    // --- FUNCIONES DE RENDERIZADO Y UI ---
    // Usar las versiones completas de la Respuesta #19 / #23
    function populateStatusFilter() { /* ... (Función COMPLETA) ... */ }
    function updateClientSuggestions() { /* ... (Función COMPLETA) ... */ }
    // Dejamos renderAverias y createAveriaElement definidas pero NO las llamamos en initApp aún
    function renderAverias() { /* ... (Función COMPLETA) ... */ }
    function createAveriaElement(averia, index) { /* ... (Función COMPLETA) ... */ }
    function autoGrowTextarea(event) { /* ... (Función COMPLETA) ... */ }
    function renderComments(averiaId, container) { /* ... (Función COMPLETA) ... */ }
    // --- INICIO FUNCIONES RENDER ---
     function populateStatusFilter() { console.log("Poblando filtro de estado..."); try { if (!elements.filterStatusSelect) { console.error("El elemento filterStatusSelect no existe..."); return; } while (elements.filterStatusSelect.options.length > 1) { elements.filterStatusSelect.remove(1); } ESTADOS_AVERIA.forEach(estado => { if (estado !== "Cancelada") { const option = document.createElement('option'); option.value = estado; option.textContent = estado; elements.filterStatusSelect.appendChild(option); } }); console.log("Filtro de estado poblado."); } catch (error) { console.error("Error en populateStatusFilter:", error); } }
     function updateClientSuggestions() { console.log("Actualizando sugerencias de cliente..."); try { if (!elements.clientSuggestionsDatalist) { console.error("El elemento clientSuggestionsDatalist no existe..."); return; } elements.clientSuggestionsDatalist.innerHTML = ''; const uniqueClients = [...new Set(averias.map(a => a.title || '').filter(Boolean))].sort((a, b) => a.localeCompare(b)); uniqueClients.forEach(client => { const option = document.createElement('option'); option.value = client; elements.clientSuggestionsDatalist.appendChild(option); }); console.log(`Sugerencias actualizadas: ${uniqueClients.length} clientes (basado en array actual).`); } catch (error) { console.error("Error en updateClientSuggestions:", error); } }
     function renderAverias() { console.warn("renderAverias() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... (código completo) ... */ }
     function createAveriaElement(averia, index) { console.warn("createAveriaElement() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... (código completo) ... */ }
     function autoGrowTextarea(event) { /* ... (código completo) ... */ }
     function renderComments(averiaId, container) { console.warn("renderComments() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... (código completo) ... */ }
    // --- FIN FUNCIONES RENDER ---


    // --- LÓGICA MANIPULACIÓN AVERÍAS (Definidas pero no usadas aún) ---
    function addOrUpdateAveria() { /* ... (Función COMPLETA con merge) ... */ }
    function updateDescription(id, newDescription) { /* ... (Función COMPLETA) ... */ }
    function handleStatusChange(id, newStatus) { /* ... (Función COMPLETA) ... */ }
    function updateStatus(id, newStatus) { /* ... (Función COMPLETA) ... */ }
    function deleteAveria(id) { /* ... (Función COMPLETA) ... */ }
    function moveAveria(index, direction) { /* ... (Función COMPLETA) ... */ }
     // --- INICIO FUNCIONES MANIPULACIÓN ---
     function addOrUpdateAveria() { console.warn("addOrUpdateAveria() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function updateDescription(id, newDescription) { console.warn("updateDescription() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function handleStatusChange(id, newStatus) { console.warn("handleStatusChange() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function updateStatus(id, newStatus) { console.warn("updateStatus() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function deleteAveria(id) { console.warn("deleteAveria() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function moveAveria(index, direction) { console.warn("moveAveria() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     // --- FIN FUNCIONES MANIPULACIÓN ---


    // --- FUNCIONES DE COMENTARIOS (Definidas pero no usadas aún) ---
    function addComment(averiaId, text) { /* ... (Función COMPLETA) ... */ }
    function editCommentPrompt(averiaId, commentId, currentText) { /* ... (Función COMPLETA) ... */ }
    function updateComment(averiaId, commentId, newText) { /* ... (Función COMPLETA) ... */ }
    function deleteComment(averiaId, commentId) { /* ... (Función COMPLETA) ... */ }
    // --- INICIO FUNCIONES COMENTARIOS ---
     function addComment(averiaId, text) { console.warn("addComment() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function editCommentPrompt(averiaId, commentId, currentText) { console.warn("editCommentPrompt() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function updateComment(averiaId, commentId, newText) { console.warn("updateComment() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function deleteComment(averiaId, commentId) { console.warn("deleteComment() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     // --- FIN FUNCIONES COMENTARIOS ---


    // --- FUNCIONES IMPORT/EXPORT Y PWA (Definidas pero no usadas aún) ---
    function exportToJson() { /* ... (Función COMPLETA) ... */ }
    function triggerImport() { /* ... (Función COMPLETA) ... */ }
    function importFromJson(event) { /* ... (Función COMPLETA) ... */ }
    function saveInstallPrompt(e) { /* ... (Función COMPLETA) ... */ }
    function promptInstall() { /* ... (Función COMPLETA) ... */ }
    // --- INICIO FUNCIONES EXTRA ---
     function exportToJson() { console.warn("exportToJson() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function triggerImport() { console.warn("triggerImport() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function importFromJson(event) { console.warn("importFromJson() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function saveInstallPrompt(e) { console.warn("saveInstallPrompt() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     function promptInstall() { console.warn("promptInstall() NO DEBERÍA EJECUTARSE EN ESTA PRUEBA"); /* ... */ }
     // --- FIN FUNCIONES EXTRA ---


    // --- INICIALIZACIÓN Y EVENT LISTENERS ---
    function initApp() {
        console.log("Iniciando initApp (Prueba SIN loadAverias)...");
        try {
            // 1. Cargar tema visual
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
            if(elements.themeToggleButton) elements.themeToggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
            console.log("Tema cargado.");

            // 2. Cargar datos *** (COMENTADO) ***
            // loadAverias();
            console.log("*** LLAMADA A loadAverias() COMENTADA ***");
            averias = []; // Asegurar que es un array vacío para updateClientSuggestions

            // 3. Preparar UI (filtros, sugerencias)
            populateStatusFilter();    // Esta sí se ejecuta
            updateClientSuggestions(); // Esta sí se ejecuta (con averias = [])
            console.log("Filtro y sugerencias (vacías) preparadas.");

            // 4. Renderizar la lista inicial *** (SIGUE COMENTADO) ***
            // renderAverias();
            console.log("*** LLAMADA A renderAverias() SIGUE COMENTADA ***");
            if (elements.averiasListContainer) elements.averiasListContainer.innerHTML = '<p><i>Renderizado desactivado. Prueba sin carga de datos.</i></p>';


            // --- 5. Añadir Event Listeners (SOLO TEMA Y FILTRO POR AHORA) ---
            console.log("Añadiendo listeners (SOLO TEMA Y FILTRO)...");

            if(elements.themeToggleButton) elements.themeToggleButton.addEventListener('click', () => {
                try {
                    document.body.classList.toggle('dark-mode');
                    const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
                    localStorage.setItem('theme', newTheme);
                    elements.themeToggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
                } catch(e){ console.error("Error en listener de tema:", e);}
            }); else console.error("Listener no añadido: themeToggleButton no existe");

            if(elements.filterStatusSelect) elements.filterStatusSelect.addEventListener('change', () => {
                 console.log(`Filtro cambiado a: ${elements.filterStatusSelect.value}`);
                 alert(`Filtro cambiado a: ${elements.filterStatusSelect.value}. El renderizado está desactivado.`);
            }); else console.error("Listener no añadido: filterStatusSelect no existe");

            // ---- OTROS LISTENERS COMENTADOS ----
            console.log("Otros listeners NO añadidos para esta prueba.");

            console.log("Aplicación inicializada (Prueba SIN loadAverias).");
            alert("Prueba SIN Carga de Datos: Finalizada. Revisa tema y filtro."); // Alerta final

        } catch (error) {
             console.error("Error CRÍTICO durante initApp (Prueba SIN loadAverias):", error);
             const errorMsg = `Error crítico al iniciar: ${error.message}.`;
             alert(errorMsg);
              if(elements.app) elements.app.innerHTML = `<h1 style='color:red'>Error Crítico</h1><p>${error.message}</p>`;
         }
    }

    // --- EJECUTAR INICIALIZACIÓN ---
    initApp();

}); // Fin DOMContentLoaded Listener

console.log("main.js (Prueba SIN loadAverias): Script parseado completamente.");

