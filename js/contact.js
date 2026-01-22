// Contact Page Specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initContactPage();
});

function initContactPage() {
    // Initialize form handling
    initContactForm();
    
    // Initialize FAQ functionality
    initFAQ();
    
    // Initialize WhatsApp functionality
    initWhatsApp();
    
    // Initialize animations
    initAnimations();
    
    // Initialize emergency float button
    initEmergencyFloat();
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!contactForm) return;
    
    // Form validation
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Reset error states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const spinner = submitBtn.querySelector('.loading-spinner');
        submitBtn.disabled = true;
        spinner.style.display = 'block';
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Get selected services
        const serviceSelect = document.getElementById('service');
        const selectedServices = Array.from(serviceSelect.selectedOptions).map(option => option.text);
        data.services = selectedServices.join(', ');
        
        try {
            // Send email using EmailJS (you'll need to set this up)
            await sendEmailToLeano(data);
            
            // Show success message
            successMessage.style.display = 'block';
            contactForm.reset();
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Error sending email:', error);
            
            // Show error message
            errorMessage.style.display = 'block';
            
            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });
    
    // Real-time validation
    contactForm.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            // Clear error when user starts typing
            const formGroup = input.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                const errorElement = formGroup.querySelector('.error-message');
                if (errorElement && errorElement.textContent.includes('required')) {
                    formGroup.classList.remove('error');
                    errorElement.textContent = '';
                }
            }
        });
    });
}

function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'name', message: 'Name is required' },
        { id: 'email', message: 'Valid email is required' },
        { id: 'phone', message: 'Phone number is required' },
        { id: 'service', message: 'Please select at least one service' },
        { id: 'message', message: 'Message is required' }
    ];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!validateField(input, field.message)) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailInput = document.getElementById('email');
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone number
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function validateField(input, customMessage = null) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    // Clear previous error
    formGroup.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    // Check if field is required and empty
    if (input.hasAttribute('required') && !input.value.trim()) {
        showError(input, customMessage || 'This field is required');
        return false;
    }
    
    // Email validation
    if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
        showError(input, 'Please enter a valid email address');
        return false;
    }
    
    // Phone validation
    if (input.type === 'tel' && input.value && !isValidPhone(input.value)) {
        showError(input, 'Please enter a valid phone number');
        return false;
    }
    
    // Select validation (for services)
    if (input.id === 'service') {
        const selectedOptions = Array.from(input.selectedOptions);
        if (selectedOptions.length === 0) {
            showError(input, customMessage || 'Please select at least one service');
            return false;
        }
    }
    
    return true;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // South African phone number validation
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
}

async function sendEmailToLeano(data) {
    // Send email to info@leanosecurity.co.za
    
    // Method 1: Using EmailJS (Recommended)
    // You'll need to sign up at https://www.emailjs.com/
    // Replace with your actual EmailJS service ID, template ID, and user ID
    const emailjsConfig = {
        serviceId: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        templateId: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        userId: 'YOUR_USER_ID' // Replace with your EmailJS user ID
    };
    
    // Method 2: Using Formspree (Alternative)
    // Create a form at https://formspree.io/ and replace the endpoint
    const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your Formspree form ID
    
    try {
        // Option 1: Using EmailJS (Uncomment when you have your EmailJS credentials)
        /*
        if (typeof emailjs !== 'undefined') {
            const templateParams = {
                to_email: 'info@leanosecurity.co.za',
                from_name: data.name,
                from_email: data.email,
                phone: data.phone,
                company: data.company || 'Not provided',
                services: data.services,
                urgency: data.urgency,
                message: data.message,
                newsletter: data.newsletter ? 'Subscribed' : 'Not subscribed',
                date: new Date().toLocaleString()
            };
            
            await emailjs.send(
                emailjsConfig.serviceId,
                emailjsConfig.templateId,
                templateParams,
                emailjsConfig.userId
            );
            
            return true;
        }
        */
        
        // Option 2: Using Formspree (Uncomment when you have your Formspree form ID)
        /*
        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _replyto: data.email,
                _subject: `Security Inquiry from ${data.name}`,
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company || '',
                services: data.services,
                urgency: data.urgency,
                message: data.message,
                newsletter: data.newsletter ? 'yes' : 'no'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        return await response.json();
        */
        
        // Option 3: Fallback - Show message for setup
        console.warn('Email service not configured. Please set up EmailJS or Formspree.');
        
        // For now, simulate a successful send (remove this in production)
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
        
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Toggle active class
            item.classList.toggle('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
}

function initWhatsApp() {
    // Format phone number for WhatsApp link
    const phoneNumber = '27683794897'; // South Africa format without +
    const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"]');
    
    whatsappLinks.forEach(link => {
        link.href = `https://wa.me/${phoneNumber}`;
        
        // Add click tracking
        link.addEventListener('click', () => {
            trackWhatsAppClick();
        });
    });
}

function trackWhatsAppClick() {
    // Track WhatsApp clicks (you can implement analytics here)
    console.log('WhatsApp link clicked');
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    document.querySelectorAll('.contact-form-section, .whatsapp-card, .contact-methods, .response-stats, .map-section, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initEmergencyFloat() {
    const emergencyFloat = document.querySelector('.emergency-float');
    
    if (emergencyFloat) {
        // Add hover effect
        emergencyFloat.addEventListener('mouseenter', () => {
            emergencyFloat.style.transform = 'scale(1.1)';
        });
        
        emergencyFloat.addEventListener('mouseleave', () => {
            emergencyFloat.style.transform = 'scale(1)';
        });
        
        // Add click tracking
        emergencyFloat.addEventListener('click', () => {
            console.log('Emergency button clicked');
            // You can add analytics tracking here
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Form persistence (save form data in case of accidental refresh)
function saveFormData() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const formData = new FormData(contactForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Save to localStorage
    localStorage.setItem('contactFormData', JSON.stringify(data));
}

function loadFormData() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    const savedData = localStorage.getItem('contactFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Populate form fields
        Object.keys(data).forEach(key => {
            const input = contactForm.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = data[key] === 'on';
                } else if (input.tagName === 'SELECT' && input.multiple) {
                    // Handle multi-select
                    const values = data[key].split(',');
                    Array.from(input.options).forEach(option => {
                        option.selected = values.includes(option.value);
                    });
                } else {
                    input.value = data[key];
                }
            }
        });
    }
}

// Auto-save form data
document.getElementById('contactForm')?.addEventListener('input', saveFormData);

// Load saved data on page load
window.addEventListener('load', loadFormData);

// Clear saved data on successful form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', () => {
        localStorage.removeItem('contactFormData');
    });
}
