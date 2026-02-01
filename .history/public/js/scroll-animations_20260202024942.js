// Scroll Animation Handler
class ScrollAnimations {
    constructor() {
        this.sections = [];
        this.currentSection = 0;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateScrollProgress();
        this.checkVisibleSections();
        this.initAnniversaryCounter();
        
        // Delay particle creation to ensure DOM is ready
        setTimeout(() => {
            this.createFloatingParticles();
        }, 1000);
    }
    
    bindEvents() {
        window.addEventListener('scroll', this.throttle(() => {
            this.updateScrollProgress();
            this.checkVisibleSections();
            this.updateNavigation();
        }, 10));
        
        window.addEventListener('resize', this.throttle(() => {
            this.checkVisibleSections();
        }, 250));
    }
    
    // Throttle function untuk performa yang lebih baik
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Update progress bar
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    }
    
    // Check which sections are visible
    checkVisibleSections() {
        const sections = document.querySelectorAll('.story-section, .animate-on-scroll');
        
        sections.forEach(section => {
            if (this.isElementInViewport(section)) {
                section.classList.add('visible');
                this.animateSection(section);
            }
        });
    }
    
    // Check if element is in viewport
    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const threshold = windowHeight * 0.2; // 20% dari tinggi viewport
        
        return (
            rect.top <= windowHeight - threshold &&
            rect.bottom >= threshold
        );
    }
    
    // Animate section elements
    animateSection(section) {
        const elements = section.querySelectorAll('.section-title, .section-description');
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
            }, index * 150);
        });
    }
    
    // Update navigation dots
    updateNavigation() {
        const sections = document.querySelectorAll('.story-section');
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        let currentIndex = 0;
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                currentIndex = index;
            }
        });
        
        this.updateActiveNavDot(currentIndex);
    }
    
    // Update active navigation dot
    updateActiveNavDot(index) {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Smooth scroll to section
    scrollToSection(index) {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const sections = document.querySelectorAll('.story-section');
        
        if (sections[index]) {
            const targetTop = sections[index].offsetTop;
            
            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                this.isScrolling = false;
            }, 1000);
        }
    }
    
    // Initialize parallax effects
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const backgrounds = document.querySelectorAll('.hero-background, .section-image');
            
            backgrounds.forEach((bg, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        });
    }
    
    // Add floating animations
    addFloatingAnimation() {
        const floatingElements = document.querySelectorAll('.hearts, .scroll-arrow');
        
        floatingElements.forEach((el, index) => {
            const delay = index * 0.5;
            el.style.animationDelay = `${delay}s`;
        });
    }
    
    // Initialize Anniversary Counter
    initAnniversaryCounter() {
        // Anniversary date: February 3, 2024
        this.anniversaryDate = new Date('2024-02-03T00:00:00');
        
        // Start the counter immediately
        this.updateAnniversaryCounter();
        
        // Update every second
        this.counterInterval = setInterval(() => {
            this.updateAnniversaryCounter();
        }, 1000);
    }
    
    // Update Anniversary Counter
    updateAnniversaryCounter() {
        const now = new Date();
        const timeDiff = now.getTime() - this.anniversaryDate.getTime();
        
        // Calculate time components
        const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        // Update DOM elements with animation
        this.animateCounterUpdate('years', years);
        this.animateCounterUpdate('months', months);
        this.animateCounterUpdate('days', days);
        this.animateCounterUpdate('hours', hours);
        this.animateCounterUpdate('minutes', minutes);
        this.animateCounterUpdate('seconds', seconds);
    }
    
    // Animate counter number updates
    animateCounterUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
            // Add update animation
            element.style.transform = 'scale(1.1)';
            element.style.color = '#f0f0f0';
            
            setTimeout(() => {
                element.textContent = newValue;
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '#ffffff';
                }, 100);
            }, 150);
        } else {
            element.textContent = newValue;
        }
    }
    
    // Cleanup method to clear interval when needed
    destroy() {
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
        }
    }
    
    // Create floating particles
    createFloatingParticles() {
        // Create particles for hero section
        const heroParticlesContainer = document.querySelector('.floating-particles');
        if (heroParticlesContainer) {
            this.addParticlesToContainer(heroParticlesContainer, 25, 8);
        }
        
        // Create particles for all story sections
        const storySections = document.querySelectorAll('.story-section');
        storySections.forEach(section => {
            // Create particles container for each section
            const particlesDiv = document.createElement('div');
            particlesDiv.className = 'section-floating-particles';
            particlesDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
                z-index: 1;
            `;
            
            section.appendChild(particlesDiv);
            this.addParticlesToContainer(particlesDiv, 15, 5);
        });
    }
    
    addParticlesToContainer(container, smallCount, bigCount) {
        // Create multiple floating particles
        for (let i = 0; i < smallCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                background: radial-gradient(circle, rgba(255,255,255,${0.4 + Math.random() * 0.6}), transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                animation: float-particle ${6 + Math.random() * 6}s linear infinite;
                animation-delay: ${Math.random() * 12}s;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }
        
        // Add some bigger, slower particles for variety
        for (let i = 0; i < bigCount; i++) {
            const bigParticle = document.createElement('div');
            bigParticle.className = 'particle-big';
            bigParticle.style.cssText = `
                position: absolute;
                width: ${4 + Math.random() * 3}px;
                height: ${4 + Math.random() * 3}px;
                background: radial-gradient(circle, rgba(255,255,255,${0.2 + Math.random() * 0.4}), transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                animation: float-particle ${10 + Math.random() * 8}s linear infinite;
                animation-delay: ${Math.random() * 15}s;
                pointer-events: none;
                box-shadow: 0 0 6px rgba(255,255,255,0.3);
            `;
            
            container.appendChild(bigParticle);
        }
    }
}

// Export untuk digunakan di main.js
window.ScrollAnimations = ScrollAnimations;