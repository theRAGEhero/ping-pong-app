// OpenStreetMap Integration for Ping Pong Tables

/**
 * Manages the map functionality for the ping pong app
 * Shows ping pong tables, matches, and tournaments on the map
 */
class PingPongMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.tables = [];
    
    // Default location (Modena, Italy)
    this.defaultLocation = [44.647128, 10.925227];
  }
  
  /**
   * Initialize the map
   */
  async initialize() {
    // Check if container exists
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Map container with ID "${this.containerId}" not found`);
      return false;
    }
    
    try {
      // Simulate loading the map
      // In a real implementation, this would use Leaflet.js or a similar library
      this.map = {
        setView: (coords, zoom) => {
          console.log(`Setting map view to ${coords} with zoom level ${zoom}`);
          return this.map;
        },
        addLayer: (layer) => {
          console.log(`Adding layer to map: ${layer.type}`);
          return this.map;
        },
        on: (event, callback) => {
          console.log(`Added event listener for "${event}" on map`);
          return this.map;
        },
        remove: () => {
          console.log('Removing map');
          return null;
        }
      };
      
      // Load ping pong tables from simulated API
      await this.loadPingPongTables();
      
      console.log('Map initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing map:', error);
      return false;
    }
  }
  
  /**
   * Load ping pong tables from OpenStreetMap
   * This is a simulated implementation
   */
  async loadPingPongTables() {
    // In a real implementation, this would use Overpass API to query OpenStreetMap
    // For now, we'll use mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    this.tables = [
      {
        id: 't1',
        name: 'Parco Novi Sad',
        description: 'Tavolo da ping pong pubblico al parco',
        location: 'Parco Novi Sad, Modena',
        coordinates: [44.647128, 10.925227],
        isPublic: true,
        isIndoor: false
      },
      {
        id: 't2',
        name: 'Centro Sportivo Sacca',
        description: 'Tavoli professionali al coperto',
        location: 'Via Paltrinieri 80, Modena',
        coordinates: [44.656971, 10.917009],
        isPublic: false,
        isIndoor: true,
        fees: '5€/ora'
      },
      {
        id: 't3',
        name: 'Parco Ferrari',
        description: 'Tavolo da ping pong pubblico',
        location: 'Parco Ferrari, Modena',
        coordinates: [44.635288, 10.906404],
        isPublic: true,
        isIndoor: false
      },
      {
        id: 't4',
        name: 'Centro Giovani Happen',
        description: 'Tavolo da ping pong per giovani',
        location: 'Via San Faustino 155, Modena',
        coordinates: [44.651205, 10.930917],
        isPublic: true,
        isIndoor: true
      },
      {
        id: 't5',
        name: 'Polisportiva Modenese',
        description: 'Tavoli professionali con possibilità di lezioni',
        location: 'Via Alfonso Paltrinieri 1, Modena',
        coordinates: [44.645565, 10.932547],
        isPublic: false,
        isIndoor: true,
        fees: '8€/ora'
      },
      {
        id: 't6',
        name: 'Università di Modena e Reggio Emilia',
        description: 'Tavolo da ping pong per studenti',
        location: 'Via Università 4, Modena',
        coordinates: [44.629456, 10.948109],
        isPublic: false,
        isIndoor: true,
        access: 'Solo studenti e personale universitario'
      },
      {
        id: 't7',
        name: 'Centro Commerciale I Portali',
        description: 'Tavolo da ping pong gratuito',
        location: 'Via dello Sport 50, Modena',
        coordinates: [44.650405, 10.917084],
        isPublic: true,
        isIndoor: true
      }
    ];
    
    console.log(`Loaded ${this.tables.length} ping pong tables`);
    return this.tables;
  }
  
  /**
   * Add matches to the map
   * @param {Array} matches - Matches to add
   */
  addMatches(matches) {
    if (!this.map) return;
    
    console.log(`Adding ${matches.length} matches to the map`);
    
    // In a real implementation, this would create map markers for each match
    matches.forEach(match => {
      if (match.coordinates) {
        // Simulate adding a marker
        const marker = {
          id: `match-${match.id}`,
          type: 'match',
          coordinates: match.coordinates,
          title: match.title,
          data: match
        };
        
        this.markers.push(marker);
      }
    });
  }
  
  /**
   * Add tournaments to the map
   * @param {Array} tournaments - Tournaments to add
   */
  addTournaments(tournaments) {
    if (!this.map) return;
    
    console.log(`Adding ${tournaments.length} tournaments to the map`);
    
    // In a real implementation, this would create map markers for each tournament
    tournaments.forEach(tournament => {
      if (tournament.coordinates) {
        // Simulate adding a marker
        const marker = {
          id: `tournament-${tournament.id}`,
          type: 'tournament',
          coordinates: tournament.coordinates,
          title: tournament.title,
          data: tournament
        };
        
        this.markers.push(marker);
      }
    });
  }
  
  /**
   * Get locations near a specific position
   * @param {Array} coords - Coordinates [lat, lng]
   * @param {number} radius - Search radius in kilometers
   * @returns {Array} - Nearby locations
   */
  getNearbyLocations(coords, radius = 5) {
    const [lat, lng] = coords;
    
    // Calculate nearby locations
    // In a real implementation, this would use proper geographic calculations
    const locations = [
      ...this.tables,
      ...this.markers.map(marker => ({
        id: marker.id,
        name: marker.title,
        coordinates: marker.coordinates,
        type: marker.type
      }))
    ];
    
    // Simple distance calculation (not accurate for real geographic use)
    const nearbyLocations = locations.filter(loc => {
      const [locLat, locLng] = loc.coordinates;
      const latDiff = Math.abs(lat - locLat);
      const lngDiff = Math.abs(lng - locLng);
      
      // Rough approximation (not a real distance calculation)
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 <= radius;
    });
    
    return nearbyLocations;
  }
  
  /**
   * Find the nearest ping pong tables
   * @param {Array} coords - Coordinates [lat, lng]
   * @param {number} limit - Maximum number of results
   * @returns {Array} - Nearest tables
   */
  findNearestTables(coords, limit = 5) {
    if (!coords) coords = this.defaultLocation;
    
    // Get all tables
    const tables = [...this.tables];
    
    // Sort by distance (simplified calculation)
    tables.sort((a, b) => {
      const [lat, lng] = coords;
      const [aLat, aLng] = a.coordinates;
      const [bLat, bLng] = b.coordinates;
      
      const aDistance = Math.sqrt(
        Math.pow(lat - aLat, 2) + Math.pow(lng - aLng, 2)
      );
      
      const bDistance = Math.sqrt(
        Math.pow(lat - bLat, 2) + Math.pow(lng - bLng, 2)
      );
      
      return aDistance - bDistance;
    });
    
    // Return limited number of tables
    return tables.slice(0, limit);
  }
  
  /**
   * Center the map on specific coordinates
   * @param {Array} coords - Coordinates [lat, lng]
   * @param {number} zoom - Zoom level
   */
  centerMap(coords, zoom = 14) {
    if (!this.map) return;
    
    console.log(`Centering map on ${coords} with zoom level ${zoom}`);
    this.map.setView(coords, zoom);
  }
  
  /**
   * Clean up the map
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
    }
  }
  
  /**
   * Get a summary of map data
   * @returns {Object} - Map data summary
   */
  getMapSummary() {
    return {
      tables: this.tables.length,
      matches: this.markers.filter(m => m.type === 'match').length,
      tournaments: this.markers.filter(m => m.type === 'tournament').length,
      totalLocations: this.tables.length + this.markers.length
    };
  }
  
  /**
   * Create a static map preview URL
   * @param {Array} coords - Coordinates [lat, lng]
   * @param {number} zoom - Zoom level
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {string} - Static map URL
   */
  getStaticMapUrl(coords = this.defaultLocation, zoom = 14, width = 600, height = 400) {
    const [lat, lng] = coords;
    
    // This would normally use a real static map API
    // For now, return a placeholder URL
    return `https://staticmap.openstreetmap.org/?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red`;
  }
}

// Export the map class
window.PingPongMap = PingPongMap;
