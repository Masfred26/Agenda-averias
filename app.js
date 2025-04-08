// Estado global de la aplicación
const appState = {
    averias: [],
    currentAveriaId: null,
    filtroEstado: 'todos',
    textoBusqueda: '',
    tema: localStorage.getItem('tema') || 'light'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    checkOnlineStatus();
});

// Inicialización principal
function initApp() {
    // Cargar datos almacenados
    appState.averias = StorageManager.getAverias();
    
    // Establecer tema
    setTheme(appState.tema);
    
    // Renderizar lista de averías
    renderAverias();
    
    // Mostrar notificación de instalación PWA si aplica
    setupPWAInstall();
}

// Configurar todos los event listeners
function setupEventListeners() {
    // Formulario de nueva avería
    document.getElementById('nuevaAveriaForm').addEventListener('submit', handleNuevaAveria);
    
    // Campo de cliente para autocompletado
    document.getElementById('clienteInput').addEventListener('input', handleClienteInput);
    
    // Filtros
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    document.getElementById('estadoFilter').addEventListener('change', handleEstadoFilter);
    
    // Cambio de tema
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Botón de configuración
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    
    // Importar/Exportar
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Formulario de comentarios
    document.getElementById('nuevoComentarioForm').addEventListener('submit', handleNuevoComentario);
    
    // Detección de conexión
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
}

// Manejador para nueva avería o actualización
function handleNuevaAveria(event) {
    event.preventDefault();
    
    const clienteInput = document.getElementById('clienteInput');
    const descripcionInput = document.getElementById('descripcionInput');
    
    const cliente = clienteInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    
    if (!cliente || !descripcion) return;
    
    // Verificar si el cliente ya existe
    const existingAveria = appState.averias.find(a => 
        a.cliente.toLowerCase() === cliente.toLowerCase());
    
    if (existingAveria) {
        // Actualizar avería existente
        const timestamp = getCurrentTimestamp();
        existingAveria.descripcion = `[${timestamp}] ${descripcion}\n--------------------\n${existingAveria.descripcion}`;
        existingAveria.fecha = new Date().toISOString();
        
        // Mover la avería al principio de la lista
        const index = appState.averias.findIndex(a => a.id === existingAveria.id);
        if (index > 0) {
            appState.averias.splice(index, 1);
            appState.averias.unshift(existingAveria);
        }
    } else {
        // Crear nueva avería
        const nuevaAveria = {
            id: Date.now().toString(),
            cliente: cliente,
            descripcion: `[${getCurrentTimestamp()}] ${descripcion}`,
            fecha: new Date().toISOString(),
            estado: 'Pendiente',
            comentarios: [],
            orden: 0
        };
        
        // Añadir al inicio de la lista
        appState.averias.unshift(nuevaAveria);
        
        // Actualizar el orden de todas las averías
        appState.averias.forEach((averia, index) => {
            averia.orden = index;
        });
    }
    
    // Guardar cambios y actualizar UI
    StorageManager.saveAverias(appState.averias);
    renderAverias();
    
    // Limpiar formulario
    descripcionInput.value = '';
    clienteInput.value = '';
}

// Autocompletado de cliente
function handleClienteInput() {
    const input = document.getElementById('clienteInput');
    const value = input.value.toLowerCase();
    const suggestionBox = document.getElementById('clienteSuggestions');
    
    // Limpiar sugerencias previas
    suggestionBox.innerHTML = '';
    
    if (!value) {
        suggestionBox.style.display = 'none';
        return;
    }
    
    // Encontrar clientes que coincidan
    const matches = appState.averias
        .map(a => a.cliente)
        .filter((cliente, index, self) => 
            cliente.toLowerCase().includes(value) && 
            self.indexOf(cliente) === index // Eliminar duplicados
        );
    
    if (matches.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }
    
    // Mostrar sugerencias
    matches.forEach(match => {
        const div = document.createElement('div');
        div.textContent = match;
        div.addEventListener('click', () => {
            input.value = match;
            suggestionBox.style.display = 'none';
        });
        suggestionBox.appendChild(div);
    });
    
    suggestionBox.style.display = 'block';
}

// Filtrado por texto
function handleSearchInput(event) {
    appState.textoBusqueda = event.target.value.toLowerCase();
    renderAverias();
}

