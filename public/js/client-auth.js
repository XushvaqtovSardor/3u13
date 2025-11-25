const API_URL = '/api/v1/client';

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const phone_number = document.getElementById('phone_number').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('clientToken', data.data.token);
      localStorage.setItem('clientName', data.data.full_name);
      showAlert('Muvaffaqiyatli kirildi!', 'success');
      setTimeout(() => {
        window.location.href = '/client/dashboard.html';
      }, 1000);
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
