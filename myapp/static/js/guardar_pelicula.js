document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const formulario = document.getElementById("pelicula-form");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnGuardarCambios = document.getElementById("btn-guardar-cambios");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnBuscar = document.getElementById("btn-buscar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const inputBuscar = document.getElementById("input-buscar");
    const mensajesDiv = document.getElementById("mensajes");
    const tablaPeliculas = document.getElementById("tabla-peliculas");
    const tbody = tablaPeliculas.querySelector("tbody");
    const nombreOriginalInput = document.getElementById("nombre-original");

    // Variables de estado
    let peliculaSeleccionada = null;

    // Funciones auxiliares
    function mostrarMensaje(texto, tipo = 'success') {
        mensajesDiv.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
        setTimeout(() => mensajesDiv.innerHTML = '', 3000);
    }

    function resetFormulario() {
        formulario.reset();
        nombreOriginalInput.value = "";
        btnGuardar.style.display = "inline-block";
        btnGuardarCambios.style.display = "none";
        btnCancelar.style.display = "none";
        peliculaSeleccionada = null;
    }

    // Event Listeners
    formulario.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const formData = new FormData(formulario);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value });

        // Obtener géneros seleccionados
        jsonData["generos"] = Array.from(document.querySelectorAll("input[name='generos']:checked"))
                                 .map(checkbox => checkbox.value);

        // Validar máximo 3 géneros
        if (jsonData["generos"].length > 3) {
            mostrarMensaje("Solo puedes seleccionar hasta 3 géneros.", 'danger');
            return;
        }

        fetch("/peliculas/", {
            method: "POST",
            body: JSON.stringify(jsonData),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
            }
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.message || "Película guardada con éxito!");
            cargarPeliculas();
            resetFormulario();
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarMensaje("Error al guardar la película", 'danger');
        });
    });

    btnGuardarCambios.addEventListener("click", function() {
        const formData = new FormData(formulario);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value });

        // Obtener géneros seleccionados
        jsonData["generos"] = Array.from(document.querySelectorAll("input[name='generos']:checked"))
                                 .map(checkbox => checkbox.value);
        jsonData["nombre_original"] = nombreOriginalInput.value;

        // Validar máximo 3 géneros
        if (jsonData["generos"].length > 3) {
            mostrarMensaje("Solo puedes seleccionar hasta 3 géneros.", 'danger');
            return;
        }

        fetch("/peliculas/", {
            method: "POST",
            body: JSON.stringify(jsonData),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                "X-Method": "PUT"
            }
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje(data.message || "Película actualizada con éxito!");
            cargarPeliculas();
            resetFormulario();
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarMensaje("Error al actualizar la película", 'danger');
        });
    });

    btnCancelar.addEventListener("click", resetFormulario);

    btnBuscar.addEventListener("click", function() {
        const query = inputBuscar.value.trim();
        if (query) {
            cargarPeliculas(query);
        }
    });

    btnLimpiar.addEventListener("click", function() {
        inputBuscar.value = "";
        cargarPeliculas();
    });

    // Delegación de eventos para los botones de la tabla
    tbody.addEventListener("click", function(e) {
        if (e.target.classList.contains("btn-delete") || e.target.closest(".btn-delete")) {
            const boton = e.target.classList.contains("btn-delete") ? e.target : e.target.closest(".btn-delete");
            const nombrePelicula = boton.dataset.nombre;
            
            if (confirm(`¿Estás seguro de eliminar la película "${nombrePelicula}"?`)) {
                fetch("/peliculas/", {
                    method: "DELETE",
                    body: JSON.stringify({ nombre: nombrePelicula }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
                    }
                })
                .then(response => response.json())
                .then(data => {
                    mostrarMensaje(data.message || "Película eliminada correctamente");
                    cargarPeliculas();
                })
                .catch(error => {
                    console.error("Error:", error);
                    mostrarMensaje("Error al eliminar la película", 'danger');
                });
            }
        }
        
        if (e.target.classList.contains("btn-edit") || e.target.closest(".btn-edit")) {
            const boton = e.target.classList.contains("btn-edit") ? e.target : e.target.closest(".btn-edit");
            peliculaSeleccionada = boton.dataset.nombre;

            fetch(`/peliculas/?search=${encodeURIComponent(peliculaSeleccionada)}`, { 
                headers: { "X-Requested-With": "XMLHttpRequest" } 
            })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const pelicula = data[0];
                    
                    document.getElementById("nombre").value = pelicula.nombre;
                    document.getElementById("anio").value = pelicula.anio;
                    document.getElementById("director").value = pelicula.director;
                    document.getElementById("imagen_url").value = pelicula.imagen_url;
                    document.getElementById("trailer_url").value = pelicula.trailer_url;
                    nombreOriginalInput.value = pelicula.nombre;

                    // Limpiar checkboxes primero
                    document.querySelectorAll("input[name='generos']").forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    // Seleccionar los géneros correctos
                    const generos = pelicula.generos.split(",");
                    generos.forEach(genero => {
                        const checkbox = document.querySelector(`input[name='generos'][value='${genero.trim()}']`);
                        if (checkbox) checkbox.checked = true;
                    });

                    // Cambiar a modo edición
                    btnGuardar.style.display = "none";
                    btnGuardarCambios.style.display = "inline-block";
                    btnCancelar.style.display = "inline-block";
                    
                    mostrarMensaje(`Editando: ${pelicula.nombre}`, 'info');
                }
            })
            .catch(error => {
                console.error("Error al cargar película:", error);
                mostrarMensaje("Error al cargar la película", 'danger');
            });
        }
    });

    // Función para cargar películas
    function cargarPeliculas(query = "") {
        const url = query ? `/peliculas/?search=${encodeURIComponent(query)}` : "/peliculas/";
        
        fetch(url, { 
            headers: { "X-Requested-With": "XMLHttpRequest" } 
        })
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = "";
            data.forEach(pelicula => {
                const generos = typeof pelicula.generos === "string" ? 
                               pelicula.generos.split(",") : 
                               pelicula.generos;

                const row = document.createElement("tr");
                row.dataset.nombre = pelicula.nombre;
                row.innerHTML = `
                    <td>${pelicula.nombre}</td>
                    <td>${pelicula.anio}</td>
                    <td>${pelicula.director}</td>
                    <td>${generos.map(g => g.trim()).join(", ")}</td>
                    <td class="action-buttons">
                        <button type="button" class="btn btn-edit" data-nombre="${pelicula.nombre}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button type="button" class="btn btn-delete" data-nombre="${pelicula.nombre}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error al cargar películas:", error);
            mostrarMensaje("Error al cargar películas", 'danger');
        });
    }
});