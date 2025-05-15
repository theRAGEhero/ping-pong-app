// Global achievement notification ID
let notificationTimeout;

// Load gamification page
function loadGamification() {
    if (!currentUser) {
        showAlert('Devi accedere per visualizzare la gamification', 'danger');
        showPage('login');
        return;
    }
    
    // Load default tab (achievements)
    const achievementsTab = document.querySelector('[data-gamification-tab="achievements-content"]');
    if (achievementsTab) {
        achievementsTab.click();
    } else {
        loadAchievements();
    }
}

// Load achievements
function loadAchievements() {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = '';
    achievementsContainer.classList.add('loading');
    
    setTimeout(() => {
        const achievements = JSON.parse(localStorage.getItem('achievements'));
        const userAchievements = currentUser.achievements || [];
        
        if (achievements.length === 0) {
            achievementsContainer.innerHTML = '<p>Nessun achievement disponibile.</p>';
            achievementsContainer.classList.remove('loading');
            return;
        }
        
        const badgeGrid = document.createElement('div');
        badgeGrid.className = 'badge-grid';
        
        achievements.forEach(achievement => {
            const earned = userAchievements.some(a => a.id === achievement.id);
            const userAchievement = userAchievements.find(a => a.id === achievement.id);
            const earnedDate = userAchievement ? new Date(userAchievement.earnedAt).toLocaleDateString('it-IT') : '';
            
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${earned ? '' : 'locked'}`;
            
            let progress = '';
            let progressBar = '';
            
            // If achievement is not earned, calculate and show progress
            if (!earned) {
                // Parse the condition to extract stat and value needed
                const conditionParts = achievement.condition.split('>=');
                if (conditionParts.length === 2) {
                    const stat = conditionParts[0].trim();
                    const requiredValue = parseInt(conditionParts[1].trim());
                    
                    // Get current value
                    let currentValue = 0;
                    if (currentUser[stat] !== undefined) {
                        currentValue = currentUser[stat];
                        
                        // If stat is an array, use its length
                        if (Array.isArray(currentValue)) {
                            currentValue = currentValue.length;
                        }
                    }
                    
                    // Calculate percentage
                    const percentage = Math.min(100, Math.round((currentValue / requiredValue) * 100));
                    
                    progress = `<div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <small>${currentValue}/${requiredValue}</small>`;
                }
            }
            
            badge.innerHTML = `
                <i class="fas fa-${achievement.icon}"></i>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${earned ? `<small>Sbloccato il ${earnedDate}</small>` : progress}
                <div style="margin-top: 0.5rem; font-weight: bold; color: ${earned ? 'var(--success-color)' : 'var(--gray-600)'}">
                    ${achievement.points} punti
                </div>
            `;
            
            badgeGrid.appendChild(badge);
        });
        
        achievementsContainer.appendChild(badgeGrid);
        achievementsContainer.classList.remove('loading');
    }, 800);
}

// Load leaderboard
function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) return;
    
    leaderboardContainer.innerHTML = '';
    leaderboardContainer.classList.add('loading');
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users.length === 0) {
            leaderboardContainer.innerHTML = '<p>Nessun utente disponibile.</p>';
            leaderboardContainer.classList.remove('loading');
            return;
        }
        
        // Calculate total points for each user
        const usersWithPoints = users.map(user => {
            let totalPoints = 0;
            
            // Points from achievements
            if (user.achievements) {
                const achievements = JSON.parse(localStorage.getItem('achievements'));
                user.achievements.forEach(achievement => {
                    const found = achievements.find(a => a.id === achievement.id);
                    if (found) {
                        totalPoints += found.points;
                    }
                });
            }
            
            // Points from XP (1 point per 10 XP)
            if (user.xp) {
                totalPoints += Math.floor(user.xp / 10);
            }
            
            return {
                ...user,
                totalPoints
            };
        });
        
        // Sort by points (descending)
        usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Create leaderboard
        const leaderboard = document.createElement('div');
        
        usersWithPoints.forEach((user, index) => {
            const isCurrentUser = user.id === currentUser.id;
            const avatar = generateAvatar(user.username);
            
            const item = document.createElement('div');
            item.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;
            
            if (isCurrentUser) {
                item.style.backgroundColor = 'rgba(0, 119, 182, 0.1)';
                item.style.border = '1px solid var(--primary-color)';
            }
            
            // Determine badge class based on rank
            let rankClass = '';
            if (index === 0) rankClass = 'top-1';
            else if (index === 1) rankClass = 'top-2';
            else if (index === 2) rankClass = 'top-3';
            
            item.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                <div class="leaderboard-avatar" style="width: 40px; height: 40px; border-radius: 50%; background-color: ${avatar.color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                    ${avatar.initial}
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-username">${user.username} ${isCurrentUser ? '(Tu)' : ''}</div>
                    <div class="leaderboard-stats">
                        <span>Livello ${user.level || 1}</span>
                        <span>Partite: ${user.matchesPlayed || 0}</span>
                        <span>Vittorie: ${user.wins || 0}</span>
                    </div>
                </div>
                <div class="leaderboard-points">${user.totalPoints} pt</div>
            `;
            
            leaderboard.appendChild(item);
        });
        
        leaderboardContainer.appendChild(leaderboard);
        leaderboardContainer.classList.remove('loading');
    }, 800);
}

