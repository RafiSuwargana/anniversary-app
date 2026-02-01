// Main Application
class AnniversaryApp {
    constructor() {
        this.data = null;
        this.scrollAnimations = null;
        this.isLoading = true;
        
        // SETTING: Set to true to skip password lock (for development/testing)
        this.skipPasswordLock = false; // Change to true to disable password
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Anniversary App starting...');
            
            // Check if password lock should be skipped
            if (this.skipPasswordLock) {
                console.log('Password lock skipped - going directly to main content');
                // Hide lock screen immediately
                const lockScreen = document.getElementById('lock-screen');
                const mainContent = document.getElementById('main-content');
                
                if (lockScreen && mainContent) {
                    lockScreen.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                }
                
                // Load and show content directly
                await this.loadData();
                this.renderContent();
                this.initScrollAnimations();
                this.addEventListeners();
                this.setupVideoEvents();
                
                // Brief loading screen then show content
                this.showLoading();
                setTimeout(() => {
                    this.hideLoading();
                }, 800);
                
            } else {
                // Initialize lock system first
                this.initializeLock();
                
                // Preload data but don't show content yet
                console.log('Loading data...');
                await this.loadData();
                console.log('Data loaded:', this.data);
                
                // Prepare content but keep hidden
                console.log('Preparing content...');
                this.renderContent();
                this.initScrollAnimations();
                this.addEventListeners();
                this.setupVideoEvents();
                
                // FORCE RESET quiz completion for testing - ensure sections start locked
                localStorage.removeItem('anniversary-quiz-completed');
                localStorage.removeItem('anniversary-puzzle-completed');
                console.log('=== FORCE RESET ALL QUIZ STATES ===');
                console.log('Quiz state after reset:', localStorage.getItem('anniversary-quiz-completed'));
                console.log('Puzzle state after reset:', localStorage.getItem('anniversary-puzzle-completed'));
                
                // Check if quiz was already completed and unlock sections if needed
                if (this.isQuizCompleted()) {
                    this.unlockNextSections();
                } else {
                    console.log('Quiz completion status:', this.isQuizCompleted());
                }
                
                console.log('App ready - waiting for unlock...');
            }
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError(error.message);
        }
    }
    
    showMainContent() {
        // Hide lock screen and show main content
        const lockScreen = document.getElementById('lock-screen');
        const mainContent = document.getElementById('main-content');
        
        if (lockScreen && mainContent) {
            lockScreen.style.transition = 'opacity 0.8s ease';
            lockScreen.style.opacity = '0';
            
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
                
                // Show loading briefly then hide
                this.showLoading();
                setTimeout(() => {
                    this.hideLoading();
                }, 1000);
            }, 800);
        }
    }
    
    showLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
            loadingElement.style.display = 'flex';
        }
    }
    
    initializeLock() {
        // Initialize PIN lock system
        window.correctPIN = '2110'; // Password 2110 (DDMM format)
        
        const pinBoxes = document.querySelectorAll('.pin-box');
        const pinMessage = document.getElementById('pin-message');
        
        pinBoxes.forEach((box, index) => {
            // Auto-focus first box
            if (index === 0) {
                box.focus();
            }
            
            // Input event
            box.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Only allow numbers
                if (!/^[0-9]$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Add filled class
                e.target.classList.add('filled');
                
                // Move to next box
                if (value && index < 3) {
                    pinBoxes[index + 1].focus();
                }
                
                // Check if all boxes filled
                if (index === 3 && value) {
                    this.checkPIN();
                }
            });
            
            // Backspace handling
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    pinBoxes[index - 1].focus();
                    pinBoxes[index - 1].value = '';
                    pinBoxes[index - 1].classList.remove('filled');
                }
            });
            
            // Paste handling
            box.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                
                pasteData.split('').forEach((digit, i) => {
                    if (pinBoxes[i]) {
                        pinBoxes[i].value = digit;
                        pinBoxes[i].classList.add('filled');
                    }
                });
                
                if (pasteData.length === 4) {
                    this.checkPIN();
                }
            });
        });
        
        console.log('PIN lock initialized');
    }
    
    checkPIN() {
        const pinBoxes = document.querySelectorAll('.pin-box');
        const pinMessage = document.getElementById('pin-message');
        const enteredPIN = Array.from(pinBoxes).map(box => box.value).join('');
        
        console.log('Checking PIN:', enteredPIN);
        
        if (enteredPIN === window.correctPIN) {
            // Success
            pinBoxes.forEach(box => {
                box.classList.remove('error');
                box.classList.add('success');
                box.disabled = true;
            });
            
            pinMessage.innerHTML = '<p class="success-text">✓ Perfect! You still remember</p>';
            
            // Show main content after delay
            setTimeout(() => {
                this.showMainContent();
            }, 1500);
            
        } else {
            // Error
            pinBoxes.forEach(box => {
                box.classList.add('error');
                setTimeout(() => {
                    box.classList.remove('error');
                    box.value = '';
                    box.classList.remove('filled');
                }, 500);
            });
            
            pinMessage.innerHTML = '<p class="error-text">✗ Incorrect PIN. Try again!</p><p class="hint">💡 Hint: DDMM format</p>';
            
            // Reset focus
            setTimeout(() => {
                pinBoxes[0].focus();
            }, 500);
        }
    }
    
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            setTimeout(() => {
                loadingElement.classList.add('hidden');
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                }, 500);
            }, 800); // Reduced delay for faster loading
        }
    }
    
    async loadData() {
        try {
            const response = await fetch('/api/anniversary-data');
            if (!response.ok) {
                throw new Error('Failed to load data');
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback data jika API tidak tersedia
            this.data = this.getFallbackData();
        }
    }
    
    getFallbackData() {
        return {
            title: "Happy Anniversary!",
            subtitle: "Celebrating 2 Years of Love and Memories",
            sections: [
                {
                    id: "intro",
                    title: "Second Year Recap",
                    content: "Looking back at our second year together, we've grown stronger as a couple and explored more delicious foods. This year has been filled with deeper understanding, love, and unforgettable moments.",
                    year: "",
                    image: "images/beginning.jpg"
                },
                {
                    id: "memories",
                    title: "Beautiful Memories",
                    content: "Through laughter, tears, and countless adventures, we've built a treasure chest of memories. Each moment has been a precious gem in our collection of shared experiences.",
                    year: "2021-2023",
                    image: "images/memories.jpg"
                },
                {
                    id: "milestones",
                    title: "Milestones",
                    content: "Every milestone we've crossed together has made our bond stronger. From first dates to moving in together, each step has brought us closer.",
                    year: "2024",
                    image: "images/milestones.jpg"
                },
                {
                    id: "future",
                    title: "Our Future",
                    content: "As we celebrate this anniversary, we look forward to many more years of love, laughter, and happiness together. Our story is just beginning.",
                    year: "2025+",
                    image: "images/future.jpg"
                },
                {
                    id: "puzzle",
                    title: "Complete Our Memory",
                    content: "Drag and drop the pieces to complete this photo.",
                    year: "",
                    image: "images/puzzle-photo.jpeg",
                    type: "puzzle"
                },
                {
                    id: "memory-cards",
                    title: "Memory Lane Matching",
                    content: "Tap two cards to find the matching pairs!<br>These are our random photos.",
                    year: "",
                    type: "cards",
                    cardPhotos: [
                        "images/card-photos/card1.jpeg",
                        "images/card-photos/card2.jpeg",
                        "images/card-photos/card3.jpeg",
                        "images/card-photos/card4.jpeg",
                        "images/card-photos/card5.jpeg",
                        "images/card-photos/card6.jpeg",
                        "images/card-photos/card7.jpeg",
                        "images/card-photos/card8.jpeg"
                    ]
                },
                {
                    id: "anniversary-video",
                    title: "Our Journey Together",
                    content: "A video compilation of our second year together.",
                    year: "🎬",
                    type: "video",
                    videoSrc: "videos/anniversary-video.mp4",
                    videoDuration: "0:38"
                }
            ]
        };
    }
    
    renderContent() {
        // Update title dan subtitle
        this.updateHeaderContent();
        
        // Render story sections
        this.renderStorySections();
        
        // Create navigation
        this.createNavigation();
        
        // Initialize puzzle if exists
        this.initializePuzzle();
        
        // Initialize card game if exists
        setTimeout(() => initializeCardGame(), 100);
        
        // Initialize bottle if exists
        this.initializeBottle();
    }
    
    createPapers(papers) {
        return papers.map((paper, index) => 
            `<div class="paper folded-paper" data-paper-id="${paper.id}" 
                  style="transform: rotate(${Math.random() * 40 - 20}deg) 
                         translate(${Math.random() * 60 - 30}px, ${Math.random() * 80 + index * 8}px) 
                         scale(${0.8 + Math.random() * 0.4}); 
                         z-index: ${papers.length - index}">
                <div class="paper-fold-corner"></div>
                <div class="paper-crease"></div>
                <div class="paper-shadow"></div>
            </div>`
        ).join('');
    }
    
    isPuzzleCompleted() {
        return localStorage.getItem('anniversary-puzzle-completed') === 'true';
    }
    
    isQuizCompleted() {
        // Force always return false for testing
        return false;
        
        // Original code commented out for testing
        // const value = localStorage.getItem('anniversary-quiz-completed');
        // const result = value === 'true'; // Only true if explicitly set to 'true'
        // console.log('isQuizCompleted check:', result, 'localStorage value:', value);
        // return result;
    }
    
    setQuizCompleted() {
        localStorage.setItem('anniversary-quiz-completed', 'true');
        // Unlock sections after puzzle
        this.unlockNextSections();
    }
    
    // For testing - function to reset quiz completion
    resetQuizCompletion() {
        localStorage.removeItem('anniversary-quiz-completed');
        console.log('Quiz completion reset');
        // Re-render sections to apply locks
        this.renderContent();
    }
    
    // For testing - function to manually clear quiz state and force lock
    forceResetQuiz() {
        localStorage.removeItem('anniversary-quiz-completed');
        localStorage.removeItem('anniversary-puzzle-completed');
        console.log('All quiz states reset - refreshing page...');
        window.location.reload();
    }
    
    unlockNextSections() {
        // Unlock all sections that come after the puzzle
        const puzzleIndex = this.data.sections.findIndex(s => s.type === 'puzzle');
        this.data.sections.forEach((section, index) => {
            if (index > puzzleIndex && section.type !== 'bottle') {
                const sectionElement = document.getElementById(section.id);
                if (sectionElement) {
                    sectionElement.classList.remove('locked-section');
                    const lockDiv = sectionElement.querySelector('.section-lock');
                    if (lockDiv) lockDiv.remove();
                }
            }
        });
    }
    
    setPuzzleCompleted() {
        localStorage.setItem('anniversary-puzzle-completed', 'true');
        // Unlock bottle section
        const bottleSection = document.getElementById('bottle');
        if (bottleSection) {
            bottleSection.classList.remove('locked-section');
            const lockDiv = bottleSection.querySelector('.section-lock');
            if (lockDiv) lockDiv.remove();
        }
    }
    
    initializeBottle() {
        window.currentApp = this; // Store globally for access
        if (this.isPuzzleCompleted()) {
            this.bindBottleEvents();
        }
    }
    
    bindBottleEvents() {
        const papers = document.querySelectorAll('.paper');
        const bottleSection = this.data.sections.find(s => s.type === 'bottle');
        
        papers.forEach(paper => {
            paper.addEventListener('click', (e) => {
                const paperId = parseInt(e.target.dataset.paperId);
                this.openPaper(paperId, bottleSection);
            });
        });
    }
    
    openPaper(paperId, bottleSection) {
        const paperData = bottleSection.papers.find(p => p.id === paperId);
        if (!paperData) return;
        
        this.currentPaper = paperData;
        
        const openedPaper = document.getElementById('opened-paper');
        const paperText = document.getElementById('paper-text');
        const paperPhoto = document.getElementById('paper-photo');
        
        // Show opened paper content
        paperText.textContent = paperData.content;
        paperPhoto.innerHTML = `<img src="${paperData.photo}" alt="${paperData.content}" class="memory-photo" 
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 150\"><rect width=\"200\" height=\"150\" fill=\"%23f0f0f0\"/><text x=\"100\" y=\"75\" text-anchor=\"middle\" fill=\"999\">📷</text></svg>'">`;
        
        openedPaper.classList.remove('hidden');
    }
    
    updateHeaderContent() {
        const titleElement = document.getElementById('main-title');
        const subtitleElement = document.getElementById('main-subtitle');
        
        if (titleElement) titleElement.textContent = this.data.title;
        if (subtitleElement) subtitleElement.textContent = this.data.subtitle;
    }
    
    renderStorySections() {
        const container = document.getElementById('story-sections');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.data.sections.forEach((section, index) => {
            const sectionElement = this.createSectionElement(section, index);
            container.appendChild(sectionElement);
        });
    }
    
    createSectionElement(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'story-section';
        sectionDiv.id = section.id;
        
        if (section.type === 'gallery') {
            sectionDiv.className = 'story-section gallery-section';
            sectionDiv.innerHTML = `
                <div class="gallery-content">
                    <div class="gallery-header">
                        <div class="gallery-year">${section.year}</div>
                        <h2 class="gallery-title">${section.title}</h2>
                        <h3 class="gallery-subtitle">${section.subtitle}</h3>
                        <p class="gallery-description">${section.content}</p>
                    </div>
                    <div class="photos-grid">
                        ${this.createPhotoGrid(section.photos)}
                    </div>
                </div>
            `;
        } else if (section.type === 'puzzle') {
            sectionDiv.innerHTML = `
                <div class="section-content puzzle-section">
                    <div class="section-text">
                        <div class="section-year">${section.year}</div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-description">${section.content}</p>
                        <div class="puzzle-controls">
                            <div class="quiz-section hidden" id="quiz-section">
                                <h4>Puzzle Complete! Now answer the question: 🤔</h4>
                                <div class="quiz-questions">
                                    <div class="quiz-item">
                                        <p><strong>Where was this photo taken?</strong></p>
                                        <input type="text" class="quiz-input" id="place-answer" placeholder="Enter place name..." data-answer="Dog Ministry">
                                        <div class="quiz-feedback" id="place-feedback"></div>
                                    </div>
                                    <div class="quiz-item">
                                        <p><strong>When was this taken?</strong></p>
                                        <div class="date-selector">
                                            <select class="quiz-select" id="day-select">
                                                <option value="">Day</option>
                                                ${Array.from({length: 31}, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                                            </select>
                                            <select class="quiz-select" id="month-select">
                                                <option value="">Month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                            <select class="quiz-select" id="year-select">
                                                <option value="">Year</option>
                                                ${Array.from({length: 4}, (_, i) => `<option value="${2023 + i}">${2023 + i}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="quiz-feedback" id="date-feedback"></div>
                                    </div>
                                    <button class="quiz-check-btn" onclick="checkQuizAnswers()">Check Answers</button>
                                    <div class="quiz-result" id="quiz-result"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="puzzle-container">
                        <div class="puzzle-board" id="puzzle-board">
                            <!-- Puzzle pieces will be generated here -->
                        </div>
                        <div class="puzzle-complete hidden" id="puzzle-complete">
                            <h3>🎉 Congratulations!</h3>
                            <p>You've completed our memory puzzle!</p>
                            <button class="continue-btn" onclick="showQuiz()">
                                Continue to Quiz
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (section.type === 'cards') {
            // Lock sections that come after puzzle until quiz is completed
            const puzzleIndex = this.data.sections.findIndex(s => s.type === 'puzzle');
            const currentIndex = this.data.sections.findIndex(s => s.id === section.id);
            const isLocked = currentIndex > puzzleIndex && !this.isQuizCompleted();
            
            // Debug logging
            console.log('Cards section debug:', {
                sectionId: section.id,
                puzzleIndex,
                currentIndex,
                isQuizCompleted: this.isQuizCompleted(),
                isLocked
            });
            
            sectionDiv.className += isLocked ? ' locked-section' : '';
            console.log('Applied CSS classes to cards section:', sectionDiv.className);
            
            sectionDiv.innerHTML = `
                <div class="section-content cards-section">
                    <div class="section-text">
                        <div class="section-year">${section.year}</div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-description">${section.content}</p>
                        <div class="cards-controls">
                            <div class="cards-info">
                                <span id="pairs-found">0</span>/8 pairs found
                            </div>
                        </div>
                    </div>
                    <div class="cards-game-area">
                        <div class="cards-grid" id="cards-grid">
                            <!-- Cards will be generated here -->
                        </div>
                        <div class="cards-complete hidden" id="cards-complete">
                            <h3>🎉 Amazing!</h3>
                            <p>You found all the matching pairs!</p>
                        </div>
                    </div>
                </div>
                ${isLocked ? '<div class="section-lock"><p>🔒 Complete the quest to unlock</p></div>' : ''}
            `;
        } else if (section.type === 'video') {
            // Lock sections that come after puzzle until quiz is completed
            const puzzleIndex = this.data.sections.findIndex(s => s.type === 'puzzle');
            const currentIndex = this.data.sections.findIndex(s => s.id === section.id);
            const isLocked = currentIndex > puzzleIndex && !this.isQuizCompleted();
            sectionDiv.className += isLocked ? ' locked-section' : '';
            
            sectionDiv.innerHTML = `
                <div class="section-content video-section">
                    <div class="section-text">
                        <div class="section-year">${section.year}</div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-description">${section.content}</p>
                    </div>
                    <div class="video-player-container">
                        <video class="anniversary-video" controls preload="metadata" poster="">
                            <source src="${section.videoSrc}" type="video/mp4">
                            <p>Your browser doesn't support video playback. Please update your browser.</p>
                        </video>
                        <div class="video-overlay hidden" id="video-overlay">
                            <div class="play-button" onclick="playVideo()">
                                <div class="play-icon">▶</div>
                                <span>Play Video</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${isLocked ? '<div class="section-lock"><p>🔒 Complete the quest to unlock</p></div>' : ''}
            `;
        } else if (section.type === 'bottle') {
            const isLocked = !this.isPuzzleCompleted();
            sectionDiv.className += isLocked ? ' locked-section' : '';
            sectionDiv.innerHTML = `
                <div class="section-content bottle-section">
                    <div class="section-text">
                        <div class="section-year">${section.year}</div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-description">${section.content}</p>
                        <div class="bottle-controls">
                            <button class="shake-btn" onclick="window.shakeBottle()">🔄 Shake Bottle</button>
                            <div class="collection-progress">
                                <span id="papers-collected">0</span>/${section.papers.length} papers collected
                            </div>
                        </div>
                    </div>
                    <div class="bottle-game-area">
                        <div class="bottle-container">
                            <div class="bottle-wrapper">
                                <div class="bottle">
                                    <div class="bottle-neck">
                                        <div class="bottle-cork"></div>
                                    </div>
                                    <div class="bottle-body">
                                        <div class="bottle-label">Our Memories</div>
                                        <div class="papers-stack" id="papers-stack">
                                            ${this.createPapers(section.papers)}
                                        </div>
                                        <div class="bottle-shine"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="collection-box">
                            <div class="box-header">Collected Papers</div>
                            <div class="box-content" id="collection-box">
                                <div class="box-placeholder">Drop papers here...</div>
                            </div>
                        </div>
                        <div class="opened-paper hidden" id="opened-paper">
                            <div class="paper-content">
                                <div class="paper-text" id="paper-text"></div>
                                <div class="paper-photo" id="paper-photo"></div>
                                <div class="paper-actions">
                                    <button class="collect-btn" onclick="window.collectPaper()">Collect This Paper</button>
                                    <button class="close-paper-btn" onclick="window.closePaper()">Close</button>
                                </div>
                            </div>
                        </div>
                        ${isLocked ? '<div class="section-lock"><p>🔒 Complete the puzzle first to unlock this section</p></div>' : ''}
                    </div>
                </div>
            `;
        } else {
            // Lock sections that come after puzzle until quiz is completed
            const puzzleIndex = this.data.sections.findIndex(s => s.type === 'puzzle');
            const currentIndex = this.data.sections.findIndex(s => s.id === section.id);
            const isLocked = currentIndex > puzzleIndex && !this.isQuizCompleted();
            sectionDiv.className += isLocked ? ' locked-section' : '';
            
            sectionDiv.innerHTML = `
                <div class="section-content">
                    <div class="section-text">
                        <div class="section-year">${section.year}</div>
                        <h2 class="section-title">${section.title}</h2>
                        <p class="section-description">${section.content}</p>
                    </div>
                    <div class="section-image">
                        ${this.createImageElement(section.image, section.title)}
                    </div>
                </div>
                ${isLocked ? '<div class="section-lock"><p>🔒 Complete the quest to unlock</p></div>' : ''}
            `;
        }
        
        return sectionDiv;
    }
    
    createImageElement(imageSrc, altText) {
        return `<div class="image-container">
                    <img src="${imageSrc}" alt="${altText}" class="section-img" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         onload="this.nextElementSibling.style.display='none';">
                    <div class="image-placeholder" style="display: none;">
                        📷 ${altText}<br>
                        <small>Tambahkan foto '${imageSrc.split('/').pop()}' ke folder images/</small>
                    </div>
                </div>`;
    }

    // Resolve photo source for gallery items. If explicit image path provided, use it.
    // Otherwise try common masked filenames inside images/journey-photos/ directory.
    resolvePhotoSrc(photo) {
        if (!photo) return '';

        // If photo.image already specified, prefer it
        if (photo.image && photo.image.trim() !== '') return photo.image;

        const month = (photo.month || photo.name || '').toString().trim();
        if (!month) return '';

        // Extract month name from strings like "February 2025" -> "february"
        const monthName = month.toLowerCase().replace(/\s+\d{4}/, '').trim();
        
        // Try common masked filenames directly in journey-photos folder
        const base = 'images/journey-photos';
        const candidates = [
            `${base}/${monthName}.jpg`,
            `${base}/${monthName}.jpeg`,
            `${base}/${monthName}.png`,
            `${base}/masked_${monthName}.jpg`,
            `${base}/mask_${monthName}.jpg`,
            `${base}/${month.toLowerCase().replace(/\s+/g, '_')}.jpg`
        ];

        // Return first candidate; browser onerror will handle non-existent files
        return candidates[0];
    }

    createPhotoGrid(photos) {
        return photos.map((photo, index) => {
            const src = this.resolvePhotoSrc(photo) || (photo.image || '');
            const filename = src ? src.split('/').pop() : '';
            return `
            <div class="photo-item clickable-photo" data-index="${index}">
                <img src="${src}" alt="${photo.month || ''}" class="blurred-photo" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.nextElementSibling.style.display='none';">
                <div class="photo-placeholder" style="display: none;">
                    📷 ${photo.month || ''}<br>
                    <small>Tambahkan '${filename || 'file'}' di folder images/journey-photos/</small>
                </div>
                <div class="photo-overlay">
                    <div class="photo-month">${photo.month || ''}</div>
                    <div class="click-hint">🔍 Click to reveal</div>
                </div>
            </div>
        `}).join('');
    }
    
    createNavigation() {
        const navContainer = document.getElementById('nav-dots');
        if (!navContainer) return;
        
        navContainer.innerHTML = '';
        
        this.data.sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.title = section.title;
            dot.addEventListener('click', () => {
                this.scrollAnimations.scrollToSection(index);
            });
            navContainer.appendChild(dot);
        });
    }
    
    initScrollAnimations() {
        this.scrollAnimations = new ScrollAnimations();
        this.scrollAnimations.initParallax();
        this.scrollAnimations.addFloatingAnimation();
        
        // Add particles to story sections after they are rendered
        setTimeout(() => {
            if (this.scrollAnimations.addParticlesToStorySections) {
                this.scrollAnimations.addParticlesToStorySections();
            }
        }, 500);
    }
    
    addEventListeners() {
        // Scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const firstSection = document.querySelector('.story-section');
                if (firstSection) {
                    firstSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Mouse hover images effect
        this.initMouseHoverEffect();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.scrollToNextSection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.scrollToPrevSection();
            }
        });
        
        // Touch/swipe support untuk mobile
        this.addTouchSupport();
    }
    
    scrollToNextSection() {
        const sections = document.querySelectorAll('.story-section');
        const scrollTop = window.pageYOffset;
        
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i].getBoundingClientRect();
            if (rect.top > 100) {
                sections[i].scrollIntoView({ behavior: 'smooth' });
                break;
            }
        }
    }
    
    scrollToPrevSection() {
        const sections = Array.from(document.querySelectorAll('.story-section')).reverse();
        const scrollTop = window.pageYOffset;
        
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i].getBoundingClientRect();
            if (rect.bottom < window.innerHeight - 100) {
                sections[i].scrollIntoView({ behavior: 'smooth' });
                break;
            }
        }
    }
    
    addTouchSupport() {
        let startY = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    // Swipe up - next section
                    this.scrollToNextSection();
                } else {
                    // Swipe down - previous section
                    this.scrollToPrevSection();
                }
            }
        });
    }
    
    setupVideoEvents() {
        // Setup video controls and events
        setTimeout(() => {
            setupVideoEvents();
        }, 1000); // Delay to ensure videos are rendered
    }
    
    initMouseHoverEffect() {
        const hoverContainer = document.querySelector('.hover-images-container');
        if (!hoverContainer) {
            console.log('Hover container not found');
            return;
        }
        
        console.log('Initializing mouse hover effect...');
        
        // Array of photo filenames (will be checked dynamically)
        const photoFiles = [
            'foto1.jpg', 'foto2.jpg', 'foto3.jpg', 'foto4.jpg', 'foto5.jpg',
            'foto6.jpg', 'foto7.jpg', 'foto8.jpg', 'foto9.jpg', 'foto10.jpg',
            'foto1.jpeg', 'foto2.jpeg', 'foto3.jpeg', 'foto4.jpeg', 'foto5.jpeg',
            'foto6.jpeg', 'foto7.jpeg', 'foto8.jpeg', 'foto9.jpeg', 'foto10.jpeg',
            'foto1.png', 'foto2.png', 'foto3.png', 'foto4.png', 'foto5.png',
            'foto6.png', 'foto7.png', 'foto8.png', 'foto9.png', 'foto10.png',
            'foto1.svg', 'foto2.svg', 'foto3.svg', 'foto4.svg', 'foto5.svg'
        ];
        const loveEmojis = ['💕', '💖', '✨', '🌸', '💝', '🦋', '🌺', '💫', '🎀', '💍'];
        let activeBubbles = []; // Track active bubble positions
        
        // Function to check if position is too close to existing bubbles
        function isTooClose(x, y, minDistance = 100) {
            return activeBubbles.some(bubble => {
                const distance = Math.sqrt(Math.pow(bubble.x - x, 2) + Math.pow(bubble.y - y, 2));
                return distance < minDistance;
            });
        }
        
        document.addEventListener('mousemove', (e) => {
            // Check if position is too close to existing bubbles
            if (isTooClose(e.clientX, e.clientY)) {
                return; // Skip creating bubble if too close
            }
            
            // Create hover image
            const hoverImage = document.createElement('div');
            hoverImage.className = 'hover-image';
            
            // Use only photos (no fallback to emoji)
            const randomPhoto = photoFiles[Math.floor(Math.random() * photoFiles.length)];
            const img = document.createElement('img');
            img.src = `images/hover-photos/${randomPhoto}`;
            
            // Position at mouse location
            const bubbleX = e.clientX - 40;
            const bubbleY = e.clientY - 40;
            hoverImage.style.left = bubbleX + 'px';
            hoverImage.style.top = bubbleY + 'px';
            
            // Add to active bubbles tracking
            const bubbleData = { x: e.clientX, y: e.clientY, element: hoverImage };
            activeBubbles.push(bubbleData);
            
            // Only show if photo loads successfully
            img.onload = () => {
                console.log(`Loaded photo: ${randomPhoto}`);
                hoverContainer.appendChild(hoverImage);
                
                // Remove after animation and clean up tracking
                setTimeout(() => {
                    if (hoverImage.parentNode) {
                        hoverImage.parentNode.removeChild(hoverImage);
                    }
                    // Remove from active bubbles tracking
                    activeBubbles = activeBubbles.filter(bubble => bubble.element !== hoverImage);
                }, 2000);
            };
            
            // Don't show anything if photo fails to load
            img.onerror = () => {
                console.log(`Failed to load photo: ${randomPhoto}`);
                // Remove from active bubbles tracking if failed
                activeBubbles = activeBubbles.filter(bubble => bubble.element !== hoverImage);
            };
            
            hoverImage.appendChild(img);
        });
        
        // Hide hint after user starts moving mouse
        let hintHidden = false;
        document.addEventListener('mousemove', () => {
            if (!hintHidden) {
                const hint = document.querySelector('.mouse-hover-hint');
                if (hint) {
                    setTimeout(() => {
                        hint.style.opacity = '0.3';
                        hint.style.transform = 'scale(0.9)';
                    }, 3000);
                    hintHidden = true;
                }
            }
        });
    }
    
    initializePuzzle() {
        const puzzleBoard = document.getElementById('puzzle-board');
        if (!puzzleBoard) {
            console.log('Puzzle board not found, skipping puzzle initialization');
            return;
        }
        
        console.log('Initializing puzzle...');
        this.puzzleSize = 4; // 4x4 grid
        this.puzzlePieces = [];
        this.correctOrder = [];
        this.startTime = null;
        this.timerInterval = null;
        
        try {
            this.createPuzzlePieces();
            this.shufflePuzzle();
            this.bindPuzzleEvents();
            console.log('Puzzle initialized successfully');
        } catch (error) {
            console.error('Error initializing puzzle:', error);
        }
    }
    
    createPuzzlePieces() {
        const board = document.getElementById('puzzle-board');
        const pieceSize = 100; // Size in pixels
        
        // Get puzzle image from data
        const puzzleSection = this.data.sections.find(s => s.type === 'puzzle');
        const puzzleImageSrc = puzzleSection ? puzzleSection.image : 'images/puzzle-photo.jpeg';
        
        // Create puzzle pieces
        for (let row = 0; row < this.puzzleSize; row++) {
            for (let col = 0; col < this.puzzleSize; col++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.row = row;
                piece.dataset.col = col;
                piece.dataset.correctPos = row * this.puzzleSize + col;
                
                // Calculate background position for image
                const bgPosX = (col * pieceSize);
                const bgPosY = (row * pieceSize);
                
                // Try to use actual photo first, fallback to pattern if not found
                const img = new Image();
                img.onload = () => {
                    piece.style.backgroundImage = `url('${puzzleImageSrc}')`;
                    piece.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                    piece.style.backgroundSize = `${pieceSize * this.puzzleSize}px ${pieceSize * this.puzzleSize}px`;
                };
                img.onerror = () => {
                    // Fallback to pattern if image not found
                    piece.style.backgroundImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f0f8ff"/><circle cx="100" cy="100" r="30" fill="%23ff69b4" opacity="0.7"/><circle cx="300" cy="100" r="25" fill="%2387ceeb" opacity="0.7"/><circle cx="200" cy="200" r="40" fill="%23ffd700" opacity="0.7"/><circle cx="100" cy="300" r="20" fill="%2398fb98" opacity="0.7"/><circle cx="300" cy="300" r="35" fill="%23dda0dd" opacity="0.7"/><text x="200" y="220" text-anchor="middle" font-size="24" fill="%23333">💝</text></svg>')`;
                    piece.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
                    piece.style.backgroundSize = `${pieceSize * this.puzzleSize}px ${pieceSize * this.puzzleSize}px`;
                    piece.title = `Add '${puzzleImageSrc}' to images folder`;
                };
                img.src = puzzleImageSrc;
                
                piece.draggable = true;
                piece.addEventListener('dragstart', this.handleDragStart.bind(this));
                piece.addEventListener('dragover', this.handleDragOver.bind(this));
                piece.addEventListener('drop', this.handleDrop.bind(this));
                
                board.appendChild(piece);
                this.puzzlePieces.push(piece);
                this.correctOrder.push(piece);
            }
        }
    }
    
    shufflePuzzle() {
        const pieces = [...this.puzzlePieces];
        const board = document.getElementById('puzzle-board');
        
        // Fisher-Yates shuffle
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        // Re-append in shuffled order
        pieces.forEach(piece => board.appendChild(piece));
    }
    
    bindPuzzleEvents() {
        // Removed shuffle and hint buttons, keeping puzzle interactive
        // Puzzle pieces can still be dragged and dropped
    }
    
    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.correctPos);
        e.target.classList.add('dragging');
        
        if (!this.startTime) {
            this.startTimer();
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
    }
    
    handleDrop(e) {
        e.preventDefault();
        const draggedPos = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector(`[data-correct-pos="${draggedPos}"]`);
        const dropTarget = e.target;
        
        if (draggedElement && dropTarget.classList.contains('puzzle-piece')) {
            // Swap positions
            const parent = draggedElement.parentNode;
            const draggedNext = draggedElement.nextSibling;
            const dropNext = dropTarget.nextSibling;
            
            parent.insertBefore(draggedElement, dropNext);
            parent.insertBefore(dropTarget, draggedNext);
        }
        
        draggedElement?.classList.remove('dragging');
        this.checkPuzzleComplete();
    }
    
    checkPuzzleComplete() {
        const board = document.getElementById('puzzle-board');
        const pieces = Array.from(board.children);
        
        const isComplete = pieces.every((piece, index) => {
            return parseInt(piece.dataset.correctPos) === index;
        });
        
        if (isComplete) {
            this.completePuzzle();
        }
    }
    
    completePuzzle() {
        clearInterval(this.timerInterval);
        const completeDiv = document.getElementById('puzzle-complete');
        if (completeDiv) {
            completeDiv.classList.remove('hidden');
        }
        
        // Add celebration animation
        const board = document.getElementById('puzzle-board');
        if (board) {
            board.classList.add('puzzle-solved');
        }
        
        // Mark puzzle as completed and unlock next section
        this.setPuzzleCompleted();
    }
    
    startTimer() {
        if (this.timerInterval) return;
        
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    showHint() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            piece.classList.add('show-hint');
        });
        
        setTimeout(() => {
            pieces.forEach(piece => {
                piece.classList.remove('show-hint');
            });
        }, 2000);
    }
    
    showError(message = 'Something went wrong') {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="error-content">
                    <h2>Sorry, something went wrong</h2>
                    <p>${message}</p>
                    <p>Please refresh the page to try again</p>
                    <button onclick="window.location.reload()" style="
                        padding: 10px 20px;
                        background: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Refresh Page</button>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    
    // Failsafe: Hide loading after maximum 5 seconds
    setTimeout(() => {
        const loadingElement = document.getElementById('loading');
        if (loadingElement && !loadingElement.classList.contains('hidden')) {
            console.warn('Forcing loading screen to hide after timeout');
            loadingElement.classList.add('hidden');
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }, 5000);
    
    new AnniversaryApp();
});

