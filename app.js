const API_URL = 'http://localhost:5000/api';

// State Management
const state = {
    user: null,
    token: localStorage.getItem('pos_token') || null,
    products: [],
    categories: [],
    cart: [],
    orders: [],
    currentView: 'pos'
};

// DOM Elements
const els = {
    overlay: document.getElementById('login-overlay'),
    app: document.getElementById('app-container'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPass: document.getElementById('login-password'),
    loginError: document.getElementById('login-error'),
    setupBtn: document.getElementById('setup-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userName: document.getElementById('current-user-name'),
    userRole: document.getElementById('current-user-role'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-links li'),
    views: document.querySelectorAll('.view-section'),
    
    // POS
    productsGrid: document.getElementById('products-grid'),
    categoryFilters: document.getElementById('category-filters'),
    searchInput: document.getElementById('product-search'),
    cartItems: document.getElementById('cart-items'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartDiscount: document.getElementById('cart-discount'),
    cartTotal: document.getElementById('cart-total'),
    checkoutBtn: document.getElementById('checkout-btn'),
    clearCartBtn: document.getElementById('clear-cart-btn'),
    
    // Checkout Modal
    modalCheckout: document.getElementById('modal-checkout'),
    coTotal: document.getElementById('co-total'),
    coAmountPaid: document.getElementById('co-amount-paid'),
    coChange: document.getElementById('co-change'),
    coConfirmBtn: document.getElementById('co-confirm-btn'),
    pmBtns: document.querySelectorAll('.pm-btn'),
    numBtns: document.querySelectorAll('.num-btn'),
    closeModalBtn: document.querySelector('.close-modal'),
    qrContainer: document.getElementById('qr-payment-container'),
    qrAmount: document.getElementById('co-qr-amount'),
    coReceivedGroup: document.getElementById('co-received-group'),
    coNumpad: document.getElementById('co-numpad'),
    
    // Dashboard
    refreshDash: document.getElementById('refresh-dashboard'),
    dashTodayRev: document.getElementById('dash-today-rev'),
    dashMonthRev: document.getElementById('dash-month-rev'),
    dashTodayOrd: document.getElementById('dash-today-orders'),
    dashLowStock: document.getElementById('dash-low-stock'),
    topProductsList: document.getElementById('top-products-list'),
    lowStockTable: document.getElementById('low-stock-table'),

    // Data Tables
    productsTable: document.getElementById('products-table'),
    inventoryLogsTable: document.getElementById('inventory-logs-table'),
    ordersTable: document.getElementById('orders-table'),

    // Add Product Modal
    addProductBtn: document.getElementById('add-product-btn'),
    modalProduct: document.getElementById('modal-product'),
    closeModalProductBtn: document.querySelector('.close-modal-product'),
    prodForm: document.getElementById('add-product-form'),
    prodCategorySelect: document.getElementById('prod-category'),
    prodSaveBtn: document.getElementById('prod-save-btn'),

    // Adjust Stock Modal
    adjustStockBtn: document.getElementById('adjust-stock-btn'),
    modalAdjustStock: document.getElementById('modal-adjust-stock'),
    closeModalAdjustBtn: document.querySelector('.close-modal-adjust'),
    adjForm: document.getElementById('adjust-stock-form'),
    adjProductSelect: document.getElementById('adj-product'),
    adjSaveBtn: document.getElementById('adj-save-btn')
};

// --- Initialization ---
async function init() {
    setupEventListeners();
    
    if (state.token) {
        const isValid = await verifyToken();
        if (isValid) {
            showApp();
            loadInitialData();
        } else {
            showLogin();
        }
    } else {
        showLogin();
    }
}

// --- API Helpers ---
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');
        return data;
    } catch (err) {
        console.error('API Error:', err.message);
        throw err;
    }
}

// --- Auth ---
async function verifyToken() {
    try {
        const user = await apiFetch('/auth/me');
        state.user = user;
        updateUserProfile();
        return true;
    } catch (err) {
        localStorage.removeItem('pos_token');
        state.token = null;
        return false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    try {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: els.loginEmail.value, password: els.loginPass.value })
        });
        state.token = res.token;
        state.user = res.user;
        localStorage.setItem('pos_token', res.token);
        els.loginError.textContent = '';
        showApp();
        loadInitialData();
    } catch (err) {
        els.loginError.textContent = err.message;
    }
}

