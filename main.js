document.addEventListener('DOMContentLoaded', () => {
    const averiasList = document.getElementById('averias-list');
    const averias = JSON.parse(localStorage.getItem('averias') || '[]');

    function renderAverias() {
        if (averias.length === 0) {
            averiasList.textContent = 'No hay averías aún.';
            return;
        }
        averiasList.innerHTML = averias.map(a => `<div>${a.title}</div>`).join('');
    }

    renderAverias();
});