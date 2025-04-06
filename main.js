// ============================================================
// main.js - PRUEBA INTERMEDIA (Tema, Filtro, Carga Datos, Sugerencias)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando PRUEBA INTERMEDIA...");
    // No pondremos alertas en cada paso esta vez para que sea menos molesto,
    // nos fijaremos si la funcionalidad básica sigue activa.

    // --- OBTENER ELEMENTOS DEL DOM ---
    const elements = { /* ... (Obtener TODOS los elementos como en la versión completa) ... */ };
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
        // Re-añadir los botones que quitamos antes, por si acaso el error estaba aquí
        elements.exportButton = document.getElementById('export-button');
        elements.importButton = document.getElementById('import-button');
        elements.importFileInput = document.getElementById('import-file');
        elements.installPwaButton = document.getElementById('install-pwa-button');

        const essentialElements = ['app', 'newAveriaTitleInput', 'newAveriaDescriptionInput', 'addAveriaButton', 'averiasListContainer', 'filterStatusSelect', 'themeToggleButton', 'searchInput', 'clientSuggestionsDatalist'/*, 'exportButton', 'importButton', 'importFileInput', 'installPwaButton'*/]; // Comentar los opcionales si dan error
        for (const key of essentialElements) {
             // Comprobación robusta
             if (!elements[key]) {
                 // Comprobar si es uno de los botones opcionales que podrían faltar en el HTML simplificado
                 const optionalButtons = ['exportButton', 'importButton', 'importFileInput', 'installPwaButton'];
                 if (optionalButtons.includes(key)) {
                     console.warn(`Elemento opcional no encontrado: #${key}. Continuando...`);
                 } else {
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
    let averias = [];
    let currentSearchTerm = '';
    let deferredInstallPrompt = null; // Lo necesitamos si usamos el botón PWA
     // --- INICIO CONSTANTES ---
     ESTADOS_AVERIA = [ "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido", "Recambio en almacén", "Solucionada", "Cancelada" ];
     // --- FIN CONSTANTES ---


    // --- FUNCIONES DE DATOS (localStorage) ---
    // Usar las versiones completas con validación de la Respuesta #19 / #23
    function loadAverias() { /* ... (Función COMPLETA de loadAverias con validación) ... */ }
    function saveAverias() { /* ... (Función COMPLETA de saveAverias) ... */ }
    // --- INICIO FUNCIONES DATOS ---
     function loadAverias() { console.log("Cargando averías..."); let dataToLoad = []; const storedData = localStorage.getItem('averias'); if (storedData) { try { const parsedData = JSON.parse(storedData); if (Array.isArray(parsedData)) { dataToLoad = parsedData.map(item => ({ id: item.id || Date.now() + Math.random(), title: String(item.title || 'Sin Título').trim(), description: String(item.description || ''), createdAt: !isNaN(new Date(item.createdAt)) ? new Date(item.createdAt).getTime() : Date.now(), status: ESTADOS_AVERIA.includes(item.status) ? item.status : "Pendiente", comments: Array.isArray(item.comments) ? item.comments.map(c => ({ id: c.id || Date.now() + Math.random(), text: String(c.text || ''), createdAt: !isNaN(new Date(c.createdAt)) ? new Date(c.createdAt).getTime() : Date.now(), })).sort((a, b) => a.createdAt - b.createdAt) : [] })); console.log(`Datos parseados y validados. ${dataToLoad.length} averías.`); } else { console.warn("Los datos guardados no eran un array. Ignorando."); localStorage.removeItem('averias'); } } catch (error) { console.error("Error al parsear/validar datos de localStorage:", error); alert("Hubo un error al cargar los datos guardados. Se empezará con una lista vacía."); localStorage.removeItem('averias'); } } averias = dataToLoad; console.log(`Averías cargadas: ${averias.length}`); }
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
     function updateClientSuggestions() { console.log("Actualizando sugerencias de cliente..."); try { if (!elements.clientSuggestionsDatalist) { console.error("El elemento clientSuggestionsDatalist no existe..."); return; } elements.clientSuggestionsDatalist.innerHTML = ''; const uniqueClients = [...new Set(averias.map(a => a.title || '').filter(Boolean))].sort((a, b) => a.localeCompare(b)); uniqueClients.forEach(client => { const option = document.createElement('option'); option.value = client; elements.clientSuggestionsDatalist.appendChild(option); }); console.log(`Sugerencias actualizadas: ${uniqueClients.length} clientes.`); } catch (error) { console.error("Error en updateClientSuggestions:", error); } }
     function renderAverias() { console.log("Iniciando renderAverias..."); try { if (!elements.averiasListContainer) { console.error("El elemento averiasListContainer no existe..."); return; } elements.averiasListContainer.innerHTML = ''; const selectedStatus = elements.filterStatusSelect ? elements.filterStatusSelect.value : 'Todos'; const searchTerm = currentSearchTerm.toLowerCase(); if (!Array.isArray(averias)) { console.error("Error: 'averias' no es un array..."); averias = []; } let filteredByStatus = averias.filter(a => selectedStatus === 'Todos' || a.status === selectedStatus); let filteredFinal = filteredByStatus.filter(a => { const title = String(a.title || '').toLowerCase(); const description = String(a.description || '').toLowerCase(); return title.includes(searchTerm) || description.includes(searchTerm); }); console.log(`Renderizando ${filteredFinal.length} averías filtradas.`); if (filteredFinal.length === 0) { elements.averiasListContainer.innerHTML = averias.length === 0 ? '<p>No hay averías registradas.</p>' : '<p>No se encontraron averías que coincidan con los filtros.</p>'; return; } filteredFinal.forEach(averia => { const originalIndex = averias.findIndex(original => original.id === averia.id); if (originalIndex !== -1) { const averiaElement = createAveriaElement(averia, originalIndex); elements.averiasListContainer.appendChild(averiaElement); } else { console.error(`Avería con ID ${averia.id} no encontrada en el array original...`); } }); } catch (error) { console.error("Error durante renderAverias:", error); if (elements.averiasListContainer) { elements.averiasListContainer.innerHTML = '<p style="color:red;">Error al mostrar la lista de averías.</p>'; } } console.log("renderAverias completado."); }
     function createAveriaElement(averia, index) { try { const div = document.createElement('div'); div.className = 'averia-item'; div.dataset.id = averia.id; let fechaFormateada = 'Fecha inválida'; try { fechaFormateada = new Date(averia.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { console.error("Error formateando fecha:", e); } const statusSelect = document.createElement('select'); statusSelect.title = "Cambiar estado"; ESTADOS_AVERIA.forEach(estado => { if (estado !== "Cancelada") { const option = document.createElement('option'); option.value = estado; option.textContent = estado; if (averia.status === estado) option.selected = true; statusSelect.appendChild(option); } }); const cancelOption = document.createElement('option'); cancelOption.value = "ACTION_CANCEL_DELETE"; cancelOption.textContent = "Cancelar/Eliminar..."; statusSelect.appendChild(cancelOption); statusSelect.addEventListener('change', (e) => { if (e.target.value === "ACTION_CANCEL_DELETE") { handleStatusChange(averia.id, "Cancelada"); e.target.value = averia.status; } else { handleStatusChange(averia.id, e.target.value); } }); const descriptionTextarea = document.createElement('textarea'); descriptionTextarea.className = 'averia-description'; descriptionTextarea.value = averia.description; descriptionTextarea.placeholder = "Añade o edita la descripción..."; descriptionTextarea.rows = 3; descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value)); descriptionTextarea.addEventListener('input', autoGrowTextarea); requestAnimationFrame(() => { if (document.contains(descriptionTextarea)) { autoGrowTextarea({ target: descriptionTextarea }); }}); const moveUpButton = document.createElement('button'); moveUpButton.className = 'icon-up'; moveUpButton.title = 'Subir'; moveUpButton.disabled = (index === 0); moveUpButton.addEventListener('click', () => moveAveria(index, 'up')); const moveDownButton = document.createElement('button'); moveDownButton.className = 'icon-down'; moveDownButton.title = 'Bajar'; moveDownButton.disabled = (index === averias.length - 1); moveDownButton.addEventListener('click', () => moveAveria(index, 'down')); div.innerHTML = ` <div class="averia-header"> <h3 class="averia-title"></h3> <div class="averia-meta"> <span class="averia-date"></span> <div class="averia-controls"> <div class="averia-actions"></div> </div> </div> </div> <div class="comments-section"> <h4>Comentarios</h4> <div class="comments-list"></div> <div class="add-comment-form"> <textarea placeholder="Añadir comentario..." class="new-comment-text" rows="1"></textarea> <button class="add-comment-button" title="Añadir Comentario"><span class="icon-add"></span></button> </div> </div> `; div.querySelector('.averia-title').textContent = averia.title; div.querySelector('.averia-date').textContent = fechaFormateada; div.querySelector('.averia-controls').insertBefore(statusSelect, div.querySelector('.averia-actions')); div.querySelector('.averia-actions').appendChild(moveUpButton); div.querySelector('.averia-actions').appendChild(moveDownButton); div.querySelector('.averia-header').insertAdjacentElement('afterend', descriptionTextarea); renderComments(averia.id, div.querySelector('.comments-list')); const addCommentBtn = div.querySelector('.add-comment-button'); const newCommentText = div.querySelector('.new-comment-text'); addCommentBtn.addEventListener('click', () => { const text = newCommentText.value.trim(); if (text) addComment(averia.id, text); newCommentText.value = ''; newCommentText.style.height = '40px'; }); newCommentText.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCommentBtn.click(); }}); newCommentText.addEventListener('input', autoGrowTextarea); return div; } catch (error) { console.error(`Error creando elemento para avería ID ${averia?.id}:`, error); const errorDiv = document.createElement('div'); errorDiv.style.cssText = 'padding: 10px; margin-bottom: 15px; border: 1px dashed red; color: red;'; errorDiv.textContent = `Error al mostrar la avería: ${averia?.title || `ID ${averia?.id}`}.`; return errorDiv; } }
     function autoGrowTextarea(event) { try { const textarea = event.target; if (textarea && typeof textarea.scrollHeight !== 'undefined') { textarea.style.height = 'auto'; textarea.style.height = (textarea.scrollHeight + 1) + 'px'; } } catch(e) { console.warn("Error en autoGrowTextarea:", e); } }
     function renderComments(averiaId, container) { try { if (!container) { console.error("Contenedor de comentarios no encontrado...", averiaId); return; } container.innerHTML = ''; const averia = averias.find(a => a.id === averiaId); if (!averia || !Array.isArray(averia.comments) || averia.comments.length === 0) { container.innerHTML = '<p style="font-size: 0.9em; color: #888;">(Sin comentarios)</p>'; return; } const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt); sortedComments.forEach(comment => { if (!comment || typeof comment.id === 'undefined') { console.warn("Comentario inválido...", averiaId, comment); return; } const itemDiv = document.createElement('div'); itemDiv.className = 'comment-item'; itemDiv.dataset.commentId = comment.id; itemDiv.innerHTML = ` <span class="comment-text"></span> <div class="comment-actions"> <button class="icon-edit" title="Editar comentario"></button> <button class="icon-delete" title="Eliminar comentario"></button> </div> `; itemDiv.querySelector('.comment-text').textContent = comment.text; itemDiv.querySelector('.icon-edit').addEventListener('click', () => editCommentPrompt(averiaId, comment.id, comment.text)); itemDiv.querySelector('.icon-delete').addEventListener('click', () => deleteComment(averiaId, comment.id)); container.appendChild(itemDiv); }); } catch (error) { console.error(`Error renderizando comentarios para avería ${averiaId}:`, error); if(container){ container.innerHTML = '<p style="color:red;">Error al mostrar comentarios.</p>'; } } }
     // --- FIN FUNCIONES RENDER ---


    // --- LÓGICA MANIPULACIÓN AVERÍAS (Definidas pero no todas usadas aún) ---
    // Usar las versiones completas de la Respuesta #19 / #23
    function addOrUpdateAveria() { /* ... (Función COMPLETA con merge) ... */ }
    function updateDescription(id, newDescription) { /* ... (Función COMPLETA) ... */ }
    function handleStatusChange(id, newStatus) { /* ... (Función COMPLETA) ... */ }
    function updateStatus(id, newStatus) { /* ... (Función COMPLETA) ... */ }
    function deleteAveria(id) { /* ... (Función COMPLETA) ... */ }
    function moveAveria(index, direction) { /* ... (Función COMPLETA) ... */ }
    // --- INICIO FUNCIONES MANIPULACIÓN ---
     function addOrUpdateAveria() { console.log("Intentando añadir/actualizar avería..."); try { const title = elements.newAveriaTitleInput.value.trim(); const description = elements.newAveriaDescriptionInput.value.trim(); if (!title) { alert('El campo "Cliente" es obligatorio.'); elements.newAveriaTitleInput.focus(); return; } const now = Date.now(); const clientLower = title.toLowerCase(); const existingIndex = averias.findIndex(a => a.title.toLowerCase() === clientLower); if (existingIndex > -1) { console.log(`Cliente encontrado: "${title}". Actualizando...`); const averiaToUpdate = averias.splice(existingIndex, 1)[0]; if (description) { const timestamp = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); const newDescPart = `[${timestamp}] ${description}`; const currentDescription = String(averiaToUpdate.description || ''); const separator = currentDescription ? "\n----\n" : ""; averiaToUpdate.description = `${newDescPart}${separator}${currentDescription}`; } averias.unshift(averiaToUpdate); console.log("Avería movida al inicio."); } else { console.log(`Cliente nuevo: "${title}". Creando nueva avería...`); const newAveria = { id: now + Math.random(), title: title, description: description, createdAt: now, status: "Pendiente", comments: [] }; averias.unshift(newAveria); } saveAverias(); renderAverias(); updateClientSuggestions(); elements.newAveriaDescriptionInput.value = ''; elements.newAveriaDescriptionInput.focus(); console.log("Proceso añadir/actualizar completado."); } catch (error) { console.error("Error en addOrUpdateAveria:", error); alert("Ocurrió un error al añadir o actualizar la avería."); } }
     function updateDescription(id, newDescription) { try { const averiaIndex = averias.findIndex(a => a.id === id); if (averiaIndex > -1) { const trimmedDesc = newDescription.trim(); if (averias[averiaIndex].description !== trimmedDesc) { averias[averiaIndex].description = trimmedDesc; saveAverias(); console.log(`Descripción actualizada para avería ${id}`); } } } catch (error) { console.error(`Error actualizando descripción para avería ${id}:`, error); } }
     function handleStatusChange(id, newStatus) { try { if (newStatus === "Cancelada") { if (confirm('¿Seguro que quieres ELIMINAR esta avería permanentemente?')) { deleteAveria(id); } } else { updateStatus(id, newStatus); const currentFilter = elements.filterStatusSelect.value; if (currentFilter !== 'Todos' && currentFilter !== newStatus) { renderAverias(); } } } catch (error) { console.error(`Error manejando cambio de estado para avería ${id}:`, error); } }
     function updateStatus(id, newStatus) { try { const averiaIndex = averias.findIndex(a => a.id === id); if (averiaIndex > -1 && averias[averiaIndex].status !== newStatus) { averias[averiaIndex].status = newStatus; saveAverias(); console.log(`Estado actualizado para avería ${id} a ${newStatus}`); } } catch (error) { console.error(`Error actualizando estado para avería ${id}:`, error); } }
     function deleteAveria(id) { try { const initialLength = averias.length; averias = averias.filter(a => a.id !== id); if (averias.length < initialLength) { saveAverias(); renderAverias(); updateClientSuggestions(); console.log(`Avería ${id} eliminada.`); } else { console.warn(`Se intentó eliminar avería ${id} pero no se encontró.`); } } catch (error) { console.error(`Error eliminando avería ${id}:`, error); } }
     function moveAveria(currentIndex, direction) { try { if (currentIndex < 0 || currentIndex >= averias.length) { console.error(`Índice inválido ${currentIndex} en moveAveria`); return; } const maxIndex = averias.length - 1; let newIndex = -1; if (direction === 'up' && currentIndex > 0) { newInd
