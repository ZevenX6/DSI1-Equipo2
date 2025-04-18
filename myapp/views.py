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


# views.py
from .models import Pelicula
from myapp import models

def index(request):
    peliculas = Pelicula.objects.all().order_by('-fecha_creacion')[:10]  # Últimas 10 películas
    return render(request, 'index.html', {'peliculas': peliculas})

##############vista del login
def my_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            # Configuración de "Recuérdame"
            if remember_me:
                request.session.set_expiry(settings.SESSION_COOKIE_AGE)
            else:
                request.session.set_expiry(0)  # Sesión se cierra al cerrar el navegador
                
            next_url = request.POST.get('next', '/peliculas/')
            return redirect(next_url)
        else:
            messages.error(request, 'Usuario o contraseña incorrectos')
    
    return render(request, 'registration/login.html')
#################################################################################


def asientos(request):
    titulo = "Bienvenido al proyecto Django"
    return render(request, "asientos.html", {
        "titulo": titulo
    })





# Diccionario de géneros con nombres completos

GENERO_CHOICES_DICT = {
    "AC": "Acción",
    "DR": "Drama",
    "CO": "Comedia",
    "TE": "Terror",
    "CF": "Ciencia Ficción",
    "RO": "Romance",
    "DO": "Documental",
}

def convertir_generos(codigos_generos):
    """Convierte códigos de género a nombres completos"""
    if not codigos_generos:
        return []
    return [GENERO_CHOICES_DICT.get(codigo.strip(), "Desconocido") 
            for codigo in codigos_generos.split(",")]

@csrf_exempt
def peliculas(request):
    if request.method == 'GET':
        query = request.GET.get("search", "")
        peliculas_list = Pelicula.objects.filter(nombre__icontains=query) if query else Pelicula.objects.all()

        peliculas_data = []
        for pelicula in peliculas_list:
            generos_nombres = convertir_generos(pelicula.generos)
            
            pelicula_data = {
                "nombre": pelicula.nombre,
                "anio": pelicula.anio,
                "director": pelicula.director,
                "imagen_url": pelicula.imagen_url,
                "trailer_url": pelicula.trailer_url,
                "generos": ", ".join(generos_nombres),
                "get_generos_list": generos_nombres,
                "generos_original": pelicula.generos,
            }
            peliculas_data.append(pelicula_data)

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return JsonResponse(peliculas_data, safe=False)

        return render(request, "peliculas.html", {
            "peliculas": peliculas_data,
            "titulo": "Bienvenido al proyecto Django"
        })

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            generos_seleccionados = data.get("generos", [])

            if len(generos_seleccionados) > 3:
                return JsonResponse({"error": "Solo puedes seleccionar hasta 3 géneros."}, status=400)

            if request.headers.get('X-Method') == 'PUT':
                nombre_original = data.get("nombre_original")
                if not nombre_original:
                    return JsonResponse({"error": "Nombre original no proporcionado"}, status=400)

                pelicula = Pelicula.objects.filter(nombre=nombre_original).first()
                if pelicula:
                    pelicula.nombre = data["nombre"]
                    pelicula.anio = data["anio"]
                    pelicula.director = data["director"]
                    pelicula.generos = ",".join(generos_seleccionados)
                    pelicula.imagen_url = data["imagen_url"]
                    pelicula.trailer_url = data["trailer_url"]
                    pelicula.save()
                    return JsonResponse({"message": "Película actualizada con éxito!"})
                else:
                    return JsonResponse({"error": "Película no encontrada"}, status=404)
            else:
                Pelicula.objects.create(
                    nombre=data["nombre"],
                    anio=data["anio"],
                    director=data["director"],
                    generos=",".join(generos_seleccionados),
                    imagen_url=data["imagen_url"],
                    trailer_url=data["trailer_url"]
                )
                return JsonResponse({"message": "Película guardada con éxito!"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        try:
            data = json.loads(request.body)
            nombre_pelicula = data.get("nombre")

            pelicula = Pelicula.objects.filter(nombre=nombre_pelicula).first()
            if pelicula:
                pelicula.delete()
                return JsonResponse({"message": "Película eliminada correctamente"})
            else:
                return JsonResponse({"error": "Película no encontrada"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)