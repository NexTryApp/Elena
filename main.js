/* ========================================
   Elena Matyushenko Portfolio - Interactions
   Scroll animations, gallery, lightbox,
   stats counter, smooth nav
   ======================================== */

// Force scroll to top on page load (prevent browser restore)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

    // Scroll to top immediately
    window.scrollTo(0, 0);

    // REMOVED: Theme switcher JS (themes are now separate pages linked via <a> tags)

    // ========== Stats Counter Animation ==========
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                el.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // ========== Scroll-triggered Animations ==========
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger stats animation when hero stats come into view
                if (entry.target.closest('.hero-stats') || entry.target.classList.contains('hero-stats')) {
                    animateStats();
                }
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animateElements = document.querySelectorAll(
        '.about-text, .highlight-card, .skill-category, .project-card, .gallery-item, .contact-card'
    );
    animateElements.forEach(el => observer.observe(el));

    // Also observe stats section
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateStats();
            });
        }, { threshold: 0.3 });
        statsObserver.observe(heroStats);
    }

    // ========== Smooth Nav Background ==========
    const nav = document.getElementById('nav');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Use CSS variables — reads current theme colors
        const style = getComputedStyle(document.documentElement);
        const bgRgb = style.getPropertyValue('--bg-rgb').trim();
        const accentRgb = style.getPropertyValue('--accent-rgb').trim();
        if (scrollY > 100) {
            nav.style.background = `rgba(${bgRgb}, 0.9)`;
            nav.style.borderBottomColor = `rgba(${accentRgb}, 0.1)`;
        } else {
            nav.style.background = `rgba(${bgRgb}, 0.6)`;
            nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        }
        lastScrollY = scrollY;
    }, { passive: true });

    // ========== Mobile Hamburger Menu ==========
    const navToggle = document.getElementById('nav-toggle');
    const navLinksEl = document.getElementById('nav-links');

    if (navToggle && navLinksEl) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinksEl.classList.toggle('open');
            document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinksEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinksEl.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a, .hero-cta a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ========== Gallery Filter ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeUp 0.5s forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // ========== Lightbox ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxInfo = document.getElementById('lightbox-info');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentLightboxIndex = 0;
    let visibleItems = [];

    function getVisibleItems() {
        return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
    }

    function openLightbox(index) {
        visibleItems = getVisibleItems();
        currentLightboxIndex = index;
        const item = visibleItems[index];
        if (!item) return;

        const img = item.querySelector('img');
        const overlay = item.querySelector('.gallery-overlay');
        const tag = overlay ? overlay.querySelector('.gallery-tag') : null;
        const desc = overlay ? overlay.querySelector('p') : null;

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxInfo.textContent = (tag ? tag.textContent + ' - ' : '') + (desc ? desc.textContent : '');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function nextImage() {
        visibleItems = getVisibleItems();
        currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
        openLightbox(currentLightboxIndex);
    }

    function prevImage() {
        visibleItems = getVisibleItems();
        currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
        openLightbox(currentLightboxIndex);
    }

    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            visibleItems = getVisibleItems();
            const index = visibleItems.indexOf(item);
            if (index !== -1) openLightbox(index);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
    if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

    // Keyboard controls
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // Click outside image to close
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    // Touch swipe for lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) prevImage();
            else nextImage();
        }
    }, { passive: true });

    // ========== Parallax Effect on Gallery Images (desktop only) ==========
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const galleryGrid = document.getElementById('gallery-grid');

    if (galleryGrid && !isTouchDevice) {
        galleryGrid.addEventListener('mousemove', e => {
            const rect = galleryGrid.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            galleryItems.forEach((item, i) => {
                const depth = 0.02 + (i % 4) * 0.008;
                const moveX = x * depth * 20;
                const moveY = y * depth * 20;
                if (!item.classList.contains('hidden')) {
                    item.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });
        });

        galleryGrid.addEventListener('mouseleave', () => {
            galleryItems.forEach(item => {
                item.style.transform = '';
            });
        });
    }

    // ========== Magnetic Effect on Buttons (desktop only) ==========
    if (!isTouchDevice) {
        document.querySelectorAll('.btn, .contact-card').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ========== Typing Effect for Hero Badge ==========
    const badge = document.querySelector('.hero-badge');
    if (badge) {
        const text = badge.textContent;
        badge.textContent = '';
        badge.style.opacity = '1';
        let i = 0;
        function typeChar() {
            if (i < text.length) {
                badge.textContent += text[i];
                i++;
                setTimeout(typeChar, 40 + Math.random() * 30);
            }
        }
        setTimeout(typeChar, 900);
    }

    // ========== Active Section Highlight ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom > 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--accent)';
            }
        });
    }, { passive: true });

    // ========== Console Easter Egg ==========
    console.log(
        '%c Elena Matyushenko %c Senior Generative AI Engineer ',
        'background: #e8722a; color: white; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #1a1a1d; color: #f5a623; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
    console.log('Interested in working together? Email: business@nextry.app');

});
