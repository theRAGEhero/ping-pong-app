// React App for Ping Pong Match Organizer
// This script initializes the React application and mounts it to the DOM

// Import React components from the PingPongApp artifact
const { useState, useEffect } = React;

// Mount the React app to the DOM
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  // Render the app
  ReactDOM.render(<App />, rootElement);
});

// Main App Component
function App() {
  // State to track if the app is loading
  const [loading, setLoading] = useState(true);
  
  // Initialize app
  useEffect(() => {
    // Simulate initialization delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading screen while app initializes
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Return the main ping pong app
  return <PingPongApp />;
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Caricamento in corso...</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparando la tua esperienza di ping pong
        </p>
      </div>
    </div>
  );
}

// Main Ping Pong App Component
function PingPongApp() {
  // State management
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')));
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null);

  // Effect to initialize data
  useEffect(() => {
    // Initialize data
    initializeData();
    
    // Apply dark mode if enabled
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Function to initialize data
  const initializeData = () => {
    try {
      // Load matches
      const savedMatches = JSON.parse(localStorage.getItem('matches')) || [];
      setMatches(savedMatches);
      
      // Load tournaments from tournament system
      if (window.tournamentSystem) {
        const tournamentsData = window.tournamentSystem.getAllTournaments();
        setTournaments(tournamentsData);
      }
      
      // Set user in gamification system
      if (window.gamificationSystem && currentUser) {
        window.gamificationSystem.setCurrentUser(currentUser);
      }
      
      // Set user in tournament system
      if (window.tournamentSystem && currentUser) {
        window.tournamentSystem.setCurrentUser(currentUser);
      }
      
      // Load notifications (mock for now)
      const mockNotifications = [
        {
          id: '1',
          type: 'match_invitation',
          title: 'Invito a partita',
          message: 'MarcoR ti ha invitato a una partita al Parco Novi Sad',
          date: '2025-05-16',
          isRead: false
        },
        {
          id: '2',
          type: 'tournament_reminder',
          title: 'Torneo in arrivo',
          message: 'Il Torneo Amatoriale "Fun Ping Pong" inizierà tra 9 giorni',
          date: '2025-05-16',
          isRead: true
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Achievement sbloccato!',
          message: 'Hai sbloccato l\'achievement "Principiante Entusiasta"',
          date: '2025-05-15',
          isRead: false
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error initializing data:', error);
      showAlert('Errore durante l\'inizializzazione dei dati. Riprova più tardi.', 'error');
    }
  };

  // Helper to show alerts
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Login handler
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Set user in systems
    if (window.gamificationSystem) {
      window.gamificationSystem.setCurrentUser(userData);
    }
    
    if (window.tournamentSystem) {
      window.tournamentSystem.setCurrentUser(userData);
    }
    
    showAlert('Login effettuato con successo!');
    setActivePage('home');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    
    // Clear user in systems
    if (window.gamificationSystem) {
      window.gamificationSystem.setCurrentUser(null);
    }
    
    if (window.tournamentSystem) {
      window.tournamentSystem.setCurrentUser(null);
    }
    
    showAlert('Logout effettuato con successo!');
    setActivePage('home');
  };

  // Navigation handler
  const navigate = (page) => {
    setActivePage(page);
    setIsNavOpen(false);
    window.scrollTo(0, 0);
  };

  // Join match handler
  const joinMatch = (matchId) => {
    if (!currentUser) {
      showAlert('Devi effettuare il login per unirti a una partita', 'error');
      navigate('login');
      return;
    }

    setMatches(matches.map(match => {
      if (match.id === matchId && match.players.length < 2) {
        const updatedMatch = {
          ...match,
          players: [...match.players, { id: currentUser.id, username: currentUser.username }]
        };
        
        // Update in localStorage
        const allMatches = JSON.parse(localStorage.getItem('matches')) || [];
        const matchIndex = allMatches.findIndex(m => m.id === matchId);
        if (matchIndex !== -1) {
          allMatches[matchIndex] = updatedMatch;
          localStorage.setItem('matches', JSON.stringify(allMatches));
        }
        
        // Award XP if gamification system is available
        if (window.gamificationSystem) {
          window.gamificationSystem.awardXP(5, 'Partecipazione a una partita');
          window.gamificationSystem.updateStat('matchPlayed');
        }
        
        return updatedMatch;
      }
      return match;
    }));

    showAlert('Ti sei unito alla partita con successo!');
  };

  // Join tournament handler
  const joinTournament = (tournamentId) => {
    if (!currentUser) {
      showAlert('Devi effettuare il login per iscriverti a un torneo', 'error');
      navigate('login');
      return;
    }

    if (window.tournamentSystem) {
      const result = window.tournamentSystem.registerForTournament(tournamentId);
      
      if (result.success) {
        // Update tournaments state
        const updatedTournaments = window.tournamentSystem.getAllTournaments();
        setTournaments(updatedTournaments);
        
        showAlert('Iscrizione al torneo effettuata con successo!');
      } else {
        showAlert(result.message, 'error');
      }
    } else {
      // Fallback if tournament system is not available
      setTournaments(tournaments.map(tournament => {
        if (tournament.id === tournamentId && tournament.currentParticipants < tournament.maxParticipants) {
          return {
            ...tournament,
            currentParticipants: tournament.currentParticipants + 1,
            participants: [...(tournament.participants || []), { id: currentUser.id, username: currentUser.username }]
          };
        }
        return tournament;
      }));

      showAlert('Iscrizione al torneo effettuata con successo!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                className="md:hidden cursor-pointer" 
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                {isNavOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
              <h1 className="text-2xl font-bold">Ping Pong Match</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-blue-700 transition"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {currentUser ? (
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <a 
                      href="#" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={(e) => { e.preventDefault(); navigate('profile'); }}
                    >
                      Profilo
                    </a>
                    <a 
                      href="#" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    >
                      Logout
                    </a>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('login')} 
                  className="px-4 py-2 rounded bg-white text-blue-600 hover:bg-blue-50 transition font-medium"
                >
                  Accedi
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden transition-opacity duration-200 ${
          isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsNavOpen(false)}
      />
      
      <nav 
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-50 p-4 transform transition-transform duration-200 ease-in-out md:hidden ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Menu</h2>
          <button onClick={() => setIsNavOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          <NavItem icon="home" label="Home" isActive={activePage === 'home'} onClick={() => navigate('home')} />
          <NavItem icon="table" label="Partite" isActive={activePage === 'matches'} onClick={() => navigate('matches')} />
          <NavItem icon="trophy" label="Tornei" isActive={activePage === 'tournaments'} onClick={() => navigate('tournaments')} />
          <NavItem icon="map" label="Mappa Tavoli" isActive={activePage === 'map'} onClick={() => navigate('map')} />
          <NavItem icon="award" label="Gamification" isActive={activePage === 'gamification'} onClick={() => navigate('gamification')} />
          {currentUser && (
            <NavItem icon="user" label="Profilo" isActive={activePage === 'profile'} onClick={() => navigate('profile')} />
          )}
          {currentUser && (
            <NavItem icon="bell" label="Notifiche" isActive={activePage === 'notifications'} onClick={() => navigate('notifications')} badge={notifications.filter(n => !n.isRead).length} />
          )}
          {currentUser ? (
            <NavItem icon="logout" label="Logout" onClick={handleLogout} />
          ) : (
            <NavItem icon="login" label="Accedi" isActive={activePage === 'login'} onClick={() => navigate('login')} />
          )}
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 p-4 shadow-md">
          <nav className="space-y-1">
            <NavItem icon="home" label="Home" isActive={activePage === 'home'} onClick={() => navigate('home')} />
            <NavItem icon="table" label="Partite" isActive={activePage === 'matches'} onClick={() => navigate('matches')} />
            <NavItem icon="trophy" label="Tornei" isActive={activePage === 'tournaments'} onClick={() => navigate('tournaments')} />
            <NavItem icon="map" label="Mappa Tavoli" isActive={activePage === 'map'} onClick={() => navigate('map')} />
            <NavItem icon="award" label="Gamification" isActive={activePage === 'gamification'} onClick={() => navigate('gamification')} />
            {currentUser && (
              <NavItem icon="user" label="Profilo" isActive={activePage === 'profile'} onClick={() => navigate('profile')} />
            )}
            {currentUser && (
              <NavItem icon="bell" label="Notifiche" isActive={activePage === 'notifications'} onClick={() => navigate('notifications')} badge={notifications.filter(n => !n.isRead).length} />
            )}
            {currentUser ? (
              <NavItem icon="logout" label="Logout" onClick={handleLogout} />
            ) : (
              <NavItem icon="login" label="Accedi" isActive={activePage === 'login'} onClick={() => navigate('login')} />
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Alert notification */}
          {alert && (
            <div className={`mb-4 p-4 rounded-md ${
              alert.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
            }`}>
              {alert.message}
            </div>
          )}

          {/* Pages */}
          {activePage === 'home' && (
            <HomePage 
              currentUser={currentUser} 
              matches={matches} 
              tournaments={tournaments}
              navigate={navigate}
            />
          )}
          
          {activePage === 'matches' && (
            <MatchesPage 
              matches={matches} 
              joinMatch={joinMatch}
              currentUser={currentUser}
              navigate={navigate}
            />
          )}
          
          {activePage === 'tournaments' && (
            <TournamentsPage 
              tournaments={tournaments}
              joinTournament={joinTournament}
              currentUser={currentUser}
            />
          )}
          
          {activePage === 'map' && (
            <MapPage 
              matches={matches}
              tournaments={tournaments}
            />
          )}
          
          {activePage === 'gamification' && (
            <GamificationPage 
              currentUser={currentUser}
              navigate={navigate}
            />
          )}
          
          {activePage === 'profile' && (
            <ProfilePage 
              currentUser={currentUser}
              matches={matches}
            />
          )}
          
          {activePage === 'login' && (
            <LoginPage 
              handleLogin={handleLogin} 
              navigate={navigate}
            />
          )}
          
          {activePage === 'notifications' && (
            <NotificationsPage 
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Ping Pong Match</h3>
              <p className="text-sm">La piattaforma più semplice per trovare avversari di ping pong nella tua zona e organizzare partite divertenti.</p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Link utili</h4>
              <ul className="space-y-2">
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="text-sm hover:text-white transition">Home</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('matches'); }} className="text-sm hover:text-white transition">Partite</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('tournaments'); }} className="text-sm hover:text-white transition">Tornei</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('map'); }} className="text-sm hover:text-white transition">Mappa Tavoli</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Contatti</h4>
              <p className="text-sm mb-2">Email: info@pingpongmatch.it</p>
              <p className="text-sm">Tel: +39 123 456 7890</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-center">&copy; 2025 Ping Pong Match Organizer. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon, label, isActive, onClick, badge }) {
  // Map icon names to JSX elements
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'table':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8" />
          </svg>
        );
      case 'trophy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10V8a3 3 0 013-3h2a3 3 0 013 3v12a3 3 0 01-3 3h-2a3 3 0 01-3-3V10M8 6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2H8z" />
          </svg>
        );
      case 'map':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'award':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'bell':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'logout':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case 'login':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        );
    }
  };

  return (
    <a
      href="#"
      className={`flex items-center space-x-3 p-2 rounded-md ${
        isActive 
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span className={isActive ? 'text-blue-600 dark:text-blue-300' : ''}>
        {getIcon(icon)}
      </span>
      <span>{label}</span>
      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
          {badge}
        </span>
      )}
    </a>
  );
}

// Home Page Component (placeholder)
function HomePage({ currentUser, matches, tournaments, navigate }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Benvenuto nell'app Ping Pong Match!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Questa è una versione migliorata dell'app per organizzare partite di ping pong. 
        Troverai nuove funzionalità come tornei, un sistema di gamification avanzato e una mappa 
        per trovare i tavoli da ping pong nella tua zona.
      </p>
      
      {currentUser ? (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Ciao, {currentUser.username}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sei loggato e puoi accedere a tutte le funzionalità dell'app.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Non hai effettuato l'accesso
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Accedi per sbloccare tutte le funzionalità dell'app.
          </p>
          <button
            onClick={() => navigate('login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Accedi
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Partite recenti</h2>
          {matches.length > 0 ? (
            <ul className="space-y-2">
              {matches.slice(0, 3).map(match => (
                <li key={match.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium">{match.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Luogo: {match.location}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Nessuna partita trovata.
            </p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tornei in arrivo</h2>
          {tournaments.length > 0 ? (
            <ul className="space-y-2">
              {tournaments.slice(0, 3).map(tournament => (
                <li key={tournament.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium">{tournament.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Data: {new Date(tournament.startDate).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Nessun torneo trovato.
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Nuove funzionalità</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tornei</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Partecipa a tornei organizzati e metti alla prova le tue abilità.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Gamification</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Guadagna XP, sali di livello e sblocca achievements.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Mappa Tavoli</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trova tavoli da ping pong nella tua zona con la mappa integrata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Other page components would be defined here...
// For brevity, we'll just implement placeholder components

function MatchesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Partite</h1>
      <p>La pagina delle partite è in costruzione.</p>
    </div>
  );
}

function TournamentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tornei</h1>
      <p>La pagina dei tornei è in costruzione.</p>
    </div>
  );
}

function MapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mappa Tavoli</h1>
      <p>La mappa dei tavoli è in costruzione.</p>
      <div id="map-container" style={{ height: '500px', background: '#eee', borderRadius: '8px', marginTop: '20px' }}>
        <div className="flex items-center justify-center h-full">
          <p>Qui verrà visualizzata la mappa OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
}

function GamificationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gamification</h1>
      <p>La pagina della gamification è in costruzione.</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profilo</h1>
      <p>La pagina del profilo è in costruzione.</p>
    </div>
  );
}

function LoginPage({ handleLogin }) {
  // Simple mock login
  const doLogin = (e) => {
    e.preventDefault();
    const userData = {
      id: '123',
      username: 'TestUser',
      email: 'test@example.com',
      level: 3,
      xp: 245,
      gameLevel: 'Intermedio',
      registrationDate: '01/05/2025'
    };
    handleLogin(userData);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Accedi</h1>
        <form onSubmit={doLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Il tuo username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="La tua password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifiche</h1>
      <p>La pagina delle notifiche è in costruzione.</p>
    </div>
  );
}
