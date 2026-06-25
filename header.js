class B2Interface {
    constructor(depthLevel = 0) {
        this.root = depthLevel === 0 ? "./" : "../".repeat(depthLevel);
        this.doc = document.documentElement;
        this.scrollTicking = false;
        this.init();
    }

    init() {
        this.doc.classList.add('b2-interface-booting');
        this.injectHeader();
        this.injectFooter();
        this.handleMobileMenu();
        this.handleScrollBehavior();
        this.releaseBootState();
    }

    releaseBootState() {
        const release = () => {
            this.doc.classList.remove('b2-interface-booting');
            this.doc.classList.add('b2-interface-ready');
        };
        if (typeof queueMicrotask === 'function') { queueMicrotask(release); }
        else { Promise.resolve().then(release); }
    }

    injectHeader() {
        const headerContainer = document.getElementById('global-header');
        if (!headerContainer || headerContainer.dataset.b2Hydrated === 'true') return;

        headerContainer.innerHTML = `
            <div class="protocol-header">
                <div class="protocol-left"><span>THE UNIVERSITY OF ARIZONA</span></div>
                <div class="protocol-right desktop-only">
                    <a href="http://115199.blackbaudhosting.com/115199/tickets">TICKETS</a>
                    <a href="https://give.uafoundation.org/biosphere-2">DONATE</a>
                    <a href="https://shop.arizona.edu/search?collection=Biosphere">SHOP</a>
                    <a href="${this.root}directory">DIRECTORY</a>
                    <a href="${this.root}annual-symposium">CALENDAR</a>
                </div>
            </div>
            <nav class="main-nav">
                <div class="nav-left">
                    <a href="${this.root}index.html" class="brand-logo">BIOSPHERE<span class="highlight">2</span></a>
                </div>
                <div class="nav-center" id="nav-menu-links">
                    <div class="nav-item-group">
                        <button class="nav-trigger">VISIT</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">PLAN YOUR VISIT</span>
                                <a href="${this.root}visit">Plan Your Visit</a>
                                <a href="${this.root}visit#hours">Hours &amp; Admission</a>
                                <a href="${this.root}visit#directions">Getting Here</a>
                                <a href="${this.root}visit#faq">FAQ</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">TOURS</span>
                                <a href="${this.root}visit/tours">Tours &amp; Tickets</a>
                                <a href="${this.root}visit/app">The App Experience</a>
                                <a href="${this.root}visit/accessibility">Accessibility</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">GROUPS</span>
                                <a href="${this.root}education/group-reservation">Group Reservations</a>
                                <a href="${this.root}education/k12">Field Trips</a>
                            </div>
                        </div></div>
                    </div>
                    <div class="nav-item-group">
                        <button class="nav-trigger">RESEARCH</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">INITIATIVES</span>
                                <a href="${this.root}research">Overview</a>
                                <a href="${this.root}research/leo">Landscape Evolution (LEO)</a>
                                <a href="${this.root}research/agrivoltaics">Agrivoltaics</a>
                                <a href="${this.root}research/space-analogues">Space Analog (SAM)</a>
                                <a href="${this.root}research/chase">CHaSE</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">ECOSYSTEMS</span>
                                <a href="${this.root}research/ecosystems">All Ecosystems</a>
                                <a href="${this.root}research/rainforest">Tropical Rainforest</a>
                                <a href="${this.root}research/ocean">Ocean Reef Lab</a>
                                <a href="${this.root}research/desert">Coastal Fog Desert</a>
                                <a href="${this.root}research/mangroves">Mangroves</a>
                                <a href="${this.root}research/savanna">Savanna</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">RESOURCES</span>
                                <a href="${this.root}animation.html">Biosphere 2 Virtualization</a>
                                <a href="${this.root}research/data">Live Systems Data</a>
                                <a href="${this.root}research/directory">Research Directory</a>
                                <a href="${this.root}research/user-facility">User Facility Info</a>
                                <a href="${this.root}research/reu">REU Program</a>
                                <a href="${this.root}research/strategic-plan">Strategic Plan</a>
                                <a href="${this.root}research/sab">Science Advisory Board</a>
                                <a href="${this.root}research/partnerships">Partnerships</a>
                                <a href="${this.root}research/legacy-systems-data">Legacy Data Archive</a>
                            </div>
                        </div></div>
                    </div>
                    <div class="nav-item-group">
                        <button class="nav-trigger">EDUCATION</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">PROGRAMS</span>
                                <a href="${this.root}education/k12">K-12 Education</a>
                                <a href="${this.root}education/university">University Programs</a>
                                <a href="${this.root}education/reu">REU Experience</a>
                                <a href="${this.root}education/impact">Broader Impacts</a>
                            </div>
                        </div></div>
                    </div>
                    <div class="nav-item-group">
                        <button class="nav-trigger">ABOUT</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">ORGANIZATION</span>
                                <a href="${this.root}about/history">History &amp; Mission</a>
                                <a href="${this.root}about/leadership">Leadership &amp; Board</a>
                                <a href="${this.root}about/strategic-plan">Strategic Plan</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">CONNECT</span>
                                <a href="${this.root}about/partners">Partner Opportunities</a>
                                <a href="${this.root}media/press">Media &amp; Press</a>
                                <a href="${this.root}contact">Contact Us</a>
                            </div>
                        </div></div>
                    </div>
                    <div class="nav-item-group">
                        <button class="nav-trigger">MEDIA</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">NEWSROOM</span>
                                <a href="${this.root}media">Media Overview</a>
                                <a href="${this.root}media/contact">Media Contact</a>
                                <a href="${this.root}media/press">Press Archive</a>
                            </div>
                            <div class="mega-col"><span class="mega-col-header">CHANNELS</span>
                                <a href="${this.root}media/spotlight">Media Spotlight</a>
                                <a href="${this.root}media/social">Social Media</a>
                            </div>
                        </div></div>
                    </div>
                    <div class="nav-item-group">
                        <button class="nav-trigger">CONFERENCE</button>
                        <div class="mega-menu"><div class="mega-grid">
                            <div class="mega-col"><span class="mega-col-header">FACILITIES</span>
                                <a href="${this.root}conference/overview">Center Overview</a>
                                <a href="${this.root}conference/spaces">Meeting Spaces</a>
                                <a href="${this.root}conference/inquiry">Reservation Inquiry</a>
                            </div>
                        </div></div>
                    </div>
                </div>
                <div class="nav-right">
                    <a href="${this.root}animation.html" class="nav-item highlight-btn desktop-only">VIRTUAL LAB</a>
                    <a href="http://115199.blackbaudhosting.com/115199/tickets" class="nav-item btn-solid desktop-only">TICKETS</a>
                    <div class="mobile-menu-btn" id="mobile-toggle"><i class="fa-solid fa-bars"></i></div>
                </div>
            </nav>
        `;
        headerContainer.dataset.b2Hydrated = 'true';
    }

    injectFooter() {
        const footerContainer = document.getElementById('global-footer');
        if (!footerContainer || footerContainer.dataset.b2Hydrated === 'true') return;
        footerContainer.innerHTML = `
            <footer class="main-footer">
                <div class="footer-grid">
                    <div class="footer-col"><h4>Biosphere 2</h4><ul><li>University of Arizona</li><li>32540 S Biosphere Rd</li><li>Oracle, AZ 85623</li></ul></div>
                    <div class="footer-col"><h4>Explore</h4><ul><li><a href="${this.root}visit">Visit</a></li><li><a href="${this.root}research">Research</a></li><li><a href="${this.root}education/k12">Education</a></li><li><a href="${this.root}conference/overview">Conference Center</a></li></ul></div>
                    <div class="footer-col"><h4>Research</h4><ul><li><a href="${this.root}animation.html">Virtual Lab</a></li><li><a href="${this.root}research/data">Systems Data</a></li><li><a href="${this.root}research/publications">Publications</a></li><li><a href="${this.root}research/directory">Research Directory</a></li><li><a href="${this.root}research/user-facility">User Facility</a></li></ul></div>
                    <div class="footer-col"><h4>Connect</h4><ul><li><a href="${this.root}media/contact">Media Contact</a></li><li><a href="${this.root}media/press">Press Archive</a></li><li><a href="${this.root}media/social">Social Media</a></li><li><a href="${this.root}about/partners">Get Involved</a></li><li><a href="${this.root}contact">Contact Us</a></li></ul></div>
                </div>
                <div class="footer-bottom">
                    <span>&copy; 2026 The Arizona Board of Regents on behalf of The University of Arizona.</span>
                    <span>Land Acknowledgment: Tohono O'odham and Yaqui.</span>
                </div>
            </footer>
        `;
        footerContainer.dataset.b2Hydrated = 'true';
    }

    handleMobileMenu() {
        const btn = document.getElementById('mobile-toggle');
        const menu = document.getElementById('nav-menu-links');
        if(btn && menu) {
            const icon = btn.querySelector('i');
            if (btn.dataset.b2Bound !== 'true') {
                btn.dataset.b2Bound = 'true';
                btn.setAttribute('aria-expanded', 'false');
                btn.addEventListener('click', () => {
                    menu.classList.toggle('active');
                    const isOpen = menu.classList.contains('active');
                    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    if(icon && isOpen) { icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark'); }
                    else if(icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
                    document.body.style.overflow = isOpen ? 'hidden' : '';
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && menu.classList.contains('active')) {
                        menu.classList.remove('active');
                        btn.setAttribute('aria-expanded', 'false');
                        if (icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
                        document.body.style.overflow = '';
                    }
                });
            }
        }
        const triggers = document.querySelectorAll('.nav-trigger');
        triggers.forEach(trigger => {
            if (trigger.dataset.b2Bound === 'true') return;
            trigger.dataset.b2Bound = 'true';
            trigger.addEventListener('click', (e) => {
                if(window.innerWidth <= 1024) {
                    const group = e.target.closest('.nav-item-group');
                    if (!group) return;
                    document.querySelectorAll('.nav-item-group').forEach(g => { if(g !== group) g.classList.remove('active'); });
                    group.classList.toggle('active');
                }
            });
        });
    }

    handleScrollBehavior() {
        const protocolHeader = document.querySelector('.protocol-header');
        const mainNav = document.querySelector('.main-nav');
        if (!protocolHeader && !mainNav) return;
        const SCROLL_THRESHOLD = 60;
        const onScroll = () => {
            if (this.scrollTicking) return;
            this.scrollTicking = true;
            requestAnimationFrame(() => {
                const scrolled = window.scrollY > SCROLL_THRESHOLD;
                if (protocolHeader) protocolHeader.classList.toggle('scrolled', scrolled);
                if (mainNav) mainNav.classList.toggle('scrolled', scrolled);
                this.scrollTicking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
}
