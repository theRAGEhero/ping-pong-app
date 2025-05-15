// App State
let currentUser = null;
let currentMatchId = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const pages = {
    home: document.getElementById('homePage'),
    login: document.getElementById('loginPage'),
    profile: document.getElementById('profilePage'),
    matches: document.getElementById('matchesPage'),
    createMatch: document.getElementById('createMatchPage'),
    matchDetails: document.getElementById('matchDetailsPage'),
    gamification: document.getElementById('gamificationPage'),
    achievements: document.getElementById('achievementsPage'),
    leaderboard: document.getElementById('leaderboardPage')
};

// Initialize the app
function init() {
    console.log('Initializing Ping Pong Match Organizer App...');
    
    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggleIcon();
    }
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavigation(true);
        updateWelcomeMessage();
    }
    
    // Initialize data if not exists
    initializeLocalStorage();
    
    // Set today as min date for creating matches
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('matchDate');
    if (dateInput) {
        dateInput.min = today;
    }
    
    // Add event listeners
    addEventListeners();
    
    // Show home page
    showPage('home');
    
    console.log('App initialized successfully');
}

// Initialize local storage with default data if not exists
function initializeLocalStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('matches')) {
        localStorage.setItem('matches', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('completedMatches')) {
        localStorage.setItem('completedMatches', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('achievements')) {
        const defaultAchievements = [
            {
                id: 'first_match',
                name: 'Prima Partita',
                description: 'Partecipa alla tua prima partita',
                icon: 'trophy',
                condition: 'matchesPlayed >= 1',
                points: 10
            },
            {
                id: 'first_win',
                name: 'Prima Vittoria',
                description: 'Vinci la tua prima partita',
                icon: 'medal',
                condition: 'wins >= 1',
                points: 20
            },
            {
                id: 'match_master',
                name: 'Maestro delle Partite',
                description: 'Partecipa a 10 partite',
                icon: 'table-tennis-paddle-ball',
                condition: 'matchesPlayed >= 10',
                points: 50
            },
            {
                id: 'win_streak',
                name: 'Serie Vincente',
                description: 'Vinci 3 partite consecutive',
                icon: 'fire',
                condition: 'winningStreak >= 3',
                points: 75
            },
            {
                id: 'organizer',
                name: 'Organizzatore',
                description: 'Organizza 5 partite',
                icon: 'calendar-plus',
                condition: 'organizedMatches >= 5',
                points: 40
            },
            {
                id: 'perfect_week',
                name: 'Settimana Perfetta',
                description: 'Gioca una partita ogni giorno per 7 giorni',
                icon: 'calendar-week',
                condition: 'daysWithMatches >= 7',
                points: 100
            },
            {
                id: 'social_butterfly',
                name: 'Farfalla Sociale',
                description: 'Gioca con 10 giocatori diversi',
                icon: 'users',
                condition: 'uniqueOpponents >= 10',
                points: 80
            }
        ];
        
        localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
    }
    
    if (!localStorage.getItem('challenges')) {
        const currentDate = new Date();
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        
        const defaultChallenges = [
            {
                id: 'weekly_play',
                name: 'Giocatore Attivo',
                description: 'Partecipa a 3 partite questa settimana',
                requirement: 3,
                progress: 0,
                type: 'matches_played',
                reward: 30,
                expiresAt: nextWeek.toISOString()
            },
            {
                id: 'weekly_win',
                name: 'Vincitore Settimanale',
                description: 'Vinci 2 partite questa settimana',
                requirement: 2,
                progress: 0,
                type: 'matches_won',
                reward: 50,
                expiresAt: nextWeek.toISOString()
            },
            {
                id: 'weekly_organize',
                name: 'Organizzatore della Settimana',
                description: 'Organizza 2 partite questa settimana',
                requirement: 2,
                progress: 0,
                type: 'matches_organized',
                reward: 40,
                expiresAt: nextWeek.toISOString()
            }
        ];
        
        localStorage.setItem('challenges', JSON.stringify(defaultChallenges));
    }
    
    // Initialize user achievements if not exists for logged in user
    if (currentUser && !currentUser.achievements) {
        currentUser.achievements = [];
        currentUser.xp = 0;
        currentUser.level = 1;
        currentUser.winningStreak = 0;
        currentUser.organizedMatches = 0;
        currentUser.daysWithMatches = 0;
        currentUser.uniqueOpponents = 0;
        currentUser.challenges = {};
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also update in users storage
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = {...users[userIndex], ...currentUser};
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Event listeners
function addEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });
    
    // Logout
    const logoutNav = document.getElementById('logoutNav');
    if (logoutNav) {
        logoutNav.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Login/Register tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const container = tab.closest('.tab-container');
            container.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.hasAttribute('data-tab')) {
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('registerForm').classList.add('hidden');
                document.getElementById(tab.getAttribute('data-tab')).classList.remove('hidden');
            } else if (tab.hasAttribute('data-matches-tab')) {
                // Handle matches tabs
                const tabName = tab.getAttribute('data-matches-tab');
                if (tabName === 'upcoming') {
                    document.getElementById('upcomingMatches').classList.remove('hidden');
                    document.getElementById('pastMatches').classList.add('hidden');
                } else if (tabName === 'past') {
                    document.getElementById('upcomingMatches').classList.add('hidden');
                    document.getElementById('pastMatches').classList.remove('hidden');
                    loadPastMatches();
                }
            } else if (tab.hasAttribute('data-gamification-tab')) {
                // Handle gamification tabs
                const tabName = tab.getAttribute('data-gamification-tab');
                document.querySelectorAll('.gamification-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(tabName).classList.remove('hidden');
                
                // Load the appropriate content
                if (tabName === 'achievements-content') {
                    loadAchievements();
                } else if (tabName === 'leaderboard-content') {
                    loadLeaderboard();
                } else if (tabName === 'challenges-content') {
                    loadChallenges();
                }
            }
        });
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Filter and search in matches page
    const filterLevel = document.getElementById('filterLevel');
    const filterDate = document.getElementById('filterDate');
    const searchMatch = document.getElementById('searchMatch');
    
    if (filterLevel) filterLevel.addEventListener('change', filterMatches);
    if (filterDate) filterDate.addEventListener('change', filterMatches);
    if (searchMatch) searchMatch.addEventListener('input', filterMatches);
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const createMatchForm = document.getElementById('createMatchForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (createMatchForm) createMatchForm.addEventListener('submit', handleCreateMatch);
    
    // Join/Leave match buttons
    const joinMatchBtn = document.getElementById('joinMatchBtn');
    const leaveMatchBtn = document.getElementById('leaveMatchBtn');
    
    if (joinMatchBtn) joinMatchBtn.addEventListener('click', joinMatch);
    if (leaveMatchBtn) leaveMatchBtn.addEventListener('click', leaveMatch);
    
    // Complete match form
    const completeMatchForm = document.getElementById('completeMatchForm');
    if (completeMatchForm) completeMatchForm.addEventListener('submit', completeMatch);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggleIcon();
}

