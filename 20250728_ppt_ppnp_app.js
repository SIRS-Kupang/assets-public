// Presentation Application JavaScript
class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.slides = [];
        this.notes = [];
        this.notesVisible = false;
        
        this.init();
        this.setupEventListeners();
        this.updateSlideCounter();
        this.updateNavigation();
        this.loadSlideNotes();
    }
    
    init() {
        // Get all slides
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        
        // Update total slides counter
        document.getElementById('total-slides').textContent = this.totalSlides;
        
        // Generate slide dots
        this.generateSlideDots();
        
        // Show first slide
        this.showSlide(1);
        
        // Load speaker notes
        this.loadSpeakerNotes();
        
        // Setup navigation button event listeners
        this.setupNavigationButtons();
    }
    
    setupNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }
    }
    
    generateSlideDots() {
        const dotsContainer = document.getElementById('slideDots');
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.setAttribute('data-slide', i);
            dot.setAttribute('aria-label', `Go to slide ${i}`);
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            
            if (i === 1) {
                dot.classList.add('active');
            }
            
            // Use arrow function to maintain 'this' context
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(i);
            });
            
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(i);
                }
            });
            
            dotsContainer.appendChild(dot);
        }
    }
    
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'n':
                case 'N':
                    this.toggleNotes();
                    break;
                case 'p':
                case 'P':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.preparePrint();
                    }
                    break;
                case 'Escape':
                    if (this.notesVisible) {
                        this.toggleNotes();
                    }
                    break;
            }
        });
        
        // Touch/swipe support for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) { // Minimum swipe distance
                    if (diffX > 0) {
                        this.nextSlide(); // Swipe left = next slide
                    } else {
                        this.prevSlide(); // Swipe right = prev slide
                    }
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.adjustSlideHeight();
        });
        
        // Initial height adjustment
        this.adjustSlideHeight();
    }
    
    adjustSlideHeight() {
        const slides = document.querySelectorAll('.slide');
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.presentation-header')?.offsetHeight || 0;
        const navHeight = document.querySelector('.slide-navigation')?.offsetHeight || 0;
        const availableHeight = viewportHeight - headerHeight - navHeight - 40; // 40px for padding
        
        slides.forEach(slide => {
            slide.style.minHeight = Math.max(600, availableHeight) + 'px';
        });
    }
    
    showSlide(slideNumber) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show target slide
        const targetSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (targetSlide) {
            targetSlide.classList.add('active');
            this.currentSlide = slideNumber;
            
            // Update UI
            this.updateSlideCounter();
            this.updateNavigation();
            this.updateSlideDots();
            this.updateSpeakerNotes();
            
            // Announce slide change for screen readers
            this.announceSlideChange();
            
            // Smooth scroll to top of slide container
            const slideContainer = document.querySelector('.slide-container');
            if (slideContainer) {
                slideContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    prevSlide() {
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.showSlide(slideNumber);
        }
    }
    
    updateSlideCounter() {
        const currentSlideElement = document.getElementById('current-slide');
        if (currentSlideElement) {
            currentSlideElement.textContent = this.currentSlide;
        }
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides;
            
            // Update button text for last slide
            if (this.currentSlide === this.totalSlides) {
                nextBtn.textContent = 'Selesai ✓';
            } else {
                nextBtn.textContent = 'Selanjutnya ❯';
            }
        }
    }
    
    updateSlideDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === this.currentSlide);
        });
    }
    
    loadSpeakerNotes() {
        // Extract speaker notes from each slide
        this.notes = [];
        this.slides.forEach((slide, index) => {
            const notesElement = slide.querySelector('.slide-notes');
            if (notesElement) {
                this.notes[index + 1] = notesElement.innerHTML;
            } else {
                this.notes[index + 1] = '<p>Tidak ada catatan speaker untuk slide ini.</p>';
            }
        });
    }
    
    updateSpeakerNotes() {
        if (this.notesVisible) {
            const notesContent = document.getElementById('notesContent');
            if (notesContent && this.notes[this.currentSlide]) {
                notesContent.innerHTML = this.notes[this.currentSlide];
            }
        }
    }
    
    toggleNotes() {
        const notesPanel = document.getElementById('notesPanel');
        if (!notesPanel) return;
        
        this.notesVisible = !this.notesVisible;
        
        if (this.notesVisible) {
            notesPanel.classList.add('visible');
            this.updateSpeakerNotes();
            const toggleBtn = document.querySelector('.notes-toggle');
            if (toggleBtn) toggleBtn.textContent = 'Hide';
        } else {
            notesPanel.classList.remove('visible');
            const toggleBtn = document.querySelector('.notes-toggle');
            if (toggleBtn) toggleBtn.textContent = 'Show';
        }
    }
    
    announceSlideChange() {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Slide ${this.currentSlide} of ${this.totalSlides}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    // Export functionality
    exportPresentation() {
        try {
            const slideData = this.extractSlideData();
            const exportData = {
                title: 'Krisis SDM RS Ben Mboi - Urgensi Mempertahankan 150 Pegawai Kontrak',
                date: new Date().toLocaleDateString('id-ID'),
                totalSlides: this.totalSlides,
                currentSlide: this.currentSlide,
                slides: slideData,
                metadata: {
                    hospital: 'RSUP dr. Ben Mboi Kupang',
                    investment: 'Rp 420 miliar',
                    staffAtRisk: 150,
                    totalStaff: 215,
                    deadline: '1 Oktober 2025',
                    roi: '1,914%'
                }
            };
            
            this.downloadJSON(exportData, 'rs-ben-mboi-presentation.json');
            this.showNotification('Presentasi berhasil di-export!');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error saat export presentasi', 'error');
        }
    }
    
    extractSlideData() {
        const slideData = [];
        
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            const title = slide.querySelector('.slide-title, .main-title')?.textContent || `Slide ${slideNumber}`;
            const content = this.extractSlideContent(slide);
            const notes = this.notes[slideNumber] || '';
            
            slideData.push({
                slideNumber,
                title: title.trim(),
                content,
                notes: notes.replace(/<[^>]*>/g, '').trim() // Strip HTML from notes
            });
        });
        
        return slideData;
    }
    
    extractSlideContent(slide) {
        const content = [];
        
        // Extract key text content, excluding notes
        const textElements = slide.querySelectorAll('h1, h2, h3, h4, p, li');
        textElements.forEach(element => {
            if (!element.closest('.slide-notes') && element.textContent.trim()) {
                content.push(element.textContent.trim());
            }
        });
        
        return content;
    }
    
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Print-specific functionality
    preparePrint() {
        try {
            // Add print-specific classes
            document.body.classList.add('printing');
            
            // Show all slides for printing
            this.slides.forEach(slide => {
                slide.style.display = 'block';
                slide.classList.add('active');
            });
            
            // Trigger print dialog
            setTimeout(() => {
                window.print();
                
                // Restore normal view after printing
                setTimeout(() => {
                    document.body.classList.remove('printing');
                    this.slides.forEach(slide => {
                        slide.classList.remove('active');
                        slide.style.display = '';
                    });
                    this.showSlide(this.currentSlide);
                }, 500);
            }, 100);
            
            this.showNotification('Dialog print dibuka');
        } catch (error) {
            console.error('Print error:', error);
            this.showNotification('Error saat membuka print dialog', 'error');
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const bgColor = type === 'error' ? 'var(--color-error)' : 'var(--color-success)';
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${bgColor};
            color: var(--color-btn-primary-text);
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Auto-advance functionality (for presentations)
    startAutoAdvance(intervalSeconds = 30) {
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalSeconds * 1000);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
    
    // Fullscreen functionality
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Global functions for HTML onclick handlers
function changeSlide(direction) {
    if (window.presentationApp) {
        if (direction > 0) {
            window.presentationApp.nextSlide();
        } else {
            window.presentationApp.prevSlide();
        }
    }
}

function goToSlide(slideNumber) {
    if (window.presentationApp) {
        window.presentationApp.goToSlide(slideNumber);
    }
}

function toggleNotes() {
    if (window.presentationApp) {
        window.presentationApp.toggleNotes();
    }
}

function exportPresentation() {
    if (window.presentationApp) {
        window.presentationApp.exportPresentation();
    }
}

function printPresentation() {
    if (window.presentationApp) {
        window.presentationApp.preparePrint();
    }
}

// Enhanced chart interaction
function enhanceCharts() {
    const chartImages = document.querySelectorAll('.chart-image');
    
    chartImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            openImageModal(this);
        });
        
        // Add accessibility
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Klik untuk memperbesar chart');
        
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openImageModal(this);
            }
        });
    });
}

