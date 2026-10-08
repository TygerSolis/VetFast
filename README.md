# VetFast — Veterinary Product Catalog

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-17569b?style=for-the-badge)](https://tygersolis.github.io/VetFast/)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/TygerSolis/VetFast)

A responsive, interactive product catalog developed for **VetFast**, a veterinary products distributor. The project is designed around a simple commercial flow: help customers find products quickly and move directly to a WhatsApp inquiry.

## Live Demo

**[https://tygersolis.github.io/VetFast/](https://tygersolis.github.io/VetFast/)**

## Highlights

- Dynamic product catalog powered by structured JSON data
- Product search across name, category, weight, presentation and description
- Category filtering and price/name sorting
- Product image lightbox and thumbnail navigation
- Product-specific WhatsApp inquiry links with pre-filled product details
- Responsive layout for desktop, tablet and mobile
- SEO metadata, Open Graph tags and Schema.org structured data
- URL-based search, filter and sort state
- Accessible interactive controls and keyboard support
- Print-friendly catalog layout

## Architecture

The catalog keeps **content separate from presentation**:

`productos.json` → product data  
`catalogo.js` → state, filtering, rendering and interactions  
`index.html` → semantic page structure and business content  
`styles.css` → custom visual system and responsive styling

This structure makes the catalog easier to maintain because product information can be updated without changing the page markup.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Tailwind CSS
- JSON
- Lucide Icons
- GitHub Pages
- WhatsApp deep-link integration

## Technical Highlights

### Client-side catalog engine

Products are loaded asynchronously from `productos.json`, validated and rendered dynamically. Search, category filters and sorting operate on the same client-side state.

### Conversion-focused WhatsApp integration

Each product generates a contextual WhatsApp message containing the product name, weight, presentation and price, reducing friction between catalog browsing and customer contact.

### SEO and sharing

The page includes descriptive metadata, Open Graph information, Spanish locale configuration and Schema.org structured data to improve indexing and link previews.

## Project Structure

```text
VetFast/
├── assets/
├── catalogo.js
├── index.html
├── productos.json
└── styles.css
```

## Screenshots

The live interface uses the project assets directly. The repository also contains the visual assets used by the hero section and product catalog.

## Purpose

This project demonstrates how a lightweight front-end application can turn a static product list into a usable **digital sales catalog** with search, filtering, media interaction and direct customer conversion.

---
Built by **Itamar Solis**

## Performance tooling

A reusable optimization script is included at `scripts/optimize_images.py`. It converts referenced PNG assets to WebP and updates repository references, allowing the catalog to keep modern image delivery without rebuilding the front end.

## Portfolio Focus

**Business problem:** present a product catalog in a fast, searchable format that turns product discovery into a direct sales conversation.

**Engineering focus:** structured product data, client-side state management, responsive UI, SEO, accessibility and WhatsApp conversion.
