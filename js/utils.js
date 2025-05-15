// Get formatted date
function getFormattedDate(dateString, includeWeekday = true) {
    const date = new Date(dateString);
    
    if (includeWeekday) {
        return date.toLocaleDateString('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else {
        return date.toLocaleDateString('it-IT', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Get formatted time
function getFormattedTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Format date from ISO string
function formatISODate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('it-IT', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Debounce function to limit how often a function can be called
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Get days between two dates
function getDaysBetween(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate days
    return Math.round(Math.abs((start - end) / oneDay));
}

// Check if date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// Check if date is in the past
function isPastDate(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    
    // Reset time components to compare just the dates
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date < today;
}

// Format relative time (e.g., "2 days ago", "1 hour ago", etc.)
function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const times = [
        { seconds: 60, text: 'meno di un minuto fa' },
        { seconds: 60 * 60, text: (s) => `${Math.floor(s / 60)} minut${Math.floor(s / 60) === 1 ? 'o' : 'i'} fa` },
        { seconds: 60 * 60 * 24, text: (s) => `${Math.floor(s / (60 * 60))} or${Math.floor(s / (60 * 60)) === 1 ? 'a' : 'e'} fa` },
        { seconds: 60 * 60 * 24 * 7, text: (s) => `${Math.floor(s / (60 * 60 * 24))} giorn${Math.floor(s / (60 * 60 * 24)) === 1 ? 'o' : 'i'} fa` },
        { seconds: 60 * 60 * 24 * 30, text: (s) => `${Math.floor(s / (60 * 60 * 24 * 7))} settiman${Math.floor(s / (60 * 60 * 24 * 7)) === 1 ? 'a' : 'e'} fa` },
        { seconds: 60 * 60 * 24 * 365, text: (s) => `${Math.floor(s / (60 * 60 * 24 * 30))} mes${Math.floor(s / (60 * 60 * 24 * 30)) === 1 ? 'e' : 'i'} fa` },
        { seconds: Infinity, text: (s) => `${Math.floor(s / (60 * 60 * 24 * 365))} ann${Math.floor(s / (60 * 60 * 24 * 365)) === 1 ? 'o' : 'i'} fa` }
    ];
    
    const time = times.find(t => diffInSeconds < t.seconds);
    
    if (typeof time.text === 'function') {
        return time.text(diffInSeconds);
    }
    return time.text;
}

// Add FontAwesome script dynamically
function loadFontAwesome() {
    if (!document.getElementById('font-awesome-script')) {
        const script = document.createElement('script');
        script.id = 'font-awesome-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js';
        script.defer = true;
        document.head.appendChild(script);
    }
}

// Handle errors
function handleError(error, context = '') {
    console.error(`Error ${context ? 'in ' + context : ''}:`, error);
    showAlert(`Si è verificato un errore${context ? ' durante ' + context : ''}. Riprova.`, 'danger');
}

// Ensure safe storage get
function getSafeStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return defaultValue;
    }
}

// Ensure safe storage set
function setSafeStorage(key, value) {
    try {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
        return true;
    } catch (error) {
        console.error(`Error setting ${key} in storage:`, error);
        return false;
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    // Create temporary element
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    
    // Select and copy
    el.select();
    document.execCommand('copy');
    
    // Remove temporary element
    document.body.removeChild(el);
    
    // Show success notification
    showAlert('Testo copiato negli appunti!', 'success');
}

// Load FontAwesome when the document is loaded
document.addEventListener('DOMContentLoaded', loadFontAwesome);
