// SwiftGoods Inc. Site Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log("SwiftGoods Inc. Site Logic Loaded");

    // --- Hamburger Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('header nav ul');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
         document.addEventListener('click', (event) => {
             const isClickInsideNav = navMenu.contains(event.target);
             const isClickOnToggle = navToggle.contains(event.target);
             if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                 navMenu.classList.remove('active');
                 navToggle.setAttribute('aria-expanded', 'false');
             }
         });
    } else {
        console.warn("Nav toggle button or nav menu not found.");
    }

    // --- Router simulation based on page ID/class ---
    if (document.querySelector('.catalogue-section')) {
        runCatalogueLogic();
    } else if (document.getElementById('order-form')) {
        runOrderPageLogic();
    } else if (document.querySelector('.payment-page-section')) { // New condition for payment page
        runPaymentPageLogic();
    } else if (document.querySelector('.confirmation-details')) {
        runConfirmationPageLogic();
    } else if (document.querySelector('.management-section')) {
        runProcurementPageLogic();
    } else if (document.getElementById('admin-login-gate') || document.getElementById('admin-content')) {
        runAdminPageLogic();
    }

}); // End DOMContentLoaded


// =======================================================
// --- Helper Function: Check Table Scroll (Optional) ---
// =======================================================
function checkTableScroll(tableWrapperSelector) {
    const wrapper = document.querySelector(tableWrapperSelector);
    if (wrapper) {
        const table = wrapper.querySelector('table');
        if (table) {
            const isScrollable = table.offsetWidth > wrapper.clientWidth + 2;
            if (isScrollable) {
                wrapper.classList.add('is-scrollable');
            } else {
                wrapper.classList.remove('is-scrollable');
            }
        } else {
             wrapper.classList.remove('is-scrollable');
        }
    }
}

// =======================================================
// --- Catalogue Page Logic ---
// =======================================================
function runCatalogueLogic() {
     console.log("Running Catalogue Logic");
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');
    const modal = document.getElementById('product-modal');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    const closeModalBtn = modal ? modal.querySelector('.close-btn') : null;

    if (filterButtons.length > 0 && productItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                productItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    item.classList.toggle('hidden', !(category === 'all' || itemCategory === category));
                });
            });
        });
    }

    if (modal && learnMoreButtons.length > 0 && closeModalBtn) {
        learnMoreButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productCard = button.closest('.product-item');
                if (!productCard) return;
                const title = productCard.querySelector('h3').innerText;
                const description = productCard.querySelector('p').innerText;
                const price = productCard.querySelector('.price').innerText;
                const imgSrc = productCard.querySelector('img').src;
                const productId = button.getAttribute('data-product-id');

                modal.querySelector('#modal-title').innerText = title;
                modal.querySelector('#modal-description').innerText = `More detailed information about ${title} (ID: ${productId}). ${description}`;
                modal.querySelector('#modal-price').innerText = price;
                modal.querySelector('#modal-img').src = imgSrc;
                modal.querySelector('#modal-img').alt = title;
                modal.style.display = 'block';
            });
        });

        closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });
    } else {
        console.warn("Catalogue modal elements not fully found.");
    }
}


// =======================================================
// --- Order Page Logic ---
// =======================================================
function runOrderPageLogic() {
    console.log("Running Order Page Logic");
    const form = document.getElementById('order-form');
    const quantityInputs = document.querySelectorAll('.product-quantity');
    const summaryItemsDiv = document.getElementById('summary-items');
    const subtotalSpan = document.getElementById('summary-subtotal');
    const taxSpan = document.getElementById('summary-tax');
    const totalSpan = document.getElementById('summary-total');
    const formSubmissionErrorDiv = document.getElementById('form-submission-error');

    if (!form || quantityInputs.length === 0 || !summaryItemsDiv || !subtotalSpan || !taxSpan || !totalSpan || !formSubmissionErrorDiv) {
        console.error("One or more required elements for the Order Page are missing.");
        return;
    }

    const TAX_RATE = 0.05;

    const updateOrderSummary = () => {
        let subtotal = 0;
        summaryItemsDiv.innerHTML = '';
        let hasItems = false;

        quantityInputs.forEach(input => {
            const quantity = parseInt(input.value, 10);
            if (!isNaN(quantity) && quantity > 0) {
                hasItems = true;
                const itemDiv = input.closest('.order-product-item');
                if (!itemDiv) return;
                const price = parseFloat(itemDiv.getAttribute('data-price'));
                // Use data-name attribute for product name consistency
                const name = itemDiv.getAttribute('data-name') || itemDiv.querySelector('.product-name')?.innerText;
                if (isNaN(price) || !name) return;

                const itemTotal = quantity * price;
                subtotal += itemTotal;

                const summaryItem = document.createElement('p');
                summaryItem.innerHTML = `${name} (x${quantity}) <span>$${itemTotal.toFixed(2)}</span>`;
                summaryItemsDiv.appendChild(summaryItem);
            }
        });

        if (!hasItems) {
            summaryItemsDiv.innerHTML = '<p><em>Select products to see summary...</em></p>';
        }

        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        taxSpan.textContent = `$${tax.toFixed(2)}`;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    };

    quantityInputs.forEach(input => {
        input.addEventListener('change', updateOrderSummary);
        input.addEventListener('input', updateOrderSummary);
    });
    updateOrderSummary();

    const validateForm = () => {
        let isValid = true;
        formSubmissionErrorDiv.style.display = 'none';
        formSubmissionErrorDiv.textContent = '';

         document.querySelectorAll('#order-form .error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
         });
         document.querySelectorAll('#order-form .invalid').forEach(el => el.classList.remove('invalid'));

        const requiredTextFields = ['customer-name', 'customer-email', 'shipping-address', 'shipping-city', 'shipping-zip'];
        requiredTextFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            const errorDiv = input.parentElement.querySelector('.error-message');
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
                if (errorDiv) {
                    errorDiv.textContent = 'This field is required.';
                    errorDiv.style.display = 'block';
                 }
            }
        });

        const emailInput = document.getElementById('customer-email');
        if (emailInput && emailInput.value.trim()) {
            const emailErrorDiv = emailInput.parentElement.querySelector('.error-message');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                emailInput.classList.add('invalid');
                 if (emailErrorDiv && !emailErrorDiv.textContent) { // Only update if not already set by required
                    emailErrorDiv.textContent = 'Please enter a valid email address.';
                    emailErrorDiv.style.display = 'block';
                }
            }
        }

        const zipInput = document.getElementById('shipping-zip');
        if (zipInput && zipInput.value.trim()) {
             const zipErrorDiv = zipInput.parentElement.querySelector('.error-message');
             const zipPattern = zipInput.getAttribute('pattern');
             const zipRegex = new RegExp(`^${zipPattern}$`);
             if (zipPattern && !zipRegex.test(zipInput.value.trim())) {
                isValid = false;
                zipInput.classList.add('invalid');
                if (zipErrorDiv && !zipErrorDiv.textContent) {
                    zipErrorDiv.textContent = zipInput.title || 'Please enter a valid ZIP code.';
                    zipErrorDiv.style.display = 'block';
                }
             }
        }

        let hasProducts = false;
        quantityInputs.forEach(input => {
            if (parseInt(input.value, 10) > 0) {
                hasProducts = true;
            }
        });
        if (!hasProducts) {
            isValid = false;
             formSubmissionErrorDiv.textContent = 'Please select at least one product.';
             formSubmissionErrorDiv.style.display = 'block';
        }
        return isValid;
    };

    form.addEventListener('submit', (event) => {
        if (!validateForm()) {
            event.preventDefault();
             formSubmissionErrorDiv.textContent = formSubmissionErrorDiv.textContent || 'Please fix the errors above.';
             formSubmissionErrorDiv.style.display = 'block';
             const firstError = form.querySelector('.invalid, .error-message[style*="block"]');
             if (firstError) {
                 const elementToScroll = firstError.classList.contains('error-message') ? firstError.parentElement : firstError;
                 elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
        } else {
            console.log("Order form is valid, proceeding to payment...");
            formSubmissionErrorDiv.style.display = 'none';
            // Form will submit to payment.html via GET
        }
    });
}

