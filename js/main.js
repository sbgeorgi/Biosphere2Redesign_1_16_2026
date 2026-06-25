document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Scroll Reveal Observer ---
    // Intersection Observer for scroll-triggered entrance animations
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after revealing to prevent re-triggering
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    // Auto-apply reveal classes to key sections if they don't have them
    const autoRevealSelectors = [
        '.section-label',
        '.section-heading',
        '.display-heading',
        '.body-text',
        '.dashboard-card',
        '.slider-card',
        '.feature-card',
        '.content-card',
        '.profile-card',
        '.link-card',
        '.publication-card',
        '.media-card',
        '.social-card',
        '.stat-tile',
        '.calendar-wrapper',
        '.quick-card',
        '.top-featured-image',
        '.top-featured-copy',
        '.image-feature',
        '.cta-band',
        '.find-us-info',
        '.article-flow > h2',
        '.article-flow > p',
        '.intro-panel',
        '.feature-band',
        '.visual-item',
        '.partner-item'
    ];

    autoRevealSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            // Don't override existing reveal classes
            if (!el.classList.contains('reveal') && 
                !el.classList.contains('reveal-left') && 
                !el.classList.contains('reveal-right') && 
                !el.classList.contains('reveal-scale')) {
                el.classList.add('reveal');
                // Add stagger delay based on sibling index
                el.style.transitionDelay = `${Math.min(index * 0.08, 0.48)}s`;
                revealObserver.observe(el);
            }
        });
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 1. System/Biome Data Configuration ---
    let systemsData = {
        ocean: {
            title: "OCEAN REEF LAB",
            desc: `We've gone headfirst into revitalizing our ocean system to be a premier research space for coral reef restoration. Learn about the revitalization process that's currently taking place.<br><br><strong>Significant Research Finding:</strong> The Biosphere 2 ocean was used to demonstrate how, under current atmospheric CO₂ levels, changes in ocean chemistry significantly slow coral growth.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2021-10/3_Biomes_Ocean_Photo_Option%203.jpg.webp?itok=Em1QPdlr",
            stat1: "1M+ GAL",
            stat1Label: "VOLUME",
            stat2: "CORAL",
            stat2Label: "TARGET",
            link: "https://www.biosphere2.org/research/research-initiatives/ocean-reef-lab"
        },
        rainforest: {
            title: "TROPICAL RAIN FOREST",
            desc: `We know that rain forest plants have a lot to tell us about the world's ecosystem. We use this system to listen carefully and inform integral changes to adapt to climate change.<br><br><strong>Significant Research Finding:</strong> A major discovery at Biosphere 2 showed that tropical plants in the rainforest stop absorbing more carbon dioxide from the air once levels reach about 600 parts per million—a threshold we're on track to hit by 2050.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2025-07/P1013127.jpg.webp?itok=Usjd2Ji1",
            stat1: "600 PPM",
            stat1Label: "THRESHOLD",
            stat2: "HUMID",
            stat2Label: "CLIMATE",
            link: "https://www.biosphere2.org/research/research-initiatives/tropical-rain-forest"
        },
        leo: {
            title: "LANDSCAPE EVOLUTION (LEO)",
            desc: `The world's largest indoor Earth science experiment. LEO helps scientists understand what happens to rainwater in dry, mountainous regions: how much of it makes its way downstream for human use, and how its quality changes along the way. The project also explores how increasing complexity in the landscape—such as vegetation growth and soil development—affects water flow and quality over time.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2025-07/MecklerPhoto-LEO_0597_F.jpg.webp?h=5ba7cdad&itok=jp3zIEof",
            stat1: "3",
            stat1Label: "SLOPES",
            stat2: "1800+",
            stat2Label: "SENSORS",
            link: "https://www.biosphere2.org/research/research-initiatives/landscape-evolution-observatory-leo"
        },
        desert: {
            title: "COASTAL FOG DESERT",
            desc: `Our desert is uniquely set apart from the Sonoran desert that houses it. Designed to simulate an arid desert scrub ecosystem, the Biosphere 2 desert brings the coastal desert experience to you.<br><br><strong>Significant Research Finding:</strong><br>• Studies of insect behavior and desert plant physiology under elevated CO₂ highlighted ecosystem-level responses in marginal environments.<br>• CAM plant systems failed to recapture CO₂ lost via soil respiration after drought, suggesting limits to arid ecosystem carbon recovery.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2025-07/P1014207.jpg.webp?h=16a8947f&itok=mcMX179_",
            stat1: "HOT",
            stat1Label: "TEMP",
            stat2: "SCRUB",
            stat2Label: "TYPE",
            link: "https://www.biosphere2.org/research/research-initiatives"
        },
        mangrove: {
            title: "MANGROVE WETLANDS",
            desc: `Take a trip to the tropics with our mangroves at Biosphere 2. This system allows us to look closely at two key types of wetlands and put plans to action for restoring these systems in the wild.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2025-07/P1013853.jpg.webp?itok=Cw9eZ_Mm",
            stat1: "WETLAND",
            stat1Label: "BIOME",
            stat2: "2",
            stat2Label: "ZONES",
            link: "https://www.biosphere2.org/research/research-initiatives"
        },
        savanna: {
            title: "HYDROLOGICAL SAVANNA",
            desc: `Explore the savanna and learn the history of how this system served as a hydrological transition zone designed to balance atmospheric chemistry between two uniquely different environments: the desert and the rain forest.`,
            img: "https://biosphere2.org/sites/default/files/styles/az_full_width_bg_large/public/2025-07/P1014166.jpg.webp?itok=R_Mn7Q3o",
            stat1: "TRANSITION",
            stat1Label: "ROLE",
            stat2: "HYBRID",
            stat2Label: "SYSTEM",
            link: "https://www.biosphere2.org/research/research-initiatives"
        }
    };

    // --- 2. DOM Elements ---
    const sysButtons = document.querySelectorAll('.sys-btn');
    const sysTitle = document.getElementById('system-title');
    const sysDesc = document.getElementById('system-desc');
    const sysImg = document.getElementById('system-image');
    const sysLink = document.getElementById('system-link');
    const dpValues = document.querySelectorAll('.dp-value');
    const dpLabels = document.querySelectorAll('.dp-label');
    let systemUpdateId = 0;

    // --- 3. Event Listeners ---
    if(sysButtons.length > 0) {
        sysButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                sysButtons.forEach(b => b.classList.remove('active'));
                // Add active to click
                btn.classList.add('active');

                // Get Data key
                const key = btn.getAttribute('data-system');
                const data = systemsData[key];
                if (!data) return;
                const updateId = ++systemUpdateId;

                // Animate transition (Fade out with transform)
                if(sysImg) {
                    sysImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    sysImg.style.opacity = '0';
                    sysImg.style.transform = 'scale(1.02)';
                }
                if(sysDesc) {
                    sysDesc.style.transition = 'opacity 0.25s ease';
                    sysDesc.style.opacity = '0';
                }
                
                const applySystemUpdate = () => {
                    if (updateId !== systemUpdateId) return;

                    // Update Content
                    if(sysTitle) sysTitle.innerText = data.title;
                    if(sysDesc) sysDesc.innerHTML = data.desc;
                    if(sysImg) sysImg.src = data.img;
                    
                    // Update Link URL
                    if(sysLink) sysLink.href = data.link;
                    
                    // Update Stats Panel
                    if(dpValues.length >= 2) {
                        dpValues[0].innerText = data.stat1;
                        dpValues[1].innerText = data.stat2;
                    }
                    if(dpLabels.length >= 2) {
                        dpLabels[0].innerText = data.stat1Label;
                        dpLabels[1].innerText = data.stat2Label;
                    }

                    // Fade In with subtle entrance
                    requestAnimationFrame(() => {
                        if(sysImg) {
                            sysImg.style.opacity = '1';
                            sysImg.style.transform = 'scale(1)';
                        }
                        if(sysDesc) {
                            sysDesc.style.opacity = '1';
                        }
                    });
                };

                if (sysImg) {
                    const nextImage = new Image();
                    nextImage.onload = () => requestAnimationFrame(applySystemUpdate);
                    nextImage.onerror = () => requestAnimationFrame(applySystemUpdate);
                    nextImage.src = data.img;
                } else {
                    requestAnimationFrame(applySystemUpdate);
                }
            });
        });
    }

    // --- 4. Number Counter Animation with Intersection Observer ---
    const stats = document.querySelectorAll('.count-up');
    const easeOutQuad = (t) => t * (2 - t); 

    if(stats.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseFloat(stat.getAttribute('data-target'));
                    const duration = 2000; 
                    const startTime = performance.now();
                    const isFloat = target % 1 !== 0;

                    const updateCount = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = easeOutQuad(progress);
                        
                        const currentVal = target * ease;

                        if (progress < 1) {
                            stat.innerText = isFloat ? currentVal.toFixed(2) : Math.ceil(currentVal);
                            requestAnimationFrame(updateCount);
                        } else {
                            stat.innerText = target;
                        }
                    };
                    requestAnimationFrame(updateCount);
                    counterObserver.unobserve(stat);
                }
            });
        }, { threshold: 0.3 });

        stats.forEach(stat => counterObserver.observe(stat));
    }

    // --- 5. Enhanced Image Lazy Loading with Blur-Up ---
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.style.transition = 'filter 0.6s ease, opacity 0.6s ease';
        if (!img.complete) {
            img.style.filter = 'blur(8px)';
            img.style.opacity = '0.7';
            img.addEventListener('load', () => {
                requestAnimationFrame(() => {
                    img.style.filter = 'blur(0)';
                    img.style.opacity = '1';
                });
            }, { once: true });
        }
    });

    // --- 6. Slider/Drag Scroll Enhancement ---
    const sliderTracks = document.querySelectorAll('.slider-track');
    sliderTracks.forEach(track => {
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = '';
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = '';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
    });
});
