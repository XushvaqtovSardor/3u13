const API_URL = '/api/v1';
const token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = '/admin/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('adminName').textContent = localStorage.getItem('adminName') || 'Admin';
  await loadDashboardData();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  try {
    await fetch(`${API_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  window.location.href = '/admin/login.html';
});

async function loadDashboardData() {
  try {
    const [ordersRes, productsRes, adminsRes] = await Promise.all([
      fetch(`${API_URL}/orders?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/products?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/admin?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    const adminsData = await adminsRes.json();

    document.getElementById('totalOrders').textContent = ordersData.data?.pagination?.total || 0;
    document.getElementById('totalProducts').textContent =
      productsData.data?.pagination?.total || 0;
    document.getElementById('totalAdmins').textContent = adminsData.data?.pagination?.total || 0;

    if (ordersData.data?.orders?.length > 0) {
      displayRecentOrders(ordersData.data.orders);
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
            <td>${order.client?.full_name || 'N/A'}</td>
            <td>${order.summa}</td>
            <td>${order.currency_type?.name || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td><span class="badge ${order.is_cancelled ? 'badge-danger' : 'badge-success'}">${
        order.is_cancelled ? 'Bekor qilingan' : 'Faol'
      }</span></td>
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
