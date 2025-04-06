// ============================================================
// main.js - Agenda de Averías v2 (CON ALERTAS DE DIAGNÓSTICO)
// ============================================================

// ALERTA INICIAL: Para saber si el script empieza a ejecutarse
// alert("main.js: Script iniciado"); // Descomentar SOLO si es estrictamente necesario, muy molesto

document.addEventListener('DOMContentLoaded', () => {
    alert("main.js: DOMContentLoaded evento disparado");

    // --- ELEMENTOS DEL DOM ---
    let app, newAveriaTitleInput, newAveriaDescriptionInput, addAveriaButton, averiasListContainer, filterStatusSelect, themeToggleButton, searchInput, clientSuggestionsDatalist, exportButton, importButton, importFileInput, installPwaButton;
    try {
        alert("main.js: Obteniendo elementos del DOM...");
        app = document.getElementById('app');
        newAveriaTitleInput = document.getElementById('new-averia-title');
        newAveriaDescriptionInput = document.getElementById('new-averia-description');
        addAveriaButton = document.getElementById('add-averia-button');
        averiasListContainer = document.getElementById('averias-list');
        filterStatusSelect = document.getElementById('filter-status');
        themeToggleButton = document.getElementById('theme-toggle');
        searchInput = document.getElementById('search-input');
        clientSuggestionsDatalist = document.getElementById('client-suggestions');
        exportButton = document.getElementById('export-button');
        importButton = document.getElementById('import-button');
        importFileInput = document.getElementById('import-file');
        installPwaButton = document.getElementById('install-pwa-button');
        alert("main.js: Elementos del DOM obtenidos con éxito (aparentemente)");

        // Comprobar si algún elemento esencial es null
        if (!app || !newAveriaTitleInput || !newAveriaDescriptionInput || !addAveriaButton || !averiasListContainer || !filterStatusSelect || !themeToggleButton || !searchInput || !clientSuggestionsDatalist || !exportButton || !importButton || !importFileInput || !installPwaButton) {
            alert("¡ERROR CRÍTICO! Uno o más elementos del DOM no se encontraron. Revisa los IDs en index.html.");
            throw new Error("Error fatal: No se encontraron elementos esenciales del DOM.");
        }

    } catch (error) {
        alert(`main.js: ¡ERROR FATAL al obtener elementos del DOM! ${error.message}`);
        console.error("Error obteniendo elementos DOM:", error);
        // Detener ejecución si falla aquí, ya que nada funcionará
        return;
    }


    // --- CONSTANTES ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];

    // --- ESTADO DE LA APLICACIÓN ---
    let averias = [];
    let currentSearchTerm = '';
    let deferredInstallPrompt = null;

    // --- FUNCIONES DE DATOS (localStorage) ---
    function loadAverias() {
        alert("main.js: Dentro de loadAverias - Antes de getItem");
        const storedAverias = localStorage.getItem('averias');
        alert("main.js: Dentro de loadAverias - Después de getItem");
        if (storedAverias) {
            alert("main.js: Dentro de loadAverias - Hay datos guardados, intentando parsear...");
            try {
                 averias = JSON.parse(storedAverias);
                 alert("main.js: Dentro de loadAverias - Parseado con éxito (aparentemente)");
                 // Asegurar estructura
                 averias.forEach(a => {
                     if (!a.id) a.id = Date.now() + Math.random();
                     if (!a.createdAt) a.createdAt = Date.now();
                     if (!a.status) a.status = "Pendiente";
                     if (!a.comments) a.comments = [];
                     if (typeof a.description !== 'string') a.description = String(a.description || '');
                     if (typeof a.title !== 'string') a.title = String(a.title || '');
                 });
                 alert("main.js: Dentro de loadAverias - Estructura asegurada");
            } catch (error) {
                alert(`main.js: ¡ERROR al parsear averías! ${error.message}. Se usarán datos vacíos.`);
                console.error("Error al parsear averías desde localStorage:", error);
                averias = [];
                 localStorage.removeItem('averias');
            }
        } else {
            alert("main.js: Dentro de loadAverias - No hay datos guardados.");
            averias = [];
        }
        alert(`main.js: loadAverias completado. Número de averías: ${averias ? averias.length : 'ERROR (averias es null?)'}`);
    }

    function saveAverias() {
        // Quitar alertas de aquí para no molestar en cada acción
        try {
            localStorage.setItem('averias', JSON.stringify(averias));
        } catch (error) {
            alert(`main.js: ¡ERROR al guardar averías! ${error.message}`);
            console.error("Error al guardar averías en localStorage:", error);
        }
    }

    // --- FUNCIONES DE RENDERIZADO ---
    function populateStatusFilter() {
        alert("main.js: Dentro de populateStatusFilter");
        try {
            while (filterStatusSelect.options.length > 1) {
                filterStatusSelect.remove(1);
            }
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    filterStatusSelect.appendChild(option);
                }
            });
            alert("main.js: populateStatusFilter completado");
        } catch (error) {
            alert(`main.js: ¡ERROR en populateStatusFilter! ${error.message}`);
            console.error("Error en populateStatusFilter:", error);
        }
    }

    function updateClientSuggestions() {
        alert("main.js: Dentro de updateClientSuggestions");
         try {
             clientSuggestionsDatalist.innerHTML = '';
             const uniqueClients = [...new Set(averias.map(a => a.title || '').filter(Boolean))];
             uniqueClients.sort((a, b) => a.localeCompare(b));
             uniqueClients.forEach(client => {
                 const option = document.createElement('option');
                 option.value = client;
                 clientSuggestionsDatalist.appendChild(option);
             });
             alert("main.js: updateClientSuggestions completado");
         } catch (error) {
             alert(`main.js: ¡ERROR en updateClientSuggestions! ${error.message}`);
             console.error("Error actualizando sugerencias de cliente:", error);
         }
     }

    function renderAverias() {
        alert("main.js: Dentro de renderAverias");
        try {
            averiasListContainer.innerHTML = '';
            const selectedStatusFilter = filterStatusSelect.value;
            const searchTerm = currentSearchTerm.toLowerCase();

            let filteredByStatus = averias.filter(averia => selectedStatusFilter === 'Todos' || averia.status === selectedStatusFilter);
            let filteredAverias = filteredByStatus.filter(averia => {
                const title = String(averia.title || '').toLowerCase();
                const description = String(averia.description || '').toLowerCase();
                return title.includes(searchTerm) || description.includes(searchTerm);
            });

            alert(`main.js: Renderizando ${filteredAverias.length} averías`);

            if (filteredAverias.length === 0) {
                 averiasListContainer.innerHTML = averias.length === 0 ? '<p>Aún no has añadido ninguna avería.</p>' : '<p>No se encontraron averías que coincidan con los filtros seleccionados.</p>';
                 alert("main.js: renderAverias - No hay averías que mostrar.");
                 return; // Importante salir aquí
            }

            filteredAverias.forEach((averia, renderIndex) => {
                alert(`main.js: renderAverias - Creando elemento ${renderIndex + 1} de ${filteredAverias.length}`);
                const originalIndex = averias.findIndex(a => a.id === averia.id);
                if (originalIndex > -1) {
                    const averiaElement = createAveriaElement(averia, originalIndex);
                    averiasListContainer.appendChild(averiaElement);
                }
            });
            alert("main.js: renderAverias completado");
        } catch (error) {
            alert(`main.js: ¡ERROR en renderAverias! ${error.message}`);
            console.error("Error fatal durante renderAverias:", error);
            averiasListContainer.innerHTML = '<p style="color: red;">Error al mostrar las averías.</p>';
        }
    }

    // ... (Resto de funciones: createAveriaElement, autoGrowTextarea, renderComments, etc. SIN alertas internas para no saturar)
    // ... (Pegar aquí el resto de funciones desde la versión anterior SIN las alertas internas)
    // --- INICIO FUNCIONES PEGADAS (SIN ALERTAS INTERNAS) ---
    function createAveriaElement(averia, index) {
        try {
            const div = document.createElement('div'); div.className = 'averia-item'; div.dataset.id = averia.id;
            let fechaFormateada = 'Fecha inválida'; try { fechaFormateada = new Date(averia.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (dateError) { console.error("Error formateando fecha:", dateError, "para avería:", averia.id); }
            const statusSelect = document.createElement('select'); ESTADOS_AVERIA.forEach(estado => { if (estado !== "Cancelada") { const option = document.createElement('option'); option.value = estado; option.textContent = estado; if (averia.status === estado) { option.selected = true; } statusSelect.appendChild(option); } }); const cancelOption = document.createElement('option'); cancelOption.value = "CANCELAR_ELIMINAR"; cancelOption.textContent = "Cancelar/Eliminar..."; statusSelect.appendChild(cancelOption); statusSelect.addEventListener('change', (e) => { const selectedValue = e.target.value; if (selectedValue === "CANCELAR_ELIMINAR") { handleStatusChange(averia.id, "Cancelada"); e.target.value = averia.status; } else { handleStatusChange(averia.id, selectedValue); } });
            const descriptionTextarea = document.createElement('textarea'); descriptionTextarea.className = 'averia-description'; descriptionTextarea.value = String(averia.description || ''); descriptionTextarea.placeholder = "Editar descripción..."; descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value)); descriptionTextarea.addEventListener('input', autoGrowTextarea); requestAnimationFrame(() => { if (descriptionTextarea.parentNode) { autoGrowTextarea({ target: descriptionTextarea }); } });
            const moveUpButton = document.createElement('button'); moveUpButton.className = 'icon-up'; moveUpButton.title = 'Subir'; moveUpButton.addEventListener('click', () => moveAveria(index, 'up')); if (index === 0) moveUpButton.disabled = true;
            const moveDownButton = document.createElement('button'); moveDownButton.className = 'icon-down'; moveDownButton.title = 'Bajar'; moveDownButton.addEventListener('click', () => moveAveria(index, 'down')); if (index === averias.length - 1) moveDownButton.disabled = true;
            div.innerHTML = ` <div class="averia-header"> <h3 class="averia-title">${String(averia.title || 'Sin Título')}</h3> <div class="averia-controls"> <span class="averia-date">${fechaFormateada}</span> <div class="averia-actions"></div> </div> </div> <div class="comments-section"> <h4>Comentarios</h4> <div class="comments-list"></div> <div class="add-comment-form"> <textarea placeholder="Añadir comentario..." class="new-comment-text" rows="1"></textarea> <button class="add-comment-button" title="Añadir Comentario"><span class="icon-add"></span></button> </div> </div> `;
            div.querySelector('.averia-controls').insertBefore(statusSelect, div.querySelector('.averia-actions')); div.querySelector('.averia-header').insertAdjacentElement('afterend', descriptionTextarea); div.querySelector('.averia-actions').appendChild(moveUpButton); div.querySelector('.averia-actions').appendChild(moveDownButton);
            renderComments(averia.id, div.querySelector('.comments-list')); const addCommentButton = div.querySelector('.add-comment-button'); const newCommentTextarea = div.querySelector('.new-comment-text'); addCommentButton.addEventListener('click', () => { const text = newCommentTextarea.value.trim(); if (text) { addComment(averia.id, text); newCommentTextarea.value = ''; newCommentTextarea.style.height = '35px'; newCommentTextarea.rows = 1; } }); newCommentTextarea.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCommentButton.click(); } }); newCommentTextarea.addEventListener('input', autoGrowTextarea);
            return div;
        } catch (error) { console.error(`Error creando elemento para avería ID ${averia?.id}:`, error); const errorDiv = document.createElement('div'); errorDiv.textContent = `Error al mostrar avería ID ${averia?.id}.`; errorDiv.style.color = 'red'; errorDiv.style.border = '1px dashed red'; errorDiv.style.padding = '10px'; errorDiv.style.marginBottom = '10px'; return errorDiv; }
    }
    function autoGrowTextarea(event) { try { const textarea = event.target; if (textarea && typeof textarea.scrollHeight !== 'undefined') { textarea.style.height = 'auto'; textarea.style.height = (textarea.scrollHeight) + 'px'; } } catch (error) { console.error("Error en autoGrowTextarea:", error); } }
    function renderComments(averiaId, commentsListContainer) { try { commentsListContainer.innerHTML = ''; const averia = averias.find(a => a.id === averiaId); if (!averia || !Array.isArray(averia.comments) || averia.comments.length === 0) { commentsListContainer.innerHTML = '<p style="font-size: 0.85em; color: #888;">No hay comentarios.</p>'; return; } const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt); sortedComments.forEach(comment => { const commentDiv = document.createElement('div'); commentDiv.className = 'comment-item'; commentDiv.dataset.commentId = comment.id; const commentTextSpan = document.createElement('span'); commentTextSpan.className = 'comment-text'; commentTextSpan.textContent = String(comment.text || ''); const commentActionsDiv = document.createElement('div'); commentActionsDiv.className = 'comment-actions'; const editButton = document.createElement('button'); editButton.className = 'icon-edit'; editButton.title = 'Editar comentario'; editButton.onclick = () => editCommentPrompt(averiaId, comment.id, comment.text); const deleteButton = document.createElement('button'); deleteButton.className = 'icon-delete'; deleteButton.title = 'Eliminar comentario'; deleteButton.onclick = () => deleteComment(averiaId, comment.id); commentActionsDiv.appendChild(editButton); commentActionsDiv.appendChild(deleteButton); commentDiv.appendChild(commentTextSpan); commentDiv.appendChild(commentActionsDiv); commentsListContainer.appendChild(commentDiv); }); } catch (error) { console.error(`Error renderizando comentarios para avería ${averiaId}:`, error); commentsListContainer.innerHTML = '<p style="color: red;">Error al mostrar comentarios.</p>'; } }
    function addOrUpdateAveria() { try { const title = newAveriaTitleInput.value.trim(); const description = newAveriaDescriptionInput.value.trim(); if (!title) { alert('El campo "Cliente" es obligatorio.'); newAveriaTitleInput.focus(); return; } const now = Date.now(); const clientLower = title.toLowerCase(); const existingIndex = averias.findIndex(a => String(a.title || '').toLowerCase() === clientLower); if (existingIndex > -1) { const averiaToUpdate = averias.splice(existingIndex, 1)[0]; if (description) { const timestamp = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); const newDescPart = `[${timestamp}] ${description}`; const currentDescription = String(averiaToUpdate.description || ''); const separator = currentDescription ? "\n----\n" : ""; averiaToUpdate.description = `${newDescPart}${separator}${currentDescription}`; } averias.unshift(averiaToUpdate); console.log(`Avería actualizada para cliente: ${title}`); } else { const newAveria = { id: now + Math.random(), title: title, description: description, createdAt: now, status: "Pendiente", comments: [] }; averias.unshift(newAveria); console.log(`Nueva avería añadida para cliente: ${title}`); } saveAverias(); renderAverias(); updateClientSuggestions(); newAveriaDescriptionInput.value = ''; newAveriaDescriptionInput.focus(); } catch (error) { console.error("Error en addOrUpdateAveria:", error); alert("Ocurrió un error al añadir o actualizar la avería."); } }
    function updateDescription(id, newDescription) { try { const averiaIndex = averias.findIndex(a => a.id === id); if (averiaIndex > -1) { averias[averiaIndex].description = newDescription.trim(); saveAverias(); console.log(`Descripción actualizada para avería ${id}`); } } catch (error) { console.error(`Error actualizando descripción para avería ${id}:`, error); } }
    function handleStatusChange(id, newStatus) { try { if (newStatus === "Cancelada") { if (confirm('¿Estás seguro de que quieres cancelar y ELIMINAR esta avería permanentemente? Esta acción no se puede deshacer.')) { deleteAveria(id); } } else { updateStatus(id, newStatus); const currentFilter = filterStatusSelect.value; if (currentFilter !== 'Todos' && currentFilter !== newStatus) { renderAverias(); } } } catch (error) { console.error(`Error manejando cambio de estado para avería ${id}:`, error); } }
    function updateStatus(id, newStatus) { try { const averiaIndex = averias.findIndex(a => a.id === id); if (averiaIndex > -1 && averias[averiaIndex].status !== newStatus) { averias[averiaIndex].status = newStatus; saveAverias(); console.log(`Estado actualizado para avería ${id} a ${newStatus}`); } } catch (error) { console.error(`Error actualizando estado para avería ${id}:`, error); } }
    function deleteAveria(id) { try { averias = averias.filter(a => a.id !== id); saveAverias(); renderAverias(); updateClientSuggestions(); console.log(`Avería ${id} eliminada`); } catch (error) { console.error(`Error eliminando avería ${id}:`, error); } }
    function moveAveria(index, direction) { try { if (direction === 'up' && index > 0) { [averias[index], averias[index - 1]] = [averias[index - 1], averias[index]]; } else if (direction === 'down' && index < averias.length - 1) { [averias[index], averias[index + 1]] = [averias[index + 1], averias[index]]; } else { return; } saveAverias(); renderAverias(); } catch (error) { console.error(`Error moviendo avería en índice ${index}:`, error); } }
    function addComment(averiaId, text) { try { const averiaIndex = averias.findIndex(a => a.id === averiaId); if (averiaIndex > -1) { const newComment = { id: Date.now() + Math.random(), text: text, createdAt: Date.now() }; if (!Array.isArray(averias[averiaIndex].comments)) { averias[averiaIndex].comments = []; } averias[averiaIndex].comments.push(newComment); saveAverias(); const averiaElement = averiasListContainer.querySelector(`.averia-item[data-id="${averiaId}"]`); if (averiaElement) { renderComments(averiaId, averiaElement.querySelector('.comments-list')); } } } catch (error) { console.error(`Error añadiendo comentario a avería ${averiaId}:`, error); } }
    function editCommentPrompt(averiaId, commentId, currentText) { try { const newText = prompt("Editar comentario:", currentText); if (newText !== null && newText.trim() !== currentText) { updateComment(averiaId, commentId, newText.trim()); } else if (newText !== null && newText.
