// Gift items data - loaded from JSON
let giftItems = [];
let itemsData = null;

// Load items from JSON file
async function loadItemsData() {
    try {
        const response = await fetch('items.json');
        if (!response.ok) {
            throw new Error('Failed to load items data');
        }
        itemsData = await response.json();
        giftItems = itemsData.items;
        return giftItems;
    } catch (error) {
        console.error('Error loading items data:', error);
        // Fallback to empty array if JSON fails to load
        giftItems = [];
        return giftItems;
    }
}

// DOM elements
const giftsGrid = document.getElementById('giftsGrid');
const contributionModal = document.getElementById('contributionModal');
const contributionForm = document.getElementById('contributionForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const modalItemName = document.getElementById('modalItemName');

// Current selected item
let currentItem = null;

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(amount);
}

// Calculate remaining amount for an item
function calculateRemainingAmount(item) {
    return Math.max(0, item.targetAmount - item.contributedAmount);
}

// Calculate contribution percentage
function calculateContributionPercentage(item) {
    if (item.targetAmount === 0) return 0;
    return Math.min(100, (item.contributedAmount / item.targetAmount) * 100);
}

// Check if item is fully funded
function isItemFullyFunded(item) {
    return item.contributedAmount >= item.targetAmount;
}

// Create gift card HTML
function createGiftCard(item) {
    const remainingAmount = calculateRemainingAmount(item);
    const contributionPercentage = calculateContributionPercentage(item);
    const isFullyFunded = isItemFullyFunded(item);
    
    return `
        <div class="gift-card ${isFullyFunded ? 'fully-funded' : ''}" data-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="gift-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPiR7aXRlbS5uYW1lfTwvdGV4dD48L3N2Zz4='">
            
            ${isFullyFunded ? '<div class="funded-badge"><i class="fas fa-check-circle"></i> Fully Funded!</div>' : ''}
            
            <div class="gift-info">
                <h3 class="gift-name">${item.name}</h3>
                <p class="gift-description">${item.description}</p>
                
                <div class="funding-details">
                    <div class="funding-amounts">
                        <div class="target-amount">
                            <span class="label">Target:</span>
                            <span class="amount">${formatCurrency(item.targetAmount)}</span>
                        </div>
                        <div class="contributed-amount">
                            <span class="label">Contributed:</span>
                            <span class="amount">${formatCurrency(item.contributedAmount)}</span>
                        </div>
                        <div class="remaining-amount">
                            <span class="label">Remaining:</span>
                            <span class="amount">${formatCurrency(remainingAmount)}</span>
                        </div>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${contributionPercentage}%"></div>
                        <span class="progress-text">${Math.round(contributionPercentage)}% funded</span>
                    </div>
                </div>

                <button class="contribute-btn ${isFullyFunded ? 'disabled' : ''}" 
                        onclick="openContributionModal('${item.id}')" 
                        ${isFullyFunded ? 'disabled' : ''}>
                    <i class="fas fa-heart"></i>
                    ${isFullyFunded ? 'Fully Funded' : 'Contribute Now'}
                </button>
            </div>
        </div>
    `;
}

// Render gift items
async function renderGiftItems() {
    if (giftItems.length === 0) {
        await loadItemsData();
    }
    giftsGrid.innerHTML = giftItems.map(createGiftCard).join('');
}

