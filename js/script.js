// ===========================
// BONSAI POTS CATALOG - SCRIPT
// ===========================

const WHATSAPP_NUMBER = '27791576981';

let allPots = [];
let filteredPots = [];

// Fetch and initialize the catalog
async function initializeCatalog() {
    try {
        const response = await fetch('data/pots.json');
        if (!response.ok) {
            throw new Error('Failed to load pots data');
        }
        allPots = await response.json();
        filteredPots = [...allPots];
        renderGallery();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading catalog:', error);
        displayError('Failed to load the catalog. Please refresh the page.');
    }
}

// Setup event listeners for search and sort
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    searchInput.addEventListener('input', (e) => {
        filterAndRender();
    });

    sortSelect.addEventListener('change', (e) => {
        filterAndRender();
    });
}

// Filter and sort pots based on user input
function filterAndRender() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;

    // Filter pots based on code or dimensions
    filteredPots = allPots.filter(pot => {
        const matchesSearch = 
            pot.code.toLowerCase().includes(searchValue) ||
            (pot.dimensions && pot.dimensions.toLowerCase().includes(searchValue));
        return matchesSearch;
    });

    // Sort pots by price
    filteredPots.sort((a, b) => {
        switch (sortValue) {
            case 'price-asc':
                return parsePrice(a.price) - parsePrice(b.price);
            case 'price-desc':
                return parsePrice(b.price) - parsePrice(a.price);
            default:
                return 0;
        }
    });

    renderGallery();
}

// Parse price string to number (handles both "$24.99" and "R 250" formats)
function parsePrice(priceStr) {
    if (typeof priceStr !== 'string') return parseFloat(priceStr);
    return parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
}

// Format price for display (convert to Rands format)
function formatPrice(priceStr) {
    const price = parsePrice(priceStr);
    return `R ${price.toFixed(2)}`;
}

// Generate WhatsApp inquiry URL
function generateWhatsAppUrl(pot) {
    const message = `Hi! I am interested in this pot:\n*Code:* ${pot.code}\n*Price:* ${formatPrice(pot.price)}\n*Dimensions:* ${pot.dimensions}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

// Render gallery images to the DOM
function renderGallery() {
    const container = document.getElementById('potsContainer');
    const noResults = document.getElementById('noResults');

    container.innerHTML = '';

    if (filteredPots.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    filteredPots.forEach((pot, index) => {
        const galleryItem = createGalleryItem(pot, index);
        container.appendChild(galleryItem);
    });
}

// Create a single gallery card with product details (Name and Description elements removed)
function createGalleryItem(pot, index) {
    const whatsappUrl = generateWhatsAppUrl(pot);
    
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.style.animationDelay = `${index * 0.03}s`;

    const imageHtml = pot.image 
        ? `<img src="${pot.image}" alt="${escapeHtml(pot.code)}" class="gallery-image" loading="lazy">`
        : `<div class="gallery-placeholder">🍲</div>`;

    const dimensionsDisplay = pot.dimensions ? `<span class="pot-dimensions">📐 ${escapeHtml(pot.dimensions)}</span>` : '';

    card.innerHTML = `
        <a href="${whatsappUrl}" target="_blank" class="gallery-image-link">
            <div class="gallery-image-container">
                ${imageHtml}
            </div>
        </a>
        <div class="gallery-content">
            <p class="pot-code">Code: ${escapeHtml(pot.code)}</p>
            <div class="pot-specs">
                ${dimensionsDisplay}
                <span class="pot-price">${formatPrice(pot.price)}</span>
            </div>
            <a href="${whatsappUrl}" target="_blank" class="whatsapp-button">
                💬 Inquire on WhatsApp
            </a>
        </div>
    `;

    return card;
}

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Display error message
function displayError(message) {
    const container = document.getElementById('potsContainer');
    container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center;">
            <p style="color: #d32f2f; font-size: 1.1rem;">${escapeHtml(message)}</p>
        </div>
    `;
}

// Initialize catalog when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCatalog);