// Add some utility functions
window.utils = {
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if device is mobile
    isMobile: () => {
        return window.innerWidth <= 768;
    },
    
    // Initialize mouse hover effect
    initMouseHoverEffect() {
        const hoverContainer = document.querySelector('.hover-images-container');
        if (!hoverContainer) return;
        
        const loveEmojis = ['💕', '💖', '✨', '🌸', '💝', '🦋', '🌺', '💫', '🎀', '💍'];
        let throttleTimer = false;
        
        document.addEventListener('mousemove', (e) => {
            if (throttleTimer) return;
            
            throttleTimer = true;
            setTimeout(() => {
                throttleTimer = false;
            }, 150);
            
            // Create hover image
            const hoverImage = document.createElement('div');
            hoverImage.className = 'hover-image';
            hoverImage.textContent = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
            
            // Position at mouse location
            hoverImage.style.left = (e.clientX - 30) + 'px';
            hoverImage.style.top = (e.clientY - 30) + 'px';
            
            hoverContainer.appendChild(hoverImage);
            
            // Remove after animation
            setTimeout(() => {
                if (hoverImage.parentNode) {
                    hoverImage.parentNode.removeChild(hoverImage);
                }
            }, 2000);
        });
        
        // Hide hint after user starts moving mouse
        let hintHidden = false;
        document.addEventListener('mousemove', () => {
            if (!hintHidden) {
                const hint = document.querySelector('.mouse-hover-hint');
                if (hint) {
                    setTimeout(() => {
                        hint.style.opacity = '0.3';
                        hint.style.transform = 'scale(0.9)';
                    }, 3000);
                    hintHidden = true;
                }
            }
        });
    }
};

