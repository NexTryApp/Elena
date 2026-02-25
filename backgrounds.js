/* ========================================
   Portfolio Background Effects System
   Fire (WebGL), Ocean, Cosmos, Forest, Mono
   ======================================== */

class BackgroundManager {
    constructor() {
        this.fluidCanvas = document.getElementById('fluid-canvas');
        this.bgCanvas = document.getElementById('bg-canvas');
        this.ctx = null;
        this.currentEffect = null;
        this.currentTheme = null;
        this.animationId = null;
        this.running = false;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('resize', () => this._resize());
    }

    setTheme(theme) {
        if (this.currentTheme === theme) return;
        this.destroy();
        this.currentTheme = theme;

        if (theme === 'fire') {
            this.fluidCanvas.style.visibility = 'visible';
            this.fluidCanvas.style.opacity = '';
            this.bgCanvas.style.display = 'none';
            this._initFire();
        } else {
            this.fluidCanvas.style.visibility = 'hidden';
            this.fluidCanvas.style.opacity = '0';
            this.bgCanvas.style.display = 'block';
            this._initBgCanvas();

            if (theme === 'ocean') this.currentEffect = new OceanEffect(this);
            else if (theme === 'cosmos') this.currentEffect = new CosmosEffect(this);
            else if (theme === 'forest') this.currentEffect = new ForestEffect(this);
            else if (theme === 'mono') this.currentEffect = new MonoEffect(this);

            this.running = true;
            this._animate();
        }
    }

    destroy() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.currentEffect && this.currentEffect.destroy) {
            this.currentEffect.destroy();
        }
        this.currentEffect = null;
    }

    _initBgCanvas() {
        this.bgCanvas.width = window.innerWidth * this.dpr;
        this.bgCanvas.height = window.innerHeight * this.dpr;
        this.bgCanvas.style.width = '100vw';
        this.bgCanvas.style.height = '100vh';
        this.ctx = this.bgCanvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);
    }

    _resize() {
        if (this.currentTheme !== 'fire' && this.bgCanvas.style.display !== 'none') {
            this.bgCanvas.width = window.innerWidth * this.dpr;
            this.bgCanvas.height = window.innerHeight * this.dpr;
            this.ctx = this.bgCanvas.getContext('2d');
            this.ctx.scale(this.dpr, this.dpr);
        }
    }

    _animate() {
        if (!this.running) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.ctx.clearRect(0, 0, w, h);
        if (this.currentEffect) {
            this.currentEffect.update(w, h, this.mouseX, this.mouseY);
            this.currentEffect.draw(this.ctx, w, h);
        }
        this.animationId = requestAnimationFrame(() => this._animate());
    }

    _initFire() {
        this.fluidCanvas.style.pointerEvents = 'auto';
    }
}

/* ========== Ocean Effect — Realistic Soap Bubbles ========== */
class OceanEffect {
    constructor(mgr) {
        this.mgr = mgr;
        this.maxBubbles = mgr.isMobile ? 25 : 45;
        this.bubbles = [];
        this.popParticles = [];
        for (let i = 0; i < this.maxBubbles; i++) {
            this.bubbles.push(this._createBubble(true));
        }
    }

