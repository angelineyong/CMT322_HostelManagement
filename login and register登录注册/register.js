// Registration page logic
import { showMessage, validateEmail, validatePassword, findUserByEmail, saveUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const userTypeSelect = document.getElementById('userType');
    const addressGroup = document.getElementById('addressGroup');
    const addressInput = document.getElementById('address');

    // Listen to user type selection
    userTypeSelect.addEventListener('change', function() {
        if (this.value === 'student') {
            addressGroup.style.display = 'block';
            addressInput.required = true;
        } else {
            addressGroup.style.display = 'none';
            addressInput.required = false;
            addressInput.value = '';
        }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const userType = document.getElementById('userType').value;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const address = document.getElementById('address').value.trim();

        // Validate user type
        if (!userType) {
            showMessage('message', 'Please select a user type', 'error');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            showMessage('message', 'Please enter a valid email address', 'error');
            return;
        }

        // Check if email is already registered
        if (findUserByEmail(email)) {
            showMessage('message', 'This email is already registered. Please use another email or login directly', 'error');
            return;
        }

        // Validate password strength
        if (!validatePassword(password)) {
            showMessage('message', 'Password must be at least 6 characters long', 'error');
            return;
        }

        // Verify password confirmation
        if (password !== confirmPassword) {
            showMessage('message', 'Passwords do not match', 'error');
            return;
        }

        // If student, validate address
        if (userType === 'student' && !address) {
            showMessage('message', 'Student users must provide a residential address', 'error');
            return;
        }

        // Create user object
        const newUser = {
            id: Date.now().toString(),
            userType: userType,
            email: email,
            password: password,
            address: userType === 'student' ? address : '',
            createdAt: new Date().toISOString()
        };

        // Save user
        saveUser(newUser);

        // Show success message
        showMessage('message', 'Registration successful! Redirecting to login page...', 'success');

        // Clear form
        registerForm.reset();

        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = './index.html';
        }, 2000);
    });
});