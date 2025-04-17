document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("pelicula-form");
    const tablaPeliculas = document.getElementById("tabla-peliculas").getElementsByTagName("tbody")[0];
    const buscarInput = document.getElementById("input-buscar");
    const btnBuscar = document.getElementById("btn-buscar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const checkboxes = document.querySelectorAll("input[name='generos']");

    // **1️⃣ Limitar selección a 3 géneros**
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            let seleccionados = document.querySelectorAll("input[name='generos']:checked");
            if (seleccionados.length > 3) {
                this.checked = false; // ✋ Desmarcar si se excede el límite
                alert("Solo puedes seleccionar hasta 3 géneros.");
            }
        });
    });

    // **2️⃣ Guardar o Editar Película**
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        
        const formData = new FormData(formulario);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value });

        // Obtener géneros seleccionados
        const generosSeleccionados = Array.from(document.querySelectorAll("input[name='generos']:checked"))
                                          .map(checkbox => checkbox.value);
        jsonData["generos"] = generosSeleccionados;

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
            if (data.error) {
                alert(data.error); // 🚨 Mostrar error si supera el límite de géneros
            } else {
                alert(data.message);
                cargarPeliculas();
                formulario.reset();
            }
        })
        .catch(error => console.error("Error:", error));
    });

    // **3️⃣ Eliminar Película**
    tablaPeliculas.addEventListener("click", function (e) {
        if (e.target.classList.contains("btn-eliminar")) {
            const nombrePelicula = e.target.dataset.nombre;
            if (confirm(`¿Seguro que quieres eliminar ${nombrePelicula}?`)) {
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
                    alert(data.message);
                    cargarPeliculas();
                })
                .catch(error => console.error("Error:", error));
            }
        }
    });

    // **4️⃣ Buscar Películas**
    btnBuscar.addEventListener("click", function () {
        const query = buscarInput.value.trim();
        fetch(`/peliculas/?search=${query}`, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(response => response.json())
        .then(data => actualizarTabla(data))
        .catch(error => console.error("Error:", error));
    });

    // **5️⃣ Mostrar Todas**
    btnLimpiar.addEventListener("click", function () {
        buscarInput.value = "";
        cargarPeliculas();
    });

    // **6️⃣ Cargar todas las películas**
    function cargarPeliculas() {
        fetch("/peliculas/", { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(response => response.json())
        .then(data => {
            console.log("Películas recibidas:", data); // 🔍 Verifica en la consola
            actualizarTabla(data);
        })
        .catch(error => console.error("Error al cargar películas:", error));
    }

    // **7️⃣ Actualizar la tabla con nombres completos de los géneros**
    function actualizarTabla(peliculas) {
        tablaPeliculas.innerHTML = ""; // 🧹 Limpiar tabla antes de agregar filas

        peliculas.forEach(pelicula => {
            let generos = pelicula.generos;
            if (typeof generos === "string") {
                generos = generos.split(",");
            }

            let fila = tablaPeliculas.insertRow();
            fila.innerHTML = `
                <td>${pelicula.nombre}</td>
                <td>${pelicula.anio}</td>
                <td>${pelicula.director}</td>
                <td>${generos.join(", ")}</td>
                <td>
                    <button class="btn-eliminar" data-nombre="${pelicula.nombre}">Eliminar</button>
                </td>
            `;
        });
    }

    cargarPeliculas(); // Ejecutar al cargar la página
});