// =======================================================
// --- Payment Page Logic ---
// =======================================================
function runPaymentPageLogic() {
    console.log("Running Payment Page Logic");
    const params = new URLSearchParams(window.location.search);

    const summaryDetailsDiv = document.getElementById('payment-order-summary-details');
    const subtotalSpan = document.getElementById('payment-summary-subtotal');
    const taxSpan = document.getElementById('payment-summary-tax');
    const totalSpan = document.getElementById('payment-summary-total');

    const paymentOptionBtns = document.querySelectorAll('.payment-option-btn');
    const telebirrForm = document.getElementById('telebirr-form');
    const cbebirrForm = document.getElementById('cbebirr-form');
    const paymentDefaultInstruction = document.getElementById('payment-default-instruction');


    if (!summaryDetailsDiv || !subtotalSpan || !taxSpan || !totalSpan || paymentOptionBtns.length === 0 || !telebirrForm || !cbebirrForm || !paymentDefaultInstruction) {
        console.error("One or more required elements for the Payment Page are missing.");
        if(summaryDetailsDiv) summaryDetailsDiv.innerHTML = '<p><em>Error loading order details. Please go back and try again.</em></p>';
        return;
    }

    const TAX_RATE = 0.05;
    let orderSubtotal = 0;
    let orderItems = []; // To store item details for forwarding

    summaryDetailsDiv.innerHTML = ''; // Clear "loading" message
    let hasItems = false;

    // Product data from order.html (assuming product-item divs exist there)
    // This is a bit of a workaround since we don't have a proper backend/cart object
    // In a real app, this data would come from a server-side session or API.
    const productElementsOnOrderPage = Array.from(document.querySelectorAll('#product-selection .order-product-item'));
    // For the payment page, we rely solely on URL params for product quantities
    // and reconstruct names/prices. This is fragile.
    // A better way is to pass all product details in URL or use sessionStorage.

    params.forEach((value, key) => {
        if (key.startsWith('qty_')) {
            const quantity = parseInt(value, 10);
            if (quantity > 0) {
                hasItems = true;
                const productId = key.substring(4); // e.g., prod001
                
                // Try to get product name and price from hidden inputs or a predefined list
                // For this demo, we'll have to make assumptions or pass them in URL too.
                // Let's assume they were passed like `name_prod001` and `price_prod001`
                // Or we could define a simple product list here for demo purposes.
                const productsData = { // Simplified product data for payment page
                    "prod001": { name: "Fresh Apples (Kg)", price: 2.99 },
                    "prod002": { name: "Fresh Milk (1L)", price: 1.50 },
                    "prod003": { name: "Basmati Rice (1kg)", price: 4.50 },
                    "prod007": { name: "Potato Chips (150g)", price: 1.80 }
                    // Add other products from order.html here
                };

                const productInfo = productsData[productId];

                if (productInfo) {
                    const itemName = productInfo.name;
                    const itemPrice = productInfo.price;
                    const itemTotal = quantity * itemPrice;
                    orderSubtotal += itemTotal;

                    const summaryItemP = document.createElement('p');
                    summaryItemP.innerHTML = `${itemName} (x${quantity}) <span>$${itemTotal.toFixed(2)}</span>`;
                    summaryDetailsDiv.appendChild(summaryItemP);
                    orderItems.push({id: productId, name: itemName, quantity: quantity, price: itemPrice, total: itemTotal});
                }
            }
        }
    });


    if (!hasItems) {
        summaryDetailsDiv.innerHTML = '<p><em>No items in your order. Please go back to the order page.</em></p>';
        // Disable payment options if no items
        paymentOptionBtns.forEach(btn => btn.disabled = true);
        telebirrForm.style.display = 'none';
        cbebirrForm.style.display = 'none';
        paymentDefaultInstruction.textContent = "Your cart is empty.";
    }

    const orderTax = orderSubtotal * TAX_RATE;
    const orderTotal = orderSubtotal + orderTax;

    subtotalSpan.textContent = `$${orderSubtotal.toFixed(2)}`;
    taxSpan.textContent = `$${orderTax.toFixed(2)}`;
    totalSpan.textContent = `$${orderTotal.toFixed(2)}`;

    // Payment method selection
    let selectedPaymentMethod = null;

    paymentOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentOptionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPaymentMethod = btn.getAttribute('data-payment-method');

            telebirrForm.style.display = selectedPaymentMethod === 'telebirr' ? 'block' : 'none';
            cbebirrForm.style.display = selectedPaymentMethod === 'cbebirr' ? 'block' : 'none';
            paymentDefaultInstruction.style.display = 'none';

            // Clear any previous feedback messages
            telebirrForm.querySelector('.payment-feedback').textContent = '';
            cbebirrForm.querySelector('.payment-feedback').textContent = '';
        });
    });

    // Form submission handler
    const handlePaymentFormSubmit = (event, paymentMethodName) => {
        event.preventDefault();
        const form = event.target;
        const phoneInput = form.querySelector('input[type="tel"]');
        const nameInput = form.querySelector('input[type="text"]');
        const feedbackDiv = form.querySelector('.payment-feedback');

        feedbackDiv.textContent = '';
        let isValid = true;

        // Validate phone
        if (!phoneInput.value.trim() || !/^\d{10,}$/.test(phoneInput.value.trim())) {
            // Basic 10-digit phone validation, adjust regex as needed for Ethiopian numbers
            phoneInput.classList.add('invalid');
            phoneInput.parentElement.querySelector('.error-message').textContent = 'Valid phone number is required (at least 10 digits).';
            phoneInput.parentElement.querySelector('.error-message').style.display = 'block';
            isValid = false;
        } else {
            phoneInput.classList.remove('invalid');
            phoneInput.parentElement.querySelector('.error-message').textContent = '';
            phoneInput.parentElement.querySelector('.error-message').style.display = 'none';
        }

        // Validate name
        if (!nameInput.value.trim()) {
            nameInput.classList.add('invalid');
            nameInput.parentElement.querySelector('.error-message').textContent = 'Full name is required.';
            nameInput.parentElement.querySelector('.error-message').style.display = 'block';
            isValid = false;
        } else {
            nameInput.classList.remove('invalid');
            nameInput.parentElement.querySelector('.error-message').textContent = '';
            nameInput.parentElement.querySelector('.error-message').style.display = 'none';
        }

        if (!isValid) {
            feedbackDiv.textContent = 'Please correct the errors above.';
            feedbackDiv.style.display = 'block';
            return;
        }

        if (!hasItems) {
            feedbackDiv.textContent = 'Your cart is empty. Cannot proceed.';
            feedbackDiv.style.display = 'block';
            return;
        }

        // Simulate payment and redirect
        console.log(`Simulating ${paymentMethodName} payment...`);
        feedbackDiv.textContent = `Processing ${paymentMethodName} payment... Please wait.`;
        feedbackDiv.classList.remove('error'); feedbackDiv.classList.add('success'); // Or a neutral class
        feedbackDiv.style.display = 'block';


        // Collect all original params and add payment info
        const confirmationParams = new URLSearchParams(window.location.search);
        confirmationParams.set('payment_method', paymentMethodName);
        confirmationParams.set(`${paymentMethodName}_phone`, phoneInput.value.trim());
        confirmationParams.set(`${paymentMethodName}_name`, nameInput.value.trim());
        confirmationParams.set('order_total', orderTotal.toFixed(2)); // Pass total for display

        // For passing item details to confirmation (optional, makes URL long)
        // orderItems.forEach((item, index) => {
        //     confirmationParams.set(`item_${index}_name`, item.name);
        //     confirmationParams.set(`item_${index}_qty`, item.quantity);
        //     confirmationParams.set(`item_${index}_total`, item.total.toFixed(2));
        // });
        // confirmationParams.set('item_count', orderItems.length);


        setTimeout(() => {
            window.location.href = `order_confirmation.html?${confirmationParams.toString()}`;
        }, 1500); // Simulate delay
    };

    telebirrForm.addEventListener('submit', (e) => handlePaymentFormSubmit(e, 'TeleBirr'));
    cbebirrForm.addEventListener('submit', (e) => handlePaymentFormSubmit(e, 'CBEBirr'));
}


