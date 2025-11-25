const API_URL = '/api/v1/client';
const token = localStorage.getItem('clientToken');

if (!token) {
  window.location.href = '/client/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadOrders();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('clientToken');
  localStorage.removeItem('clientName');
  window.location.href = '/client/login.html';
});

async function loadOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok && data.data) {
      displayOrders(data.data);
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
      '<tr><td colspan="6" style="text-align: center;">Buyurtmalar mavjud emas</td></tr>';
    return;
  }

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
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px;" onclick="viewOrderDetails('${
                  order.order_unique_id
                }')">Ko'rish</button>
            </td>
        </tr>
    `,
    )
    .join('');
}

async function viewOrderDetails(orderUniqueId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderUniqueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      displayOrderDetail(data.data);
      document.getElementById('orderDetailModal').classList.add('active');
    }
  } catch (error) {
    showAlert('Buyurtma tafsilotlarini yuklashda xatolik', 'error');
  }
}

function displayOrderDetail(order) {
  const detailsDiv = document.getElementById('orderDetails');
  detailsDiv.innerHTML = `
        <div class="card">
            <h4>Buyurtma: ${order.order_unique_id}</h4>
            <p><strong>Summa:</strong> ${order.summa} ${order.currency_type?.name}</p>
            <p><strong>Mahsulot havolasi:</strong> ${order.product_link || 'N/A'}</p>
            <p><strong>Miqdor:</strong> ${order.quantity || 'N/A'}</p>
            <p><strong>Yuk mashinasi:</strong> ${order.truck || 'N/A'}</p>
            <p><strong>Izoh:</strong> ${order.description || 'N/A'}</p>
            <p><strong>Sana:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
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
                        <th>Jami</th>
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
                            <td>${item.quantity * item.price}</td>
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
            <h4>Buyurtma holati tarixi</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Status</th>
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
}

function closeModal() {
  document.getElementById('orderDetailModal').classList.remove('active');
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
