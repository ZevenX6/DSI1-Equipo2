import json
from django.shortcuts import render, redirect
from DSI2025 import settings
from .forms import *
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from .models import Pelicula
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

# Diccionario de géneros con nombres completos
GENERO_CHOICES_DICT = {
    "AC": "Acción",
    "DR": "Drama",
    "CO": "Comedia",
    "TE": "Terror",
    "CF": "Ciencia Ficción",
    "RO": "Romance",
    "DO": "Documental",
    "AN": "Animacion"
}

def convertir_generos(codigos_generos):
    """Convierte códigos de género a nombres completos"""
    if not codigos_generos:
        return []
    return [GENERO_CHOICES_DICT.get(codigo.strip(), "Desconocido") 
            for codigo in codigos_generos.split(",")]

def index(request):
    peliculas = Pelicula.objects.all().order_by('-fecha_creacion')[:10]  # Últimas 10 películas
    
    # Convertir los códigos de género a nombres completos
    for pelicula in peliculas:
        pelicula.get_generos_list = convertir_generos(pelicula.generos)

    return render(request, 'index.html', {'peliculas': peliculas})

def my_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            if remember_me:
                request.session.set_expiry(settings.SESSION_COOKIE_AGE)
            else:
                request.session.set_expiry(0)
                
            next_url = request.POST.get('next', '/peliculas/')
            return redirect(next_url)
        else:
            messages.error(request, 'Usuario o contraseña incorrectos')
    
    return render(request, 'registration/login.html')

def asientos(request):
    titulo = "Bienvenido al proyecto Django"
    return render(request, "asientos.html", {
        "titulo": titulo
    })

