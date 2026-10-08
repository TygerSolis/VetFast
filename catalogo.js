(function () {
    'use strict';

    const state = {
        productos: [],
        categoria: 'Todas',
        busqueda: '',
        orden: 'default',
        lightboxProducto: null,
        lightboxIndex: 0
    };

    const ORDEN_CATEGORIAS = ['Línea MSD', 'Línea Veterline'];
    const DESTACADOS = [101, 102, 103, 104];
    const WHATSAPP = '51980764585';

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }

    function normalizar(value) {
        return String(value ?? '')
            .toLocaleLowerCase('es')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function textoBusqueda(producto) {
        return normalizar([
            producto.nombre,
            producto.categoria,
            producto.peso,
            producto.presentacion,
            producto.descripcion
        ].join(' '));
    }

    function construirWhatsApp(producto) {
        const texto = `Hola, me interesa el producto: ${producto.nombre} (${producto.peso}) - Presentación: ${producto.presentacion} - Precio: S/ ${Number(producto.precio).toFixed(2)}. Quisiera consultar disponibilidad y delivery.`;
        return `https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(texto)}`;
    }

    function actualizarURL() {
        const params = new URLSearchParams();
        if (state.categoria !== 'Todas') params.set('categoria', state.categoria);
        if (state.busqueda) params.set('buscar', state.busqueda);
        if (state.orden !== 'default') params.set('orden', state.orden);
        const query = params.toString();
        history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
    }

    function actualizarControles() {
        const search = $('#search-input');
        const sort = $('#sort-select');
        if (search) search.value = state.busqueda;
        if (sort) sort.value = state.orden;
    }

    function renderFilters() {
        const container = $('#category-filters');
        if (!container) return;

        const categoriasPresentes = [...new Set(state.productos.map(p => p.categoria))];
        const categorias = ['Todas', ...ORDEN_CATEGORIAS.filter(cat => categoriasPresentes.includes(cat))];

        container.innerHTML = categorias.map(cat => `
            <button
                type="button"
                class="category-filter ${state.categoria === cat ? 'category-filter-active' : ''}"
                data-category="${escapeHtml(cat)}"
                aria-pressed="${state.categoria === cat ? 'true' : 'false'}"
            >${escapeHtml(cat)}</button>
        `).join('');
    }

    function aplicarBusqueda(termino) {
        state.busqueda = termino;
        state.categoria = 'Todas';
        renderizarProductos();
        const catalogo = $('#catalogo');
        if (catalogo) catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.filtrarPorCategoria = function (categoria) {
        state.categoria = categoria;
        state.busqueda = '';
        renderizarProductos();
        const catalogo = $('#catalogo');
        if (catalogo) catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.aplicarBusqueda = aplicarBusqueda;

    function renderFeaturedProducts() {
        const container = $('#featured-products');
        if (!container) return;

        const destacados = DESTACADOS
            .map(id => state.productos.find(p => p.id === id))
            .filter(Boolean);

        container.innerHTML = destacados.map(producto => `
            <article class="featured-card">
                <div class="featured-media">
                    <img src="${escapeHtml(producto.imagenes[0])}" alt="${escapeHtml(producto.nombre)}" width="700" height="700" loading="lazy" decoding="async">
                    <span class="featured-badge"><i data-lucide="paw-print"></i> Selección Vet Fast</span>
                </div>
                <div class="featured-card-content">
                    <span class="text-xs uppercase tracking-widest text-brand-accent font-bold">Protección para perros</span>
                    <h3 class="font-title text-2xl font-bold text-brand-900 mt-2">${escapeHtml(producto.nombre)}</h3>
                    <p class="text-gray-500 mt-3 leading-relaxed">${escapeHtml(producto.descripcion)}</p>
                    <div class="flex items-end justify-between gap-4 mt-6">
                        <div>
                            <span class="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Precio</span>
                            <span class="font-title text-3xl font-black text-brand-900">S/ ${Number(producto.precio).toFixed(2)}</span>
                        </div>
                        <button type="button" class="featured-link" data-featured-product="${producto.id}">Ver producto →</button>
                    </div>
                </div>
            </article>
        `).join('');

        lucide.createIcons();
    }

    function generarHTMLProducto(producto) {
        const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];
        const whatsappUrl = construirWhatsApp(producto);

        const miniaturas = imagenes.length > 1
            ? `
                <div class="product-thumbnails no-print" aria-label="Imágenes de ${escapeHtml(producto.nombre)}">
                    ${imagenes.map((imagen, index) => `
                        <button type="button" class="product-thumb ${index === 0 ? 'is-active' : ''}" data-thumbnail-product="${producto.id}" data-thumbnail-index="${index}" aria-label="Ver imagen ${index + 1}">
                            <img src="${escapeHtml(imagen)}" alt="" loading="lazy" decoding="async">
                        </button>
                    `).join('')}
                </div>
            `
            : '';

        return `
            <article id="producto-${producto.id}" class="product-card print-break-avoid">
                <div
                    class="product-media"
                    data-lightbox-product="${producto.id}"
                    data-lightbox-index="0"
                    role="button"
                    tabindex="0"
                    aria-label="Ver ${escapeHtml(producto.nombre)} en grande"
                >
                    <span class="product-category">${escapeHtml(producto.categoria)}</span>
                    <img
                        data-main-image="${producto.id}"
                        src="${escapeHtml(imagenes[0] || '')}"
                        width="700"
                        height="700"
                        alt="${escapeHtml(producto.nombre)}"
                        loading="lazy"
                        decoding="async"
                        onerror="this.src='https://placehold.co/700x700/f1f5f9/17569b?text=Sin+Foto'"
                    >
                    <span class="product-expand no-print" aria-hidden="true"><i data-lucide="maximize-2"></i></span>
                </div>

                ${miniaturas}

                <div class="product-body">
                    <div class="product-tags">
                        <span><i data-lucide="scale"></i> ${escapeHtml(producto.peso)}</span>
                        <span><i data-lucide="pill"></i> ${escapeHtml(producto.presentacion)}</span>
                    </div>

                    <h3 class="font-title product-title">${escapeHtml(producto.nombre)}</h3>
                    <p class="product-description">${escapeHtml(producto.descripcion)}</p>

                    <div class="product-bottom">
                        <div>
                            <span class="price-label">Precio</span>
                            <div class="product-price"><small>S/</small> ${Number(producto.precio).toFixed(2)}</div>
                        </div>
                        <a
                            href="${whatsappUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="product-buy no-print"
                            aria-label="Consultar ${escapeHtml(producto.nombre)} por WhatsApp"
                        >
                            <i data-lucide="message-circle"></i>
                            <span>Consultar</span>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function obtenerProductosFiltrados() {
        let lista = state.productos.filter(producto => {
            const cumpleCategoria = state.categoria === 'Todas' || producto.categoria === state.categoria;
            const cumpleBusqueda = !state.busqueda || textoBusqueda(producto).includes(normalizar(state.busqueda));
            return cumpleCategoria && cumpleBusqueda;
        });

        if (state.orden === 'price-asc') lista = [...lista].sort((a, b) => a.precio - b.precio);
        if (state.orden === 'price-desc') lista = [...lista].sort((a, b) => b.precio - a.precio);
        if (state.orden === 'name') lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        return lista;
    }

    function renderizarProductos() {
        renderFilters();
        const container = $('#catalog-products');
        if (!container) return;

        const filtrados = obtenerProductosFiltrados();
        const contador = $('#results-count');
        if (contador) {
            contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}`;
        }

        actualizarURL();

        const categorias = ORDEN_CATEGORIAS.filter(cat => filtrados.some(p => p.categoria === cat));

        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i data-lucide="search-x"></i></div>
                    <h3 class="font-title">No encontramos productos</h3>
                    <p>Prueba con otro medicamento, dosis, peso, presentación o categoría.</p>
                    <button type="button" onclick="aplicarBusqueda('')" class="empty-reset">Mostrar todo el catálogo</button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        let html = '';
        categorias.forEach(categoria => {
            const items = filtrados.filter(p => p.categoria === categoria);
            if (!items.length) return;

            const nota = categoria === 'Línea MSD'
                ? 'Protección antiparasitaria y opciones de prevención para perros y gatos.'
                : 'Medicamentos y productos de uso veterinario. Consulta siempre la indicación de tu médico veterinario.';

            html += `
                <section class="catalog-section print-break-avoid">
                    <div class="section-heading">
                        <div>
                            <span class="section-kicker">Línea de productos</span>
                            <h2 class="font-title section-title">${escapeHtml(categoria)}</h2>
                            <p class="section-note">${nota}</p>
                        </div>
                        <span class="section-count">${items.length} ${items.length === 1 ? 'producto' : 'productos'}</span>
                    </div>
                    <div class="products-grid">
                        ${items.map(generarHTMLProducto).join('')}
                    </div>
                </section>
            `;
        });

        container.innerHTML = html;

        $$('.product-thumb', container).forEach(button => {
            button.addEventListener('click', event => {
                event.stopPropagation();
                const productId = Number(button.dataset.thumbnailProduct);
                const index = Number(button.dataset.thumbnailIndex);
                const image = state.productos.find(p => p.id === productId)?.imagenes[index];
                const main = container.querySelector(`[data-main-image="${productId}"]`);
                if (!image || !main) return;
                main.src = image;
                main.width = 700;
                main.height = 700;
                const viewer = button.closest('.product-card')?.querySelector('.product-media');
                if (viewer) viewer.dataset.lightboxIndex = String(index);
                $$(' .product-thumb', button.parentElement).forEach(item => item.classList.remove('is-active'));
                button.classList.add('is-active');
            });
        });

        $$('.product-media', container).forEach(viewer => {
            const open = () => window.abrirModal(Number(viewer.dataset.lightboxProduct), Number(viewer.dataset.lightboxIndex || 0));
            viewer.addEventListener('click', open);
            viewer.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        });

        lucide.createIcons();
    }

    function initFeaturedDelegation() {
        const container = $('#featured-products');
        if (!container) return;
        container.addEventListener('click', event => {
            const button = event.target.closest('[data-featured-product]');
            if (!button) return;
            const productId = Number(button.dataset.featuredProduct);
            const product = state.productos.find(p => p.id === productId);
            if (!product) return;
            state.categoria = product.categoria;
            state.busqueda = product.nombre.split(' ')[0];
            renderizarProductos();
            requestAnimationFrame(() => {
                const card = document.getElementById(`producto-${productId}`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    function initCatalogControls() {
        const filters = $('#category-filters');
        if (filters) {
            filters.addEventListener('click', event => {
                const button = event.target.closest('[data-category]');
                if (!button) return;
                window.filtrarPorCategoria(button.dataset.category);
            });
        }

        const search = $('#search-input');
        if (search) {
            let timer;
            search.addEventListener('input', event => {
                clearTimeout(timer);
                state.busqueda = event.target.value.trim();
                state.categoria = 'Todas';
                timer = setTimeout(renderizarProductos, 180);
            });
        }

        const sort = $('#sort-select');
        if (sort) {
            sort.addEventListener('change', event => {
                state.orden = event.target.value;
                renderizarProductos();
            });
        }
    }

    window.abrirModal = function (productoId, index = 0) {
        const producto = state.productos.find(p => p.id === productoId);
        if (!producto || !producto.imagenes?.length) return;
        state.lightboxProducto = producto;
        state.lightboxIndex = Math.min(Math.max(Number(index), 0), producto.imagenes.length - 1);
        actualizarLightbox();
        const lightbox = $('#lightbox');
        if (lightbox) lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
    };

    window.cerrarModal = function (event, force = false) {
        const lightbox = $('#lightbox');
        if (!lightbox) return;
        if (force || event?.target?.id === 'lightbox') {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            state.lightboxProducto = null;
        }
    };

    window.cambiarImagenLightbox = function (direction, event) {
        if (event) event.stopPropagation();
        if (!state.lightboxProducto) return;
        const total = state.lightboxProducto.imagenes.length;
        if (total <= 1) return;
        state.lightboxIndex = (state.lightboxIndex + direction + total) % total;
        actualizarLightbox();
    };

    function actualizarLightbox() {
        const img = $('#lightbox-img');
        const counter = $('#lightbox-counter');
        const prev = $('#lightbox-prev');
        const next = $('#lightbox-next');
        if (!img || !counter || !prev || !next || !state.lightboxProducto) return;

        img.src = state.lightboxProducto.imagenes[state.lightboxIndex];
        img.decoding = "async";
        img.alt = state.lightboxProducto.nombre;
        counter.textContent = `${state.lightboxIndex + 1} / ${state.lightboxProducto.imagenes.length}`;

        const showControls = state.lightboxProducto.imagenes.length > 1;
        prev.hidden = !showControls;
        next.hidden = !showControls;
        counter.hidden = !showControls;
    }

    function initLightbox() {
        document.addEventListener('keydown', event => {
            if (!$('#lightbox')?.classList.contains('active')) return;
            if (event.key === 'Escape') window.cerrarModal(event, true);
            if (event.key === 'ArrowRight') window.cambiarImagenLightbox(1, event);
            if (event.key === 'ArrowLeft') window.cambiarImagenLightbox(-1, event);
        });

        const lightbox = $('#lightbox');
        if (!lightbox) return;

        let startX = 0;
        lightbox.addEventListener('touchstart', event => {
            startX = event.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', event => {
            const endX = event.changedTouches[0].screenX;
            const delta = endX - startX;
            if (Math.abs(delta) < 50) return;
            window.cambiarImagenLightbox(delta < 0 ? 1 : -1, event);
        }, { passive: true });
    }

    async function cargarProductos() {
        try {
            const response = await fetch('productos.json?v=vetfast-2', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            const ids = new Set();
            data.forEach(producto => {
                if (ids.has(producto.id)) throw new Error(`ID duplicado: ${producto.id}`);
                if (!producto.nombre || !producto.categoria || !Array.isArray(producto.imagenes) || producto.imagenes.length === 0) {
                    throw new Error(`Producto incompleto: ${producto.id}`);
                }
                if (typeof producto.precio !== 'number' || producto.precio < 0) {
                    throw new Error(`Precio inválido: ${producto.id}`);
                }
                ids.add(producto.id);
            });

            state.productos = data;

            const params = new URLSearchParams(window.location.search);
            state.categoria = params.get('categoria') || 'Todas';
            state.busqueda = params.get('buscar') || '';
            state.orden = ['price-asc', 'price-desc', 'name'].includes(params.get('orden'))
                ? params.get('orden')
                : 'default';

            if (!['Todas', ...ORDEN_CATEGORIAS].includes(state.categoria)) state.categoria = 'Todas';

            actualizarControles();
            renderFeaturedProducts();
            renderizarProductos();
            lucide.createIcons();
        } catch (error) {
            console.error('No se pudo cargar el catálogo Vet Fast:', error);
            const container = $('#catalog-products');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i data-lucide="triangle-alert"></i></div>
                        <h3 class="font-title">No se pudo cargar el catálogo</h3>
                        <p>Recarga la página o intenta nuevamente más tarde.</p>
                    </div>
                `;
                lucide.createIcons();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const year = $('#current-year');
        if (year) year.textContent = new Date().getFullYear();
        initCatalogControls();
        initFeaturedDelegation();
        initLightbox();
        cargarProductos();
    });
})();