# Cargo Management System

Backend va Frontend to'liq integratsiya qilingan cargo boshqaruv tizimi.

## Xususiyatlari

### Admin Panel
- Login/Logout
- Dashboard (statistika)
- Buyurtmalarni boshqarish
- Mahsulotlarni boshqarish
- Adminlarni boshqarish
- Operatsiyalarni qo'shish

### Mijoz Panel
- Ro'yxatdan o'tish/Kirish
- Mahsulotlarni ko'rish
- Buyurtma berish
- Buyurtmalarni kuzatish

## Ishga tushirish

### 1. Dependencies o'rnatish
```bash
npm install
```

### 2. Database sozlash
.env faylini yarating (.env.example dan nusxa ko'chirib):
```bash
cp .env.example .env
```

### 3. Database migratsiya
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 4. Serverni ishga tushirish

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

### 5. Production deploy

Render.com, Vercel, Railway yoki Heroku'ga deploy qilish uchun `DEPLOY.md` faylini o'qing.

## Foydalanish

1. Brauzerda ochish: http://localhost:3000
2. Admin panel: http://localhost:3000/admin/login.html
3. Mijoz panel: http://localhost:3000/client/login.html

## Texnologiyalar

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication

### Frontend
- Vanilla JavaScript
- HTML5
- CSS3
- Responsive Design

## Folder Structure
```
public/
  ├── css/
  │   ├── style.css
  │   ├── auth.css
  │   ├── admin.css
  │   └── client.css
  ├── js/
  │   ├── admin-*.js
  │   └── client-*.js
  ├── admin/
  │   └── *.html
  └── client/
      └── *.html
src/
  ├── config/
  ├── controllers/
  ├── middlewares/
  ├── routes/
  ├── services/
  ├── utils/
  └── validators/
```

## API Endpoints

### Admin Auth
- POST /api/v1/admin/auth/login
- POST /api/v1/admin/auth/logout

### Admin
- GET /api/v1/admin
- POST /api/v1/admin
- GET /api/v1/admin/:id
- PUT /api/v1/admin/:id
- DELETE /api/v1/admin/:id

### Client
- POST /api/v1/client/register
- POST /api/v1/client/login
- GET /api/v1/client/products
- GET /api/v1/client/currencies
- POST /api/v1/client/orders
- GET /api/v1/client/orders
- GET /api/v1/client/orders/:id

### Products
- GET /api/v1/products
- POST /api/v1/products
- GET /api/v1/products/:id
- PUT /api/v1/products/:id
- DELETE /api/v1/products/:id

### Orders
- GET /api/v1/orders
- POST /api/v1/orders
- GET /api/v1/orders/:id
- PATCH /api/v1/orders/:id/cancel

### Operations
- POST /api/v1/operations

### Statuses
- GET /api/v1/statuses

## Production Deployment

Loyiha Render.com, Vercel, Railway, Heroku platformalarida ishga tushishga tayyor.

Ko'proq ma'lumot uchun `DEPLOY.md` faylini o'qing.