// Load challenges
function loadChallenges() {
    const challengesContainer = document.getElementById('challenges-container');
    if (!challengesContainer) return;
    
    challengesContainer.innerHTML = '';
    challengesContainer.classList.add('loading');
    
    setTimeout(() => {
        const challenges = JSON.parse(localStorage.getItem('challenges'));
        
        if (challenges.length === 0) {
            challengesContainer.innerHTML = '<p>Nessuna sfida disponibile al momento.</p>';
            challengesContainer.classList.remove('loading');
            return;
        }
        
        // Get user challenges progress
        const userChallenges = currentUser.challenges || {};
        
        // Check if challenges need to be reset (weekly challenges)
        const now = new Date();
        
        challenges.forEach(challenge => {
            const expireDate = new Date(challenge.expiresAt);
            
            // If challenge is expired, reset it
            if (now > expireDate) {
                // Generate new expiry date (1 week from now)
                const newExpireDate = new Date();
                newExpireDate.setDate(now.getDate() + 7);
                
                challenge.expiresAt = newExpireDate.toISOString();
                challenge.progress = 0;
                
                // Reset in user challenges
                if (userChallenges[challenge.id]) {
                    userChallenges[challenge.id] = 0;
                }
            }
            
            // Update challenge progress from user data
            if (userChallenges[challenge.id] !== undefined) {
                challenge.progress = userChallenges[challenge.id];
            }
        });
        
        // Save updated challenges
        localStorage.setItem('challenges', JSON.stringify(challenges));
        
        // Update user challenges
        currentUser.challenges = userChallenges;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Display challenges
        challenges.forEach(challenge => {
            const card = document.createElement('div');
            card.className = 'challenge-card';
            
            const expireDate = new Date(challenge.expiresAt);
            const daysLeft = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));
            
            // Calculate progress percentage
            const percentage = Math.min(100, Math.round((challenge.progress / challenge.requirement) * 100));
            const isCompleted = challenge.progress >= challenge.requirement;
            
            card.innerHTML = `
                <h3>
                    <i class="fas fa-${getIconForChallengeType(challenge.type)}"></i>
                    ${challenge.name}
                </h3>
                <p>${challenge.description}</p>
                <div class="challenge-rewards">
                    <div class="challenge-xp">
                        <i class="fas fa-star"></i>
                        ${challenge.reward} XP
                    </div>
                    <div style="flex: 1; text-align: right; color: var(--gray-600);">
                        Scade tra ${daysLeft} giorni
                    </div>
                </div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="challenge-progress-text">
                        <span>Progresso: ${challenge.progress}/${challenge.requirement}</span>
                        <span>${percentage}%</span>
                    </div>
                </div>
                ${isCompleted ? `
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="btn btn-success claim-challenge-btn" data-id="${challenge.id}">
                            <i class="fas fa-check-circle"></i>
                            Riscatta ricompensa
                        </button>
                    </div>
                ` : ''}
            `;
            
            challengesContainer.appendChild(card);
            
            // Add click event for claim button
            if (isCompleted) {
                card.querySelector('.claim-challenge-btn').addEventListener('click', () => {
                    claimChallengeReward(challenge.id);
                });
            }
        });
        
        challengesContainer.classList.remove('loading');
    }, 800);
}

// Get icon for challenge type
function getIconForChallengeType(type) {
    switch (type) {
        case 'matches_played':
            return 'table-tennis-paddle-ball';
        case 'matches_won':
            return 'trophy';
        case 'matches_organized':
            return 'calendar-plus';
        default:
            return 'medal';
    }
}

// Claim challenge reward
function claimChallengeReward(challengeId) {
    if (!currentUser) return;
    
    const challenges = JSON.parse(localStorage.getItem('challenges'));
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) return;
    
    // Award XP
    awardXP(challenge.reward, `Sfida completata: ${challenge.name}`);
    
    // Reset challenge progress
    challenge.progress = 0;
    localStorage.setItem('challenges', JSON.stringify(challenges));
    
    // Reset in user challenges
    const userChallenges = currentUser.challenges || {};
    userChallenges[challengeId] = 0;
    currentUser.challenges = userChallenges;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Reload challenges
    loadChallenges();
}

