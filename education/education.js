/* ==========================================================================
   BIOSPHERE 2 — EDUCATION
   Shared interactions: scroll-reveal, animated counters, magnetic hover,
   FAQ accordion, multi-step form, sticky TOC, hero spotlight.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 1. SCROLL REVEAL ---------- */
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.edu-reveal');
        if (!reveals.length) return;

        // Reduced motion fallback: reveal everything immediately
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            reveals.forEach(el => el.classList.add('edu-revealed'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('edu-revealed');
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

    /* ---------- 4. FAQ ACCORDION ---------- */
    function initFAQ() {
        const faqs = document.querySelectorAll('.edu-faq-item');
        if (!faqs.length) return;

        faqs.forEach(item => {
            const btn = item.querySelector('.edu-faq-question');
            const answer = item.querySelector('.edu-faq-answer');
            if (!btn || !answer) return;

            btn.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Optional: close siblings within the same .edu-faq
                const parent = item.closest('.edu-faq');
                if (parent && !parent.dataset.multiOpen) {
                    parent.querySelectorAll('.edu-faq-item.open').forEach(other => {
                        if (other !== item) {
                            other.classList.remove('open');
                            const a = other.querySelector('.edu-faq-answer');
                            if (a) a.style.maxHeight = '0';
                        }
                    });
                }

                if (isOpen) {
                    item.classList.remove('open');
                    answer.style.maxHeight = '0';
                } else {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        // Open the first FAQ on each .edu-faq group, if data-open-first is set
        document.querySelectorAll('.edu-faq[data-open-first]').forEach(group => {
            const first = group.querySelector('.edu-faq-item');
            if (first) {
                first.classList.add('open');
                const a = first.querySelector('.edu-faq-answer');
                if (a) a.style.maxHeight = a.scrollHeight + 'px';
            }
        });

        // Recompute open FAQ heights on resize
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                document.querySelectorAll('.edu-faq-item.open .edu-faq-answer').forEach(a => {
                    a.style.maxHeight = a.scrollHeight + 'px';
                });
            }, 120);
        });
    }

    /* ---------- 5. MULTI-STEP FORM ---------- */
    function initMultiStepForm() {
        const form = document.querySelector('[data-multistep]');
        if (!form) return;

        const steps = Array.from(form.querySelectorAll('.edu-form-step'));
        const progress = form.querySelectorAll('.edu-form-progress-step');
        const nextBtns = form.querySelectorAll('[data-next]');
        const prevBtns = form.querySelectorAll('[data-prev]');
        let current = 0;

        function show(index) {
            if (index < 0) index = 0;
            if (index >= steps.length) index = steps.length - 1;
            current = index;

            steps.forEach((s, i) => s.classList.toggle('active', i === current));
            progress.forEach((p, i) => {
                p.classList.toggle('active', i === current);
                p.classList.toggle('done', i < current);
            });

            // Scroll the form into view (offset for sticky header)
            const rect = form.getBoundingClientRect();
            if (rect.top < 80 || rect.top > window.innerHeight * 0.5) {
                window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: 'smooth' });
            }
        }

        function validate(stepEl) {
            const required = stepEl.querySelectorAll('[required]');
            let ok = true;
            required.forEach(field => {
                if (!field.value || (field.type === 'checkbox' && !field.checked)) {
                    ok = false;
                    field.style.borderColor = 'var(--edu-clay)';
                    field.addEventListener('input', function handler() {
                        field.style.borderColor = '';
                        field.removeEventListener('input', handler);
                    });
                }
            });
            return ok;
        }

        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const step = btn.closest('.edu-form-step');
                if (validate(step)) show(current + 1);
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                show(current - 1);
            });
        });

        // Allow enter key to advance from text inputs (but not textareas)
        form.querySelectorAll('.edu-form-step input:not([type="radio"]):not([type="checkbox"])').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const step = input.closest('.edu-form-step');
                    const nextBtn = step && step.querySelector('[data-next]');
                    if (nextBtn) {
                        e.preventDefault();
                        nextBtn.click();
                    }
                }
            });
        });

        show(0);
    }

    /* ---------- 6. STICKY TOC — auto-highlight active section ---------- */
    function initTOC() {
        const toc = document.querySelector('.edu-toc');
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

    /* ---------- 7. HERO SPOTLIGHT (cursor-following radial) ---------- */
    function initHeroSpotlight() {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        const heroes = document.querySelectorAll('.edu-hero, .edu-hero-bleed');
        if (!heroes.length) return;

        heroes.forEach(hero => {
            let raf = null;
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    hero.style.setProperty('--edu-spot-x', x + '%');
                    hero.style.setProperty('--edu-spot-y', y + '%');
                });
            });
        });
    }

    /* ---------- 8. CURRENT YEAR ---------- */
    function initYear() {
        document.querySelectorAll('[data-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    /* ---------- 9. INITIALIZE ---------- */
    function init() {
        initScrollReveal();
        initCounters();
        initMagnetic();
        initFAQ();
        initMultiStepForm();
        initTOC();
        initHeroSpotlight();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
