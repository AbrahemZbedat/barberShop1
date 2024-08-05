document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }).then(response => {
        if (response.ok) {
            alert('Registration successful');
            window.location.href = '/index.html';
        } else if (response.status === 409) {
            alert('Username already exists');
        } else {
            alert('Registration failed');
        }
    });
});
