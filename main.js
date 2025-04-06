// Constantes y variables globales
const ESTADOS_AVERIA = ["Pendiente", "En proceso", "Pedir recambio", "Recambio pedido", "Recambio en almacén", "Solucionada", "Cancelada"];
let averias = [];
let deferredPrompt = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const installBtn = document.getElementById('install-btn');
    const averiaForm = document.getElementById('averia-form');
    const clienteInput = document.getElementById('cliente-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const clientesDatalist = document.getElementById('clientes-datalist');
    const averiasList = document.getElementById('averias-list');
    const offlineIndicator = document.getElementById('offline-indicator');

    // Inicialización
    loadTheme();
    loadData();
    
    // Event listeners para controles principales
    searchInput.addEventListener('input', renderAverias);
    filterSelect.addEventListener('change', renderAverias);
    themeToggle.addEventListener('click', toggleTheme);
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importData);
    averiaForm.addEventListener('submit', handleFormSubmit);
    
    // Event listeners para estado online/offline
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    // Event listener para instalación de PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });
    
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar la PWA');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        }
    });
});

// Función para cargar datos desde localStorage
function loadData() {
    try {
        const storedData = localStorage.getItem('averias');
        if (storedData) {
            averias = JSON.parse(storedData);
            
            // Validación básica de datos
            averias = averias.filter(averia => {
                return averia && 
                       typeof averia === 'object' && 
                       averia.id && 
                       averia.title && 
                       typeof averia.title === 'string' &&
                       typeof averia.status === 'string' &&
                       Array.isArray(averia.comments);
            });
            
            // Asegurar que cada avería tiene los campos necesarios
            averias.forEach(averia => {
                averia.description = averia.description || "";
                averia.createdAt = averia.createdAt || Date.now();
                averia.status = averia.status || "Pendiente";
                averia.comments = Array.isArray(averia.comments) ? averia.comments : [];
            });
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        averias = [];
    }
    
    updateClientSuggestions();
    renderAverias();
}

// Función para guardar datos en localStorage
function saveData() {
    try {
        localStorage.setItem('averias', JSON.stringify(averias));
    } catch (error) {
        console.error('Error al guardar datos:', error);
        alert('Error al guardar datos. Es posible que el almacenamiento esté lleno.');
    }
}

// Función para añadir o actualizar una avería
function handleFormSubmit(event) {
    event.preventDefault();
    
    const clienteInput = document.getElementById('cliente-input');
    const descripcionInput = document.getElementById('descripcion-input');
    
    const clienteName = clienteInput.value.trim();
    const description = descripcionInput.value.trim();
    
    if (!clienteName) {
        alert('El nombre del cliente es obligatorio');
        return;
    }
    
    // Buscar si ya existe una avería con el mismo nombre de cliente
    const existingAveriaIndex = averias.findIndex(a => 
        a.title.toLowerCase() === clienteName.toLowerCase()
    );
    
    if (existingAveriaIndex !== -1) {
        // Actualizar avería existente
        const averia = averias[existingAveriaIndex];
        
        if (description) {
            const now = new Date();
            const timeStamp = `[${now.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            })} ${now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })}]`;
            
            const newText = `${timeStamp} ${description}`;
            
            if (averia.description) {
                averia.description = newText + '\n----\n' + averia.description;
            } else {
                averia.description = newText;
            }
        }
        
        // Actualizar timestamp y mover al inicio
        averia.createdAt = Date.now();
        averias.splice(existingAveriaIndex, 1);
        averias.unshift(averia);
        
    } else {
        // Crear nueva avería
        const newAveria = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: clienteName,
            description: description,
            createdAt: Date.now(),
            status: "Pendiente",
            comments: []
        };
        
        averias.unshift(newAveria);
    }
    
    // Guardar, actualizar UI y limpiar formulario
    saveData();
    renderAverias();
    updateClientSuggestions();
    descripcionInput.value = '';
    descripcionInput.focus();
}

