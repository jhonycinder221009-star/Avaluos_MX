// ===== firebase.js =====

// Configuración de Firebase
var firebaseConfig = {
  apiKey: "AIzaSyDOe-aEkkwzIyLLGo-12fTVx6YoHAKCUug",
  authDomain: "avaluohogarmx.firebaseapp.com",
  projectId: "avaluohogarmx",
  storageBucket: "avaluohogarmx.appspot.com",
  messagingSenderId: "1085578666453",
  appId: "1:1085578666453:web:9579333136b29c09561d5c",
  measurementId: "G-PTSVDKPPF4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
var db = firebase.firestore();

// Hacer global
window.db = db;

console.log("🔥 Firebase conectado:", firebaseConfig.projectId);