// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmAol0JD3uqul3BWCOzSPvOKVAgZlCct4",
  authDomain: "invoice-contract-generator.firebaseapp.com",
  projectId: "invoice-contract-generator",
  storageBucket: "invoice-contract-generator.firebasestorage.app",
  messagingSenderId: "56554555044",
  appId: "1:56554555044:web:cd2d8cff81c10923170831",
  measurementId: "G-810T4MGER9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);