// Open contribution modal
function openContributionModal(itemId) {
    currentItem = giftItems.find(item => item.id === itemId);
    if (!currentItem) return;
    
    // Don't open modal if item is fully funded
    if (isItemFullyFunded(currentItem)) {
        return;
    }
    
    modalItemName.textContent = currentItem.name;
    const remainingAmount = calculateRemainingAmount(currentItem);
    document.getElementById('amountContribute').value = remainingAmount;
    document.getElementById('amountContribute').max = remainingAmount;
    
    contributionModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close contribution modal
function closeContributionModal() {
    contributionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    contributionForm.reset();
    currentItem = null;
}

// Generate unique contribution ID
function generateContributionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Submit contribution - this will be called after confirmation
async function submitContribution(contributionData) {
    try {
        // Show loading
        loadingOverlay.style.display = 'block';

        // Submit to API
        const response = await fetch('https://ru8vee8krh.execute-api.us-east-1.amazonaws.com/dev/garmac-sns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contributionData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Simple payment URL without parameters
        const paymentUrl = 'https://pay.glotelho.cm/collect/ykRNQMkf62';
        
        console.log('API submitted successfully, redirecting to:', paymentUrl);
        
        // Hide loading and redirect
        loadingOverlay.style.display = 'none';
        window.location.href = paymentUrl;

    } catch (error) {
        console.error('Error submitting contribution:', error);
        loadingOverlay.style.display = 'none';
        alert('There was an error processing your contribution. Please try again.');
    }
}

// Prepare contribution data and show confirmation
function prepareContribution(formData) {
    const contributionData = {
        submitterName: formData.get('submitterName'),
        item: currentItem.name,
        relationship: formData.get('relationship'),
        amountContribute: formData.get('amountContribute'),
        message: formData.get('message') || '',
        contactEmail: formData.get('contactEmail')
    };

    // Close contribution modal first
    closeContributionModal();
    
    // Show confirmation BEFORE API call
    showPaymentConfirmation(contributionData);
}

// Payment confirmation modal functions
function showPaymentConfirmation(contributionData) {
    const confirmModal = document.getElementById('paymentConfirmModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmationDetails = document.getElementById('confirmationDetails');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const closeConfirmModal = document.getElementById('closeConfirmModal');

    // Update confirmation message
    confirmationMessage.textContent = `You are being redirected to the payment page to complete your contribution.`;

    // Update confirmation details
    confirmationDetails.innerHTML = `
        <h4>Payment Details</h4>
        <div class="detail-row">
            <span class="detail-label">Item:</span>
            <span class="detail-value">${contributionData.item}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Contributor:</span>
            <span class="detail-value">${contributionData.submitterName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${contributionData.contactEmail}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${formatCurrency(contributionData.amountContribute)}</span>
        </div>
    `;

    // Show the modal
    confirmModal.style.display = 'block';

    // Handle confirmation - NOW this triggers the API call
    const handleConfirm = () => {
        confirmModal.style.display = 'none';
        // Submit to API and then redirect
        submitContribution(contributionData);
        cleanup();
    };

    // Handle cancellation
    const handleCancel = () => {
        confirmModal.style.display = 'none';
        // Reopen the contribution modal
        openContributionModal(currentItem.id);
        cleanup();
    };

    // Cleanup function to remove event listeners
    const cleanup = () => {
        confirmPaymentBtn.removeEventListener('click', handleConfirm);
        cancelPaymentBtn.removeEventListener('click', handleCancel);
        closeConfirmModal.removeEventListener('click', handleCancel);
    };

    // Add event listeners
    confirmPaymentBtn.addEventListener('click', handleConfirm);
    cancelPaymentBtn.addEventListener('click', handleCancel);
    closeConfirmModal.addEventListener('click', handleCancel);

    // Close modal when clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            handleCancel();
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    await loadItemsData();
    await renderGiftItems();
});

// Modal event listeners
closeModal.addEventListener('click', closeContributionModal);
cancelBtn.addEventListener('click', closeContributionModal);

// Close modal when clicking outside
contributionModal.addEventListener('click', function(e) {
    if (e.target === contributionModal) {
        closeContributionModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (contributionModal.style.display === 'block') {
            closeContributionModal();
        } else if (document.getElementById('paymentConfirmModal').style.display === 'block') {
            document.getElementById('paymentConfirmModal').style.display = 'none';
            openContributionModal(currentItem.id);
        }
    }
});

// Form submission
contributionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(contributionForm);
    
    // Basic validation
    const requiredFields = ['submitterName', 'contactEmail', 'relationship', 'amountContribute'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate email
    const email = formData.get('contactEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Validate amount
    const amount = parseInt(formData.get('amountContribute'));
    const remainingAmount = calculateRemainingAmount(currentItem);
    
    if (amount < 1000) {
        alert('Minimum contribution amount is 1,000 XAF.');
        return;
    }
    
    if (amount > remainingAmount) {
        alert(`Maximum contribution amount is ${formatCurrency(remainingAmount)} (remaining needed).`);
        return;
    }

    // Prepare contribution and show confirmation
    prepareContribution(formData);
});

// Smooth scrolling for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some entrance animations
function addEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    const cards = document.querySelectorAll('.gift-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Initialize animations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addEntranceAnimations, 1000);
});
