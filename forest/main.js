/* ========================================
   Elena Matyushenko Portfolio - Interactions
   ======================================== */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

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
            function tick(now) {
                const p = Math.min((now - startTime) / duration, 1);
                el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    // ========== Scroll-triggered Animations ==========
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.closest('.hero-stats') || entry.target.classList.contains('hero-stats')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.about-text, .highlight-card, .skill-category, .project-card, .startup-card, .gallery-item, .contact-card')
        .forEach(el => observer.observe(el));

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) animateStats(); });
        }, { threshold: 0.3 }).observe(heroStats);
    }

    // ========== Single scroll handler (nav bg + active section) ==========
    const nav = document.getElementById('nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Cache CSS variables — they don't change at runtime
    const rootStyle = getComputedStyle(document.documentElement);
    const bgRgb = rootStyle.getPropertyValue('--bg-rgb').trim();
    const accentRgb = rootStyle.getPropertyValue('--accent-rgb').trim();

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Nav background
        if (scrollY > 100) {
            nav.style.background = `rgba(${bgRgb}, 0.9)`;
            nav.style.borderBottomColor = `rgba(${accentRgb}, 0.1)`;
        } else {
            nav.style.background = `rgba(${bgRgb}, 0.6)`;
            nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        }

        // Active section highlight
        let current = '';
        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom > 150) {
                current = section.id;
            }
        }
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
        });
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
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== Gallery Folders ==========
    const galleryItems = document.querySelectorAll('.gallery-item');
    const foldersContainer = document.getElementById('gallery-folders');
    const folderViewer = document.getElementById('folder-viewer');
    const fvTitle = document.getElementById('folder-viewer-title');
    const fvCounter = document.getElementById('folder-viewer-counter');
    const fvImg = document.getElementById('folder-viewer-img');
    const fvDesc = document.getElementById('folder-viewer-desc');
    const fvThumbs = document.getElementById('folder-viewer-thumbs');

    // Build folder data from hidden gallery items
    const folderNames = {
        tryon: 'Fashion Swap',
        print: 'Wear Print',
        recolor: 'Recolor',
        texture: 'Texture Transfer',
        outpaint: 'Outpaint',
        skin: 'Skin Retouch',
        socs: 'Product Mockup',
        style: 'Style Transfer',
        portrait: 'Portraits',
        pipeline: 'Pipelines'
    };

    const folderOrder = ['tryon', 'print', 'recolor', 'texture', 'outpaint', 'skin', 'socs', 'style', 'portrait', 'pipeline'];
    const folders = {};

    galleryItems.forEach(item => {
        const cat = item.dataset.category;
        if (!folders[cat]) folders[cat] = [];
        const img = item.querySelector('img');
        const desc = item.querySelector('.gallery-overlay p');
        folders[cat].push({
            src: img?.src || '',
            alt: img?.alt || '',
            desc: desc?.textContent || ''
        });
    });

    // Render folder cards
    folderOrder.forEach(cat => {
        const items = folders[cat];
        if (!items || items.length === 0) return;
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.dataset.folder = cat;

        const stackImgs = items.slice(0, 3).reverse();
        const stackHTML = stackImgs.map((item, i) => {
            const cls = i === stackImgs.length - 1 ? 'fs-1' : i === stackImgs.length - 2 ? 'fs-2' : 'fs-3';
            return `<img class="${cls}" src="${item.src}" alt="${item.alt}" loading="lazy">`;
        }).join('');

        card.innerHTML = `
            <div class="folder-stack">${stackHTML}</div>
            <div class="folder-info">
                <h3 class="folder-name">${folderNames[cat] || cat}</h3>
                <span class="folder-count">${items.length} img</span>
            </div>
        `;
        foldersContainer.appendChild(card);
    });

    // Folder viewer state
    let fvCurrent = 0;
    let fvItems = [];
    let fvCategory = '';

    function openFolder(cat) {
        fvItems = folders[cat] || [];
        fvCategory = cat;
        fvCurrent = 0;
        fvTitle.textContent = folderNames[cat] || cat;
        foldersContainer.style.display = 'none';
        folderViewer.classList.add('active');
        renderFolderImg();
        renderThumbs();
    }

    function closeFolder() {
        folderViewer.classList.remove('active');
        foldersContainer.style.display = '';
    }

    function renderFolderImg() {
        const item = fvItems[fvCurrent];
        if (!item) return;
        fvImg.src = item.src;
        fvImg.alt = item.alt;
        fvDesc.textContent = item.desc;
        fvCounter.textContent = `${fvCurrent + 1} / ${fvItems.length}`;
        // Update active thumb
        fvThumbs.querySelectorAll('img').forEach((t, i) => {
            t.classList.toggle('active', i === fvCurrent);
        });
        // Scroll active thumb into view
        const activeThumb = fvThumbs.querySelector('img.active');
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function renderThumbs() {
        fvThumbs.innerHTML = fvItems.map((item, i) =>
            `<img src="${item.src}" alt="${item.alt}" class="${i === 0 ? 'active' : ''}" data-idx="${i}" loading="lazy">`
        ).join('');
    }

    function fvNext() { fvCurrent = (fvCurrent + 1) % fvItems.length; renderFolderImg(); }
    function fvPrev() { fvCurrent = (fvCurrent - 1 + fvItems.length) % fvItems.length; renderFolderImg(); }

    // Event listeners
    foldersContainer.addEventListener('click', e => {
        const card = e.target.closest('.folder-card');
        if (card) openFolder(card.dataset.folder);
    });

    document.getElementById('folder-viewer-back')?.addEventListener('click', closeFolder);
    document.getElementById('folder-viewer-next')?.addEventListener('click', fvNext);
    document.getElementById('folder-viewer-prev')?.addEventListener('click', fvPrev);

    fvThumbs.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            fvCurrent = parseInt(e.target.dataset.idx);
            renderFolderImg();
        }
    });

    // Lightbox for full-size view from folder viewer
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxInfo = document.getElementById('lightbox-info');

    fvImg.addEventListener('click', () => {
        lightboxImg.src = fvImg.src;
        lightboxImg.alt = fvImg.alt;
        lightboxInfo.textContent = fvDesc.textContent;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
    function nextImg() { fvNext(); lightboxImg.src = fvImg.src; lightboxInfo.textContent = fvDesc.textContent; }
    function prevImg() { fvPrev(); lightboxImg.src = fvImg.src; lightboxInfo.textContent = fvDesc.textContent; }

    document.querySelector('.lightbox-close')?.addEventListener('click', closeLB);
    document.querySelector('.lightbox-prev')?.addEventListener('click', prevImg);
    document.querySelector('.lightbox-next')?.addEventListener('click', nextImg);

    document.addEventListener('keydown', e => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLB();
            if (e.key === 'ArrowLeft') prevImg();
            if (e.key === 'ArrowRight') nextImg();
        } else if (folderViewer.classList.contains('active')) {
            if (e.key === 'Escape') closeFolder();
            if (e.key === 'ArrowLeft') fvPrev();
            if (e.key === 'ArrowRight') fvNext();
        }
    });

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });

    // Touch swipe for folder viewer
    let touchStartX = 0;
    const fvStage = document.querySelector('.folder-viewer-stage');
    if (fvStage) {
        fvStage.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        fvStage.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) { diff > 0 ? fvPrev() : fvNext(); }
        }, { passive: true });
    }

    // Touch swipe for lightbox
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) { diff > 0 ? prevImg() : nextImg(); }
    }, { passive: true });

    // ========== Desktop-only effects ==========
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isTouchDevice) {
        // Parallax on folder cards
        const folderCards = document.querySelectorAll('.folder-card');
        if (foldersContainer) {
            foldersContainer.addEventListener('mousemove', e => {
                const rect = foldersContainer.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                folderCards.forEach((card, i) => {
                    const depth = 0.015 + (i % 5) * 0.006;
                    card.style.transform = `translate(${x * depth * 15}px, ${y * depth * 15}px)`;
                });
            });
            foldersContainer.addEventListener('mouseleave', () => {
                folderCards.forEach(card => { card.style.transform = ''; });
            });
        }

        // Magnetic effect on buttons
        document.querySelectorAll('.btn, .contact-card').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
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

    console.log(
        '%c Elena Matyushenko %c Senior Generative AI Engineer ',
        'background: #e8722a; color: white; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #1a1a1d; color: #f5a623; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
});
