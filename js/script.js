function sanitizeInput(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        }

        // Security: Rate limiting for API calls
        const rateLimiter = {
            calls: {},
            isAllowed: function(key, maxCalls = 10, timeWindow = 60000) {
                const now = Date.now();
                if (!this.calls[key]) {
                    this.calls[key] = [];
                }
                
                // Remove old calls outside time window
                this.calls[key] = this.calls[key].filter(time => now - time < timeWindow);
                
                if (this.calls[key].length >= maxCalls) {
                    return false;
                }
                
                this.calls[key].push(now);
                return true;
            }
        };

        // Enhanced Theme Toggle with error handling
        function toggleTheme() {
            try {
                if (!rateLimiter.isAllowed('theme-toggle', 20, 10000)) {
                    console.warn('Theme toggle rate limit exceeded');
                    return;
                }

                const body = document.body;
                const themeIcon = document.querySelector('.theme-icon');
                const themeText = document.querySelector('.theme-text');
                
                if (!body || !themeIcon || !themeText) {
                    throw new Error('Required theme elements not found');
                }
                
                const currentTheme = body.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                body.setAttribute('data-theme', newTheme);
                themeIcon.textContent = newTheme === 'dark' ? '🌙' : '🌞';
                themeText.textContent = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
                
                // Secure storage with error handling
                try {
                    localStorage.setItem('tikoncha-theme', newTheme);
                } catch (e) {
                    console.warn('Could not save theme preference:', e);
                }
                
                // Announce theme change for screen readers
                announceToScreenReader(`Theme changed to ${newTheme} mode`);
                
            } catch (error) {
                console.error('Error toggling theme:', error);
                showNotification('Theme toggle failed', 'error');
            }
        }

        // Enhanced Language Toggle with error handling
        function toggleLanguage() {
            try {
                if (!rateLimiter.isAllowed('lang-toggle', 20, 10000)) {
                    console.warn('Language toggle rate limit exceeded');
                    return;
                }

                const body = document.body;
                if (!body) {
                    throw new Error('Body element not found');
                }
                
                const currentLang = body.getAttribute('data-lang');
                const newLang = currentLang === 'uz' ? 'ru' : 'uz';
                
                body.setAttribute('data-lang', newLang);
                document.documentElement.setAttribute('lang', newLang);
                
                // Update all text elements with error handling
                const elements = document.querySelectorAll('[data-uz][data-ru]');
                elements.forEach(element => {
                    try {
                        const text = element.getAttribute(`data-${newLang}`);
                        if (text) {
                            element.textContent = text;
                        }
                    } catch (e) {
                        console.warn('Error updating element text:', e);
                    }
                });
                
                // Secure storage with error handling
                try {
                    localStorage.setItem('tikoncha-language', newLang);
                } catch (e) {
                    console.warn('Could not save language preference:', e);
                }
                
                // Announce language change for screen readers
                const langName = newLang === 'uz' ? 'Uzbek' : 'Russian';
                announceToScreenReader(`Language changed to ${langName}`);
                
            } catch (error) {
                console.error('Error toggling language:', error);
                showNotification('Language toggle failed', 'error');
            }
        }

        // Enhanced Mobile Menu Toggle
        function toggleMobileMenu() {
            try {
                const mobileNav = document.getElementById('mobile-nav');
                const mobileMenuBtn = document.querySelector('.mobile-menu');
                
                if (!mobileNav || !mobileMenuBtn) {
                    throw new Error('Mobile menu elements not found');
                }
                
                const isActive = mobileNav.classList.contains('active');
                
                if (isActive) {
                    mobileNav.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.innerHTML = '<span aria-hidden="true">☰</span>';
                } else {
                    mobileNav.classList.add('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'true');
                    mobileMenuBtn.innerHTML = '<span aria-hidden="true">✕</span>';
                }
                
                // Announce state change for screen readers
                announceToScreenReader(`Mobile menu ${isActive ? 'closed' : 'opened'}`);
                
            } catch (error) {
                console.error('Error toggling mobile menu:', error);
            }
        }

        // Accessibility: Screen reader announcements
        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }

        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.setAttribute('role', 'alert');
            
            const style = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            const bgColor = type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#3b82f6';
            notification.style.cssText = style + `background-color: ${bgColor};`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Enhanced smooth scrolling with error handling
        function initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    try {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const target = document.querySelector(targetId);
                        
                        if (target) {
                            // Close mobile menu if open
                            const mobileNav = document.getElementById('mobile-nav');
                            if (mobileNav && mobileNav.classList.contains('active')) {
                                toggleMobileMenu();
                            }
                            
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                            
                            // Update focus for accessibility
                            target.setAttribute('tabindex', '-1');
                            target.focus();
                            
                        } else {
                            console.warn(`Target element ${targetId} not found`);
                        }
                    } catch (error) {
                        console.error('Error in smooth scrolling:', error);
                    }
                });
            });
        }

        // Enhanced initialization with error handling
        function initializeApp() {
            try {
                // Load saved preferences with fallbacks
                const savedTheme = localStorage.getItem('tikoncha-theme') || 'light';
                const savedLang = localStorage.getItem('tikoncha-language') || 'uz';
                
                const body = document.body;
                const themeIcon = document.querySelector('.theme-icon');
                const themeText = document.querySelector('.theme-text');
                
                if (body && themeIcon && themeText) {
                    body.setAttribute('data-theme', savedTheme);
                    document.documentElement.setAttribute('lang', savedLang);
                    themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '🌞';
                    themeText.textContent = savedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
                }
                
                // Apply saved language
                if (savedLang === 'ru') {
                    body.setAttribute('data-lang', 'ru');
                    const elements = document.querySelectorAll('[data-uz][data-ru]');
                    elements.forEach(element => {
                        try {
                            const text = element.getAttribute('data-ru');
                            if (text) {
                                element.textContent = text;
                            }
                        } catch (e) {
                            console.warn('Error applying saved language:', e);
                        }
                    });
                }
                
                // Initialize smooth scrolling
                initSmoothScrolling();
                
                // Initialize intersection observer for animations
                initIntersectionObserver();
                
                // Initialize keyboard navigation
                initKeyboardNavigation();
                
                // Initialize form validation if forms exist
                initFormValidation();
                
                console.log('Tikoncha app initialized successfully');
                
            } catch (error) {
                console.error('Error initializing app:', error);
                showNotification('App initialization failed', 'error');
            }
        }

        // Intersection Observer for animations
        function initIntersectionObserver() {
            try {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }
                    });
                }, observerOptions);

                // Observe mascot images and cards
                const elementsToObserve = document.querySelectorAll('.mascot-image, .feature-card, .team-card, .about-card, .pricing-card');
                elementsToObserve.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    observer.observe(el);
                });
                
            } catch (error) {
                console.warn('Intersection Observer not supported or failed:', error);
            }
        }

        // Keyboard navigation enhancement
        function initKeyboardNavigation() {
            try {
                // Enhanced focus management
                document.addEventListener('keydown', function(e) {
                    // Escape key closes mobile menu
                    if (e.key === 'Escape') {
                        const mobileNav = document.getElementById('mobile-nav');
                        if (mobileNav && mobileNav.classList.contains('active')) {
                            toggleMobileMenu();
                        }
                    }
                    
                    // Tab navigation enhancement
                    if (e.key === 'Tab') {
                        document.body.classList.add('keyboard-navigation');
                    }
                });
                
                // Remove keyboard navigation class on mouse use
                document.addEventListener('mousedown', function() {
                    document.body.classList.remove('keyboard-navigation');
                });
                
            } catch (error) {
                console.warn('Error initializing keyboard navigation:', error);
            }
        }

        // Form validation (if forms are added later)
        function initFormValidation() {
            try {
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    form.addEventListener('submit', function(e) {
                        if (!validateForm(this)) {
                            e.preventDefault();
                            showNotification('Please correct the errors in the form', 'error');
                        }
                    });
                });
            } catch (error) {
                console.warn('Error initializing form validation:', error);
            }
        }

        // Form validation helper
        function validateForm(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            return isValid;
        }

        // Header scroll effect with performance optimization
        let ticking = false;
        function updateHeader() {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 100) {
                    header.style.backgroundColor = 'var(--bg-card)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.backgroundColor = 'var(--bg-card)';
                    header.style.backdropFilter = 'blur(10px)';
                }
            }
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        // Event listeners with error handling
        document.addEventListener('DOMContentLoaded', function() {
            try {
                initializeApp();
                
                // Add scroll listener
                window.addEventListener('scroll', onScroll, { passive: true });
                
                // Add resize listener for responsive adjustments
                window.addEventListener('resize', function() {
                    // Close mobile menu on resize to desktop
                    if (window.innerWidth > 768) {
                        const mobileNav = document.getElementById('mobile-nav');
                        if (mobileNav && mobileNav.classList.contains('active')) {
                            toggleMobileMenu();
                        }
                    }
                }, { passive: true });
                
                // Add error handling for unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                    console.error('Unhandled promise rejection:', event.reason);
                    event.preventDefault();
                });
                
                // Add global error handler
                window.addEventListener('error', function(event) {
                    console.error('Global error:', event.error);
                });
                
            } catch (error) {
                console.error('Error in DOMContentLoaded:', error);
            }
        });

        // Service Worker registration for PWA capabilities (optional)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                    }
                }, 0);
            });
        }

        // Add CSS animations for notifications
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .keyboard-navigation *:focus {
                outline: 2px solid var(--accent-primary) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(notificationStyles);

        document.addEventListener("contextmenu", e => e.preventDefault());
        (function () {
    let threshold = 160; // Порог для DevTools

    // ✅ Блокировка клавиш (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I, и т.д.)
    document.addEventListener('keydown', function (e) {
      // Клавиши для блокировки
      const blockedKeys = [
        'F12',
        'U',
        'S',
        'I',
        'J',
        'C'
      ];

      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.ctrlKey && e.shiftKey && blockedKeys.includes(e.key.toUpperCase())) ||
        (e.metaKey && e.key === 'S') // ⌘ + S для Mac
      ) {
        e.preventDefault();
        alert('Taqiqlangan harakat!');
      }
    });

    // ❌ Отключение правой кнопки мыши
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // ⚠️ Проверка на открытие DevTools через размер окна
    setInterval(function () {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        alert('DevTools aniqlangan. Saytdan chiqarildingiz!');
        window.location.href = 'https://www.google.com';
        // window.close(); // можно попробовать закрыть вкладку, но это сработает не всегда
      }
    }, 1000);
  })();