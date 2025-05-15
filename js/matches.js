// Handle create match
function handleCreateMatch(e) {
    e.preventDefault();
    
    const createMatchForm = document.getElementById('createMatchForm');
    if (!createMatchForm) return;
    
    createMatchForm.classList.add('loading');
    
    const title = document.getElementById('matchTitle').value;
    const date = document.getElementById('matchDate').value;
    const time = document.getElementById('matchTime').value;
    const location = document.getElementById('matchLocation').value;
    const level = document.getElementById('matchLevel').value;
    const notes = document.getElementById('matchNotes').value;
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const newMatch = {
            id: Date.now().toString(),
            title,
            date,
            time,
            location,
            level,
            notes,
            organizerId: currentUser.id,
            organizerName: currentUser.username,
            players: [{ id: currentUser.id, username: currentUser.username }],
            isCompleted: false,
            creationDate: new Date().toISOString()
        };
        
        const matches = JSON.parse(localStorage.getItem('matches'));
        matches.push(newMatch);
        localStorage.setItem('matches', JSON.stringify(matches));
        
        // Update user stats - organized matches
        updateUserStat('organizedMatches', 1);
        
        // Check and update challenges
        updateChallenge('matches_organized', 1);
        
        // Award XP for creating a match
        awardXP(15, 'Partita organizzata');
        
        createMatchForm.classList.remove('loading');
        showAlert('Partita creata con successo!', 'success');
        
        // Reset form
        createMatchForm.reset();
        
        showPage('matches');
    }, 1000);
}

// Filter matches
function filterMatches() {
    const levelFilter = document.getElementById('filterLevel');
    const dateFilter = document.getElementById('filterDate');
    const searchMatch = document.getElementById('searchMatch');
    
    if (!levelFilter || !dateFilter || !searchMatch) return;
    
    const level = levelFilter.value;
    const date = dateFilter.value;
    const searchTerm = searchMatch.value.toLowerCase();
    
    // Get active tab
    const activeTab = document.querySelector('[data-matches-tab].active');
    if (activeTab) {
        const tabName = activeTab.getAttribute('data-matches-tab');
        if (tabName === 'upcoming') {
            loadMatches(level, date, searchTerm);
        } else if (tabName === 'past') {
            loadPastMatches(level, date, searchTerm);
        }
    } else {
        loadMatches(level, date, searchTerm);
    }
}

