// ===========================
// BONSAI POTS CATALOG - SCRIPT
// ===========================

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

    // Filter pots
    filteredPots = allPots.filter(pot => {
        const matchesSearch = 
            pot.name.toLowerCase().includes(searchValue) ||
            pot.code.toLowerCase().includes(searchValue) ||
            (pot.dimensions && pot.dimensions.toLowerCase().includes(searchValue));
        return matchesSearch;
    });

    // Sort pots
    filteredPots.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'price-desc':
                return parseFloat(b.price) - parseFloat(a.price);
            default:
                return 0;
        }
    });

    renderGallery();
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

// Create a single gallery image item
function createGalleryItem(pot, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${index * 0.03}s`;
    item.setAttribute('title', `${pot.name} - $${parseFloat(pot.price).toFixed(2)}`);

    const imageHtml = pot.image 
        ? `<img src="${pot.image}" alt="${escapeHtml(pot.name)}" class="gallery-image" loading="lazy">`
        : `<div class="gallery-placeholder">🍲</div>`;

    item.innerHTML = imageHtml;

    return item;
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