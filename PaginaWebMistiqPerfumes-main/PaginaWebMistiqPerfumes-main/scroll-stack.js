function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function createScrollStack(root, options = {}) {
    if (!root) {
        return {
            refresh() {},
            destroy() {}
        };
    }

    const config = {
        itemDistance: 140,
        itemScale: 0.04,
        itemStackDistance: 26,
        baseScale: 0.88,
        rotationAmount: 1.6,
        blurAmount: 0.45,
        ...options
    };

    let cards = [];
    let ticking = false;

    function readCards() {
        cards = Array.from(root.querySelectorAll('.scroll-stack-card'));

        cards.forEach((card, index) => {
            card.style.setProperty('--stack-index', index);

            if (index < cards.length - 1) {
                card.style.marginBottom = `${config.itemDistance}px`;
            } else {
                card.style.marginBottom = '0px';
            }
        });
    }

    function update() {
        ticking = false;

        if (!cards.length) {
            return;
        }

        const rootRect = root.getBoundingClientRect();
        const absoluteTop = window.scrollY + rootRect.top;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const stackStart = absoluteTop - viewportHeight * 0.22;
        const activeProgress = [];

        cards.forEach((card, index) => {
            const start = stackStart + index * config.itemDistance;
            const end = start + viewportHeight * 0.78;
            const progress = clamp((scrollTop - start) / (end - start), 0, 1);
            activeProgress[index] = progress;
        });

        let topCardIndex = 0;
        activeProgress.forEach((progress, index) => {
            if (progress > 0.1) {
                topCardIndex = index;
            }
        });

        cards.forEach((card, index) => {
            const progress = activeProgress[index];
            const scaleTarget = config.baseScale + index * config.itemScale;
            const scale = 1 - progress * (1 - scaleTarget);
            const translateY = progress * index * config.itemStackDistance;
            const direction = index % 2 === 0 ? -1 : 1;
            const rotation = direction * config.rotationAmount * progress;
            const blur = index < topCardIndex ? (topCardIndex - index) * config.blurAmount : 0;

            card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
            card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        });
    }

    function requestTick() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(update);
    }

    readCards();
    update();

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);

    return {
        refresh() {
            readCards();
            update();
        },
        destroy() {
            window.removeEventListener('scroll', requestTick);
            window.removeEventListener('resize', requestTick);
        }
    };
}
