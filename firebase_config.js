// Import the functions you need from the SDKs you need
// Usando importação via CDN para o navegador
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Importar o serviço de autenticação
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Importar o serviço de banco de dados Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
// As chaves são colocadas diretamente aqui, pois import.meta.env não está disponível sem um bundler.
const firebaseConfig = {
  apiKey: "AIzaSyDYTgt_CgQUp6kYfPeqc7JCaJuaeuEzP4Q",
  authDomain: "multirotinaespacial.firebaseapp.com",
  projectId: "multirotinaespacial",
  storageBucket: "multirotinaespacial.firebasestorage.app",
  messagingSenderId: "69790293324",
  appId: "1:69790293324:web:3a2eb68b8beaeabb9ac3e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializar o serviço de autenticação
const db = getFirestore(app); // Inicializar o serviço de banco de dados Firestore

// Exportar 'app', 'auth' e 'db' para que outros módulos possam importá-los
export { app, auth, db };
