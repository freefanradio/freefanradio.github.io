// Audio Player Management
class RadioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentStation = null;
        this.volume = 0.5;
        this.maxRecentStations = 8;
        
        this.init();
    }
    
    init() {
        // Get DOM elements
        this.playerElement = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.stationNameEl = document.getElementById('stationName');
        this.nowPlayingEl = document.getElementById('nowPlaying');
        this.shareBtn = document.getElementById('shareBtn');
        
        // Debug logging
        console.log('RadioPlayer init - Elements found:', {
            playerElement: !!this.playerElement,
            playPauseBtn: !!this.playPauseBtn,
            volumeSlider: !!this.volumeSlider,
            stationNameEl: !!this.stationNameEl,
            nowPlayingEl: !!this.nowPlayingEl,
            shareBtn: !!this.shareBtn
        });
        
        // Bind events
        this.bindEvents();
        
        // Clean up any existing duplicates on initialization
        setTimeout(() => {
            this.cleanupDuplicateStations();
        }, 1000);
        
        // Initialize volume if slider exists
        if (this.volumeSlider) {
            this.volumeSlider.value = this.volume * 100;
        }
    }
    
    bindEvents() {
        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
            });
        }
        
        // Volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
        
        // Station play buttons: they only carry a station id; the stream URL
        // always comes from the station list generated from _stations/.
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.play-station-btn');
            if (!btn) return;
            const stationId = btn.dataset.stationId;
            if (stationId) {
                this.playStationById(stationId);
            } else {
                console.error('❌ Play button has no data-station-id');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (this.currentStation) {
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                }
            }
        });
    }
    
    loadStation(streamUrl, stationName, stationData = {}, autoPlay = true) {
        // Stop current audio if playing
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        // Create new audio element
        this.audio = new Audio(streamUrl);
        this.audio.volume = this.volume;
        this.audio.preload = 'none';
        
        // Set current station
        this.currentStation = {
            url: streamUrl,
            name: stationName,
            ...stationData
        };
        
        // Save to recent stations
        this.saveToRecentStations(this.currentStation);
        
        // Update UI if elements exist
        if (this.stationNameEl) {
            this.stationNameEl.textContent = stationName;
        }
        if (this.nowPlayingEl) {
            this.nowPlayingEl.textContent = autoPlay ? 'Loading...' : 'Ready to play';
        }
        if (this.playPauseBtn) {
            this.playPauseBtn.disabled = false;
        }
        if (this.shareBtn) {
            this.shareBtn.disabled = false;
        }
        
        // Show player if element exists
        if (this.playerElement) {
            this.playerElement.classList.add('active');
        }
        
        // Bind audio events
        this.bindAudioEvents();
        
        // Only auto-play if requested (and user interaction allows it)
        if (autoPlay) {
            this.play();
        }
    }
    
    // Play a station by id, using the current stream URL from the station list
    playStationById(stationId, autoPlay = true) {
        const station = getStationById(stationId);
        if (!station) {
            console.error('❌ Station not found for ID:', stationId);
            return null;
        }
        this.loadStation(station.url, station.name, station, autoPlay);
        return station;
    }
    
    bindAudioEvents() {
        if (!this.audio) return;
        
        this.audio.addEventListener('loadstart', () => {
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Loading...';
            }
        });
        
        this.audio.addEventListener('canplay', () => {
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Ready to play';
            }
        });
        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            if (this.playPauseBtn) {
                this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Now playing live';
            }
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            if (this.playPauseBtn) {
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Paused';
            }
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Error loading stream';
            }
            if (this.playPauseBtn) {
                this.playPauseBtn.disabled = true;
            }
            if (this.shareBtn) {
                this.shareBtn.disabled = true;
            }
        });
        
        this.audio.addEventListener('stalled', () => {
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Buffering...';
            }
        });
        
        this.audio.addEventListener('waiting', () => {
            if (this.nowPlayingEl) {
                this.nowPlayingEl.textContent = 'Buffering...';
            }
        });
    }
    
    play() {
        if (this.audio && this.currentStation) {
            console.log('🎵 Attempting to play:', this.currentStation.name);
            console.log('🔗 Audio src:', this.audio.src);
            
            // Check if audio is ready
            if (this.audio.readyState < 2) {
                console.log('📡 Audio not ready, loading first...');
                this.audio.load();
            }
            
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ Audio play promise resolved - playing successfully');
                    })
                    .catch(error => {
                        console.error('❌ Play failed:', error);
                        
                        // Handle different types of errors
                        if (error.name === 'NotAllowedError') {
                            console.error('🚫 Autoplay blocked by browser. User interaction required.');
                            if (this.nowPlayingEl) {
                                this.nowPlayingEl.textContent = 'Click to play (autoplay blocked)';
                            }
                            // Show a user-friendly message
                            this.showAutoplayBlockedMessage();
                        } else if (error.name === 'AbortError') {
                            console.error('🛑 Play was aborted');
                            if (this.nowPlayingEl) {
                                this.nowPlayingEl.textContent = 'Play was interrupted';
                            }
                        } else if (error.name === 'NetworkError') {
                            console.error('🌐 Network error loading audio');
                            if (this.nowPlayingEl) {
                                this.nowPlayingEl.textContent = 'Network error - check connection';
                            }
                        } else {
                            console.error('🔥 Unknown audio error:', error);
                            if (this.nowPlayingEl) {
                                this.nowPlayingEl.textContent = 'Error loading stream';
                            }
                        }
                    });
            }
        } else {
            console.error('❌ Cannot play - no audio or station:', {
                hasAudio: !!this.audio,
                hasStation: !!this.currentStation
            });
        }
    }
    
    showAutoplayBlockedMessage() {
        // Remove any existing autoplay notifications first
        const existingNotification = document.getElementById('autoplay-blocked-msg');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }
        
        // Create a friendly notification
        const notification = document.createElement('div');
        notification.id = 'autoplay-blocked-msg';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-volume-mute" style="color: #f59e0b; font-size: 1.2rem;"></i>
                <div style="flex: 1;">
                    <strong>Browser Protection Active</strong>
                    <br>
                    <small>Click the play button below to start listening</small>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 1rem;
            right: 1rem;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 1rem;
            border-radius: 12px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 500px;
            margin: 0 auto;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
    }
    
    // Recent Stations Management
    // Only { id, lastPlayed } is stored. Name, stream URL, etc. are always
    // read from the station list, so a moved feed is picked up automatically.
    saveToRecentStations(stationData) {
        try {
            const stationId = stationData && (stationData.id || resolveStationId(stationData));
            if (!stationId || !getStationById(stationId)) {
                console.warn('⚠️ Not saving unknown station to recents:', stationData && stationData.name);
                return;
            }
            
            const entries = this.readRecentEntries().filter(e => e.id !== stationId);
            entries.unshift({ id: stationId, lastPlayed: new Date().toISOString() });
            this.writeRecentEntries(entries);
            
            const recentStations = this.getRecentStations();
            window.dispatchEvent(new CustomEvent('recentStationsUpdated', {
                detail: { station: getStationById(stationId), recentStations }
            }));
            
            console.log('💾 Saved station to recent:', stationId);
        } catch (error) {
            console.error('Error saving to recent stations:', error);
        }
    }
    
    // Read stored entries and normalize them to [{ id, lastPlayed }].
    // Older entries (which stored name/url) are mapped to a station id;
    // entries for stations that no longer exist are dropped.
    readRecentEntries() {
        let raw = [];
        try {
            const stored = localStorage.getItem('freefanradio_recent_stations');
            raw = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error retrieving recent stations:', error);
            return [];
        }
        if (!Array.isArray(raw)) return [];
        
        const seen = new Set();
        const entries = [];
        for (const item of raw) {
            if (!item) continue;
            const id = (item.id && getStationById(item.id)) ? item.id : resolveStationId(item);
            if (!id || seen.has(id)) continue;
            seen.add(id);
            entries.push({ id, lastPlayed: item.lastPlayed || new Date(0).toISOString() });
        }
        return entries.slice(0, this.maxRecentStations);
    }
    
    writeRecentEntries(entries) {
        try {
            const clean = entries
                .slice(0, this.maxRecentStations)
                .map(e => ({ id: e.id, lastPlayed: e.lastPlayed }));
            localStorage.setItem('freefanradio_recent_stations', JSON.stringify(clean));
        } catch (error) {
            console.error('Error saving recent stations:', error);
        }
    }
    
    // Recent stations with full, current station data
    getRecentStations() {
        return this.readRecentEntries().map(e => ({
            ...getStationById(e.id),
            lastPlayed: e.lastPlayed
        }));
    }
    
    clearRecentStations() {
        try {
            localStorage.removeItem('freefanradio_recent_stations');
            console.log('Cleared recent stations');
        } catch (error) {
            console.error('Error clearing recent stations:', error);
        }
    }
    
    // Get recent stations formatted for display
    getRecentStationsForDisplay() {
        return this.getRecentStations().map(station => ({
            ...station,
            timeAgo: this.formatTimeAgo(new Date(station.lastPlayed))
        }));
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    // Rewrite localStorage in the normalized id-only format
    // (removes duplicates, old stream URLs and unknown stations)
    cleanupDuplicateStations() {
        try {
            const stored = localStorage.getItem('freefanradio_recent_stations');
            const entries = this.readRecentEntries();
            const normalized = JSON.stringify(entries);
            if (stored && stored !== normalized) {
                this.writeRecentEntries(entries);
                console.log('🧹 Normalized recent stations in localStorage');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error cleaning recent stations:', error);
            return false;
        }
    }

    // Export/Import functionality
    exportRecentStations() {
        try {
            const recentStations = this.getRecentStations();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                stations: recentStations
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `freefanradio-recent-stations-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('Recent stations exported successfully');
            return exportData;
        } catch (error) {
            console.error('Error exporting recent stations:', error);
            throw error;
        }
    }
    
    importRecentStations(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!data.stations || !Array.isArray(data.stations)) {
                throw new Error('Invalid data format');
            }
            
            // Keep only stations that exist on the site; store ids only
            const validStations = data.stations
                .map(station => ({
                    id: (station.id && getStationById(station.id)) ? station.id : resolveStationId(station),
                    lastPlayed: station.lastPlayed || new Date().toISOString()
                }))
                .filter(station => station.id);
            
            if (validStations.length > 0) {
                this.writeRecentEntries(validStations);
                console.log(`Imported ${validStations.length} recent stations`);
                return validStations.length;
            } else {
                throw new Error('No valid stations found in import data');
            }
        } catch (error) {
            console.error('Error importing recent stations:', error);
            throw error;
        }
    }
}

// Recent Stations Display Utility
function displayRecentStations() {
    if (!window.radioPlayer) return;
    
    const recentStations = window.radioPlayer.getRecentStationsForDisplay();
    
    if (recentStations.length === 0) {
        console.log('No recent stations found.');
        return;
    }
    
    console.log('Recent Stations (Last 8):');
    console.table(recentStations.map(station => ({
        Name: station.name,
        Location: station.location,
        Frequency: station.frequency,
        'Last Played': station.timeAgo
    })));
}

// Make utility functions available globally
window.displayRecentStations = displayRecentStations;
window.clearRecentStations = () => {
    if (window.radioPlayer) {
        window.radioPlayer.clearRecentStations();
    }
};
window.exportRecentStations = () => {
    if (window.radioPlayer) {
        return window.radioPlayer.exportRecentStations();
    }
};
window.importRecentStations = (jsonData) => {
    if (window.radioPlayer) {
        return window.radioPlayer.importRecentStations(jsonData);
    }
};
window.cleanupDuplicateStations = () => {
    if (window.radioPlayer) {
        const cleaned = window.radioPlayer.cleanupDuplicateStations();
        if (cleaned) {
            console.log('✨ Duplicates cleaned! Refresh the page to see changes.');
        }
        return cleaned;
    }
};

// Navigation Management
class Navigation {
    constructor() {
        this.init();
    }
    
    init() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.body = document.body;
        
        if (this.navToggle && this.navMenu) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        this.navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });
        
        // Close menu when clicking on links
        this.navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                this.closeMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });
        
        // Handle touch events for better mobile experience
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.navMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.navMenu.addEventListener('touchmove', (e) => {
            if (!this.navMenu.classList.contains('active')) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            // If swiping left significantly more than vertical, close menu
            if (deltaX < -50 && Math.abs(deltaY) < 100) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        const isActive = this.navMenu.classList.contains('active');
        
        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        this.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        this.body.style.overflow = '';
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Animations on Scroll
function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        document.querySelectorAll('.station-card, .page-content, .hero').forEach(el => {
            observer.observe(el);
        });
    }
}

// Service Worker for Offline Support
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/freefanradio/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Error Handling for Audio
function handleAudioError(error) {
    console.error('Audio Error:', error);
    
    // Show user-friendly error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Sorry, there was an issue playing the audio stream. Please try again.';
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(errorMsg);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorMsg)) {
            document.body.removeChild(errorMsg);
        }
    }, 5000);
}

// Performance Monitoring
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
        // This would require importing web-vitals library
        // For now, we'll use basic performance monitoring
    }
    
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime, 'ms');
        
        // Send to analytics if needed
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                'custom_parameter': loadTime
            });
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    window.radioPlayer = new RadioPlayer();
    new Navigation();
    
    // Initialize SPA router for persistent audio
    window.spaRouter = new SPARouter();
    
    // Initialize features
    initSmoothScrolling();
    initLazyLoading();
    initScrollAnimations();
    initServiceWorker();
    initPerformanceMonitoring();
    
    // Handle URL parameters for direct station linking
    handleUrlParameters();
    
    // Add body class for JavaScript enabled
    document.body.classList.add('js-enabled');
    
    console.log('🎵 SPA Router initialized - Audio will persist during navigation!');
});

// URL Parameter Handling for Direct Station Linking
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const radioId = urlParams.get('radioId');
    
    if (radioId) {
        console.log('🔗 Direct link detected for station ID:', radioId);
        
        // Try to load the station after a short delay to ensure player is ready
        setTimeout(() => {
            loadStationById(radioId);
        }, 500);
    }
}

// Station list generated by Jekyll from _stations/ (see _includes/stations-data.html)
function getStations() {
    return window.FFR_STATIONS || {};
}

function getStationById(stationId) {
    const station = getStations()[stationId];
    return station ? { ...station, id: stationId } : null;
}

// Map an old-style entry (name and/or stream URL) to a station id
function resolveStationId(entry) {
    if (!entry) return null;
    for (const station of Object.values(getStations())) {
        if ((entry.url && station.url === entry.url) ||
            (entry.name && station.name === entry.name)) {
            return station.id;
        }
    }
    return null;
}

function loadStationById(stationId) {
    const station = getStationById(stationId);
    
    if (!station) {
        console.error('❌ Station not found for ID:', stationId);
        return;
    }
    
    // Wait for radio player to be available
    const waitForPlayer = () => {
        if (window.radioPlayer) {
            console.log('🎵 Loading station from URL parameter:', station.name);
            
            // Load the station but don't auto-play (to avoid autoplay blocking)
            window.radioPlayer.loadStation(station.url, station.name, station, false);
            
            // Show a friendly message encouraging user to click play
            showAutoplayNotification(station.name);
        } else {
            console.log('⏳ Waiting for radio player to initialize...');
            setTimeout(waitForPlayer, 100);
        }
    };
    
    waitForPlayer();
}

// Show a user-friendly notification for direct links
function showAutoplayNotification(stationName) {
    const notification = document.createElement('div');
    notification.id = 'autoplay-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-radio" style="color: #3b82f6; font-size: 1.2rem;"></i>
            <div>
                <strong>${stationName}</strong> is ready to play!
                <br>
                <small>Click the play button below to start listening.</small>
            </div>
            <button onclick="dismissAutoplayNotification()" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; padding: 4px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 1rem;
        right: 1rem;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1px solid #3b82f6;
        color: #1e40af;
        padding: 1rem;
        border-radius: 12px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 500px;
        margin: 0 auto;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        dismissAutoplayNotification();
    }, 5000);
}

// Function to dismiss the notification
function dismissAutoplayNotification() {
    const notification = document.getElementById('autoplay-notification');
    if (notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }
}

// Function to generate shareable URLs
function getShareableUrl(stationId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?radioId=${stationId}`;
}

// Function to copy shareable link to clipboard
function copyStationLink(stationId) {
    const shareUrl = getShareableUrl(stationId);
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            fallbackCopyTextToClipboard(shareUrl);
        });
    } else {
        fallbackCopyTextToClipboard(shareUrl);
    }
}

