import React, { useState, useEffect } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom/client";

function App() {
  const [averias, setAverias] = useState([]);
  const [cliente, setCliente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [sugerencias, setSugerencias] = useState([]);

  const estados = [
    "Pendiente", "En proceso", "Pedir recambio",
    "Recambio pedido", "Recambio en almacén",
    "Solucionada", "Cancelada"
  ];

  useEffect(() => {
    const data = localStorage.getItem("averias");
    if (data) setAverias(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("averias", JSON.stringify(averias));
  }, [averias]);

  const actualizarSugerencias = (valor) => {
    setSugerencias(
      [...new Set(averias.map(a => a.cliente))]
        .filter(c => c.toLowerCase().startsWith(valor.toLowerCase()) && valor.length > 0)
    );
  };

  const guardarAveria = () => {
    if (!cliente || !descripcion) return;

    const fechaActual = new Date().toLocaleString();
    const nuevaLinea = `\n[${fechaActual}] ${descripcion}`;

    const existe = averias.find(a => a.cliente.toLowerCase() === cliente.toLowerCase());

    if (existe) {
      const actualizada = {
        ...existe,
        descripcion: (existe.descripcion || "") + nuevaLinea
      };
      const otras = averias.filter(a => a.id !== existe.id);
      setAverias([actualizada, ...otras]);
    } else {
      const nueva = {
        id: Date.now(),
        cliente,
        descripcion: `[${fechaActual}] ${descripcion}`,
        estado: "Pendiente",
        fecha: fechaActual,
        comentarios: []
      };
      setAverias([nueva, ...averias]);
    }

    setCliente("");
    setDescripcion("");
    setSugerencias([]);
  };

  const editarDescripcion = (id, texto) => {
    setAverias(averias.map(a => a.id === id ? { ...a, descripcion: texto } : a));
  };

  const agregarComentario = (id, texto) => {
    if (!texto.trim()) return;
    setAverias(averias.map(a =>
      a.id === id ? { ...a, comentarios: [...a.comentarios, texto] } : a
    ));
  };

  const editarComentario = (id, index, texto) => {
    setAverias(averias.map(a => {
      if (a.id !== id) return a;
      const comentarios = [...a.comentarios];
      comentarios[index] = texto;
      return { ...a, comentarios };
    }));
  };

  const eliminarComentario = (id, index) => {
    setAverias(averias.map(a => {
      if (a.id !== id) return a;
      const comentarios = [...a.comentarios];
      comentarios.splice(index, 1);
      return { ...a, comentarios };
    }));
  };

  const actualizarEstado = (id, nuevoEstado) => {
    if (nuevoEstado === "Cancelada") {
      setAverias(averias.filter(a => a.id !== id));
    } else {
      setAverias(averias.map(a => a.id === id ? { ...a, estado: nuevoEstado } : a));
    }
  };

  const moverAveria = (id, direccion) => {
    const index = averias.findIndex(a => a.id === id);
    const nuevaLista = [...averias];
    const nuevoIndex = direccion === "subir" ? index - 1 : index + 1;
    if (nuevoIndex >= 0 && nuevoIndex < nuevaLista.length) {
      [nuevaLista[index], nuevaLista[nuevoIndex]] = [nuevaLista[nuevoIndex], nuevaLista[index]];
      setAverias(nuevaLista);
    }
  };

  const averiasFiltradas = averias
    .filter(a => filtroEstado === "Todas" || a.estado === filtroEstado)
    .sort((a, b) => b.id - a.id);

  return (
    React.createElement("div", null,
      React.createElement("input", {
        placeholder: "Cliente",
        value: cliente,
        onChange: e => {
          setCliente(e.target.value);
          actualizarSugerencias(e.target.value);
        }
      }),
      sugerencias.map((s, i) =>
        React.createElement("div", {
          key: i,
          style: { backgroundColor: "#333", padding: "4px", cursor: "pointer" },
          onClick: () => {
            setCliente(s);
            setSugerencias([]);
          }
        }, s)
      ),
      React.createElement("textarea", {
        placeholder: "Descripción del problema",
        value: descripcion,
        onChange: e => setDescripcion(e.target.value)
      }),
      React.createElement("button", { onClick: guardarAveria }, "Guardar avería"),

      React.createElement("select", {
        value: filtroEstado,
        onChange: e => setFiltroEstado(e.target.value),
        style: { marginBottom: "1rem", backgroundColor: "#2563eb", color: "#fff" }
      },
        React.createElement("option", { value: "Todas" }, "Todas las averías"),
        estados.map(e => React.createElement("option", { key: e, value: e }, e))
      ),

      averiasFiltradas.map(a => {
        const [comentario, setComentario] = useState("");
        return React.createElement("div", { key: a.id, className: "card" },
          React.createElement("h3", null, a.cliente),
          React.createElement("textarea", {
            value: a.descripcion,
            onChange: e => editarDescripcion(a.id, e.target.value)
          }),
          React.createElement("p", null, "Fecha: ", a.fecha),
          React.createElement("p", null, "Estado: ", a.estado),
          React.createElement("select", {
            value: a.estado,
            onChange: e => actualizarEstado(a.id, e.target.value),
            style: { backgroundColor: "#3b82f6", color: "#fff" }
          },
            estados.map(e => React.createElement("option", { key: e, value: e }, e))
          ),
          React.createElement("div", { className: "move-buttons" },
            React.createElement("button", { onClick: () => moverAveria(a.id, "subir") }, "↑"),
            React.createElement("button", { onClick: () => moverAveria(a.id, "bajar") }, "↓")
          ),
          React.createElement("ul", null,
            a.comentarios.map((c, i) =>
              React.createElement("li", { key: i },
                React.createElement("input", {
                  value: c,
                  onChange: e => editarComentario(a.id, i, e.target.value)
                }),
                " ",
                React.createElement("button", { onClick: () => eliminarComentario(a.id, i) }, "Eliminar")
              )
            )
          ),
          React.createElement("input", {
            placeholder: "Comentario",
            value: comentario,
            onChange: e => setComentario(e.target.value)
          }),
          React.createElement("button", {
            onClick: () => {
              agregarComentario(a.id, comentario);
              setComentario("");
            }
          }, "Guardar comentario")
        );
      })
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));