// Load matches
function loadMatches(levelFilter = 'all', dateFilter = '', searchTerm = '') {
    const matchesContainer = document.getElementById('upcomingMatches');
    if (!matchesContainer) return;
    
    matchesContainer.innerHTML = '';
    matchesContainer.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const matches = JSON.parse(localStorage.getItem('matches'));
        
        // Filter active matches
        let activeMatches = matches.filter(match => !match.isCompleted);
        
        // Apply level filter
        if (levelFilter !== 'all') {
            activeMatches = activeMatches.filter(match => match.level === levelFilter);
        }
        
        // Apply date filter
        if (dateFilter) {
            activeMatches = activeMatches.filter(match => match.date === dateFilter);
        }
        
        // Apply search filter
        if (searchTerm) {
            activeMatches = activeMatches.filter(match => 
                match.title.toLowerCase().includes(searchTerm) || 
                match.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by date (closest first)
        activeMatches.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        
        if (activeMatches.length === 0) {
            matchesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 512 512" style="color: var(--gray-400); margin-bottom: 1rem;">
                        <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                    </svg>
                    <p>Nessuna partita disponibile con i filtri selezionati.</p>
                    <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 1rem;">
                        Cancella filtri
                    </button>
                </div>
            `;
            matchesContainer.classList.remove('loading');
            return;
        }
        
        activeMatches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card fade-in';
            
            const dateObj = new Date(match.date + 'T' + match.time);
            const formattedDate = dateObj.toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = dateObj.toLocaleTimeString('it-IT', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Check if match is full
            const isFull = match.players.length >= 2;
            
            // Get time until match
            const timeUntil = getTimeUntilMatch(dateObj);
            
            matchCard.innerHTML = `
                <div class="match-card-header">
                    <h3>${match.title}</h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                        <span class="profile-level">${match.level}</span>
                        ${isFull ? '<span style="background: var(--warning-color); color: var(--dark-color); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Completo</span>' : ''}
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" class="match-info-icon">
                                <path fill="currentColor" d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                            </svg>
                            <strong>Ora:</strong> ${formattedTime}
                        </p>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 384 512" class="match-info-icon">
                                <path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                            </svg>
                            <strong>Luogo:</strong> ${match.location}
                        </p>
                    </div>
                    <div style="margin-top: 0.5rem; color: var(--primary-color); font-size: 0.9rem; font-weight: 600;">
                        ${timeUntil}
                    </div>
                </div>
                <div class="match-card-footer">
                    <div>
                        <span style="font-size: 0.9rem; color: var(--gray-600);">Giocatori: ${match.players.length}/2</span>
                    </div>
                    <button class="btn btn-secondary view-match" data-id="${match.id}">Dettagli</button>
                </div>
            `;
            
            matchesContainer.appendChild(matchCard);
            
            // Add click event for details button
            matchCard.querySelector('.view-match').addEventListener('click', () => {
                currentMatchId = match.id;
                showPage('match-details');
            });
        });
        
        matchesContainer.classList.remove('loading');
    }, 800);
}

// Load past matches
function loadPastMatches(levelFilter = 'all', dateFilter = '', searchTerm = '') {
    const pastMatchesContainer = document.getElementById('pastMatches');
    if (!pastMatchesContainer) return;
    
    pastMatchesContainer.innerHTML = '';
    pastMatchesContainer.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const completedMatches = JSON.parse(localStorage.getItem('completedMatches'));
        
        // Apply filters
        let filteredMatches = [...completedMatches];
        
        // Apply level filter
        if (levelFilter !== 'all') {
            filteredMatches = filteredMatches.filter(match => match.level === levelFilter);
        }
        
        // Apply date filter
        if (dateFilter) {
            filteredMatches = filteredMatches.filter(match => match.date === dateFilter);
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredMatches = filteredMatches.filter(match => 
                match.title.toLowerCase().includes(searchTerm) || 
                match.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by date (most recent first)
        filteredMatches.sort((a, b) => {
            const dateA = new Date(a.completedDate);
            const dateB = new Date(b.completedDate);
            return dateB - dateA;
        });
        
        if (filteredMatches.length === 0) {
            pastMatchesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 512 512" style="color: var(--gray-400); margin-bottom: 1rem;">
                        <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                    </svg>
                    <p>Nessuna partita passata con i filtri selezionati.</p>
                    <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 1rem;">
                        Cancella filtri
                    </button>
                </div>
            `;
            pastMatchesContainer.classList.remove('loading');
            return;
        }
        
        filteredMatches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card fade-in';
            
            const dateObj = new Date(match.date + 'T' + match.time);
            const formattedDate = dateObj.toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Get winner name
            const winner = match.players.find(p => p.id === match.winner);
            
            matchCard.innerHTML = `
                <div class="match-card-header">
                    <h3>${match.title}</h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                        <span class="profile-level">${match.level}</span>
                        <span style="background: var(--success-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Completata</span>
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
                            <strong>Vincitore:</strong> ${winner ? winner.username : 'Sconosciuto'}
                        </p>
                    </div>
                </div>
                <div class="match-card-footer">
                    <button class="btn btn-secondary view-match" data-id="${match.id}">Dettagli</button>
                </div>
            `;
            
            pastMatchesContainer.appendChild(matchCard);
            
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
        
        pastMatchesContainer.classList.remove('loading');
    }, 800);
}