// Update challenge progress
function updateChallenge(type, amount) {
    if (!currentUser) return;
    
    const challenges = JSON.parse(localStorage.getItem('challenges'));
    const userChallenges = currentUser.challenges || {};
    
    // Find challenges of this type
    const relevantChallenges = challenges.filter(c => c.type === type);
    
    relevantChallenges.forEach(challenge => {
        // Initialize if not exists
        if (userChallenges[challenge.id] === undefined) {
            userChallenges[challenge.id] = 0;
        }
        
        // Increment progress
        userChallenges[challenge.id] += amount;
        
        // Update challenge in storage
        challenge.progress = userChallenges[challenge.id];
    });
    
    // Save updates
    localStorage.setItem('challenges', JSON.stringify(challenges));
    
    // Update user
    currentUser.challenges = userChallenges;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Award XP to the user
function awardXP(amount, reason) {
    if (!currentUser) return;
    
    // Initialize if not exists
    if (!currentUser.xp) {
        currentUser.xp = 0;
    }
    
    if (!currentUser.level) {
        currentUser.level = 1;
    }
    
    // Add XP
    currentUser.xp += amount;
    
    // Check for level up
    checkForLevelUp();
    
    // Update in storage
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].xp = currentUser.xp;
        users[userIndex].level = currentUser.level;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show notification
    showGameNotification('XP Guadagnati', `+${amount} XP - ${reason}`);
    
    // Update UI if on profile page
    updateXPDisplay();
}

// Check if user leveled up
function checkForLevelUp() {
    if (!currentUser || !currentUser.xp) return;
    
    const currentLevel = currentUser.level || 1;
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    
    if (currentUser.xp >= xpForNextLevel) {
        // Level up!
        currentUser.level++;
        
        // Show notification
        showGameNotification('Livello Aumentato!', `Sei salito al livello ${currentUser.level}!`, 'level-up');
        
        // Check again in case of multiple level ups
        checkForLevelUp();
    }
}

// Calculate XP required for a specific level
function calculateXPForLevel(level) {
    // Formula: base + (level^2 * multiplier)
    const baseXP = 100;
    const multiplier = 50;
    
    return baseXP + (Math.pow(level, 2) * multiplier);
}

// Update XP display in UI
function updateXPDisplay() {
    if (!currentUser) return;
    
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
}

// Show game notification
function showGameNotification(title, message, type = 'xp') {
    // Clear any existing notification
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Remove existing notification
    const existingNotification = document.querySelector('.game-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    
    // Icon based on type
    let icon = 'star';
    let color = 'var(--primary-color)';
    
    if (type === 'achievement') {
        icon = 'trophy';
        color = 'var(--secondary-color)';
    } else if (type === 'level-up') {
        icon = 'level-up-alt';
        color = 'var(--success-color)';
    }
    
    notification.innerHTML = `
        <div class="game-notification-header" style="color: ${color}">
            <i class="fas fa-${icon}"></i>
            ${title}
        </div>
        <div class="game-notification-body">
            ${message}
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 5 seconds
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Check and award achievement if conditions are met
function checkAndAwardAchievement(achievementId) {
    if (!currentUser) return;
    
    // Initialize achievements array if it doesn't exist
    if (!currentUser.achievements) {
        currentUser.achievements = [];
    }
    
    // Check if achievement is already earned
    if (currentUser.achievements.some(a => a.id === achievementId)) {
        return; // Already earned
    }
    
    // Get achievement details
    const achievements = JSON.parse(localStorage.getItem('achievements'));
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) return;
    
    // Check if condition is met
    try {
        // Create a safe context for evaluation
        const conditionContext = { ...currentUser };
        
        // Convert condition to a function
        const conditionParts = achievement.condition.split('>=');
        if (conditionParts.length !== 2) return;
        
        const statName = conditionParts[0].trim();
        const requiredValue = parseInt(conditionParts[1].trim());
        
        // Get the actual value
        let actualValue = conditionContext[statName];
        
        // If it's an array, use its length
        if (Array.isArray(actualValue)) {
            actualValue = actualValue.length;
        }
        
        // Check if condition is met
        if (actualValue >= requiredValue) {
            // Award achievement
            currentUser.achievements.push({
                id: achievement.id,
                earnedAt: new Date().toISOString()
            });
            
            // Award XP
            awardXP(achievement.points, `Achievement sbloccato: ${achievement.name}`);
            
            // Show notification
            showGameNotification('Achievement Sbloccato!', achievement.name, 'achievement');
            
            // Save to storage
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].achievements = currentUser.achievements;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            return true;
        }
    } catch (error) {
        console.error('Error checking achievement condition:', error);
    }
    
    return false;
}