// Global function to scroll to bottle section
window.scrollToBottle = () => {
    const bottleSection = document.getElementById('bottle');
    if (bottleSection) {
        bottleSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Global function to shake bottle
window.shakeBottle = () => {
    const papers = document.querySelectorAll('.paper');
    const stack = document.getElementById('papers-stack');
    
    stack.classList.add('shaking');
    
    papers.forEach((paper, index) => {
        setTimeout(() => {
            const newRotation = Math.random() * 40 - 20;
            const newX = Math.random() * 60 - 30;
            const newY = Math.random() * 80 + index * 8;
            const newScale = 0.8 + Math.random() * 0.4;
            
            paper.style.transform = `rotate(${newRotation}deg) translate(${newX}px, ${newY}px) scale(${newScale})`;
        }, index * 50);
    });
    
    setTimeout(() => {
        stack.classList.remove('shaking');
    }, 1000);
};
// Global lock functions
window.rotateDial = (dialIndex) => {
    const dial = document.querySelector(`[data-dial="${dialIndex}"]`);
    const dialNumbers = dial.querySelector('.dial-numbers');
    
    // Increment the number (0-9, then back to 0)
    window.currentCombination[dialIndex] = (window.currentCombination[dialIndex] + 1) % 10;
    
    // Update visual position with correct calculation
    // Move up by the current number * span height
    const spanHeight = 80; // Height of each number span
    const currentOffset = -(window.currentCombination[dialIndex] * spanHeight);
    dialNumbers.style.transform = `translateY(${currentOffset}px)`;
    
    // Update display
    window.updateCodeDisplay();
    
    // Add click effect
    dial.style.transform = 'scale(0.95)';
    setTimeout(() => {
        dial.style.transform = '';
    }, 150);
    
    // Debug log
    console.log('Dial', dialIndex, 'rotated to:', window.currentCombination[dialIndex]);
    console.log('Current combination:', window.currentCombination.join(''));
    console.log('Transform applied:', `translateY(${currentOffset}px)`);
    
    // Auto-check if combination is correct
    setTimeout(() => {
        window.checkAndAutoUnlock();
    }, 200);
};

window.checkAndAutoUnlock = () => {
    // Check if combination is correct
    const isCorrect = window.currentCombination.length === 4 && 
                     window.correctCombination.length === 4 &&
                     window.currentCombination[0] === window.correctCombination[0] &&
                     window.currentCombination[1] === window.correctCombination[1] &&
                     window.currentCombination[2] === window.correctCombination[2] &&
                     window.currentCombination[3] === window.correctCombination[3];
    
    if (isCorrect) {
        console.log('AUTO-UNLOCK: Combination correct!');
        window.autoUnlock();
    }
};

window.autoUnlock = () => {
    console.log('=== AUTO UNLOCK ===');
    console.log('Current:', window.currentCombination);
    console.log('Target:', window.correctCombination);
    
    const unlockMessage = document.querySelector('.unlock-message');
    const messageText = unlockMessage.querySelector('p');
    const lockBody = document.querySelector('.lock-body');
    
    // Clear any previous states
    unlockMessage.classList.remove('success', 'error');
    
    // Success!
    console.log('SUCCESS: Auto-unlocking...');
    lockBody.classList.remove('locked');
    lockBody.classList.add('unlocked');
    unlockMessage.classList.add('success');
    messageText.textContent = 'Perfect! you still remember';
    
    // Disable all dials to prevent further changes
    const dials = document.querySelectorAll('.dial');
    dials.forEach(dial => {
        dial.style.pointerEvents = 'none';
        dial.style.opacity = '0.6';
        dial.style.cursor = 'default';
    });
    
    // Hide loading after success animation
    setTimeout(() => {
        if (window.currentApp) {
            window.currentApp.showMainContent();
        }
    }, 2000);
    
    // Reset success state
    setTimeout(() => {
        unlockMessage.classList.remove('success');
    }, 3000);
};

window.updateCodeDisplay = () => {
    const display = document.getElementById('code-display');
    if (display) {
        display.textContent = window.currentCombination.join('');
    }
};

window.tryUnlock = () => {
    console.log('=== UNLOCK ATTEMPT ===');
    console.log('Current:', window.currentCombination);
    console.log('Target:', window.correctCombination);
    
    // More strict validation
    const isCorrect = window.currentCombination.length === 4 && 
                     window.correctCombination.length === 4 &&
                     window.currentCombination[0] === window.correctCombination[0] &&
                     window.currentCombination[1] === window.correctCombination[1] &&
                     window.currentCombination[2] === window.correctCombination[2] &&
                     window.currentCombination[3] === window.correctCombination[3];
    
    console.log('Is correct?', isCorrect);
    console.log('Individual checks:', 
        window.currentCombination[0] === window.correctCombination[0],
        window.currentCombination[1] === window.correctCombination[1],
        window.currentCombination[2] === window.correctCombination[2],
        window.currentCombination[3] === window.correctCombination[3]
    );
    
    const unlockMessage = document.querySelector('.unlock-message');
    const messageText = unlockMessage.querySelector('p');
    const lockBody = document.querySelector('.lock-body');
    
    // Clear any previous states
    unlockMessage.classList.remove('success', 'error');
    
    if (isCorrect) {
        // Success!
        console.log('SUCCESS: Unlocking...');
        lockBody.classList.remove('locked');
        lockBody.classList.add('unlocked');
        unlockMessage.classList.add('success');
        messageText.textContent = '💕 Perfect! Love unlocked! ✨';
        
        // Hide loading after success animation
        setTimeout(() => {
            if (window.currentApp) {
                window.currentApp.showMainContent();
            }
        }, 2000);
        
    } else {
        // Wrong combination
        console.log('WRONG: Combination incorrect');
        // Make sure it stays locked
        lockBody.classList.remove('unlocked');
        lockBody.classList.add('locked');
        unlockMessage.classList.add('error');
        messageText.textContent = '❌ Wrong combination! Try again...';
        
        // Reset error state after animation
        setTimeout(() => {
            unlockMessage.classList.remove('error');
            messageText.textContent = 'Click each dial to set the combination';
        }, 2000);
    }
    
    // Reset success state
    setTimeout(() => {
        unlockMessage.classList.remove('success');
    }, 3000);
};
// Global function to collect paper
window.collectPaper = () => {
    if (!window.currentApp || !window.currentApp.currentPaper) return;
    
    const paperData = window.currentApp.currentPaper;
    const collectionBox = document.getElementById('collection-box');
    const placeholder = collectionBox.querySelector('.box-placeholder');
    
    // Remove placeholder if this is first paper
    if (placeholder) {
        placeholder.remove();
    }
    
    // Add paper to collection
    const collectedPaper = document.createElement('div');
    collectedPaper.className = 'collected-paper';
    collectedPaper.innerHTML = `
        <div class="mini-photo">
            <img src="${paperData.photo}" alt="${paperData.content}" 
                 onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 45\"><rect width=\"60\" height=\"45\" fill=\"%23f0f0f0\"/><text x=\"30\" y=\"25\" text-anchor=\"middle\" fill=\"999\" font-size=\"12\">📷</text></svg>'">
        </div>
        <div class="mini-text">${paperData.content}</div>
    `;
    
    collectionBox.appendChild(collectedPaper);
    
    // Remove from bottle
    const paperElement = document.querySelector(`[data-paper-id="${paperData.id}"]`);
    if (paperElement) {
        paperElement.style.animation = 'paperCollect 0.5s ease-out forwards';
        setTimeout(() => paperElement.remove(), 500);
    }
    
    // Update progress
    const collected = collectionBox.querySelectorAll('.collected-paper').length;
    document.getElementById('papers-collected').textContent = collected;
    
    // Close paper view
    window.closePaper();
    
    // Check if all papers collected
    const total = 6; // Total papers
    if (collected >= total) {
        setTimeout(() => {
            alert('🎉 Congratulations! You\'ve collected all our precious memories!');
        }, 500);
    }
};

// Global function to close paper
window.closePaper = () => {
    const openedPaper = document.getElementById('opened-paper');
    if (openedPaper) {
        openedPaper.classList.add('hidden');
    }
    if (window.currentApp) {
        window.currentApp.currentPaper = null;
    }
};

// Quiz functionality
function showQuiz() {
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
        quizSection.classList.remove('hidden');
        // Prevent scrolling when quiz is shown
        document.body.style.overflow = 'hidden';
    }
}

function hideQuiz() {
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
        // Add hidden class for smooth transition
        quizSection.classList.add('hidden');
        // Re-enable scrolling after transition
        setTimeout(() => {
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function checkQuizAnswers() {
    const placeInput = document.getElementById('place-answer');
    const dateInput = document.getElementById('date-answer');
    const placeFeedback = document.getElementById('place-feedback');
    const dateFeedback = document.getElementById('date-feedback');
    const quizResult = document.getElementById('quiz-result');
    
    let correctAnswers = 0;
    
    // Check place answer
    const placeAnswer = placeInput.value.trim().toLowerCase();
    const correctPlace = placeInput.dataset.answer.toLowerCase();
    
    if (placeAnswer === correctPlace.toLowerCase()) {
        placeFeedback.innerHTML = '';
        placeFeedback.className = '';
        placeInput.className = 'quiz-input success';
        correctAnswers++;
    } else {
        placeFeedback.innerHTML = '❌ Try again!';
        placeFeedback.className = 'quiz-feedback error';
        placeInput.className = 'quiz-input error';
    }
    
    // Check date answer
    const daySelect = document.getElementById('day-select');
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    const selectedDay = daySelect.value;
    const selectedMonth = monthSelect.value;
    const selectedYear = yearSelect.value;
    
    if (selectedDay && selectedMonth && selectedYear) {
        const selectedDate = `${selectedDay} ${selectedMonth} ${selectedYear}`;
        const correctDate = "22 January 2024";
        
        if (selectedDate === correctDate) {
            dateFeedback.innerHTML = '';
            dateFeedback.className = '';
            daySelect.className = 'quiz-select success';
            monthSelect.className = 'quiz-select success';
            yearSelect.className = 'quiz-select success';
            correctAnswers++;
        } else {
            dateFeedback.innerHTML = '❌ Try again!';
            dateFeedback.className = 'quiz-feedback error';
            daySelect.className = 'quiz-select error';
            monthSelect.className = 'quiz-select error';
            yearSelect.className = 'quiz-select error';
        }
    } else {
        dateFeedback.innerHTML = '⚠️ Please select day, month, and year!';
        dateFeedback.className = 'quiz-feedback error';
        daySelect.className = 'quiz-select error';
        monthSelect.className = 'quiz-select error';
        yearSelect.className = 'quiz-select error';
    }
    
    // Show overall result only if both are correct
    if (correctAnswers === 2) {
        quizResult.innerHTML = '🎉 Perfect! You got both answers right!';
        quizResult.className = 'quiz-result success';
        
        // Mark quiz as completed and unlock next sections
        if (window.currentApp) {
            window.currentApp.setQuizCompleted();
        }
        
        // Hide quiz after 3 seconds and also hide the puzzle completion card
        setTimeout(() => {
            hideQuiz();
            // Also hide the puzzle completion congratulations card
            const puzzleComplete = document.getElementById('puzzle-complete');
            if (puzzleComplete) {
                puzzleComplete.classList.add('hidden');
            }
        }, 3000);
    } else {
        quizResult.innerHTML = '';
        quizResult.className = '';
    }
}

// Card Game Variables and Functions
let cardGameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    flippedCount: 0,
    isChecking: false
};

// Initialize Card Game
function initializeCardGame() {
    const app = window.currentApp;
    if (!app || !app.data) return;
    
    const cardsSection = app.data.sections.find(s => s.type === 'cards');
    if (!cardsSection) return;
    
    generateCards(cardsSection.cardPhotos);
}

// Generate Cards
function generateCards(photos) {
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return;
    
    // Create pairs (each photo appears twice)
    const cardPairs = [...photos, ...photos];
    
    // Shuffle cards
    cardGameState.cards = shuffleArray(cardPairs).map((photo, index) => ({
        id: index,
        photo: photo,
        isFlipped: false,
        isMatched: false
    }));
    
    // Generate HTML
    cardsGrid.innerHTML = cardGameState.cards.map(card => `
        <div class="memory-card" data-card-id="${card.id}" onclick="flipCard(${card.id})">
            <div class="card-inner">
                <div class="card-back card-face">
                    ❓
                </div>
                <div class="card-front card-face">
                    <img src="${card.photo}" alt="Memory" onerror="this.style.display='none'; this.parentElement.innerHTML='📷';">
                </div>
            </div>
        </div>
    `).join('');
    
    updateCardStats();
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Flip Card
function flipCard(cardId) {
    if (cardGameState.isChecking || 
        cardGameState.flippedCards.length >= 2 ||
        cardGameState.cards[cardId].isFlipped ||
        cardGameState.cards[cardId].isMatched) {
        return;
    }
    
    // Flip the card
    cardGameState.cards[cardId].isFlipped = true;
    cardGameState.flippedCards.push(cardId);
    cardGameState.flippedCount++;
    
    // Update DOM
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    cardElement.classList.add('flipped');
    
    updateCardStats();
    
    // Check for match if 2 cards are flipped
    if (cardGameState.flippedCards.length === 2) {
        setTimeout(checkForMatch, 600);
    }
}

// Check for Match
function checkForMatch() {
    cardGameState.isChecking = true;
    
    const [card1Id, card2Id] = cardGameState.flippedCards;
    const card1 = cardGameState.cards[card1Id];
    const card2 = cardGameState.cards[card2Id];
    
    if (card1.photo === card2.photo) {
        // Match found!
        setTimeout(() => {
            card1.isMatched = true;
            card2.isMatched = true;
            cardGameState.matchedPairs++;
            
            // Update DOM
            document.querySelector(`[data-card-id="${card1Id}"]`).classList.add('matched');
            document.querySelector(`[data-card-id="${card2Id}"]`).classList.add('matched');
            
            cardGameState.flippedCards = [];
            cardGameState.isChecking = false;
            updateCardStats();
            
            // Check if game is complete
            if (cardGameState.matchedPairs === 8) {
                setTimeout(showCardGameComplete, 500);
            }
        }, 1000);
    } else {
        // No match, flip back
        setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            
            document.querySelector(`[data-card-id="${card1Id}"]`).classList.remove('flipped');
            document.querySelector(`[data-card-id="${card2Id}"]`).classList.remove('flipped');
            
            cardGameState.flippedCards = [];
            cardGameState.isChecking = false;
            updateCardStats();
        }, 1500);
    }
}

// Update Stats
function updateCardStats() {
    const pairsElement = document.getElementById('pairs-found');
    
    if (pairsElement) {
        pairsElement.textContent = cardGameState.matchedPairs;
    }
}

// Show Game Complete
function showCardGameComplete() {
    const completeElement = document.getElementById('cards-complete');
    if (completeElement) {
        completeElement.classList.remove('hidden');
    }
}

// Reset Game
function resetCardGame() {
    cardGameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        flippedCount: 0,
        isChecking: false
    };
    
    const completeElement = document.getElementById('cards-complete');
    if (completeElement) {
        completeElement.classList.add('hidden');
    }
    
    initializeCardGame();
}

// Video functionality
function playVideo() {
    const overlay = document.getElementById('video-overlay');
    const video = document.querySelector('.anniversary-video');
    
    if (overlay && video) {
        overlay.classList.add('hidden');
        video.play().catch(error => {
            console.log('Video play failed:', error);
        });
    }
}

// Auto-show video overlay when video ends or pauses
function setupVideoEvents() {
    // Setup video modal
    const watchVideoBtn = document.getElementById('watch-video-btn');
    const videoModal = document.getElementById('video-modal');
    const videoModalOverlay = document.getElementById('video-modal-overlay');
    const videoModalClose = document.getElementById('video-modal-close');
    const video = document.getElementById('anniversary-video');
    
    // Open modal
    if (watchVideoBtn && videoModal) {
        watchVideoBtn.addEventListener('click', function() {
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (video) {
                video.play();
            }
        });
    }
    
    // Close modal function
    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            document.body.style.overflow = '';
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        }
    }
    
    // Close on overlay click
    if (videoModalOverlay) {
        videoModalOverlay.addEventListener('click', closeVideoModal);
    }
    
    // Close on button click
    if (videoModalClose) {
        videoModalClose.addEventListener('click', closeVideoModal);
    }
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

