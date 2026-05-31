import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCXYT0q7MElxaguX3g7vn47Sb2ryENkOv0",
  authDomain: "tpa360-9407e.firebaseapp.com",
  projectId: "tpa360-9407e",
  storageBucket: "tpa360-9407e.firebasestorage.app",
  messagingSenderId: "715387194045",
  appId: "1:715387194045:web:a06f1629137722591a85d4",
  measurementId: "G-N313PY2S4W",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth).catch(() => {});
