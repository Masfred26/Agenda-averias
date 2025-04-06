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
                     // Asegurar que description es string (importante para .toLowerCase())
                     if (typeof a.description !== 'string') a.description = String(a.description || '');
                     // Asegurar que title es string
                     if (typeof a.title !== 'string') a.title = String(a.title || '');

                 });
            } catch (error) {
                console.error("Error al parsear averías desde localStorage:", error);
                alert("Error al cargar datos guardados. Se empezará con una lista vacía.");
                averias = [];
                 localStorage.removeItem('averias'); // Limpiar datos corruptos
            }
        } else {
            averias = [];
        }
        console.log(`Cargadas ${averias.length} averías.`); // Log para saber si cargó algo
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
         try {
             clientSuggestionsDatalist.innerHTML = ''; // Limpiar sugerencias anteriores
             // Obtener nombres únicos asegurándose que a.title existe y es string
             const uniqueClients = [...new Set(averias.map(a => a.title || '').filter(Boolean))];
             uniqueClients.sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
             uniqueClients.forEach(client => {
                 const option = document.createElement('option');
                 option.value = client;
                 clientSuggestionsDatalist.appendChild(option);
             });
         } catch (error) {
             console.error("Error actualizando sugerencias de cliente:", error);
         }
     }


    /**
     * Renderiza la lista de averías en el contenedor HTML.
     * Aplica filtros de estado y búsqueda.
     */
    function renderAverias() {
        console.log("Iniciando renderAverias..."); // Log de inicio
        try {
            averiasListContainer.innerHTML = ''; // Limpiar lista actual
            const selectedStatusFilter = filterStatusSelect.value;
            const searchTerm = currentSearchTerm.toLowerCase();

            // 1. Filtrar por estado
            let filteredByStatus = averias.filter(averia =>
                selectedStatusFilter === 'Todos' || averia.status === selectedStatusFilter
            );

            // 2. Filtrar por término de búsqueda (sobre el resultado anterior)
             // Asegurarse que title y description son strings antes de llamar a .toLowerCase()
            let filteredAverias = filteredByStatus.filter(averia => {
                const title = String(averia.title || '').toLowerCase();
                const description = String(averia.description || '').toLowerCase();
                return title.includes(searchTerm) || description.includes(searchTerm);
            });

            console.log(`Renderizando ${filteredAverias.length} averías filtradas.`); // Log de cantidad

            if (filteredAverias.length === 0) {
                if (averias.length === 0) {
                    averiasListContainer.innerHTML = '<p>Aún no has añadido ninguna avería.</p>';
                } else {
                    averiasListContainer.innerHTML = `<p>No se encontraron averías que coincidan con los filtros seleccionados.</p>`;
                }
                return;
            }

            // Recorrer las averías filtradas y crear su HTML
            filteredAverias.forEach((averia) => {
                // Encontrar índice original en el array GLOBAL 'averias'
                const originalIndex = averias.findIndex(a => a.id === averia.id);
                if (originalIndex > -1) {
                    const averiaElement = createAveriaElement(averia, originalIndex);
                    averiasListContainer.appendChild(averiaElement);
                } else {
                     console.warn(`No se encontró índice original para avería ID: ${averia.id}`); // Aviso si algo va mal
                }
            });
        } catch (error) {
            console.error("Error fatal durante renderAverias:", error);
            averiasListContainer.innerHTML = '<p style="color: red;">Error al mostrar las averías. Revisa la consola para más detalles.</p>';
        }
         console.log("renderAverias completado."); // Log de fin
    }

    /**
     * Crea el elemento HTML para una única avería.
     * @param {object} averia - El objeto de la avería.
     * @param {number} index - El índice de la avería en el array 'averias' global (sin filtrar).
     * @returns {HTMLElement} El elemento div de la avería listo para añadir al DOM.
     */
    function createAveriaElement(averia, index) {
        // Añadido try...catch aquí por si un item individual falla
        try {
            const div = document.createElement('div');
            div.className = 'averia-item';
            div.dataset.id = averia.id;

            // Usar 'es-ES' consistentemente y añadir manejo de fecha inválida
             let fechaFormateada = 'Fecha inválida';
             try {
                fechaFormateada = new Date(averia.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
             } catch (dateError) {
                 console.error("Error formateando fecha:", dateError, "para avería:", averia.id);
             }


            // Desplegable de estados
            const statusSelect = document.createElement('select');
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    if (averia.status === estado) {
                        option.selected = true;
                    }
                    statusSelect.appendChild(option);
                }
            });
            const cancelOption = document.createElement('option');
            cancelOption.value = "CANCELAR_ELIMINAR";
            cancelOption.textContent = "Cancelar/Eliminar...";
            statusSelect.appendChild(cancelOption);

            statusSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                if (selectedValue === "CANCELAR_ELIMINAR") {
                    handleStatusChange(averia.id, "Cancelada");
                    e.target.value = averia.status; // Revertir visualmente por si cancela el confirm
                } else {
                    handleStatusChange(averia.id, selectedValue);
                }
            });

            // Textarea de descripción
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.className = 'averia-description';
            descriptionTextarea.value = String(averia.description || ''); // Asegurar string
            descriptionTextarea.placeholder = "Editar descripción...";
            descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value));
            descriptionTextarea.addEventListener('input', autoGrowTextarea);
            // Ajustar altura inicial de forma segura
            requestAnimationFrame(() => {
                if (descriptionTextarea.parentNode) { // Asegurarse que sigue en el DOM
                    autoGrowTextarea({ target: descriptionTextarea });
                }
            });

            // Botones de orden
            const moveUpButton = document.createElement('button');
            moveUpButton.className = 'icon-up';
            moveUpButton.title = 'Subir';
            moveUpButton.addEventListener('click', () => moveAveria(index, 'up'));
            if (index === 0) moveUpButton.disabled = true;

            const moveDownButton = document.createElement('button');
            moveDownButton.className = 'icon-down';
            moveDownButton.title = 'Bajar';
            moveDownButton.addEventListener('click', () => moveAveria(index, 'down'));
            if (index === averias.length - 1) moveDownButton.disabled = true;

            // Estructura HTML interna
            div.innerHTML = `
                <div class="averia-header">
                    <h3 class="averia-title">${String(averia.title || 'Sin Título')}</h3>
                    <div class="averia-controls">
                        <span class="averia-date">${fechaFormateada}</span>
                        {/* Select se insertará aquí */}
                        <div class="averia-actions">
                            {/* Botones Up/Down se insertarán aquí */}
                        </div>
                    </div>
                </div>
                {/* Textarea se insertará aquí */}
                <div class="comments-section">
                    <h4>Comentarios</h4>
                    <div class="comments-list"></div>
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

            // Renderizar comentarios y añadir listeners
            renderComments(averia.id, div.querySelector('.comments-list'));
            const addCommentButton = div.querySelector('.add-comment-button');
            const newCommentTextarea = div.querySelector('.new-comment-text');
            addCommentButton.addEventListener('click', () => { /* ... lógica add comment ... */ });
            newCommentTextarea.addEventListener('keypress', (e) => { /* ... lógica enter ... */ });
            newCommentTextarea.addEventListener('input', autoGrowTextarea);
            // Pegar lógica interna de los listeners de comentario para brevedad
             addCommentButton.addEventListener('click', () => {
                 const text = newCommentTextarea.value.trim();
                 if (text) {
                     addComment(averia.id, text);
                     newCommentTextarea.value = '';
                     newCommentTextarea.style.height = '35px';
                     newCommentTextarea.rows = 1;
                 }
             });
             newCommentTextarea.addEventListener('keypress', (e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     addCommentButton.click();
                 }
             });


            return div;

        } catch (error) {
            console.error(`Error creando elemento para avería ID ${averia?.id}:`, error);
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Error al mostrar avería ID ${averia?.id}.`;
            errorDiv.style.color = 'red';
            errorDiv.style.border = '1px dashed red';
            errorDiv.style.padding = '10px';
            errorDiv.style.marginBottom = '10px';
            return errorDiv; // Devolver un div de error
        }
    }

    /**
     * Ajusta la altura de un textarea automáticamente a su contenido.
     */
    function autoGrowTextarea(event) {
         // Añadido try-catch por si acaso
         try {
             const textarea = event.target;
             // Evitar error si no es un textarea válido
             if (textarea && typeof textarea.scrollHeight !== 'undefined') {
                 textarea.style.height = 'auto';
                 textarea.style.height = (textarea.scrollHeight) + 'px';
             }
         } catch (error) {
             console.error("Error en autoGrowTextarea:", error);
         }
    }


    /**
     * Renderiza la lista de comentarios para una avería específica.
     */
    function renderComments(averiaId, commentsListContainer) {
         // Añadido try-catch
         try {
             commentsListContainer.innerHTML = '';
             const averia = averias.find(a => a.id === averiaId);

             if (!averia || !Array.isArray(averia.comments) || averia.comments.length === 0) {
                 commentsListContainer.innerHTML = '<p style="font-size: 0.85em; color: #888;">No hay comentarios.</p>';
                 return;
             }

             const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt);

             sortedComments.forEach(comment => {
                 const commentDiv = document.createElement('div');
                 commentDiv.className = 'comment-item';
                 commentDiv.dataset.commentId = comment.id;

                 const commentTextSpan = document.createElement('span');
                 commentTextSpan.className = 'comment-text';
                 commentTextSpan.textContent = String(comment.text || ''); // Asegurar string

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
         } catch (error) {
             console.error(`Error renderizando comentarios para avería ${averiaId}:`, error);
              commentsListContainer.innerHTML = '<p style="color: red;">Error al mostrar comentarios.</p>';
         }
    }

    // --- FUNCIONES DE MANIPULACIÓN DE AVERÍAS ---

    /**
     * Añade una NUEVA avería o ACTUALIZA una existente con el mismo título/cliente.
     */
    function addOrUpdateAveria() {
        try {
            const title = newAveriaTitleInput.value.trim();
            const description = newAveriaDescriptionInput.value.trim();

            if (!title) {
                alert('El campo "Cliente" es obligatorio.');
                newAveriaTitleInput.focus();
                return;
            }

            const now = Date.now();
            const clientLower = title.toLowerCase();
            const existingIndex = averias.findIndex(a => String(a.title || '').toLowerCase() === clientLower);

            if (existingIndex > -1) {
                // ACTUALIZAR
                const averiaToUpdate = averias.splice(existingIndex, 1)[0];
                if (description) {
                    const timestamp = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const newDescPart = `[${timestamp}] ${description}`;
                    const currentDescription = String(averiaToUpdate.description || ''); // Asegurar string
                    const separator = currentDescription ? "\n----\n" : "";
                    averiaToUpdate.description = `${newDescPart}${separator}${currentDescription}`;
                }
                // Opcional: averiaToUpdate.updatedAt = now;
                averias.unshift(averiaToUpdate); // Poner al principio
                console.log(`Avería actualizada para cliente: ${title}`);
            } else {
              