// Get time until match
function getTimeUntilMatch(matchDate) {
    const now = new Date();
    const diff = matchDate - now;
    
    // If match is in the past
    if (diff < 0) {
        return "Partita già iniziata";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `Mancano ${days} giorn${days === 1 ? 'o' : 'i'} e ${hours} or${hours === 1 ? 'a' : 'e'}`;
    } else if (hours > 0) {
        return `Mancano ${hours} or${hours === 1 ? 'a' : 'e'} e ${minutes} minut${minutes === 1 ? 'o' : 'i'}`;
    } else {
        return `Mancano ${minutes} minut${minutes === 1 ? 'o' : 'i'}`;
    }
}

// Load match details
function loadMatchDetails() {
    if (!currentMatchId) return;
    
    const detailsSection = document.getElementById('matchDetailsPage');
    if (!detailsSection) return;
    
    detailsSection.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const match = matches.find(m => m.id === currentMatchId);
        
        if (!match) {
            showAlert('Partita non trovata', 'danger');
            showPage('matches');
            detailsSection.classList.remove('loading');
            return;
        }
        
        // Set match details
        const detailTitle = document.getElementById('detailTitle');
        const detailDate = document.getElementById('detailDate');
        const detailTime = document.getElementById('detailTime');
        const detailLocation = document.getElementById('detailLocation');
        const detailLevel = document.getElementById('detailLevel');
        const detailOrganizer = document.getElementById('detailOrganizer');
        const detailNotes = document.getElementById('detailNotes');
        const matchStatusBadge = document.getElementById('matchStatusBadge');
        const detailStatus = document.getElementById('detailStatus');
        const detailScoreContainer = document.getElementById('detailScoreContainer');
        const detailScore = document.getElementById('detailScore');
        
        if (detailTitle) detailTitle.textContent = match.title;
        
        const dateObj = new Date(match.date + 'T' + match.time);
        const formattedDate = dateObj.toLocaleDateString('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = dateObj.toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (detailDate) detailDate.textContent = formattedDate;
        if (detailTime) detailTime.textContent = formattedTime;
        if (detailLocation) detailLocation.textContent = match.location;
        if (detailLevel) detailLevel.textContent = match.level;
        if (detailOrganizer) detailOrganizer.textContent = match.organizerName;
        if (detailNotes) detailNotes.textContent = match.notes || 'Nessuna nota disponibile.';
        
        // Set match status
        if (matchStatusBadge && detailStatus) {
            if (match.isCompleted) {
                detailStatus.textContent = 'Completata';
                matchStatusBadge.textContent = 'Completata';
                matchStatusBadge.style.background = 'var(--success-color)';
                matchStatusBadge.style.color = 'white';
                
                // Show score if available
                if (match.score && detailScoreContainer && detailScore) {
                    detailScoreContainer.classList.remove('hidden');
                    detailScore.textContent = match.score;
                }
            } else {
                const isFull = match.players.length >= 2;
                
                if (isFull) {
                    detailStatus.textContent = 'In attesa di essere giocata';
                    matchStatusBadge.textContent = 'Completa';
                    matchStatusBadge.style.background = 'var(--warning-color)';
                    matchStatusBadge.style.color = 'var(--dark-color)';
                } else {
                    detailStatus.textContent = 'In attesa di giocatori';
                    matchStatusBadge.textContent = 'In attesa';
                    matchStatusBadge.style.background = 'var(--info-color)';
                    matchStatusBadge.style.color = 'white';
                }
                
                if (detailScoreContainer) {
                    detailScoreContainer.classList.add('hidden');
                }
            }
        }
        
        // Show players
        const playersList = document.getElementById('detailPlayers');
        if (playersList) {
            playersList.innerHTML = '';
            
            match.players.forEach(player => {
                const avatar = generateAvatar(player.username);
                const isOrganizer = player.id === match.organizerId;
                const isWinner = match.isCompleted && match.winner === player.id;
                
                const playerTag = document.createElement('div');
                playerTag.className = `player-tag ${isOrganizer ? 'organizer' : ''}`;
                playerTag.style.display = 'flex';
                playerTag.style.alignItems = 'center';
                
                const avatarDiv = document.createElement('div');
                avatarDiv.style.width = '24px';
                avatarDiv.style.height = '24px';
                avatarDiv.style.borderRadius = '50%';
                avatarDiv.style.backgroundColor = avatar.color;
                avatarDiv.style.color = 'white';
                avatarDiv.style.display = 'flex';
                avatarDiv.style.alignItems = 'center';
                avatarDiv.style.justifyContent = 'center';
                avatarDiv.style.fontSize = '0.8rem';
                avatarDiv.style.fontWeight = '700';
                avatarDiv.style.marginRight = '8px';
                avatarDiv.textContent = avatar.initial;
                
                playerTag.appendChild(avatarDiv);
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = player.username;
                playerTag.appendChild(nameSpan);
                
                if (isOrganizer) {
                    const organizerBadge = document.createElement('span');
                    organizerBadge.style.marginLeft = '8px';
                    organizerBadge.style.fontSize = '0.7rem';
                    organizerBadge.style.backgroundColor = 'rgba(0, 119, 182, 0.2)';
                    organizerBadge.style.color = 'var(--primary-dark)';
                    organizerBadge.style.padding = '0.1rem 0.4rem';
                    organizerBadge.style.borderRadius = '10px';
                    organizerBadge.textContent = 'Organizzatore';
                    playerTag.appendChild(organizerBadge);
                }
                
                if (isWinner) {
                    const winnerBadge = document.createElement('span');
                    winnerBadge.style.marginLeft = '8px';
                    winnerBadge.style.fontSize = '0.7rem';
                    winnerBadge.style.backgroundColor = 'rgba(6, 214, 160, 0.2)';
                    winnerBadge.style.color = 'var(--success-color)';
                    winnerBadge.style.padding = '0.1rem 0.4rem';
                    winnerBadge.style.borderRadius = '10px';
                    winnerBadge.style.display = 'flex';
                    winnerBadge.style.alignItems = 'center';
                    winnerBadge.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 576 512" style="margin-right: 3px;">
                            <path fill="currentColor" d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"/>
                        </svg>
                        Vincitore
                    `;
                    playerTag.appendChild(winnerBadge);
                }
                
                playersList.appendChild(playerTag);
            });
        }
        
        // Show/hide join/leave buttons
        const joinBtn = document.getElementById('joinMatchBtn');
        const leaveBtn = document.getElementById('leaveMatchBtn');
        const completeSection = document.getElementById('completeMatchSection');
        
        if (!currentUser) {
            if (joinBtn) joinBtn.classList.add('hidden');
            if (leaveBtn) leaveBtn.classList.add('hidden');
            if (completeSection) completeSection.classList.add('hidden');
            detailsSection.classList.remove('loading');
            return;
        }
        
        const isInMatch = match.players.some(p => p.id === currentUser.id);
        const isOrganizer = match.organizerId === currentUser.id;
        
        if (match.isCompleted) {
            if (joinBtn) joinBtn.classList.add('hidden');
            if (leaveBtn) leaveBtn.classList.add('hidden');
            if (completeSection) completeSection.classList.add('hidden');
        } else {
            if (isInMatch) {
                if (joinBtn) joinBtn.classList.add('hidden');
                if (leaveBtn) leaveBtn.classList.remove('hidden');
            } else {
                if (joinBtn) joinBtn.classList.remove('hidden');
                if (leaveBtn) leaveBtn.classList.add('hidden');
                
                // Disable join if match is full
                if (match.players.length >= 2 && joinBtn) {
                    const joinButton = joinBtn.querySelector('button');
                    if (joinButton) {
                        joinButton.disabled = true;
                        joinButton.textContent = 'Partita completa';
                    }
                } else if (joinBtn) {
                    const joinButton = joinBtn.querySelector('button');
                    if (joinButton) {
                        joinButton.disabled = false;
                        joinButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 640 512" style="margin-right: 8px;">
                                <path fill="currentColor" d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                            </svg>
                            Unisciti a questa partita
                        `;
                    }
                }
            }
            
            // Show complete match section for organizer if match is full
            if (isOrganizer && match.players.length === 2 && completeSection) {
                completeSection.classList.remove('hidden');
                
                // Populate winner select
                const winnerSelect = document.getElementById('winner');
                if (winnerSelect) {
                    winnerSelect.innerHTML = '';
                    
                    // Add default option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    defaultOption.textContent = '-- Seleziona il vincitore --';
                    winnerSelect.appendChild(defaultOption);
                    
                    match.players.forEach(player => {
                        const option = document.createElement('option');
                        option.value = player.id;
                        option.textContent = player.username;
                        winnerSelect.appendChild(option);
                    });
                }
            } else if (completeSection) {
                completeSection.classList.add('hidden');
            }
        }
        
        detailsSection.classList.remove('loading');
    }, 800);
}

