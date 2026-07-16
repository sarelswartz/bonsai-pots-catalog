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
        renderPots();
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

    renderPots();
}

// Render pots to the DOM
function renderPots() {
    const container = document.getElementById('potsContainer');
    const noResults = document.getElementById('noResults');

    container.innerHTML = '';

    if (filteredPots.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    filteredPots.forEach((pot, index) => {
        const potCard = createPotCard(pot, index);
        container.appendChild(potCard);
    });
}

// Create a single pot card element
function createPotCard(pot, index) {
    const card = document.createElement('div');
    card.className = 'pot-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const imageHtml = pot.image 
        ? `<img src="${pot.image}" alt="${pot.name}" class="pot-image" loading="lazy">`
        : `<div class="pot-placeholder">🍲</div>`;

    const dimensionsHtml = pot.dimensions
        ? `<div class="pot-detail-item">
               <span class="pot-detail-label">Dimensions:</span>
               <span class="pot-detail-value">${pot.dimensions}</span>
           </div>`
        : '';

    card.innerHTML = `
        <div class="pot-image-container">
            ${imageHtml}
        </div>
        <div class="pot-content">
            <div class="pot-header">
                <div class="pot-name">${escapeHtml(pot.name)}</div>
                ${pot.code ? `<div class="pot-code">Code: ${escapeHtml(pot.code)}</div>` : ''}
            </div>
            <div class="pot-details">
                ${dimensionsHtml}
                ${pot.description ? `<p>${escapeHtml(pot.description)}</p>` : ''}
            </div>
            <div class="pot-price">
                <span class="pot-price-currency">$</span>${parseFloat(pot.price).toFixed(2)}
            </div>
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