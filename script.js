// SwiftGoods Inc. Site Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log("SwiftGoods Inc. Site Logic Loaded");

    // --- Router simulation based on page ID/class ---
    if (document.querySelector('.catalogue-section')) {
        runCatalogueLogic();
    } else if (document.getElementById('order-form')) {
        runOrderPageLogic();
    } else if (document.querySelector('.confirmation-details')) {
        runConfirmationPageLogic();
    } else if (document.querySelector('.management-section')) {
        runProcurementPageLogic(); // For procurement page
    } else if (document.getElementById('admin-login-gate') || document.getElementById('admin-content')) {
        runAdminPageLogic(); // For admin page
    }

}); // End DOMContentLoaded


// =======================================================
// --- Helper Function: Check Table Scroll (Optional) ---
// Adds a class to the wrapper if the table inside is wider than the wrapper
// =======================================================
function checkTableScroll(tableWrapperSelector) {
    const wrapper = document.querySelector(tableWrapperSelector);
    if (wrapper) {
        const table = wrapper.querySelector('table');
        if (table) {
            // Check if table width exceeds wrapper width
            // Use a small threshold to account for potential border/padding issues
            const isScrollable = table.offsetWidth > wrapper.clientWidth + 2;
            if (isScrollable) {
                wrapper.classList.add('is-scrollable');
            } else {
                wrapper.classList.remove('is-scrollable');
            }
        } else {
             // If no table found, remove the class
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
    const closeModalBtn = modal ? modal.querySelector('.close-btn') : null; // Safety check

    // Filtering
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

    // Modal Logic
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

    // Safety checks for required elements
    if (!form || quantityInputs.length === 0 || !summaryItemsDiv || !subtotalSpan || !taxSpan || !totalSpan || !formSubmissionErrorDiv) {
        console.error("One or more required elements for the Order Page are missing.");
        return;
    }

    const TAX_RATE = 0.05; // 5% tax rate

    // Function to update the order summary
    const updateOrderSummary = () => {
        let subtotal = 0;
        summaryItemsDiv.innerHTML = ''; // Clear previous summary items
        let hasItems = false;

        quantityInputs.forEach(input => {
            const quantity = parseInt(input.value, 10);
            if (!isNaN(quantity) && quantity > 0) {
                hasItems = true;
                const itemDiv = input.closest('.order-product-item');
                if (!itemDiv) return; // Skip if structure is wrong
                const price = parseFloat(itemDiv.getAttribute('data-price'));
                const nameElement = itemDiv.querySelector('.product-name');
                if (isNaN(price) || !nameElement) return; // Skip if data is missing

                const name = nameElement.innerText;
                const itemTotal = quantity * price;
                subtotal += itemTotal;

                // Add item to summary display
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

    // Add event listeners to quantity inputs
    quantityInputs.forEach(input => {
        input.addEventListener('change', updateOrderSummary);
        input.addEventListener('input', updateOrderSummary); // Use 'input' for better responsiveness
    });

    // Initial summary calculation on page load
    updateOrderSummary();

    // --- Form Validation ---
    const validateForm = () => {
        let isValid = true;
        formSubmissionErrorDiv.style.display = 'none'; // Hide general error first
        formSubmissionErrorDiv.textContent = '';

        // Clear previous errors
         document.querySelectorAll('#order-form .error-message').forEach(el => {
            el.textContent = ''; // Clear text
            el.style.display = 'none'; // Hide
         });
         document.querySelectorAll('#order-form .invalid').forEach(el => el.classList.remove('invalid'));


        // Validate Required Fields (Name, Email, Address, City, Zip)
        const requiredTextFields = ['customer-name', 'customer-email', 'shipping-address', 'shipping-city', 'shipping-zip'];
        requiredTextFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input) return; // Skip if element doesn't exist
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

        // Validate Email Format
        const emailInput = document.getElementById('customer-email');
        if (emailInput && emailInput.value.trim()) { // Only validate if not empty (required check handles empty)
            const emailErrorDiv = emailInput.parentElement.querySelector('.error-message');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                emailInput.classList.add('invalid');
                 if (emailErrorDiv) {
                    errorDiv.textContent = 'Please enter a valid email address.';
                    errorDiv.style.display = 'block';
                }
            }
        }

        // Validate ZIP Code Format (Using pattern attribute, but double-check)
        const zipInput = document.getElementById('shipping-zip');
        if (zipInput && zipInput.value.trim()) {
             const zipErrorDiv = zipInput.parentElement.querySelector('.error-message');
             // Use the pattern from the HTML attribute for consistency
             const zipPattern = zipInput.getAttribute('pattern');
             const zipRegex = new RegExp(`^${zipPattern}$`); // Create RegExp from pattern string
             if (zipPattern && !zipRegex.test(zipInput.value.trim())) {
                isValid = false;
                zipInput.classList.add('invalid');
                if (zipErrorDiv) {
                    zipErrorDiv.textContent = zipInput.title || 'Please enter a valid ZIP code.'; // Use title attr if available
                    zipErrorDiv.style.display = 'block';
                }
             }
        }


        // Validate that at least one product has quantity > 0
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


    // --- Form Submission ---
    form.addEventListener('submit', (event) => {
        if (!validateForm()) {
            event.preventDefault(); // Prevent submission if validation fails
             formSubmissionErrorDiv.textContent = formSubmissionErrorDiv.textContent || 'Please fix the errors above.';
             formSubmissionErrorDiv.style.display = 'block';
             // Scroll to the first error
             const firstError = form.querySelector('.invalid, .error-message[style*="block"]');
             if (firstError) {
                 // Scroll the element or its parent group into view
                 const elementToScroll = firstError.classList.contains('error-message') ? firstError.parentElement : firstError;
                 elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
        } else {
            // Form is valid, allow submission
            console.log("Order form is valid, submitting...");
            formSubmissionErrorDiv.style.display = 'none';
            // Native form submission to order_confirmation.html will happen
        }
    });
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

         const confName = document.getElementById('conf-name');
         const confEmail = document.getElementById('conf-email');
         const confAddress = document.getElementById('conf-address');
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
         if(city) fullAddress += (fullAddress ? '\n' : '') + city; // Use newline for potentially better formatting
         if(zip) fullAddress += (fullAddress && city ? ', ' : (fullAddress ? '\n' : '')) + zip; // Add zip

         if (confAddress && fullAddress) {
             // Use innerText or create text nodes to handle potential newlines correctly
             confAddress.innerText = fullAddress;
             dataPopulated = true;
         } else if (confAddress && address) { // Fallback if only address textarea was passed
             confAddress.textContent = address;
              dataPopulated = true;
         }

         // Clear the simple placeholder if data was populated
         if (summaryDiv && dataPopulated) {
             const placeholder = summaryDiv.querySelector('p > em');
             if (placeholder) placeholder.parentElement.style.display = 'none';
         }
     } catch (error) {
        console.error("Error processing confirmation page details:", error);
        // Keep default placeholders visible if error occurs
     }
}


// =======================================================
// --- Procurement & Management Page Logic ---
// =======================================================
function runProcurementPageLogic() {
    console.log("Running Procurement Management Logic");

    // --- Data Storage (using localStorage for basic persistence) ---
    const storageKeys = {
        orders: 'swiftGoodsProcOrders',
        suppliers: 'swiftGoodsSuppliers',
        inventory: 'swiftGoodsInventory'
    };

    const loadData = (key, defaultValue) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error loading data for key ${key}:`, e);
            return defaultValue;
        }
    };

    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data for key ${key}:`, e);
        }
    };

    // Sample Data (used if localStorage is empty)
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
        { name: 'Bananas', stock: 45, lastUpdated: '2024-05-21' }, // Low stock example
    ];

    let procurementOrders = loadData(storageKeys.orders, sampleOrders);
    let suppliers = loadData(storageKeys.suppliers, sampleSuppliers);
    let inventory = loadData(storageKeys.inventory, sampleInventory);

    // --- DOM Element References ---
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

    // Supplier Modal Elements
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

     // Stock Modal Elements
    const stockModal = document.getElementById('stock-modal');
    const closeStockModalBtns = document.querySelectorAll('.stock-modal-close');
    const updateStockForm = document.getElementById('update-stock-form');
    const stockModalTitle = document.getElementById('stock-modal-title');
    const updateStockItemName = document.getElementById('update-stock-item-name');
    const stockItemDisplayName = document.getElementById('stock-item-display-name');
    const updateStockQuantity = document.getElementById('update-stock-quantity');
    const updateStockFeedback = document.getElementById('update-stock-feedback');

    // Check if all required elements are present
    if (!orderTableBody || !supplierTableBody || !inventoryTableBody || !addOrderForm || !supplierSelect || !addOrderFeedback ||
        !searchOrdersInput || !filterOrderStatusSelect || !searchSuppliersInput || !searchInventoryInput ||
        !supplierModal || !addSupplierBtn || closeSupplierModalBtns.length === 0 || !editSupplierForm ||
        !stockModal || closeStockModalBtns.length === 0 || !updateStockForm) {
        console.error("One or more required elements for the Procurement Page are missing.");
        // Optionally disable functionality or show a user-facing error
        // For example, disable forms and buttons
        addOrderForm?.querySelectorAll('button, input, select').forEach(el => el.disabled = true);
        addSupplierBtn?.setAttribute('disabled', 'true');
        // etc.
        return; // Stop execution for this page's logic
    }


    // --- Utility Functions ---
    const showFeedback = (element, message, isSuccess) => {
        if (!element) return;
        element.textContent = message;
        element.className = `feedback-message ${isSuccess ? 'success' : 'error'}`;
        element.style.display = 'block';
        // Use timeout to hide feedback
        setTimeout(() => {
            if (element) element.style.display = 'none';
        }, 3000);
    };

    const generateId = (prefix) => {
        // Simple ID generator, consider more robust methods (like UUID) in production
        return prefix + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    };

    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    }

    // --- Rendering Functions ---
    const renderOrders = (ordersToRender = procurementOrders) => {
        if (!orderTableBody) return;
        orderTableBody.innerHTML = ''; // Clear table
        if (ordersToRender.length === 0) {
            orderTableBody.innerHTML = '<tr><td colspan="7">No orders found matching your criteria.</td></tr>';
            return;
        }
        ordersToRender.forEach(order => {
            const row = orderTableBody.insertRow();
            row.dataset.orderId = order.id; // Add ID for easier selection
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
                </td>
            `;
        });
        addOrderEventListeners(); // Re-attach listeners after render
        checkTableScroll('#procurement-orders .table-responsive'); // Check scroll after rendering
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
                </td>
            `;
        });

        // Populate supplier dropdown in add order form
        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
            suppliers.forEach(s => {
                const option = document.createElement('option');
                option.value = s.name; // Using name for simplicity, ID might be better
                option.textContent = s.name;
                supplierSelect.appendChild(option);
            });
        }
        addSupplierEventListeners(); // Re-attach listeners
        checkTableScroll('#supplier-management .table-responsive'); // Check scroll
    };

     const renderInventory = (inventoryToRender = inventory) => {
         if (!inventoryTableBody) return;
        inventoryTableBody.innerHTML = '';
        if (inventoryToRender.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="4">No inventory items found matching your criteria.</td></tr>';
            return;
        }
        // Sort inventory alphabetically by name for consistency
        inventoryToRender.sort((a, b) => a.name.localeCompare(b.name));

        inventoryToRender.forEach(item => {
            const row = inventoryTableBody.insertRow();
            row.dataset.itemName = item.name;
            row.innerHTML = `
                <td>${item.name || 'N/A'}</td>
                <td>${item.stock !== undefined ? item.stock : '-'} ${item.stock < 50 ? '<span style="color:red; font-weight:bold;">(Low)</span>' : ''}</td>
                <td>${item.lastUpdated || '-'}</td>
                 <td>
                    <button class="action-btn update-stock-btn" data-current-stock="${item.stock}">Update Stock</button>
                </td>
            `;
        });
         addInventoryEventListeners(); // Re-attach listeners
         checkTableScroll('#inventory-tracking .table-responsive'); // Check scroll
    };


     // --- Event Handlers ---

    // Add Order Form Submission
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
             // Simple Validation
             if (!supplier) {
                // Highlight supplier select or show error
                isValid = false;
             }
             if (!item) {
                itemInput.classList.add('invalid'); // Example validation feedback
                isValid = false;
             } else {
                itemInput.classList.remove('invalid');
             }
             if (!quantity || quantity <= 0) {
                quantityInput.classList.add('invalid');
                isValid = false;
             } else {
                quantityInput.classList.remove('invalid');
             }
              if (!date) {
                dateInput.classList.add('invalid');
                isValid = false;
             } else {
                 dateInput.classList.remove('invalid');
             }

             if (!isValid) {
                 showFeedback(addOrderFeedback, 'Please fill all fields correctly.', false);
                 return;
             }

            const newOrder = {
                id: generateId('PO'),
                supplier: supplier,
                date: date,
                item: item,
                quantity: parseInt(quantity, 10),
                status: 'Pending' // Default status
            };
            procurementOrders.push(newOrder);
            saveData(storageKeys.orders, procurementOrders);
            renderOrders(); // Re-render table
            addOrderForm.reset(); // Clear form
            // Reset date to current after clearing
            if(dateInput) dateInput.value = getCurrentDate();
            showFeedback(addOrderFeedback, 'Order added successfully!', true);
        });
    }

    // Order Table Actions (Status Update, Delete)
    function addOrderEventListeners() {
        // Use event delegation on the table body for better performance
        if (!orderTableBody) return;
        orderTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('update-status-select')) {
                const row = e.target.closest('tr');
                const orderId = row?.dataset.orderId;
                if (!orderId) return;

                const newStatus = e.target.value;
                const orderIndex = procurementOrders.findIndex(o => o.id === orderId);

                if (orderIndex !== -1) {
                    const originalStatus = procurementOrders[orderIndex].status;
                    procurementOrders[orderIndex].status = newStatus;

                    // If status changes to 'Delivered', update inventory
                    if (newStatus === 'Delivered' && originalStatus !== 'Delivered') {
                        updateInventoryStock(procurementOrders[orderIndex].item, procurementOrders[orderIndex].quantity, true); // Add stock
                    }
                    // If status changes *from* 'Delivered' back to something else (less common)
                    else if (originalStatus === 'Delivered' && newStatus !== 'Delivered') {
                         updateInventoryStock(procurementOrders[orderIndex].item, procurementOrders[orderIndex].quantity, false); // Subtract stock
                    }

                    saveData(storageKeys.orders, procurementOrders);
                    // Update only the status badge in the specific row for efficiency?
                    // Or re-render the whole table (simpler for now)
                    renderOrders();
                    renderInventory(); // Re-render inventory as it might have changed
                }
            }
        });

         orderTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-order-btn')) {
                 const row = e.target.closest('tr');
                 const orderId = row?.dataset.orderId;
                 if (!orderId) return;

                if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;

                procurementOrders = procurementOrders.filter(o => o.id !== orderId);
                saveData(storageKeys.orders, procurementOrders);
                renderOrders();
            }
         });
    }

    // Supplier Modal Handling
    if (addSupplierBtn) {
        addSupplierBtn.addEventListener('click', () => {
            if (!supplierModal || !editSupplierForm || !supplierModalTitle || !editSupplierId || !editSupplierFeedback) return;
            supplierModalTitle.textContent = 'Add New Supplier';
            editSupplierForm.reset();
            editSupplierId.value = ''; // Ensure no ID is set for adding
            editSupplierFeedback.style.display = 'none';
            supplierModal.style.display = 'block';
            editSupplierName?.focus(); // Focus first field
        });
    }

    closeSupplierModalBtns.forEach(btn => btn.addEventListener('click', () => {
        if (supplierModal) supplierModal.style.display = 'none';
    }));

    // Edit/Delete Supplier Button Handling (Event Delegation)
    function addSupplierEventListeners() {
        if (!supplierTableBody) return;
        supplierTableBody.addEventListener('click', (e) => {
            const targetButton = e.target.closest('button'); // Find the button clicked
            if (!targetButton) return;

            const row = targetButton.closest('tr');
            const supplierId = row?.dataset.supplierId;
            if (!supplierId) return;

            if (targetButton.classList.contains('edit-supplier-btn')) {
                 const supplier = suppliers.find(s => s.id === supplierId);
                 if (supplier && supplierModal && editSupplierForm && supplierModalTitle && editSupplierId && editSupplierName && editSupplierEmail && editSupplierPhone && editSupplierProducts && editSupplierFeedback) {
                    supplierModalTitle.textContent = 'Edit Supplier';
                    editSupplierId.value = supplier.id;
                    editSupplierName.value = supplier.name;
                    editSupplierEmail.value = supplier.email;
                    editSupplierPhone.value = supplier.phone || '';
                    editSupplierProducts.value = supplier.products || '';
                    editSupplierFeedback.style.display = 'none';
                    supplierModal.style.display = 'block';
                    editSupplierName.focus(); // Focus first field
                }
            } else if (targetButton.classList.contains('delete-supplier-btn')) {
                 if (!confirm(`Are you sure you want to delete supplier ${suppliers.find(s=>s.id===supplierId)?.name || supplierId}? This cannot be undone.`)) return;
                 suppliers = suppliers.filter(s => s.id !== supplierId);
                 saveData(storageKeys.suppliers, suppliers);
                 renderSuppliers();
            }
        });
    }

     // Edit/Add Supplier Form Submission
    if (editSupplierForm) {
        editSupplierForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!editSupplierName || !editSupplierEmail || !editSupplierFeedback || !editSupplierId || !editSupplierPhone || !editSupplierProducts) return;

            const id = editSupplierId.value;
            const name = editSupplierName.value.trim();
            const email = editSupplierEmail.value.trim();
            const phone = editSupplierPhone.value.trim();
            const products = editSupplierProducts.value.trim();

            // Basic validation
            if (!name || !email) {
                 showFeedback(editSupplierFeedback, 'Supplier Name and Email are required.', false);
                return;
            }
             if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                 showFeedback(editSupplierFeedback, 'Please enter a valid email address.', false);
                 return;
             }

            if (id) { // Editing existing supplier
                const index = suppliers.findIndex(s => s.id === id);
                if (index !== -1) {
                    suppliers[index] = { ...suppliers[index], name, email, phone, products };
                    showFeedback(editSupplierFeedback, 'Supplier updated successfully!', true);
                } else {
                    showFeedback(editSupplierFeedback, 'Error: Supplier not found for update.', false);
                    return; // Stop before closing modal
                }
            } else { // Adding new supplier
                const newSupplier = {
                    id: generateId('S'),
                    name, email, phone, products
                };
                suppliers.push(newSupplier);
                 showFeedback(editSupplierFeedback, 'Supplier added successfully!', true);
            }
            saveData(storageKeys.suppliers, suppliers);
            renderSuppliers(); // Update table and dropdown
            // Close modal after feedback delay
            setTimeout(() => { if (supplierModal) supplierModal.style.display = 'none'; }, 1500);
        });
    }


    // Inventory Management (Update Stock)
    const updateInventoryStock = (itemName, quantity, isAdding) => {
        if (typeof itemName !== 'string' || typeof quantity !== 'number' || quantity <= 0) {
            console.warn('Invalid parameters for updateInventoryStock');
            return;
        }
        const itemIndex = inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
        let updated = false;

        if (itemIndex !== -1) {
            // Item exists, update stock
             inventory[itemIndex].stock = isAdding
                ? inventory[itemIndex].stock + quantity
                : Math.max(0, inventory[itemIndex].stock - quantity); // Ensure stock doesn't go below 0
            inventory[itemIndex].lastUpdated = getCurrentDate();
            updated = true;
        } else if (isAdding) {
            // If item doesn't exist and we're adding stock (e.g., from delivery), create it
            const newItemName = itemName; // Potentially capitalize first letter?
            inventory.push({
                name: newItemName,
                stock: quantity,
                lastUpdated: getCurrentDate()
            });
             updated = true;
             console.log(`New item ${newItemName} added to inventory.`);
        }

        if (updated) {
            saveData(storageKeys.inventory, inventory);
            //renderInventory(); // Re-rendering is handled by the caller usually (e.g., after status change)
            console.log(`Inventory updated for ${itemName}. Action: ${isAdding ? 'Add' : 'Subtract'} ${quantity}.`);
        } else {
             console.warn(`Item ${itemName} not found in inventory for stock deduction.`);
        }
        // Return value indicates if an update happened (or item was added)
        return updated;
    };

     // Stock Update Modal Handling (Event Delegation)
    function addInventoryEventListeners() {
         if (!inventoryTableBody) return;
         inventoryTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-stock-btn')) {
                const row = e.target.closest('tr');
                const itemName = row?.dataset.itemName;
                const currentStock = e.target.dataset.currentStock; // Get from data attribute

                if (!itemName || currentStock === undefined || !stockModal || !updateStockItemName || !stockItemDisplayName || !updateStockQuantity || !updateStockFeedback) return;

                 updateStockItemName.value = itemName;
                 stockItemDisplayName.textContent = itemName;
                 updateStockQuantity.value = currentStock; // Pre-fill with current stock
                 updateStockFeedback.style.display = 'none';
                 stockModal.style.display = 'block';
                 updateStockQuantity.focus(); // Focus quantity field
            }
         });
    }

    closeStockModalBtns.forEach(btn => btn.addEventListener('click', () => {
        if (stockModal) stockModal.style.display = 'none';
    }));

    if (updateStockForm) {
         updateStockForm.addEventListener('submit', (e) => {
             e.preventDefault();
             if (!updateStockItemName || !updateStockQuantity || !updateStockFeedback) return;

             const itemName = updateStockItemName.value;
             const newStockInput = updateStockQuantity.value;
             const newStock = parseInt(newStockInput, 10);

             if (isNaN(newStock) || newStock < 0) {
                 showFeedback(updateStockFeedback, 'Please enter a valid non-negative stock quantity.', false);
                 return;
             }

             const itemIndex = inventory.findIndex(item => item.name === itemName);
             if (itemIndex !== -1) {
                 inventory[itemIndex].stock = newStock;
                 inventory[itemIndex].lastUpdated = getCurrentDate();
                 saveData(storageKeys.inventory, inventory);
                 renderInventory(); // Update inventory table display
                 showFeedback(updateStockFeedback, 'Stock updated successfully!', true);
                 setTimeout(() => { if (stockModal) stockModal.style.display = 'none'; }, 1500);
             } else {
                 showFeedback(updateStockFeedback, 'Error: Item not found.', false);
             }
         });
    }


    // --- Search and Filter ---
    const filterAndSearch = () => {
        const orderSearchTerm = searchOrdersInput?.value.toLowerCase() || '';
        const orderStatusFilter = filterOrderStatusSelect?.value || 'all';
        const supplierSearchTerm = searchSuppliersInput?.value.toLowerCase() || '';
        const inventorySearchTerm = searchInventoryInput?.value.toLowerCase() || '';

        // Filter Orders
        const filteredOrders = procurementOrders.filter(order => {
            const matchesSearch = !orderSearchTerm || // Show all if search is empty
                                  (order.id && order.id.toLowerCase().includes(orderSearchTerm)) ||
                                  (order.supplier && order.supplier.toLowerCase().includes(orderSearchTerm)) ||
                                  (order.item && order.item.toLowerCase().includes(orderSearchTerm));
            const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
            return matchesSearch && matchesStatus;
        });
        renderOrders(filteredOrders);

        // Filter Suppliers
        const filteredSuppliers = suppliers.filter(supplier => {
            return !supplierSearchTerm || // Show all if search is empty
                   (supplier.name && supplier.name.toLowerCase().includes(supplierSearchTerm)) ||
                   (supplier.products && supplier.products.toLowerCase().includes(supplierSearchTerm)) ||
                   (supplier.email && supplier.email.toLowerCase().includes(supplierSearchTerm));
        });
        renderSuppliers(filteredSuppliers);

         // Filter Inventory
         const filteredInventory = inventory.filter(item => {
             return !inventorySearchTerm || // Show all if search is empty
                    (item.name && item.name.toLowerCase().includes(inventorySearchTerm));
         });
         renderInventory(filteredInventory);
    };

    // Add listeners for search/filter controls
    searchOrdersInput?.addEventListener('input', filterAndSearch);
    filterOrderStatusSelect?.addEventListener('change', filterAndSearch);
    searchSuppliersInput?.addEventListener('input', filterAndSearch);
    searchInventoryInput?.addEventListener('input', filterAndSearch);


    // --- Initial Render ---
    renderOrders();
    renderSuppliers();
    renderInventory();
    // Set default date for new order
    const orderDateInput = document.getElementById('order-date');
    if(orderDateInput) orderDateInput.value = getCurrentDate();

} // End runProcurementPageLogic



