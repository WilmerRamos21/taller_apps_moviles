import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  app = initializeApp(environment.firebaseConfig);

  db = getFirestore(this.app);

  constructor() {}

  async guardarUbicacion(data: any) {

    try {

      await addDoc(
        collection(this.db, 'historial_ubicaciones'),
        data
      );

      return { success: true };

    } catch (error) {

      console.error(error);

      return { success: false, error };

    }
  }
}