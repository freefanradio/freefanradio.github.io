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
    saveToRecentStations(stationData) {
        try {
            // Get existing recent stations from localStorage
            let recentStations = this.getRecentStations();
            
            // Generate a unique station ID
            let stationId = this.generateStationId(stationData);
            
            // Create station object with timestamp
            const stationEntry = {
                id: stationId,
                name: stationData.name || 'Unknown Station',
                url: stationData.url,
                frequency: stationData.frequency || 'Unknown',
                location: stationData.location || 'Unknown',
                genre: stationData.genre || 'Radio',
                description: stationData.description || 'Radio station',
                lastPlayed: new Date().toISOString()
            };

            console.log('💾 Saving station with ID:', stationId, 'Name:', stationEntry.name);
            
            // Remove ALL existing entries for this station (by ID, URL, AND name)
            const originalLength = recentStations.length;
            recentStations = recentStations.filter(station => {
                const isDuplicate = (
                    station.id === stationEntry.id ||
                    station.url === stationEntry.url ||
                    station.name === stationEntry.name
                );
                
                if (isDuplicate) {
                    console.log('🗑️ Removing duplicate station:', station.name, 'ID:', station.id);
                }
                
                return !isDuplicate;
            });
            
            console.log(`📊 Removed ${originalLength - recentStations.length} duplicates`);
            
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
    
    // Generate a consistent, unique station ID
    generateStationId(stationData) {
        // First try to use existing ID if provided
        if (stationData.id) {
            return stationData.id;
        }
        
        // Try to find ID from station database
        const dbId = this.findStationId(stationData);
        if (dbId) {
            return dbId;
        }
        
        // Generate a consistent ID based on station name
        // This ensures the same station always gets the same ID
        const name = (stationData.name || 'unknown').toLowerCase();
        
        // Create a simple hash from the name for consistency
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Create readable ID: first word + hash + frequency if available
        const firstWord = name.split(' ')[0].replace(/[^a-z0-9]/g, '');
        const frequency = stationData.frequency ? stationData.frequency.replace(/[^0-9]/g, '') : '';
        const hashSuffix = Math.abs(hash).toString(36).substring(0, 4);
        
        const generatedId = `${firstWord}${frequency ? '-' + frequency : ''}-${hashSuffix}`;
        
        console.log('🆔 Generated station ID:', generatedId, 'for:', stationData.name);
        return generatedId;
    }

    // Helper function to find station ID
    findStationId(stationData) {
        // Access the global stationDatabase from the main script
        if (typeof stationDatabase !== 'undefined') {
            for (const [id, dbStation] of Object.entries(stationDatabase)) {
                if (dbStation.url === stationData.url || 
                    dbStation.name === stationData.name) {
                    return id;
                }
            }
        }
        return null;
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
        
        // Additional deduplication layer - remove any duplicates that might exist
        const seen = new Set();
        const deduplicated = recentStations.filter(station => {
            // Create a unique key combining ID, name, and URL
            const key = `${station.id}|${station.name}|${station.url}`;
            
            if (seen.has(key) || 
                seen.has(station.id) || 
                seen.has(station.name) || 
                seen.has(station.url)) {
                console.log('🔍 Filtered duplicate in display:', station.name);
                return false;
            }
            
            seen.add(key);
            seen.add(station.id);
            seen.add(station.name);
            seen.add(station.url);
            return true;
        });
        
        console.log(`📺 Displaying ${deduplicated.length} unique stations (filtered from ${recentStations.length})`);
        
        return deduplicated.map(station => ({
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
    
    // Clean up any existing duplicates in localStorage
    cleanupDuplicateStations() {
        try {
            const recentStations = this.getRecentStations();
            const originalLength = recentStations.length;
            
            const seen = new Set();
            const cleaned = recentStations.filter(station => {
                // Create consistent ID if missing
                if (!station.id) {
                    station.id = this.generateStationId(station);
                }
                
                const key = `${station.id}|${station.name}|${station.url}`;
                
                if (seen.has(key) || 
                    seen.has(station.id) || 
                    seen.has(station.name) || 
                    seen.has(station.url)) {
                    console.log('🧹 Cleaning duplicate:', station.name);
                    return false;
                }
                
                seen.add(key);
                seen.add(station.id);
                seen.add(station.name);
                seen.add(station.url);
                return true;
            });
            
            if (cleaned.length !== originalLength) {
                console.log(`🧹 Cleaned ${originalLength - cleaned.length} duplicates from localStorage`);
                localStorage.setItem('freefanradio_recent_stations', JSON.stringify(cleaned));
                return true;
            }
            
            console.log('✨ No duplicates found in localStorage');
            return false;
        } catch (error) {
            console.error('Error cleaning duplicate stations:', error);
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

// Station data mapping - this should match your Jekyll station data
const stationDatabase = {
    '985fm': {
        name: '98.5 FM Montréal',
        url: 'https://17993.live.streamtheworld.com/CHMPFM_SC',
        frequency: '98.5 FM',
        location: 'Montreal, QC',
        genre: 'Talk Radio',
        description: "Montreal's premier French-language talk radio station"
    },
    'bpm': {
        name: 'BPM Sport',
        url: 'https://stream.bpmsports.ca/cklx.aac',
        frequency: '91.9 FM',
        location: 'Montreal, QC',
        genre: 'Sports Talk',
        description: "Montreal's French-language sports radio station"
    },
    'cjob680': {
        name: 'CJOB 680 Winnipeg',
        url: 'https://live.leanstream.co/CJOBAM-MP3',
        frequency: '680 AM',
        location: 'Winnipeg, MB',
        genre: 'Sports/News',
        description: "Winnipeg's sports radio covering Jets hockey and local sports"
    },
    'ckrm620': {
        name: 'CKRM 620 Regina',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CKRMAM.mp3',
        frequency: '620 AM',
        location: 'Regina, SK',
        genre: 'Sports Talk',
        description: "Regina's sports radio home for Roughriders and local sports"
    },
    'sn960': {
        name: 'Sportsnet 960 Calgary',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CFACAM.mp3',
        frequency: '960 AM',
        location: 'Calgary, AB',
        genre: 'Sports Talk',
        description: "Calgary's sports radio station"
    },
    'tsn1050': {
        name: 'TSN 1050 Toronto',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CHUMAM.mp3',
        frequency: '1050 AM',
        location: 'Toronto, ON',
        genre: 'Sports Talk',
        description: "Toronto's sports radio home for Leafs, Raptors, TFC and Blue Jays"
    },
    'tsn690': {
        name: 'TSN 690 Montreal',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CKGMAM.mp3',
        frequency: '690 AM',
        location: 'Montreal, QC',
        genre: 'Sports Talk',
        description: "Montreal's premier English-language sports radio station"
    }
};

function loadStationById(stationId) {
    const station = stationDatabase[stationId];
    
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

        // Re-run any home page initialization scripts
        if (typeof window.initializeHomePageStations === 'function') {
            console.log('🏠 Calling home page station initializer...');
            window.initializeHomePageStations();
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