// =======================================================
// --- Admin Dashboard Page Logic ---
// =======================================================
function runAdminPageLogic() {
    console.log("Running Admin Dashboard Logic");

    // DOM Element References
    const loginGate = document.getElementById('admin-login-gate');
    const adminContent = document.getElementById('admin-content');
    const passwordInput = document.getElementById('admin-password');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    // Ensure crucial elements exist before proceeding
    if (!loginGate || !adminContent || !passwordInput || !loginButton || !loginError) {
        console.error("Required DOM elements for Admin Login Gate are missing.");
        // Display a generic error if appropriate, or just log and return
        // e.g., document.body.innerHTML = '<p>Error loading admin page components.</p>';
        return;
    }

    const CORRECT_PASSWORD = "admin123"; // Hardcoded for demo; NEVER use this in production.

    // Login Check Function
    const checkLogin = () => {
        // Check sessionStorage for login status
        const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';

        loginGate.style.display = isLoggedIn ? 'none' : 'block';
        adminContent.style.display = isLoggedIn ? 'block' : 'none';

        if (isLoggedIn) {
            // If logged in, initialize the dashboard content
            initializeAdminDashboard();
        } else {
            // If not logged in, ensure password field is clear and focus it
            passwordInput.value = '';
            passwordInput.focus();
        }
    };

    // Login Button Listener
    loginButton.addEventListener('click', () => {
        const password = passwordInput.value; // Don't trim here, maybe password has spaces?
        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem('isAdminLoggedIn', 'true'); // Set flag in session storage
            loginError.textContent = '';
            loginError.style.display = 'none';
            checkLogin(); // Re-run check to show content
        } else {
            loginError.textContent = 'Incorrect password.';
            loginError.style.display = 'block';
            sessionStorage.removeItem('isAdminLoggedIn'); // Clear flag if login fails
            passwordInput.focus(); // Re-focus password field
            passwordInput.select(); // Select text for easy re-entry
        }
    });

     // Optional: Allow login on Enter key press in password field
     passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent potential form submission if wrapped in form
            loginButton.click(); // Trigger the login button click
        }
     });


    // Function to set up the dashboard once logged in
    function initializeAdminDashboard() {
        console.log("Initializing Admin Dashboard Content");

        // DOM elements inside the admin content area
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

        // Metric display elements
        const metricTotalOrders = document.getElementById('metric-total-orders');
        const metricPendingOrders = document.getElementById('metric-pending-orders');
        const metricTotalValue = document.getElementById('metric-total-value');
        const metricDeliveredMonth = document.getElementById('metric-delivered-month');
        const metricTotalSuppliers = document.getElementById('metric-total-suppliers');
        const metricInventoryItems = document.getElementById('metric-inventory-items');
        const metricLowStock = document.getElementById('metric-low-stock');


        // Ensure elements for user management exist
        if (!userTableBody || !searchUsersInput || !addUserBtn || !userModal || !editUserForm || closeUserModalBtns.length === 0) {
            console.error("Required DOM elements for admin user management are missing.");
            // Potentially hide the user management section or show an error
            const userMgmtBlock = document.getElementById('admin-user-management');
            if (userMgmtBlock) userMgmtBlock.innerHTML = '<p>Error loading user management.</p>';
            // Don't return necessarily, other parts might work
        }
         // Ensure metric elements exist
        if (!metricTotalOrders || !metricPendingOrders || !metricTotalValue || !metricDeliveredMonth ||
            !metricTotalSuppliers || !metricInventoryItems || !metricLowStock) {
            console.warn("One or more metric display elements are missing.");
            // Metrics won't update, but the rest might work
        }

        // --- Data Loading (reuse functions from procurement) ---
        const storageKeys = {
            orders: 'swiftGoodsProcOrders',
            suppliers: 'swiftGoodsSuppliers',
            inventory: 'swiftGoodsInventory',
            users: 'swiftGoodsUsers' // Specific key for users
        };

        const loadData = (key, defaultValue) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.error(`Error loading data for key ${key}:`, e);
                return defaultValue;
            }
        };

        const saveData = (key, data) => {
             try {
                localStorage.setItem(key, JSON.stringify(data));
             } catch (e) {
                console.error(`Error saving data for key ${key}:`, e);
             }
        };

        // Sample Users if none in storage
        const sampleUsers = [
            { id: 'U001', name: 'Admin User', email: 'admin@swiftgoods.com', role: 'Admin' },
            { id: 'U002', name: 'Priya Khan', email: 'priya.k@swiftgoods.com', role: 'ProcurementManager' },
            { id: 'U003', name: 'Mark Lee', email: 'mark.l@swiftgoods.com', role: 'Staff' },
            { id: 'U004', name: 'View Only', email: 'viewer@swiftgoods.com', role: 'Viewer' },
        ];

        // Load all necessary data
        const procurementOrders = loadData(storageKeys.orders, []); // Default empty for metrics
        const suppliers = loadData(storageKeys.suppliers, []);
        const inventory = loadData(storageKeys.inventory, []);
        let users = loadData(storageKeys.users, sampleUsers);

        // --- Metrics Calculation ---
        const calculateMetrics = () => {
             // Ensure metric elements exist before trying to update
            if (!metricTotalOrders || !metricPendingOrders || !metricTotalValue || !metricDeliveredMonth ||
                !metricTotalSuppliers || !metricInventoryItems || !metricLowStock) {
                return; // Skip calculation if elements are missing
            }

            // Procurement Orders Metrics
            metricTotalOrders.textContent = procurementOrders.length;
            metricPendingOrders.textContent = procurementOrders.filter(o => o.status === 'Pending').length;

             // Simulated total value (e.g., avg $10 per item quantity for delivered/approved)
            const relevantOrders = procurementOrders.filter(o => o.status === 'Approved' || o.status === 'Delivered');
            const simulatedTotalValue = relevantOrders.reduce((sum, order) => sum + (order.quantity * 10), 0); // Adjust multiplier as needed
            metricTotalValue.textContent = `$${simulatedTotalValue.toFixed(2)}`;

             // Delivered in last 30 days (requires date comparison)
             const thirtyDaysAgo = new Date();
             thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
             metricDeliveredMonth.textContent = procurementOrders.filter(o => {
                if (o.status !== 'Delivered' || !o.date) return false;
                try {
                    return new Date(o.date) >= thirtyDaysAgo;
                } catch {
                    return false; // Ignore invalid dates
                }
             }).length;


             // Supplier Metrics
             metricTotalSuppliers.textContent = suppliers.length;

             // Inventory Metrics
             metricInventoryItems.textContent = inventory.length;
             metricLowStock.textContent = inventory.filter(item => item.stock < 50).length;
        };


        // --- User Management ---
        const renderUsers = (usersToRender = users) => {
            if (!userTableBody) return; // Exit if table body doesn't exist
            userTableBody.innerHTML = ''; // Clear existing rows
            if (usersToRender.length === 0) {
                userTableBody.innerHTML = '<tr><td colspan="5">No users found matching your criteria.</td></tr>';
                return;
            }
            usersToRender.forEach(user => {
                const row = userTableBody.insertRow();
                row.dataset.userId = user.id; // Add ID for easier selection
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="role-${user.role || 'Unknown'}">${user.role || 'Unknown'}</span></td>
                    <td>
                        <button class="action-btn edit-btn edit-user-btn">Edit</button>
                        <button class="action-btn delete-btn delete-user-btn">Delete</button>
                    </td>
                `;
            });
            addUserEventListeners(); // Re-attach listeners
            checkTableScroll('#admin-user-management .table-responsive'); // Check scroll
        };

        // Add/Edit User Modal Handling
        const openUserModal = (user = null) => {
             if (!userModal || !editUserForm || !userModalTitle || !editUserId || !editUserName || !editUserEmail || !editUserRole || !editUserFeedback) return;
             editUserForm.reset(); // Clear previous entries
             editUserFeedback.style.display = 'none'; // Hide feedback
             // Clear previous validation styles
             editUserForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
             editUserForm.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

             if (user) { // Editing existing user
                userModalTitle.textContent = 'Edit User';
                editUserId.value = user.id;
                editUserName.value = user.name;
                editUserEmail.value = user.email;
                editUserRole.value = user.role;
             } else { // Adding new user
                 userModalTitle.textContent = 'Add New User';
                 editUserId.value = ''; // Ensure ID is empty for new user
             }
             userModal.style.display = 'block';
             editUserName.focus(); // Focus the name field
        };

        if (addUserBtn) {
             addUserBtn.addEventListener('click', () => openUserModal());
        }

        closeUserModalBtns.forEach(btn => btn.addEventListener('click', () => {
            if (userModal) userModal.style.display = 'none';
        }));

        // Event listeners for Edit/Delete buttons (using delegation)
        function addUserEventListeners() {
            if (!userTableBody) return;
            userTableBody.addEventListener('click', (e) => {
                const targetButton = e.target.closest('button');
                if (!targetButton) return;

                const row = targetButton.closest('tr');
                const userId = row?.dataset.userId;
                if (!userId) return;

                if (targetButton.classList.contains('edit-user-btn')) {
                    const user = users.find(u => u.id === userId);
                    if (user) {
                        openUserModal(user); // Open modal with user data
                    }
                } else if (targetButton.classList.contains('delete-user-btn')) {
                    // Prevent deleting the main admin user? (Example safeguard)
                    if (userId === 'U001') {
                         alert('Cannot delete the main admin user.');
                         return;
                    }
                    if (!confirm(`Are you sure you want to delete user ${users.find(u=>u.id===userId)?.name || userId}?`)) return;

                    users = users.filter(u => u.id !== userId);
                    saveData(storageKeys.users, users);
                    renderUsers(); // Re-render the user table
                }
            });
        }

        // Form submission for adding/editing user
        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                 if (!editUserId || !editUserName || !editUserEmail || !editUserRole || !editUserFeedback) return;

                 // Simple Validation
                 let isValid = true;
                 const name = editUserName.value.trim();
                 const email = editUserEmail.value.trim();
                 const role = editUserRole.value;
                 const id = editUserId.value; // Existing ID or empty for new

                 // Clear previous errors
                 editUserForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
                 editUserForm.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; });

                 if (!name) {
                     editUserName.classList.add('invalid');
                     editUserName.nextElementSibling.textContent = 'Name is required.';
                     editUserName.nextElementSibling.style.display = 'block';
                     isValid = false;
                 }
                 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                     editUserEmail.classList.add('invalid');
                     editUserEmail.nextElementSibling.textContent = 'Valid email is required.';
                     editUserEmail.nextElementSibling.style.display = 'block';
                     isValid = false;
                 }
                 if (!role) {
                     editUserRole.classList.add('invalid');
                     editUserRole.nextElementSibling.textContent = 'Role is required.';
                     editUserRole.nextElementSibling.style.display = 'block';
                     isValid = false;
                 }

                 if (!isValid) {
                     showFeedback(editUserFeedback, 'Please fix the errors above.', false);
                     return;
                 }

                 if (id) { // Editing
                     const index = users.findIndex(u => u.id === id);
                     if (index !== -1) {
                         users[index] = { ...users[index], name, email, role };
                         showFeedback(editUserFeedback, 'User updated successfully!', true);
                     } else {
                          showFeedback(editUserFeedback, 'Error: User not found for update.', false);
                          return; // Don't close modal if error
                     }
                 } else { // Adding
                     const newUser = {
                         id: generateId('U'),
                         name, email, role
                     };
                     users.push(newUser);
                      showFeedback(editUserFeedback, 'User added successfully!', true);
                 }

                 saveData(storageKeys.users, users);
                 renderUsers(); // Update user table display
                 // Close modal after delay
                 setTimeout(() => { if (userModal) userModal.style.display = 'none'; }, 1500);
            });
        }


        // Search User Input Listener
        if (searchUsersInput) {
            searchUsersInput.addEventListener('input', () => {
                const searchTerm = searchUsersInput.value.toLowerCase();
                const filteredUsers = users.filter(user => {
                    return (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                           (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                           (user.role && user.role.toLowerCase().includes(searchTerm));
                });
                renderUsers(filteredUsers);
            });
        }

        // --- Initial Render for Admin Section ---
        calculateMetrics();
        renderUsers();

    } // End initializeAdminDashboard

    // Initial check when the script runs
    checkLogin();

} // End runAdminPageLogic


// =======================================================
// --- Global Window Resize Listener ---
// Re-checks table scroll hints on window resize
// =======================================================
window.addEventListener('resize', () => {
    // Check if we are potentially on the procurement page
    if (document.querySelector('.management-section')) {
        checkTableScroll('#procurement-orders .table-responsive');
        checkTableScroll('#supplier-management .table-responsive');
        checkTableScroll('#inventory-tracking .table-responsive');
    }
    // Check if we are potentially on the admin page and content is visible
    const adminContent = document.getElementById('admin-content');
    if (adminContent && adminContent.style.display !== 'none') {
         checkTableScroll('#admin-user-management .table-responsive');
    }
});
// Inside the main DOMContentLoaded listener:
document.addEventListener('DOMContentLoaded', () => {
    console.log("SwiftGoods Inc. Site Logic Loaded");

    // --- Hamburger Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('header nav ul'); // Get the UL element

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            // Toggle the .active class on the navigation menu UL
            navMenu.classList.toggle('active');

            // Toggle the aria-expanded attribute on the button
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Optional: Close mobile menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

         // Optional: Close mobile menu if user clicks outside of it
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
    // --- End Hamburger Menu Toggle ---


    // --- Router simulation based on page ID/class ---
    // (Keep your existing page logic calls here)
    if (document.querySelector('.catalogue-section')) {
        runCatalogueLogic();
    } else if (document.getElementById('order-form')) {
        runOrderPageLogic();
    } // ... and so on for other pages ...
     else if (document.getElementById('admin-login-gate') || document.getElementById('admin-content')) {
        runAdminPageLogic();
    }


}); // End DOMContentLoaded

// (Keep all your other functions like runCatalogueLogic, runOrderPageLogic, etc. below)
// function checkTableScroll(...) { ... }
// function runCatalogueLogic() { ... }
// function runOrderPageLogic() { ... }
// ... etc ...