// Make video functions globally available
window.playVideo = playVideo;

// Setup photo click events for gallery
function setupPhotoClickEvents() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.clickable-photo')) {
            const photoItem = e.target.closest('.clickable-photo');
            const img = photoItem.querySelector('.blurred-photo');
            const overlay = photoItem.querySelector('.photo-overlay');
            const clickHint = photoItem.querySelector('.click-hint');
            
            if (img && img.classList.contains('blurred-photo')) {
                // Reveal photo with animation
                img.classList.remove('blurred-photo');
                img.classList.add('revealed-photo');
                
                // Hide click hint
                if (clickHint) {
                    clickHint.style.opacity = '0';
                    setTimeout(() => {
                        clickHint.style.display = 'none';
                    }, 300);
                }
                
                // Add revealed effect to overlay
                if (overlay) {
                    overlay.classList.add('photo-revealed');
                }
                
                // Remove clickable state
                photoItem.classList.remove('clickable-photo');
                photoItem.classList.add('revealed');
            }
        }
    });
}

// Initialize photo events
setupPhotoClickEvents();

// Global debug functions for console testing
window.debugQuizState = function() {
    console.log('=== Quiz State Debug ===');
    console.log('Quiz completed:', localStorage.getItem('anniversary-quiz-completed'));
    console.log('Puzzle completed:', localStorage.getItem('anniversary-puzzle-completed'));
    console.log('App instance:', window.currentApp);
    if (window.currentApp) {
        console.log('App isQuizCompleted():', window.currentApp.isQuizCompleted());
    }
};

window.forceQuizReset = function() {
    localStorage.setItem('anniversary-quiz-completed', 'false');
    console.log('Quiz forced to false - reloading...');
    window.location.reload();
};