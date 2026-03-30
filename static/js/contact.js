/* ============================================================
   ElectroStore — Contact Form Validation
   Client-side validation for the contact form
   ============================================================ */

(function () {
    'use strict';

    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var messageInput = document.getElementById('contact-message');
    var submitBtn = document.getElementById('contact-submit');

    // Simple email regex
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(input, message) {
        clearError(input);
        input.classList.add('error');
        var errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.style.cssText = 'color: #EF4444; font-size: 0.8125rem; margin-top: 0.25rem;';
        errorEl.textContent = message;
        input.parentNode.appendChild(errorEl);
    }

    function clearError(input) {
        input.classList.remove('error');
        var existing = input.parentNode.querySelector('.field-error');
        if (existing) existing.remove();
    }

    function validateField(input) {
        clearError(input);

        if (!input.value.trim()) {
            showError(input, 'This field is required.');
            return false;
        }

        if (input.type === 'email' && !emailRegex.test(input.value.trim())) {
            showError(input, 'Please enter a valid email address.');
            return false;
        }

        return true;
    }

    // Validate on blur
    [nameInput, emailInput, messageInput].forEach(function (input) {
        if (input) {
            input.addEventListener('blur', function () {
                validateField(this);
            });
            // Clear error on input
            input.addEventListener('input', function () {
                clearError(this);
            });
        }
    });

    // Validate on submit
    form.addEventListener('submit', function (e) {
        var valid = true;

        [nameInput, emailInput, messageInput].forEach(function (input) {
            if (input && !validateField(input)) {
                valid = false;
            }
        });

        if (!valid) {
            e.preventDefault();
            // Focus first invalid field
            var firstError = form.querySelector('.error');
            if (firstError) firstError.focus();
        } else {
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;
        }
    });

})();
