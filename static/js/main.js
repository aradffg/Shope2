/* ============================================================
   ElectroStore — Main JavaScript
   Shared functionality: Navbar, Scroll Reveal, Smooth Scroll
   ============================================================ */

(function () {
    'use strict';

    // ==================== NAVBAR SCROLL EFFECT ====================
    const navbar = document.getElementById('main-navbar');
    const SCROLL_THRESHOLD = 50;

    function handleNavbarScroll() {
        if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    // Run on load in case page is scrolled
    handleNavbarScroll();


    // ==================== MOBILE MENU TOGGLE ====================
    const navToggle = document.getElementById('navbar-toggle');
    const navLinks = document.getElementById('navbar-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
            navbar.classList.toggle('menu-open');
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('.navbar__link').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
                navbar.classList.remove('menu-open');
                document.body.style.overflow = '';
            });
        });
    }


    // ==================== SCROLL REVEAL (IntersectionObserver) ====================
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        // Unobserve after revealing (one-time animation)
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -60px 0px',
            }
        );

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: reveal everything immediately
        revealElements.forEach(function (el) {
            el.classList.add('revealed');
        });
    }


    // ==================== AUTO-DISMISS MESSAGES ====================
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        const messages = messagesContainer.querySelectorAll('.message');
        messages.forEach(function (msg, index) {
            setTimeout(function () {
                msg.style.opacity = '0';
                msg.style.transform = 'translateX(100px)';
                setTimeout(function () {
                    msg.remove();
                    // Remove container if no more messages
                    if (messagesContainer.children.length === 0) {
                        messagesContainer.remove();
                    }
                }, 400);
            }, 4000 + index * 500);
        });
    }


    // ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });

    // ==================== WISHLIST TOGGLE ====================
    const wishlistBtns = document.querySelectorAll('.js-wishlist-toggle');
    if (wishlistBtns.length > 0) {
        // Need CSRF token for POST
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    csrfToken = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }

        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-id');
                if (!productId) return;

                const url = `/products/toggle-wishlist/${productId}/`;
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    if (res.status === 401 || res.status === 403 || res.redirected) {
                        window.location.href = '/users/login/';
                        throw new Error('Not authenticated');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        if (data.added) {
                            this.innerHTML = '❤️ Saved';
                            if (window.showToast) window.showToast('Added to wishlist', 'success');
                        } else {
                            this.innerHTML = '🤍 Save for later';
                            if (window.showToast) window.showToast('Removed from wishlist', 'info');
                        }
                    }
                })
                .catch(err => console.error(err));
            });
        });
    }

    // ==================== TOAST NOTIFICATION SYSTEM ====================
    window.showToast = function(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            'success': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            'error': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        toast.innerHTML = `
            <div class="toast__icon">${icons[type] || icons['info']}</div>
            <div class="toast__content">${message}</div>
            <button class="toast__close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div class="toast__progress"></div>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast--show');
        });

        // Close logic
        const closeBtn = toast.querySelector('.toast__close');
        let closeTimeout;

        const closeToast = () => {
            toast.classList.remove('toast--show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
                if (container.children.length === 0) container.remove();
            });
        };

        closeBtn.addEventListener('click', closeToast);
        closeTimeout = setTimeout(closeToast, 3000);
    };

})();
