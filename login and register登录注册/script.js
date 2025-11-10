// Login page logic
import { showMessage, validateEmail, findUserByEmail, setCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

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

        // Verify password
        if (user.password !== password) {
            showMessage('message', 'Incorrect password. Please try again', 'error');
            return;
        }

        // Login successful
        setCurrentUser(user);
        showMessage('message', `Login successful! Welcome back, ${user.userType === 'student' ? 'Student' : 'Admin'}`, 'success');

        // Redirect after 2 seconds (can redirect to different pages based on user type)
        setTimeout(() => {
            if (user.userType === 'admin') {
                showMessage('message', 'Admin login successful!', 'success');
            } else {
                showMessage('message', 'Student login successful!', 'success');
            }
        }, 2000);
    });
});