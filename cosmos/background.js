/* ========================================
   Cosmos Background — Stars + Shooting Stars
   Deep navy twinkling stars, nebula clouds
   ======================================== */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    let W, H;
    let mouseX = W / 2, mouseY = H / 2;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (mouseX === undefined) { mouseX = W / 2; mouseY = H / 2; }
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Stars
    const starCount = isMobile ? 60 : 240;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
        const temp = Math.random();
        let r, g, b;
        if (temp > 0.7) { r = 255; g = 240; b = 200; }       // warm white
        else if (temp > 0.3) { r = 255; g = 255; b = 255; }   // pure white
        else { r = 180; g = 210; b = 255; }                      // cool blue
        stars.push({
            x: Math.random(),
            y: Math.random(),
            radius: 0.3 + Math.random() * 1.8,
            twinkleSpeed: 0.004 + Math.random() * 0.015,
            twinklePhase: Math.random() * Math.PI * 2,
            brightness: 0.3 + Math.random() * 0.7,
            r, g, b
        });
    }

    // Shooting stars — fly toward mouse, every 2s, 0.3s spawn delay
    let shootingStars = [];
    let nextShoot = performance.now() + 2000;
    const SHOOT_INTERVAL = isMobile ? 4000 : 2000;
    const SHOOT_DELAY = 300; // ms delay between trigger and actual spawn

    // Nebulae — very subtle
    const nebulae = [];
    const nebulaCount = isMobile ? 1 : 3;
    for (let i = 0; i < nebulaCount; i++) {
        nebulae.push({
            x: 0.15 + Math.random() * 0.7,
            y: 0.15 + Math.random() * 0.7,
            r: 120 + Math.random() * 200,
            hue: 215 + Math.random() * 30,
            dx: (Math.random() - 0.5) * 0.04,
            dy: (Math.random() - 0.5) * 0.02
        });
    }

    // Cosmic shimmer — large golden/warm aurora clouds
    const shimmers = [];
    const shimmerHues = [40, 50, 35, 55, 45]; // gold, yellow, amber, warm yellow, gold
    const shimmerCount = isMobile ? 2 : 5;
    for (let i = 0; i < shimmerCount; i++) {
        shimmers.push({
            x: Math.random(),
            y: Math.random(),
            rx: 200 + Math.random() * 300, // ellipse radii
            ry: 100 + Math.random() * 200,
            baseHue: shimmerHues[i % shimmerHues.length],
            hueShift: 0,
            hueSpeed: 0.15 + Math.random() * 0.25,
            angle: Math.random() * Math.PI * 2,
            angleSpeed: 0.0003 + Math.random() * 0.0006,
            driftX: (Math.random() - 0.5) * 0.08,
            driftY: (Math.random() - 0.5) * 0.05,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.008 + Math.random() * 0.012,
            baseAlpha: 0.025 + Math.random() * 0.02
        });
    }

    function update() {
        const now = performance.now();

        stars.forEach(s => { s.twinklePhase += s.twinkleSpeed; });

        nebulae.forEach(n => {
            n.x += n.dx / W;
            n.y += n.dy / H;
            if (n.x < 0 || n.x > 1) n.dx *= -1;
            if (n.y < 0 || n.y > 1) n.dy *= -1;
        });

        // Update cosmic shimmers
        shimmers.forEach(s => {
            s.hueShift += s.hueSpeed;
            s.angle += s.angleSpeed;
            s.pulsePhase += s.pulseSpeed;
            s.x += s.driftX / W;
            s.y += s.driftY / H;
            // Soft bounce within viewport
            if (s.x < -0.2 || s.x > 1.2) s.driftX *= -1;
            if (s.y < -0.2 || s.y > 1.2) s.driftY *= -1;
        });

        if (now > nextShoot) {
            // Capture mouse target at trigger time, spawn after SHOOT_DELAY
            const targetX = mouseX;
            const targetY = mouseY;
            setTimeout(() => {
                // Spawn from a random edge/corner toward the captured mouse position
                const edge = Math.random();
                let sx, sy;
                if (edge < 0.4) { sx = Math.random() * W; sy = -10; }         // top
                else if (edge < 0.7) { sx = -10; sy = Math.random() * H * 0.5; } // left
                else { sx = W + 10; sy = Math.random() * H * 0.3; }             // right

                const dx = targetX - sx;
                const dy = targetY - sy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const speed = 8 + Math.random() * 5;

                shootingStars.push({
                    x: sx,
                    y: sy,
                    vx: (dx / dist) * speed,
                    vy: (dy / dist) * speed,
                    life: 1.0,
                    length: 60 + Math.random() * 70
                });
            }, SHOOT_DELAY);
            nextShoot = now + SHOOT_INTERVAL;
        }

        shootingStars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.012;
        });
        shootingStars = shootingStars.filter(s => s.life > 0);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Cosmic shimmers — aurora-like iridescent clouds
        shimmers.forEach(s => {
            const cx = s.x * W;
            const cy = s.y * H;
            const pulse = 0.6 + 0.4 * Math.sin(s.pulsePhase);
            const hue = (s.baseHue + s.hueShift) % 360;
            const hue2 = (hue + 60) % 360;
            const alpha = s.baseAlpha * pulse;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(s.angle);

            // Main elliptical glow
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.rx);
            grad.addColorStop(0, `hsla(${hue}, 65%, 45%, ${alpha * 1.2})`);
            grad.addColorStop(0.3, `hsla(${hue2}, 55%, 40%, ${alpha * 0.7})`);
            grad.addColorStop(0.6, `hsla(${(hue + 120) % 360}, 50%, 35%, ${alpha * 0.3})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.scale(1, s.ry / s.rx); // stretch into ellipse
            ctx.beginPath();
            ctx.arc(0, 0, s.rx, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Nebulae
        nebulae.forEach(n => {
            const nx = n.x * W, ny = n.y * H;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
            grad.addColorStop(0, `hsla(${n.hue}, 50%, 20%, 0.05)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Stars
        stars.forEach(s => {
            const alpha = s.brightness * (0.5 + 0.5 * Math.sin(s.twinklePhase));
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.r}, ${s.g}, ${s.b}, ${alpha})`;
            ctx.fill();
        });

        // Shooting stars
        shootingStars.forEach(s => {
            const tailX = s.x - s.vx * s.length / 6;
            const tailY = s.y - s.vy * s.length / 6;
            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(200, 220, 255, ${s.life * 0.9})`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Head glow
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
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
