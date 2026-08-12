const API_URL = 'http://localhost:5000/api'; // Same as script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const spinner = document.getElementById('spinner');
    
    const errorBox = document.getElementById('error-box');

    function showError(message) {
        errorBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
        errorBox.style.display = 'flex';
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorBox.style.display = 'none';
        }, 5000);
    }

    function hideError() {
        errorBox.style.display = 'none';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            btnText.textContent = 'Logging in...';
            btnIcon.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            loginBtn.disabled = false;
            btnText.textContent = 'Login';
            btnIcon.style.display = 'inline-block';
            spinner.style.display = 'none';
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic Validation
        if (!email || !password) {
            showError('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Store token and redirect
                localStorage.setItem('token', data.token);
                // Also can handle "Remember Me" logic here if needed, 
                // but localStorage is persistent anyway until cleared.
                window.location.href = 'index.html';
            } else {
                // Failure
                showError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showError('Could not connect to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    });
});
