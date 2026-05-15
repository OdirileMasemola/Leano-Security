/**
 * Admin Login Handler
 * ================================================================
 * Keeps the login form visible and sticky while Supabase verifies
 * the user's credentials and admin profile.
 */

import adminAuth from './admin-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = loginForm?.querySelector('button[type="submit"]');

    if (!loginForm || !emailInput || !passwordInput || !errorMessage || !submitButton) {
        return;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError('Please enter your email and password.');
            passwordInput.value = '';
            return;
        }

        submitButton.disabled = true;
        submitButton.dataset.originalLabel = submitButton.textContent.trim();
        submitButton.textContent = 'Checking...';

        try {
            const result = await adminAuth.login(email, password);

            if (!result.success) {
                showError(result.error || 'Invalid email or password. Please try again.');
                passwordInput.value = '';
                return;
            }

            window.location.href = './dashboard.html';
        } catch (error) {
            showError(error.message || 'Invalid email or password. Please try again.');
            passwordInput.value = '';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalLabel || 'Sign In';
        }
    });
});