async function handleSetup() {
    try {
        await apiFetch('/auth/setup', { method: 'POST' });
        alert('Admin user created. You can now login.');
    } catch (err) {
        alert(err.message);
    }
}

function handleLogout() {
    localStorage.removeItem('pos_token');
    state.token = null;
    state.user = null;
    state.cart = [];
    showLogin();
}

function updateUserProfile() {
    els.userName.textContent = state.user.name;
    els.userRole.textContent = state.user.role.charAt(0).toUpperCase() + state.user.role.slice(1);
}

// --- UI Navigation ---
function showLogin() {
    els.app.classList.add('hidden');
    els.overlay.classList.add('active');
}

function showApp() {
    els.overlay.classList.remove('active');
    els.app.classList.remove('hidden');
    switchView(state.currentView);
}

function switchView(viewName) {
    state.currentView = viewName;
    els.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewName);
    });
    els.views.forEach(section => {
        section.classList.toggle('hidden', section.id !== `view-${viewName}`);
        if(section.id === `view-${viewName}`) section.classList.add('active');
        else section.classList.remove('active');
    });

    // Load view specific data
    if(viewName === 'dashboard') loadDashboard();
    if(viewName === 'products') loadProductsTable();
    if(viewName === 'inventory') loadInventoryLogs();
    if(viewName === 'orders') loadOrdersList();
}

function formatMoney(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// --- Data Loading ---
async function loadInitialData() {
    try {
        const [products, categories] = await Promise.all([
            apiFetch('/products'),
            apiFetch('/categories')
        ]);
        state.products = products;
        state.categories = categories;
        renderCategoryFilters();
        renderProducts(products);
    } catch (err) {
        console.warn('Silent fail loading data', err);
    }
}

// --- POS Logic ---
function renderCategoryFilters() {
    let html = `<button class="filter-btn active" data-category="all">All Items</button>`;
    state.categories.forEach(c => {
        html += `<button class="filter-btn" data-category="${c.id}">${c.name}</button>`;
    });
    els.categoryFilters.innerHTML = html;
}

function renderProducts(productsList) {
    els.productsGrid.innerHTML = productsList.map(p => {
        let stockClass = p.stock <= p.minStock ? 'low' : '';
        if (p.stock <= 0) stockClass = 'empty';
        
        let cardClass = p.stock <= 0 ? 'out-of-stock' : '';
        
        let visualElement = '';
        if (p.image) {
            visualElement = `<img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.onerror=null; this.outerHTML='<div class=\\'product-icon\\' style=\\'color: ${p.Category?.color || '#fff'}\\'> <i class=\\'fa-solid ${p.Category?.icon || 'fa-box'}\\'></i></div>';">`;
        } else {
            visualElement = `<div class="product-icon" style="color: ${p.Category?.color || '#fff'}">
                <i class="fa-solid ${p.Category?.icon || 'fa-box'}"></i>
            </div>`;
        }
        
        return `
        <div class="product-card ${cardClass}" onclick="addToCart(${p.id})">
            ${visualElement}
            <div class="p-name">${p.name}</div>
            <div class="p-stock ${stockClass}">Stock: ${p.stock}</div>
            <div class="p-price">${formatMoney(p.price)}</div>
        </div>
        `;
    }).join('');
}

function filterProducts() {
    const query = els.searchInput.value.toLowerCase();
    const activeCatFilter = document.querySelector('.filter-btn.active').dataset.category;
    
    const filtered = state.products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query));
        const matchesCat = activeCatFilter === 'all' || p.categoryId == activeCatFilter;
        return matchesQuery && matchesCat;
    });
    
    // Barcode auto-add logic
    if (query.length > 5 && filtered.length === 1 && filtered[0].barcode === query) {
        addToCart(filtered[0].id);
        els.searchInput.value = ''; // clear scanner input
        filterProducts(); // re-render
    } else {
        renderProducts(filtered);
    }
}

