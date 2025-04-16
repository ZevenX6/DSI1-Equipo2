from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from DSI2025 import settings
from .forms import *
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm 
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Pelicula
from .forms import PeliculaForm
from myapp import models
from django.db.models import Q

# views.py
from .models import Pelicula

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




# 📌 Leer y listar películas
def peliculas(request):
    query = request.GET.get('q', '').strip()
    peliculas = Pelicula.objects.all()

    if query:
        peliculas = peliculas.filter(nombre__icontains=query)

    form = PeliculaForm()
    return render(request, 'peliculas.html', {'peliculas': peliculas, 'form': form})

# 📌 Crear nueva película
def agregar_pelicula(request):
    if request.method == 'POST':
        form = PeliculaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('peliculas')  # Redirige a la lista de películas

    form = PeliculaForm()
    return render(request, 'peliculas.html', {'form': form})

# 📌 Editar una película
def editar_pelicula(request, pelicula_id):
    pelicula = get_object_or_404(Pelicula, id=pelicula_id)

    if request.method == 'POST':
        form = PeliculaForm(request.POST, instance=pelicula)
        if form.is_valid():
            form.save()
            return redirect('peliculas')

    form = PeliculaForm(instance=pelicula)
    return render(request, 'peliculas.html', {'form': form, 'pelicula': pelicula})

# 📌 Eliminar una película
def eliminar_pelicula(request, pelicula_id):
    pelicula = get_object_or_404(Pelicula, id=pelicula_id)

    if request.method == 'POST':
        pelicula.delete()
        return redirect('peliculas')

    return render(request, 'confirmar_eliminar.html', {'pelicula': pelicula})


