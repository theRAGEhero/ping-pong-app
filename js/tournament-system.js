// Tournament Management System

/**
 * Manages tournaments for the ping pong app
 * Handles creation, registration, brackets, and results
 */
class TournamentSystem {
  constructor() {
    // Load data from localStorage
    this.tournaments = JSON.parse(localStorage.getItem('tournaments')) || this.getDefaultTournaments();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }
  
  /**
   * Set current user
   * @param {Object} user - The user object
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }
  
  /**
   * Save data to localStorage
   */
  saveData() {
    localStorage.setItem('tournaments', JSON.stringify(this.tournaments));
  }
  
  /**
   * Get all tournaments
   * @returns {Array} - All tournaments
   */
  getAllTournaments() {
    return this.tournaments;
  }
  
  /**
   * Get tournament by ID
   * @param {string} id - Tournament ID
   * @returns {Object} - Tournament object
   */
  getTournament(id) {
    return this.tournaments.find(t => t.id === id);
  }
  
  /**
   * Get upcoming tournaments
   * @returns {Array} - Upcoming tournaments
   */
  getUpcomingTournaments() {
    const today = new Date();
    
    return this.tournaments
      .filter(tournament => new Date(tournament.startDate) > today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }
  
  /**
   * Get active tournaments
   * @returns {Array} - Active tournaments
   */
  getActiveTournaments() {
    const today = new Date();
    
    return this.tournaments.filter(tournament => {
      const startDate = new Date(tournament.startDate);
      const endDate = new Date(tournament.endDate);
      
      return startDate <= today && endDate >= today;
    });
  }
  
  /**
   * Get past tournaments
   * @returns {Array} - Past tournaments
   */
  getPastTournaments() {
    const today = new Date();
    
    return this.tournaments
      .filter(tournament => new Date(tournament.endDate) < today)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  }
  
  /**
   * Create a new tournament
   * @param {Object} tournamentData - Tournament data
   * @returns {Object} - Created tournament
   */
  createTournament(tournamentData) {
    // Generate ID
    const id = Date.now().toString();
    
    // Create tournament object
    const tournament = {
      id,
      ...tournamentData,
      createdAt: new Date().toISOString(),
      status: 'iscrizioni_aperte',
      participants: [],
      matches: []
    };
    
    // Add to tournaments
    this.tournaments.push(tournament);
    
    // Save to localStorage
    this.saveData();
    
    return tournament;
  }
  
  /**
   * Register user for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Object} - Result of the operation
   */
  registerForTournament(tournamentId) {
    if (!this.currentUser) {
      return { success: false, message: 'Devi effettuare il login per iscriverti a un torneo' };
    }
    
    const tournament = this.getTournament(tournamentId);
    if (!tournament) {
      return { success: false, message: 'Torneo non trovato' };
    }
    
    // Check if already registered
    if (tournament.participants.some(p => p.id === this.currentUser.id)) {
      return { success: false, message: 'Sei già iscritto a questo torneo' };
    }
    
    // Check if tournament is full
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return { success: false, message: 'Il torneo è al completo' };
    }
    
    // Check if registration is still open
    if (tournament.status !== 'iscrizioni_aperte') {
      return { success: false, message: 'Le iscrizioni per questo torneo sono chiuse' };
    }
    
    // Add user to participants
    tournament.participants.push({
      id: this.currentUser.id,
      username: this.currentUser.username,
      level: this.currentUser.gameLevel || 'Intermedio',
      registrationDate: new Date().toISOString()
    });
    
    // Update participant count
    tournament.currentParticipants = tournament.participants.length;
    
    // Save changes
    this.saveData();
    
    // Update user stats if gamification system is available
    if (window.gamificationSystem) {
      window.gamificationSystem.updateStat('tournamentPlayed', tournamentId);
    }
    
    return {
      success: true,
      message: 'Iscrizione effettuata con successo',
      tournament
    };
  }
  
  /**
   * Unregister user from a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Object} - Result of the operation
   */
  unregisterFromTournament(tournamentId) {
    if (!this.currentUser) {
      return { success: false, message: 'Devi effettuare il login per cancellare l\'iscrizione' };
    }
    
    const tournament = this.getTournament(tournamentId);
    if (!tournament) {
      return { success: false, message: 'Torneo non trovato' };
    }
    
    // Check if registered
    if (!tournament.participants.some(p => p.id === this.currentUser.id)) {
      return { success: false, message: 'Non sei iscritto a questo torneo' };
    }
    
    // Check if unregistration is still allowed
    if (tournament.status !== 'iscrizioni_aperte') {
      return { success: false, message: 'Non è più possibile cancellare l\'iscrizione' };
    }
    
    // Remove user from participants
    tournament.participants = tournament.participants.filter(p => p.id !== this.currentUser.id);
    
    // Update participant count
    tournament.currentParticipants = tournament.participants.length;
    
    // Save changes
    this.saveData();
    
    return {
      success: true,
      message: 'Iscrizione cancellata con successo',
      tournament
    };
  }
  
