// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.classList.add('loading');
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        loginForm.classList.remove('loading');
        
        if (user) {
            // Initialize gamification properties if they don't exist
            if (!user.xp) {
                user.xp = 0;
                user.level = 1;
                user.achievements = [];
                user.winningStreak = 0;
                user.organizedMatches = 0;
                user.daysWithMatches = new Set();
                user.uniqueOpponents = new Set();
                user.challenges = {};
            }
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateNavigation(true);
            updateWelcomeMessage();
            showAlert('Accesso effettuato con successo!', 'success');
            showPage('home');
        } else {
            showAlert('Username o password errati', 'danger');
        }
    }, 1000);
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.classList.add('loading');
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const level = document.getElementById('registerLevel').value;
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            showAlert('Username già utilizzato', 'danger');
            registerForm.classList.remove('loading');
            return;
        }
        
        // Create new user with gamification properties
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            level: level,  // Skill level (Principiante, Intermedio, etc.)
            matchesPlayed: 0,
            wins: 0,
            registrationDate: new Date().toISOString(),
            // Gamification properties
            xp: 0,          // Experience points
            level: 1,       // Gamification level (1, 2, 3, etc.)
            achievements: [],
            winningStreak: 0,
            organizedMatches: 0,
            daysWithMatches: [],
            uniqueOpponents: [],
            challenges: {}
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateNavigation(true);
        updateWelcomeMessage();
        
        registerForm.classList.remove('loading');
        
        // Award achievement for registration
        awardXP(10, 'Registrazione completata');
        
        showAlert('Registrazione effettuata con successo!', 'success');
        showPage('home');
    }, 1000);
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavigation(false);
    showAlert('Logout effettuato', 'success');
    showPage('home');
}

// Generate avatar from username
function generateAvatar(username) {
    // Create a simple hash from the username for consistent colors
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a hue value (0-360) from the hash
    const hue = hash % 360;
    const saturation = 60 + (hash % 30); // 60-90%
    const lightness = 45 + (hash % 20); // 45-65%
    
    return {
        initial: username.charAt(0).toUpperCase(),
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
    };
}