// Function to share the currently playing station
function shareCurrentStation() {
    if (window.radioPlayer && window.radioPlayer.currentStation) {
        const station = window.radioPlayer.currentStation;
        const stationId = station.id || station.name.toLowerCase().replace(/\s+/g, '-');
        copyStationLink(stationId);
    } else {
        showToast('No station currently playing');
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Link copied to clipboard!');
        } else {
            showToast('Failed to copy link');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Copy not supported by browser');
    }
    
    document.body.removeChild(textArea);
}

// Simple toast notification
function showToast(message, duration = 3000) {
    // Remove any existing toast
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Handle offline/online events
window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    const offlineMsg = document.createElement('div');
    offlineMsg.id = 'offline-message';
    offlineMsg.textContent = 'You are currently offline. Some features may not work.';
    offlineMsg.style.cssText = `
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        text-align: center;
        padding: 0.75rem;
        z-index: 9999;
    `;
    document.body.appendChild(offlineMsg);
});

window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    const offlineMsg = document.getElementById('offline-message');
    if (offlineMsg) {
        document.body.removeChild(offlineMsg);
    }
});

// SPA Router Class for Persistent Audio
class SPARouter {
    constructor() {
        this.currentPath = window.location.pathname;
        this.isNavigating = false;
        this.init();
    }

