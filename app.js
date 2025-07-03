import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const themes = {
    espacial: {
      backgroundImage: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
      primaryColor: '#facc15',
      secondaryColor: '#22d3ee'
    },
    futebol: {
      backgroundImage: `url('https://r2.flowith.net/files/o/1751552104899-vibrant_football_stadium_for_kids_app_background_index_0@1024x1024.png')`,
      primaryColor: '#22c55e',
      secondaryColor: '#f5f5f5'
    },
    lego: {
      backgroundImage: `url('https://r2.flowith.net/files/o/1751552304104-lego_landscape_art_index_1@1536x1024.png')`,
      primaryColor: '#f59e0b',
      secondaryColor: '#3b82f6'
    },
    gatinhos: {
      backgroundImage: `url('https://r2.flowith.net/files/o/1751552192223-cute_playful_kittens_wool_yarn_soft_cushions_pastel_colors_index_2@1024x1024.png')`,
      primaryColor: '#f472b6',
      secondaryColor: '#a78bfa'
    },
    unicornios: {
      backgroundImage: `url('https://r2.flowith.net/files/o/1751552110304-enchanting_unicorn_forest_scene_index_3@1024x1024.png')`,
      primaryColor: '#c084fc',
      secondaryColor: '#67e8f9'
    },
    minimalista: {
      backgroundImage: `url('https://r2.flowith.net/files/o/1751552044314-minimalist_geometric_abstract_background_index_4@1024x1024.png')`,
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280'
    }
};

let currentUser = null;
let userProfile = null;
let tasks = [];
let pinProtectedAction = null;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const loadingOverlay = document.getElementById('loading-overlay');
    const appContainer = document.getElementById('app-container');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserData();
            initializeAppUI();
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 500);
            appContainer.style.opacity = '1';
        } else {
            window.location.replace('auth.html');
        }
    });

    setupEventListeners();
});

async function loadUserData() {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        userProfile = userDocSnap.data();
        await loadTasks();
    } else {
        console.error("No user profile found!");
        signOut(auth);
    }
}

async function loadTasks() {
    const tasksColRef = collection(db, 'users', currentUser.uid, 'tasks');
    const tasksSnapshot = await getDocs(tasksColRef);
    tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function applyTheme() {
    const theme = themes[userProfile.selectedTheme] || themes.espacial;
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-image', theme.backgroundImage);
    root.style.setProperty('--theme-primary-color', theme.primaryColor);
    root.style.setProperty('--theme-secondary-color', theme.secondaryColor);
}

function initializeAppUI() {
    applyTheme();
    updateCoinDisplays();
    document.getElementById('child-name-display').textContent = `Olá, ${userProfile.childName}!`;
    renderSchedule();
    renderAdminTaskList();
}

function updateCoinDisplays() {
    document.getElementById('coin-total').textContent = userProfile.coins || 0;
    document.getElementById('admin-coin-total').textContent = userProfile.coins || 0;
}

function renderSchedule() {
    const scheduleGrid = document.getElementById('schedule-grid');
    scheduleGrid.innerHTML = '<h1>Rotina Diária (em breve)</h1>';
}

function renderAdminTaskList() {
    const listContainer = document.getElementById('admin-task-list');
    listContainer.innerHTML = '';
    if (tasks.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-400">Nenhuma tarefa cadastrada.</p>';
        return;
    }
    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
        taskEl.innerHTML = `
            <div>
                <p class="font-bold">${task.description}</p>
                <p class="text-sm text-gray-300">${task.time}</p>
            </div>
            <div class="flex gap-2">
                <button data-task-id="${task.id}" class="edit-task-btn p-2 text-yellow-400 hover:text-yellow-300"><i data-lucide="edit"></i></button>
                <button data-task-id="${task.id}" class="delete-task-btn p-2 text-red-500 hover:text-red-400"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        listContainer.appendChild(taskEl);
    });
    lucide.createIcons();
    
    listContainer.querySelectorAll('.edit-task-btn').forEach(btn => btn.addEventListener('click', handleEditTask));
    listContainer.querySelectorAll('.delete-task-btn').forEach(btn => btn.addEventListener('click', handleDeleteTask));
}

function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth);
    });

    document.getElementById('switch-to-admin').addEventListener('click', () => requestPin(() => toggleView(true)));
    document.getElementById('switch-to-child').addEventListener('click', () => toggleView(false));
    
    document.getElementById('add-coin-btn').addEventListener('click', () => requestPin(addCoin));
    document.getElementById('remove-coin-btn').addEventListener('click', () => requestPin(removeCoin));
    
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);
    document.getElementById('form-cancel-btn').addEventListener('click', resetTaskForm);

    document.getElementById('pin-form').addEventListener('submit', handlePinSubmit);
    document.getElementById('pin-cancel').addEventListener('click', hidePinModal);
}

function toggleView(showAdmin) {
    document.getElementById('child-view').classList.toggle('hidden', showAdmin);
    document.getElementById('admin-view').classList.toggle('hidden', !showAdmin);
}

function requestPin(action) {
    pinProtectedAction = action;
    document.getElementById('pin-modal').classList.remove('hidden');
    document.getElementById('pin-input').focus();
}

function hidePinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    document.getElementById('pin-input').value = '';
    pinProtectedAction = null;
}

function handlePinSubmit(e) {
    e.preventDefault();
    const pin = document.getElementById('pin-input').value;
    if (pin === userProfile.parentPin) {
        if (pinProtectedAction) {
            pinProtectedAction();
        }
        hidePinModal();
    } else {
        alert('PIN incorreto. Tente novamente.');
        document.getElementById('pin-input').value = '';
    }
}

async function addCoin() {
    userProfile.coins = (userProfile.coins || 0) + 1;
    await updateUserData({ coins: userProfile.coins });
    updateCoinDisplays();
}

async function removeCoin() {
    userProfile.coins = Math.max(0, (userProfile.coins || 0) - 1);
    await updateUserData({ coins: userProfile.coins });
    updateCoinDisplays();
}

async function handleTaskFormSubmit(e) {
    e.preventDefault();
    requestPin(async () => {
        const taskId = document.getElementById('task-id').value;
        const taskData = {
            description: document.getElementById('task-description').value,
            time: document.getElementById('task-time').value,
            givesReward: document.getElementById('task-reward').checked,
        };

        if (taskId) {
            await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId), taskData);
        } else {
            await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), taskData);
        }
        
        resetTaskForm();
        await loadTasks();
        renderAdminTaskList();
    });
}

function handleEditTask(e) {
    const taskId = e.currentTarget.dataset.taskId;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-time').value = task.time;
        document.getElementById('task-reward').checked = task.givesReward;
        document.getElementById('form-submit-btn').textContent = 'Salvar Alterações';
        document.getElementById('form-cancel-btn').classList.remove('hidden');
    }
}

function handleDeleteTask(e) {
    const taskId = e.currentTarget.dataset.taskId;
    requestPin(async () => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
            await loadTasks();
            renderAdminTaskList();
        }
    });
}

function resetTaskForm() {
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('form-submit-btn').textContent = 'Adicionar Tarefa';
    document.getElementById('form-cancel-btn').classList.add('hidden');
}

async function updateUserData(data) {
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);
}