// =======================================================
// --- Confirmation Page Logic ---
// =======================================================
function runConfirmationPageLogic() {
     console.log("Running Confirmation Page Logic");
     try {
         const params = new URLSearchParams(window.location.search);
         const name = params.get('customer_name');
         const email = params.get('customer_email');
         const address = params.get('shipping_address');
         const city = params.get('shipping_city');
         const zip = params.get('shipping_zip');
         const paymentMethod = params.get('payment_method'); // Get payment method

         const confName = document.getElementById('conf-name');
         const confEmail = document.getElementById('conf-email');
         const confAddress = document.getElementById('conf-address');
         const confPaymentMethod = document.getElementById('conf-payment-method'); // New element for payment method
         const summaryDiv = document.getElementById('confirmation-summary');

         let dataPopulated = false;

         if (confName && name) {
             confName.textContent = name;
             dataPopulated = true;
         }
         if (confEmail && email) {
             confEmail.textContent = email;
             dataPopulated = true;
         }

         let fullAddress = '';
         if(address) fullAddress += address;
         if(city) fullAddress += (fullAddress ? '\n' : '') + city;
         if(zip) fullAddress += (fullAddress && city ? ', ' : (fullAddress ? '\n' : '')) + zip;

         if (confAddress && fullAddress) {
             confAddress.innerText = fullAddress;
             dataPopulated = true;
         } else if (confAddress && address) {
             confAddress.textContent = address;
              dataPopulated = true;
         }

         if (confPaymentMethod && paymentMethod) { // Display payment method
             confPaymentMethod.textContent = paymentMethod;
             const paymentMethodP = document.getElementById('payment-method-display-p');
             if (paymentMethodP) paymentMethodP.style.display = 'block'; // Show the paragraph
             dataPopulated = true;
         }


         // Clear the simple placeholder if data was populated
         if (summaryDiv && dataPopulated) {
             const placeholder = summaryDiv.querySelector('p > em');
             if (placeholder) placeholder.parentElement.style.display = 'none';
         }
     } catch (error) {
        console.error("Error processing confirmation page details:", error);
     }
}


