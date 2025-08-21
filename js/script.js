document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // IMPORTANT: Replace this with your WhatsApp number including the country code (e.g., 91 for India).
    // Do NOT include '+', '00', or any special characters.
    const WHATSAPP_NUMBER = '919646566542'; // Example: 91 for India followed by your 10-digit number

    // --- THEME SWITCHER LOGIC ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    const root = document.documentElement;
    const THEME_KEY = 'g2h_theme';

    const applyTheme = (theme) => {
        root.className = theme;
        localStorage.setItem(THEME_KEY, theme);
        lightIcon.classList.toggle('hidden', theme === 'theme-dark');
        darkIcon.classList.toggle('hidden', theme !== 'theme-dark');
    };
    themeToggleButton.addEventListener('click', () => {
        const currentTheme = root.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
        applyTheme(currentTheme);
    });
    const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-light';
    applyTheme(savedTheme);

    // --- CASCADING DROPDOWN LOGIC ---
    const hostelData = {
        Boys: {
            "Zakir": ["A", "B", "C", "D"],
            "NC": ["1", "2", "3", "4", "5", "6"]
        },
        Girls: {
            "Tagore": ["A", "B"]
        }
    };

    const genderSelect = document.getElementById('gender-select');
    const hostelSelect = document.getElementById('hostel-select');
    const blockSelect = document.getElementById('block-select');
    const hostelContainer = document.getElementById('hostel-select-container');
    const blockContainer = document.getElementById('block-select-container');
    
    const populateSelect = (selectElement, options, placeholder) => {
        selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            selectElement.appendChild(opt);
        });
    };

    genderSelect.addEventListener('change', () => {
        const selectedGender = genderSelect.value;
        blockContainer.classList.add('hidden');
        blockSelect.value = ''; // Reset block value
        if (selectedGender && hostelData[selectedGender]) {
            const hostels = Object.keys(hostelData[selectedGender]);
            populateSelect(hostelSelect, hostels, 'Select Hostel');
            hostelContainer.classList.remove('hidden');
        } else {
            hostelContainer.classList.add('hidden');
        }
    });

    hostelSelect.addEventListener('change', () => {
        const selectedGender = genderSelect.value;
        const selectedHostel = hostelSelect.value;
        if (selectedHostel && hostelData[selectedGender][selectedHostel]) {
            const blocks = hostelData[selectedGender][selectedHostel];
            populateSelect(blockSelect, blocks, 'Select Block');
            blockContainer.classList.remove('hidden');
        } else {
            blockContainer.classList.add('hidden');
        }
    });

    // --- FORM & MODAL LOGIC ---
    const deliveryForm = document.getElementById('delivery-form');
    const payLaterBtn = document.getElementById('pay-later-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    const successMessage = document.getElementById('success-message');
    
    // Modal elements
    const paymentModal = document.getElementById('payment-modal');
    const modalContent = paymentModal.querySelector('.modal-content');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');

    const showModal = () => {
        paymentModal.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-95');
    };

    const hideModal = () => {
        paymentModal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => paymentModal.classList.add('pointer-events-none'), 300);
    };
    
    const generateWhatsAppLink = (paymentMethod) => {
        // Run the browser's own validation check.
        if (!deliveryForm.checkValidity()) {
            deliveryForm.reportValidity();
            return;
        }

        const formData = new FormData(deliveryForm);
        const data = Object.fromEntries(formData.entries());
        
        // Directly get values from the visible select elements
        const hostelValue = hostelSelect.value;
        const blockValue = blockSelect.value;
        
        // **NEW** - A final check to ensure hostel/block are not empty
        if (!hostelValue || !blockValue) {
            alert("Please select your full hostel address.");
            return;
        }
        
        const fullHostelAddress = `${hostelValue} ${blockValue}`;

        // Build the message with standard newlines (\n)
        const message = `${'\uD83D\uDCE6'} *New G2H Delivery Request!* ${'\uD83D\uDCE6'}

${'\uD83D\uDC64'} *Student:* ${data.studentName}
${'\uD83C\uDD94'} *Roll No:* ${data.rollNumber}
${'\uD83C\uDFEB'} *Hostel:* ${fullHostelAddress}
${'\uD83D\uDEAA'} *Room:* ${data.roomNumber}
${'\uD83D\uDCF2'} *Contact:* ${data.phoneNumber}

${'\uD83D\uDCCB'} *Parcel Info:* ${data.parcelDetails}

${'\uD83D\uDCB3'} *Payment Method:* ${paymentMethod}`;

        // Encode the entire message for the URL
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message.trim())}`;
        
        successMessage.classList.remove('hidden');
        window.open(whatsappUrl, '_blank');
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    };
    
    payLaterBtn.addEventListener('click', () => {
        generateWhatsAppLink('Pay ₹20 After Delivery (COD)');
    });
    
    payNowBtn.addEventListener('click', () => {
        if (deliveryForm.checkValidity()) {
            showModal();
        } else {
            deliveryForm.reportValidity();
        }
    });

    modalConfirmBtn.addEventListener('click', () => {
        hideModal();
        generateWhatsAppLink('Paid ₹20 Before Delivery');
    });
    
    modalCancelBtn.addEventListener('click', hideModal);
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            hideModal();
        }
    });
});
