/* ========================================
   Ocean Background — Rainbow Iridescent Bubbles
   Realistic soap bubbles with rainbow shimmer
   that pop on mouse contact
   ======================================== */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

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

    const MAX_BUBBLES = isMobile ? 12 : 40;
    let bubbles = [];
    let particles = [];

    // Rainbow reward — appears after popping 50 bubbles
    let popCount = 0;
    const POP_GOAL = 50;
    let rainbow = null; // { opacity, phase: 'appear'|'hold'|'fade', timer }

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
        if (popCount >= POP_GOAL && !rainbow) {
            rainbow = { opacity: 0, phase: 'appear', timer: 0 };
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

        // Rainbow reward update
        if (rainbow) {
            rainbow.timer++;
            if (rainbow.phase === 'appear') {
                rainbow.opacity += 0.005;
                if (rainbow.opacity >= 0.25) { rainbow.opacity = 0.25; rainbow.phase = 'hold'; rainbow.timer = 0; }
            } else if (rainbow.phase === 'hold') {
                if (rainbow.timer > 120) { rainbow.phase = 'fade'; }
            } else if (rainbow.phase === 'fade') {
                rainbow.opacity -= 0.002;
                if (rainbow.opacity <= 0) { rainbow = null; }
            }
        }
    }

    function drawBubble(b) {
        const x = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
        const r = b.r;
        const hue = b.hueBase % 360;

        if (isMobile) {
            // Mobile: simplified — body + rim + one highlight (3 draw calls vs 6)
            const bodyGrad = ctx.createRadialGradient(x - r * 0.25, b.y - r * 0.25, r * 0.05, x, b.y, r);
            bodyGrad.addColorStop(0, `hsla(${hue}, 60%, 92%, 0.18)`);
            bodyGrad.addColorStop(1, `hsla(${(hue + 120) % 360}, 45%, 85%, 0.12)`);
            ctx.beginPath();
            ctx.arc(x, b.y, r, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Simple solid rim instead of conic gradient
            ctx.beginPath();
            ctx.arc(x, b.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${hue}, 60%, 65%, 0.4)`;
            ctx.lineWidth = r > 18 ? 2 : 1;
            ctx.stroke();

            // One highlight
            ctx.beginPath();
            ctx.arc(x - r * 0.3, b.y - r * 0.3, r * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
            return;
        }

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

    function drawRainbow() {
        if (!rainbow || rainbow.opacity <= 0) return;
        const a = rainbow.opacity;
        const cx = W * 0.5;
        const cy = H * 1.1;
        const outerR = Math.max(W, H) * 1.3;
        const keyHues = [0, 30, 55, 120, 210, 250, 290, 330];
        const BANDS = isMobile ? 16 : 40;
        const bandW = outerR * 0.008;
        for (let i = 0; i < BANDS; i++) {
            const t = i / (BANDS - 1);
            const pos = t * (keyHues.length - 1);
            const idx = Math.floor(pos);
            const frac = pos - idx;
            const h0 = keyHues[Math.min(idx, keyHues.length - 1)];
            const h1 = keyHues[Math.min(idx + 1, keyHues.length - 1)];
            const hue = h0 + (h1 - h0) * frac;
            const edgeFade = Math.sin(t * Math.PI);
            const r = outerR - i * bandW;
            if (r <= 0) continue;
            ctx.beginPath();
            ctx.arc(cx, cy, r, Math.PI, 0);
            ctx.strokeStyle = `hsla(${hue}, 60%, 65%, ${a * (0.5 + edgeFade * 0.5)})`;
            ctx.lineWidth = bandW * 1.3;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Rainbow behind everything
        drawRainbow();

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