  /**
   * Generate tournament brackets
   * @param {string} tournamentId - Tournament ID
   * @returns {Object} - Generated brackets
   */
  generateBrackets(tournamentId) {
    const tournament = this.getTournament(tournamentId);
    if (!tournament) {
      return { success: false, message: 'Torneo non trovato' };
    }
    
    if (tournament.status !== 'iscrizioni_aperte') {
      return { success: false, message: 'Il torneo è già iniziato' };
    }
    
    // Check if enough participants
    if (tournament.participants.length < 2) {
      return { success: false, message: 'Non ci sono abbastanza partecipanti' };
    }
    
    // Randomize participants
    const shuffledParticipants = [...tournament.participants].sort(() => Math.random() - 0.5);
    
    const matches = [];
    const rounds = Math.ceil(Math.log2(shuffledParticipants.length));
    const totalMatches = Math.pow(2, rounds) - 1;
    
    // First round matches
    const firstRoundMatches = Math.pow(2, rounds - 1);
    const byes = firstRoundMatches * 2 - shuffledParticipants.length;
    
    for (let i = 0; i < firstRoundMatches; i++) {
      // If there are byes, some players advance automatically
      if (i < byes) {
        // Player advances to next round
        matches.push({
          id: `${tournamentId}-match-${i + 1}`,
          round: 1,
          matchNumber: i + 1,
          player1: i < shuffledParticipants.length ? shuffledParticipants[i] : null,
          player2: null,
          winner: i < shuffledParticipants.length ? shuffledParticipants[i] : null,
          status: 'completed',
          score: 'bye',
          date: tournament.startDate,
          isBye: true
        });
      } else {
        const player1Index = i;
        const player2Index = shuffledParticipants.length - 1 - (i - byes);
        
        matches.push({
          id: `${tournamentId}-match-${i + 1}`,
          round: 1,
          matchNumber: i + 1,
          player1: player1Index < shuffledParticipants.length ? shuffledParticipants[player1Index] : null,
          player2: player2Index >= 0 && player2Index < shuffledParticipants.length ? shuffledParticipants[player2Index] : null,
          winner: null,
          status: 'scheduled',
          score: null,
          date: tournament.startDate,
          isBye: false
        });
      }
    }
    
    // Create placeholder matches for subsequent rounds
    let matchCounter = firstRoundMatches;
    for (let round = 2; round <= rounds; round++) {
      const roundMatches = Math.pow(2, rounds - round);
      
      for (let i = 0; i < roundMatches; i++) {
        matchCounter++;
        
        matches.push({
          id: `${tournamentId}-match-${matchCounter}`,
          round,
          matchNumber: i + 1,
          player1: null,
          player2: null,
          winner: null,
          status: 'pending',
          score: null,
          date: null,
          isBye: false
        });
      }
    }
    
    // Update tournament
    tournament.matches = matches;
    tournament.status = 'in_corso';
    tournament.rounds = rounds;
    
    // Save changes
    this.saveData();
    
    return {
      success: true,
      message: 'Tabellone generato con successo',
      tournament,
      matches
    };
  }
  
  /**
   * Update match result
   * @param {string} tournamentId - Tournament ID
   * @param {string} matchId - Match ID
   * @param {Object} result - Match result
   * @returns {Object} - Result of the operation
   */
  updateMatchResult(tournamentId, matchId, result) {
    const tournament = this.getTournament(tournamentId);
    if (!tournament) {
      return { success: false, message: 'Torneo non trovato' };
    }
    
    // Find match
    const matchIndex = tournament.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) {
      return { success: false, message: 'Partita non trovata' };
    }
    
    const match = tournament.matches[matchIndex];
    
    // Update match
    match.winner = result.winner;
    match.score = result.score;
    match.status = 'completed';
    