    init() {
        // Handle all link clicks and navigation buttons
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            const button = e.target.closest('[data-spa-navigate]');
            
            if (link && this.shouldInterceptLink(link)) {
                e.preventDefault();
                this.navigateTo(link.pathname);
            } else if (button) {
                e.preventDefault();
                const path = button.dataset.spaNavigate;
                console.log('🔄 SPA - Button navigation to:', path);
                this.navigateTo(path);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.loadContent(window.location.pathname);
        });

        // Add loading styles
        this.addLoadingStyles();
    }

    shouldInterceptLink(link) {
        // Only intercept internal links
        return link.hostname === window.location.hostname && 
               !link.hasAttribute('download') &&
               !link.href.includes('#') &&
               !link.href.includes('mailto:') &&
               !link.href.includes('tel:') &&
               !link.target;
    }

    async navigateTo(path) {
        if (path === this.currentPath || this.isNavigating) return;
        
        this.isNavigating = true;
        
        // Update URL without reload
        window.history.pushState({}, '', path);
        await this.loadContent(path);
        this.currentPath = path;
        
        this.isNavigating = false;
    }

    async loadContent(path) {
        try {
            // Show loading indicator
            document.body.classList.add('spa-loading');
            
            // Fetch the new page
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            
            // Parse the response
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update page title
            document.title = newDoc.title;
            
            // Update main content
            const mainContent = document.querySelector('.main-content');
            const newContent = newDoc.querySelector('.main-content');
            
            if (mainContent && newContent) {
                // Smooth transition
                mainContent.style.opacity = '0';
                
                setTimeout(() => {
                    mainContent.innerHTML = newContent.innerHTML;
                    mainContent.style.opacity = '1';
                    
                    // Re-initialize page scripts
                    this.initPageScripts();
                    
                    // Update navigation active state
                    this.updateNavigation(path);
                    
                    // Remove loading indicator
                    document.body.classList.remove('spa-loading');
                }, 150);
            }
            
        } catch (error) {
            console.error('SPA Navigation error:', error);
            document.body.classList.remove('spa-loading');
            // Fallback to normal navigation
            window.location.href = path;
        }
    }

    initPageScripts() {
        console.log('🔄 SPA - Initializing page scripts...');
        
        // Re-initialize radio station buttons (for regular pages)
        const stationButtons = document.querySelectorAll('[data-station]');
        console.log(`📻 Found ${stationButtons.length} data-station buttons`);
        
        stationButtons.forEach(button => {
            // Remove existing listeners to prevent duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                const stationName = newButton.dataset.station;
                const streamUrl = newButton.dataset.url;
                const logoUrl = newButton.dataset.logo;
                
                console.log('🎵 SPA - Regular station button clicked:', stationName);
                
                if (stationName && streamUrl && window.radioPlayer) {
                    const stationData = {
                        name: stationName,
                        url: streamUrl,
                        logo: logoUrl
                    };
                    window.radioPlayer.loadStation(streamUrl, stationName, stationData);
                }
            });
        });

        // Re-run any home page initialization scripts
        if (typeof window.initializeHomePageStations === 'function') {
            console.log('🏠 Calling home page station initializer...');
            window.initializeHomePageStations();
        } else {
            // For non-home pages, initialize immediately
            this.initializeHomePageSlots();
        }

        // Debug: Check for navigation buttons
        const navButtons = document.querySelectorAll('[data-spa-navigate]');
        console.log(`🔍 Found ${navButtons.length} SPA navigation buttons`);

        // Re-initialize any other components
        if (window.radioPlayer) {
            window.radioPlayer.init();
        }

        // Scroll to top for new page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ SPA - Page scripts initialized');
    }

    initializeHomePageSlots() {
        // Re-initialize home page station slots (special handling)
        const stationSlots = document.querySelectorAll('.station-slot');
        console.log(`🏠 Found ${stationSlots.length} station slots`);
        
        stationSlots.forEach(slot => {
            // Only handle slots that have station data and aren't already bound
            if (slot.stationData && !slot.dataset.spaInitialized) {
                slot.dataset.spaInitialized = 'true';
                console.log('🔄 Re-binding station slot:', slot.stationData.name);
                
                // Remove existing listeners and clone to prevent duplicates
                const newSlot = slot.cloneNode(true);
                slot.parentNode.replaceChild(newSlot, slot);
                
                // Re-attach station data
                newSlot.stationData = slot.stationData;
                
                newSlot.addEventListener('click', function(event) {
                    event.preventDefault();
                    console.log('🎵 SPA - Station slot clicked for:', this.stationData?.name);
                    
                    try {
                        const stationData = this.stationData;
                        console.log('📻 SPA - Station data:', stationData);
                        
                        if (!window.radioPlayer) {
                            console.error('❌ Radio player not available!');
                            return;
                        }
                        
                        console.log('🚀 SPA - Loading station:', stationData.name);
                        
                        // Add loading state
                        this.classList.add('loading');
                        
                        // Load station via radio player
                        window.radioPlayer.loadStation(stationData.url, stationData.name, stationData);
                        
                        // Reset loading state after a delay
                        setTimeout(() => {
                            this.classList.remove('loading');
                        }, 2000);
                        
                    } catch (error) {
                        console.error('❌ Error playing station:', error);
                        this.classList.remove('loading');
                    }
                });
            }
        });
    }

    updateNavigation(path) {
        // Update active navigation state
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.pathname === path) {
                link.classList.add('active');
            }
        });
    }

    addLoadingStyles() {
        // Add CSS for loading states
        const style = document.createElement('style');
        style.textContent = `
            .spa-loading .main-content {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .spa-loading::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                z-index: 9999;
                animation: loadingBar 1s ease-in-out infinite;
            }
            
            @keyframes loadingBar {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
            
            .main-content {
                transition: opacity 0.15s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RadioPlayer, Navigation, SPARouter };
}
