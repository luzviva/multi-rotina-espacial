// Import the functions you need from the SDKs you need
// Usando importação via CDN para o navegador
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// Por exemplo, para Firestore:
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Acessando as variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exemplo de como você pode usar o 'app' em outras partes do seu código
// export default app; // Se estiver usando módulos para exportar o 'app'
