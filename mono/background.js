/* ========================================
   Mono Background — Pencil Sketch Lines
   Draws fading pencil-like strokes following
   the cursor movement
   ======================================== */

(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    let W, H;

    // Store all stroke segments with their opacity
    let strokes = [];
    const MAX_STROKES = 600;
    const FADE_RATE = 0.003;

    let lastX = -1, lastY = -1;

    function redrawStrokes() {
        ctx.clearRect(0, 0, W, H);
        strokes.forEach(s => {
            if (s.opacity <= 0) return;
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.strokeStyle = `rgba(${s.shade}, ${s.shade}, ${s.shade}, ${s.opacity})`;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
    }

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        redrawStrokes();
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;

        if (lastX >= 0 && lastY >= 0) {
            const dx = x - lastX;
            const dy = y - lastY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 2) {
                // Main pencil stroke — dark graphite
                strokes.push({
                    x1: lastX, y1: lastY,
                    x2: x, y2: y,
                    opacity: 0.35,
                    width: 1.2 + Math.min(dist * 0.015, 1.0),
                    shade: 60 + Math.floor(Math.random() * 60)
                });

                // Secondary lighter stroke slightly offset (pencil texture)
                if (dist > 5) {
                    const offsetX = (Math.random() - 0.5) * 3;
                    const offsetY = (Math.random() - 0.5) * 3;
                    strokes.push({
                        x1: lastX + offsetX, y1: lastY + offsetY,
                        x2: x + offsetX, y2: y + offsetY,
                        opacity: 0.18,
                        width: 0.5 + Math.random() * 0.7,
                        shade: 80 + Math.floor(Math.random() * 60)
                    });
                }

                if (strokes.length > MAX_STROKES) {
                    strokes = strokes.slice(strokes.length - MAX_STROKES);
                }
            }
        }

        lastX = x;
        lastY = y;
    });

    document.addEventListener('mouseleave', () => {
        lastX = -1;
        lastY = -1;
    });

    // Mobile: draw on touch
    if (isMobile) {
        document.addEventListener('touchmove', e => {
            const t = e.touches[0];
            const x = t.clientX;
            const y = t.clientY;
            if (lastX >= 0 && lastY >= 0) {
                strokes.push({
                    x1: lastX, y1: lastY,
                    x2: x, y2: y,
                    opacity: 0.35,
                    width: 1.2,
                    shade: 60 + Math.floor(Math.random() * 60)
                });
            }
            lastX = x;
            lastY = y;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            lastX = -1;
            lastY = -1;
        });
    }

    // ---- One-time auto-draw: "Hello" or heart ----
    let autoDrawDone = false;

    // Heart path (points relative to center, ~60px size)
    function heartPoints(cx, cy, size) {
        const pts = [];
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            // Heart parametric: x = 16sin³(t), y = -(13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            pts.push([cx + x * (size / 17), cy + y * (size / 17)]);
        }
        return pts;
    }

    // Cursive "hello" — single continuous stroke, no pen lift
    function cursiveHelloPoints(ox, oy, size) {
        const s = size / 40;
        // One continuous path: h → e → l → l → o (all connected)
        const raw = [
            // h: upstroke from baseline
            [0, 40], [-0.5, 35], [-1, 28], [-1, 18], [-0.5, 8], [0, 0],
            // h: downstroke (slight offset right)
            [1, 6], [2, 14], [2, 22], [2, 28],
            // h: hump — curve up and over
            [4, 22], [6, 17], [9, 14], [12, 15], [14, 19], [15, 26], [15, 34], [16, 40],
            // connect to e
            [18, 36], [19, 30],
            // e: up loop
            [20, 24], [21, 20], [23, 17], [26, 17], [28, 19], [28, 22],
            // e: crossbar back left then exit down-right
            [26, 23], [23, 23], [21, 24],
            [21, 28], [22, 33], [24, 37], [27, 40],
            // connect to first l
            [28, 38], [29, 32],
            // l: tall upstroke
            [29, 24], [29, 16], [29, 8], [30, 0],
            // l: downstroke
            [31, 8], [31, 16], [31, 24], [31, 32], [31, 40],
            // connect to second l
            [32, 38], [33, 32],
            // l: tall upstroke
            [33, 24], [33, 16], [33, 8], [34, 0],
            // l: downstroke
            [35, 8], [35, 16], [35, 24], [35, 32], [35, 40],
            // connect to o
            [37, 36], [38, 30],
            // o: oval loop
            [39, 24], [40, 20], [42, 17], [45, 17], [47, 19], [48, 24],
            [48, 30], [47, 36], [45, 40], [43, 40], [41, 38], [39, 34],
            // tail flourish
            [40, 40], [42, 42]
        ];
        return raw.map(p => [ox + p[0] * s, oy + p[1] * s]);
    }

    function addPencilPath(points, delayMs) {
        // Add strokes along the path with staggered timing
        for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const delay = delayMs + i * 30; // 30ms per segment
            setTimeout(() => {
                // Slight jitter for hand-drawn feel
                const jx = (Math.random() - 0.5) * 1.5;
                const jy = (Math.random() - 0.5) * 1.5;
                strokes.push({
                    x1: p0[0] + jx, y1: p0[1] + jy,
                    x2: p1[0] + jx, y2: p1[1] + jy,
                    opacity: 0.4,
                    width: 1.0 + Math.random() * 0.5,
                    shade: 50 + Math.floor(Math.random() * 50)
                });
                // Secondary lighter stroke for texture
                if (Math.random() > 0.4) {
                    strokes.push({
                        x1: p0[0] + jx + (Math.random()-0.5)*2,
                        y1: p0[1] + jy + (Math.random()-0.5)*2,
                        x2: p1[0] + jx + (Math.random()-0.5)*2,
                        y2: p1[1] + jy + (Math.random()-0.5)*2,
                        opacity: 0.2,
                        width: 0.4 + Math.random() * 0.4,
                        shade: 70 + Math.floor(Math.random() * 50)
                    });
                }
            }, delay);
        }
    }

    function autoDrawOnce() {
        if (autoDrawDone) return;
        autoDrawDone = true;

        // Random position — keep away from edges
        const margin = 120;
        const cx = margin + Math.random() * (W - margin * 2);
        const cy = margin + Math.random() * (H - margin * 2);

        // Pick heart or Hello randomly
        if (Math.random() > 0.5) {
            // Heart (bigger)
            const pts = heartPoints(cx, cy, 45 + Math.random() * 20);
            addPencilPath(pts, 0);
        } else {
            // Cursive Hello — one continuous stroke
            const size = 70 + Math.random() * 20;
            const pts = cursiveHelloPoints(cx - size * 1.2, cy - size * 0.5, size);
            addPencilPath(pts, 0);
        }
    }

    // Trigger once after 3 seconds
    setTimeout(autoDrawOnce, 3000);

    function loop() {
        ctx.clearRect(0, 0, W, H);

        let i = strokes.length;
        while (i--) {
            const s = strokes[i];
            s.opacity -= FADE_RATE;
            if (s.opacity <= 0) {
                strokes.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.strokeStyle = `rgba(${s.shade}, ${s.shade}, ${s.shade}, ${s.opacity})`;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        requestAnimationFrame(loop);
    }

    loop();
})();
