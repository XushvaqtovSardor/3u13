const API_URL = '/api/v1/client';
const token = localStorage.getItem('clientToken');

if (!token) {
  window.location.href = '/client/login.html';
}

let products = [];
let currencies = [];
let cart = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await loadCurrencies();
});

document.getElementById('logoutBtn').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('clientToken');
  localStorage.removeItem('clientName');
  window.location.href = '/client/login.html';
});

document.getElementById('searchInput').addEventListener('input', e => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)),
  );
  displayProducts(filteredProducts);
});

document.getElementById('orderForm').addEventListener('submit', async e => {
  e.preventDefault();
  await createOrder();
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();

    if (response.ok && data.data) {
      products = data.data;
      displayProducts(products);
    }
  } catch (error) {
    showAlert('Mahsulotlarni yuklashda xatolik', 'error');
  }
}

async function loadCurrencies() {
  try {
    const response = await fetch(`${API_URL}/currencies`);
    const data = await response.json();

    if (response.ok && data.data) {
      currencies = data.data;
      const select = document.getElementById('currency_type_id');
      select.innerHTML =
        '<option value="">Tanlang</option>' +
        currencies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading currencies:', error);
  }
}

function displayProducts(productsToShow) {
  const grid = document.getElementById('productsGrid');

  if (productsToShow.length === 0) {
    grid.innerHTML = '<div class="loading">Mahsulotlar topilmadi</div>';
    return;
  }

  grid.innerHTML = productsToShow
    .map(
      product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <div class="product-price">${product.price} so'm</div>
            <div class="product-quantity">
                <button onclick="decreaseQuantity(${product.id})">-</button>
                <input type="number" id="qty-${product.id}" value="1" min="1" readonly>
                <button onclick="increaseQuantity(${product.id})">+</button>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" style="width: 100%;" onclick="addToCart(${
                  product.id
                }, '${product.name}', ${product.price})">Savatga qo'shish</button>
            </div>
        </div>
    `,
    )
    .join('');
}

function increaseQuantity(productId) {
  const input = document.getElementById(`qty-${productId}`);
  input.value = parseInt(input.value) + 1;
}

function decreaseQuantity(productId) {
  const input = document.getElementById(`qty-${productId}`);
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function addToCart(productId, productName, price) {
  const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

  const existingItem = cart.find(item => item.product_id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      product_id: productId,
      name: productName,
      quantity: quantity,
      price: price,
    });
  }

  showAlert(`${productName} savatga qo'shildi`, 'success');
  openOrderModal();
}

function openOrderModal() {
  if (cart.length === 0) {
    showAlert("Savat bo'sh", 'error');
    return;
  }

  const selectedProductsList = document.getElementById('selectedProductsList');
  const totalSum = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  selectedProductsList.innerHTML = `
        <div class="card">
            <h4>Tanlangan mahsulotlar</h4>
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
                    ${cart
                      .map(
                        (item, index) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>
                                <input type="number" value="${item.quantity}" min="1" 
                                    onchange="updateCartQuantity(${index}, this.value)"
                                    style="width: 60px; padding: 5px;">
                            </td>
                            <td>${item.price}</td>
                            <td>${item.price * item.quantity}</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Jami:</strong></td>
                        <td><strong>${totalSum} so'm</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

  document.getElementById('selectedProducts').value = JSON.stringify(cart);
  document.getElementById('orderModal').classList.add('active');
}

function updateCartQuantity(index, newQuantity) {
  cart[index].quantity = parseInt(newQuantity);
  openOrderModal();
}

async function createOrder() {
  const orderData = {
    items: cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    })),
    product_link: document.getElementById('product_link').value || undefined,
    currency_type_id: parseInt(document.getElementById('currency_type_id').value),
    truck: document.getElementById('truck').value || undefined,
    description: document.getElementById('description').value || undefined,
  };

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Buyurtma muvaffaqiyatli yaratildi!', 'success');
      cart = [];
      closeModal();
      setTimeout(() => {
        window.location.href = '/client/orders.html';
      }, 1500);
    } else {
      showAlert(data.message || 'Xatolik yuz berdi', 'error');
    }
  } catch (error) {
    showAlert('Serverga ulanishda xatolik', 'error');
  }
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('orderForm').reset();
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 3000);
}
