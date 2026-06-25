/* ==========================================================================
   BIOSPHERE 2 — ABOUT
   Shared interactions: scroll-reveal, animated counters, magnetic hover,
   sticky TOC, hero spotlight, current year.
   Mirrors education.js with .abt-* selectors.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 1. SCROLL REVEAL ---------- */
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.abt-reveal');
        if (!reveals.length) return;

        // Reduced motion fallback: reveal everything immediately
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            reveals.forEach(el => el.classList.add('abt-revealed'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('abt-revealed');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        reveals.forEach(el => io.observe(el));
    }

    /* ---------- 2. ANIMATED COUNTERS ---------- */
    function animateCounter(el) {
        const target = parseFloat(el.dataset.count || el.textContent.replace(/[^0-9.\-]/g, ''));
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = parseInt(el.dataset.duration || '1600', 10);

        if (isNaN(target)) return;

        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        function tick(now) {
            const p = Math.min(1, (now - start) / duration);
            const value = target * ease(p);
            el.textContent = prefix + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        }
        requestAnimationFrame(tick);
    }

    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            counters.forEach(animateCounter);
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(el => io.observe(el));
    }

    /* ---------- 3. MAGNETIC HOVER ---------- */
    function initMagnetic() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        const targets = document.querySelectorAll('[data-magnetic]');

        targets.forEach(el => {
            const strength = parseFloat(el.dataset.magnetic || '0.3');
            let rafId = null;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
                });
            });

            el.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                el.style.transform = '';
            });
        });
    }

    /* ---------- 4. STICKY TOC — auto-highlight active section ---------- */
    function initTOC() {
        const toc = document.querySelector('.abt-toc');
        if (!toc) return;

        const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
        if (!links.length) return;

        const targets = links
            .map(a => document.querySelector(a.getAttribute('href')))
            .filter(Boolean);

        if (!targets.length) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        targets.forEach(t => io.observe(t));

        // Smooth scroll on click (header offset)
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href');
                if (id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 110;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    /* ---------- 5. HERO SPOTLIGHT (cursor-following radial) ---------- */
    function initHeroSpotlight() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        const heroes = document.querySelectorAll('.abt-hero, .abt-hero-bleed');
        if (!heroes.length) return;

        heroes.forEach(hero => {
            let raf = null;
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    hero.style.setProperty('--abt-spot-x', x + '%');
                    hero.style.setProperty('--abt-spot-y', y + '%');
                });
            });
        });
    }

    /* ---------- 6. CURRENT YEAR ---------- */
    function initYear() {
        document.querySelectorAll('[data-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    /* ---------- 7. NEWSLETTER FORM (graceful submit handler) ---------- */
    function initNewsletter() {
        const form = document.querySelector('[data-abt-newsletter]');
        if (!form) return;
        const note = form.querySelector('.abt-newsletter-note');
        const input = form.querySelector('input[type="email"]');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!input || !input.value || !input.value.includes('@')) {
                if (note) note.textContent = 'Please enter a valid email address.';
                return;
            }
            // Simulated success state — the real Biosphere 2 form is hosted elsewhere
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Subscribed';
                btn.disabled = true;
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.disabled = false;
                    input.value = '';
                    if (note) note.textContent = 'Thank you — look for our next issue in your inbox.';
                }, 2400);
            }
        });
    }

    /* ---------- 8. INITIALIZE ---------- */
    function init() {
        initScrollReveal();
        initCounters();
        initMagnetic();
        initTOC();
        initHeroSpotlight();
        initYear();
        initNewsletter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
