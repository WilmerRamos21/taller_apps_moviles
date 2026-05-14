import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { SupabaseService } from '../services/supabase.service';
import { IonicModule } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common'; // <--- IMPORTANTE: Añade esto

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true, // Asegúrate de que diga true si usas imports
  imports: [IonicModule, CommonModule] // <--- AÑADE CommonModule AQUÍ
})
export class HomePage {
  latitud: number | null = null;
  longitud: number | null = null;
  googleMapsUrl: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async registrarUbicacion() {
    try {
      // --- PASO CRÍTICO: SOLICITAR PERMISOS ---
      const checkStatus = await Geolocation.checkPermissions();
      
      if (checkStatus.location !== 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== 'granted') {
          alert('No se puede obtener la ubicación sin permisos.');
          return;
        }
      }
      // ---------------------------------------

      const coordinates = await Geolocation.getCurrentPosition();
      this.latitud = coordinates.coords.latitude;
      this.longitud = coordinates.coords.longitude;

      const data = {
        latitud: this.latitud,
        longitud: this.longitud,
        fecha: new Date().toISOString(),
        usuario: 'adrian_ramos' 
      };

      const { error } = await this.supabaseService.supabase
        .from('historial_ubicaciones')
        .insert([data]);

      if (error) throw error;

      alert('Ubicación guardada en Supabase.');

    } catch (err: any) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    }
  }

  async abrirMapa() {
    if (this.latitud && this.longitud) {
      const url = `https://www.google.com/maps?q=${this.latitud},${this.longitud}`;
      await Browser.open({ url: url });
    } else {
      alert('No hay coordenadas registradas');
    }
  }
}