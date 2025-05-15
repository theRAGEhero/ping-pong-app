// Load profile
function loadProfile() {
    if (!currentUser) {
        showAlert('Devi accedere per visualizzare il profilo', 'danger');
        showPage('login');
        return;
    }
    
    const profilePage = document.getElementById('profilePage');
    if (!profilePage) return;
    
    profilePage.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const profileUsername = document.getElementById('profileUsername');
        const profileEmail = document.getElementById('profileEmail');
        const profileLevel = document.getElementById('profileLevel');
        const profileMatchesPlayed = document.getElementById('profileMatchesPlayed');
        const profileWins = document.getElementById('profileWins');
        const profileWinRate = document.getElementById('profileWinRate');
        const profileRegistrationDate = document.getElementById('profileRegistrationDate');
        const profileAvatar = document.getElementById('profileAvatar');
        
        // Set basic profile info
        if (profileUsername) profileUsername.textContent = currentUser.username;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        if (profileLevel) profileLevel.textContent = currentUser.level;
        if (profileMatchesPlayed) profileMatchesPlayed.textContent = currentUser.matchesPlayed;
        if (profileWins) profileWins.textContent = currentUser.wins;
        
        // Set avatar
        if (profileAvatar) {
            const avatar = generateAvatar(currentUser.username);
            profileAvatar.textContent = avatar.initial;
            profileAvatar.style.backgroundColor = avatar.color;
        }
        
        // Calculate win rate
        if (profileWinRate) {
            const winRate = currentUser.matchesPlayed > 0 
                ? Math.round((currentUser.wins / currentUser.matchesPlayed) * 100) 
                : 0;
            profileWinRate.textContent = `${winRate}%`;
        }
        
        // Format registration date
        if (profileRegistrationDate) {
            if (currentUser.registrationDate) {
                const regDate = new Date(currentUser.registrationDate);
                profileRegistrationDate.textContent = regDate.toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                profileRegistrationDate.textContent = 'Data non disponibile';
            }
        }
        
        // Set gamification level and XP
        const gamificationLevel = document.getElementById('gamificationLevel');
        const xpBar = document.getElementById('xpBar');
        const currentXP = document.getElementById('currentXP');
        const nextLevelXP = document.getElementById('nextLevelXP');
        
        if (gamificationLevel) {
            gamificationLevel.textContent = currentUser.level || 1;
        }
        
        if (xpBar && currentUser.xp !== undefined) {
            // Calculate XP percentage for the progress bar
            const level = currentUser.level || 1;
            const xpForCurrentLevel = calculateXPForLevel(level);
            const xpForNextLevel = calculateXPForLevel(level + 1);
            const xpNeeded = xpForNextLevel - xpForCurrentLevel;
            const currentLevelXP = currentUser.xp - xpForCurrentLevel;
            const percentage = Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100));
            
            xpBar.style.width = `${percentage}%`;
            
            if (currentXP) {
                currentXP.textContent = currentLevelXP;
            }
            
            if (nextLevelXP) {
                nextLevelXP.textContent = xpNeeded;
            }
        }
        
        // Load match history
        const matchHistory = document.getElementById('matchHistory');
        if (matchHistory) {
            const completedMatches = JSON.parse(localStorage.getItem('completedMatches'));
            
            // Filter matches where current user participated
            const userMatches = completedMatches.filter(match => 
                match.players.some(player => player.id === currentUser.id)
            );
            
            if (userMatches.length === 0) {
                matchHistory.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 640 512" style="color: var(--gray-400); margin-bottom: 1rem;">
                            <path fill="currentColor" d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM96 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 376a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM352 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 120a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64H576c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H461.7c11.6 36 3.1 77-25.4 105.5L320 413.8V448zM480 328a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                        </svg>
                        <p>Non hai ancora giocato nessuna partita.</p>
                        <a href="#" class="btn btn-secondary" data-page="matches" style="margin-top: 1rem;">
                            Trova partite
                        </a>
                    </div>
                `;
                profilePage.classList.remove('loading');
                return;
            }
            
            matchHistory.innerHTML = '';
            
            // Sort matches by date (most recent first)
            userMatches.sort((a, b) => {
                const dateA = new Date(a.completedDate || a.date);
                const dateB = new Date(b.completedDate || b.date);
                return dateB - dateA;
            });
            
            userMatches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card fade-in';
                
                const dateObj = new Date(match.date + 'T' + match.time);
                const formattedDate = dateObj.toLocaleDateString('it-IT', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                const isWinner = match.winner === currentUser.id;
                const winnerName = match.players.find(p => p.id === match.winner)?.username || 'Sconosciuto';
                
                matchCard.innerHTML = `
                    <div class="match-card-header">
                        <h3>${match.title}</h3>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <span class="profile-level">${match.level}</span>
                            <span style="background: ${isWinner ? 'var(--success-color)' : 'var(--danger-color)'}; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${isWinner ? 'Vittoria' : 'Sconfitta'}</span>
                        </div>
                    </div>
                    <div class="match-card-body">
                        <div class="match-info">
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" class="match-info-icon">
                                    <path fill="currentColor" d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24z"/>
                                </svg>
                                <strong>Data:</strong> ${formattedDate}
                            </p>
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 384 512" class="match-info-icon">
                                    <path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                                </svg>
                                <strong>Luogo:</strong> ${match.location}
                            </p>
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 640 512" class="match-info-icon">
                                    <path fill="currentColor" d="M353.8 54.1L330.2 6.3c-3.9-8.3-16.1-8.6-20.4 0L286.2 54.1l-52.3 7.5c-9.3 1.4-13.3 12.9-6.4 19.8l38 37-9 52.1c-1.4 9.3 8.2 16.5 16.8 12.2l46.9-24.8 46.6 24.4c8.6 4.3 18.3-2.9 16.8-12.2l-9-52.1 38-37c6.9-6.9 2.9-18.4-6.4-19.8l-52.3-7.5zM256 256c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h128c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32H256zM0 416c0 35.3 28.7 64 64 64H544c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64C28.7 32 0 60.7 0 96V416zM64 96H544V416H64V96z"/>
                                </svg>
                                <strong>Punteggio:</strong> ${match.score}
                            </p>
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 576 512" class="match-info-icon">
                                    <path fill="currentColor" d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"/>
                                </svg>
                                <strong>Vincitore:</strong> ${winnerName} ${isWinner ? '(Tu)' : ''}
                            </p>
                        </div>
                    </div>
                    <div class="match-card-footer">
                        <button class="btn btn-secondary view-match" data-id="${match.id}">Dettagli</button>
                    </div>
                `;
                
                matchHistory.appendChild(matchCard);
                
                // Add click event for details button
                matchCard.querySelector('.view-match').addEventListener('click', () => {
                    currentMatchId = match.id;
                    
                    // Check if match exists in active matches
                    const matches = JSON.parse(localStorage.getItem('matches'));
                    const matchInActive = matches.find(m => m.id === match.id);
                    
                    if (matchInActive) {
                        // If match is in active matches, use that
                        showPage('match-details');
                    } else {
                        // Otherwise, store completed match in active matches temporarily
                        matches.push(match);
                        localStorage.setItem('matches', JSON.stringify(matches));
                        showPage('match-details');
                    }
                });
            });
        }
        
        // Load achievements
        loadProfileAchievements();
        
        profilePage.classList.remove('loading');
    }, 800);
}

// Load profile achievements
function loadProfileAchievements() {
    const achievementsContainer = document.getElementById('profileAchievements');
    if (!achievementsContainer) return;
    
    const achievements = JSON.parse(localStorage.getItem('achievements'));
    const userAchievements = currentUser.achievements || [];
    
    // Check if there are any achievements to display
    if (achievements.length === 0) {
        achievementsContainer.innerHTML = '<p>Nessun achievement disponibile.</p>';
        return;
    }
    
    // Get the most recent earned achievements (up to 3)
    const earnedAchievements = achievements.filter(achievement => 
        userAchievements.some(a => a.id === achievement.id)
    ).slice(0, 3);
    
    // If no achievements earned yet
    if (earnedAchievements.length === 0) {
        achievementsContainer.innerHTML = `
            <p>Non hai ancora sbloccato nessun achievement. 
            <a href="#" data-page="gamification">Vai alla pagina Gamification</a> 
            per vedere tutti gli achievement disponibili.</p>
        `;
        return;
    }
    
    achievementsContainer.innerHTML = '<h4>Achievement recenti</h4>';
    
    const badgeGrid = document.createElement('div');
    badgeGrid.className = 'badge-grid';
    
    earnedAchievements.forEach(achievement => {
        const userAchievement = userAchievements.find(a => a.id === achievement.id);
        const earnedDate = userAchievement ? new Date(userAchievement.earnedAt).toLocaleDateString('it-IT') : '';
        
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        
        badge.innerHTML = `
            <i class="fas fa-${achievement.icon}"></i>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <small>Sbloccato il ${earnedDate}</small>
        `;
        
        badgeGrid.appendChild(badge);
    });
    
    achievementsContainer.appendChild(badgeGrid);
    
    // Add view all link
    const viewAllLink = document.createElement('div');
    viewAllLink.style.textAlign = 'center';
    viewAllLink.style.marginTop = '1rem';
    
    viewAllLink.innerHTML = `
        <a href="#" class="btn btn-outline" data-page="gamification">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 576 512" style="margin-right: 8px;">
                <path fill="currentColor" d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"/>
            </svg>
            Vedi tutti gli achievement
        </a>
    `;
    
    achievementsContainer.appendChild(viewAllLink);
}

// Update a user stat
function updateUserStat(stat, value) {
    if (!currentUser) return;
    
    // Update user in memory
    if (currentUser[stat] === undefined) {
        currentUser[stat] = value;
    } else {
        currentUser[stat] += value;
    }
    
    // Update in storage
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        if (users[userIndex][stat] === undefined) {
            users[userIndex][stat] = value;
        } else {
            users[userIndex][stat] += value;
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Check for achievements related to this stat
    checkAchievementsForStat(stat);
}

// Check achievements related to a specific stat
function checkAchievementsForStat(stat) {
    const achievements = JSON.parse(localStorage.getItem('achievements'));
    
    // Filter achievements that might be related to this stat
    achievements.forEach(achievement => {
        if (achievement.condition.includes(stat)) {
            checkAndAwardAchievement(achievement.id);
        }
    });
}
