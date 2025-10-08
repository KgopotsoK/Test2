import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDqwGRNX7eRmg4mNh5XkJHnQh4wcDg_zd8",
  authDomain: "shopez-cf6f7.firebaseapp.com",
  databaseURL: "https://shopez-cf6f7-default-rtdb.firebaseio.com",
  projectId: "shopez-cf6f7",
  storageBucket: "shopez-cf6f7.firebasestorage.app",
  messagingSenderId: "609319079087",
  appId: "1:609319079087:web:6354b0cae48029653a985a"
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export const database = getDatabase(app);

export default app;