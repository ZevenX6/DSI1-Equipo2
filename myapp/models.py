from django.db import models
from django.urls import reverse

# Create your models here.


from django.db import models

class Pelicula(models.Model):
    GENERO_CHOICES = [
        ('accion', 'Acción'),
        ('drama', 'Drama'),
        ('comedia', 'Comedia'),
        ('terror', 'Terror'),
        ('ciencia_ficcion', 'Ciencia Ficción'),
        ('romance', 'Romance'),
        ('documental', 'Documental'),
    ]

    nombre = models.CharField(max_length=255)
    anio = models.IntegerField()
    director = models.CharField(max_length=255)
    imagen_url = models.URLField()
    trailer_url = models.URLField()
    generos = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def get_generos_list(self):
        return self.generos.split(",") if self.generos else []

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'peliculas'  # ✨ Esto define el nombre de la tabla