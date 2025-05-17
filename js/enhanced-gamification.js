// Enhanced Gamification System

/**
 * Manages the gamification system for the ping pong app
 * Handles achievements, XP, levels, challenges, and leaderboard
 */
class GamificationSystem {
  constructor() {
    // Load data from localStorage
    this.achievements = JSON.parse(localStorage.getItem('achievements')) || this.getDefaultAchievements();
    this.challenges = JSON.parse(localStorage.getItem('challenges')) || this.getDefaultChallenges();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    // Initialize if user is logged in
    if (this.currentUser) {
      this.initializeUserData();
    }
  }
  
  /**
   * Initialize user gamification data if not already set
   */
  initializeUserData() {
    if (!this.currentUser.achievements) this.currentUser.achievements = [];
    if (!this.currentUser.xp) this.currentUser.xp = 0;
    if (!this.currentUser.level) this.currentUser.level = 1;
    if (!this.currentUser.unlockedAchievements) this.currentUser.unlockedAchievements = [];
    if (!this.currentUser.challenges) this.currentUser.challenges = {};
    if (!this.currentUser.stats) {
      this.currentUser.stats = {
        matchesPlayed: 0,
        wins: 0,
        winningStreak: 0,
        organizedMatches: 0,
        daysWithMatches: [],
        uniqueOpponents: [],
        tournamentsPlayed: 0,
        tournamentsWon: 0
      };
    }
    
    // Save initialized user data
    this.saveUserData();
  }
  