// --- Cart Logic ---
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        alert('Item out of stock!'); return;
    }
    
    const existing = state.cart.find(item => item.product.id === productId);
    if (existing) {
        if (existing.qty >= product.stock) { alert('Max stock reached'); return; }
        existing.qty++;
    } else {
        state.cart.push({ product, qty: 1 });
    }
    renderCart();
}

function updateCartQty(index, delta) {
    const item = state.cart[index];
    item.qty += delta;
    if (item.qty <= 0) {
        state.cart.splice(index, 1);
    } else if (item.qty > item.product.stock) {
        item.qty = item.product.stock;
        alert('Max stock reached');
    }
    renderCart();
}

function renderCart() {
    if (state.cart.length === 0) {
        els.cartItems.innerHTML = '<div class="empty-cart-msg"><i class="fa-solid fa-basket-shopping" style="font-size: 3rem; opacity: 0.2; display: block; margin-bottom: 1rem;"></i>Cart is empty.<br>Scan or click items to add.</div>';
        els.cartSubtotal.textContent = '$0.00';
        els.cartTotal.textContent = '$0.00';
        return;
    }
    
    let subtotal = 0;
    els.cartItems.innerHTML = state.cart.map((item, idx) => {
        const itemTotal = item.product.price * item.qty;
        subtotal += itemTotal;
        return `
        <div class="cart-item">
            <div class="ci-info">
                <div class="ci-name">${item.product.name}</div>
                <div class="ci-price">${item.qty} x ${formatMoney(item.product.price)}</div>
            </div>
            <div class="ci-controls">
                <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            </div>
            <div style="font-weight: 600;">${formatMoney(itemTotal)}</div>
        </div>
        `;
    }).join('');
    
    const discount = parseFloat(els.cartDiscount.value) || 0;
    const total = subtotal - discount;
    
    els.cartSubtotal.textContent = formatMoney(subtotal);
    els.cartTotal.textContent = formatMoney(total > 0 ? total : 0);
}

// --- Checkout Logic ---
function openCheckoutModal() {
    if (state.cart.length === 0) return;
    els.coTotal.textContent = els.cartTotal.textContent;
    els.coAmountPaid.value = parseFloat(els.cartTotal.textContent.replace('$','')).toFixed(2);
    els.modalCheckout.classList.add('active');
    
    // Reset to cash by default
    document.querySelector('input[name="payment"][value="cash"]').checked = true;
    document.querySelector('input[name="payment"][value="cash"]').dispatchEvent(new Event('change'));
    
    updateChange();
    els.coAmountPaid.focus();
}

function updateChange() {
    const total = parseFloat(els.coTotal.textContent.replace('$',''));
    const paid = parseFloat(els.coAmountPaid.value) || 0;
    const change = paid - total;
    if (change >= 0) {
        els.coChange.textContent = formatMoney(change);
        els.coChange.className = 'text-success';
        els.coConfirmBtn.disabled = false;
    } else {
        els.coChange.textContent = 'Insufficient Funds';
        els.coChange.className = 'text-danger';
        els.coConfirmBtn.disabled = true;
    }
}

async function processCheckout() {
    try {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const payload = {
            items: state.cart.map(c => ({ productId: c.product.id, quantity: c.qty })),
            paymentMethod,
            amountPaid: parseFloat(els.coAmountPaid.value),
            discount: parseFloat(els.cartDiscount.value) || 0
        };

        const res = await apiFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        // Success
        els.modalCheckout.classList.remove('active');
        state.cart = [];
        els.cartDiscount.value = "0";
        renderCart();
        loadInitialData(); // Refresh products stock
        
        // Print Receipt
        if (res.order) {
            printReceipt(res.order);
        } else {
            alert('Checkout Successful!');
        }
        
    } catch (err) {
        alert(err.message);
    }
}

