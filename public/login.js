document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        window.location.href = '/home.html';
    } else {
        alert('Invalid username or password');
    }
});

document.getElementById('google-login').addEventListener('click', function() {
    window.location.href = '/auth/google';
});

document.getElementById('facebook-login').addEventListener('click', function() {
    window.location.href = '/auth/facebook';
});