function openImageModal(img) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const modalImg = document.createElement('img');
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    modal.appendChild(modalImg);
    document.body.appendChild(modal);
    
    // Close modal on click or escape
    modal.addEventListener('click', () => {
        if (modal.parentNode) {
            document.body.removeChild(modal);
        }
    });
    
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape' && modal.parentNode) {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Presentation timer
class PresentationTimer {
    constructor() {
        this.startTime = null;
        this.isRunning = false;
        this.display = null;
        this.createTimerDisplay();
    }
    
    createTimerDisplay() {
        this.display = document.createElement('div');
        this.display.className = 'presentation-timer';
        this.display.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 6px;
            padding: 8px 12px;
            font-family: var(--font-family-mono);
            font-size: 14px;
            color: var(--color-text);
            z-index: 100;
            box-shadow: var(--shadow-sm);
            display: none;
        `;
        this.display.textContent = '00:00:00';
        document.body.appendChild(this.display);
    }
    
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            this.isRunning = true;
            this.display.style.display = 'block';
            this.updateTimer();
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.display) {
            this.display.style.display = 'none';
        }
    }
    
    updateTimer() {
        if (this.isRunning && this.display) {
            const elapsed = Date.now() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            this.display.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            setTimeout(() => this.updateTimer(), 1000);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main presentation app
    window.presentationApp = new PresentationApp();
    
    // Initialize timer
    window.presentationTimer = new PresentationTimer();
    
    // Enhance charts
    enhanceCharts();
    
    // Add keyboard shortcuts help
    addKeyboardShortcutsHelp();
    
    // Handle initial slide from URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#slide-')) {
        const slideNumber = parseInt(hash.replace('#slide-', ''));
        if (slideNumber >= 1 && slideNumber <= window.presentationApp.totalSlides) {
            window.presentationApp.goToSlide(slideNumber);
        }
    }
    
    // Auto-start timer on first navigation
    let timerStarted = false;
    const startTimerOnce = function() {
        if (!timerStarted && window.presentationTimer) {
            window.presentationTimer.start();
            timerStarted = true;
        }
    };
    
    document.addEventListener('keydown', startTimerOnce);
    document.addEventListener('click', startTimerOnce);
    
    // Add print media query support
    if (window.matchMedia) {
        window.matchMedia('print').addEventListener('change', function(e) {
            if (e.matches) {
                // Printing started
                document.body.classList.add('printing');
            } else {
                // Printing ended
                document.body.classList.remove('printing');
                if (window.presentationApp) {
                    window.presentationApp.showSlide(window.presentationApp.currentSlide);
                }
            }
        });
    }
});

function addKeyboardShortcutsHelp() {
    // Add keyboard shortcuts info (toggle with ?)
    document.addEventListener('keydown', function(e) {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
}

function showKeyboardShortcuts() {
    const shortcuts = [
        '→ / Spasi: Slide berikutnya',
        '← : Slide sebelumnya', 
        'Home: Slide pertama',
        'End: Slide terakhir',
        'N: Toggle speaker notes',
        'Ctrl+P: Print presentasi',
        'Esc: Tutup panel/modal',
        '?: Tampilkan bantuan ini'
    ];
    
    const helpModal = document.createElement('div');
    helpModal.className = 'help-modal';
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const helpContent = document.createElement('div');
    helpContent.style.cssText = `
        background: var(--color-surface);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        cursor: default;
    `;
    helpContent.addEventListener('click', e => e.stopPropagation());
    
    const title = document.createElement('h3');
    title.textContent = 'Keyboard Shortcuts';
    title.style.cssText = `
        margin: 0 0 16px 0;
        color: var(--color-text);
        text-align: center;
    `;
    
    const shortcutsList = document.createElement('ul');
    shortcutsList.style.cssText = `
        list-style: none;
        padding: 0;
        margin: 0;
        color: var(--color-text-secondary);
    `;
    
    shortcuts.forEach(shortcut => {
        const li = document.createElement('li');
        li.textContent = shortcut;
        li.style.cssText = `
            padding: 6px 0;
            border-bottom: 1px solid var(--color-border);
            font-family: var(--font-family-mono);
            font-size: 14px;
        `;
        shortcutsList.appendChild(li);
    });
    
    helpContent.appendChild(title);
    helpContent.appendChild(shortcutsList);
    helpModal.appendChild(helpContent);
    document.body.appendChild(helpModal);
    
    // Close on click or escape
    helpModal.addEventListener('click', () => {
        if (helpModal.parentNode) {
            document.body.removeChild(helpModal);
        }
    });
    
    const closeHelp = function(e) {
        if (e.key === 'Escape' && helpModal.parentNode) {
            document.body.removeChild(helpModal);
            document.removeEventListener('keydown', closeHelp);
        }
    };
    
    document.addEventListener('keydown', closeHelp);
}