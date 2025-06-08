from django.db import models
from django.urls import reverse

# Create your models here.
from django.db import models

class Pelicula(models.Model):
    GENERO_CHOICES = [
        ('AC', 'Acción'),
        ('DR', 'Drama'),
        ('CO', 'Comedia'),
        ('TE', 'Terror'),
        ('CF', 'Ciencia Ficción'),
        ('RO', 'Romance'),
        ('DO', 'Documental'),
        ('AN', 'Animacion')
    ]
    
    HORARIOS_DISPONIBLES = [
        '09:30 AM',
        '10:00 AM',
        '12:00 AM',
        '01:30 PM',
        '3:00 PM',
        '5:00 PM',
        '6:00 PM',
        '08:30 PM'
    ]
    
    SALAS_DISPONIBLES = [
        'Sala 1',
        'Sala 2',
        'Sala 3',
        'Sala 4',
        'Sala 5',
        'Sala 6'
    ]

    nombre = models.CharField(max_length=255)
    anio = models.IntegerField()
    director = models.CharField(max_length=255)
    imagen_url = models.URLField()
    trailer_url = models.URLField()
    generos = models.CharField(max_length=255)
    horarios = models.CharField(max_length=255, blank=True, null=True)
    salas = models.CharField(max_length=255, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def get_generos_list(self):
        return self.generos.split(",") if self.generos else []

    def get_horarios_list(self):
        return [h.strip() for h in self.horarios.split(",")] if self.horarios else []
        
    def get_salas_list(self):
        return [s.strip() for s in self.salas.split(",")] if self.salas else []

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'peliculas'