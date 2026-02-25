/* ========================================
   Ocean Background — Rainbow Iridescent Bubbles
   Realistic soap bubbles with rainbow shimmer
   that pop on mouse contact
   ======================================== */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    let W, H;
    let mouseX = -999, mouseY = -999;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const MAX_BUBBLES = isMobile ? 20 : 40;
    let bubbles = [];
    let particles = [];

    // Giant bubble reward — appears after popping 100 bubbles
    let popCount = 0;
    const POP_GOAL = 50;
    let giantBubble = null;

    function createBubble(initial) {
        const r = 8 + Math.random() * 35;
        return {
            x: Math.random() * W,
            y: initial ? Math.random() * H : H + r + Math.random() * 100,
            r: r,
            speed: 0.12 + Math.random() * 0.4 + (35 - r) * 0.008,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: 10 + Math.random() * 20,
            wobbleFreq: 0.005 + Math.random() * 0.008,
            // Rainbow hue rotates continuously
            hueBase: Math.random() * 360,
            hueSpeed: 0.3 + Math.random() * 0.5,
            alive: true
        };
    }

    for (let i = 0; i < MAX_BUBBLES; i++) {
        bubbles.push(createBubble(true));
    }

    function popBubble(b) {
        const bx = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
        const count = 6 + Math.floor(b.r / 3);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
            particles.push({
                x: bx,
                y: b.y,
                vx: Math.cos(angle) * (1.5 + Math.random() * 2.5),
                vy: Math.sin(angle) * (1.5 + Math.random() * 2.5),
                r: 1.5 + Math.random() * 2.5,
                life: 1.0,
                hue: (b.hueBase + i * 30) % 360
            });
        }
        b.alive = false;
        popCount++;
        if (popCount >= POP_GOAL && !giantBubble) {
            spawnGiantBubble();
            popCount = 0; // reset so it can trigger again
        }
    }

    function update() {
        bubbles.forEach(b => {
            if (!b.alive) return;
            b.y -= b.speed;
            b.wobblePhase += b.wobbleFreq;
            b.hueBase += b.hueSpeed;

            const bx = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;

            // Mouse collision → POP
            const dx = mouseX - bx;
            const dy = mouseY - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.r + 18) {
                popBubble(b);
            }

            // Off screen
            if (b.y + b.r < -40) b.alive = false;
        });

        bubbles = bubbles.filter(b => b.alive);
        while (bubbles.length < MAX_BUBBLES) {
            bubbles.push(createBubble(false));
        }

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.life -= 0.035;
        });
        particles = particles.filter(p => p.life > 0);

        // Giant bubble reward update
        if (giantBubble) {
            giantBubble.y -= giantBubble.speed;
            giantBubble.wobblePhase += giantBubble.wobbleFreq;
            giantBubble.hueBase += giantBubble.hueSpeed;
            // Grow to full size
            if (giantBubble.currentR < giantBubble.r) {
                giantBubble.currentR += (giantBubble.r - giantBubble.currentR) * 0.03;
            }
            const bx = giantBubble.x + Math.sin(giantBubble.wobblePhase) * giantBubble.wobbleAmp;
            // Mouse collision → POP the giant!
            const gdx = mouseX - bx;
            const gdy = mouseY - giantBubble.y;
            if (Math.sqrt(gdx * gdx + gdy * gdy) < giantBubble.currentR + 20) {
                popGiantBubble();
            }
            // Off screen
            if (giantBubble.y + giantBubble.currentR < -100) {
                giantBubble = null;
            }
        }
    }

    function spawnGiantBubble() {
        // Spawn from random edge: left, right, or bottom
        const edge = Math.random();
        let sx, sy;
        const giantR = 80 + Math.random() * 50; // 80-130px radius
        if (edge < 0.33) {
            // Left edge
            sx = -giantR;
            sy = H * 0.3 + Math.random() * H * 0.4;
        } else if (edge < 0.66) {
            // Right edge
            sx = W + giantR;
            sy = H * 0.3 + Math.random() * H * 0.4;
        } else {
            // Bottom
            sx = W * 0.2 + Math.random() * W * 0.6;
            sy = H + giantR;
        }
        giantBubble = {
            x: sx,
            y: sy,
            r: giantR,
            currentR: 10, // starts small, grows
            speed: 0.3 + Math.random() * 0.2,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: 15 + Math.random() * 25,
            wobbleFreq: 0.003 + Math.random() * 0.004,
            hueBase: Math.random() * 360,
            hueSpeed: 0.6 + Math.random() * 0.4
        };
    }

    function popGiantBubble() {
        if (!giantBubble) return;
        const bx = giantBubble.x + Math.sin(giantBubble.wobblePhase) * giantBubble.wobbleAmp;
        const by = giantBubble.y;
        const r = giantBubble.currentR;
        // Lots of rainbow particles — big explosion
        const count = 30 + Math.floor(r / 3);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 3 + Math.random() * 5;
            particles.push({
                x: bx + Math.cos(angle) * r * 0.5 * Math.random(),
                y: by + Math.sin(angle) * r * 0.5 * Math.random(),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 2.5 + Math.random() * 4,
                life: 1.0,
                hue: (giantBubble.hueBase + i * 12) % 360
            });
        }
        giantBubble = null;
    }

    function drawGiantBubble() {
        if (!giantBubble) return;
        const g = giantBubble;
        const x = g.x + Math.sin(g.wobblePhase) * g.wobbleAmp;
        const r = g.currentR;
        const hue = g.hueBase % 360;

        ctx.save();

        // Outer glow
        const glowGrad = ctx.createRadialGradient(x, g.y, r * 0.8, x, g.y, r * 1.5);
        glowGrad.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.08)`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, g.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = r * 0.6;
        ctx.shadowOffsetY = r * 0.1;

        // Main body — bigger, more colorful
        const bodyGrad = ctx.createRadialGradient(x - r * 0.25, g.y - r * 0.25, r * 0.05, x, g.y, r);
        bodyGrad.addColorStop(0, `hsla(${hue}, 65%, 90%, 0.22)`);
        bodyGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 55%, 85%, 0.12)`);
        bodyGrad.addColorStop(1, `hsla(${(hue + 120) % 360}, 50%, 80%, 0.16)`);
        ctx.beginPath();
        ctx.arc(x, g.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.restore();

        // Thick rainbow rim
        ctx.beginPath();
        ctx.arc(x, g.y, r, 0, Math.PI * 2);
        const rimGrad = ctx.createConicGradient(0, x, g.y);
        rimGrad.addColorStop(0, `hsla(${hue}, 75%, 65%, 0.7)`);
        rimGrad.addColorStop(0.15, `hsla(${(hue + 50) % 360}, 70%, 60%, 0.6)`);
        rimGrad.addColorStop(0.3, `hsla(${(hue + 110) % 360}, 75%, 65%, 0.65)`);
        rimGrad.addColorStop(0.45, `hsla(${(hue + 170) % 360}, 70%, 60%, 0.6)`);
        rimGrad.addColorStop(0.6, `hsla(${(hue + 220) % 360}, 75%, 65%, 0.65)`);
        rimGrad.addColorStop(0.75, `hsla(${(hue + 280) % 360}, 70%, 60%, 0.6)`);
        rimGrad.addColorStop(0.9, `hsla(${(hue + 330) % 360}, 75%, 65%, 0.65)`);
        rimGrad.addColorStop(1, `hsla(${hue}, 75%, 65%, 0.7)`);
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Rainbow shimmer band
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, g.y, r, 0, Math.PI * 2);
        ctx.clip();
        const shimmerGrad = ctx.createLinearGradient(x - r, g.y - r * 0.3, x + r, g.y + r * 0.3);
        shimmerGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.0)`);
        shimmerGrad.addColorStop(0.2, `hsla(${(hue + 50) % 360}, 85%, 75%, 0.18)`);
        shimmerGrad.addColorStop(0.4, `hsla(${(hue + 120) % 360}, 90%, 70%, 0.25)`);
        shimmerGrad.addColorStop(0.6, `hsla(${(hue + 200) % 360}, 85%, 75%, 0.2)`);
        shimmerGrad.addColorStop(0.8, `hsla(${(hue + 280) % 360}, 85%, 70%, 0.18)`);
        shimmerGrad.addColorStop(1, `hsla(${(hue + 340) % 360}, 80%, 70%, 0.0)`);
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(x - r, g.y - r, r * 2, r * 2);
        ctx.restore();

        // Big highlight
        ctx.beginPath();
        ctx.arc(x - r * 0.3, g.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
        const hlGrad = ctx.createRadialGradient(x - r * 0.3, g.y - r * 0.3, 0, x - r * 0.3, g.y - r * 0.3, r * 0.35);
        hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = hlGrad;
        ctx.fill();

        // Secondary highlight
        ctx.beginPath();
        ctx.arc(x + r * 0.2, g.y + r * 0.25, r * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();
    }

    function drawBubble(b) {
        const x = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
        const r = b.r;
        const hue = b.hueBase % 360;

        ctx.save();

        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
        ctx.shadowBlur = r * 0.5;
        ctx.shadowOffsetY = r * 0.12;

        // Main bubble body — transparent with subtle color
        const bodyGrad = ctx.createRadialGradient(x - r * 0.25, b.y - r * 0.25, r * 0.05, x, b.y, r);
        bodyGrad.addColorStop(0, `hsla(${hue}, 60%, 92%, 0.18)`);
        bodyGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 50%, 88%, 0.08)`);
        bodyGrad.addColorStop(1, `hsla(${(hue + 120) % 360}, 45%, 85%, 0.12)`);
        ctx.beginPath();
        ctx.arc(x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.restore();

        // Rainbow iridescent rim — thick, colorful gradient
        ctx.beginPath();
        ctx.arc(x, b.y, r, 0, Math.PI * 2);
        const rimGrad = ctx.createConicGradient(0, x, b.y);
        // Full rainbow sweep around the bubble
        rimGrad.addColorStop(0, `hsla(${hue}, 70%, 65%, 0.6)`);
        rimGrad.addColorStop(0.15, `hsla(${(hue + 50) % 360}, 65%, 60%, 0.5)`);
        rimGrad.addColorStop(0.3, `hsla(${(hue + 110) % 360}, 70%, 65%, 0.55)`);
        rimGrad.addColorStop(0.45, `hsla(${(hue + 170) % 360}, 65%, 60%, 0.5)`);
        rimGrad.addColorStop(0.6, `hsla(${(hue + 220) % 360}, 70%, 65%, 0.55)`);
        rimGrad.addColorStop(0.75, `hsla(${(hue + 280) % 360}, 65%, 60%, 0.5)`);
        rimGrad.addColorStop(0.9, `hsla(${(hue + 330) % 360}, 70%, 65%, 0.55)`);
        rimGrad.addColorStop(1, `hsla(${hue}, 70%, 65%, 0.6)`);
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = r > 18 ? 2.5 : 1.5;
        ctx.stroke();

        // Rainbow shimmer band across the middle (iridescence effect)
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, b.y, r, 0, Math.PI * 2);
        ctx.clip();
        const shimmerGrad = ctx.createLinearGradient(x - r, b.y - r * 0.3, x + r, b.y + r * 0.3);
        shimmerGrad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.0)`);
        shimmerGrad.addColorStop(0.25, `hsla(${(hue + 40) % 360}, 80%, 75%, 0.12)`);
        shimmerGrad.addColorStop(0.4, `hsla(${(hue + 90) % 360}, 85%, 70%, 0.18)`);
        shimmerGrad.addColorStop(0.5, `hsla(${(hue + 150) % 360}, 80%, 75%, 0.15)`);
        shimmerGrad.addColorStop(0.65, `hsla(${(hue + 210) % 360}, 85%, 70%, 0.18)`);
        shimmerGrad.addColorStop(0.8, `hsla(${(hue + 280) % 360}, 80%, 75%, 0.12)`);
        shimmerGrad.addColorStop(1, `hsla(${(hue + 340) % 360}, 80%, 70%, 0.0)`);
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(x - r, b.y - r, r * 2, r * 2);
        ctx.restore();

        // Bright highlight — top-left crescent
        ctx.beginPath();
        ctx.arc(x - r * 0.3, b.y - r * 0.3, r * 0.3, 0, Math.PI * 2);
        const hlGrad = ctx.createRadialGradient(x - r * 0.3, b.y - r * 0.3, 0, x - r * 0.3, b.y - r * 0.3, r * 0.3);
        hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = hlGrad;
        ctx.fill();

        // Small secondary highlight
        ctx.beginPath();
        ctx.arc(x + r * 0.2, b.y + r * 0.25, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    // REMOVED: drawRainbow — replaced with drawGiantBubble

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Giant bubble reward
        drawGiantBubble();

        bubbles.forEach(b => {
            if (b.alive) drawBubble(b);
        });

        // Pop particles — rainbow colored
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.life * 0.6})`;
            ctx.fill();
        });
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
})();