  /**
   * Save user data to localStorage
   */
  saveUserData() {
    if (!this.currentUser) return;
    
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // Also update in users collection
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...this.currentUser };
    } else {
      users.push(this.currentUser);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  /**
   * Set current user and initialize their data
   * @param {Object} user - The user object
   */
  setCurrentUser(user) {
    this.currentUser = user;
    this.initializeUserData();
  }
  
  /**
   * Award XP to the current user
   * @param {number} amount - Amount of XP to award
   * @param {string} reason - Reason for awarding XP
   * @returns {Object} - Result object with level up information
   */
  awardXP(amount, reason) {
    if (!this.currentUser) return { success: false, message: 'No user logged in' };
    
    // Current level before XP award
    const previousLevel = this.currentUser.level;
    
    // Add XP
    this.currentUser.xp += amount;
    
    // Check for level up
    const levelUpResult = this.checkForLevelUp();
    
    // Save changes
    this.saveUserData();
    
    // Return result
    return {
      success: true,
      previousXP: this.currentUser.xp - amount,
      currentXP: this.currentUser.xp,
      xpAwarded: amount,
      reason,
      previousLevel,
      currentLevel: this.currentUser.level,
      leveledUp: levelUpResult.leveledUp,
      levelsGained: levelUpResult.levelsGained
    };
  }
  
  /**
   * Check if user has leveled up based on current XP
   * @returns {Object} - Level up information
   */
  checkForLevelUp() {
    if (!this.currentUser) return { leveledUp: false, levelsGained: 0 };
    
    const currentLevel = this.currentUser.level;
    let levelsGained = 0;
    let leveledUp = false;
    
    let keepChecking = true;
    while (keepChecking) {
      const xpForNextLevel = this.calculateXPForLevel(currentLevel + levelsGained + 1);
      
      if (this.currentUser.xp >= xpForNextLevel) {
        levelsGained++;
        leveledUp = true;
      } else {
        keepChecking = false;
      }
    }
    
    // Update level if leveled up
    if (leveledUp) {
      this.currentUser.level = currentLevel + levelsGained;
    }
    
    return { leveledUp, levelsGained };
  }
  
  /**
   * Calculate XP required for a specific level
   * @param {number} level - The level to calculate XP for
   * @returns {number} - XP required
   */
  calculateXPForLevel(level) {
    // Formula: base + (level^2 * multiplier)
    const baseXP = 100;
    const multiplier = 50;
    
    return baseXP + (Math.pow(level - 1, 2) * multiplier);
  }
  
  /**
   * Calculate progress towards next level
   * @returns {Object} - Progress information
   */
  getLevelProgress() {
    if (!this.currentUser) return { progress: 0, currentXP: 0, nextLevelXP: 100 };
    
    const currentLevel = this.currentUser.level;
    const xpForCurrentLevel = this.calculateXPForLevel(currentLevel);
    const xpForNextLevel = this.calculateXPForLevel(currentLevel + 1);
    
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const currentLevelXP = this.currentUser.xp - xpForCurrentLevel;
    const progress = Math.min(100, Math.round((currentLevelXP / xpNeeded) * 100));
    
    return {
      progress,
      currentXP: currentLevelXP,
      nextLevelXP: xpNeeded,
      totalXP: this.currentUser.xp
    };
  }
  
  /**
   * Update user stats and check for achievements
   * @param {string} type - Type of stat to update
   * @param {*} value - Value to update with
   */
  updateStat(type, value) {
    if (!this.currentUser) return;
    
    switch (type) {
      case 'matchPlayed':
        this.currentUser.stats.matchesPlayed++;
        this.updateChallenge('matches_played', 1);
        this.checkAndAwardAchievement('first_match');
        this.checkAndAwardAchievement('match_master');
        break;
        
      case 'matchWon':
        this.currentUser.stats.wins++;
        this.currentUser.stats.winningStreak++;
        this.updateChallenge('matches_won', 1);
        this.checkAndAwardAchievement('first_win');
        this.checkAndAwardAchievement('win_streak');
        break;
        
      case 'matchLost':
        this.currentUser.stats.winningStreak = 0;
        break;
        
      case 'matchOrganized':
        this.currentUser.stats.organizedMatches++;
        this.updateChallenge('matches_organized', 1);
        this.checkAndAwardAchievement('organizer');
        break;
        
      case 'uniqueOpponent':
        if (!this.currentUser.stats.uniqueOpponents.includes(value)) {
          this.currentUser.stats.uniqueOpponents.push(value);
          this.checkAndAwardAchievement('social_butterfly');
        }
        break;
        
      case 'tournamentPlayed':
        this.currentUser.stats.tournamentsPlayed++;
        this.updateChallenge('tournaments_played', 1);
        this.checkAndAwardAchievement('tournament_participant');
        break;
        
      case 'tournamentWon':
        this.currentUser.stats.tournamentsWon++;
        this.checkAndAwardAchievement('tournament_winner');
        break;
        
      case 'dayWithMatch':
        const today = new Date().toISOString().split('T')[0];
        if (!this.currentUser.stats.daysWithMatches.includes(today)) {
          this.currentUser.stats.daysWithMatches.push(today);
          this.checkAndAwardAchievement('perfect_week');
        }
        break;
    }
    
    // Save updated stats
    this.saveUserData();
  }
  
  /**
   * Update challenge progress
   * @param {string} type - Type of challenge
   * @param {number} amount - Amount to increment
   */
  updateChallenge(type, amount) {
    if (!this.currentUser) return;
    
    const challenges = this.challenges.filter(c => c.type === type);
    const userChallenges = this.currentUser.challenges || {};
    
    challenges.forEach(challenge => {
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
    localStorage.setItem('challenges', JSON.stringify(this.challenges));
    
    // Update user
    this.currentUser.challenges = userChallenges;
    this.saveUserData();
  }
  
  /**
   * Claim reward for completed challenge
   * @param {string} challengeId - ID of the challenge
   * @returns {Object} - Result of the operation
   */
  claimChallengeReward(challengeId) {
    if (!this.currentUser) return { success: false, message: 'No user logged in' };
    
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return { success: false, message: 'Challenge not found' };
    
    const userChallenges = this.currentUser.challenges || {};
    const progress = userChallenges[challengeId] || 0;
    
    if (progress < challenge.requirement) {
      return { success: false, message: 'Challenge not completed' };
    }
    
    // Award XP
    const xpResult = this.awardXP(challenge.reward, `Sfida completata: ${challenge.name}`);
    
    // Reset challenge progress
    challenge.progress = 0;
    localStorage.setItem('challenges', JSON.stringify(this.challenges));
    
    // Reset in user challenges
    userChallenges[challengeId] = 0;
    this.currentUser.challenges = userChallenges;
    this.saveUserData();
    
    return {
      success: true,
      challenge,
      xpResult
    };
  }
  
  /**
   * Check if achievement can be unlocked and award it
   * @param {string} achievementId - ID of the achievement to check
   * @returns {Object|boolean} - Result of the operation or false if not unlocked
   */
  checkAndAwardAchievement(achievementId) {
    if (!this.currentUser) return false;
    
    // Check if already earned
    if (this.currentUser.unlockedAchievements.includes(achievementId)) {
      return false;
    }
    
    // Get achievement details
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return false;
    
    // Check if condition is met
    let conditionMet = false;
    
    switch (achievementId) {
      case 'first_match':
        conditionMet = this.currentUser.stats.matchesPlayed >= 1;
        break;
        
      case 'first_win':
        conditionMet = this.currentUser.stats.wins >= 1;
        break;
        
      case 'match_master':
        conditionMet = this.currentUser.stats.matchesPlayed >= 10;
        break;
        
      case 'win_streak':
        conditionMet = this.currentUser.stats.winningStreak >= 3;
        break;
        
      case 'organizer':
        conditionMet = this.currentUser.stats.organizedMatches >= 5;
        break;
        
      case 'perfect_week':
        conditionMet = this.currentUser.stats.daysWithMatches.length >= 7;
        break;
        
      case 'social_butterfly':
        conditionMet = this.currentUser.stats.uniqueOpponents.length >= 5;
        break;
        
      case 'tournament_participant':
        conditionMet = this.currentUser.stats.tournamentsPlayed >= 1;
        break;
        
      case 'tournament_winner':
        conditionMet = this.currentUser.stats.tournamentsWon >= 1;
        break;
    }
    
    if (conditionMet) {
      // Award achievement
      this.currentUser.unlockedAchievements.push(achievementId);
      
      // Award XP
      const xpResult = this.awardXP(achievement.points, `Achievement sbloccato: ${achievement.name}`);
      
      // Save to storage
      this.saveUserData();
      
      return {
        success: true,
        achievement,
        xpResult
      };
    }
    
    return false;
  }
  
  /**
   * Check and reset weekly challenges if needed
   */
  checkAndResetWeeklyChallenges() {
    const now = new Date();
    
    this.challenges.forEach(challenge => {
      const expireDate = new Date(challenge.expiresAt);
      
      // If challenge is expired, reset it
      if (now > expireDate) {
        // Generate new expiry date (1 week from now)
        const newExpireDate = new Date();
        newExpireDate.setDate(now.getDate() + 7);
        
        challenge.expiresAt = newExpireDate.toISOString();
        challenge.progress = 0;
        
        // Reset in user challenges if logged in
        if (this.currentUser && this.currentUser.challenges) {
          this.currentUser.challenges[challenge.id] = 0;
        }
      }
    });
    
    // Save updated challenges
    localStorage.setItem('challenges', JSON.stringify(this.challenges));
    
    // Save user data if logged in
    if (this.currentUser) {
      this.saveUserData();
    }
  }
  
  /**
   * Get leaderboard data
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} - Sorted leaderboard data
   */
  getLeaderboard(limit = 20) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Calculate total points for each user
    const usersWithPoints = users.map(user => {
      let totalPoints = 0;
      
      // Points from achievements
      if (user.unlockedAchievements) {
        user.unlockedAchievements.forEach(achievementId => {
          const achievement = this.achievements.find(a => a.id === achievementId);
          if (achievement) {
            totalPoints += achievement.points;
          }
        });
      }
      
      // Points from XP (1 point per 10 XP)
      if (user.xp) {
        totalPoints += Math.floor(user.xp / 10);
      }
      
      return {
        id: user.id,
        username: user.username,
        level: user.level || 1,
        matchesPlayed: user.stats?.matchesPlayed || 0,
        wins: user.stats?.wins || 0,
        totalPoints
      };
    });
    
    // Sort by points (descending)
    usersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Limit results if specified
    return limit ? usersWithPoints.slice(0, limit) : usersWithPoints;
  }
  
  /**
   * Get default achievements
   * @returns {Array} - Default achievements list
   */
  getDefaultAchievements() {
    return [
      {
        id: 'first_match',
        name: 'Prima Partita',
        description: 'Partecipa alla tua prima partita',
        icon: 'table-tennis-paddle-ball',
        points: 10
      },
      {
        id: 'first_win',
        name: 'Prima Vittoria',
        description: 'Vinci la tua prima partita',
        icon: 'trophy',
        points: 20
      },
      {
        id: 'match_master',
        name: 'Maestro delle Partite',
        description: 'Partecipa a 10 partite',
        icon: 'table-tennis-paddle-ball',
        points: 50
      },
      {
        id: 'win_streak',
        name: 'Serie Vincente',
        description: 'Vinci 3 partite consecutive',
        icon: 'fire',
        points: 75
      },
      {
        id: 'organizer',
        name: 'Organizzatore',
        description: 'Organizza 5 partite',
        icon: 'calendar-plus',
        points: 40
      },
      {
        id: 'perfect_week',
        name: 'Settimana Perfetta',
        description: 'Gioca una partita ogni giorno per 7 giorni',
        icon: 'calendar-week',
        points: 100
      },
      {
        id: 'social_butterfly',
        name: 'Farfalla Sociale',
        description: 'Gioca con 5 giocatori diversi',
        icon: 'users',
        points: 40
      },
      {
        id: 'tournament_participant',
        name: 'Partecipante al Torneo',
        description: 'Partecipa al tuo primo torneo',
        icon: 'medal',
        points: 30
      },
      {
        id: 'tournament_winner',
        name: 'Campione del Torneo',
        description: 'Vinci il tuo primo torneo',
        icon: 'crown',
        points: 100
      }
    ];
  }
  
  /**
   * Get default challenges
   * @returns {Array} - Default challenges list
   */
  getDefaultChallenges() {
    const currentDate = new Date();
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    
    return [
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
      },
      {
        id: 'weekly_tournament',
        name: 'Sfida del Torneo',
        description: 'Partecipa a un torneo questa settimana',
        requirement: 1,
        progress: 0,
        type: 'tournaments_played',
        reward: 60,
        expiresAt: nextWeek.toISOString()
      }
    ];
  }
  
  /**
   * Get progress for a specific achievement
   * @param {string} achievementId - ID of the achievement
   * @returns {Object} - Progress information
   */
  getAchievementProgress(achievementId) {
    if (!this.currentUser) return { earned: false, progress: 0, total: 0, percentage: 0 };
    
    const earned = this.currentUser.unlockedAchievements.includes(achievementId);
    if (earned) return { earned: true, progress: 1, total: 1, percentage: 100 };
    
    let progress = 0;
    let total = 0;
    
    switch (achievementId) {
      case 'first_match':
        progress = Math.min(1, this.currentUser.stats.matchesPlayed);
        total = 1;
        break;
        
      case 'first_win':
        progress = Math.min(1, this.currentUser.stats.wins);
        total = 1;
        break;
        
      case 'match_master':
        progress = Math.min(10, this.currentUser.stats.matchesPlayed);
        total = 10;
        break;
        
      case 'win_streak':
        progress = Math.min(3, this.currentUser.stats.winningStreak);
        total = 3;
        break;
        
      case 'organizer':
        progress = Math.min(5, this.currentUser.stats.organizedMatches);
        total = 5;
        break;
        
      case 'perfect_week':
        progress = Math.min(7, this.currentUser.stats.daysWithMatches.length);
        total = 7;
        break;
        
      case 'social_butterfly':
        progress = Math.min(5, this.currentUser.stats.uniqueOpponents.length);
        total = 5;
        break;
        
      case 'tournament_participant':
        progress = Math.min(1, this.currentUser.stats.tournamentsPlayed);
        total = 1;
        break;
        
      case 'tournament_winner':
        progress = Math.min(1, this.currentUser.stats.tournamentsWon);
        total = 1;
        break;
    }
    
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    
    return {
      earned,
      progress,
      total,
      percentage
    };
  }
  
  /**
   * Get user achievements with progress
   * @returns {Array} - Achievements with progress
   */
  getUserAchievements() {
    if (!this.currentUser) return [];
    
    return this.achievements.map(achievement => {
      const progress = this.getAchievementProgress(achievement.id);
      
      return {
        ...achievement,
        ...progress
      };
    });
  }
  
  /**
   * Get user challenges with progress
   * @returns {Array} - Challenges with progress
   */
  getUserChallenges() {
    if (!this.currentUser) return [];
    
    // First check and reset any expired challenges
    this.checkAndResetWeeklyChallenges();
    
    return this.challenges.map(challenge => {
      const userProgress = this.currentUser.challenges?.[challenge.id] || 0;
      const percentage = Math.min(100, Math.round((userProgress / challenge.requirement) * 100));
      const completed = userProgress >= challenge.requirement;
      
      // Calculate days until expiry
      const expiryDate = new Date(challenge.expiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        ...challenge,
        progress: userProgress,
        percentage,
        completed,
        daysLeft
      };
    });
  }
}

// Export the gamification system
window.GamificationSystem = GamificationSystem;