    // Update next round match
    const nextRound = match.round + 1;
    const matchesInCurrentRound = Math.pow(2, tournament.rounds - match.round);
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);
    
    // Find the next match
    const nextMatchIndex = tournament.matches.findIndex(
      m => m.round === nextRound && m.matchNumber === nextMatchNumber
    );
    
    if (nextMatchIndex !== -1) {
      const nextMatch = tournament.matches[nextMatchIndex];
      
      // Determine if the winner goes to player1 or player2 slot
      if (match.matchNumber % 2 === 1) {
        // Odd match number goes to player1
        nextMatch.player1 = result.winner;
      } else {
        // Even match number goes to player2
        nextMatch.player2 = result.winner;
      }
      
      // If both players are set, update the match status
      if (nextMatch.player1 && nextMatch.player2) {
        nextMatch.status = 'scheduled';
        
        // Set a date for the match (one day after this match)
        const matchDate = new Date(match.date);
        matchDate.setDate(matchDate.getDate() + 1);
        nextMatch.date = matchDate.toISOString().split('T')[0];
      }
      
      tournament.matches[nextMatchIndex] = nextMatch;
    }
    
    // Check if tournament is completed
    const finalMatch = tournament.matches.find(
      m => m.round === tournament.rounds && m.matchNumber === 1
    );
    
    if (finalMatch && finalMatch.status === 'completed') {
      tournament.status = 'completato';
      tournament.winner = finalMatch.winner;
      
      // If the winner is the current user and gamification system is available
      if (
        this.currentUser && 
        finalMatch.winner && 
        finalMatch.winner.id === this.currentUser.id &&
        window.gamificationSystem
      ) {
        window.gamificationSystem.updateStat('tournamentWon', tournamentId);
      }
    }
    
    // Save changes
    this.saveData();
    
    return {
      success: true,
      message: 'Risultato aggiornato con successo',
      tournament
    };
  }
  
  /**
   * Get tournament brackets
   * @param {string} tournamentId - Tournament ID
   * @returns {Object} - Tournament brackets
   */
  getTournamentBrackets(tournamentId) {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || !tournament.matches || tournament.matches.length === 0) {
      return { success: false, message: 'Tabellone non disponibile' };
    }
    
    // Organize matches by round
    const rounds = {};
    
    tournament.matches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      
      rounds[match.round].push(match);
    });
    
    // Sort matches in each round
    Object.keys(rounds).forEach(round => {
      rounds[round].sort((a, b) => a.matchNumber - b.matchNumber);
    });
    
    return {
      success: true,
      tournament,
      rounds,
      totalRounds: tournament.rounds
    };
  }
  
  /**
   * Get default tournaments
   * @returns {Array} - Default tournaments list
   */
  getDefaultTournaments() {
    return [
      {
        id: '1',
        title: 'Torneo Estivo di Ping Pong',
        startDate: '2025-06-15',
        endDate: '2025-06-20',
        location: 'Polisportiva Modenese',
        coordinates: [44.6455, 10.9325],
        description: 'Torneo estivo aperto a tutti i livelli. Premi per i primi tre classificati.',
        maxParticipants: 16,
        currentParticipants: 9,
        level: 'Tutti i livelli',
        status: 'iscrizioni_aperte',
        entryFee: '10€',
        prize: 'Trofeo + Racchetta professionale',
        format: 'Eliminazione diretta',
        organizer: 'Polisportiva Modenese',
        participants: []
      },
      {
        id: '2',
        title: 'Campionato Cittadino di Ping Pong',
        startDate: '2025-07-10',
        endDate: '2025-07-20',
        location: 'PalaSport Modena',
        coordinates: [44.6482, 10.9215],
        description: 'Il campionato ufficiale della città di Modena. Solo per giocatori avanzati ed esperti.',
        maxParticipants: 32,
        currentParticipants: 22,
        level: 'Avanzato',
        status: 'iscrizioni_aperte',
        entryFee: '25€',
        prize: 'Trofeo + 200€ + Kit professionale',
        format: 'Gironi + Eliminazione diretta',
        organizer: 'Comune di Modena',
        participants: []
      },
      {
        id: '3',
        title: 'Torneo Amatoriale "Fun Ping Pong"',
        startDate: '2025-05-25',
        endDate: '2025-05-25',
        location: 'Centro Giovani Happen, Modena',
        coordinates: [44.6512, 10.9309],
        description: 'Un pomeriggio di divertimento con il ping pong. Aperto a principianti e intermedi.',
        maxParticipants: 20,
        currentParticipants: 15,
        level: 'Principiante/Intermedio',
        status: 'iscrizioni_aperte',
        entryFee: 'Gratuito',
        prize: 'Medaglie + Gadget sorpresa',
        format: 'Round Robin',
        organizer: 'Centro Giovani Happen',
        participants: []
      },
      {
        id: '4',
        title: 'Campionato Universitario',
        startDate: '2025-09-10',
        endDate: '2025-09-20',
        location: 'Università di Modena e Reggio Emilia',
        coordinates: [44.6294, 10.9481],
        description: 'Torneo ufficiale dell\'università. Aperto a tutti gli studenti e docenti.',
        maxParticipants: 64,
        currentParticipants: 28,
        level: 'Tutti i livelli',
        status: 'iscrizioni_aperte',
        entryFee: '5€',
        prize: 'Trofeo + Buoni libro',
        format: 'Gironi + Eliminazione diretta',
        organizer: 'UNIMORE Sport',
        participants: []
      }
    ];
  }
}

// Export the tournament system
window.TournamentSystem = TournamentSystem;
