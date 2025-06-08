document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('pelicula-form');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnGuardarCambios = document.getElementById('btn-guardar-cambios');
    const inputBuscar = document.getElementById('input-buscar');
    const btnBuscar = document.getElementById('btn-buscar');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const mensajesDiv = document.getElementById('mensajes');
    const tablaPeliculas = document.getElementById('tabla-peliculas').querySelector('tbody');

    // Variables de estado
    let modoEdicion = false;
    let nombreOriginal = '';

    // Cargar películas al iniciar
    cargarPeliculas();

    // Event Listeners
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (modoEdicion) {
            guardarCambios();
        } else {
            crearPelicula();
        }
    });

    btnCancelar.addEventListener('click', cancelarEdicion);
    btnBuscar.addEventListener('click', buscarPeliculas);
    btnLimpiar.addEventListener('click', function() {
        inputBuscar.value = '';
        cargarPeliculas();
    });

    // Delegación de eventos para botones de editar/eliminar
    tablaPeliculas.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
            const btn = e.target.classList.contains('btn-edit') ? e.target : e.target.closest('.btn-edit');
            editarPelicula(btn.dataset.nombre);
        } else if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
            const btn = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
            eliminarPelicula(btn.dataset.nombre);
        }
    });

    // Funciones CRUD
    function cargarPeliculas(search = '') {
        let url = '/peliculas/';
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }

        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            tablaPeliculas.innerHTML = '';
            data.forEach(pelicula => {
                const tr = document.createElement('tr');
                tr.dataset.nombre = pelicula.nombre;
                tr.innerHTML = `
                    <td>${pelicula.nombre}</td>
                    <td>${pelicula.anio}</td>
                    <td>${pelicula.director}</td>
                    <td>${pelicula.generos}</td>
                    <td>${pelicula.horarios}</td>
                    <td>${pelicula.salas}</td>
                    <td class="action-buttons">
                        <button type="button" class="btn btn-edit" data-nombre="${pelicula.nombre}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button type="button" class="btn btn-delete" data-nombre="${pelicula.nombre}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </td>
                `;
                tablaPeliculas.appendChild(tr);
            });
        })
        .catch(error => {
            mostrarMensaje('Error al cargar las películas', 'error');
            console.error('Error:', error);
        });
    }

    function crearPelicula() {
        const formData = new FormData(form);
        const data = {
            nombre: formData.get('nombre'),
            anio: formData.get('anio'),
            director: formData.get('director'),
            imagen_url: formData.get('imagen_url'),
            trailer_url: formData.get('trailer_url'),
            generos: Array.from(document.querySelectorAll('input[name="generos"]:checked')).map(cb => cb.value),
            horarios: Array.from(document.querySelectorAll('input[name="horarios"]:checked')).map(cb => cb.value),
            salas: Array.from(document.querySelectorAll('input[name="salas"]:checked')).map(cb => cb.value)
        };

        // Validación del lado del cliente
        if (!validarFormulario(data)) return;

        fetch('/peliculas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error, 'error');
            } else {
                mostrarMensaje(data.message, 'success');
                form.reset();
                cargarPeliculas();
            }
        })
        .catch(error => {
            mostrarMensaje('Error al guardar la película', 'error');
            console.error('Error:', error);
        });
    }

    function editarPelicula(nombre) {
        fetch(`/peliculas/?nombre=${encodeURIComponent(nombre)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const pelicula = data.data;
                modoEdicion = true;
                nombreOriginal = pelicula.nombre;
                
                // Llenar el formulario
                document.getElementById('nombre').value = pelicula.nombre;
                document.getElementById('anio').value = pelicula.anio;
                document.getElementById('director').value = pelicula.director;
                document.getElementById('imagen_url').value = pelicula.imagen_url;
                document.getElementById('trailer_url').value = pelicula.trailer_url;
                document.getElementById('nombre-original').value = pelicula.nombre;
                document.getElementById('accion').value = 'editar';

                // Marcar géneros
                document.querySelectorAll('input[name="generos"]').forEach(cb => {
                    cb.checked = pelicula.generos.includes(cb.value);
                });

                // Marcar horarios
                document.querySelectorAll('input[name="horarios"]').forEach(cb => {
                    cb.checked = pelicula.horarios.includes(cb.value);
                });

                // Marcar salas
                document.querySelectorAll('input[name="salas"]').forEach(cb => {
                    cb.checked = pelicula.salas.includes(cb.value);
                });

                // Cambiar botones
                btnGuardar.style.display = 'none';
                btnCancelar.style.display = 'inline-block';
                btnGuardarCambios.style.display = 'inline-block';

                // Desplazarse al formulario
                form.scrollIntoView({ behavior: 'smooth' });
            } else {
                mostrarMensaje(data.error, 'error');
            }
        })
        .catch(error => {
            mostrarMensaje('Error al cargar la película para edición', 'error');
            console.error('Error:', error);
        });
    }

    function guardarCambios() {
        const formData = new FormData(form);
        const data = {
            nombre: formData.get('nombre'),
            anio: formData.get('anio'),
            director: formData.get('director'),
            imagen_url: formData.get('imagen_url'),
            trailer_url: formData.get('trailer_url'),
            generos: Array.from(document.querySelectorAll('input[name="generos"]:checked')).map(cb => cb.value),
            horarios: Array.from(document.querySelectorAll('input[name="horarios"]:checked')).map(cb => cb.value),
            salas: Array.from(document.querySelectorAll('input[name="salas"]:checked')).map(cb => cb.value),
            nombre_original: nombreOriginal
        };

        // Validación del lado del cliente
        if (!validarFormulario(data)) return;

        fetch('/peliculas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Method': 'PUT'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error, 'error');
            } else {
                mostrarMensaje(data.message, 'success');
                cancelarEdicion();
                cargarPeliculas();
            }
        })
        .catch(error => {
            mostrarMensaje('Error al actualizar la película', 'error');
            console.error('Error:', error);
        });
    }

    function eliminarPelicula(nombre) {
        if (!confirm(`¿Estás seguro de que deseas eliminar la película "${nombre}"?`)) {
            return;
        }

        fetch('/peliculas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
                'X-Method': 'DELETE'
            },
            body: JSON.stringify({ nombre: nombre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error, 'error');
            } else {
                mostrarMensaje(data.message, 'success');
                cargarPeliculas();
            }
        })
        .catch(error => {
            mostrarMensaje('Error al eliminar la película', 'error');
            console.error('Error:', error);
        });
    }

    function cancelarEdicion() {
        modoEdicion = false;
        form.reset();
        btnGuardar.style.display = 'inline-block';
        btnCancelar.style.display = 'none';
        btnGuardarCambios.style.display = 'none';
        document.getElementById('accion').value = 'crear';
    }

    function buscarPeliculas() {
        const searchTerm = inputBuscar.value.trim();
        cargarPeliculas(searchTerm);
    }

    function validarFormulario(data) {
        // Validar nombre
        if (!data.nombre || data.nombre.trim() === '') {
            mostrarMensaje('El nombre de la película es requerido', 'error');
            return false;
        }

        // Validar año
        if (!data.anio || isNaN(data.anio) {
            mostrarMensaje('El año debe ser un número válido', 'error');
            return false;
        }

        const year = parseInt(data.anio);
        if (year < 1900 || year > new Date().getFullYear() + 5) {
            mostrarMensaje(`El año debe estar entre 1900 y ${new Date().getFullYear() + 5}`, 'error');
            return false;
        }

        // Validar director
        if (!data.director || data.director.trim() === '') {
            mostrarMensaje('El director es requerido', 'error');
            return false;
        }

        // Validar géneros
        if (data.generos.length === 0) {
            mostrarMensaje('Selecciona al menos un género', 'error');
            return false;
        }

        if (data.generos.length > 3) {
            mostrarMensaje('Solo puedes seleccionar hasta 3 géneros', 'error');
            return false;
        }

        // Validar horarios
        if (data.horarios.length === 0) {
            mostrarMensaje('Selecciona al menos un horario', 'error');
            return false;
        }

        // Validar salas
        if (data.salas.length === 0) {
            mostrarMensaje('Selecciona al menos una sala', 'error');
            return false;
        }

        // Validar URLs
        if (!data.imagen_url || !validarURL(data.imagen_url)) {
            mostrarMensaje('La URL de la imagen no es válida', 'error');
            return false;
        }

        if (!data.trailer_url || !validarURL(data.trailer_url)) {
            mostrarMensaje('La URL del trailer no es válida', 'error');
            return false;
        }

        return true;
    }

    function validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    function mostrarMensaje(mensaje, tipo = 'success') {
        mensajesDiv.innerHTML = `<div class="message ${tipo}">${mensaje}</div>`;
        setTimeout(() => {
            mensajesDiv.innerHTML = '';
        }, 5000);
    }
});