// Forgot password page logic
import { showMessage, validateEmail, findUserByEmail } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        // Validate email format
        if (!validateEmail(email)) {
            showMessage('message', 'Please enter a valid email address', 'error');
            return;
        }

        // Find user
        const user = findUserByEmail(email);

        if (!user) {
            showMessage('message', 'This email is not registered. Please sign up first', 'error');
            return;
        }

        // Simulate sending reset link
        showMessage('message', `Password reset link has been sent to ${email}. Please check your email (this is a demo feature)`, 'success');

        // In a real application, this would call a backend API to send the reset email
        // For demonstration, we log user info to console
        console.log('User information:', {
            email: user.email,
            userType: user.userType,
            message: 'In a real application, an email with a reset token would be sent here'
        });

        // Clear form
        forgotPasswordForm.reset();

        // Show reminder after 3 seconds
        setTimeout(() => {
            showMessage('message', 'Please check your email and click the reset link', 'info');
        }, 3000);
    });
});