import { auth } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, user => {
    if (user) {
        window.location.replace('app.html');
    } else {
        window.location.replace('auth.html');
    }
});
