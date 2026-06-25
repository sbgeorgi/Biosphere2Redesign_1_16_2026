# AGENTS.md — Biosphere 2 Visual Polish & "Awwwards 2026" Design System

## Mission
This project is a static HTML/CSS/JavaScript redesign of the Biosphere 2 website. 
The content exists, but the current internal execution is severely lacking. Your mission is to elevate this site to a **"world-class, cutting-edge, Awwwards-winning 2026"** standard. 

The site must maintain the University of Arizona color scheme, but the execution of layout, typography, imagery, and component styling must be dramatically modernized. 

**DO NOT accept boilerplate design.** Internal pages must look like they belong to a premium, immersive, high-budget scientific research facility. 

## 🚨 CRITICAL FLAWS TO FIX IMMEDIATELY (The "Do Not Accept" List)
1. **NO MORE EMPTY HEROES:** Do not output internal pages with flat, dark-blue header blocks. Every page hero MUST feature a high-quality background image with a blended gradient overlay (`linear-gradient(to right, rgba(brand-blue, 0.9), rgba(brand-blue, 0.4))`) or a sleek glassmorphism treatment.
2. **NO DISTORTED IMAGES:** Stretched logos (e.g., World Economic Forum, CyVerse) and wildly varying leadership headshots are strictly forbidden. Use `object-fit: cover`, `aspect-ratio`, and strict container dimensions.
3. **NO TEXT WALLS:** Any text block longer than 3 paragraphs must be broken up using CSS Grid (e.g., a 12-column layout where text spans 7 columns, and contextual images, pull-quotes, or quick-facts span 4 columns).
4. **NO RAW FORMS:** The Group Reservation form (and any other form) must be completely overhauled. Use CSS grid for form fields, style inputs with refined borders, custom focus rings, padding, and premium submit buttons. 

## Design North Star
*   **Aesthetic:** 2026 Editorial Science. Think *National Geographic* meets *Apple Product Pages*.
*   **Color Palette:** Existing UA Brand Colors (Red and Navy), supplemented with sophisticated dark grays, stark whites, and subtle glassmorphic UI panels for data overlays.
*   **Typography:** Bold, oversized H1s. Clean, highly readable sans-serif body copy with a `max-width` of `ch-65` to `ch-75` for optimal reading. Use `line-height: 1.6` or `1.7` for body text.

## Component & Styling Directives

### 1. Leadership & Profile Grids (`\visit\`, `\about\`)
*   **Strict Uniformity:** All profile cards must use a strict `aspect-ratio: 3/4` or `1/1` for the image container.
*   **Image Treatment:** Enforce `width: 100%; height: 100%; object-fit: cover; object-position: center top;`. If a transparent PNG is used, the background must be a unified subtle gray (`#f4f4f4`).
*   **Card Styling:** Text under profiles must be perfectly aligned. Names in strong H3, titles in muted uppercase tracking (e.g., `letter-spacing: 0.05em; color: #666;`).

### 2. Logos & Partner Grids
*   **Logo Containers:** Create a specific `.logo-grid` class. 
*   **Logo Treatment:** All logos must be inside a fixed-height container (e.g., `height: 80px`) and use `object-fit: contain;`. No exceptions. Add `mix-blend-mode: multiply` or use a white background card if the logo requires it.

### 3. Data Dashboards & Live Systems
*   **UI Modernization:** The currently flat white boxes need depth. Use subtle box-shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.05)`), rounded corners (`border-radius: 12px`), and clear data-hierarchy (massive numbers, small labels).
*   **Charts:** Ensure chart containers have a defined `min-height` (e.g., `300px`) so they do not squish on wide desktop screens. 

### 4. Forms & Interactive Elements (`bio2_query.html`, etc.)
*   **Layout:** Forms must not be 100% width on desktop. Constrain the form container to `max-width: 800px`.
*   **Inputs:** `padding: 16px; border: 1px solid #ccc; border-radius: 8px; background: #fafafa; transition: all 0.3s ease;`.
*   **Focus State:** Must have a clear, branded focus ring (e.g., `border-color: UA-RED; box-shadow: 0 0 0 3px rgba(UA-RED, 0.2);`).

### 5. Media Spotlight & Socials
*   **Video Cards:** Uniform heights. Play buttons should be styled and centered over a darkened thumbnail. Hover states should slightly scale up the image (`transform: scale(1.02)`) and brighten the overlay.
*   **Social Icons:** Wrap icons in a constrained flex container. Icons should be max `40px` by `40px`, not screen-dominating. 

### 6. Desktop-First Layout Constraints
*   **Content Wrappers:** Ensure the main `.container` or `.wrapper` has a `max-width` (e.g., `1440px`) and is centered (`margin: 0 auto;`).
*   **Card Heights:** Use Flexbox or CSS Grid with `align-items: stretch` so all cards in a row have identical heights, regardless of content length. Push the CTA button to the bottom using `margin-top: auto`.

## Workflow & QA
1.  **CSS First:** Update `style.css` with the new utility classes (`.hero-internal`, `.card-grid`, `.aspect-ratio-portrait`, `.form-modern`).
2.  **HTML Application:** Traverse every HTML file and replace the bad code (empty heroes, massive text paragraphs, basic tables) with the new modular CSS structures.
3.  **Visual Audit:** If the page looks like a generic Wikipedia article, you have failed. It must look like a premium digital experience. Ensure all images are styled, responsive, and beautifully integrated.