function printReceipt(order) {
    const receiptSlip = document.getElementById('receipt-slip');
    const date = new Date(order.createdAt).toLocaleString();
    
    let itemsHtml = '';
    if (order.OrderItems) {
        order.OrderItems.forEach(item => {
            const productName = item.Product ? item.Product.name : 'Unknown Item';
            itemsHtml += `
            <tr>
                <td>${productName}<br><small>${item.quantity} x ${formatMoney(item.unitPrice)}</small></td>
                <td class="text-right">${formatMoney(item.subtotal)}</td>
            </tr>`;
        });
    }

    receiptSlip.innerHTML = `
        <div class="receipt-header">
            <h2>SuperPOS</h2>
            <div>Receipt: ${order.orderNumber}</div>
            <div>Date: ${date}</div>
        </div>
        <div class="receipt-details">
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>
        <div class="receipt-totals">
            <div><span>Subtotal:</span> <span>${formatMoney(order.subtotal)}</span></div>
            <div><span>Discount:</span> <span>${formatMoney(order.discount)}</span></div>
            <div class="bold"><span>Total:</span> <span>${formatMoney(order.total)}</span></div>
            <div style="margin-top: 5px;"><span>Paid (${order.paymentMethod.toUpperCase()}):</span> <span>${formatMoney(order.amountPaid)}</span></div>
            <div><span>Change:</span> <span>${formatMoney(order.changeAmount)}</span></div>
        </div>
        <div class="receipt-footer">
            Thank you for your business!<br>
            Please come again.
        </div>
    `;

    // Trigger print dialog
    window.print();
}

// --- Dashboards & Tables ---
async function loadDashboard() {
    try {
        const data = await apiFetch('/reports/dashboard');
        els.dashTodayRev.textContent = formatMoney(data.todayRevenue);
        els.dashMonthRev.textContent = formatMoney(data.monthlyRevenue);
        els.dashTodayOrd.textContent = data.todayOrderCount;
        els.dashLowStock.textContent = data.lowStockCount;

        const top = await apiFetch('/reports/top-products');
        els.topProductsList.innerHTML = top.map(p => `
            <li style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid rgba(0,0,0,0.1)">
                <span>${p.Product.name}</span>
                <span style="color:var(--primary); font-weight:bold">${p.totalQuantity} sold</span>
            </li>
        `).join('');

        const lowStock = await apiFetch('/inventory/low-stock');
        els.lowStockTable.innerHTML = lowStock.map(p => `
            <tr>
                <td>${p.name}</td>
                <td><span class="badge badge-danger">${p.stock}</span></td>
                <td>${p.minStock}</td>
            </tr>
        `).join('');
    } catch (err) { }
}

async function loadProductsTable() {
    try {
        const products = await apiFetch('/products');
        els.productsTable.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.barcode || '-'}</td>
                <td><span class="badge" style="background:${p.Category?.color}">${p.Category?.name || 'Uncategorized'}</span></td>
                <td>${formatMoney(p.price)}</td>
                <td>${formatMoney(p.costPrice)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="icon-btn" onclick="openEditProductModal(${p.id})"><i class="fa-solid fa-edit"></i></button>
                    <button class="icon-btn text-danger" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) { }
}

async function deleteProduct(id) {
    if(confirm('Disconnect this product?')) {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        loadProductsTable();
        loadInitialData();
    }
}

async function loadInventoryLogs() {
    try {
        const logs = await apiFetch('/inventory/logs');
        els.inventoryLogsTable.innerHTML = logs.map(l => {
            let typeBadge = '';
            if(l.type === 'in' || l.type === 'adjustment') typeBadge = 'badge-success';
            else if(l.type === 'sale' || l.type === 'out') typeBadge = 'badge-warning';
            else typeBadge = 'badge-danger';

            return `
            <tr>
                <td>${new Date(l.createdAt).toLocaleString()}</td>
                <td>${l.Product?.name}</td>
                <td><span class="badge ${typeBadge}">${l.type.toUpperCase()}</span></td>
                <td>${l.type === 'in' || l.type==='return' ? '+' : '-'}${l.quantity}</td>
                <td>${l.previousStock}</td>
                <td>${l.newStock}</td>
                <td>${l.User?.name || 'System'}</td>
            </tr>
            `;
        }).join('');
    } catch (e) {}
}

