document.addEventListener('DOMContentLoaded', async function() {
    const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('user-name').textContent = data.username;
        loadCartItems(data.cart);
    } else {
        window.location.href = '/index.html';
    }
});


            function logout() {
                // כאן תוכל להוסיף את הלוגיקה ליציאה מהמערכת
                alert('אתה יצאת מהמערכת!');
                // לדוגמה, ניתן לשאול אם להשתמש ב-LocalStorage כדי להסיר מידע על המשתמש
                localStorage.removeItem('user'); // הסרת פרטי המשתמש
                location.href = 'index.html'; // הפניה לדף הכניסה
            }


            /*********************************** */
        