// Join match
function joinMatch() {
    if (!currentUser) {
        showAlert('Devi accedere per unirti a una partita', 'danger');
        showPage('login');
        return;
    }
    
    const joinBtn = document.getElementById('joinMatchBtn');
    if (!joinBtn) return;
    
    joinBtn.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const matchIndex = matches.findIndex(m => m.id === currentMatchId);
        
        if (matchIndex === -1) {
            joinBtn.classList.remove('loading');
            showAlert('Partita non trovata', 'danger');
            return;
        }
        
        const match = matches[matchIndex];
        
        // Check if already in match
        if (match.players.some(p => p.id === currentUser.id)) {
            joinBtn.classList.remove('loading');
            showAlert('Sei già iscritto a questa partita', 'danger');
            return;
        }
        
        // Check if match is full
        if (match.players.length >= 2) {
            joinBtn.classList.remove('loading');
            showAlert('Partita già completa', 'danger');
            return;
        }
        
        // Add player to match
        match.players.push({
            id: currentUser.id,
            username: currentUser.username
        });
        
        matches[matchIndex] = match;
        localStorage.setItem('matches', JSON.stringify(matches));
        
        // Award XP for joining a match
        awardXP(5, 'Partecipazione a una partita');
        
        joinBtn.classList.remove('loading');
        showAlert('Ti sei unito alla partita!', 'success');
        loadMatchDetails();
    }, 800);
}

