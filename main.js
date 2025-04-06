// ============================================================
// main.js - Agenda de Averías v2 (con mejoras implementadas)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const app = document.getElementById('app');
    const newAveriaTitleInput = document.getElementById('new-averia-title');
    const newAveriaDescriptionInput = document.getElementById('new-averia-description');
    const addAveriaButton = document.getElementById('add-averia-button');
    const averiasListContainer = document.getElementById('averias-list');
    const filterStatusSelect = document.getElementById('filter-status');
    const themeToggleButton = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input'); // Nuevo: Campo de búsqueda
    const clientSuggestionsDatalist = document.getElementById('client-suggestions'); // Nuevo: Datalist
    const exportButton = document.getElementById('export-button'); // Nuevo: Botón exportar
    const importButton = document.getElementById('import-button'); // Nuevo: Botón importar
    const importFileInput = document.getElementById('import-file'); // Nuevo: Input file oculto
    const installPwaButton = document.getElementById('install-pwa-button'); // Nuevo: Botón instalar PWA

    // --- CONSTANTES ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];

    // --- ESTADO DE LA APLICACIÓN ---
    let averias = []; // Array que contendrá todas las averías
    let currentSearchTerm = ''; // Nuevo: Término de búsqueda actual
    let deferredInstallPrompt = null; // Nuevo: Para el evento de instalación PWA

    // --- FUNCIONES DE DATOS (localStorage) ---

    /**
     * Carga las averías desde localStorage.
     * Mantiene el orden en que fueron guardadas.
     */
    function loadAverias() {
        const storedAverias = localStorage.getItem('averias');
        if (storedAverias) {
            try {
                 averias = JSON.parse(storedAverias);
                 // Asegurarse de que cada avería tiene propiedades esenciales (retrocompatibilidad)
                 averias.forEach(a => {
                     if (!a.id) a.id = Date.now() + Math.random(); // Añadir ID si falta
                     if (!a.createdAt) a.createdAt = Date.now();
                     if (!a.status) a.status = "Pendiente";
                     if (!a.comments) a.comments = [];
                     if (typeof a.description === 'undefined') a.description = ''; // Asegurar que description existe
                 });
            } catch (error) {
                console.error("Error al parsear averías desde localStorage:", error);
                averias = [];
                 localStorage.removeItem('averias'); // Limpiar datos corruptos
            }
        } else {
            averias = [];
        }
    }

    /**
     * Guarda el array actual de averías (con su orden actual) en localStorage.
     */
    function saveAverias() {
        try {
            localStorage.setItem('averias', JSON.stringify(averias));
        } catch (error) {
            console.error("Error al guardar averías en localStorage:", error);
            alert("Hubo un error al guardar los datos. Es posible que el almacenamiento esté lleno.");
        }
    }

    // --- FUNCIONES DE RENDERIZADO (Mostrar en pantalla) ---

    /**
      * Rellena las opciones del desplegable de estados.
      */
    function populateStatusFilter() {
        // Limpiar opciones existentes (excepto "Todos")
        while (filterStatusSelect.options.length > 1) {
            filterStatusSelect.remove(1);
        }
        // Añadir estados
        ESTADOS_AVERIA.forEach(estado => {
            // No añadir "Cancelada" al filtro, ya que se eliminan
            if (estado !== "Cancelada") {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                filterStatusSelect.appendChild(option);
            }
        });
    }

     /**
      * Actualiza las sugerencias del datalist para clientes.
      */
     function updateClientSuggestions() {
         clientSuggestionsDatalist.innerHTML = ''; // Limpiar sugerencias anteriores
         const uniqueClients = [...new Set(averias.map(a => a.title).filter(Boolean))]; // Obtener nombres únicos y filtrar vacíos
         uniqueClients.sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
         uniqueClients.forEach(client => {
             const option = document.createElement('option');
             option.value = client;
             clientSuggestionsDatalist.appendChild(option);
         });
     }


    /**
     * Renderiza la lista de averías en el contenedor HTML.
     * Aplica filtros de estado y búsqueda.
     */
    function renderAverias() {
        averiasListContainer.innerHTML = ''; // Limpiar lista actual
        const selectedStatusFilter = filterStatusSelect.value;
        const searchTerm = currentSearchTerm.toLowerCase();

        // 1. Filtrar por estado
        let filteredByStatus = averias.filter(averia =>
            selectedStatusFilter === 'Todos' || averia.status === selectedStatusFilter
        );

        // 2. Filtrar por término de búsqueda (sobre el resultado anterior)
        let filteredAverias = filteredByStatus.filter(averia => {
            const titleMatch = averia.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = averia.description.toLowerCase().includes(searchTerm);
            // También buscar en comentarios (opcional, puede ralentizar)
            // const commentMatch = averia.comments.some(comment => comment.text.toLowerCase().includes(searchTerm));
            return titleMatch || descriptionMatch /* || commentMatch */;
        });


        if (filteredAverias.length === 0) {
            if (averias.length === 0) {
                 averiasListContainer.innerHTML = '<p>Aún no has añadido ninguna avería.</p>';
            } else if (selectedStatusFilter === 'Todos' && !searchTerm) {
                 // No debería pasar si averias.length > 0, pero por si acaso
                  averiasListContainer.innerHTML = '<p>Aún no has añadido ninguna avería.</p>';
            }
             else {
                averiasListContainer.innerHTML = `<p>No se encontraron averías que coincidan con los filtros seleccionados.</p>`;
            }
            return;
        }

        // Recorrer las averías filtradas y crear su HTML
        filteredAverias.forEach((averia) => {
            const originalIndex = averias.findIndex(a => a.id === averia.id); // Índice en el array SIN FILTRAR
            if (originalIndex > -1) { // Asegurarse que la encontró (debería)
                 const averiaElement = createAveriaElement(averia, originalIndex);
                 averiasListContainer.appendChild(averiaElement);
            }
        });
    }

    /**
     * Crea el elemento HTML para una única avería. (Lógica interna mayormente sin cambios)
     * @param {object} averia - El objeto de la avería.
     * @param {number} index - El índice de la avería en el array 'averias' global (sin filtrar).
     * @returns {HTMLElement} El elemento div de la avería listo para añadir al DOM.
     */
    function createAveriaElement(averia, index) {
        const div = document.createElement('div');
        div.className = 'averia-item';
        div.dataset.id = averia.id;

        const fechaCreacion = new Date(averia.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Crear desplegable de estados (excluir 'Cancelada' aquí también)
        const statusSelect = document.createElement('select');
        ESTADOS_AVERIA.forEach(estado => {
             if (estado !== "Cancelada") { // No permitir seleccionar "Cancelada" directamente
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = estado;
                if (averia.status === estado) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
             }
        });
         // Añadir opción especial para cancelar/eliminar
         const cancelOption = document.createElement('option');
         cancelOption.value = "CANCELAR_ELIMINAR"; // Valor especial
         cancelOption.textContent = "Cancelar/Eliminar...";
         statusSelect.appendChild(cancelOption);

        statusSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (selectedValue === "CANCELAR_ELIMINAR") {
                handleStatusChange(averia.id, "Cancelada"); // Usar el estado lógico "Cancelada"
                 // Revertir visualmente si no se confirma la eliminación
                 e.target.value = averia.status;
            } else {
                handleStatusChange(averia.id, selectedValue);
            }
        });


        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.className = 'averia-description';
        descriptionTextarea.value = averia.description;
        descriptionTextarea.placeholder = "Editar descripción...";
        descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value)); // 'change' es más eficiente que 'input' para guardar
        // Auto-ajustar altura inicial y al cambiar contenido (opcional)
        descriptionTextarea.addEventListener('input', autoGrowTextarea);
         requestAnimationFrame(() => autoGrowTextarea({ target: descriptionTextarea })); // Ajustar altura inicial


        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'icon-up';
        moveUpButton.title = 'Subir';
        moveUpButton.addEventListener('click', () => moveAveria(index, 'up'));
        if (index === 0) moveUpButton.disabled = true; // Deshabilitar si es el primero del array GLOBAL

        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'icon-down';
        moveDownButton.title = 'Bajar';
        moveDownButton.addEventListener('click', () => moveAveria(index, 'down'));
        if (index === averias.length - 1) moveDownButton.disabled = true; // Deshabilitar si es el último del array GLOBAL

        div.innerHTML = `
            <div class="averia-header">
                <h3 class="averia-title">${averia.title}</h3>
                <div class="averia-controls">
                    <span class="averia-date">${fechaCreacion}</span>
                    {/* Select se insertará aquí */}
                    <div class="averia-actions">
                        {/* Botones Up/Down se insertarán aquí */}
                    </div>
                </div>
            </div>
            {/* Textarea se insertará aquí */}
            <div class="comments-section">
                <h4>Comentarios</h4>
                <div class="comments-list">
                    {/* Comentarios se renderizarán aquí */}
                </div>
                <div class="add-comment-form">
                    <textarea placeholder="Añadir comentario..." class="new-comment-text" rows="1"></textarea>
                    <button class="add-comment-button" title="Añadir Comentario"><span class="icon-add"></span></button>
                </div>
            </div>
        `;

        // Insertar elementos creados
        div.querySelector('.averia-controls').insertBefore(statusSelect, div.querySelector('.averia-actions'));
        div.querySelector('.averia-header').insertAdjacentElement('afterend', descriptionTextarea);
        div.querySelector('.averia-actions').appendChild(moveUpButton);
        div.querySelector('.averia-actions').appendChild(moveDownButton);

        // Renderizar comentarios y añadir listeners para comentarios
        renderComments(averia.id, div.querySelector('.comments-list'));
        const addCommentButton = div.querySelector('.add-comment-button');
        const newCommentTextarea = div.querySelector('.new-comment-text');

        addCommentButton.addEventListener('click', () => {
            const text = newCommentTextarea.value.trim();
            if (text) {
                addComment(averia.id, text);
                newCommentTextarea.value = '';
                newCommentTextarea.style.height = '35px'; // Resetear altura
                newCommentTextarea.rows = 1;
            }
        });
        newCommentTextarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addCommentButton.click();
            }
        });
        newCommentTextarea.addEventListener('input', autoGrowTextarea); // Auto-ajuste

        return div;
    }

    /**
     * Ajusta la altura de un textarea automáticamente a su contenido.
     * @param {Event} event - El evento (usualmente 'input')
     */
    function autoGrowTextarea(event) {
        const textarea = event.target;
        textarea.style.height = 'auto'; // Resetear altura para calcular scrollHeight correctamente
        textarea.style.height = (textarea.scrollHeight) + 'px'; // Ajustar a contenido
    }


    /**
     * Renderiza la lista de comentarios para una avería específica. (Sin cambios funcionales mayores)
     */
    function renderComments(averiaId, commentsListContainer) {
        commentsListContainer.innerHTML = '';
        const averia = averias.find(a => a.id === averiaId);

        if (!averia || !averia.comments || averia.comments.length === 0) {
             commentsListContainer.innerHTML = '<p style="font-size: 0.85em; color: #888;">No hay comentarios.</p>';
            return;
        }

        // Ordenar comentarios por fecha (más antiguos primero)
        const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt);

        sortedComments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.dataset.commentId = comment.id;

            const commentTextSpan = document.createElement('span');
            commentTextSpan.className = 'comment-text';
            commentTextSpan.textContent = comment.text; // Usar textContent previene XSS

            const commentActionsDiv = document.createElement('div');
            commentActionsDiv.className = 'comment-actions';

            const editButton = document.createElement('button');
            editButton.className = 'icon-edit';
            editButton.title = 'Editar comentario';
            editButton.onclick = () => editCommentPrompt(averiaId, comment.id, comment.text);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'icon-delete';
            deleteButton.title = 'Eliminar comentario';
            deleteButton.onclick = () => deleteComment(averiaId, comment.id);

            commentActionsDiv.appendChild(editButton);
            commentActionsDiv.appendChild(deleteButton);
            commentDiv.appendChild(commentTextSpan);
            commentDiv.appendChild(commentActionsDiv);
            commentsListContainer.appendChild(commentDiv);
        });
    }

    // --- FUNCIONES DE MANIPULACIÓN DE AVERÍAS (Algunas modificadas) ---

    /**
     * Añade una NUEVA avería o ACTUALIZA una existente con el mismo título/cliente.
     * Si actualiza, añade la nueva descripción a la anterior con timestamp
     * y mueve la avería actualizada al principio de la lista.
     */
    function addOrUpdateAveria() {
        const title = newAveriaTitleInput.value.trim();
        const description = newAveriaDescriptionInput.value.trim();

        if (!title) {
            alert('El campo "Cliente" es obligatorio.');
            newAveriaTitleInput.focus();
            return;
        }

        const now = Date.now();
        const clientLower = title.toLowerCase();

        // Buscar si ya existe una avería para este cliente (insensible a mayúsculas)
        const existingIndex = averias.findIndex(a => a.title.toLowerCase() === clientLower);

        if (existingIndex > -1) {
            // --- ACTUALIZAR AVERÍA EXISTENTE ---
            // 1. Sacar la avería existente del array
            const averiaToUpdate = averias.splice(existingIndex, 1)[0];

            // 2. Preparar la nueva descripción (si la hay)
            if (description) {
                const timestamp = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const newDescPart = `[${timestamp}] ${description}`;
                 // Añadir separador si ya había descripción anterior
                 const separator = averiaToUpdate.description ? "\n----\n" : "";
                averiaToUpdate.description = `${newDescPart}${separator}${averiaToUpdate.description}`;
            }
            // 3. (Opcional) Actualizar timestamp si quieres marcar la actualización.
            //    Si no, la fecha original se mantiene. La ponemos arriba con unshift.
            // averiaToUpdate.updatedAt = now; // Necesitarías añadir este campo si lo quieres

            // 4. Poner la avería actualizada AL PRINCIPIO del array
            averias.unshift(averiaToUpdate);
            console.log(`Avería actualizada para cliente: ${title}`);

        } else {
            // --- AÑADIR NUEVA AVERÍA ---
            const newAveria = {
                id: now,
                title: title,
                description: description,
                createdAt: now,
                status: "Pendiente", // Estado inicial por defecto
                comments: [] // Array vacío para futuros comentarios
            };
            averias.unshift(newAveria); // Añadir al principio
             console.log(`Nueva avería añadida para cliente: ${title}`);
        }

        saveAverias();
        renderAverias();
         updateClientSuggestions(); // Actualizar sugerencias por si es un cliente nuevo

        // Limpiar formulario
        // newAveriaTitleInput.value = ''; // No limpiar título para facilitar añadir más a la misma
        newAveriaDescriptionInput.value = '';
        newAveriaDescriptionInput.focus(); // Poner foco en descripción para la siguiente entrada
    }


    /**
     * Actualiza la descripción de una avería específica (desde el textarea de la tarjeta).
     */
    function updateDescription(id, newDescription) {
        const averiaIndex = averias.findIndex(a => a.id === id);
        if (averiaIndex > -1) {
            averias[averiaIndex].description = newDescription.trim(); // Quitar espacios extra
            saveAverias();
            console.log(`Descripción actualizada para avería ${id}`);
             // No re-renderizar todo, el cambio ya está en el textarea
        }
    }

    /**
     * Maneja el cambio de estado. Si es "Cancelada", pide confirmación para eliminar.
     */
    function handleStatusChange(id, newStatus) {
        if (newStatus === "Cancelada") {
            if (confirm('¿Estás seguro de que quieres cancelar y ELIMINAR esta avería permanentemente? Esta acción no se puede deshacer.')) {
                deleteAveria(id);
            }
             // Si no confirma, la selección ya se revirtió visualmente en el listener del select
        } else {
            updateStatus(id, newStatus);
            // Si hay un filtro de estado activo y la avería ya no cumple, re-renderizar
            const currentFilter = filterStatusSelect.value;
            if (currentFilter !== 'Todos' && currentFilter !== newStatus) {
                renderAverias();
            }
        }
    }

    /**
     * Actualiza el estado de 
