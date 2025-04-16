from django .urls import path
from . import views 
from django.urls import path



urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.my_login, name = 'login'),
    path('peliculas/', views.peliculas, name= 'peliculas'),
    path('asientos/',views.asientos),
    path('peliculas/agregar/', views.agregar_pelicula, name='agregar_pelicula'),
    path('peliculas/editar/<int:id>/', views.editar_pelicula, name='editar_pelicula'),
    path('peliculas/eliminar/<int:id>/', views.eliminar_pelicula, name='eliminar_pelicula'),
    
    
]