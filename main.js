// ============================================================
// main.js - Agenda de Averías (Nueva Versión v3 - Vanilla JS)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando script...");

    // --- OBTENER ELEMENTOS DEL DOM ---
    // Es crucial que estos IDs coincidan exactamente con el HTML
    const elements = {
        app: document.getElementById('app'),
        newAveriaTitleInput: document.getElementById('new-averia-title'),
        newAveriaDescriptionInput: document.getElementById('new-averia-description'),
        addAveriaButton: document.getElementById('add-averia-button'),
        averiasListContainer: document.getElementById('averias-list'),
        filterStatusSelect: document.getElementById('filter-status'),
        themeToggleButton: document.getElementById('theme-toggle'),
        searchInput: document.getElementById('search-input'),
        clientSuggestionsDatalist: document.getElementById('client-suggestions'),
        exportButton: document.getElementById('export-button'),
        importButton: document.getElementById('import-button'),
        importFileInput: document.getElementById('import-file'),
        installPwaButton: document.getElementById('install-pwa-button')
    };

    // Verificar que todos los elementos esenciales fueron encontrados
    const essentialElements = ['app', 'newAveriaTitleInput', 'newAveriaDescriptionInput', 'addAveriaButton', 'averiasListContainer', 'filterStatusSelect', 'themeToggleButton', 'searchInput', 'clientSuggestionsDatalist', 'exportButton', 'importButton', 'importFileInput', 'installPwaButton'];
    for (const key of essentialElements) {
        if (!elements[key]) {
            const errorMsg = `Error Crítico: Elemento del DOM no encontrado: #${key}. Revisa el ID en index.html.`;
            console.error(errorMsg);
            alert(errorMsg); // Alerta para visibilidad inmediata
            // Intentar mostrar el error en la página si es posible
            if (document.body) { document.body.innerHTML = `<h1 style='color:red'>${errorMsg}</h1>`; }
            return; // Detener ejecución
        }
    }
    console.log("Elementos del DOM obtenidos correctamente.");


    // --- CONSTANTES Y ESTADO ---
    const ESTADOS_AVERIA = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada" // Cancelada se usa internamente para borrar
    ];
    let averias = []; // Array principal de datos
    let currentSearchTerm = ''; // Estado del filtro de búsqueda
    let deferredInstallPrompt = null; // Para PWA


    // --- FUNCIONES DE DATOS (localStorage) ---

    /** Carga, valida y limpia los datos de averías desde localStorage */
    function loadAverias() {
        console.log("Cargando averías...");
        let dataToLoad = [];
        const storedData = localStorage.getItem('averias');

        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    // Validar y limpiar cada objeto cargado
                    dataToLoad = parsedData.map(item => ({
                        id: item.id || Date.now() + Math.random(), // Asegurar ID
                        title: String(item.title || 'Sin Título').trim(), // Asegurar String y quitar espacios
                        description: String(item.description || ''), // Asegurar String
                        createdAt: !isNaN(new Date(item.createdAt)) ? new Date(item.createdAt).getTime() : Date.now(), // Validar y convertir fecha a timestamp
                        status: ESTADOS_AVERIA.includes(item.status) ? item.status : "Pendiente", // Validar estado
                        comments: Array.isArray(item.comments) ? item.comments.map(c => ({ // Validar comentarios
                            id: c.id || Date.now() + Math.random(),
                            text: String(c.text || ''),
                            createdAt: !isNaN(new Date(c.createdAt)) ? new Date(c.createdAt).getTime() : Date.now(),
                        })).sort((a, b) => a.createdAt - b.createdAt) : [] // Ordenar comentarios por si acaso
                    }));
                    console.log(`Datos parseados y validados. ${dataToLoad.length} averías.`);
                } else {
                    console.warn("Los datos guardados no eran un array. Ignorando.");
                    localStorage.removeItem('averias'); // Limpiar datos inválidos
                }
            } catch (error) {
                console.error("Error al parsear/validar datos de localStorage:", error);
                alert("Hubo un error al cargar los datos guardados. Se empezará con una lista vacía.");
                localStorage.removeItem('averias'); // Limpiar datos corruptos
            }
        }
        averias = dataToLoad; // Asignar datos validados (o array vacío)
        console.log(`Averías cargadas: ${averias.length}`);
    }

    /** Guarda el array de averías actual en localStorage */
    function saveAverias() {
        try {
            localStorage.setItem('averias', JSON.stringify(averias));
            // console.log("Averías guardadas en localStorage."); // Opcional: log frecuente
        } catch (error) {
            console.error("Error al guardar en localStorage:", error);
            alert("Error al guardar los datos. Puede que el almacenamiento esté lleno o que los datos sean demasiado grandes.");
        }
    }


    // --- FUNCIONES DE RENDERIZADO Y UI ---

    /** Popula el <select> de filtro por estado */
    function populateStatusFilter() {
        console.log("Poblando filtro de estado...");
        try {
            // Limpiar opciones previas (excepto "Todos")
            while (elements.filterStatusSelect.options.length > 1) {
                elements.filterStatusSelect.remove(1);
            }
            // Añadir estados válidos (excluir "Cancelada" del filtro)
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") {
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    elements.filterStatusSelect.appendChild(option);
                }
            });
            console.log("Filtro de estado poblado.");
        } catch (error) {
            console.error("Error en populateStatusFilter:", error);
            // No alertar para no bloquear
        }
    }

    /** Actualiza las sugerencias <datalist> para clientes */
    function updateClientSuggestions() {
        console.log("Actualizando sugerencias de cliente...");
        try {
            elements.clientSuggestionsDatalist.innerHTML = ''; // Limpiar
            // Usar Set para obtener clientes únicos, filtrar vacíos y ordenar
            const uniqueClients = [...new Set(averias.map(a => a.title).filter(Boolean))]
                                  .sort((a, b) => a.localeCompare(b));
            uniqueClients.forEach(client => {
                const option = document.createElement('option');
                option.value = client;
                elements.clientSuggestionsDatalist.appendChild(option);
            });
            console.log(`Sugerencias actualizadas: ${uniqueClients.length} clientes.`);
        } catch (error) {
            console.error("Error en updateClientSuggestions:", error);
        }
    }

    /** Renderiza la lista completa de averías aplicando filtros */
    function renderAverias() {
        console.log("Iniciando renderAverias...");
        try {
            elements.averiasListContainer.innerHTML = ''; // Limpiar vista

            // Aplicar filtro de estado
            const selectedStatus = elements.filterStatusSelect.value;
            const filteredByStatus = averias.filter(a => selectedStatus === 'Todos' || a.status === selectedStatus);

            // Aplicar filtro de búsqueda (sobre el resultado anterior)
            const searchTerm = currentSearchTerm.toLowerCase();
            const filteredFinal = filteredByStatus.filter(a => {
                const titleMatch = a.title.toLowerCase().includes(searchTerm);
                const descMatch = a.description.toLowerCase().includes(searchTerm);
                // Opcional: buscar también en comentarios (podría ser lento si hay muchos)
                // const commentMatch = a.comments.some(c => c.text.toLowerCase().includes(searchTerm));
                return titleMatch || descMatch /* || commentMatch */;
            });

            console.log(`Renderizando ${filteredFinal.length} averías.`);

            // Mostrar mensaje si no hay resultados
            if (filteredFinal.length === 0) {
                elements.averiasListContainer.innerHTML = averias.length === 0
                    ? '<p>No hay averías registradas.</p>'
                    : '<p>No se encontraron averías que coincidan con los filtros.</p>';
                return; // Salir si no hay nada que renderizar
            }

            // Crear y añadir elementos al DOM
            filteredFinal.forEach(averia => {
                // Encontrar el índice ORIGINAL en el array 'averias' para los botones de orden
                const originalIndex = averias.findIndex(original => original.id === averia.id);
                if (originalIndex !== -1) {
                    const averiaElement = createAveriaElement(averia, originalIndex);
                    elements.averiasListContainer.appendChild(averiaElement);
                } else {
                    console.error(`Avería con ID ${averia.id} no encontrada en el array original durante renderizado.`);
                }
            });

        } catch (error) {
            console.error("Error durante renderAverias:", error);
            elements.averiasListContainer.innerHTML = '<p style="color:red;">Error al mostrar la lista de averías.</p>';
        }
        console.log("renderAverias completado.");
    }

    /** Crea el elemento DOM para una sola avería */
    function createAveriaElement(averia, index) {
        try {
            const div = document.createElement('div');
            div.className = 'averia-item';
            div.dataset.id = averia.id; // Guardar ID para referencia

            // --- Fecha ---
            let fechaFormateada = 'Fecha inválida';
            try {
                fechaFormateada = new Date(averia.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            } catch (e) { console.error("Error formateando fecha:", e); }

            // --- Dropdown de Estado ---
            const statusSelect = document.createElement('select');
            statusSelect.title = "Cambiar estado";
            ESTADOS_AVERIA.forEach(estado => {
                if (estado !== "Cancelada") { // No permitir seleccionar Cancelada directamente
                    const option = document.createElement('option');
                    option.value = estado;
                    option.textContent = estado;
                    if (averia.status === estado) option.selected = true;
                    statusSelect.appendChild(option);
                }
            });
            const cancelOption = document.createElement('option');
            cancelOption.value = "ACTION_CANCEL_DELETE"; // Valor especial para la acción
            cancelOption.textContent = "Cancelar/Eliminar...";
            statusSelect.appendChild(cancelOption);
            statusSelect.addEventListener('change', (e) => {
                if (e.target.value === "ACTION_CANCEL_DELETE") {
                    handleStatusChange(averia.id, "Cancelada"); // Llama a la lógica de borrado
                    e.target.value = averia.status; // Revierte visualmente si el usuario cancela el confirm
                } else {
                    handleStatusChange(averia.id, e.target.value);
                }
            });

            // --- Textarea Descripción ---
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.className = 'averia-description';
            descriptionTextarea.value = averia.description;
            descriptionTextarea.placeholder = "Añade o edita la descripción...";
            descriptionTextarea.rows = 3; // Altura inicial
            descriptionTextarea.addEventListener('change', (e) => updateDescription(averia.id, e.target.value)); // Guardar al perder foco/cambiar
            descriptionTextarea.addEventListener('input', autoGrowTextarea); // Autoajustar altura
            requestAnimationFrame(() => autoGrowTextarea({ target: descriptionTextarea })); // Ajustar altura inicial

            // --- Botones de Orden ---
            const moveUpButton = document.createElement('button');
            moveUpButton.className = 'icon-up'; moveUpButton.title = 'Subir';
            moveUpButton.disabled = (index === 0); // Deshabilitar si es el primero
            moveUpButton.addEventListener('click', () => moveAveria(index, 'up'));

            const moveDownButton = document.createElement('button');
            moveDownButton.className = 'icon-down'; moveDownButton.title = 'Bajar';
            moveDownButton.disabled = (index === averias.length - 1); // Deshabilitar si es el último
            moveDownButton.addEventListener('click', () => moveAveria(index, 'down'));

            // --- Ensamblaje del HTML del Item ---
            div.innerHTML = `
                <div class="averia-header">
                    <h3 class="averia-title"></h3>
                    <div class="averia-meta">
                        <span class="averia-date"></span>
                        <div class="averia-controls">
                            <div class="averia-actions">
                                </div>
                        </div>
                    </div>
                </div>
                <div class="comments-section">
                    <h4>Comentarios</h4>
                    <div class="comments-list"></div>
                    <div class="add-comment-form">
                        <textarea placeholder="Añadir comentario..." class="new-comment-text" rows="1"></textarea>
                        <button class="add-comment-button" title="Añadir Comentario"><span class="icon-add"></span></button>
                    </div>
                </div>
            `;

            // --- Inserción de Elementos Dinámicos ---
            div.querySelector('.averia-title').textContent = averia.title; // Usar textContent por seguridad
            div.querySelector('.averia-date').textContent = fechaFormateada;
            div.querySelector('.averia-controls').insertBefore(statusSelect, div.querySelector('.averia-actions'));
            div.querySelector('.averia-actions').appendChild(moveUpButton);
            div.querySelector('.averia-actions').appendChild(moveDownButton);
            div.querySelector('.averia-header').insertAdjacentElement('afterend', descriptionTextarea);

            // --- Comentarios ---
            renderComments(averia.id, div.querySelector('.comments-list'));
            const addCommentBtn = div.querySelector('.add-comment-button');
            const newCommentText = div.querySelector('.new-comment-text');
            addCommentBtn.addEventListener('click', () => {
                const text = newCommentText.value.trim();
                if (text) addComment(averia.id, text);
                newCommentText.value = ''; // Limpiar
                newCommentText.style.height = '40px'; // Resetear altura
            });
            newCommentText.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCommentBtn.click(); }});
            newCommentText.addEventListener('input', autoGrowTextarea);

            return div; // Devuelve el elemento completo

        } catch (error) {
            console.error(`Error creando elemento para avería ID ${averia?.id}:`, error);
            // Crear un div de error para este item específico
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'padding: 10px; margin-bottom: 15px; border: 1px dashed red; color: red;';
            errorDiv.textContent = `Error al mostrar la avería: ${averia?.title || `ID ${averia?.id}`}.`;
            return errorDiv;
        }
    }

    /** Ajusta altura de textareas automáticamente */
    function autoGrowTextarea(event) {
        try {
            const textarea = event.target;
            if (textarea && typeof textarea.scrollHeight !== 'undefined') {
                textarea.style.height = 'auto'; // Necesario para recalcular bien
                textarea.style.height = (textarea.scrollHeight) + 'px';
            }
        } catch(e) { console.warn("Error en autoGrowTextarea:", e); }
    }

    /** Renderiza los comentarios de una avería */
    function renderComments(averiaId, container) {
        try {
            container.innerHTML = ''; // Limpiar
            const averia = averias.find(a => a.id === averiaId);

            if (!averia || !Array.isArray(averia.comments) || averia.comments.length === 0) {
                container.innerHTML = '<p style="font-size: 0.9em; color: #888;">(Sin comentarios)</p>';
                return;
            }

            // Ordenar comentarios (ya deberían estar ordenados por fecha al cargar/añadir)
            const sortedComments = [...averia.comments].sort((a, b) => a.createdAt - b.createdAt);

            sortedComments.forEach(comment => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'comment-item';
                itemDiv.dataset.commentId = comment.id;

                itemDiv.innerHTML = `
                    <span class="comment-text"></span>
                    <div class="comment-actions">
                        <button class="icon-edit" title="Editar comentario"></button>
                        <button class="icon-delete" title="Eliminar comentario"></button>
                    </div>
                `;
                itemDiv.querySelector('.comment-text').textContent = comment.text;
                itemDiv.querySelector('.icon-edit').addEventListener('click', () => editCommentPrompt(averiaId, comment.id, comment.text));
                itemDiv.querySelector('.icon-delete').addEventListener('click', () => deleteComment(averiaId, comment.id));
                container.appendChild(itemDiv);
            });
        } catch (error) {
            console.error(`Error renderizando comentarios para avería ${averiaId}:`, error);
            container.innerHTML = '<p style="color:red;">Error al mostrar comentarios.</p>';
        }
    }


    // --- LÓGICA PRINCIPAL DE MANIPULACIÓN DE AVERÍAS ---

    /** Añade nueva o actualiza existente (con fusión de descripción y moviendo al inicio) */
    function addOrUpdateAveria() {
        console.log("Intentando añadir/actualizar avería...");
        try {
            const title = elements.newAveriaTitleInput.value.trim();
            const description = elements.newAveriaDescriptionInput.value.trim();

            if (!title) {
                alert('El campo "Cliente" es obligatorio.');
                elements.newAveriaTitleInput.focus();
                return;
            }

            const now = Date.now();
            const clientLower = title.toLowerCase();
            const existingIndex = averias.findIndex(a => a.title.toLowerCase() === clientLower);

            if (existingIndex > -1) {
                // --- ACTUALIZAR (Fusionar y Mover al Inicio) ---
                console.log(`Cliente encontrado: "${title}". Actualizando...`);
                // 1. Obtener y remover la avería existente del array
                const averiaToUpdate = averias.splice(existingIndex, 