// Función para renderizar la lista de averías
function renderAverias() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const averiasList = document.getElementById('averias-list');
    
    const searchTerm = searchInput.value.toLowerCase();
    const filterStatus = filterSelect.value;
    
    // Filtrar averías según los criterios
    let filteredAverias = averias.filter(averia => {
        // Filtrar por estado
        if (filterStatus !== 'all' && averia.status !== filterStatus) {
            return false;
        }
        
        // Filtrar por texto de búsqueda
        if (searchTerm) {
            return averia.title.toLowerCase().includes(searchTerm) || 
                   averia.description.toLowerCase().includes(searchTerm);
        }
        
        return true;
    });
    
    // Mostrar mensaje si no hay averías
    if (filteredAverias.length === 0) {
        averiasList.innerHTML = `
            <div class="no-averias">
                <p>No hay averías que mostrar</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML para cada avería
    let html = '';
    
    filteredAverias.forEach((averia, index) => {
        const createdDate = new Date(averia.createdAt);
        const formattedDate = `${createdDate.toLocaleDateString('es-ES')} ${createdDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`;
        
        // Crear opciones para el select de estados
        let statusOptions = '';
        ESTADOS_AVERIA.forEach(estado => {
            if (estado !== "Cancelada") {
                statusOptions += `<option value="${estado}" ${averia.status === estado ? 'selected' : ''}>${estado}</option>`;
            }
        });
        statusOptions += `<option value="cancelar" style="color: red;">Cancelar/Eliminar...</option>`;
        
        // Generar HTML para los comentarios
        let commentsHtml = '';
        if (averia.comments.length > 0) {
            averia.comments.forEach(comment => {
                const commentDate = new Date(comment.createdAt);
                const formattedCommentDate = `${commentDate.toLocaleDateString('es-ES')} ${commentDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`;
                
                commentsHtml += `
                    <div class="comment-item" data-id="${comment.id}">
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-meta">
                            <span>${formattedCommentDate}</span>
                            <div class="comment-actions">
                                <button class="btn btn-sm btn-edit edit-comment-btn">Editar</button>
                                <button class="btn btn-sm btn-delete delete-comment-btn">Borrar</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
            <div class="averia-card" data-id="${averia.id}">
                <div class="averia-header">
                    <div class="averia-title">${averia.title}</div>
                    <div class="averia-date">${formattedDate}</div>
                </div>
                <div class="averia-status">
                    <select class="filter-select status-select">
                        ${statusOptions}
                    </select>
                </div>
                <textarea class="averia-description">${averia.description}</textarea>
                <div class="averia-actions">
                    <div>
                        <button class="btn btn-move btn-up" ${index === 0 ? 'disabled' : ''}>⬆️</button>
                        <button class="btn btn-move btn-down" ${index === filteredAverias.length - 1 ? 'disabled' : ''}>⬇️</button>
                    </div>
                </div>
                <div class="averia-comments">
                    <h4>Comentarios</h4>
                    <div class="comment-list">
                        ${commentsHtml}
                    </div>
                    <div class="comment-form">
                        <textarea class="comment-textarea" placeholder="Añadir comentario..."></textarea>
                        <button class="btn add-comment-btn">Añadir</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    averiasList.innerHTML = html;
    
    // Configurar auto-ajuste de altura para todos los textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        adjustTextareaHeight(textarea);
        textarea.addEventListener('input', () => adjustTextareaHeight(textarea));
    });
    
    // Añadir event listeners a los elementos generados
    setupEventListeners();
}

// Configurar los event listeners para los elementos generados dinámicamente
function setupEventListeners() {
    // Event listeners para botones de subir/bajar
    document.querySelectorAll('.btn-up').forEach(btn => {
        btn.addEventListener('click', handleMoveUp);
    });
    
    document.querySelectorAll('.btn-down').forEach(btn => {
        btn.addEventListener('click', handleMoveDown);
    });
    
    // Event listeners para selects de estado
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusChange);
    });
    
    // Event listeners para textareas de descripción
    document.querySelectorAll('.averia-description').forEach(textarea => {
        textarea.addEventListener('blur', handleDescriptionUpdate);
    });
    
    // Event listeners para añadir comentarios
    document.querySelectorAll('.add-comment-btn').forEach(btn => {
        btn.addEventListener('click', handleAddComment);
    });
    
    // Event listeners para las textareas de comentarios (para Enter)
    document.querySelectorAll('.comment-textarea').forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const addBtn = textarea.nextElementSibling;
                addBtn.click();
            }
        });
    });
    
    // Event listeners para editar comentarios
    document.querySelectorAll('.edit-comment-btn').forEach(btn => {
        btn.addEventListener('click', handleEditComment);
    });
    
    // Event listeners para borrar comentarios
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteComment);
    });
}

// Función para ajustar la altura de los textareas
function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Función para manejar el movimiento hacia arriba de una avería
function handleMoveUp(event) {
    const card = event.target.closest('.averia-card');
    const averiaId = parseInt(card.dataset.id);
    
    const index = averias.findIndex(a => a.id === averiaId);
    if (index > 0) {
        // Intercambiar posición en el array
        [averias[index], averias[index - 1]] = [averias[index - 1], averias[index]];
        saveData();
        renderAverias();
    }
}

// Función para manejar el movimiento hacia abajo de una avería
function handleMoveDown(event) {
    const card = event.target.closest('.averia-card');
    const averiaId = parseInt(card.dataset.id);
    
    const index = averias.findIndex(a => a.id === averiaId);
    if (index < averias.length - 1) {
        // Intercambiar posición en el array
        [averias[index], averias[index + 1]] = [averias[index + 1], averias[index]];
        saveData();
        renderAverias();
    }
}

// Función para manejar el cambio de estado
function handleStatusChange(event) {
    const select = event.target;
    const card = select.closest('.averia-card');
    const averiaId = parseInt(card.dataset.id);
    const newStatus = select.value;
    
    if (newStatus === 'cancelar') {
        // Confirmar la eliminación
        if (confirm('¿Estás seguro de que deseas eliminar esta avería?')) {
            const index = averias.findIndex(a => a.id === averiaId);
            if (index !== -1) {
                averias.splice(index, 1);
                saveData();
                renderAverias();
            }
        } else {
            // Restaurar el valor anterior
            const averia = averias.find(a => a.id === averiaId);
            select.value = averia.status;
        }
    } else {
        // Actualizar el estado
        const averia = averias.find(a => a.id === averiaId);
        if (averia) {
            averia.status = newStatus;
            saveData();
        }
    }
}

// Función para manejar la actualización de descripción
function handleDescriptionUpdate(event) {
    const textarea = event.target;
    const card = textarea.closest('.averia-card');
    const averiaId = parseInt(card.dataset.id);
    const new
