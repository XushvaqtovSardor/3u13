const API_URL = '/api/v1';
const token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = '/admin/login.html';
}

let currentPage = 1;
let editMode = false;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('adminName').textContent = localStorage.getItem('adminName') || 'Admin';
  await loadAdmins();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  window.location.href = '/admin/login.html';
});

document.getElementById('adminForm').addEventListener('submit', async e => {
  e.preventDefault();
  await saveAdmin();
});

async function loadAdmins(page = 1) {
  try {
    const response = await fetch(`${API_URL}/admin?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok && data.data?.admins) {
      displayAdmins(data.data.admins);
      createPagination(data.data.pagination);
    }
  } catch (error) {
    showAlert('Adminlarni yuklashda xatolik', 'error');
  }
}

function displayAdmins(admins) {
  const tbody = document.getElementById('adminsTable');
  if (admins.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center;">Adminlar mavjud emas</td></tr>';
    return;
  }

  tbody.innerHTML = admins
    .map(
      admin => `
        <tr>
            <td>${admin.id}</td>
            <td>${admin.full_name}</td>
            <td>${admin.user_name}</td>
            <td>${admin.email}</td>
            <td>${admin.phone_number}</td>
            <td><span class="badge badge-primary">${admin.role}</span></td>
            <td><span class="badge ${admin.is_active ? 'badge-success' : 'badge-danger'}">${
        admin.is_active ? 'Faol' : 'Faol emas'
      }</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 5px 10px;" onclick="editAdmin(${
                  admin.id
                })">Tahrirlash</button>
                ${
                  !admin.is_creator
                    ? `<button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteAdmin(${admin.id})">O'chirish</button>`
                    : ''
                }
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
    html += `<button onclick="loadAdmins(${pagination.page - 1})">Orqaga</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${
      i === pagination.page ? 'active' : ''
    }" onclick="loadAdmins(${i})">${i}</button>`;
  }

  if (pagination.page < totalPages) {
    html += `<button onclick="loadAdmins(${pagination.page + 1})">Oldinga</button>`;
  }

  container.innerHTML = html;
}

function openCreateModal() {
  editMode = false;
  document.getElementById('modalTitle').textContent = 'Yangi admin';
  document.getElementById('adminForm').reset();
  document.getElementById('adminId').value = '';
  document.getElementById('passwordGroup').style.display = 'block';
  document.getElementById('password').required = true;
  document.getElementById('is_active').checked = true;
  document.getElementById('adminModal').classList.add('active');
}

async function editAdmin(id) {
  try {
    const response = await fetch(`${API_URL}/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok) {
      editMode = true;
      document.getElementById('modalTitle').textContent = 'Adminni tahrirlash';
      document.getElementById('adminId').value = data.data.id;
      document.getElementById('full_name').value = data.data.full_name;
      document.getElementById('user_name').value = data.data.user_name;
      document.getElementById('email').value = data.data.email;
      document.getElementById('phone_number').value = data.data.phone_number;
      document.getElementById('role').value = data.data.role;
      document.getElementById('tg_link').value = data.data.tg_link || '';
      document.getElementById('description').value = data.data.description || '';
      document.getElementById('is_active').checked = data.data.is_active;
      document.getElementById('passwordGroup').style.display = 'none';
      document.getElementById('password').required = false;
      document.getElementById('adminModal').classList.add('active');
    }
  } catch (error) {
    showAlert("Admin ma'lumotlarini yuklashda xatolik", 'error');
  }
}

async function saveAdmin() {
  const adminId = document.getElementById('adminId').value;
  const adminData = {
    full_name: document.getElementById('full_name').value,
    user_name: document.getElementById('user_name').value,
    email: document.getElementById('email').value,
    phone_number: document.getElementById('phone_number').value,
    role: document.getElementById('role').value,
    tg_link: document.getElementById('tg_link').value,
    description: document.getElementById('description').value,
    is_active: document.getElementById('is_active').checked,
  };

  if (!editMode) {
    adminData.password = document.getElementById('password').value;
  }

  try {
    const url = editMode ? `${API_URL}/admin/${adminId}` : `${API_URL}/admin`;
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(editMode ? 'Admin yangilandi' : "Admin qo'shildi", 'success');
      closeModal();
      loadAdmins(currentPage);
    } else {
      showAlert(data.message || 'Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

async function deleteAdmin(id) {
  if (!confirm("Adminni o'chirmoqchimisiz?")) return;

  try {
    const response = await fetch(`${API_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      showAlert("Admin o'chirildi", 'success');
      loadAdmins(currentPage);
    } else {
      showAlert('Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

function closeModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
