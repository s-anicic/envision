import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjM42eF9PEZzXTz367B1BxtsHT9PwPoKM",
  authDomain: "envision-3e9b7.firebaseapp.com",
  projectId: "envision-3e9b7",
  storageBucket: "envision-3e9b7.firebasestorage.app",
  messagingSenderId: "116384249768",
  appId: "1:116384249768:web:01dbcbed956f99b4f34f9d",
  measurementId: "G-ENE29JKQN6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence Error:", error);
});

export { auth, db };