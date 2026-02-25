/* ========================================
   Cosmos Theme — Portfolio Interactions
   ======================================== */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;
        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const startTime = performance.now();
            function tick(now) {
                const p = Math.min((now - startTime) / duration, 1);
                el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                if (e.target.closest('.hero-stats') || e.target.classList.contains('hero-stats')) animateStats();
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.about-text, .highlight-card, .skill-category, .project-card, .gallery-item, .contact-card')
        .forEach(el => observer.observe(el));

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) animateStats(); });
        }, { threshold: 0.3 }).observe(heroStats);
    }

    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.style.background = window.scrollY > 100 ? 'rgba(5, 5, 16, 0.9)' : 'rgba(5, 5, 16, 0.6)';
    }, { passive: true });

    const navToggle = document.getElementById('nav-toggle');
    const navLinksEl = document.getElementById('nav-links');
    if (navToggle && navLinksEl) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinksEl.classList.toggle('open');
            document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
        });
        navLinksEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinksEl.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    document.querySelectorAll('.nav-links a, .hero-cta a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
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

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxInfo = document.getElementById('lightbox-info');
    let currentIdx = 0;
    let visible = [];

    function getVisible() { return Array.from(galleryItems).filter(i => !i.classList.contains('hidden')); }

    function openLB(idx) {
        visible = getVisible();
        currentIdx = idx;
        const item = visible[idx];
        if (!item) return;
        const img = item.querySelector('img');
        const tag = item.querySelector('.gallery-tag');
        const desc = item.querySelector('.gallery-overlay p');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxInfo.textContent = (tag ? tag.textContent + ' — ' : '') + (desc ? desc.textContent : '');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
    function nextImg() { visible = getVisible(); currentIdx = (currentIdx + 1) % visible.length; openLB(currentIdx); }
    function prevImg() { visible = getVisible(); currentIdx = (currentIdx - 1 + visible.length) % visible.length; openLB(currentIdx); }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            visible = getVisible();
            const idx = visible.indexOf(item);
            if (idx !== -1) openLB(idx);
        });
    });

    document.querySelector('.lightbox-close')?.addEventListener('click', closeLB);
    document.querySelector('.lightbox-prev')?.addEventListener('click', prevImg);
    document.querySelector('.lightbox-next')?.addEventListener('click', nextImg);

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowLeft') prevImg();
        if (e.key === 'ArrowRight') nextImg();
    });

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) { diff > 0 ? prevImg() : nextImg(); }
    }, { passive: true });

    const badge = document.querySelector('.hero-badge');
    if (badge) {
        const text = badge.textContent;
        badge.textContent = '';
        badge.style.opacity = '1';
        let i = 0;
        function typeChar() {
            if (i < text.length) { badge.textContent += text[i]; i++; setTimeout(typeChar, 40 + Math.random() * 30); }
        }
        setTimeout(typeChar, 900);
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= 150 && r.bottom > 150) current = s.id; });
        navLinks.forEach(l => { l.style.color = l.getAttribute('href') === '#' + current ? 'var(--accent)' : ''; });
    }, { passive: true });

    console.log('%c Elena Matyushenko %c Cosmos Theme ', 'background: #c9a84c; color: #050510; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;', 'background: #050510; color: #c9a84c; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;');
});