// Leave match
function leaveMatch() {
    if (!currentUser) return;
    
    const leaveBtn = document.getElementById('leaveMatchBtn');
    if (!leaveBtn) return;
    
    leaveBtn.classList.add('loading');
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const matchIndex = matches.findIndex(m => m.id === currentMatchId);
        
        if (matchIndex === -1) {
            leaveBtn.classList.remove('loading');
            showAlert('Partita non trovata', 'danger');
            return;
        }
        
        const match = matches[matchIndex];
        
        // Check if user is organizer
        if (match.organizerId === currentUser.id) {
            // Delete match
            matches.splice(matchIndex, 1);
            localStorage.setItem('matches', JSON.stringify(matches));
            
            leaveBtn.classList.remove('loading');
            showAlert('Partita cancellata', 'success');
            showPage('matches');
            return;
        }
        
        // Remove player from match
        match.players = match.players.filter(p => p.id !== currentUser.id);
        matches[matchIndex] = match;
        localStorage.setItem('matches', JSON.stringify(matches));
        
        leaveBtn.classList.remove('loading');
        showAlert('Hai abbandonato la partita', 'success');
        loadMatchDetails();
    }, 800);
}

// Complete match
function completeMatch(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const completeForm = document.getElementById('completeMatchForm');
    if (!completeForm) return;
    
    completeForm.classList.add('loading');
    
    const winnerId = document.getElementById('winner').value;
    const score = document.getElementById('matchScore').value;
    
    if (!winnerId) {
        completeForm.classList.remove('loading');
        showAlert('Seleziona il vincitore', 'danger');
        return;
    }
    
    // Simulate a delay for loading effect
    setTimeout(() => {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const matchIndex = matches.findIndex(m => m.id === currentMatchId);
        
        if (matchIndex === -1) {
            completeForm.classList.remove('loading');
            showAlert('Partita non trovata', 'danger');
            return;
        }
        
        const match = matches[matchIndex];
        
        // Check if user is organizer
        if (match.organizerId !== currentUser.id) {
            completeForm.classList.remove('loading');
            showAlert('Solo l\'organizzatore può completare la partita', 'danger');
            return;
        }
        
        // Mark match as completed
        match.isCompleted = true;
        match.winner = winnerId;
        match.score = score;
        match.completedDate = new Date().toISOString();
        
        matches[matchIndex] = match;
        localStorage.setItem('matches', JSON.stringify(matches));
        
        // Add to completed matches
        const completedMatches = JSON.parse(localStorage.getItem('completedMatches'));
        completedMatches.push(match);
        localStorage.setItem('completedMatches', JSON.stringify(completedMatches));
        
        // Update player stats
        const users = JSON.parse(localStorage.getItem('users'));
        
        match.players.forEach(player => {
            const userIndex = users.findIndex(u => u.id === player.id);
            if (userIndex !== -1) {
                // Update matches played
                users[userIndex].matchesPlayed++;
                
                // Update wins if winner
                if (player.id === winnerId) {
                    users[userIndex].wins++;
                    
                    // Update winning streak for winner
                    if (users[userIndex].winningStreak === undefined) {
                        users[userIndex].winningStreak = 1;
                    } else {
                        users[userIndex].winningStreak++;
                    }
                    
                    // Update challenge for win
                    if (users[userIndex].id === currentUser.id) {
                        updateChallenge('matches_won', 1);
                    }
                } else {
                    // Reset winning streak for loser
                    users[userIndex].winningStreak = 0;
                }
                
                // Update days with matches set
                if (!users[userIndex].daysWithMatches) {
                    users[userIndex].daysWithMatches = [];
                }
                
                const today = new Date().toISOString().split('T')[0];
                if (!users[userIndex].daysWithMatches.includes(today)) {
                    users[userIndex].daysWithMatches.push(today);
                }
                
                // Update unique opponents
                if (!users[userIndex].uniqueOpponents) {
                    users[userIndex].uniqueOpponents = [];
                }
                
                // Find opponent
                const opponent = match.players.find(p => p.id !== player.id);
                if (opponent && !users[userIndex].uniqueOpponents.includes(opponent.id)) {
                    users[userIndex].uniqueOpponents.push(opponent.id);
                }
                
                // Update challenge for played match
                if (users[userIndex].id === currentUser.id) {
                    updateChallenge('matches_played', 1);
                }
            }
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if logged in
        if (currentUser) {
            const updatedUser = users.find(u => u.id === currentUser.id);
            if (updatedUser) {
                // Award XP for completing a match
                const isWinner = currentUser.id === winnerId;
                
                if (isWinner) {
                    awardXP(25, 'Vittoria in una partita');
                    
                    // Check if this is first win
                    checkAndAwardAchievement('first_win');
                    
                    // Check for win streak
                    checkAndAwardAchievement('win_streak');
                } else {
                    awardXP(10, 'Partecipazione completata');
                }
                
                // Check for first match achievement
                checkAndAwardAchievement('first_match');
                
                // Check for match master achievement
                checkAndAwardAchievement('match_master');
                
                // Check for perfect week achievement
                checkAndAwardAchievement('perfect_week');
                
                // Check for social butterfly achievement
                checkAndAwardAchievement('social_butterfly');
                
                currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
        
        completeForm.classList.remove('loading');
        showAlert('Risultato registrato con successo!', 'success');
        loadMatchDetails();
    }, 1000);
}