// Filtrado por estado
function handleEstadoFilter(event) {
    appState.filtroEstado = event.target.value;
    renderAverias();
}

// Cambio de tema claro/oscuro
function toggleTheme() {
    const newTheme = appState.tema === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tema', newTheme);
    appState.tema = newTheme;
}

// Aplicar tema visual
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun';
    } else {
        themeIcon.className = 'bi bi-moon';
    }
}

// Verificar estado de conexión
function checkOnlineStatus() {
    const indicator = document.getElementById('conexionIndicator');
    
    if (navigator.onLine) {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
    }
}

// Obtener timestamp actual formateado
function getCurrentTimestamp() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).substring(2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Configurar notificación de instalación PWA
function setupPWAInstall() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botón de instalación
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary btn-install-pwa';
        installBtn.innerHTML = '<i class="bi bi-download"></i> Instalar App';
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó la instalación A2HS');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        });
        
        document.body.appendChild(installBtn);
        installBtn.style.display = 'block';
    });
}

// Modal de configuración
function openSettingsModal() {
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
}

// Exportar datos
function exportData() {
    const dataStr = JSON.stringify(appState.averias);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `agenda-averias-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Exportar una avería individual
function exportAveria(averia) {
    const dataStr = JSON.stringify([averia]);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `averia-${averia.cliente.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Importar datos
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validar formato básico
            if (!Array.isArray(data)) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Verificar si es una exportación completa o parcial
            if (data.length === 1 || confirm('¿Deseas añadir estas averías a tu lista actual? Presiona Cancelar si deseas reemplazar todos tus datos.')) {
                // Importación parcial - añadir a los existentes
                const nuevasAverias = [...appState.averias];
                
                data.forEach(nuevaAveria => {
                    // Verificar si la avería ya existe por ID
                    const index = nuevasAverias.findIndex(a => a.id === nuevaAveria.id);
                    
                    // Si existe, actualizar solo si el usuario confirma
                    if (index !== -1) {
                        if (confirm(`La avería para el cliente "${nuevaAveria.cliente}" ya existe. ¿Deseas actualizarla?`)) {
                            nuevasAverias[index] = nuevaAveria;
                        }
                    } else {
                        // Si no existe, añadirla al principio
                        nuevasAverias.unshift(nuevaAveria);
                    }
                });
                
                // Actualizar orden de todas las averías
                nuevasAverias.forEach((averia, index) => {
                    averia.orden = index;
                });
                
                appState.averias = nuevasAverias;
                StorageManager.saveAverias(appState.averias);
                renderAverias();
                bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
            } else {
                // Importación completa - reemplazar todos los datos
                showConfirmModal(
                    '¿Estás seguro de que deseas reemplazar todos los datos actuales con los del archivo importado?',
                    () => {
                        appState.averias = data;
                        StorageManager.saveAverias(appState.averias);
                        renderAverias();
                        
                        // Cerrar el modal de configuración
                        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
                    }
                );
            }
            
        } catch (error) {
            alert('Error al importar: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
}

// Mostrar modal de confirmación genérico
function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').textContent = message;
    
    // Configurar botón de confirmación
    const confirmBtn = document.getElementById('confirmBtn');
    const oldListener = confirmBtn.onclick;
    if (oldListener) {
        confirmBtn.removeEventListener('click', oldListener);
    }
    
    confirmBtn.onclick = () => {
        onConfirm();
        bootstrap.Modal.getInstance(modal).hide();
    };
    
    // Mostrar modal
    new bootstrap.Modal(modal).show();
}

// Manejador para nuevo comentario
function handleNuevoComentario(event) {
    event.preventDefault();
    
    if (!appState.currentAveriaId) return;
    
    const comentarioInput = document.getElementById('comentarioInput');
    const texto = comentarioInput.value.trim();
    
    if (!texto) return;
    
    const averia = appState.averias.find(a => a.id === appState.currentAveriaId);
    if (!averia) return;
    
    // Crear nuevo comentario
    const nuevoComentario = {
        id: Date.now().toString(),
        texto: texto,
        fecha: new Date().toISOString()
    };
    
    // Añadir a la avería
    averia.comentarios.push(nuevoComentario);
    
    // Guardar y actualizar UI
    StorageManager.saveAverias(appState.averias);
    renderComentarios(averia.comentarios);
    
    // Limpiar input
    comentarioInput.value = '';
}