async function loadOrdersList() {
    try {
        const orders = await apiFetch('/orders');
        state.orders = orders;
        els.ordersTable.innerHTML = orders.map(o => `
            <tr>
                <td>${o.orderNumber}</td>
                <td>${new Date(o.createdAt).toLocaleString()}</td>
                <td>${o.OrderItems.length} items</td>
                <td>${formatMoney(o.total)}</td>
                <td><i class="fa-solid fa-${o.paymentMethod==='cash'?'money-bill':o.paymentMethod==='card'?'credit-card':'qrcode'}"></i> ${o.paymentMethod.toUpperCase()}</td>
                <td><span class="badge ${o.status==='completed'?'badge-success':'badge-danger'}">${o.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size:0.8rem; margin-right: 0.2rem" onclick="reprintOrder(${o.id})" title="Print Invoice"><i class="fa-solid fa-print"></i> Print</button>
                    ${o.status === 'completed' 
                        ? `<button class="btn btn-outline text-danger" style="padding: 0.2rem 0.5rem; font-size:0.8rem" onclick="cancelOrder(${o.id})">Cancel</button>`
                        : ''}
                </td>
            </tr>
        `).join('');
    } catch (e) {}
}

function reprintOrder(id) {
    const order = state.orders.find(o => o.id === id);
    if (order) {
        printReceipt(order);
    }
}

async function cancelOrder(id) {
    if(confirm('Cancel this order and refund stock?')) {
        await apiFetch(`/orders/${id}/cancel`, { method: 'PATCH' });
        loadOrdersList();
        loadInitialData();
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    els.loginForm.addEventListener('submit', handleLogin);
    els.setupBtn.addEventListener('click', handleSetup);
    els.logoutBtn.addEventListener('click', handleLogout);
    
    // View Switching
    els.navLinks.forEach(link => {
        link.addEventListener('click', () => switchView(link.dataset.view));
    });
    
    // POS Search & Filter
    els.searchInput.addEventListener('input', filterProducts);
    els.categoryFilters.addEventListener('click', (e) => {
        if(e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts();
        }
    });

    els.cartDiscount.addEventListener('input', renderCart);
    els.clearCartBtn.addEventListener('click', () => { state.cart = []; renderCart(); });
    els.checkoutBtn.addEventListener('click', openCheckoutModal);
    
    // Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (!els.modalCheckout.classList.contains('active')) openCheckoutModal();
        }
        if (e.key === 'Escape') {
            els.modalCheckout.classList.remove('active');
        }
    });

    // Modal
    els.closeModalBtn.addEventListener('click', () => els.modalCheckout.classList.remove('active'));
    els.coAmountPaid.addEventListener('input', updateChange);
    els.coConfirmBtn.addEventListener('click', processCheckout);
    
    // Numpad logic
    els.numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.textContent;
            if (val === 'C') els.coAmountPaid.value = '0';
            else if (btn.id === 'num-exact') els.coAmountPaid.value = parseFloat(els.coTotal.textContent.replace('$','')).toFixed(2);
            else if (btn.dataset.val) els.coAmountPaid.value = (parseFloat(els.coAmountPaid.value||0) + parseFloat(btn.dataset.val)).toFixed(2);
            else {
                if(els.coAmountPaid.value === '0' || els.coAmountPaid.value === '0.00') els.coAmountPaid.value = val;
                else els.coAmountPaid.value += val;
            }
            updateChange();
        });
    });

    // Payment method selection style
    els.pmBtns.forEach(lbl => {
        const input = lbl.querySelector('input');
        input.addEventListener('change', () => {
            els.pmBtns.forEach(b => b.classList.remove('active'));
            lbl.classList.add('active');
            
            // Toggle QR vs Cash/Card UI
            if (input.value === 'qr') {
                els.qrContainer.classList.remove('hidden');
                els.qrAmount.textContent = els.coTotal.textContent;
                els.coReceivedGroup.classList.add('hidden'); // hide for QR
            } else {
                els.qrContainer.classList.add('hidden');
                els.coReceivedGroup.classList.remove('hidden'); // show for Card and Cash
            }

            if (input.value === 'qr' || input.value === 'card') {
                // Disable input and hide numpad for digital payments
                els.coNumpad.classList.add('hidden');
                els.coAmountPaid.disabled = true;
                
                // Auto-set amount paid to total exactly for digital
                els.coAmountPaid.value = parseFloat(els.coTotal.textContent.replace('$', '')).toFixed(2);
                updateChange();
            } else {
                // Cash payment
                els.coNumpad.classList.remove('hidden');
                els.coAmountPaid.disabled = false;
            }
        });
    });

    // Dashboard refresh
    els.refreshDash.addEventListener('click', loadDashboard);

    // Add Product
    if(els.addProductBtn) els.addProductBtn.addEventListener('click', openAddProductModal);
    if(els.closeModalProductBtn) els.closeModalProductBtn.addEventListener('click', () => els.modalProduct.classList.remove('active'));
    if(els.prodSaveBtn) els.prodSaveBtn.addEventListener('click', handleSaveProduct);

    // Adjust Stock
    if(els.adjustStockBtn) els.adjustStockBtn.addEventListener('click', openAdjustStockModal);
    if(els.closeModalAdjustBtn) els.closeModalAdjustBtn.addEventListener('click', () => els.modalAdjustStock.classList.remove('active'));
    if(els.adjSaveBtn) els.adjSaveBtn.addEventListener('click', handleAdjustStock);
}

