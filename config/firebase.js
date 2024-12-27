import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCMrJzAMn5c7NV7iURMSkAZVjQSj4klLwU",
  authDomain: "weatherapp-3af9c.firebaseapp.com",
  databaseURL: "https://weatherapp-3af9c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weatherapp-3af9c",
  storageBucket: "weatherapp-3af9c.firebasestorage.app",
  messagingSenderId: "86429318063",
  appId: "1:86429318063:web:d6b6ba09e352f86f5c4d5a",
  measurementId: "G-2JP35NE1T0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app); 