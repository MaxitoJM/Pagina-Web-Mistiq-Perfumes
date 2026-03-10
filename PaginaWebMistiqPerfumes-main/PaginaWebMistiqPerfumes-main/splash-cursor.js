const DEFAULT_COLORS = [
    '212,175,55',
    '245,245,220',
    '143,108,20'
];

export function initHeroSplashCursor({
    canvasSelector = '#heroSplashCanvas',
    containerSelector = '#inicio',
    colors = DEFAULT_COLORS
} = {}) {
    const canvas = document.querySelector(canvasSelector);
    const container = document.querySelector(containerSelector);

    if (!canvas || !container) {
        return () => {};
    }

    const context = canvas.getContext('2d');

    if (!context) {
        return () => {};
    }

    const particles = [];
    let animationFrameId = 0;
    let lastPointer = null;
    let isRunning = true;

    function resize() {
        const bounds = container.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(bounds.width * ratio);
        canvas.height = Math.floor(bounds.height * ratio);
        canvas.style.width = `${bounds.width}px`;
        canvas.style.height = `${bounds.height}px`;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(ratio, ratio);
    }

    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function spawnSplash(x, y, intensity = 1) {
        const count = Math.max(2, Math.round(4 * intensity));

        for (let index = 0; index < count; index += 1) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * (2 + intensity * 4),
                vy: (Math.random() - 0.5) * (2 + intensity * 4),
                radius: 18 + Math.random() * 34 * intensity,
                alpha: 0.16 + Math.random() * 0.18,
                life: 0,
                ttl: 28 + Math.random() * 28,
                color: randomColor()
            });
        }
    }

    function getLocalPosition(clientX, clientY) {
        const bounds = canvas.getBoundingClientRect();
        return {
            x: clientX - bounds.left,
            y: clientY - bounds.top
        };
    }

    function handlePointerMove(event) {
        const point = getLocalPosition(event.clientX, event.clientY);
        const dx = lastPointer ? point.x - lastPointer.x : 0;
        const dy = lastPointer ? point.y - lastPointer.y : 0;
        const speed = Math.min(2.2, Math.hypot(dx, dy) / 18 || 0.8);

        spawnSplash(point.x, point.y, speed);
        lastPointer = point;
    }

    function handlePointerLeave() {
        lastPointer = null;
    }

    function handlePointerDown(event) {
        const point = getLocalPosition(event.clientX, event.clientY);
        spawnSplash(point.x, point.y, 2.2);
        lastPointer = point;
    }

    function handleTouchMove(event) {
        const touch = event.touches[0];

        if (!touch) {
            return;
        }

        handlePointerMove(touch);
    }

    function drawParticle(particle) {
        const gradient = context.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius
        );

        gradient.addColorStop(0, `rgba(${particle.color}, ${particle.alpha})`);
        gradient.addColorStop(0.45, `rgba(${particle.color}, ${particle.alpha * 0.45})`);
        gradient.addColorStop(1, `rgba(${particle.color}, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
    }

    function update() {
        if (!isRunning) {
            return;
        }

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        context.clearRect(0, 0, width, height);
        context.fillStyle = 'rgba(0, 0, 0, 0.03)';
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = 'screen';
        context.filter = 'blur(12px)';

        for (let index = particles.length - 1; index >= 0; index -= 1) {
            const particle = particles[index];
            particle.life += 1;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.radius *= 0.988;
            particle.alpha *= 0.985;

            if (particle.life >= particle.ttl || particle.radius <= 6 || particle.alpha <= 0.015) {
                particles.splice(index, 1);
                continue;
            }

            drawParticle(particle);
        }

        context.filter = 'none';
        context.globalCompositeOperation = 'source-over';
        animationFrameId = window.requestAnimationFrame(update);
    }

    resize();
    spawnSplash(canvas.clientWidth * 0.28, canvas.clientHeight * 0.52, 1.6);
    spawnSplash(canvas.clientWidth * 0.72, canvas.clientHeight * 0.38, 1.4);
    update();

    window.addEventListener('resize', resize);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
        isRunning = false;
        window.cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resize);
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointerleave', handlePointerLeave);
        container.removeEventListener('touchmove', handleTouchMove);
    };
}
