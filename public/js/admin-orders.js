const API_URL = '/api/v1';
const token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = '/admin/login.html';
}

let currentPage = 1;
let selectedOrderId = null;
let statuses = [];

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('adminName').textContent = localStorage.getItem('adminName') || 'Admin';
  await loadStatuses();
  await loadOrders();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  window.location.href = '/admin/login.html';
});

document.getElementById('searchInput').addEventListener('input', e => {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#ordersTable tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

async function loadStatuses() {
  try {
    const response = await fetch(`${API_URL}/statuses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      statuses = data.data || [];
    }
  } catch (error) {
    console.error('Error loading statuses:', error);
  }
}

async function loadOrders(page = 1) {
  try {
    const response = await fetch(`${API_URL}/orders?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok && data.data?.orders) {
      displayOrders(data.data.orders);
      createPagination(data.data.pagination);
    } else {
      showAlert('Buyurtmalarni yuklashda xatolik', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

function displayOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  if (orders.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center;">Buyurtmalar mavjud emas</td></tr>';
    return;
  }

  tbody.innerHTML = orders
    .map(
      order => `
        <tr>
            <td>${order.order_unique_id.substring(0, 8)}</td>
            <td>${order.client?.full_name || 'N/A'}</td>
            <td>${
              order.orderItems?.map(item => item.product?.name).join(', ') ||
              order.product_link ||
              'N/A'
            }</td>
            <td>${
              order.quantity ||
              order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ||
              'N/A'
            }</td>
            <td>${order.summa}</td>
            <td>${order.currency_type?.name || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td><span class="badge ${order.is_cancelled ? 'badge-danger' : 'badge-success'}">${
        order.is_cancelled ? 'Bekor qilingan' : 'Faol'
      }</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px;" onclick="viewOrder('${
                  order.id
                }')">Ko'rish</button>
            </td>
        </tr>
    `,
    )
    .join('');
}

function createPagination(pagination) {
  const container = document.getElementById('pagination');
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  let html = '';
  if (pagination.page > 1) {
    html += `<button onclick="loadOrders(${pagination.page - 1})">Orqaga</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${
      i === pagination.page ? 'active' : ''
    }" onclick="loadOrders(${i})">${i}</button>`;
  }

  if (pagination.page < totalPages) {
    html += `<button onclick="loadOrders(${pagination.page + 1})">Oldinga</button>`;
  }

  container.innerHTML = html;
}

async function viewOrder(orderId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok) {
      selectedOrderId = orderId;
      displayOrderDetails(data.data);
      document.getElementById('orderModal').classList.add('active');
    }
  } catch (error) {
    showAlert("Buyurtma ma'lumotlarini yuklashda xatolik", 'error');
  }
}

function displayOrderDetails(order) {
  const detailsDiv = document.getElementById('orderDetails');
  detailsDiv.innerHTML = `
        <div class="card">
            <h4>Buyurtma: ${order.order_unique_id}</h4>
            <p><strong>Mijoz:</strong> ${order.client?.full_name}</p>
            <p><strong>Telefon:</strong> ${order.client?.phone_number}</p>
            <p><strong>Summa:</strong> ${order.summa} ${order.currency_type?.name}</p>
            <p><strong>Mahsulot havolasi:</strong> ${order.product_link || 'N/A'}</p>
            <p><strong>Miqdor:</strong> ${order.quantity || 'N/A'}</p>
            <p><strong>Yuk mashinasi:</strong> ${order.truck || 'N/A'}</p>
            <p><strong>Izoh:</strong> ${order.description || 'N/A'}</p>
            <p><strong>Status:</strong> <span class="badge ${
              order.is_cancelled ? 'badge-danger' : 'badge-success'
            }">${order.is_cancelled ? 'Bekor qilingan' : 'Faol'}</span></p>
        </div>
        
        ${
          order.orderItems && order.orderItems.length > 0
            ? `
        <div class="card">
            <h4>Mahsulotlar</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Mahsulot</th>
                        <th>Miqdor</th>
                        <th>Narx</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems
                      .map(
                        item => `
                        <tr>
                            <td>${item.product?.name || 'N/A'}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }
        
        ${
          order.operations && order.operations.length > 0
            ? `
        <div class="card">
            <h4>Operatsiyalar</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Admin</th>
                        <th>Sana</th>
                        <th>Izoh</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.operations
                      .map(
                        op => `
                        <tr>
                            <td>${op.status?.name || 'N/A'}</td>
                            <td>${op.admin?.full_name || 'N/A'}</td>
                            <td>${new Date(op.operation_date).toLocaleString()}</td>
                            <td>${op.description || ''}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }
    `;

  const statusSelect = document.getElementById('statusSelect');
  statusSelect.innerHTML =
    '<option value="">Statusni tanlang</option>' +
    statuses.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function addOperation() {
  const status_id = document.getElementById('statusSelect').value;
  const description = document.getElementById('operationDescription').value;

  if (!status_id) {
    showAlert('Statusni tanlang', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/operations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: selectedOrderId,
        status_id: parseInt(status_id),
        description,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Operatsiya muvaffaqiyatli qo'shildi", 'success');
      closeModal();
      loadOrders(currentPage);
    } else {
      showAlert(data.message || 'Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('operationDescription').value = '';
  document.getElementById('statusSelect').value = '';
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
