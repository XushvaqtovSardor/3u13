const API_URL = '/api/v1/client';
const token = localStorage.getItem('clientToken');

if (!token) {
  window.location.href = '/client/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('clientName').textContent = localStorage.getItem('clientName') || 'Mijoz';
  await loadDashboardData();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('clientToken');
  localStorage.removeItem('clientName');
  window.location.href = '/client/login.html';
});

async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok && data.data) {
      const orders = data.data;
      document.getElementById('totalOrders').textContent = orders.length;
      document.getElementById('activeOrders').textContent = orders.filter(
        o => !o.is_cancelled,
      ).length;

      if (orders.length > 0) {
        displayRecentOrders(orders.slice(0, 5));
      }
    }
  } catch (error) {
    showAlert("Ma'lumotlarni yuklashda xatolik", 'error');
  }
}

function displayRecentOrders(orders) {
  const tbody = document.getElementById('recentOrders');
  tbody.innerHTML = orders
    .map(
      order => `
        <tr>
            <td>${order.order_unique_id.substring(0, 8)}</td>
            <td>${order.summa}</td>
            <td>${order.currency_type?.name || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td><span class="badge ${order.is_cancelled ? 'badge-danger' : 'badge-success'}">${
        order.is_cancelled ? 'Bekor qilingan' : 'Faol'
      }</span></td>
            <td><a href="/client/orders.html" class="btn btn-primary" style="padding: 5px 10px;">Ko'rish</a></td>
        </tr>
    `,
    )
    .join('');
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
