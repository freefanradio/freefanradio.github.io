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
        
        // Debug logging
        console.log('RadioPlayer init - Elements found:', {
            playerElement: !!this.playerElement,
            playPauseBtn: !!this.playPauseBtn,
            volumeSlider: !!this.volumeSlider,
            stationNameEl: !!this.stationNameEl,
            nowPlayingEl: !!this.nowPlayingEl
        });
        
        // Bind events
        this.bindEvents();
        
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
        
        // Station play buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-station-btn')) {
                const btn = e.target.closest('.play-station-btn');
                const streamUrl = btn.dataset.stream;
                const stationName = btn.dataset.name;
                
                // Collect additional station data from the card
                const stationCard = btn.closest('.station-card');
                const stationData = {};
                
                if (stationCard) {
                    const frequencyEl = stationCard.querySelector('.frequency');
                    const locationEl = stationCard.querySelector('.location');
                    const genreEl = stationCard.querySelector('.genre');
                    const descriptionEl = stationCard.querySelector('.station-info p');
                    
                    if (frequencyEl) stationData.frequency = frequencyEl.textContent.trim();
                    if (locationEl) stationData.location = locationEl.textContent.trim();
                    if (genreEl) stationData.genre = genreEl.textContent.trim();
                    if (descriptionEl) stationData.description = descriptionEl.textContent.trim();
                }
                
                if (streamUrl && stationName) {
                    this.loadStation(streamUrl, stationName, stationData);
                }
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
    
    loadStation(streamUrl, stationName, stationData = {}) {
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
            this.nowPlayingEl.textContent = 'Loading...';
        }
        if (this.playPauseBtn) {
            this.playPauseBtn.disabled = false;
        }
        
        // Show player if element exists
        if (this.playerElement) {
            this.playerElement.classList.add('active');
        }
        
        // Bind audio events
        this.bindAudioEvents();
        
        // Try to auto-play (may fail due to browser autoplay policy)
        this.play();
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
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f59e0b;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 90%;
        `;
        notification.innerHTML = `
            <div style="margin-bottom: 0.5rem;">🔊 Audio Blocked</div>
            <div style="font-size: 0.9rem;">Your browser blocked autoplay. Click the play button again to start.</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
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
    saveToRecentStations(stationData) {
        try {
            // Get existing recent stations from localStorage
            let recentStations = this.getRecentStations();
            
            // Create station object with timestamp
            const stationEntry = {
                name: stationData.name || 'Unknown Station',
                url: stationData.url,
                frequency: stationData.frequency || 'Unknown',
                location: stationData.location || 'Unknown',
                genre: stationData.genre || 'Radio',
                description: stationData.description || 'Radio station',
                lastPlayed: new Date().toISOString()
            };
            
            // Remove existing entry for this station if it exists
            recentStations = recentStations.filter(station => 
                station.url !== stationEntry.url
            );
            
            // Add to beginning of array (most recent first)
            recentStations.unshift(stationEntry);
            
            // Keep only the last 8 stations
            recentStations = recentStations.slice(0, this.maxRecentStations);
            
            // Save back to localStorage
            localStorage.setItem('freefanradio_recent_stations', JSON.stringify(recentStations));
            
            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('recentStationsUpdated', {
                detail: { station: stationEntry, recentStations }
            }));
            
            console.log('Saved station to recent:', stationEntry.name);
        } catch (error) {
            console.error('Error saving to recent stations:', error);
        }
    }
    
    getRecentStations() {
        try {
            const stored = localStorage.getItem('freefanradio_recent_stations');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error retrieving recent stations:', error);
            return [];
        }
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
        const recentStations = this.getRecentStations();
        return recentStations.map(station => ({
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
            
            // Validate station objects
            const validStations = data.stations.filter(station => 
                station.name && station.url && station.lastPlayed
            );
            
            if (validStations.length > 0) {
                localStorage.setItem('freefanradio_recent_stations', JSON.stringify(validStations));
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
    
    // Initialize features
    initSmoothScrolling();
    initLazyLoading();
    initScrollAnimations();
    initServiceWorker();
    initPerformanceMonitoring();
    
    // Add body class for JavaScript enabled
    document.body.classList.add('js-enabled');
});

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

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RadioPlayer, Navigation };
}
