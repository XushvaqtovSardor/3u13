const API_URL = '/api/v1/client';

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  const formData = {
    full_name: document.getElementById('full_name').value,
    phone_number: document.getElementById('phone_number').value,
    email: document.getElementById('email').value || undefined,
    address: document.getElementById('address').value || undefined,
    location: document.getElementById('location').value || undefined,
    password: document.getElementById('password').value,
  };

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Muvaffaqiyatli ro'yxatdan o'tdingiz!", 'success');
      setTimeout(() => {
        window.location.href = '/client/login.html';
      }, 1500);
    } else {
      showAlert(data.message || 'Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
});

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
