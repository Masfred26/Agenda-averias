// Gestor de almacenamiento local
const StorageManager = {
    // Clave para el almacenamiento en localStorage
    STORAGE_KEY: 'agenda-averias-data',
    
    // Obtener todas las averías almacenadas
    getAverias() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al obtener datos del localStorage:', error);
            return [];
        }
    },
    
    // Guardar todas las averías
    saveAverias(averias) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(averias));
            return true;
        } catch (error) {
            console.error('Error al guardar datos en localStorage:', error);
            alert('Error al guardar datos. Es posible que el almacenamiento esté lleno.');
            return false;
        }
    },
    
    // Obtener una avería específica por ID
    getAveriaById(id) {
        const averias = this.getAverias();
        return averias.find(averia => averia.id === id);
    },
    
    // Actualizar una avería específica
    updateAveria(updatedAveria) {
        let averias = this.getAverias();
        const index = averias.findIndex(averia => averia.id === updatedAveria.id);
        
        if (index !== -1) {
            averias[index] = updatedAveria;
            this.saveAverias(averias);
            return true;
        }
        return false;
    },
    
    // Eliminar una avería por ID
    deleteAveria(id) {
        let averias = this.getAverias();
        const initialLength = averias.length;
        
        averias = averias.filter(averia => averia.id !== id);
        
        if (averias.length !== initialLength) {
            this.saveAverias(averias);
            return true;
        }
        return false;
    },
    
    // Reordenar una avería (mover arriba o abajo)
    reorderAveria(id, direction) {
        let averias = this.getAverias();
        const currentIndex = averias.findIndex(averia => averia.id === id);
        
        if (currentIndex === -1) return false;
        
        const newIndex = direction === 'up' ? 
            Math.max(0, currentIndex - 1) : 
            Math.min(averias.length - 1, currentIndex + 1);
            
        if (newIndex === currentIndex) return false;
        
        // Intercambiar posiciones
        [averias[currentIndex], averias[newIndex]] = [averias[newIndex], averias[currentIndex]];
        
        // Actualizar orden de todas las averías
        averias.forEach((averia, index) => {
            averia.orden = index;
        });
        
        this.saveAverias(averias);
        return true;
    },
    
    // Añadir comentario a una avería
    addComentario(averiaId, comentario) {
        const averia = this.getAveriaById(averiaId);
        if (!averia) return false;
        
        if (!averia.comentarios) averia.comentarios = [];
        averia.comentarios.push(comentario);
        
        return this.updateAveria(averia);
    },
    
    // Eliminar comentario de una avería
    deleteComentario(averiaId, comentarioId) {
        const averia = this.getAveriaById(averiaId);
        if (!averia || !averia.comentarios) return false;
        
        const initialLength = averia.comentarios.length;
        averia.comentarios = averia.comentarios.filter(c => c.id !== comentarioId);
        
        if (averia.comentarios.length !== initialLength) {
            return this.updateAveria(averia);
        }
        return false;
    },
    
    // Actualizar comentario de una avería
    updateComentario(averiaId, comentarioId, nuevoTexto) {
        const averia = this.getAveriaById(averiaId);
        if (!averia || !averia.comentarios) return false;
        
        const comentario = averia.comentarios.find(c => c.id === comentarioId);
        if (!comentario) return false;
        
        comentario.texto = nuevoTexto;
        return this.updateAveria(averia);
    }
};

