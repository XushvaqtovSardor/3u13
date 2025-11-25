const API_URL = '/api/v1';
const token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = '/admin/login.html';
}

let currentPage = 1;
let editMode = false;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('adminName').textContent = localStorage.getItem('adminName') || 'Admin';
  await loadProducts();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  window.location.href = '/admin/login.html';
});

document.getElementById('productForm').addEventListener('submit', async e => {
  e.preventDefault();
  await saveProduct();
});

async function loadProducts(page = 1) {
  try {
    const response = await fetch(`${API_URL}/products?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok && data.data?.products) {
      displayProducts(data.data.products);
      createPagination(data.data.pagination);
    }
  } catch (error) {
    showAlert('Mahsulotlarni yuklashda xatolik', 'error');
  }
}

function displayProducts(products) {
  const tbody = document.getElementById('productsTable');
  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center;">Mahsulotlar mavjud emas</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.description || ''}</td>
            <td>${product.price}</td>
            <td><span class="badge ${product.is_available ? 'badge-success' : 'badge-danger'}">${
        product.is_available ? 'Mavjud' : 'Mavjud emas'
      }</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px;" onclick="editProduct(${
                  product.id
                })">Tahrirlash</button>
                <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteProduct(${
                  product.id
                })">O'chirish</button>
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
    html += `<button onclick="loadProducts(${pagination.page - 1})">Orqaga</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${
      i === pagination.page ? 'active' : ''
    }" onclick="loadProducts(${i})">${i}</button>`;
  }

  if (pagination.page < totalPages) {
    html += `<button onclick="loadProducts(${pagination.page + 1})">Oldinga</button>`;
  }

  container.innerHTML = html;
}

function openCreateModal() {
  editMode = false;
  document.getElementById('modalTitle').textContent = 'Yangi mahsulot';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('is_available').checked = true;
  document.getElementById('productModal').classList.add('active');
}

async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok) {
      editMode = true;
      document.getElementById('modalTitle').textContent = 'Mahsulotni tahrirlash';
      document.getElementById('productId').value = data.data.id;
      document.getElementById('name').value = data.data.name;
      document.getElementById('description').value = data.data.description || '';
      document.getElementById('price').value = data.data.price;
      document.getElementById('is_available').checked = data.data.is_available;
      document.getElementById('productModal').classList.add('active');
    }
  } catch (error) {
    showAlert("Mahsulot ma'lumotlarini yuklashda xatolik", 'error');
  }
}

async function saveProduct() {
  const productId = document.getElementById('productId').value;
  const productData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: parseFloat(document.getElementById('price').value),
    is_available: document.getElementById('is_available').checked,
  };

  try {
    const url = editMode ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(editMode ? 'Mahsulot yangilandi' : "Mahsulot qo'shildi", 'success');
      closeModal();
      loadProducts(currentPage);
    } else {
      showAlert(data.message || 'Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return;

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      showAlert("Mahsulot o'chirildi", 'success');
      loadProducts(currentPage);
    } else {
      showAlert('Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

function closeModal() {
  document.getElementById('productModal').classList.remove('active');
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
