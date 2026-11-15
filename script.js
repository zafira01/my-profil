document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== SCROLL: progress bar, navbar state, hero parallax ========== */
const progress = document.getElementById('progress');
const nav = document.getElementById('nav');
const heroBg = document.getElementById('heroBg');
let ticking = false;

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 40);

    if (!reduceMotion && y < window.innerHeight * 1.2) {
        heroBg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0) scale(' + (1 + y * 0.00006) + ')';
    }
    ticking = false;
}
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });
onScroll();

/* ========== NAVBAR: sliding gold pill + scroll spy + mobile menu ========== */
const navLinks = document.getElementById('navLinks');
const navPill = document.getElementById('navPill');
const links = [...navLinks.querySelectorAll('a:not(.nav-cta)')];
const burger = document.getElementById('burger');

function movePill(target) {
    if (!target || window.innerWidth <= 820) return;
    const box = navLinks.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    navPill.style.width = r.width + 'px';
    navPill.style.transform = 'translateX(' + (r.left - box.left) + 'px)';
    navPill.style.opacity = '1';
}
function activeLink() {
    return links.find(a => a.classList.contains('active'));
}
links.forEach(a => {
    a.addEventListener('mouseenter', () => movePill(a));
    a.addEventListener('focus', () => movePill(a));
});
navLinks.addEventListener('mouseleave', () => movePill(activeLink()));

function setActive(id) {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    movePill(activeLink());
}

const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) setActive(e.target.id);
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

window.addEventListener('resize', () => movePill(activeLink()));
window.addEventListener('load', () => movePill(activeLink()));

function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
}
burger.addEventListener('click', () => toggleMenu());
navLinks.addEventListener('click', e => { if (e.target.closest('a')) toggleMenu(false); });
document.addEventListener('click', e => { if (!nav.contains(e.target)) toggleMenu(false); });

/* ========== SCROLL REVEAL ========== */
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
    });
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ========== SKILL METERS ========== */
const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const level = +card.dataset.level;
        const bar = card.querySelector('.meter i');
        const pct = card.querySelector('.pct');
        bar.style.width = level + '%';

        const duration = reduceMotion ? 0 : 1800;
        const start = performance.now() + 300;
        function tick(now) {
            const t = duration ? Math.min(Math.max((now - start) / duration, 0), 1) : 1;
            const eased = 1 - Math.pow(1 - t, 3);
            pct.textContent = Math.round(level * eased) + '%';
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(card);
    });
}, { threshold: 0.4 });
document.querySelectorAll('.skill').forEach(s => skillObserver.observe(s));

/* ========== TYPING ROLES ========== */
const typedEl = document.getElementById('typed');
const roles = ['Web Developer', 'Mahasiswa Engineering', 'UI/UX Enthusiast', 'Digital Innovator', 'Dreamer'];

if (reduceMotion) {
    typedEl.textContent = roles[0];
} else {
    let ri = 0, ci = 0, deleting = false;
    (function type() {
        const word = roles[ri];
        typedEl.textContent = word.slice(0, ci);
        let delay = deleting ? 45 : 90;

        if (!deleting && ci === word.length) {
            deleting = true;
            delay = 1600;
        } else if (deleting && ci === 0) {
            deleting = false;
            ri = (ri + 1) % roles.length;
            delay = 400;
        } else {
            ci += deleting ? -1 : 1;
        }
        setTimeout(type, delay);
    })();
}

/* ========== GOLD DUST (hero canvas) ========== */
(function dust() {
    if (reduceMotion) return;
    const canvas = document.getElementById('dust');
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w, h, dpr, particles = [], visible = true;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(60, w / 24));
        particles = Array.from({ length: count }, () => spawn(true));
    }
    function spawn(anywhere) {
        return {
            x: Math.random() * w,
            y: anywhere ? Math.random() * h : h + 10,
            r: Math.random() * 2.2 + 0.6,
            vy: Math.random() * 0.35 + 0.1,
            vx: (Math.random() - 0.5) * 0.25,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.01
        };
    }
    function frame() {
        if (visible) {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p, i) => {
                p.y -= p.vy;
                p.x += p.vx + Math.sin(p.phase) * 0.15;
                p.phase += p.speed;
                const a = 0.35 + Math.sin(p.phase * 2) * 0.3;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                g.addColorStop(0, 'rgba(255,236,170,' + Math.max(a, 0.1) + ')');
                g.addColorStop(1, 'rgba(255,236,170,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fill();
                if (p.y < -10) particles[i] = spawn(false);
            });
        }
        requestAnimationFrame(frame);
    }
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hero);
    window.addEventListener('resize', resize);
    resize();
    frame();
})();

/* ========== PROJECT CARDS: soft tilt + gold glow follows pointer ========== */
if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.project').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--ry', ((px - 0.5) * 8).toFixed(2) + 'deg');
            card.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
            card.style.setProperty('--mx', (px * 100) + '%');
            card.style.setProperty('--my', (py * 100) + '%');
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

/* ========== CERTIFICATE LIGHTBOX ========== */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');
let lastFocus = null;

function openLightbox(src, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    lbClose.focus();
}
function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 400);
    if (lastFocus) lastFocus.focus();
}
document.querySelectorAll('.cert').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(btn.dataset.src, btn.dataset.alt));
});
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (!lightbox.hidden) closeLightbox();
        toggleMenu(false);
    }
});

/* ========== FOOTER YEAR ========== */
document.getElementById('year').textContent = new Date().getFullYear();