@csrf_exempt
def peliculas(request):
    # Obtener todas las películas para mostrar en la tabla
    peliculas_list = Pelicula.objects.all().order_by('-fecha_creacion')
    
    # Procesar búsqueda si existe
    busqueda = request.GET.get('busqueda', '').strip()
    if busqueda:
        peliculas_list = peliculas_list.filter(
            Q(nombre__icontains=busqueda) | 
            Q(director__icontains=busqueda)
        )
    
    # Procesar formulario para crear/editar/eliminar
    if request.method == 'POST':
        accion = request.POST.get('accion')
        
        if accion == 'crear':
            # Validar y crear nueva película
            nombre = request.POST.get('nombre', '').strip()
            anio = request.POST.get('anio', '').strip()
            director = request.POST.get('director', '').strip()
            imagen_url = request.POST.get('imagen_url', '').strip()
            trailer_url = request.POST.get('trailer_url', '').strip()
            generos = request.POST.getlist('generos')
            horarios = request.POST.getlist('horarios')
            salas = request.POST.getlist('salas')
            
            # Validaciones
            errores = []
            
            if not nombre:
                errores.append('El nombre es obligatorio')
            if Pelicula.objects.filter(nombre=nombre).exists():
                errores.append('Ya existe una película con ese nombre')
            if not anio.isdigit() or int(anio) < 1900 or int(anio) > 2099:
                errores.append('El año debe ser entre 1900 y 2099')
            if not director:
                errores.append('El director es obligatorio')
            if not imagen_url:
                errores.append('La URL de la imagen es obligatoria')
            if not trailer_url:
                errores.append('La URL del trailer es obligatoria')
            if len(generos) == 0:
                errores.append('Debe seleccionar al menos un género')
            if len(generos) > 3:
                errores.append('No puede seleccionar más de 3 géneros')
            if len(horarios) == 0:
                errores.append('Debe seleccionar al menos un horario')
            if len(salas) == 0:
                errores.append('Debe seleccionar al menos una sala')
            
            if not errores:
                try:
                    pelicula = Pelicula(
                        nombre=nombre,
                        anio=int(anio),
                        director=director,
                        imagen_url=imagen_url,
                        trailer_url=trailer_url,
                        generos=",".join(generos),
                        horarios=",".join(horarios),
                        salas=",".join(salas)
                    )
                    pelicula.save()
                    messages.success(request, f'Película "{nombre}" creada exitosamente!')
                    return redirect('peliculas')
                except Exception as e:
                    messages.error(request, f'Error al crear la película: {str(e)}')
            else:
                for error in errores:
                    messages.error(request, error)
                
        elif accion == 'editar':
            # Obtener datos del formulario
            nombre_original = request.POST.get('nombre_original', '').strip()
            nombre = request.POST.get('nombre', '').strip()
            anio = request.POST.get('anio', '').strip()
            director = request.POST.get('director', '').strip()
            imagen_url = request.POST.get('imagen_url', '').strip()
            trailer_url = request.POST.get('trailer_url', '').strip()
            generos = request.POST.getlist('generos')
            horarios = request.POST.getlist('horarios')
            salas = request.POST.getlist('salas')
            
            # Validaciones
            errores = []
            
            if not nombre_original:
                errores.append('No se especificó la película a editar')
            if not nombre:
                errores.append('El nombre es obligatorio')
            if nombre != nombre_original and Pelicula.objects.filter(nombre=nombre).exists():
                errores.append('Ya existe otra película con ese nombre')
            if not anio.isdigit() or int(anio) < 1900 or int(anio) > 2099:
                errores.append('El año debe ser entre 1900 y 2099')
            if not director:
                errores.append('El director es obligatorio')
            if not imagen_url:
                errores.append('La URL de la imagen es obligatoria')
            if not trailer_url:
                errores.append('La URL del trailer es obligatoria')
            if len(generos) == 0:
                errores.append('Debe seleccionar al menos un género')
            if len(generos) > 3:
                errores.append('No puede seleccionar más de 3 géneros')
            if len(horarios) == 0:
                errores.append('Debe seleccionar al menos un horario')
            if len(salas) == 0:
                errores.append('Debe seleccionar al menos una sala')
            
            if not errores:
                try:
                    pelicula = Pelicula.objects.get(nombre=nombre_original)
                    pelicula.nombre = nombre
                    pelicula.anio = int(anio)
                    pelicula.director = director
                    pelicula.imagen_url = imagen_url
                    pelicula.trailer_url = trailer_url
                    pelicula.generos = ",".join(generos)
                    pelicula.horarios = ",".join(horarios)
                    pelicula.salas = ",".join(salas)
                    pelicula.save()
                    messages.success(request, f'Película "{nombre}" actualizada exitosamente!')
                    return redirect('peliculas')
                except Pelicula.DoesNotExist:
                    messages.error(request, 'La película que intentas editar no existe')
                except Exception as e:
                    messages.error(request, f'Error al actualizar la película: {str(e)}')
            else:
                for error in errores:
                    messages.error(request, error)
                
        elif accion == 'eliminar':
            nombre = request.POST.get('nombre', '').strip()
            if nombre:
                try:
                    pelicula = Pelicula.objects.get(nombre=nombre)
                    pelicula.delete()
                    messages.success(request, f'Película "{nombre}" eliminada exitosamente!')
                    return redirect('peliculas')
                except Pelicula.DoesNotExist:
                    messages.error(request, 'La película que intentas eliminar no existe')
                except Exception as e:
                    messages.error(request, f'Error al eliminar la película: {str(e)}')
            else:
                messages.error(request, 'No se especificó la película a eliminar')
    
    # Preparar datos para el template
    generos_choices = dict(Pelicula.GENERO_CHOICES)
    horarios_disponibles = Pelicula.HORARIOS_DISPONIBLES
    salas_disponibles = Pelicula.SALAS_DISPONIBLES
    
    # Si estamos editando, cargar los datos de la película
    pelicula_editar = None
    if 'editar' in request.GET:
        nombre = request.GET.get('editar')
        try:
            pelicula_editar = Pelicula.objects.get(nombre=nombre)
        except Pelicula.DoesNotExist:
            messages.error(request, f'No se encontró la película "{nombre}" para editar')
    
    context = {
        'peliculas': peliculas_list,
        'GENERO_CHOICES_DICT': generos_choices,
        'HORARIOS_DISPONIBLES': horarios_disponibles,
        'SALAS_DISPONIBLES': salas_disponibles,
        'pelicula_editar': pelicula_editar,
        'busqueda': busqueda,
    }
    
    return render(request, 'peliculas.html', context)