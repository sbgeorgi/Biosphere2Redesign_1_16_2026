class B2Interface {
    constructor(depthLevel = 0) {
        // Define root path based on depth
        // 0 = index.html (root)
        // 1 = pages/category/ (not used here)
        // 2 = pages/about/file.html
        this.root = depthLevel === 0 ? "./" : "../".repeat(depthLevel);
        
        this.init();
    }

    init() {
        this.injectHeader();
        this.injectFooter();
        this.handleMobileMenu();
    }

    injectHeader() {
        const headerContainer = document.getElementById('global-header');
        if (!headerContainer) return;

        headerContainer.innerHTML = `
            <!-- Loading Overlay -->
            <div class="loader" id="page-loader">
                <div class="loader-text">SYSTEM INITIALIZING...</div>
                <div class="loader-bar"></div>
            </div>

            <!-- Protocol Header -->
            <div class="protocol-header">
                <div class="container protocol-flex">
                    <span class="ua-brand">THE UNIVERSITY OF ARIZONA</span>
                    <div class="utility-links">
                        <a href="http://115199.blackbaudhosting.com/115199/tickets?tab=3&txobjid=a0d697e9-f535-4000-806c-5594e5e3769a">TICKETS</a>
                        <a href="https://give.uafoundation.org/biosphere-2">DONATE</a>
                        <a href="https://shop.arizona.edu/search?collection=Biosphere">SHOP</a>
                        <a href="${this.root}pages/about/leadership.html">DIRECTORY</a>
                        <a href="#">CALENDAR</a>
                    </div>
                </div>
            </div>

            <!-- Main Navigation -->
            <nav class="navbar">
                <div class="nav-container">
                    <a href="${this.root}index.html" class="brand">
                        <span class="brand-logo">B2</span>
                        <span class="brand-text">BIOSPHERE 2</span>
                    </a>
                    
                    <div class="nav-menu" id="nav-menu-links">
                        
                        <!-- ABOUT MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">ABOUT <span class="caret"></span></button>
                            <div class="mega-menu">
                                <div class="mega-grid">
                                    <div class="col">
                                        <span class="col-header">OVERVIEW</span>
                                        <a href="#">About Biosphere 2</a>
                                        <a href="#">Get Involved</a>
                                    </div>
                                    <div class="col">
                                        <span class="col-header">COMMAND</span>
                                        <a href="${this.root}pages/about/leadership.html">Leadership Directory</a>
                                        <a href="${this.root}pages/about/board.html">Biosphere 2 Board</a>
                                        <a href="${this.root}pages/about/strategic-plan.html">Research Strategic Plan</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- VISIT MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">VISIT <span class="caret"></span></button>
                            <div class="mega-menu simple">
                                <a href="#">Plan Your Visit</a>
                                <a href="#">Tours & Experience</a>
                                <a href="#">Accessibility</a>
                            </div>
                        </div>

                        <!-- RESEARCH MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">RESEARCH <span class="caret"></span></button>
                            <div class="mega-menu wide">
                                <div class="mega-grid three-col">
                                    <div class="col">
                                        <span class="col-header">CORE MISSIONS</span>
                                        <a href="#">Research Initiatives</a>
                                        <a href="#">Under the Glass Systems</a>
                                        <a href="#">Systems Data</a>
                                    </div>
                                    <div class="col">
                                        <span class="col-header">INTELLIGENCE</span>
                                        <a href="${this.root}pages/about/strategic-plan.html">Strategic Plan</a>
                                        <a href="#">Publications</a>
                                        <a href="${this.root}pages/about/leadership.html">Research Directory</a>
                                    </div>
                                    <div class="col">
                                        <span class="col-header">PROTOCOLS</span>
                                        <a href="#">Science Advisory Board</a>
                                        <a href="#">User Facility Info</a>
                                        <a href="#">REU Program</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- EDUCATION MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">EDUCATION <span class="caret"></span></button>
                            <div class="mega-menu">
                                <div class="mega-grid">
                                    <div class="col">
                                        <span class="col-header">PROGRAMS</span>
                                        <a href="#">Education & Broader Impacts</a>
                                        <a href="#">K-12 Education</a>
                                        <a href="#">University Programs</a>
                                    </div>
                                    <div class="col">
                                        <span class="col-header">ACCESS</span>
                                        <a href="#">REU Experience</a>
                                        <a href="#">Group Reservation Form</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- MEDIA MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">MEDIA <span class="caret"></span></button>
                            <div class="mega-menu">
                                <div class="mega-grid">
                                    <div class="col">
                                        <a href="#">Media Contact</a>
                                        <a href="#">Media Spotlight</a>
                                    </div>
                                    <div class="col">
                                        <a href="#">Press Archive</a>
                                        <a href="#">Social Media</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CONFERENCE MODULE -->
                        <div class="nav-item-group">
                            <button class="nav-trigger">CONFERENCE <span class="caret"></span></button>
                            <div class="mega-menu">
                                <div class="mega-grid">
                                    <div class="col">
                                        <a href="#">Conference Center Overview</a>
                                        <a href="#">Conference Facilities</a>
                                    </div>
                                    <div class="col">
                                        <a href="#" class="highlight-link">Reservation Inquiry Form</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a href="#" class="nav-link-direct">ANNUAL SYMPOSIUM</a>

                    </div>

                    <div class="mobile-menu-btn" id="mobile-toggle">
                        <span></span><span></span>
                    </div>
                </div>
            </nav>
        `;

        // Animation: Loader fade out
        setTimeout(() => {
            const loader = document.getElementById('page-loader');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, 800);
    }

    injectFooter() {
        const footerContainer = document.getElementById('global-footer');
        if (!footerContainer) return;

        footerContainer.innerHTML = `
            <footer class="main-footer">
                <div class="container footer-grid">
                    <div class="footer-brand">
                        <h3>BIOSPHERE 2</h3>
                        <p>University of Arizona<br>32540 S Biosphere Rd<br>Oracle, AZ 85623</p>
                        <div class="social-links">
                            <a href="https://www.instagram.com/biosphere2/">IG</a>
                            <a href="https://www.facebook.com/Biosphere2">FB</a>
                            <a href="#">YT</a>
                        </div>
                    </div>
                    
                    <div class="footer-links">
                        <h4>INDEX</h4>
                        <ul>
                            <li><a href="${this.root}pages/about/leadership.html">Leadership</a></li>
                            <li><a href="${this.root}pages/about/board.html">Board</a></li>
                            <li><a href="${this.root}pages/about/strategic-plan.html">Strategic Plan</a></li>
                            <li><a href="#">Visit</a></li>
                        </ul>
                    </div>

                    <div class="footer-links">
                        <h4>DATA</h4>
                        <ul>
                            <li><a href="#">Research Initiatives</a></li>
                            <li><a href="#">Systems Data</a></li>
                            <li><a href="#">Publications</a></li>
                            <li><a href="#">Weather</a></li>
                        </ul>
                    </div>
        
                    <div class="footer-newsletter">
                        <h4>SIGNALS</h4>
                        <p>Subscribe to the "Inside the Impact" transmission.</p>
                        <form class="newsletter-form">
                            <input type="email" placeholder="ENTER EMAIL_">
                            <button type="submit">&rarr;</button>
                        </form>
                    </div>
                </div>
                <div class="footer-bottom container">
                    <p>&copy; 2025 The University of Arizona.</p>
                    <p class="sm-text">We respectfully acknowledge the University of Arizona is on the land and territories of Indigenous peoples.</p>
                </div>
            </footer>
        `;
    }

    handleMobileMenu() {
        const btn = document.getElementById('mobile-toggle');
        const menu = document.getElementById('nav-menu-links');
        
        if(btn && menu) {
            btn.addEventListener('click', () => {
                menu.classList.toggle('active');
                btn.classList.toggle('active');
            });
        }
    }
}