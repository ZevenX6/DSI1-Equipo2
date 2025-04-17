# Generated by Django 5.1.6 on 2025-04-16 22:48

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Pelicula',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('anio', models.IntegerField()),
                ('director', models.CharField(max_length=255)),
                ('imagen_url', models.URLField()),
                ('trailer_url', models.URLField()),
                ('generos', models.CharField(max_length=255)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'peliculas',
            },
        ),
    ]
