import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { SupabaseService } from '../services/supabase.service';
import { FirebaseService } from '../services/firebase.service';

import { IonicModule } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  latitud: number | null = null;
  longitud: number | null = null;
  googleMapsUrl: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private firebaseService: FirebaseService
  ) {

    // REGISTRAR ICONO
    addIcons({
      locationOutline
    });

  }

  async registrarUbicacion() {

    try {

      // OBTENER USUARIO LOGUEADO
      const {
        data: { user }
      } = await this.supabaseService.supabase.auth.getUser();

      const usuarioActual = user?.email || 'usuario_desconocido';

      // =========================
      // SI ES WEB (ionic serve)
      // =========================

      if (window.location.protocol.startsWith('http')) {

        if (!navigator.geolocation) {
          alert('Geolocalización no soportada');
          return;
        }

        navigator.geolocation.getCurrentPosition(

          async (position) => {

            this.latitud = position.coords.latitude;
            this.longitud = position.coords.longitude;

            // VER PRECISIÓN
            console.log('PRECISION:', position.coords.accuracy);

            const data = {
              latitud: this.latitud,
              longitud: this.longitud,
              fecha: new Date().toISOString(),
              usuario: usuarioActual
            };

            // GUARDAR EN FIREBASE
            await this.firebaseService.guardarUbicacion(data);

            alert('Ubicación guardada en Firebase');

          },

          (error) => {
            console.error(error);
            alert('Error obteniendo ubicación');
          },

          // OPCIONES DE ALTA PRECISIÓN
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }

        );

        return;
      }

      // =========================
      // SI ES APP MÓVIL
      // =========================

      const checkStatus = await Geolocation.checkPermissions();

      if (checkStatus.location !== 'granted') {

        const requestStatus = await Geolocation.requestPermissions();

        if (requestStatus.location !== 'granted') {
          alert('No se puede obtener la ubicación sin permisos.');
          return;
        }
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      this.latitud = coordinates.coords.latitude;
      this.longitud = coordinates.coords.longitude;

      console.log('PRECISION:', coordinates.coords.accuracy);

      const data = {
        latitud: this.latitud,
        longitud: this.longitud,
        fecha: new Date().toISOString(),
        usuario: usuarioActual
      };

      // GUARDAR EN FIREBASE
      await this.firebaseService.guardarUbicacion(data);

      alert('Ubicación guardada en Firebase.');

    } catch (err: any) {

      console.error('Error:', err);
      alert('Error: ' + err.message);

    }
  }

  async abrirMapa() {

    if (this.latitud && this.longitud) {

      const url =
        `https://www.google.com/maps?q=${this.latitud},${this.longitud}`;

      await Browser.open({
        url: url
      });

    } else {

      alert('No hay coordenadas registradas');

    }
  }
}