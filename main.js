document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS AL DOM ---
    const formCrear = document.getElementById('form-crear');
    const tituloInput = document.getElementById('titulo-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const averiasListUl = document.getElementById('averias-list-ul');
    const filtroEstado = document.getElementById('filtro-estado');
    const themeToggle = document.getElementById('theme-toggle');
    const averiaTemplate = document.getElementById('averia-template');
    const comentarioTemplate = document.getElementById('comentario-template');

    // --- ESTADO DE LA APLICACIÓN ---
    let averias = [];
    const ESTADOS_POSIBLES = [
        "Pendiente", "En proceso", "Pedir recambio", "Recambio pedido",
        "Recambio en almacén", "Solucionada", "Cancelada"
    ];

    // --- FUNCIONES DE PERSISTENCIA (localStorage) ---
    const cargarAverias = () => {
        const averiasGuardadas = localStorage.getItem('agendaAverias');
        if (averiasGuardadas) {
            try {
                averias = JSON.parse(averiasGuardadas);
                // Asegurarse de que los comentarios sean siempre un array
                averias.forEach(a => {
                    if (!Array.isArray(a.comentarios)) {
                        a.comentarios = [];
                    }
                });
            } catch (error) {
                console.error("Error al parsear averías de localStorage:", error);
                averias = []; // Resetear si hay error
            }
        } else {
            averias = [];
        }
        renderAverias(); // Renderizar al cargar
    };

    const guardarAverias = () => {
        try {
            localStorage.setItem('agendaAverias', JSON.stringify(averias));
        } catch (error) {
            console.error("Error al guardar averías en localStorage:", error);
            alert("Error: No se pudieron guardar los cambios. El almacenamiento podría estar lleno.");
        }
    };

    // --- FUNCIONES DE RENDERIZADO ---
    const renderAverias = () => {
        averiasListUl.innerHTML = ''; // Limpiar lista actual
        const estadoFiltrado = filtroEstado.value;

        const averiasFiltradas = (estadoFiltrado === 'todos')
            ? averias
            : averias.filter(a => a.estado === estadoFiltrado);

        // Renderizar de la más nueva a la más vieja (por defecto)
        // El array 'averias' ya mantiene el orden manual/creación
        averiasFiltradas.forEach((averia, indexGlobal) => {
            const templateNode = averiaTemplate.content.cloneNode(true);
            const listItem = templateNode.querySelector('.averia-item');
            const tituloEl = listItem.querySelector('.averia-titulo');
            const fechaEl = listItem.querySelector('.averia-fecha');
            const estadoSelect = listItem.querySelector('.averia-estado');
            const descripcionTextarea = listItem.querySelector('.averia-descripcion');
            const btnSubir = listItem.querySelector('.btn-subir');
            const btnBajar = listItem.querySelector('.btn-bajar');
            const comentariosList = listItem.querySelector('.comentarios-list');
            const formComentario = listItem.querySelector('.form-comentario');
            const inputComentario = formComentario.querySelector('input[type="text"]');

            listItem.dataset.id = averia.id; // Guardar ID en el elemento
            tituloEl.textContent = averia.titulo;
            fechaEl.textContent = `Creada: ${new Date(averia.fechaCreacion).toLocaleString()}`;
            descripcionTextarea.value = averia.descripcion;
            estadoSelect.value = averia.estado;

            // Ocultar botones de orden en los extremos
            const indexEnFiltradas = averias.findIndex(a => a.id === averia.id); // Indice real en el array global
            if (indexEnFiltradas === 0) btnSubir.style.display = 'none';
            if (indexEnFiltradas === averias.length - 1) btnBajar.style.display = 'none';


            // Event Listeners específicos de la avería
            estadoSelect.addEventListener('change', (e) => handleEstadoChange(averia.id, e.target.value));
            descripcionTextarea.addEventListener('input', (e) => handleDescripcionChange(averia.id, e.target.value));
            btnSubir.addEventListener('click', () => moverAveria(averia.id, 'subir'));
            btnBajar.addEventListener('click', () => moverAveria(averia.id, 'bajar'));

            // Renderizar comentarios
            renderComentarios(averia.id, comentariosList);

            // Formulario de nuevo comentario
            formComentario.addEventListener('submit', (e) => {
                e.preventDefault();
                const textoComentario = inputComentario.value.trim();
                if (textoComentario) {
                    agregarComentario(averia.id, textoComentario);
                    inputComentario.value = ''; // Limpiar input
                }
            });

            averiasListUl.appendChild(listItem);
        });
    };

    const renderComentarios = (averiaId, comentariosListElement) => {
        comentariosListElement.innerHTML = '';
        const averia = averias.find(a => a.id === averiaId);
        if (!averia || !averia.comentarios) return;

        averia.comentarios.forEach(comentario => {
             const templateNode = comentarioTemplate.content.cloneNode(true);
             const comentarioItem = templateNode.querySelector('.comentario-item');
             const fechaEl = comentarioItem.querySelector('.comentario-fecha');
             const textoEl = comentarioItem.querySelector('.comentario-texto');
             const btnEditar = comentarioItem.querySelector('.btn-editar-comentario');
             const btnEliminar = comentarioItem.querySelector('.btn-eliminar-comentario');

             comentarioItem.dataset.id = comentario.id;
             fechaEl.textContent = new Date(comentario.fechaCreacion).toLocaleString();
             textoEl.textContent = comentario.texto;

             btnEditar.addEventListener('click', () => editarComentario(averiaId, comentario.id));
             btnEliminar.addEventListener('click', () => eliminarComentario(averiaId, comentario.id));

             comentariosListElement.appendChild(comentarioItem);
        });
    };


    // --- MANEJADORES DE EVENTOS Y LÓGICA ---

    // Crear nueva avería
    formCrear.addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = tituloInput.value.trim();
        const descripcion = descripcionInput.value.trim();

        if (titulo && descripcion) {
            const nuevaAveria = {
                id: Date.now(), // ID simple basado en timestamp
                titulo: titulo,
                descripcion: descripcion,
                fechaCreacion: Date.now(),
                estado: "Pendiente",
                comentarios: []
            };
            // Añadir al principio para que aparezcan arriba
            averias.unshift(nuevaAveria);
            guardarAverias();
            renderAverias();
            // Limpiar formulario
            tituloInput.value = '';
            descripcionInput.value = '';
        } else {
            alert('Por favor, completa el título y la descripción.');
        }
    });

    // Cambiar estado
    const handleEstadoChange = (id, nuevoEstado) => {
        const index = averias.findIndex(a => a.id === id);
        if (index !== -1) {
            if (nuevoEstado === "Cancelada") {
                if (confirm(`¿Seguro que quieres eliminar permanentemente la avería "${averias[index].titulo}"?`)) {
                    averias.splice(index, 1); // Eliminar del array
                } else {
                    // Si cancela la eliminación, revertir el select visualmente
                    renderAverias(); // Volver a renderizar para restaurar el select
                    return; // No guardar cambios
                }
            } else {
                averias[index].estado = nuevoEstado;
            }
            guardarAverias();
            renderAverias(); // Volver a renderizar para reflejar cambios y aplicar filtro si es necesario
        }
    };

    // Editar descripción
    const handleDescripcionChange = (id, nuevaDescripcion) => {
        const index = averias.findIndex(a => a.id === id);
        if (index !== -1) {
            averias[index].descripcion = nuevaDescripcion;
            // Guardar cambios con un pequeño debounce para no saturar localStorage en cada tecla
            clearTimeout(averias[index].saveTimeout);
            averias[index].saveTimeout = setTimeout(() => {
                 guardarAverias();
            }, 500); // Guarda 500ms después de dejar de escribir
        }
    };

    // Mover avería
    const moverAveria = (id, direccion) => {
        const index = averias.findIndex(a => a.id === id);
        if (index === -1) return;

        if (direccion === 'subir' && index > 0) {
            // Intercambiar con el elemento anterior
            [averias[index], averias[index - 1]] = [averias[index - 1], averias[index]];
        } else if (direccion === 'bajar' && index < averias.length - 1) {
            // Intercambiar con el elemento siguiente
            [averias[index], averias[index + 1]] = [averias[index + 1], averias[index]];
        }

        guardarAverias();
        renderAverias(); // Re-renderizar para mostrar el nuevo orden
    };

    // Filtrar por estado
    filtroEstado.addEventListener('change', renderAverias);

    // Comentarios
    const agregarComentario = (averiaId, texto) => {
         const index = averias.findIndex(a => a.id === averiaId);
         if (index !== -1) {
             const nuevoComentario = {
                 id: Date.now() + 1, // ID simple para comentario
                 texto: texto,
                 fechaCreacion: Date.now()
             };
             // Asegurar que el array de comentarios exista
             if (!Array.isArray(averias[index].comentarios)) {
                 averias[index].comentarios = [];
             }
             averias[index].comentarios.push(nuevoComentario);
             guardarAverias();
             renderAverias(); // Re-renderizar para mostrar el nuevo comentario
         }
    };

    const editarComentario = (averiaId, comentarioId) => {
        const averiaIndex = averias.findIndex(a => a.id === averiaId);
        if (averiaIndex === -1) return;
        const comentarioIndex = averias[averiaIndex].comentarios.findIndex(c => c.id === comentarioId);
        if (comentarioIndex === -1) return;

        const comentarioActual = averias[averiaIndex].comentarios[comentarioIndex];
        const nuevoTexto = prompt("Edita tu comentario:", comentarioActual.texto);

        if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
            averias[averiaIndex].comentarios[comentarioIndex].texto = nuevoTexto.trim();
            guardarAverias();
            renderAverias();
        } else if (nuevoTexto === "") {
             alert("El comentario no puede estar vacío.");
        }
    };

    const eliminarComentario = (averiaId, comentarioId) => {
        const averiaIndex = averias.findIndex(a => a.id === averiaId);
        if (averiaIndex === -1) return;

        if (confirm("¿Seguro que quieres eliminar este comentario?")) {
             // Filtrar el comentario a eliminar
             averias[averiaIndex].comentarios = averias[averiaIndex].comentarios.filter(c => c.id !== comentarioId);
             guardarAverias();
             renderAverias();
        }
    };


    // --- MODO OSCURO ---
    const aplicarTema = (oscuro) => {
        if (oscuro) {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = 'Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.textContent = 'Modo Oscuro';
        }
        localStorage.setItem('theme', oscuro ? 'dark' : 'light');
    };

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        aplicarTema(!isDark);
    });

    // Aplicar tema guardado al cargar
    const temaGuardado = localStorage.getItem('theme');
    if (temaGuardado === 'dark' || (temaGuardado === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
         aplicarTema(true);
    } else {
         aplicarTema(false);
    }


    // --- REGISTRO DEL SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registrado con éxito:', registration.scope);
                })
                .catch(error => {
                    console.log('Fallo en el registro del ServiceWorker:', error);
                });
        });
    }

    // --- CARGA INICIAL ---
    cargarAverias();
});

