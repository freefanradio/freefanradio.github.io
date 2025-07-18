// Audio Player Management
class RadioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentStation = null;
        this.volume = 0.5;
        
        this.init();
    }
    
    init() {
        // Get DOM elements
        this.playerElement = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.stationNameEl = document.getElementById('stationName');
        this.nowPlayingEl = document.getElementById('nowPlaying');
        
        // Bind events
        this.bindEvents();
        
        // Initialize volume
        this.volumeSlider.value = this.volume * 100;
    }
    
    bindEvents() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        });
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
        
        // Station play buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-station-btn')) {
                const btn = e.target.closest('.play-station-btn');
                const streamUrl = btn.dataset.stream;
                const stationName = btn.dataset.name;
                
                if (streamUrl && stationName) {
                    this.loadStation(streamUrl, stationName);
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
    
    loadStation(streamUrl, stationName) {
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
            name: stationName
        };
        
        // Update UI
        this.stationNameEl.textContent = stationName;
        this.nowPlayingEl.textContent = 'Loading...';
        this.playPauseBtn.disabled = false;
        
        // Show player
        this.playerElement.classList.add('active');
        
        // Bind audio events
        this.bindAudioEvents();
        
        // Auto-play
        this.play();
    }
    
    bindAudioEvents() {
        if (!this.audio) return;
        
        this.audio.addEventListener('loadstart', () => {
            this.nowPlayingEl.textContent = 'Loading...';
        });
        
        this.audio.addEventListener('canplay', () => {
            this.nowPlayingEl.textContent = 'Ready to play';
        });
        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.nowPlayingEl.textContent = 'Now playing live';
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.nowPlayingEl.textContent = 'Paused';
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.nowPlayingEl.textContent = 'Error loading stream';
            this.playPauseBtn.disabled = true;
        });
        
        this.audio.addEventListener('stalled', () => {
            this.nowPlayingEl.textContent = 'Buffering...';
        });
        
        this.audio.addEventListener('waiting', () => {
            this.nowPlayingEl.textContent = 'Buffering...';
        });
    }
    
    play() {
        if (this.audio && this.currentStation) {
            this.audio.play().catch(error => {
                console.error('Play failed:', error);
                this.nowPlayingEl.textContent = 'Failed to play';
            });
        }
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
}

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
    new RadioPlayer();
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