    _createBubble(initial) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const r = 5 + Math.random() * 30;
        return {
            x: Math.random() * w,
            y: initial ? Math.random() * h : h + r + Math.random() * 80,
            r: r,
            speed: 0.15 + Math.random() * 0.5 + (30 - r) * 0.01,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: 8 + Math.random() * 15,
            wobbleFreq: 0.006 + Math.random() * 0.008,
            // Sky-blue iridescence — soft pastels
            hueBase: 190 + Math.random() * 40,
            hueShift: 0.15 + Math.random() * 0.3,
            alive: true
        };
    }

    _popBubble(b) {
        // Create pop particles
        const count = 5 + Math.floor(b.r / 4);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            this.popParticles.push({
                x: b.x + Math.sin(b.wobblePhase) * b.wobbleAmp,
                y: b.y,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                r: 1 + Math.random() * 2,
                life: 1.0,
                hue: b.hueBase
            });
        }
        b.alive = false;
    }

    update(w, h, mx, my) {
        // Update bubbles
        this.bubbles.forEach((b, i) => {
            if (!b.alive) return;
            b.y -= b.speed;
            b.wobblePhase += b.wobbleFreq;
            b.hueBase += b.hueShift;

            const bx = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;

            // Check mouse collision — POP!
            const dx = mx - bx;
            const dy = my - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < b.r + 15) {
                this._popBubble(b);
            }

            // Off screen — respawn
            if (b.y + b.r < -30) {
                b.alive = false;
            }
        });

        // Remove dead, respawn
        this.bubbles = this.bubbles.filter(b => b.alive);
        while (this.bubbles.length < this.maxBubbles) {
            this.bubbles.push(this._createBubble(false));
        }

        // Update pop particles
        this.popParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.life -= 0.04;
        });
        this.popParticles = this.popParticles.filter(p => p.life > 0);
    }

    draw(ctx, w, h) {
        // Draw bubbles
        this.bubbles.forEach(b => {
            if (!b.alive) return;
            const x = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
            const r = b.r;
            const hue = b.hueBase % 360;

            // Soft shadow for depth
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = r * 0.4;
            ctx.shadowOffsetY = r * 0.15;

            // Subtle fill — gradient from transparent to light blue
            const fillGrad = ctx.createRadialGradient(x - r * 0.2, b.y - r * 0.2, r * 0.1, x, b.y, r);
            fillGrad.addColorStop(0, `hsla(${hue}, 50%, 90%, 0.2)`);
            fillGrad.addColorStop(0.6, `hsla(${hue}, 40%, 85%, 0.08)`);
            fillGrad.addColorStop(1, `hsla(${hue}, 30%, 80%, 0.12)`);
            ctx.beginPath();
            ctx.arc(x, b.y, r, 0, Math.PI * 2);
            ctx.fillStyle = fillGrad;
            ctx.fill();
            ctx.restore();

            // Iridescent rim — thicker, more visible
            ctx.beginPath();
            ctx.arc(x, b.y, r, 0, Math.PI * 2);
            const rimGrad = ctx.createLinearGradient(x - r, b.y - r, x + r, b.y + r);
            rimGrad.addColorStop(0, `hsla(${hue}, 60%, 70%, 0.5)`);
            rimGrad.addColorStop(0.3, `hsla(${(hue + 40) % 360}, 50%, 65%, 0.35)`);
            rimGrad.addColorStop(0.6, `hsla(${(hue + 120) % 360}, 50%, 70%, 0.35)`);
            rimGrad.addColorStop(1, `hsla(${(hue + 200) % 360}, 60%, 65%, 0.5)`);
            ctx.strokeStyle = rimGrad;
            ctx.lineWidth = r > 15 ? 2 : 1.2;
            ctx.stroke();

            // Highlight — top-left white crescent (bright)
            ctx.beginPath();
            ctx.arc(x - r * 0.3, b.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (r / 60)})`;
            ctx.fill();

            // Small secondary highlight
            ctx.beginPath();
            ctx.arc(x + r * 0.2, b.y + r * 0.25, r * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
        });

        // Draw pop particles
        this.popParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue % 360}, 50%, 80%, ${p.life * 0.5})`;
            ctx.fill();
        });
    }

    destroy() {
        this.bubbles = [];
        this.popParticles = [];
    }
}

