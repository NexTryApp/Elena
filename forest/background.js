/* ========================================
   Forest Background — Falling Leaves & Fireflies
   Grass-green leaves drift down with rotation,
   warm yellow fireflies pulse and float
   ======================================== */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    let W, H;
    let cursorX = -999, cursorY = -999;
    let lastBlossomX = -999, lastBlossomY = -999;

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
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    // ---- Leaves ----
    const LEAF_COUNT = isMobile ? 12 : 22;
    let leaves = [];

    function createLeaf(initial) {
        const size = 8 + Math.random() * 18;
        const hue = 85 + Math.random() * 55; // 85-140: grass green to emerald
        const lightness = 25 + Math.random() * 20;
        return {
            x: Math.random() * W,
            y: initial ? Math.random() * H : -size - Math.random() * 200,
            size: size,
            speed: 0.2 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.3,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleFreq: 0.008 + Math.random() * 0.012,
            wobbleAmp: 15 + Math.random() * 25,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            hue: hue,
            lightness: lightness,
            opacity: 0.25 + Math.random() * 0.35,
            // Leaf shape variant: 0 = pointed ellipse, 1 = maple-ish
            variant: Math.random() > 0.5 ? 1 : 0
        };
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
        leaves.push(createLeaf(true));
    }

    function drawLeaf(l) {
        const x = l.x + Math.sin(l.wobblePhase) * l.wobbleAmp;
        ctx.save();
        ctx.translate(x, l.y);
        ctx.rotate(l.rotation);
        ctx.globalAlpha = l.opacity;

        const s = l.size;
        const color = `hsl(${l.hue}, 50%, ${l.lightness}%)`;
        const colorLight = `hsl(${l.hue}, 55%, ${l.lightness + 12}%)`;

        if (l.variant === 0) {
            // Pointed ellipse leaf
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.6, -s * 0.3, s * 0.6, s * 0.3, 0, s);
            ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.6, -s * 0.3, 0, -s);
            ctx.fillStyle = color;
            ctx.fill();

            // Midrib
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.9);
            ctx.lineTo(0, s * 0.9);
            ctx.strokeStyle = colorLight;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        } else {
            // Three-lobe leaf (maple-like simplified)
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.4, -s * 0.7, s * 0.9, -s * 0.3, s * 0.7, 0);
            ctx.bezierCurveTo(s * 0.9, s * 0.2, s * 0.5, s * 0.5, 0, s * 0.8);
            ctx.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.9, s * 0.2, -s * 0.7, 0);
            ctx.bezierCurveTo(-s * 0.9, -s * 0.3, -s * 0.4, -s * 0.7, 0, -s);
            ctx.fillStyle = color;
            ctx.fill();

            // Midrib
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.85);
            ctx.lineTo(0, s * 0.7);
            ctx.strokeStyle = colorLight;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    // ---- Fireflies ----
    const FIREFLY_COUNT = isMobile ? 18 : 35;
    let fireflies = [];

    function createFirefly() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 1.5 + Math.random() * 2.5,
            glowR: 8 + Math.random() * 15,
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015 + Math.random() * 0.025,
            hue: 40 + Math.random() * 35, // 40-75: warm yellow to amber
            brightness: 0.4 + Math.random() * 0.5
        };
    }

    for (let i = 0; i < FIREFLY_COUNT; i++) {
        fireflies.push(createFirefly());
    }

    function drawFirefly(f) {
        const pulse = 0.4 + 0.6 * Math.pow(Math.sin(f.phase), 2);
        const alpha = f.brightness * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowR * pulse);
        glow.addColorStop(0, `hsla(${f.hue}, 80%, 65%, ${alpha * 0.5})`);
        glow.addColorStop(0.4, `hsla(${f.hue}, 70%, 55%, ${alpha * 0.15})`);
        glow.addColorStop(1, `hsla(${f.hue}, 60%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.glowR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 90%, 75%, ${alpha})`;
        ctx.fill();
    }

    // ---- Cherry Blossoms (at cursor) ----
    let blossoms = [];
    const BLOSSOM_DIST = 70; // min cursor distance to spawn new blossom

    function spawnBlossom(x, y) {
        const petalCount = 5;
        const size = 10 + Math.random() * 14;
        blossoms.push({
            x: x,
            y: y,
            size: size,
            petalCount: petalCount,
            bloom: 0,       // 0→1 = opening
            fade: 1,        // 1→0 = fading out
            phase: 'bloom',  // bloom → hold → fade
            holdTimer: 0,
            rotation: Math.random() * Math.PI * 2,
            // Pale pink cherry blossom: hue 340-350, low saturation
            hue: 338 + Math.random() * 14,
            saturation: 30 + Math.random() * 15,
            lightness: 78 + Math.random() * 10
        });
    }

    function drawBlossom(b) {
        const scale = b.phase === 'bloom' ? b.bloom : 1;
        const alpha = b.fade * 0.35; // semi-transparent, not bright
        if (alpha <= 0) return;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.globalAlpha = alpha;

        const r = b.size * scale;
        const color = `hsl(${b.hue}, ${b.saturation}%, ${b.lightness}%)`;
        const colorInner = `hsl(${b.hue + 5}, ${b.saturation + 10}%, ${b.lightness - 8}%)`;

        // Draw petals
        for (let i = 0; i < b.petalCount; i++) {
            const angle = (Math.PI * 2 / b.petalCount) * i;
            ctx.save();
            ctx.rotate(angle);

            // Petal shape — rounded teardrop
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(r * 0.35, -r * 0.2, r * 0.8, -r * 0.35, r * 0.75, 0);
            ctx.bezierCurveTo(r * 0.8, r * 0.35, r * 0.35, r * 0.2, 0, 0);
            ctx.fillStyle = color;
            ctx.fill();

            // Petal vein
            ctx.beginPath();
            ctx.moveTo(r * 0.1, 0);
            ctx.lineTo(r * 0.6, 0);
            ctx.strokeStyle = colorInner;
            ctx.lineWidth = 0.4;
            ctx.globalAlpha = alpha * 0.5;
            ctx.stroke();
            ctx.globalAlpha = alpha;

            ctx.restore();
        }

        // Center — small warm dot
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 60%, 70%, ${alpha * 1.5})`;
        ctx.fill();

        ctx.restore();
    }

    // ---- Animation loop ----
    function update() {
        // Spawn blossom at cursor when moved enough
        if (cursorX > 0 && cursorY > 0) {
            const dx = cursorX - lastBlossomX;
            const dy = cursorY - lastBlossomY;
            if (Math.sqrt(dx * dx + dy * dy) > BLOSSOM_DIST) {
                spawnBlossom(cursorX, cursorY);
                lastBlossomX = cursorX;
                lastBlossomY = cursorY;
            }
        }

        // Update blossoms
        blossoms.forEach(b => {
            if (b.phase === 'bloom') {
                b.bloom += 0.025;
                if (b.bloom >= 1) { b.bloom = 1; b.phase = 'hold'; }
            } else if (b.phase === 'hold') {
                b.holdTimer += 1;
                if (b.holdTimer > 60) b.phase = 'fade'; // ~1 sec hold
            } else if (b.phase === 'fade') {
                b.fade -= 0.008;
            }
        });
        blossoms = blossoms.filter(b => b.fade > 0);

        // Update leaves
        leaves.forEach(l => {
            l.y += l.speed;
            l.x += l.drift;
            l.wobblePhase += l.wobbleFreq;
            l.rotation += l.rotSpeed;

            // Respawn if off-screen
            if (l.y > H + l.size * 2) {
                l.y = -l.size - Math.random() * 100;
                l.x = Math.random() * W;
            }
            // Wrap horizontally
            if (l.x < -l.size * 2) l.x = W + l.size;
            if (l.x > W + l.size * 2) l.x = -l.size;
        });

        // Update fireflies
        fireflies.forEach(f => {
            f.phase += f.pulseSpeed;
            f.x += f.vx;
            f.y += f.vy;

            // Gentle random direction change
            f.vx += (Math.random() - 0.5) * 0.02;
            f.vy += (Math.random() - 0.5) * 0.02;
            f.vx *= 0.99;
            f.vy *= 0.99;

            // Keep within bounds with soft bounce
            if (f.x < 0) f.vx += 0.05;
            if (f.x > W) f.vx -= 0.05;
            if (f.y < 0) f.vy += 0.05;
            if (f.y > H) f.vy -= 0.05;
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw fireflies behind leaves
        fireflies.forEach(f => drawFirefly(f));

        // Draw cherry blossoms (behind leaves, above fireflies)
        blossoms.forEach(b => drawBlossom(b));

        // Draw leaves
        leaves.forEach(l => drawLeaf(l));
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
})();