// Update dark mode toggle icon
function updateDarkModeToggleIcon() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    if (isDarkMode) {
        darkModeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z"/>
            </svg>
        `;
    } else {
        darkModeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>
            </svg>
        `;
    }
}

// Show specific page
function showPage(pageName) {
    console.log(`Navigating to page: ${pageName}`);
    
    // Hide all pages
    Object.values(pages).forEach(page => {
        if (page) page.classList.add('hidden');
    });
    
    // Show requested page
    if (pageName === 'matches') {
        loadMatches();
        if (pages.matches) pages.matches.classList.remove('hidden');
    } else if (pageName === 'profile') {
        loadProfile();
        if (pages.profile) pages.profile.classList.remove('hidden');
    } else if (pageName === 'create-match') {
        if (!currentUser) {
            showAlert('Devi accedere per creare una partita', 'danger');
            showPage('login');
            return;
        }
        if (pages.createMatch) pages.createMatch.classList.remove('hidden');
    } else if (pageName === 'match-details') {
        loadMatchDetails();
        if (pages.matchDetails) pages.matchDetails.classList.remove('hidden');
    } else if (pageName === 'gamification') {
        if (!currentUser) {
            showAlert('Devi accedere per visualizzare i tuoi progressi', 'danger');
            showPage('login');
            return;
        }
        loadGamification();
        if (pages.gamification) pages.gamification.classList.remove('hidden');
    } else if (pageName === 'achievements') {
        if (!currentUser) {
            showAlert('Devi accedere per visualizzare i tuoi progressi', 'danger');
            showPage('login');
            return;
        }
        loadAchievements();
        if (pages.achievements) pages.achievements.classList.remove('hidden');
    } else if (pageName === 'leaderboard') {
        loadLeaderboard();
        if (pages.leaderboard) pages.leaderboard.classList.remove('hidden');
    } else {
        if (pages[pageName]) pages[pageName].classList.remove('hidden');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Update navigation based on login status
function updateNavigation(isLoggedIn) {
    console.log(`Updating navigation. User logged in: ${isLoggedIn}`);
    
    const loginNav = document.getElementById('loginNav');
    const profileNav = document.getElementById('profileNav');
    const matchesNav = document.getElementById('matchesNav');
    const logoutNav = document.getElementById('logoutNav');
    const gamificationNav = document.getElementById('gamificationNav');
    const homeActions = document.getElementById('homeActions');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (isLoggedIn) {
        if (loginNav) loginNav.classList.add('hidden');
        if (profileNav) profileNav.classList.remove('hidden');
        if (matchesNav) matchesNav.classList.remove('hidden');
        if (logoutNav) logoutNav.classList.remove('hidden');
        if (gamificationNav) gamificationNav.classList.remove('hidden');
        if (homeActions) homeActions.classList.add('hidden');
        if (welcomeMessage) welcomeMessage.classList.remove('hidden');
    } else {
        if (loginNav) loginNav.classList.remove('hidden');
        if (profileNav) profileNav.classList.add('hidden');
        if (matchesNav) profileNav.classList.add('hidden');
        if (logoutNav) logoutNav.classList.add('hidden');
        if (gamificationNav) gamificationNav.classList.add('hidden');
        if (homeActions) homeActions.classList.remove('hidden');
        if (welcomeMessage) welcomeMessage.classList.add('hidden');
    }
}

// Update welcome message
function updateWelcomeMessage() {
    if (!currentUser) return;
    
    const welcomeUsername = document.getElementById('welcomeUsername');
    const avatarInitial = document.getElementById('avatarInitial');
    
    if (welcomeUsername) welcomeUsername.textContent = currentUser.username;
    
    // Set avatar initial
    if (avatarInitial) {
        avatarInitial.textContent = currentUser.username.charAt(0).toUpperCase();
    }
    
    // Update level and XP in welcome message if exists
    const userLevel = document.getElementById('userLevel');
    const userXP = document.getElementById('userXP');
    
    if (userLevel && currentUser.level) {
        userLevel.textContent = currentUser.level;
    }
    
    if (userXP && currentUser.xp) {
        userXP.textContent = currentUser.xp;
    }
}

// Show alert
function showAlert(message, type) {
    console.log(`Alert: ${message} (${type})`);
    
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 3000);
}

// Reset filters
function resetFilters() {
    const filterLevel = document.getElementById('filterLevel');
    const filterDate = document.getElementById('filterDate');
    const searchMatch = document.getElementById('searchMatch');
    
    if (filterLevel) filterLevel.value = 'all';
    if (filterDate) filterDate.value = '';
    if (searchMatch) searchMatch.value = '';
    
    filterMatches();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
