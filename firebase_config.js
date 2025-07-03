// firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// O Netlify injetará o objeto window.firebaseConfig antes deste script ser executado.
// Se o objeto não existir (ex: rodando localmente sem um setup), usamos um objeto vazio
// para evitar erros, embora a conexão com o Firebase falhe.
const firebaseConfig = window.firebaseConfig || {};

// Inicializa o Firebase com a configuração injetada
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };