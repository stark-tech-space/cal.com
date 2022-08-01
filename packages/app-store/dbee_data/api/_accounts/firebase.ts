import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process.env.DBEE_FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.DBEE_FIREBASE_CLIENT_EMAIL || '',
      privateKey: process.env.DBEE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    })
  });
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const Timestamp = firebase.firestore.Timestamp;
export const FieldValue = firebase.firestore.FieldValue;
export const DB = getFirestore();