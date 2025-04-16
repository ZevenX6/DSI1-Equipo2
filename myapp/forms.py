from django import forms
from .models import Pelicula
from django.contrib.auth.forms import AuthenticationForm, UsernameField
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required




class LoginForm(AuthenticationForm):
    username = UsernameField(label='Usuario', widget=forms.TextInput(attrs={'autofocus': True, 'class': 'form-control'}))
    password = forms.CharField(label='Contraseña', strip=False, widget=forms.PasswordInput(attrs={'autocomplete': 'current-password', 'class': 'form-control'}))


class PeliculaForm(forms.ModelForm):
    generos = forms.MultipleChoiceField(
        choices=Pelicula.GENERO_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=True
    )

    class Meta:
        model = Pelicula
        fields = ['nombre', 'anio', 'director', 'imagen_url', 'trailer_url', 'generos']

    def clean_generos(self):
        generos = self.cleaned_data.get('generos')
        if len(generos) > 3:
            raise forms.ValidationError("Solo puedes seleccionar hasta 3 géneros")
        return ",".join(generos)  # Guardar como cadena separada por comas