// =======================================================
// --- Procurement & Management Page Logic ---
// =======================================================
function runProcurementPageLogic() {
    console.log("Running Procurement Management Logic");

    const storageKeys = {
        orders: 'swiftGoodsProcOrders',
        suppliers: 'swiftGoodsSuppliers',
        inventory: 'swiftGoodsInventory'
    };

    const loadData = (key, defaultValue) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) { console.error(`Error loading data for key ${key}:`, e); return defaultValue; }
    };
    const saveData = (key, data) => {
        try { localStorage.setItem(key, JSON.stringify(data)); }
        catch (e) { console.error(`Error saving data for key ${key}:`, e); }
    };

    const sampleOrders = [
        { id: 'PO001', supplier: 'FreshFarm Co.', date: '2024-05-20', item: 'Apples', quantity: 100, status: 'Delivered' },
        { id: 'PO002', supplier: 'DairyBest Ltd.', date: '2024-05-22', item: 'Milk', quantity: 50, status: 'Approved' },
        { id: 'PO003', supplier: 'GrainCorp', date: '2024-05-25', item: 'Rice', quantity: 200, status: 'Pending' },
    ];
    const sampleSuppliers = [
        { id: 'S01', name: 'FreshFarm Co.', email: 'sales@freshfarm.com', phone: '111-222-3333', products: 'Apples, Bananas, Vegetables' },
        { id: 'S02', name: 'DairyBest Ltd.', email: 'orders@dairybest.net', phone: '444-555-6666', products: 'Milk, Cheese, Yogurt' },
        { id: 'S03', name: 'GrainCorp', email: 'info@graincorp.org', phone: '777-888-9999', products: 'Rice, Flour, Oats' },
    ];
    const sampleInventory = [
        { name: 'Apples', stock: 150, lastUpdated: '2024-05-21' },
        { name: 'Milk', stock: 75, lastUpdated: '2024-05-20' },
        { name: 'Rice', stock: 500, lastUpdated: '2024-05-18' },
        { name: 'Potato Chips', stock: 120, lastUpdated: '2024-05-15' },
        { name: 'Bananas', stock: 45, lastUpdated: '2024-05-21' },
    ];

    let procurementOrders = loadData(storageKeys.orders, sampleOrders);
    let suppliers = loadData(storageKeys.suppliers, sampleSuppliers);
    let inventory = loadData(storageKeys.inventory, sampleInventory);

    const orderTableBody = document.querySelector('#procurement-orders-table tbody');
    const supplierTableBody = document.querySelector('#suppliers-table tbody');
    const inventoryTableBody = document.querySelector('#inventory-table tbody');
    const addOrderForm = document.getElementById('add-order-form');
    const supplierSelect = document.getElementById('order-supplier');
    const addOrderFeedback = document.getElementById('add-order-feedback');
    const searchOrdersInput = document.getElementById('search-orders');
    const filterOrderStatusSelect = document.getElementById('filter-order-status');
    const searchSuppliersInput = document.getElementById('search-suppliers');
    const searchInventoryInput = document.getElementById('search-inventory');
    const supplierModal = document.getElementById('supplier-modal');
    const addSupplierBtn = document.getElementById('add-supplier-btn');
    const closeSupplierModalBtns = document.querySelectorAll('.supplier-modal-close');
    const editSupplierForm = document.getElementById('edit-supplier-form');
    const supplierModalTitle = document.getElementById('supplier-modal-title');
    const editSupplierId = document.getElementById('edit-supplier-id');
    const editSupplierName = document.getElementById('edit-supplier-name');
    const editSupplierEmail = document.getElementById('edit-supplier-email');
    const editSupplierPhone = document.getElementById('edit-supplier-phone');
    const editSupplierProducts = document.getElementById('edit-supplier-products');
    const editSupplierFeedback = document.getElementById('edit-supplier-feedback');
    const stockModal = document.getElementById('stock-modal');
    const closeStockModalBtns = document.querySelectorAll('.stock-modal-close');
    const updateStockForm = document.getElementById('update-stock-form');
    // const stockModalTitle = document.getElementById('stock-modal-title'); // Already declared in original
    const updateStockItemName = document.getElementById('update-stock-item-name');
    const stockItemDisplayName = document.getElementById('stock-item-display-name');
    const updateStockQuantity = document.getElementById('update-stock-quantity');
    const updateStockFeedback = document.getElementById('update-stock-feedback');

    if (!orderTableBody || !supplierTableBody || !inventoryTableBody || !addOrderForm || !supplierSelect || !addOrderFeedback ||
        !searchOrdersInput || !filterOrderStatusSelect || !searchSuppliersInput || !searchInventoryInput ||
        !supplierModal || !addSupplierBtn || closeSupplierModalBtns.length === 0 || !editSupplierForm ||
        !stockModal || closeStockModalBtns.length === 0 || !updateStockForm) {
        console.error("One or more required elements for the Procurement Page are missing.");
        addOrderForm?.querySelectorAll('button, input, select').forEach(el => el.disabled = true);
        addSupplierBtn?.setAttribute('disabled', 'true');
        return;
    }

    const showFeedback = (element, message, isSuccess) => {
        if (!element) return;
        element.textContent = message;
        element.className = `feedback-message ${isSuccess ? 'success' : 'error'}`;
        element.style.display = 'block';
        setTimeout(() => { if (element) element.style.display = 'none'; }, 3000);
    };
    const generateId = (prefix) => prefix + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const renderOrders = (ordersToRender = procurementOrders) => {
        if (!orderTableBody) return;
        orderTableBody.innerHTML = '';
        if (ordersToRender.length === 0) {
            orderTableBody.innerHTML = '<tr><td colspan="7">No orders found matching your criteria.</td></tr>';
            return;
        }
        ordersToRender.forEach(order => {
            const row = orderTableBody.insertRow();
            row.dataset.orderId = order.id;
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.supplier || 'N/A'}</td>
                <td>${order.date || 'N/A'}</td>
                <td>${order.item || 'N/A'}</td>
                <td>${order.quantity || 0}</td>
                <td><span class="status status-${order.status || 'Unknown'}">${order.status || 'Unknown'}</span></td>
                <td>
                    <select class="action-btn update-status-select" aria-label="Update status for order ${order.id}">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Approved" ${order.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="action-btn delete-btn delete-order-btn" title="Delete Order ${order.id}">×</button>
                </td>`;
        });
        addOrderEventListeners();
        checkTableScroll('#procurement-orders .table-responsive');
    };

    const renderSuppliers = (suppliersToRender = suppliers) => {
        if (!supplierTableBody) return;
        supplierTableBody.innerHTML = '';
        if (suppliersToRender.length === 0) {
            supplierTableBody.innerHTML = '<tr><td colspan="5">No suppliers found matching your criteria.</td></tr>';
            return;
        }
        suppliersToRender.forEach(supplier => {
            const row = supplierTableBody.insertRow();
            row.dataset.supplierId = supplier.id;
            row.innerHTML = `
                <td>${supplier.name || 'N/A'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.products || '-'}</td>
                <td>
                    <button class="action-btn edit-btn edit-supplier-btn">Edit</button>
                    <button class="action-btn delete-btn delete-supplier-btn">Delete</button>
                </td>`;
        });
        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
            suppliers.forEach(s => {
                const option = document.createElement('option');
                option.value = s.name; option.textContent = s.name;
                supplierSelect.appendChild(option);
            });
        }
        addSupplierEventListeners();
        checkTableScroll('#supplier-management .table-responsive');
    };

     const renderInventory = (inventoryToRender = inventory) => {
         if (!inventoryTableBody) return;
        inventoryTableBody.innerHTML = '';
        if (inventoryToRender.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="4">No inventory items found matching your criteria.</td></tr>';
            return;
        }
        inventoryToRender.sort((a, b) => a.name.localeCompare(b.name));
        inventoryToRender.forEach(item => {
            const row = inventoryTableBody.insertRow();
            row.dataset.itemName = item.name;
            row.innerHTML = `
                <td>${item.name || 'N/A'}</td>
                <td>${item.stock !== undefined ? item.stock : '-'} ${item.stock < 50 ? '<span style="color:red; font-weight:bold;">(Low)</span>' : ''}</td>
                <td>${item.lastUpdated || '-'}</td>
                 <td><button class="action-btn update-stock-btn" data-current-stock="${item.stock}">Update Stock</button></td>`;
        });
         addInventoryEventListeners();
         checkTableScroll('#inventory-tracking .table-responsive');
    };

    if (addOrderForm) {
        addOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
             const supplier = supplierSelect.value;
             const itemInput = document.getElementById('order-item');
             const quantityInput = document.getElementById('order-quantity');
             const dateInput = document.getElementById('order-date');
             const item = itemInput.value.trim();
             const quantity = quantityInput.value;
             const date = dateInput.value;
             let isValid = true;
             if (!supplier) isValid = false;
             if (!item) { itemInput.classList.add('invalid'); isValid = false; } else { itemInput.classList.remove('invalid'); }
             if (!quantity || quantity <= 0) { quantityInput.classList.add('invalid'); isValid = false; } else { quantityInput.classList.remove('invalid'); }
             if (!date) { dateInput.classList.add('invalid'); isValid = false; } else { dateInput.classList.remove('invalid'); }
             if (!isValid) { showFeedback(addOrderFeedback, 'Please fill all fields correctly.', false); return; }

            const newOrder = { id: generateId('PO'), supplier: supplier, date: date, item: item, quantity: parseInt(quantity, 10), status: 'Pending' };
            procurementOrders.push(newOrder);
            saveData(storageKeys.orders, procurementOrders);
            renderOrders(); addOrderForm.reset();
            if(dateInput) dateInput.value = getCurrentDate();
            showFeedback(addOrderFeedback, 'Order added successfully!', true);
        });
    }

    function addOrderEventListeners() {
        if (!orderTableBody) return;
        orderTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('update-status-select')) {
                const row = e.target.closest('tr'); const orderId = row?.dataset.orderId; if (!orderId) return;
                const newStatus = e.target.value;
                const orderIndex = procurementOrders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    const originalStatus = procurementOrders[orderIndex].status;
                    procurementOrders[orderIndex].status = newStatus;
                    if (newStatus === 'Delivered' && originalStatus !== 'Delivered') updateInventoryStock(procurementOrders[orderIndex].item, procurementOrders[orderIndex].quantity, true);
                    else if (originalStatus === 'Delivered' && newStatus !== 'Delivered') updateInventoryStock(procurementOrders[orderIndex].item, procurementOrders[orderIndex].quantity, false);
                    saveData(storageKeys.orders, procurementOrders); renderOrders(); renderInventory();
                }
            }
        });
         orderTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-order-btn')) {
                 const row = e.target.closest('tr'); const orderId = row?.dataset.orderId; if (!orderId) return;
                if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
                procurementOrders = procurementOrders.filter(o => o.id !== orderId);
                saveData(storageKeys.orders, procurementOrders); renderOrders();
            }
         });
    }

    if (addSupplierBtn) {
        addSupplierBtn.addEventListener('click', () => {
            if (!supplierModal || !editSupplierForm || !supplierModalTitle || !editSupplierId || !editSupplierFeedback) return;
            supplierModalTitle.textContent = 'Add New Supplier'; editSupplierForm.reset(); editSupplierId.value = '';
            editSupplierFeedback.style.display = 'none'; supplierModal.style.display = 'block';
            editSupplierName?.focus();
        });
    }
    closeSupplierModalBtns.forEach(btn => btn.addEventListener('click', () => { if (supplierModal) supplierModal.style.display = 'none'; }));

    function addSupplierEventListeners() {
        if (!supplierTableBody) return;
        supplierTableBody.addEventListener('click', (e) => {
            const targetButton = e.target.closest('button'); if (!targetButton) return;
            const row = targetButton.closest('tr'); const supplierId = row?.dataset.supplierId; if (!supplierId) return;
            if (targetButton.classList.contains('edit-supplier-btn')) {
                 const supplier = suppliers.find(s => s.id === supplierId);
                 if (supplier && supplierModal && editSupplierForm && supplierModalTitle && editSupplierId && editSupplierName && editSupplierEmail && editSupplierPhone && editSupplierProducts && editSupplierFeedback) {
                    supplierModalTitle.textContent = 'Edit Supplier'; editSupplierId.value = supplier.id;
                    editSupplierName.value = supplier.name; editSupplierEmail.value = supplier.email;
                    editSupplierPhone.value = supplier.phone || ''; editSupplierProducts.value = supplier.products || '';
                    editSupplierFeedback.style.display = 'none'; supplierModal.style.display = 'block'; editSupplierName.focus();
                }
            } else if (targetButton.classList.contains('delete-supplier-btn')) {
                 if (!confirm(`Are you sure you want to delete supplier ${suppliers.find(s=>s.id===supplierId)?.name || supplierId}? This cannot be undone.`)) return;
                 suppliers = suppliers.filter(s => s.id !== supplierId); saveData(storageKeys.suppliers, suppliers); renderSuppliers();
            }
        });
    }

    if (editSupplierForm) {
        editSupplierForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!editSupplierName || !editSupplierEmail || !editSupplierFeedback || !editSupplierId || !editSupplierPhone || !editSupplierProducts) return;
            const id = editSupplierId.value; const name = editSupplierName.value.trim(); const email = editSupplierEmail.value.trim();
            const phone = editSupplierPhone.value.trim(); const products = editSupplierProducts.value.trim();
            if (!name || !email) { showFeedback(editSupplierFeedback, 'Supplier Name and Email are required.', false); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFeedback(editSupplierFeedback, 'Please enter a valid email address.', false); return; }
            if (id) {
                const index = suppliers.findIndex(s => s.id === id);
                if (index !== -1) { suppliers[index] = { ...suppliers[index], name, email, phone, products }; showFeedback(editSupplierFeedback, 'Supplier updated successfully!', true); }
                else { showFeedback(editSupplierFeedback, 'Error: Supplier not found for update.', false); return; }
            } else {
                const newSupplier = { id: generateId('S'), name, email, phone, products };
                suppliers.push(newSupplier); showFeedback(editSupplierFeedback, 'Supplier added successfully!', true);
            }
            saveData(storageKeys.suppliers, suppliers); renderSuppliers();
            setTimeout(() => { if (supplierModal) supplierModal.style.display = 'none'; }, 1500);
        });
    }

    const updateInventoryStock = (itemName, quantity, isAdding) => {
        if (typeof itemName !== 'string' || typeof quantity !== 'number' || quantity <= 0) { console.warn('Invalid parameters for updateInventoryStock'); return; }
        const itemIndex = inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
        let updated = false;
        if (itemIndex !== -1) {
             inventory[itemIndex].stock = isAdding ? inventory[itemIndex].stock + quantity : Math.max(0, inventory[itemIndex].stock - quantity);
            inventory[itemIndex].lastUpdated = getCurrentDate(); updated = true;
        } else if (isAdding) {
            const newItemName = itemName; inventory.push({ name: newItemName, stock: quantity, lastUpdated: getCurrentDate() });
             updated = true; console.log(`New item ${newItemName} added to inventory.`);
        }
        if (updated) { saveData(storageKeys.inventory, inventory); console.log(`Inventory updated for ${itemName}. Action: ${isAdding ? 'Add' : 'Subtract'} ${quantity}.`); }
        else { console.warn(`Item ${itemName} not found in inventory for stock deduction.`); }
        return updated;
    };

    function addInventoryEventListeners() {
         if (!inventoryTableBody) return;
         inventoryTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-stock-btn')) {
                const row = e.target.closest('tr'); const itemName = row?.dataset.itemName; const currentStock = e.target.dataset.currentStock;
                if (!itemName || currentStock === undefined || !stockModal || !updateStockItemName || !stockItemDisplayName || !updateStockQuantity || !updateStockFeedback) return;
                 updateStockItemName.value = itemName; stockItemDisplayName.textContent = itemName; updateStockQuantity.value = currentStock;
                 updateStockFeedback.style.display = 'none'; stockModal.style.display = 'block'; updateStockQuantity.focus();
            }
         });
    }
    closeStockModalBtns.forEach(btn => btn.addEventListener('click', () => { if (stockModal) stockModal.style.display = 'none'; }));

    if (updateStockForm) {
         updateStockForm.addEventListener('submit', (e) => {
             e.preventDefault();
             if (!updateStockItemName || !updateStockQuantity || !updateStockFeedback) return;
             const itemName = updateStockItemName.value; const newStockInput = updateStockQuantity.value; const newStock = parseInt(newStockInput, 10);
             if (isNaN(newStock) || newStock < 0) { showFeedback(updateStockFeedback, 'Please enter a valid non-negative stock quantity.', false); return; }
             const itemIndex = inventory.findIndex(item => item.name === itemName);
             if (itemIndex !== -1) {
                 inventory[itemIndex].stock = newStock; inventory[itemIndex].lastUpdated = getCurrentDate();
                 saveData(storageKeys.inventory, inventory); renderInventory();
                 showFeedback(updateStockFeedback, 'Stock updated successfully!', true);
                 setTimeout(() => { if (stockModal) stockModal.style.display = 'none'; }, 1500);
             } else { showFeedback(updateStockFeedback, 'Error: Item not found.', false); }
         });
    }

    const filterAndSearch = () => {
        const orderSearchTerm = searchOrdersInput?.value.toLowerCase() || '';
        const orderStatusFilter = filterOrderStatusSelect?.value || 'all';
        const supplierSearchTerm = searchSuppliersInput?.value.toLowerCase() || '';
        const inventorySearchTerm = searchInventoryInput?.value.toLowerCase() || '';

        const filteredOrders = procurementOrders.filter(order =>
            (!orderSearchTerm || (order.id && order.id.toLowerCase().includes(orderSearchTerm)) || (order.supplier && order.supplier.toLowerCase().includes(orderSearchTerm)) || (order.item && order.item.toLowerCase().includes(orderSearchTerm))) &&
            (orderStatusFilter === 'all' || order.status === orderStatusFilter));
        renderOrders(filteredOrders);

        const filteredSuppliers = suppliers.filter(supplier =>
            !supplierSearchTerm || (supplier.name && supplier.name.toLowerCase().includes(supplierSearchTerm)) || (supplier.products && supplier.products.toLowerCase().includes(supplierSearchTerm)) || (supplier.email && supplier.email.toLowerCase().includes(supplierSearchTerm)));
        renderSuppliers(filteredSuppliers);

         const filteredInventory = inventory.filter(item =>
             !inventorySearchTerm || (item.name && item.name.toLowerCase().includes(inventorySearchTerm)));
         renderInventory(filteredInventory);
    };

    searchOrdersInput?.addEventListener('input', filterAndSearch);
    filterOrderStatusSelect?.addEventListener('change', filterAndSearch);
    searchSuppliersInput?.addEventListener('input', filterAndSearch);
    searchInventoryInput?.addEventListener('input', filterAndSearch);

    renderOrders(); renderSuppliers(); renderInventory();
    const orderDateInput = document.getElementById('order-date');
    if(orderDateInput) orderDateInput.value = getCurrentDate();
}

// =======================================================
// --- Admin Dashboard Page Logic ---
// =======================================================
function runAdminPageLogic() {
    console.log("Running Admin Dashboard Logic");

    const loginGate = document.getElementById('admin-login-gate');
    const adminContent = document.getElementById('admin-content');
    const passwordInput = document.getElementById('admin-password');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    if (!loginGate || !adminContent || !passwordInput || !loginButton || !loginError) {
        console.error("Required DOM elements for Admin Login Gate are missing."); return;
    }
    const CORRECT_PASSWORD = "admin123";

    const checkLogin = () => {
        const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
        loginGate.style.display = isLoggedIn ? 'none' : 'block';
        adminContent.style.display = isLoggedIn ? 'block' : 'none';
        if (isLoggedIn) initializeAdminDashboard();
        else { passwordInput.value = ''; passwordInput.focus(); }
    };

    loginButton.addEventListener('click', () => {
        const password = passwordInput.value;
        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem('isAdminLoggedIn', 'true'); loginError.textContent = '';
            loginError.style.display = 'none'; checkLogin();
        } else {
            loginError.textContent = 'Incorrect password.'; loginError.style.display = 'block';
            sessionStorage.removeItem('isAdminLoggedIn'); passwordInput.focus(); passwordInput.select();
        }
    });
     passwordInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); loginButton.click(); } });

    function initializeAdminDashboard() {
        console.log("Initializing Admin Dashboard Content");

        const userTableBody = document.querySelector('#users-table tbody');
        const searchUsersInput = document.getElementById('search-users');
        const addUserBtn = document.getElementById('add-user-btn');
        const userModal = document.getElementById('user-modal');
        const closeUserModalBtns = document.querySelectorAll('.user-modal-close');
        const editUserForm = document.getElementById('edit-user-form');
        const userModalTitle = document.getElementById('user-modal-title');
        const editUserId = document.getElementById('edit-user-id');
        const editUserName = document.getElementById('edit-user-name');
        const editUserEmail = document.getElementById('edit-user-email');
        const editUserRole = document.getElementById('edit-user-role');
        const editUserFeedback = document.getElementById('edit-user-feedback');
        const metricTotalOrders = document.getElementById('metric-total-orders');
        const metricPendingOrders = document.getElementById('metric-pending-orders');
        const metricTotalValue = document.getElementById('metric-total-value');
        const metricDeliveredMonth = document.getElementById('metric-delivered-month');
        const metricTotalSuppliers = document.getElementById('metric-total-suppliers');
        const metricInventoryItems = document.getElementById('metric-inventory-items');
        const metricLowStock = document.getElementById('metric-low-stock');

        if (!userTableBody || !searchUsersInput || !addUserBtn || !userModal || !editUserForm || closeUserModalBtns.length === 0) {
            console.error("Required DOM elements for admin user management are missing.");
            const userMgmtBlock = document.getElementById('admin-user-management');
            if (userMgmtBlock) userMgmtBlock.innerHTML = '<p>Error loading user management.</p>';
        }
        if (!metricTotalOrders || !metricPendingOrders || !metricTotalValue || !metricDeliveredMonth || !metricTotalSuppliers || !metricInventoryItems || !metricLowStock) {
            console.warn("One or more metric display elements are missing.");
        }

        const storageKeys = { orders: 'swiftGoodsProcOrders', suppliers: 'swiftGoodsSuppliers', inventory: 'swiftGoodsInventory', users: 'swiftGoodsUsers' };
        const loadData = (key, defaultValue) => { try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } catch (e) { console.error(`Error loading data: ${key}`, e); return defaultValue; } };
        const saveData = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(`Error saving data: ${key}`, e); } };
        const sampleUsers = [
            { id: 'U001', name: 'Admin User', email: 'admin@swiftgoods.com', role: 'Admin' },
            { id: 'U002', name: 'Priya Khan', email: 'priya.k@swiftgoods.com', role: 'ProcurementManager' },
            { id: 'U003', name: 'Mark Lee', email: 'mark.l@swiftgoods.com', role: 'Staff' },
            { id: 'U004', name: 'View Only', email: 'viewer@swiftgoods.com', role: 'Viewer' },
        ];
        const procurementOrders = loadData(storageKeys.orders, []); const suppliers = loadData(storageKeys.suppliers, []);
        const inventory = loadData(storageKeys.inventory, []); let users = loadData(storageKeys.users, sampleUsers);

        const calculateMetrics = () => {
            if (!metricTotalOrders || !metricPendingOrders || !metricTotalValue || !metricDeliveredMonth || !metricTotalSuppliers || !metricInventoryItems || !metricLowStock) return;
            metricTotalOrders.textContent = procurementOrders.length;
            metricPendingOrders.textContent = procurementOrders.filter(o => o.status === 'Pending').length;
            const relevantOrders = procurementOrders.filter(o => o.status === 'Approved' || o.status === 'Delivered');
            const simulatedTotalValue = relevantOrders.reduce((sum, order) => sum + (order.quantity * 10), 0);
            metricTotalValue.textContent = `$${simulatedTotalValue.toFixed(2)}`;
            const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            metricDeliveredMonth.textContent = procurementOrders.filter(o => { if (o.status !== 'Delivered' || !o.date) return false; try { return new Date(o.date) >= thirtyDaysAgo; } catch { return false; } }).length;
            metricTotalSuppliers.textContent = suppliers.length; metricInventoryItems.textContent = inventory.length;
            metricLowStock.textContent = inventory.filter(item => item.stock < 50).length;
        };

        const renderUsers = (usersToRender = users) => {
            if (!userTableBody) return; userTableBody.innerHTML = '';
            if (usersToRender.length === 0) { userTableBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>'; return; }
            usersToRender.forEach(user => {
                const row = userTableBody.insertRow(); row.dataset.userId = user.id;
                row.innerHTML = `<td>${user.id}</td><td>${user.name||'N/A'}</td><td>${user.email||'N/A'}</td><td><span class="role-${user.role||'Unknown'}">${user.role||'Unknown'}</span></td>
                    <td><button class="action-btn edit-btn edit-user-btn">Edit</button><button class="action-btn delete-btn delete-user-btn">Delete</button></td>`;
            });
            addUserEventListeners(); checkTableScroll('#admin-user-management .table-responsive');
        };

        const openUserModal = (user = null) => {
             if (!userModal || !editUserForm || !userModalTitle || !editUserId || !editUserName || !editUserEmail || !editUserRole || !editUserFeedback) return;
             editUserForm.reset(); editUserFeedback.style.display = 'none';
             editUserForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
             editUserForm.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
             if (user) { userModalTitle.textContent = 'Edit User'; editUserId.value = user.id; editUserName.value = user.name; editUserEmail.value = user.email; editUserRole.value = user.role; }
             else { userModalTitle.textContent = 'Add New User'; editUserId.value = ''; }
             userModal.style.display = 'block'; editUserName.focus();
        };
        if (addUserBtn) addUserBtn.addEventListener('click', () => openUserModal());
        closeUserModalBtns.forEach(btn => btn.addEventListener('click', () => { if (userModal) userModal.style.display = 'none'; }));

        function addUserEventListeners() {
            if (!userTableBody) return;
            userTableBody.addEventListener('click', (e) => {
                const targetButton = e.target.closest('button'); if (!targetButton) return;
                const row = targetButton.closest('tr'); const userId = row?.dataset.userId; if (!userId) return;
                if (targetButton.classList.contains('edit-user-btn')) { const user = users.find(u => u.id === userId); if (user) openUserModal(user); }
                else if (targetButton.classList.contains('delete-user-btn')) {
                    if (userId === 'U001') { alert('Cannot delete main admin user.'); return; }
                    if (!confirm(`Delete user ${users.find(u=>u.id===userId)?.name || userId}?`)) return;
                    users = users.filter(u => u.id !== userId); saveData(storageKeys.users, users); renderUsers();
                }
            });
        }

        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                 if (!editUserId || !editUserName || !editUserEmail || !editUserRole || !editUserFeedback) return;
                 let isValid = true; const name = editUserName.value.trim(); const email = editUserEmail.value.trim(); const role = editUserRole.value; const id = editUserId.value;
                 editUserForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
                 editUserForm.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
                 if (!name) { editUserName.classList.add('invalid'); editUserName.nextElementSibling.textContent = 'Name required.'; editUserName.nextElementSibling.style.display = 'block'; isValid = false; }
                 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { editUserEmail.classList.add('invalid'); editUserEmail.nextElementSibling.textContent = 'Valid email required.'; editUserEmail.nextElementSibling.style.display = 'block'; isValid = false; }
                 if (!role) { editUserRole.classList.add('invalid'); editUserRole.nextElementSibling.textContent = 'Role required.'; editUserRole.nextElementSibling.style.display = 'block'; isValid = false; }
                 if (!isValid) { showFeedback(editUserFeedback, 'Fix errors.', false); return; }
                 if (id) { const index = users.findIndex(u => u.id === id); if (index !== -1) { users[index] = { ...users[index], name, email, role }; showFeedback(editUserFeedback, 'User updated!', true); } else { showFeedback(editUserFeedback, 'User not found.', false); return; } }
                 else { const newUser = { id: generateId('U'), name, email, role }; users.push(newUser); showFeedback(editUserFeedback, 'User added!', true); }
                 saveData(storageKeys.users, users); renderUsers(); setTimeout(() => { if (userModal) userModal.style.display = 'none'; }, 1500);
            });
        }
        if (searchUsersInput) {
            searchUsersInput.addEventListener('input', () => {
                const searchTerm = searchUsersInput.value.toLowerCase();
                const filteredUsers = users.filter(user => (user.name && user.name.toLowerCase().includes(searchTerm)) || (user.email && user.email.toLowerCase().includes(searchTerm)) || (user.role && user.role.toLowerCase().includes(searchTerm)));
                renderUsers(filteredUsers);
            });
        }
        calculateMetrics(); renderUsers();
    }
    checkLogin();
}


// =======================================================
// --- Global Window Resize Listener ---
// =======================================================
window.addEventListener('resize', () => {
    if (document.querySelector('.management-section')) {
        checkTableScroll('#procurement-orders .table-responsive');
        checkTableScroll('#supplier-management .table-responsive');
        checkTableScroll('#inventory-tracking .table-responsive');
    }
    const adminContent = document.getElementById('admin-content');
    if (adminContent && adminContent.style.display !== 'none') {
         checkTableScroll('#admin-user-management .table-responsive');
    }
});
