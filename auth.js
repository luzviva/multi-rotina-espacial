import { auth, db } from './firebase_config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const signupFormWrapper = document.getElementById('signup-form-wrapper');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    
    const parentPinInput = document.getElementById('parent-pin');
    const themeSelectors = document.querySelectorAll('.theme-selector');
    const hiddenThemeInput = document.getElementById('selected-theme');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const toggleForms = (showSignup) => {
        if (showSignup) {
            loginFormWrapper.classList.replace('form-visible', 'form-hidden');
            signupFormWrapper.classList.replace('form-hidden', 'form-visible');
        } else {
            signupFormWrapper.classList.replace('form-visible', 'form-hidden');
            loginFormWrapper.classList.replace('form-hidden', 'form-visible');
        }
    };
    
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms(true);
    });
    
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms(false);
    });

    parentPinInput.addEventListener('input', (e) => {
        const numericRegex = new RegExp('^[0-9]*$');
        if (!numericRegex.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }
    });
    
    themeSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            themeSelectors.forEach(s => s.classList.remove('selected'));
            selector.classList.add('selected');
            hiddenThemeInput.value = selector.dataset.theme;
        });
    });

    const defaultTheme = document.querySelector('.theme-selector[data-theme="espacial"]');
    if(defaultTheme) {
        defaultTheme.click();
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = signupForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Criando...';

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const childName = document.getElementById('child-name').value.trim();
        const childAge = document.getElementById('child-age').value;
        const parentPin = parentPinInput.value;
        const selectedTheme = hiddenThemeInput.value;

        if (!email || !password || !childName || !childAge || !parentPin || !selectedTheme) {
            alert('Por favor, preencha todos os campos.');
            submitButton.disabled = false;
            submitButton.textContent = 'Criar Conta';
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: email,
                childName: childName,
                childAge: parseInt(childAge, 10),
                parentPin: parentPin,
                selectedTheme: selectedTheme,
                coins: 0,
                createdAt: serverTimestamp()
            });

            window.location.href = 'app.html';

        } catch (error) {
            handleAuthError(error);
            submitButton.disabled = false;
            submitButton.textContent = 'Criar Conta';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!email || !password) {
            alert('Por favor, insira seu e-mail e senha.');
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'app.html';
        } catch (error) {
            handleAuthError(error);
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });

    function handleAuthError(error) {
        let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.";
                break;
            case 'auth/invalid-email':
                errorMessage = "O formato do e-mail é inválido. Verifique e tente novamente.";
                break;
            case 'auth/weak-password':
                errorMessage = "A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.";
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
                break;
        }
        alert(errorMessage);
    }
});
