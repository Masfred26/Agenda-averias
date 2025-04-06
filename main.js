<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agenda de Averías</title>
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#4A90E2">
    <style>
        /* --- Estilos CSS (Incluyendo estilos para <details>) --- */
        :root {
            --bg-color: #f4f7f6;
            --text-color: #333;
            --card-bg: #ffffff;
            --border-color: #e0e0e0;
            --primary-color: #4A90E2;
            --secondary-color: #f39c12;
            --danger-color: #e74c3c;
            --success-color: #2ecc71;
            --dark-bg: #2c3e50;
            --dark-text: #ecf0f1;
            --dark-card-bg: #34495e;
            --dark-border-color: #4a6179;
            --button-bg: #e9ecef;
            --button-text: #495057;
            --dark-button-bg: #495057;
            --dark-button-text: #dee2e6;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 15px;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            transition: background-color 0.3s, color 0.3s;
        }

        body.dark-mode {
            --bg-color: var(--dark-bg);
            --text-color: var(--dark-text);
            --card-bg: var(--dark-card-bg);
            --border-color: var(--dark-border-color);
            --button-bg: var(--dark-button-bg);
            --button-text: var(--dark-button-text);
        }

        #app {
            max-width: 700px;
            margin: 0 auto;
        }

        h1 {
            color: var(--primary-color);
            text-align: center;
            margin-bottom: 20px;
        }

        /* Controles Generales */
        .controls {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
            background-color: var(--card-bg);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid var(--border-color);
        }

        .control-row {
             display: flex;
             justify-content: space-between;
             align-items: center;
             flex-wrap: wrap;
             gap: 10px;
        }

        .controls label {
            margin-right: 5px;
        }

        .controls select,
        .controls input[type="search"],
        .controls button,
        .more-actions-details summary /* Aplicar a summary también */
         {
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            background-color: var(--button-bg);
            color: var(--button-text);
            cursor: pointer;
            font-size: 0.95em;
        }

        .controls input[type="search"] {
             flex-grow: 1;
             min-width: 150px;
             background-color: var(--bg-color);
             color: var(--text-color);
        }
         body.dark-mode .controls input[type="search"] {
             background-color: var(--dark-bg);
             border-color: var(--dark-border-color);
         }


        .app-actions {
            display: flex;
            gap: 10px;
            align-items: center; /* Alinear verticalmente */
            flex-wrap: wrap;
        }

         .app-actions > button { /* Estilo base para botones DIRECTOS dentro de app-actions */
            background-color: var(--secondary-color);
            color: white;
            border: none;
         }

        #theme-toggle { /* Botón de tema mantiene su estilo */
            background-color: var(--secondary-color);
            color: white;
            border: none;
        }

        #install-pwa-button {
            background-color: var(--success-color);
            color: white;
            border: none;
        }

        /* Estilos para el desplegable 'Más Acciones' */
        .more-actions-details {
            border: none;
            padding: 0;
            background-color: transparent;
            border-radius: 5px;
             position: relative;
        }
        .more-actions-details summary {
            /* Hereda estilos de .controls button */
             list-style: none;
             display: inline-block;
             outline: none;
        }
         .more-actions-details summary::-webkit-details-marker {
             display: none;
         }
         .more-actions-details summary::after {
             content: ' ▼';
             font-size: 0.8em;
             margin-left: 5px;
         }
         .more-actions-details[open] summary::after {
             content: ' ▲';
         }

        .more-actions-content {
             position: absolute;
             right: 0;
             top: calc(100% + 5px);
             background-color: var(--card-bg);
             border: 1px solid var(--border-color);
             border-radius: 5px;
             padding: 10px;
             display: flex;
             flex-direction: column;
             gap: 8px;
             z-index: 10;
             min-width: 150px;
             box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
         .more-actions-content button {
             width: 100%;
             background-color: var(--secondary-color);
             color: white;
             border: none;
             text-align: left;
             padding: 8px 12px;
         }
          body.dark-mode .more-actions-content {
              background-color: var(--dark-card-bg);
              border-color: var(--dark-border-color);
          }


        /* Formulario Nueva Avería */
        .new-averia-form { background-color: var(--card-bg); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 25px; border: 1px solid var(--border-color); }
        .new-averia-form h2 { margin-top: 0; margin-bottom: 15px; font-size: 1.2em; color: var(--primary-color); }
        .new-averia-form input[type="text"], .new-averia-form textarea { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 5px; box-sizing: border-box; background-color: var(--bg-color); color: var(--text-color); }
        body.dark-mode .new-averia-form input[type="text"], body.dark-mode .new-averia-form textarea { background-color: var(--dark-bg); border-color: var(--dark-border-color); }
        .new-averia-form textarea { min-height: 80px; resize: vertical; }
        .new-averia-form button { background-color: var(--primary-color); color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; width: 100%; }
        .new-averia-form button:hover { opacity: 0.9; }

        /* Lista de Averías */
        .averia-item { background-color: var(--card-bg); padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border-color); transition: background-color 0.3s, border-color 0.3s; }
        .averia-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
        .averia-title { font-size: 1.1em; font-weight: bold; margin: 0; flex-grow: 1; word-break: break-word; }
        .averia-date { font-size: 0.8em; color: #888; }
        body.dark-mode .averia-date { color: #aaa; }
        .averia-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .averia-controls select { padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-color); color: var(--text-color); font-size: 0.9em; }
        body.dark-mode .averia-controls select { background-color: var(--dark-bg); border-color: var(--dark-border-color); }
        .averia-description { width: 100%; min-height: 60px; padding: 8px; margin-top: 10px; margin-bottom: 10px; border: 1px solid var(--border-color); border-radius: 5px; box-sizing: border-box; background-color: var(--bg-color); color: var(--text-color); resize: vertical; white-space: pre-wrap; font-size: 0.95em; }
        body.dark-mode .averia-description { background-color: var(--dark-bg); border-color: var(--dark-border-color); }
        .averia-actions { display: flex; gap: 5px; }
        .averia-actions button, .comment-actions button { background: none; border: none; cursor: pointer; padding: 5px; font-size: 1.1em; color: var(--text-color); line-height: 1; }
        .averia-actions button:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Comentarios */
        .comments-section { margin-top: 15px; padding-top: 10px; border-top: 1px dashed var(--border-color); }
        .comments-section h4 { margin-top: 0; margin-bottom: 10px; font-size: 0.95em; }
        .comment-item { background-color: rgba(0, 0, 0, 0.03); padding: 8px; margin-bottom: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.9em; }
        body.dark-mode .comment-item { background-color: rgba(255, 255, 255, 0.05); }
        .comment-text { flex-grow: 1; margin-right: 10px; white-space: pre-wrap; word-wrap: break-word; }
        .comment-actions { display: flex; gap: 5px; flex-shrink: 0; }
        .add-comment-form { display: flex; gap: 5px; margin-top: 10px; }
        .add-comment-form textarea { flex-grow: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: none; height: 35px; box-sizing: border-box; background-color: var(--bg-color); color: var(--text-color); font-size: 0.9em; }
        body.dark-mode .add-comment-form textarea { background-color: var(--dark-bg); border-color: var(--dark-border-color); }
        .add-comment-form button { padding: 0 12px; background-color: var(--secondary-color); color: white; border: none; border-radius: 4px; cursor: pointer; height: 35px; box-sizing: border-box; flex-shrink: 0; font-size: 1.2em; line-height: 35px; }

        /* Iconos básicos (emojis) */
        .icon-up::before { content: "⬆️"; } .icon-down::before { content: "⬇️"; } .icon-edit::before { content: "✏️"; } .icon-delete::before { content: "🗑️"; } .icon-add::before { content: "➕"; }

        /* Indicador Offline */
        #offline-indicator { display: none; position: fixed; bottom: 10px; left: 10px; background-color: var(--danger-color); color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.8em; z-index: 1000; }
        body.offline #offline-indicator { display: block; }
    </style>
</head>
<body>

    <div id="app">
        <h1>Agenda de Averías</h1>

        <div class="controls">
            <div class="control-row">
                 <input type="search" id="search-input" placeholder="Buscar cliente o descripción...">
                 <button id="theme-toggle">Modo Oscuro/Claro</button>
            </div>
             <div class="control-row">
                 <div>
                     <label for="filter-status">Filtrar por estado:</label>
                     <select id="filter-status">
                         <option value="Todos">Todos</option>
                         </select>
                 </div>
                 <div class="app-actions">
                     <button id="install-pwa-button" style="display: none;">Instalar App</button>

                     <details class="more-actions-details">
                         <summary>Más Acciones</summary>
                         <div class="more-actions-content">
                             <button id="export-button">Exportar JSON</button>
                             <button id="import-button">Importar JSON</button>
                             <input type="file" id="import-file" accept=".json" style="display: none;">
                         </div>
                     </details>
                 </div>
             </div>
        </div>

        <div class="new-averia-form">
            <h2>Nueva Avería</h2>
            <input type="text" id="new-averia-title" placeholder="Cliente" list="client-suggestions" required>
             <datalist id="client-suggestions">
                </datalist>
            <textarea id="new-averia-description" placeholder="Descripción detallada"></textarea>
            <button id="add-averia-button">Añadir o Actualizar Avería</button>
        </div>

        <div id="averias-list">
            </div>

    </div>

    <div id="offline-indicator">Estás offline</div>

    <script src="main.js"></script>
    <script>
        // Registro del Service Worker (sin cambios)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                .then(registration => { /* console.log('SW registrado'); */ })
                .catch(error => { /* console.log('Fallo SW:', error); */ });
            });
        }

        // Indicador online/offline básico (sin cambios)
        function updateOnlineStatus() {
            if (navigator.onLine) { document.body.classList.remove('offline'); }
            else { document.body.classList.add('offline'); }
        }
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Comprobar estado inicial
    </script>

</body>
</html>