let editingProductId = null;

// --- Modals Logic ---
function openAddProductModal() {
    editingProductId = null;
    document.querySelector('#modal-product .modal-header h2').textContent = 'Add New Product';
    els.prodForm.reset();
    els.prodCategorySelect.innerHTML = `<option value="">None</option>` + state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    els.modalProduct.classList.add('active');
}

function openEditProductModal(id) {
    editingProductId = id;
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    
    document.querySelector('#modal-product .modal-header h2').textContent = 'Edit Product';
    els.prodCategorySelect.innerHTML = `<option value="">None</option>` + state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-barcode').value = p.barcode || '';
    document.getElementById('prod-category').value = p.categoryId || '';
    document.getElementById('prod-image-file').value = '';
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-cost').value = p.costPrice;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-min-stock').value = p.minStock;
    
    els.modalProduct.classList.add('active');
}

async function handleSaveProduct() {
    if (!els.prodForm.checkValidity()) {
        els.prodForm.reportValidity();
        return;
    }
    
    const formData = new FormData();
    formData.append('name', document.getElementById('prod-name').value);
    formData.append('barcode', document.getElementById('prod-barcode').value || '');
    formData.append('categoryId', document.getElementById('prod-category').value || '');
    formData.append('price', document.getElementById('prod-price').value);
    formData.append('costPrice', document.getElementById('prod-cost').value || 0);
    formData.append('stock', document.getElementById('prod-stock').value || 0);
    formData.append('minStock', document.getElementById('prod-min-stock').value || 10);
    
    const fileInput = document.getElementById('prod-image-file');
    if (fileInput.files.length > 0) {
        formData.append('imageFile', fileInput.files[0]);
    }

    const headers = {};
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const url = editingProductId ? `/${editingProductId}` : '';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const res = await fetch(`${API_URL}/products${url}`, {
            method,
            headers,
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');
        
        alert(editingProductId ? 'Product updated successfully' : 'Product added successfully');
        els.modalProduct.classList.remove('active');
        loadProductsTable();
        loadInitialData(); // Refresh POS grid
    } catch (err) {
        alert(err.message);
    }
}

function openAdjustStockModal() {
    els.adjForm.reset();
    els.adjProductSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
    els.modalAdjustStock.classList.add('active');
}

async function handleAdjustStock() {
    if (!els.adjForm.checkValidity()) {
        els.adjForm.reportValidity();
        return;
    }
    const payload = {
        productId: document.getElementById('adj-product').value,
        type: document.getElementById('adj-type').value,
        quantity: parseInt(document.getElementById('adj-qty').value),
        reason: document.getElementById('adj-reason').value || ''
    };
    try {
        await apiFetch('/inventory/adjust', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        els.modalAdjustStock.classList.remove('active');
        loadInventoryLogs();
        loadInitialData(); // Refresh stock
        alert('Stock adjusted successfully');
    } catch (err) {
        alert(err.message);
    }
}

// Bootstrap
init();