/* ========== Cosmos Effect — Dark Blue Stars + Shooting Stars ========== */
class CosmosEffect {
    constructor(mgr) {
        this.mgr = mgr;
        const starCount = mgr.isMobile ? 120 : 220;
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.3 + Math.random() * 1.5,
                twinkleSpeed: 0.005 + Math.random() * 0.015,
                twinklePhase: Math.random() * Math.PI * 2,
                brightness: 0.3 + Math.random() * 0.7,
                // Warm white / cool blue star colors
                temp: Math.random()
            });
        }
        this.shootingStars = [];
        this.nextShoot = performance.now() + 2000 + Math.random() * 3000;
        // Nebula clouds — dark blue tones
        this.nebulae = [];
        for (let i = 0; i < 3; i++) {
            this.nebulae.push({
                x: 0.2 + Math.random() * 0.6,
                y: 0.2 + Math.random() * 0.6,
                r: 100 + Math.random() * 200,
                hue: 210 + Math.random() * 30,
                drift: { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.03 }
            });
        }
    }

    update(w, h) {
        const now = performance.now();
        this.stars.forEach(s => { s.twinklePhase += s.twinkleSpeed; });
        this.nebulae.forEach(n => {
            n.x += n.drift.x / w;
            n.y += n.drift.y / h;
            if (n.x < 0 || n.x > 1) n.drift.x *= -1;
            if (n.y < 0 || n.y > 1) n.drift.y *= -1;
        });
        if (now > this.nextShoot) {
            this.shootingStars.push({
                x: Math.random() * w * 0.8,
                y: Math.random() * h * 0.3,
                vx: 5 + Math.random() * 7,
                vy: 2 + Math.random() * 3,
                life: 1.0,
                length: 50 + Math.random() * 70
            });
            this.nextShoot = now + 3000 + Math.random() * 5000;
        }
        this.shootingStars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.012;
        });
        this.shootingStars = this.shootingStars.filter(s => s.life > 0);
    }

    draw(ctx, w, h) {
        // Nebulae — dark blue
        this.nebulae.forEach(n => {
            const grad = ctx.createRadialGradient(n.x * w, n.y * h, 0, n.x * w, n.y * h, n.r);
            grad.addColorStop(0, `hsla(${n.hue}, 50%, 25%, 0.05)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        });
        // Stars — warm white to cool blue
        this.stars.forEach(s => {
            const alpha = s.brightness * (0.5 + 0.5 * Math.sin(s.twinklePhase));
            // Color: warm stars are yellowish-white, cool are blue-white
            let r, g, b;
            if (s.temp > 0.7) { r = 255; g = 240; b = 200; }
            else if (s.temp > 0.3) { r = 255; g = 255; b = 255; }
            else { r = 180; g = 210; b = 255; }
            ctx.beginPath();
            ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.fill();
        });
        // Shooting stars — white-blue streak
        this.shootingStars.forEach(s => {
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

    destroy() {
        this.stars = [];
        this.shootingStars = [];
    }
}

/* ========== Forest Effect — Grass-Green Leaves + Warm Fireflies ========== */
class ForestEffect {
    constructor(mgr) {
        this.mgr = mgr;
        const leafCount = mgr.isMobile ? 12 : 22;
        const fireflyCount = mgr.isMobile ? 18 : 35;
        this.leaves = [];
        for (let i = 0; i < leafCount; i++) {
            this.leaves.push(this._createLeaf(true));
        }
        this.fireflies = [];
        for (let i = 0; i < fireflyCount; i++) {
            this.fireflies.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: 1.5 + Math.random() * 2,
                glowPhase: Math.random() * Math.PI * 2,
                glowSpeed: 0.02 + Math.random() * 0.03,
                // Warm yellow-green firefly glow
                hue: 45 + Math.random() * 25
            });
        }
    }

    _createLeaf(initial) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return {
            x: Math.random() * w,
            y: initial ? Math.random() * h : -30,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            fallSpeed: 0.15 + Math.random() * 0.3,
            driftX: (Math.random() - 0.5) * 0.6,
            size: 6 + Math.random() * 10,
            opacity: 0.08 + Math.random() * 0.12,
            // Grass/natural green range: hue 95-135 (not neon 80)
            hue: 95 + Math.random() * 40,
            sat: 30 + Math.random() * 20,
            light: 25 + Math.random() * 15,
            wobblePhase: Math.random() * Math.PI * 2
        };
    }

    update(w, h) {
        this.leaves.forEach((l, i) => {
            l.y += l.fallSpeed;
            l.x += l.driftX + Math.sin(l.wobblePhase) * 0.2;
            l.rotation += l.rotSpeed;
            l.wobblePhase += 0.008;
            if (l.y > h + 30) {
                this.leaves[i] = this._createLeaf(false);
            }
        });
        this.fireflies.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            f.glowPhase += f.glowSpeed;
            if (Math.random() < 0.01) {
                f.vx = (Math.random() - 0.5) * 0.5;
                f.vy = (Math.random() - 0.5) * 0.5;
            }
            if (f.x < 0) f.x = w;
            if (f.x > w) f.x = 0;
            if (f.y < 0) f.y = h;
            if (f.y > h) f.y = 0;
        });
    }

    draw(ctx, w, h) {
        // Leaves — natural grass tones
        this.leaves.forEach(l => {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rotation);
            // Leaf shape — pointed ellipse
            ctx.beginPath();
            ctx.moveTo(l.size, 0);
            ctx.quadraticCurveTo(0, -l.size * 0.5, -l.size, 0);
            ctx.quadraticCurveTo(0, l.size * 0.5, l.size, 0);
            ctx.fillStyle = `hsla(${l.hue}, ${l.sat}%, ${l.light}%, ${l.opacity})`;
            ctx.fill();
            // Center vein
            ctx.beginPath();
            ctx.moveTo(-l.size * 0.8, 0);
            ctx.lineTo(l.size * 0.8, 0);
            ctx.strokeStyle = `hsla(${l.hue}, ${l.sat - 10}%, ${l.light + 10}%, ${l.opacity * 0.4})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
            ctx.restore();
        });
        // Fireflies — warm yellow glow
        this.fireflies.forEach(f => {
            const glow = 0.3 + 0.7 * Math.abs(Math.sin(f.glowPhase));
            const glowR = f.r + glow * 8;
            const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
            grad.addColorStop(0, `hsla(${f.hue}, 80%, 60%, ${0.25 * glow})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(f.x - glowR, f.y - glowR, glowR * 2, glowR * 2);
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r * glow, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${f.hue}, 90%, 70%, ${0.5 * glow})`;
            ctx.fill();
        });
    }

    destroy() {
        this.leaves = [];
        this.fireflies = [];
    }
}

/* ========== Mono Effect — Mouse-Following Circles ========== */
class MonoEffect {
    constructor(mgr) {
        this.mgr = mgr;
        const count = mgr.isMobile ? 8 : 12;
        this.orbs = [];
        for (let i = 0; i < count; i++) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.orbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: 0,
                vy: 0,
                r: 20 + Math.random() * 100,
                springK: 0.003 + Math.random() * 0.012,
                damping: 0.92 + Math.random() * 0.06,
                shade: Math.floor(180 + Math.random() * 60),
                opacity: 0.04 + Math.random() * 0.08,
                driftAngle: Math.random() * Math.PI * 2,
                driftSpeed: 0.2 + Math.random() * 0.4
            });
        }
    }

    update(w, h, mx, my) {
        this.orbs.forEach(o => {
            if (this.mgr.isMobile) {
                o.driftAngle += 0.003 + Math.random() * 0.002;
                o.x += Math.cos(o.driftAngle) * o.driftSpeed;
                o.y += Math.sin(o.driftAngle) * o.driftSpeed;
                if (o.x < -o.r) o.x = w + o.r;
                if (o.x > w + o.r) o.x = -o.r;
                if (o.y < -o.r) o.y = h + o.r;
                if (o.y > h + o.r) o.y = -o.r;
            } else {
                const dx = mx - o.x;
                const dy = my - o.y;
                o.vx += dx * o.springK;
                o.vy += dy * o.springK;
                o.vx *= o.damping;
                o.vy *= o.damping;
                o.x += o.vx;
                o.y += o.vy;
            }
        });
    }

    draw(ctx, w, h) {
        this.orbs.forEach(o => {
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${o.shade}, ${o.shade}, ${o.shade}, ${o.opacity})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${o.shade}, ${o.shade}, ${o.shade}, ${o.opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });
    }

    destroy() { this.orbs = []; }
}

// Initialize
window.backgroundManager = new BackgroundManager();
