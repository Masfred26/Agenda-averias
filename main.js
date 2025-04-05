// ============================================================
//          main.js - Agenda de Averías (Reconstrucción)
//          Versión: Completa con todas las funcionalidades
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Agenda Averías - Inicializando...");

    // --- Selección de Elementos del DOM ---
    const getElement = (id) => document.getElementById(id);
    const appContainer = getElement('app');
    const newAveriaTitleInput = getElement('new-averia-title');
    const newAveriaDescriptionInput = getElement('new-averia-description');
    const addAveriaButton = getElement('add-averia-button');
    const averiasListContainer = getElement('averias-list');
    const filterStatusSelect = getElement('filter-status');
    const themeToggleButton = getElement('theme-toggle');
    const averiaSuggestionsDatalist = getElement('averia-suggestions');

    // Verificar si todos los elementos existen
    if (!appContainer || !newAveriaTitleInput || !newAveriaDescriptionInput || !addAveriaButton || !averiasListContainer || !filterStatusSelect || !themeToggleButton || !averiaSuggestionsDatalist) {
        console.error("Error Crítico: Faltan elementos esenciales del DOM. Revisa IDs en index.html.");
        alert("Error al cargar la aplicación. Faltan elementos.");
        return; // Detener ejecución
    }

    // --- Constantes y Estado Global ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];
    const STORAGE_KEY = 'averias'; // Clave para localStorage
    const THEME_KEY = 'theme'; // Clave para el tema
    const DESCRIPCION_SEPARATOR = "\n\n---\n\n"; // Separador para descripciones
    let averias = []; // Array principal de datos

    // --- Funciones de Utilidad ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Fecha inválida';
        try {
            return new Date(timestamp).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formateando fecha:", timestamp, e);
            return 'Fecha errónea';
        }
    };

    // --- Funciones de Datos (LocalStorage) ---
    const loadAverias = () => {
        console.log("Cargando averías desde localStorage...");
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    // Validar y limpiar datos cargados
                    averias = parsedData.map((item, index) => {
                        if (!item || typeof item !== 'object') return null; // Marcar inválido
                        return {
                            id: item.id || Date.now() + index, // Asegurar ID único
                            title: typeof item.title === 'string' ? item.title : "Sin Cliente",
                            description: typeof item.description === 'string' ? item.description : "",
                            createdAt: item.createdAt || Date.now(),
                            status: ESTADOS_AVERIA.includes(item.status) ? item.status : "Pendiente",
                            comments: Array.isArray(item.comments) ? item.comments.filter(c => c && c.id && typeof c.text === 'string').map((c, cIndex) => ({
                                id: c.id, // Mantener ID original si existe
                                text: c.text,
                                createdAt: c.createdAt || Date.now() + cIndex
                            })) : []
                        };
                    }).filter(item => item !== null); // Eliminar inválidos
                    console.log(`Cargadas ${averias.length} averías válidas.`);
                } else {
                    console.warn("Datos en localStorage no son un array. Iniciando vacío.");
                    averias = [];
                }
            } catch (error) {
                console.error("Error parseando datos de localStorage:", error);
                averias = [];
                localStorage.removeItem(STORAGE_KEY); // Limpiar datos corruptos
            }
        } else {
            console.log("No se encontraron datos guardados. Iniciando vacío.");
            averias = [];
        }
    };

    const saveAverias = () => {
        console.log(`Guardando ${averias.length} averías en localStorage...`);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(averias));
        } catch (error) {
            console.error("Error guardando en localStorage:", error);
            alert("Error al guardar. El almacenamiento podría estar lleno.");
        }
    };

    // --- Funciones de Renderizado ---
    const renderAverias = () => {
        console.log("Renderizando lista de averías...");
        averiasListContainer.innerHTML = ''; // Limpiar siempre
        const currentFilter = filterStatusSelect.value;

        const filtered = averias.filter(a => currentFilter === 'Todos' || a.status === currentFilter);

        if (filtered.length === 0) {
            const message = currentFilter === 'Todos' ? "Aún no has añadido ninguna avería." : `No hay averías con el estado "${currentFilter}".`;
            averiasListContainer.innerHTML = `<p>${message}</p>`;
            console.log("Renderizado: Mensaje de lista vacía.");
            return;
        }

        console.log(`Renderizando ${filtered.length} averías filtradas.`);
        filtered.forEach(averia => {
            const originalIndex = averias.findIndex(a => a.id === averia.id);
            if (originalIndex === -1) {
                console.warn(`Índice no encontrado para avería ${averia.id}. Saltando renderizado.`);
                return;
            }
            try {
                const element = createAveriaElement(averia, originalIndex);
                if (element) averiasListContainer.appendChild(element);
            } catch (error) {
                console.error(`Error creando elemento para avería ${averia.id}:`, error);
            }
        });
         console.log("Renderizado de lista completado.");
    };

    const createAveriaElement = (averia, index) => {
        console.log(`Creando elemento para avería ${averia.id} en índice ${index}`);
        const div = document.createElement('div');
        div.className = 'averia-item';
        div.dataset.id = averia.id;

        // --- Crear elementos internos ---
        const header = document.createElement('div');
        header.className = 'averia-header';

        const titleElement = document.createElement('h3');
        titleElement.className = 'averia-title';
        titleElement.textContent = averia.title;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'averia-controls';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'averia-date';
        dateSpan.textContent = formatDate(averia.createdAt);

        const statusSelect = document.createElement('select');
        ESTADOS_AVERIA.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            if (averia.status === estado) option.selected = true;
            statusSelect.appendChild(option);
        });
        statusSelect.addEventListener('change', (e) => handleStatusChange(averia.id, e.target.value));

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'averia-actions';

        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'icon-up';
        moveUpButton.title = 'Subir';
        moveUpButton.disabled = (index === 0);
        moveUpButton.addEventListener('click', () => moveAveria(index, 'up'));

        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'icon-down';
        moveDownButton.title = 'Bajar';
        moveDownButton.disabled = (index >= averias.length - 1);
        moveDownButton.addEventListener('click', () => moveAveria(index, 'down'));

        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.className = 'averia-description';
        descriptionTextarea.value = averia.description;
        descriptionTextarea.placeholder = "Editar descripción...";
        descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value));

        const commentsSection = document.createElement('div');
        commentsSection.className = 'comments-section';
        commentsSection.innerHTML = `
            <h4>Comentarios</h4>
            <div class="comments-list"></div>
            <div class="add-comment-form">
                <textarea placeholder="Añadir comentario..." class="new-comment-text" rows="1"></textarea>
                <button class="add-comment-button" title="Añadir Comentario"><span class="icon-add"></span></button>
            </div>`;

        // --- Ensamblar elementos ---
        actionsDiv.appendChild(moveUpButton);
        actionsDiv.appendChild(moveDownButton);
        controlsDiv.appendChild(statusSelect);
        controlsDiv.appendChild(dateSpan); // Poner fecha después del select
        controlsDiv.appendChild(actionsDiv);
        header.appendChild(titleElement);
        header.appendChild(controlsDiv);
        div.appendChild(header);
        div.appendChild(descriptionTextarea);
        div.appendChild(commentsSection);

        // Renderizar comentarios y añadir listeners del formulario de comentario
        const commentsListContainer = commentsSection.querySelector('.comments-list');
        const addCommentButton = commentsSection.querySelector('.add-comment-button');
        const newCommentTextarea = commentsSection.querySelector('.new-comment-text');

        if (commentsListContainer) renderComments(averia.id, commentsListContainer);

        if (addCommentButton && newCommentTextarea) {
            addCommentButton.addEventListener('click', () => {
                const text = newCommentTextarea.value.trim();
                if (text) {
                    addComment(averia.id, text);
                    newCommentTextarea.value = '';
                    newCommentTextarea.style.height = 'auto'; newCommentTextarea.rows = 1; // Resetear altura
                }
            });
            newCommentTextarea.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCommentButton.click(); } });
            newCommentTextarea.addEventListener('input', () => { // Auto-ajustar altura
                 newCommentTextarea.style.height = 'auto';
                 newCommentTextarea.style.height = (newCommentTextarea.scrollHeight) + 'px';
            });
        }

        return div;
    };

    const renderComments = (averiaId, container) => {
        console.log(`Renderizando comentarios para avería ${averiaId}`);
        container.innerHTML = ''; // Limpiar
        const averia = averias.find(a => a.id === averiaId);
        if (!averia || !Array.isArray(averia.comments) || averia.comments.length === 0) {
            // container.innerHTML = '<p style="font-size: 0.85em; color: #888;">No hay comentarios.</p>';
            return;
        }

        // Ordenar comentarios (más antiguos primero)
        const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt);

        sortedComments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.dataset.commentId = comment.id;

            const textSpan = document.createElement('span');
            textSpan.className = 'comment-text';
            textSpan.textContent = comment.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'comment-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'icon-edit'; editBtn.title = 'Editar';
            editBtn.addEventListener('click', () => editCommentPrompt(averiaId, comment.id, comment.text));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-delete'; deleteBtn.title = 'Eliminar';
            deleteBtn.addEventListener('click', () => deleteComment(averiaId, comment.id));

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            item.appendChild(textSpan);
            item.appendChild(actionsDiv);
            container.appendChild(item);
        });
         console.log(`Renderizados ${sortedComments.length} comentarios para ${averiaId}`);
    };

    // --- Funciones de Lógica Principal (Acciones) ---

    const updateSuggestions = () => {
        console.log("Actualizando sugerencias...");
        averiaSuggestionsDatalist.innerHTML = '';
        const inputText = newAveriaTitleInput.value.toLowerCase();
        if (inputText.length < 1) return;

        const uniqueTitles = new Set(
            averias
                .filter(a => typeof a.title === 'string' && a.title.toLowerCase().startsWith(inputText))
                .map(a => a.title) // Obtener títulos originales
        );

        uniqueTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            averiaSuggestionsDatalist.appendChild(option);
        });
         console.log(`Sugerencias actualizadas: ${uniqueTitles.size} encontradas.`);
    };

    const addAveria = () => {
        console.log("Intentando añadir/fusionar avería...");
        const title = newAveriaTitleInput.value.trim();
        const newDescriptionText = newAveriaDescriptionInput.value.trim();

        if (!title) {
            alert('El campo "Cliente" es obligatorio.');
            newAveriaTitleInput.focus();
            return;
        }

        const titleLower = title.toLowerCase();
        const existingAveriaIndex = averias.findIndex(a => a && typeof a.title === 'string' && a.title.toLowerCase() === titleLower);

        let wasMerged = false;

        if (existingAveriaIndex > -1) {
            // --- Lógica de Fusión ---
            console.log(`Cliente existente encontrado en índice ${existingAveriaIndex}. Fusionando...`);
            try {
                // 1. Extraer avería
                const [averiaToUpdate] = averias.splice(existingAveriaIndex, 1);
                if (!averiaToUpdate || typeof averiaToUpdate !== 'object') throw new Error("Error al extraer avería para fusión.");

                // 2. Preparar actualización
                const now = Date.now();
                const nowFormatted = formatDate(now); // Usar función de formato consistente

                // 3. Añadir descripción nueva (si existe)
                if (newDescriptionText) {
                    const updateHeader = `[Actualización ${nowFormatted}]:`;
                    averiaToUpdate.description = (averiaToUpdate.description || "") + DESCRIPCION_SEPARATOR + updateHeader + "\n" + newDescriptionText;
                     console.log("Descripción añadida.");
                } else {
                     console.log("No hay nueva descripción para añadir.");
                 }

                // 4. Añadir comentario de actualización (directamente al objeto)
                const commentText = `[${formatDate(now)}] Nuevo reporte/actualización recibido.`;
                 if (!Array.isArray(averiaToUpdate.comments)) averiaToUpdate.comments = []; // Asegurar array
                 averiaToUpdate.comments.push({ id: now, text: commentText, createdAt: now });
                 console.log("Comentario de actualización añadido al objeto.");

                 // 5. Reinsertar al principio
                 averias.unshift(averiaToUpdate);
                 console.log("Avería actualizada movida al principio.");
                 wasMerged = true;
                 alert(`Avería para '${averiaToUpdate.title}' actualizada y movida al principio.`);

            } catch (error) {
                 console.error("Error durante la fusión:", error);
                 alert("Error al actualizar la avería existente.");
                 // Considerar restaurar el estado si es posible o recargar
                 loadAverias(); // Recargar para evitar inconsistencias
            }

        } else {
            // --- Crear Nueva Avería ---
            console.log("Cliente nuevo. Creando nueva avería...");
            const now = Date.now();
            const newAveria = {
                id: now,
                title: title,
                description: newDescriptionText, // Solo la nueva descripción
                createdAt: now,
                status: "Pendiente",
                comments: []
            };
            averias.unshift(newAveria);
             console.log("Nueva avería creada y añadida al principio.");
             wasMerged = false;
        }

        // --- Acciones Comunes Post-Adición/Fusión ---
        saveAverias();         // Guardar siempre el nuevo estado del array
        renderAverias();       // Renderizar siempre la lista actualizada
        updateSuggestions();   // Actualizar sugerencias
        // Limpiar formulario
        newAveriaTitleInput.value = '';
        newAveriaDescriptionInput.value = '';
        newAveriaTitleInput.focus();
        console.log(`Proceso ${wasMerged ? 'de fusión' : 'de creación'} completado.`);
    };

    const updateDescription = (id, newDescription) => {
        console.log(`Actualizando descripción para ${id}`);
        const index = averias.findIndex(a => a.id === id);
        if (index > -1) {
            averias[index].description = newDescription;
            saveAverias();
            console.log("Descripción guardada.");
            // No re-renderizar todo, el textarea ya muestra el cambio
        } else {
             console.warn(`Avería ${id} no encontrada para actualizar descripción.`);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        console.log(`Cambio de estado para ${id} a ${newStatus}`);
        const index = averias.findIndex(a => a.id === id);
        if (index === -1) {
            console.warn(`Avería ${id} no encontrada para cambiar estado.`);
            return;
        }

        if (newStatus === "Cancelada") {
            if (confirm('¿Seguro que quieres cancelar y eliminar esta avería?')) {
                 console.log(`Eliminando avería ${id}`);
                deleteAveria(id); // deleteAveria guarda y renderiza
            } else {
                console.log("Eliminación cancelada. Revirtiendo select.");
                renderAverias(); // Re-renderizar para restaurar el select al valor guardado
            }
        } else {
            updateStatus(id, newStatus); // updateStatus guarda
            // Re-renderizar solo si afecta al filtro actual
            const currentFilter = filterStatusSelect.value;
            if (currentFilter !== 'Todos' && newStatus !== currentFilter) {
                console.log("Estado cambiado y filtro activo. Re-renderizando lista.");
                renderAverias();
            }
        }
    };

    const updateStatus = (id, newStatus) => {
        const index = averias.findIndex(a => a.id === id);
        if (index > -1) {
            averias[index].status = newStatus;
            saveAverias();
            console.log(`Estado de ${id} actualizado a ${newStatus} y guardado.`);
        }
    };

    const deleteAveria = (id) => {
        averias = averias.filter(a => a.id !== id);
        saveAverias();
        renderAverias();
        updateSuggestions(); // Puede que se haya eliminado un tí
