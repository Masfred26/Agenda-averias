// Funciones de interfaz de usuario

// Renderizar la lista de averías con filtros aplicados
function renderAverias() {
    const container = document.getElementById('listaAverias');
    container.innerHTML = '';
    
    // Aplicar filtros
    let averiasFiltradas = appState.averias.filter(averia => {
        // Filtro por estado
        const pasaFiltroEstado = appState.filtroEstado === 'todos' || 
                                averia.estado === appState.filtroEstado;
        
        // Filtro por texto
        const pasaFiltroBusqueda = !appState.textoBusqueda || 
                                  averia.cliente.toLowerCase().includes(appState.textoBusqueda) ||
                                  averia.descripcion.toLowerCase().includes(appState.textoBusqueda);
        
        return pasaFiltroEstado && pasaFiltroBusqueda;
    });
    
    // Si no hay averías después de filtrar
    if (averiasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                No hay averías que coincidan con los filtros aplicados.
            </div>
        `;
        return;
    }
    
    // Renderizar cada avería
    averiasFiltradas.forEach((averia, index) => {
        const card = document.createElement('div');
        card.className = `card averia-card estado-${averia.estado.replace(/ /g, '-')}`;
        card.dataset.id = averia.id;
        
        // Formatear fecha para mostrar
        const fecha = new Date(averia.fecha);
        const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        card.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-10">
                        <h5 class="card-title">
                            ${averia.cliente}
                            ${averia.estado === 'Falta albarán' ? '<span class="estado-alerta">FALTA ALBARÁN</span>' : ''}
                        </h5>
                        <h6 class="card-subtitle mb-2 text-muted">${fechaFormateada}</h6>
                    </div>
                    <div class="col-md-2">
                        <div class="orden-controls">
                            <button class="btn btn-sm btn-outline-secondary mover-arriba" ${index === 0 ? 'disabled' : ''}>
                                <i class="bi bi-arrow-up"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary mover-abajo" ${index === averiasFiltradas.length - 1 ? 'disabled' : ''}>
                                <i class="bi bi-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="form-group mt-3">
                    <label>Estado:</label>
                    <select class="form-select estado-select">
                        <option value="Pendiente" ${averia.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En proceso" ${averia.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
                        <option value="Pedir recambio" ${averia.estado === 'Pedir recambio' ? 'selected' : ''}>Pedir recambio</option>
                        <option value="Recambio pedido" ${averia.estado === 'Recambio pedido' ? 'selected' : ''}>Recambio pedido</option>
                        <option value="Recambio en almacén" ${averia.estado === 'Recambio en almacén' ? 'selected' : ''}>Recambio en almacén</option>
                        <option value="Falta albarán" ${averia.estado === 'Falta albarán' ? 'selected' : ''}>Falta albarán</option>
                        <option value="Solucionada" ${averia.estado === 'Solucionada' ? 'selected' : ''}>Solucionada</option>
                        <option value="__eliminar__">Eliminar avería</option>
                    </select>
                </div>
                
                <div class="mt-3">
                    <label>Descripción:</label>
                    <div class="descripcion-container">
                        <div class="editable-descripcion" contenteditable="true">${formatDescription(averia.descripcion)}</div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-sm ${averia.comentarios && averia.comentarios.length > 0 ? 'btn-outline-danger' : 'btn-outline-primary'} ver-comentarios">
                        <i class="bi bi-chat-dots"></i> Comentarios (${averia.comentarios ? averia.comentarios.length : 0})
                    </button>
                    <button class="btn btn-sm btn-outline-secondary exportar-averia">
                        <i class="bi bi-box-arrow-up"></i> Exportar
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // Añadir event listeners a los elementos dinámicos
        const cardElement = container.lastElementChild;
        
        // Cambio de estado
        const estadoSelect = cardElement.querySelector('.estado-select');
        estadoSelect.addEventListener('change', (e) => {
            const newEstado = e.target.value;
            
            if (newEstado === '__eliminar__') {
                showConfirmModal(
                    '¿Estás seguro de que deseas eliminar esta avería? Esta acción no se puede deshacer.',
                    () => {
                        StorageManager.deleteAveria(averia.id);
                        appState.averias = appState.averias.filter(a => a.id !== averia.id);
                        renderAverias();
                    }
                );
                // Restaurar valor anterior del select
                e.target.value = averia.estado;
            } else {
                averia.estado = newEstado;
                StorageManager.updateAveria(averia);
                cardElement.className = `card averia-card estado-${newEstado.replace(/ /g, '-')}`;
            }
        });
        
        // Edición de descripción
        const descripcionElement = cardElement.querySelector('.editable-descripcion');
        descripcionElement.addEventListener('blur', () => {
            const newDescripcion = descripcionElement.innerText.trim();
            if (newDescripcion !== averia.descripcion) {
                averia.descripcion = newDescripcion;
                StorageManager.updateAveria(averia);
            }
        });
        
        // Botones de orden
        const btnMoverArriba = cardElement.querySelector('.mover-arriba');
        btnMoverArriba.addEventListener('click', () => {
            if (StorageManager.reorderAveria(averia.id, 'up')) {
                appState.averias = StorageManager.getAverias();
                renderAverias();
            }
        });
        
        const btnMoverAbajo = cardElement.querySelector('.mover-abajo');
        btnMoverAbajo.addEventListener('click', () => {
            if (StorageManager.reorderAveria(averia.id, 'down')) {
                appState.averias = StorageManager.getAverias();
                renderAverias();
            }
        });
        
        // Comentarios
        const btnComentarios = cardElement.querySelector('.ver-comentarios');
        btnComentarios.addEventListener('click', () => {
            appState.currentAveriaId = averia.id;
            renderComentarios(averia.comentarios || []);
            const modal = new bootstrap.Modal(document.getElementById('comentariosModal'));
            modal.show();
        });
        
        // Exportar avería individual
        const btnExportar = cardElement.querySelector('.exportar-averia');
        btnExportar.addEventListener('click', () => {
            exportAveria(averia);
        });
    });
}

// Formatear descripción para mostrar timestamps destacados
function formatDescription(description) {
    if (!description) return '';
    
    // Resaltar timestamps con formato [DD/MM/AA HH:MM]
    return description.replace(/\[([\d\/]+ [\d:]+)\]/g, '<span class="timestamp">[$1]</span>');
}

// Renderizar comentarios de una avería
function renderComentarios(comentarios) {
    const container = document.getElementById('comentariosList');
    container.innerHTML = '';
    
    if (!comentarios || comentarios.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay comentarios para esta avería.</div>';
        return;
    }
    
    // Ordenar por fecha (más antiguos primero)
    const comentariosOrdenados = [...comentarios].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );
    
    comentariosOrdenados.forEach(comentario => {
        const fecha = new Date(comentario.fecha);
        const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        const div = document.createElement('div');
        div.className = 'comentario-item';
        div.dataset.id = comentario.id;
        
        div.innerHTML = `
            <div class="comentario-fecha">${fechaFormateada}</div>
            <div class="comentario-texto" contenteditable="true">${comentario.texto}</div>
            <div class="comentario-acciones">
                <button class="btn btn-sm btn-outline-danger eliminar-comentario">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(div);
        
        // Event listeners para este comentario
        const comentarioElement = container.lastElementChild;
        
        // Edición de comentario
        const textoElement = comentarioElement.querySelector('.comentario-texto');
        textoElement.addEventListener('blur', () => {
            const nuevoTexto = textoElement.innerText.trim();
            if (nuevoTexto !== comentario.texto) {
                StorageManager.updateComentario(appState.currentAveriaId, comentario.id, nuevoTexto);
                comentario.texto = nuevoTexto;
            }
        });
        
        // Eliminar comentario
        const btnEliminar = comentarioElement.querySelector('.eliminar-comentario');
        btnEliminar.addEventListener('click', () => {
            showConfirmModal(
                '¿Estás seguro de que deseas eliminar este comentario?',
                () => {
                    if (StorageManager.deleteComentario(appState.currentAveriaId, comentario.id)) {
                        comentarioElement.remove();
                        
                        // Actualizar contador de comentarios en la tarjeta
                        const averia = appState.averias.find(a => a.id === appState.currentAveriaId);
                        if (averia) {
                            const btnComentarios = document.querySelector(`.averia-card[data-id="${averia.id}"] .ver-comentarios`);
                            if (btnComentarios) {
                                btnComentarios.innerHTML = `<i class="bi bi-chat-dots"></i> Comentarios (${averia.comentarios.length})`;
                            }
                        }
                        
                        // Si no quedan comentarios, mostrar mensaje
                        if (container.children.length === 0) {
                            container.innerHTML = '<div class="alert alert-info">No hay comentarios para esta avería.</div>';
                        }
                    }
                }
            );
        });
    });
}